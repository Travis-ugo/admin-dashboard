"use client";

import { Search, Bell, Moon, MonitorDot } from "lucide-react";
import styles from "./Topbar.module.css";

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.searchContainer}>
        <Search size={20} color="rgba(255, 255, 255, 0.4)" />
        <input 
          type="text" 
          placeholder="Search for command or user..." 
          className={styles.searchInput} 
        />
      </div>

      <div className={styles.actions}>
        <div className={styles.systemStatus}>
          <MonitorDot size={18} color="#10b981" />
          <span className={styles.statusText}>Systems Online</span>
        </div>

        <button className={styles.iconButton}>
          <Bell size={20} />
          <div className={styles.badge} />
        </button>

        <button className={styles.iconButton}>
          <Moon size={20} />
        </button>

        <div className={styles.divider} />

        <div className={styles.dateTime}>
          <span className={styles.date}>Mar 29, 2026</span>
          <span className={styles.time}>13:55</span>
        </div>
      </div>
    </header>
  );
}
