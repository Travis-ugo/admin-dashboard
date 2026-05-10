"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Eye, 
  Edit3, 
  Trash2,
  X,
  PlusCircle
} from "lucide-react";
import styles from "../app/dashboard/help/page.module.css";
import dashboardStyles from "../app/dashboard/page.module.css";

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  views: string;
  status: string;
}

export function HelpManager({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setArticles(articles.map(art => {
      if (art.id === id) {
        return { ...art, status: art.status === "Published" ? "Draft" : "Published" };
      }
      return art;
    }));
  };

  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <h1 className={dashboardStyles.title}>Help Center</h1>
          <p className={dashboardStyles.subtitle}>Manage documentation and support articles.</p>
        </div>
        <button 
          className={dashboardStyles.refreshButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          <span>New Article</span>
        </button>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <input 
            type="text" 
            placeholder="Search help articles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card">
        <table className={dashboardStyles.table}>
          <thead>
            <tr>
              <th>Article Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Views</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => (
              <tr key={article.id}>
                <td>
                  <div className={styles.articleTitle}>
                    {article.title}
                  </div>
                  <div className={styles.meta}>By {article.author}</div>
                </td>
                <td>
                  <span className={styles.categoryBadge}>{article.category}</span>
                </td>
                <td>
                  <button 
                    className={`${styles.statusToggle} ${styles[article.status.toLowerCase()]}`}
                    onClick={() => toggleStatus(article.id)}
                  >
                    {article.status}
                  </button>
                </td>
                <td>
                  <div className={styles.viewCount}>
                    <Eye size={14} />
                    <span>{article.views}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.iconBtn}><Edit3 size={16} /></button>
                    <button className={styles.iconBtn}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredArticles.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                  No articles found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create New Article</h3>
              <button onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>Article Title</label>
                <input type="text" placeholder="e.g. Getting Started with Zander" />
              </div>
              <div className={styles.inputGroup}>
                <label>Category</label>
                <select>
                  <option>Getting Started</option>
                  <option>Tutorials</option>
                  <option>API Reference</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Content (Brief Summary)</label>
                <textarea placeholder="Outline the main points of this article..." rows={4} />
              </div>
              <button className={dashboardStyles.refreshButton} style={{ width: '100%', marginTop: '12px' }}>
                <PlusCircle size={18} />
                <span>Publish Article</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
