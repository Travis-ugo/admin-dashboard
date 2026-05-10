# 🛡️ Zander Admin Dashboard

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Framework](https://img.shields.io/badge/framework-Next.js%2015-black.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

The **Zander Admin Dashboard** is a high-performance, premium administrative portal designed to manage the Zander Personal Knowledge Recall System. Built with Next.js and TypeScript, it provides platform administrators with real-time oversight of user activity, knowledge base growth, and data ingestion processes.

---

## 🚀 Overview

Zander is a comprehensive second-brain ecosystem, and this dashboard serves as its central command center. It provides secure, administrative-level access to system-wide metadata without compromising individual user privacy.

### Key Pillars
- **User Oversight**: Monitor account creation, status, and knowledge base volume.
- **Data Ingestion**: Track the status and health of background import jobs from various sources (ChatGPT, Gemini, Google Keep, etc.).
- **System Health**: View global platform metrics and health indicators.
- **Privacy First**: Designed to aggregate metadata (counts, timestamps) without ever exposing raw user note content to administrators.

---

## ✨ Features

### 📊 Platform Intelligence
*   **Real-time Dashboard**: Monitor global statistics including total registered users, total knowledge items, and total import jobs.
*   **Privacy-Safe Metrics**: All metrics are calculated server-side using the Firebase Admin SDK to ensure no PII or sensitive content is leaked.

### 👤 User Management
*   **Account Monitoring**: View a complete list of registered users with their account status and note counts.
*   **Search & Filter**: Quickly locate specific users by email or unique ID.
*   **Status Tracking**: (Roadmap) Ability to disable or enable accounts based on support requirements.

### 📥 Import Activity
*   **Job Monitoring**: Track every data import job processed by the system.
*   **Status Visualization**: Clear visual indicators for pending, processing, completed, and failed jobs.
*   **Volume Tracking**: See exactly how many items were ingested per import job.

---

## 🛠️ Tech Stack

- **Core**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- **State & Logic**: 
  - `AuthContext` with Firebase Auth and custom admin claims validation.
  - `Axios` for internal API communication.
  - `Framer Motion` for premium UI transitions.

---

## 📦 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables**:
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...}
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the portal.

---

## 📂 Project Structure

```text
src/
├── app/               # Next.js App Router (Pages & Layouts)
│   ├── api/           # Secure server-side routes (Firebase Admin SDK)
│   ├── dashboard/     # Platform statistics
│   ├── users/         # User management
│   ├── imports/       # Data ingestion tracking
│   └── layout.tsx     # Global wrapper with Zander branding
├── components/        # Reusable UI components
│   ├── ui/            # Atomic components (Button, Modal, etc.)
│   ├── Sidebar.tsx    # Primary navigation (Zander-branded)
│   └── AdminLayout.tsx # Global wrapper with auth protection
├── context/           # React Context providers (AuthContext)
└── lib/               # Shared libraries (Firebase Admin initialization)
```

---

## 🔒 Security

- **Firebase Admin SDK**: All sensitive operations (Firestore counts, user listings) are performed on the server-side to prevent unauthorized client access.
- **Custom Claims**: Access to the portal is strictly gated by the `admin` custom claim in Firebase Auth.
- **Route Protection**: The `AdminLayout` component enforces a valid admin session before rendering any management interface.

---

## 📄 License

This project is private and proprietary. All rights reserved.
# zander-admin
# admin-dashboard
