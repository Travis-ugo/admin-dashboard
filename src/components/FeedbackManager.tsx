"use client";

import { useState } from "react";
import { 
  Send, 
  ThumbsUp, 
  CheckCircle2, 
  MoreHorizontal,
  ThumbsDown
} from "lucide-react";
import styles from "../app/dashboard/feedback/page.module.css";
import dashboardStyles from "../app/dashboard/page.module.css";
import { updateFeedbackStatus, addFeedbackReply } from "@/lib/actions";

interface Feedback {
  id: string;
  user: string;
  email: string;
  content: string;
  type: string;
  status: string;
  time: string;
  replies?: Message[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  time: string;
}

export function FeedbackManager({ initialFeedbacks }: { initialFeedbacks: Feedback[] }) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [selectedId, setSelectedId] = useState(initialFeedbacks[0]?.id);
  const [replyText, setReplyText] = useState("");
  
  // Initial message history from Firestore replies + original content
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(
    initialFeedbacks.reduce((acc, fb) => ({
      ...acc,
      [fb.id]: [
        { id: 'initial', text: fb.content, sender: 'user', time: fb.time },
        ...(fb.replies || [])
      ]
    }), {})
  );

  const selectedFeedback = feedbacks.find(f => f.id === selectedId);
  const currentHistory = chatHistories[selectedId] || [];

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: replyText,
      sender: 'admin',
      time: 'Just now'
    };

    // Persist to Firestore
    await addFeedbackReply(selectedId, { text: replyText, sender: 'admin' });

    setChatHistories({
      ...chatHistories,
      [selectedId]: [...currentHistory, newMessage]
    });

    setReplyText("");

    // Update status to "In Progress" if it was "New"
    if (selectedFeedback?.status === "New") {
      setFeedbacks(feedbacks.map(f => 
        f.id === selectedId ? { ...f, status: "In Progress" } : f
      ));
    }
  };

  const markResolved = async (id: string) => {
    await updateFeedbackStatus(id, "Resolved");
    setFeedbacks(feedbacks.map(f => 
      f.id === id ? { ...f, status: "Resolved" } : f
    ));
  };

  return (
    <div className={styles.feedbackGrid}>
      <div className={styles.sidebarSection}>
        <div className={styles.feedList}>
          {feedbacks.map((fb) => (
            <div 
              key={fb.id} 
              className={`${styles.feedItem} ${fb.status === "New" ? styles.isNew : ""} ${selectedId === fb.id ? styles.activeItem : ""}`}
              onClick={() => setSelectedId(fb.id)}
            >
              <div className={styles.feedHeader}>
                <div className={styles.userGroup}>
                  <div className={styles.miniAvatar}>{fb.user?.charAt(0) || 'U'}</div>
                  <span className={styles.userName}>{fb.user || 'Anonymous'}</span>
                </div>
                <span className={styles.timeTag}>{fb.time || 'recent'}</span>
              </div>
              <p className={styles.contentSnippet}>{fb.content}</p>
              <div className={styles.feedFooter}>
                <span className={`${styles.typeBadge} ${styles[(fb.type || 'General').replace(/\s+/g, '').toLowerCase()]}`}>
                  {fb.type || 'General'}
                </span>
                <span className={styles.statusText}>{fb.status || 'New'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.chatSection} glass-card`}>
        {selectedFeedback ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatUser} style={{ cursor: 'pointer' }}>
                <div className={styles.largeAvatar}>{selectedFeedback.user?.charAt(0) || 'U'}</div>
                <div>
                  <h3 className={styles.chatUserName}>{selectedFeedback.user || 'Anonymous'}</h3>
                  <span className={styles.chatUserStatus}>{selectedFeedback.email || 'No email provided'} • ID: {selectedFeedback.id.substring(0, 8)}</span>
                </div>
              </div>
              <div className={styles.chatActions}>
                <button className={styles.iconBtn}><ThumbsUp size={18} /></button>
                <button 
                  className={styles.iconBtn} 
                  onClick={() => markResolved(selectedFeedback.id)}
                  title="Mark as Resolved"
                  style={selectedFeedback.status === "Resolved" ? { color: 'var(--secondary)', background: 'rgba(171, 207, 60, 0.1)' } : {}}
                >
                  <CheckCircle2 size={18} />
                </button>
                <button className={styles.iconBtn}><MoreHorizontal size={18} /></button>
              </div>
            </div>

            <div className={styles.messagesContainer}>
              {currentHistory.map((msg) => (
                <div key={msg.id} className={`${styles.messageRow} ${msg.sender === 'admin' ? styles.isAdmin : ""}`}>
                  <div className={`${styles.message} ${msg.sender === 'admin' ? styles.adminMsg : ""}`}>
                    <p>{msg.text}</p>
                    <span className={styles.msgTime}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.inputArea}>
              <input 
                type="text" 
                placeholder={`Type your response to ${selectedFeedback.user}...`} 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
              />
              <button className={styles.sendBtn} onClick={handleSendReply}>
                <Send size={18} />
                <span>Reply</span>
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Select a feedback item to view the conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
