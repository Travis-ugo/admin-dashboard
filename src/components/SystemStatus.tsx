"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Wifi, WifiOff, Database, Loader2, RefreshCw } from 'lucide-react';
import styles from './SystemStatus.module.css';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export function SystemStatus() {
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function checkStatus() {
    setLoading(true);
    try {
      const res = await axios.get('/api/diagnostics');
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to check status', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
        checkStatus();
    }
  }, [user, authLoading]);

  if (loading && !status) {
    return (
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px' }}>
        <Loader2 className={styles.spinner} size={20} />
        <span style={{ fontWeight: 600, color: '#6B7280' }}>Testing backend connectivity...</span>
      </div>
    );
  }

  const isConnected = status?.firebase?.status === 'connected';

  return (
    <div className={`glass-card ${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Database size={20} />
          <h3>Infrastructure Health</h3>
        </div>
        <button className={styles.refreshBtn} onClick={checkStatus} disabled={loading}>
          {loading ? <Loader2 className={styles.spinner} size={16} /> : <RefreshCw size={16} />}
        </button>
      </div>

      <div className={styles.mainStatus}>
        {isConnected ? (
          <div className={`${styles.badge} ${styles.success}`}>
            <ShieldCheck size={16} />
            <span>Firebase Operational</span>
          </div>
        ) : (
          <div className={`${styles.badge} ${styles.error}`}>
            <ShieldAlert size={16} />
            <span>Connection Blocked</span>
          </div>
        )}
      </div>

      <div className={styles.collectionGrid}>
        {Object.entries(status?.collections || {}).map(([key, val]: [string, any]) => (
          <div key={key} className={styles.colItem}>
            <div className={styles.colName}>{key}</div>
            <div className={`${styles.dot} ${val.status === 'reachable' ? styles.dotSuccess : styles.dotError}`} />
          </div>
        ))}
      </div>

      {!isConnected && (
        <div className={styles.alert}>
          <p><strong>Setup Required:</strong> Add FIREBASE credentials to .env.local to enable real-time data.</p>
        </div>
      )}
    </div>
  );
}
