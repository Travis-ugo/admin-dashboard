"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Clock,
  UserPlus,
  Mail,
  X
} from "lucide-react";
import styles from "../app/dashboard/users/page.module.css";
import dashboardStyles from "../app/dashboard/page.module.css";

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  lastSync: string;
}

export function UserManager({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === "Active" ? "Inactive" : "Active";
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <h1 className={dashboardStyles.title}>User Management</h1>
          <p className={dashboardStyles.subtitle}>Monitor and control Zander user access.</p>
        </div>
        <button 
          className={dashboardStyles.refreshButton}
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus size={18} />
          <span>Invite User</span>
        </button>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <input 
            type="text" 
            placeholder="Search users by name, email or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <button className={styles.filterBtn}>
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="glass-card">
        <table className={dashboardStyles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Role</th>
              <th>Last Seen</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className={styles.userName}>{user.name || 'Anonymous User'}</div>
                      <div className={styles.userEmail}>{user.email || user.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className={`${styles.statusBadge} ${styles[(user.status || 'inactive').toLowerCase()]}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status || 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className={styles.roleInfo}>
                    <Shield size={14} />
                    <span>{user.role || 'User'}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.timeInfo}>
                    <Clock size={14} />
                    <span>{user.lastSync || 'N/A'}</span>
                  </div>
                </td>
                <td>
                  <button className={styles.actionBtn}>
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                  No users found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Invite New User</h3>
              <button onClick={() => setShowInviteModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input type="email" placeholder="user@zander.ai" />
              </div>
              <div className={styles.inputGroup}>
                <label>Role</label>
                <select>
                  <option>User</option>
                  <option>Admin</option>
                  <option>Viewer</option>
                </select>
              </div>
              <button className={dashboardStyles.refreshButton} style={{ width: '100%', marginTop: '12px' }}>
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
