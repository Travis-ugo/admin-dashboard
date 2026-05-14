'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
    CloudDownload, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    RefreshCcw,
    ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface ImportJob {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
    createdAt: string;
    provider: string;
    itemCount: number;
}

export default function ImportsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [imports, setImports] = useState<ImportJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            setIsLoading(true);
            axios.get('/api/admin/imports')
                .then(res => setImports(res.data.imports))
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [user, authLoading]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-dark-green/5 text-dark-green';
            case 'Failed': return 'bg-danger/5 text-danger';
            case 'Processing': return 'bg-info/5 text-info';
            default: return 'bg-warning/5 text-warning';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="w-3 h-3" />;
            case 'Failed': return <XCircle className="w-3 h-3" />;
            case 'Processing': return <RefreshCcw className="w-3 h-3 animate-spin" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <AdminLayout>
            <div className="bg-white rounded-[2rem] border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-50">
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Import Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">Items</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Created At</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6">
                                            <div className="h-12 bg-neutral-50 rounded-2xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : imports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-neutral-400 font-medium">
                                        No import activity recorded.
                                    </td>
                                </tr>
                            ) : (
                                imports.map((job) => (
                                    <tr key={job.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-lime/10 flex items-center justify-center text-dark-green">
                                                    <CloudDownload className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-900">{job.provider}</p>
                                                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{job.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col justify-center">
                                                <p className="text-sm font-bold text-neutral-900 leading-tight">{job.userName || 'Unknown User'}</p>
                                                <div className="flex items-center gap-1.5 mt-1 text-neutral-400 text-[10px] font-mono leading-none">
                                                    <span>{job.userId}</span>
                                                    <ExternalLink className="w-2.5 h-2.5 text-neutral-300" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-sm font-black text-neutral-900">{job.itemCount}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-neutral-600 font-medium">{new Date(job.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-neutral-400">{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${getStatusColor(job.status)} text-[10px] font-black uppercase tracking-wider rounded-full`}>
                                                {getStatusIcon(job.status)}
                                                {job.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
