'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Platform Overview', subtitle: 'Global performance metrics and system health' },
    '/users': { title: 'User Management', subtitle: 'Manage accounts, access levels, and usage statistics' },
    '/imports': { title: 'Data Import Activity', subtitle: 'Monitor background processing and ingestion logs' },
    '/dashboard/feedback': { title: 'User Feedback', subtitle: 'Review and respond to feedback submitted by mobile users' },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Temporarily disabled for visual inspection
        if (!isLoading && !user) {
            router.push('/login');
        } else if (!isLoading && user && !user.isAdmin) {
            console.error('[AdminLayout] Access denied: User is not an admin', user);
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // Force visible state for local preview
    const isDevelopmentPreview = false;

    if (isLoading && !isDevelopmentPreview) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-dark-green animate-spin mx-auto mb-4" />
                    <p className="text-sm text-neutral-400 font-medium">Loading portal...</p>
                </div>
            </div>
        );
    }

    // Find the best-matching page title
    const currentPath = pathname || '/dashboard';
    const matchedKey = Object.keys(pageTitles).find(k => currentPath.startsWith(k)) || '/dashboard';
    const pageInfo = pageTitles[matchedKey];

    return (
        <div className="flex min-h-screen bg-neutral-50/60">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="bg-white border-b border-neutral-100 px-10 py-5 sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900">{pageInfo?.title}</h1>
                        <p className="text-sm text-neutral-400 mt-0.5">{pageInfo?.subtitle}</p>
                    </div>
                </header>
                <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
