"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import styles from "../app/dashboard/page.module.css";

export function SyncButton() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate a brief sync delay
    await new Promise(resolve => setTimeout(resolve, 800));
    router.refresh();
    setIsSyncing(false);
  };

  return (
    <button 
      className={styles.refreshButton} 
      onClick={handleSync}
      disabled={isSyncing}
    >
      <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
      <span>{isSyncing ? "Syncing..." : "Sync Realtime"}</span>
    </button>
  );
}
