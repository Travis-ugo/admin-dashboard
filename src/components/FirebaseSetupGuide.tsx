"use client";

import { useState } from 'react';
import { Settings, ExternalLink, Copy, Check, Key, Shield } from 'lucide-react';
import styles from './FirebaseSetupGuide.module.css';

export function FirebaseSetupGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const envTemplate = `FIREBASE_PROJECT_ID=project-x-f46f0
FIREBASE_CLIENT_EMAIL=your-service-account-email@project-x-f46f0.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...your-key...\\n-----END PRIVATE KEY-----\\n"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <button className={styles.triggerBtn} onClick={() => setIsOpen(true)}>
        <Key size={16} />
        <span>Connect Production Firebase</span>
      </button>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.titleGroup}>
            <Shield size={24} color="#09231F" />
            <h2>Production Connectivity Guide</h2>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>&times;</button>
        </div>

        <div className={styles.content}>
          <div className={styles.step}>
            <h3>1. Generate Service Account</h3>
            <p>Go to the <strong>Firebase Console</strong> &gt; Project Settings &gt; Service Accounts. Click <strong>"Generate New Private Key"</strong>.</p>
            <a 
              href="https://console.firebase.google.com/project/project-x-f46f0/settings/serviceaccounts/adminsdk" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            >
              Open Firebase Console <ExternalLink size={14} />
            </a>
          </div>

          <div className={styles.step}>
            <h3>2. Configure Environment</h3>
            <p>Create a file named <code>.env.local</code> in the root of <code>zander_admin</code> and paste the following template, replacing placeholders with values from your JSON file.</p>
            
            <div className={styles.codeBlock}>
              <pre>{envTemplate}</pre>
              <button className={styles.copyBtn} onClick={copyToClipboard}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.step}>
            <h3>3. Restart App</h3>
            <p>Once saved, the <strong>Connectivity Dashboard</strong> will automatically detect the new credentials and switch to live data.</p>
          </div>
        </div>

        <div className={styles.footer}>
          <button className="btn-primary" onClick={() => setIsOpen(false)} style={{ width: '100%' }}>
            I've Added the Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
