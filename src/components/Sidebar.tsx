'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Users,
    CloudDownload,
    MessageSquare,
    LogOut,
    ShieldCheck,
    Settings,
    Database,
} from 'lucide-react';
import axios from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Modal from '@/components/ui/Modal';
import { FirebaseSetupGuide } from '@/components/FirebaseSetupGuide';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Import Activity', href: '/imports', icon: CloudDownload },
    { name: 'User Feedback', href: '/dashboard/feedback', icon: MessageSquare },
    { name: 'Support & FAQ', href: '/dashboard/support', icon: ShieldCheck },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    React.useEffect(() => {
        if (user) {
            // Fetch stats to get unread feedback count using axios (which handles auth headers)
            axios.get('/api/admin/stats')
                .then(res => setUnreadCount(res.data.unreadFeedback || 0))
                .catch(err => console.error('Failed to fetch unread count:', err));
        }
    }, [user, pathname]); // Re-fetch on path change to update if they just reviewed feedback

    return (
        <aside className="w-68 bg-white border-r border-neutral-100 flex flex-col h-screen sticky top-0 z-40" style={{ width: '272px' }}>
            {/* Logo */}
            <div className="p-8 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-neutral-100">
                    <img src="/logo.svg" alt="Zander" className="w-full h-full object-contain p-1" />
                </div>
                <div>
                    <h2 className="font-bold text-neutral-900 leading-tight">Zander</h2>
                    <span className="text-[10px] text-neutral-400 font-bold tracking-[0.1em] uppercase">Control Center</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    const isActive = item.href === '/dashboard' 
                        ? pathname === '/dashboard' 
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'group flex items-center justify-between px-4 py-3 rounded-2xl transition-all',
                                isActive
                                    ? 'bg-primary/8 text-primary'
                                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                                    isActive ? 'bg-primary/10' : 'group-hover:bg-neutral-100'
                                )}>
                                    <item.icon className={cn('w-4 h-4', isActive && 'text-primary')} />
                                </div>
                                <span className={cn('font-semibold text-[14px]', isActive && 'text-primary')}>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.name === 'User Feedback' && unreadCount > 0 && (
                                    <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] h-[18px] flex items-center justify-center">
                                        {unreadCount}
                                    </div>
                                )}
                                {isActive && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="p-4 border-t border-neutral-100">
                <div className="p-4 bg-neutral-100/50 border border-neutral-200/50 rounded-2xl mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-dark-green flex items-center justify-center text-white font-bold text-sm">
                            {user?.displayName?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-neutral-900 truncate">{user?.displayName || 'Admin User'}</p>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Access Level: Admin</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all group"
                >
                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    <span className="font-semibold text-sm">Sign Out</span>
                </button>
            </div>

            <Modal 
                isOpen={isLogoutModalOpen} 
                onClose={() => setIsLogoutModalOpen(false)}
                title="Sign Out"
                size="sm"
            >
                <div className="space-y-5">
                    <div className="p-3 bg-red-50 rounded-2xl flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                            <LogOut className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-[13px] font-bold text-red-900 leading-tight">Confirm Sign Out</h3>
                            <p className="text-[10px] text-red-600 font-medium">You will be logged out of your session.</p>
                        </div>
                    </div>

                    <p className="text-sm text-neutral-500 leading-relaxed px-1">
                        Are you sure you want to end your session? All unsaved progress may be lost.
                    </p>

                    <div className="flex gap-2.5 pt-1">
                        <button 
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-xl text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => logout()}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </Modal>
        </aside>
    );
}
