'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
    Users,
    FileText,
    CloudDownload,
    ChevronRight,
    TrendingUp,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { SystemStatus } from '@/components/SystemStatus';
import { useAuth } from '@/context/AuthContext';

interface Stats {
    totalUsers: number;
    totalNotes: number;
    totalImports: number;
}

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            setIsLoading(true);
            axios.get('/api/admin/stats')
                .then(res => setStats(res.data))
                .catch((err) => { 
                    console.error('Failed to fetch stats:', err);
                })
                .finally(() => setIsLoading(false));
        }
    }, [user, authLoading]);

    const statCards = [
        { 
            label: 'Total Users', 
            value: stats?.totalUsers ?? 0, 
            icon: Users, 
            color: 'text-dark-green', 
            bg: 'bg-sage/20', 
            href: '/users',
            description: 'Registered accounts'
        },
        { 
            label: 'Knowledge Items', 
            value: stats?.totalNotes ?? 0, 
            icon: FileText, 
            color: 'text-dark-green', 
            bg: 'bg-mint/20', 
            href: '/users',
            description: 'Notes across all users'
        },
        { 
            label: 'Import Jobs', 
            value: stats?.totalImports ?? 0, 
            icon: CloudDownload, 
            color: 'text-dark-green', 
            bg: 'bg-lime/20', 
            href: '/imports',
            description: 'Processed ingestion tasks'
        },
    ];

    return (
        <AdminLayout>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {statCards.map((card) => (
                    <Link key={card.label} href={card.href}
                        className="group bg-white p-8 rounded-[2rem] border border-neutral-100 hover:border-dark-green/20 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg}`}>
                                <card.icon className={`w-7 h-7 ${card.color}`} />
                            </div>
                            <div className="bg-neutral-50 p-2 rounded-xl group-hover:bg-dark-green group-hover:text-white transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.15em] mb-1">{card.label}</p>
                            <h3 className="text-4xl font-black text-neutral-900 tracking-tight mb-1">
                                {isLoading ? (
                                    <div className="h-10 w-24 bg-neutral-100 animate-pulse rounded-xl" />
                                ) : Number(card.value || 0).toLocaleString()}
                            </h3>
                            <p className="text-xs text-neutral-500 font-medium">{card.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
            
            <div className="max-w-md">
                <SystemStatus />
            </div>

        </AdminLayout>
    );
}
