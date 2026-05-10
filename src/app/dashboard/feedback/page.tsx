'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
    MessageSquare, 
    CheckCircle2, 
    Clock, 
    User,
    Mail,
    Send,
    Tag,
    XCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface SupportMessage {
    sender: 'user' | 'admin';
    text: string;
    timestamp: any;
}

interface Feedback {
    id: string;
    user: string;
    userId: string;
    email: string;
    content: string;
    type: string;
    status: 'New' | 'Reviewed' | 'Resolved' | 'In Progress' | 'user_replied';
    time: string;
    messages?: SupportMessage[];
}

export default function FeedbackPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const replyingTo = feedbacks.find(f => f.id === replyingToId);
    const [filterUserId, setFilterUserId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            setIsLoading(true);
            
            const q = query(collection(db, 'feedbacks'), orderBy('created_at', 'desc'));
            
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const feedbackList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const createdAt = data.created_at?.toDate?.() || new Date();
                    return {
                        id: doc.id,
                        ...data,
                        time: createdAt.toLocaleString(),
                        user: data.user_name || 'Anonymous User',
                        email: data.user_email || 'No email provided',
                    } as Feedback;
                });
                setFeedbacks(feedbackList);
                setIsLoading(false);
            }, (error) => {
                console.error('Feedback subscription error:', error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        }
    }, [user, authLoading]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved': return 'bg-dark-green/5 text-dark-green';
            case 'In Progress': return 'bg-info/5 text-info';
            case 'New': return 'bg-warning/5 text-warning';
            case 'user_replied': return 'bg-warning/5 text-warning';
            default: return 'bg-neutral-100 text-neutral-500';
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await axios.patch(`/api/admin/feedback/${id}`, { status: newStatus });
            setFeedbacks(prev => prev.map(fb => fb.id === id ? { ...fb, status: newStatus as any } : fb));
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };
    const handleSendReply = async () => {
        if (!replyingToId || !replyContent.trim()) return;
        
        setIsSubmittingReply(true);
        try {
            await axios.patch(`/api/admin/feedback/${replyingToId}`, { 
                status: 'Reviewed',
                adminReply: replyContent 
            });
            
            setReplyingToId(null);
            setReplyContent('');
        } catch (err) {
            console.error('Failed to send reply:', err);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] border border-neutral-100 animate-pulse">
                            <div className="h-4 bg-neutral-50 rounded w-1/4 mb-4" />
                            <div className="h-20 bg-neutral-50 rounded w-full" />
                        </div>
                    ))
                ) : (feedbacks.filter(f => !filterUserId || f.userId === filterUserId)).length === 0 ? (
                    <div className="bg-white p-20 rounded-[2rem] border border-neutral-100 text-center">
                        <MessageSquare className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                        <p className="text-neutral-400 font-medium">
                            {filterUserId ? 'No feedback found for this user.' : 'No feedback submissions found.'}
                        </p>
                        {filterUserId && (
                            <button 
                                onClick={() => setFilterUserId(null)}
                                className="mt-4 text-dark-green text-sm font-bold hover:underline"
                            >
                                Show all feedback
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {filterUserId && (
                            <div className="bg-dark-green/5 p-4 rounded-2xl border border-dark-green/10 flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-dark-green" />
                                    <span className="text-sm font-bold text-dark-green italic">Showing history for: {feedbacks.find(f => f.userId === filterUserId)?.user || filterUserId}</span>
                                </div>
                                <button 
                                    onClick={() => setFilterUserId(null)}
                                    className="text-xs font-black uppercase tracking-widest text-dark-green hover:underline px-4 py-2 bg-white rounded-xl border border-dark-green/10"
                                >
                                    View All Feedback
                                </button>
                            </div>
                        )}
                        {(feedbacks.filter(f => !filterUserId || f.userId === filterUserId)).map((fb) => {
                            const isUnread = fb.status === 'New' || fb.status === 'user_replied';
                            return (
                        <div key={fb.id} className={`bg-white p-8 rounded-[2rem] border transition-all duration-300 relative ${isUnread ? 'border-warning/30' : 'border-neutral-100 hover:border-dark-green/10'}`}>
                            {isUnread && (
                                <div className="absolute top-8 right-8 flex h-3 w-3">
                                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></div>
                                    <div className="relative inline-flex rounded-full h-3 w-3 bg-warning"></div>
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(fb.status)}`}>
                                            {fb.status === 'user_replied' ? 'User Replied' : fb.status}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-bold uppercase tracking-widest">
                                            <Tag className="w-3 h-3" />
                                            {fb.type}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-bold uppercase tracking-widest ml-auto md:ml-0">
                                            <Clock className="w-3 h-3" />
                                            {fb.time}
                                        </div>
                                    </div>
                                    
                                    <p className="text-neutral-900 font-medium text-lg leading-relaxed mb-6">
                                        "{fb.content}"
                                    </p>

                                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-neutral-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center text-dark-green">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">User</p>
                                                <p className="text-sm font-bold text-neutral-900">{fb.user}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">Contact</p>
                                                <p className="text-sm font-bold text-neutral-900">{fb.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:w-64 space-y-3">
                                    <button 
                                        onClick={() => setReplyingToId(fb.id)}
                                        className="w-full py-3 px-4 bg-dark-green text-white text-xs font-bold rounded-xl hover:bg-dark-green/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        {fb.messages && fb.messages.length > 0 ? 'Continue Chat' : 'Reply to User'}
                                    </button>
                                    {!filterUserId && (
                                        <button 
                                            onClick={() => setFilterUserId(fb.userId)}
                                            className="w-full py-3 px-4 bg-neutral-50 text-neutral-600 text-xs font-bold rounded-xl hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            View History
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleStatusUpdate(fb.id, 'Resolved')}
                                        disabled={fb.status === 'Resolved'}
                                        className="w-full py-3 px-4 bg-white border border-neutral-200 text-neutral-600 text-xs font-bold rounded-xl hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {fb.status === 'Resolved' ? 'Resolved' : 'Mark as Resolved'}
                                    </button>
                                </div>
                            </div>
                        </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Reply Modal */}
            {replyingTo && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] border border-neutral-100 animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header - Fixed */}
                        <div className="p-8 pb-6 border-b border-neutral-50 flex items-center justify-between bg-white z-10">
                            <div>
                                <h3 className="text-xl font-black text-neutral-900 tracking-tight">Support Conversation</h3>
                                <p className="text-sm text-neutral-400 mt-1 font-medium">Chatting with: {replyingTo.user}</p>
                            </div>
                            <button 
                                onClick={() => setReplyingToId(null)}
                                className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-all"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 pt-6">
                            <div className="space-y-4 mb-4">
                                <div className="bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100/50">
                                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-3">User (Original)</p>
                                    <p className="text-neutral-600 text-sm leading-relaxed">{replyingTo.content}</p>
                                </div>
                                
                                {replyingTo.messages?.map((msg, idx) => (
                                    <div key={idx} className={`p-6 rounded-2xl border ${msg.sender === 'admin' ? 'bg-dark-green/5 border-dark-green/10 ml-8' : 'bg-neutral-50/50 border-neutral-100/50 mr-8'}`}>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-neutral-400">
                                            {msg.sender === 'admin' ? 'Zander Team' : 'User'}
                                        </p>
                                        <p className="text-neutral-600 text-sm leading-relaxed">{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="p-8 pt-4 border-t border-neutral-50 bg-white z-10">
                            <textarea 
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Type your response here..."
                                rows={2}
                                className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-dark-green/5 focus:border-dark-green/20 transition-all mb-4 placeholder:text-neutral-300 resize-none"
                            />

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setReplyingToId(null)}
                                    className="flex-1 py-3.5 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-2xl hover:bg-neutral-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSendReply}
                                    disabled={isSubmittingReply || !replyContent.trim()}
                                    className="flex-1 py-3.5 bg-dark-green text-white font-bold rounded-2xl hover:bg-dark-green/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmittingReply ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Reply
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
