'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
    CloudDownload,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCcw,
    Search,
    X,
    Eye
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoading(true);

            axios.get('/api/admin/imports')
                .then(res => setImports(res.data.imports))
                .catch(err => console.error('Failed to fetch imports:', err))
                .finally(() => setIsLoading(false));
        }
    }, [user, authLoading]); // Removed imports.length as it's not needed if we just set true

    const filteredImports = imports.filter(job =>
        job.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewDetails = (job: ImportJob) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

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
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by provider, user, or ID..."
                        className="w-full pl-11 pr-12 py-3 bg-white border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/10 focus:border-dark-green/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-neutral-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => {
                        setIsLoading(true);
                        axios.get('/api/admin/imports')
                            .then(res => setImports(res.data.imports))
                            .finally(() => setIsLoading(false));
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 hover:border-neutral-200 transition-all disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-50">
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Import Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">Items</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Created At</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Actions</th>
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
                            ) : filteredImports.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-neutral-400 font-medium">
                                        No import activity found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredImports.map((job) => (
                                    <tr key={job.id} className="hover:bg-neutral-50/50 transition-colors group">
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
                                                    <span>{job.userEmail || job.userId}</span>
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
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${getStatusColor(job.status)} text-[10px] font-black uppercase tracking-wider rounded-full`}>
                                                {getStatusIcon(job.status)}
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleViewDetails(job)}
                                                className="p-2 rounded-xl text-neutral-400 hover:text-dark-green hover:bg-dark-green/5 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Import Job Details"
                subtitle="Complete technical metadata for this ingestion task."
            >
                {selectedJob && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Provider</p>
                                <p className="text-sm font-bold text-neutral-900">{selectedJob.provider}</p>
                            </div>
                            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Status</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${getStatusColor(selectedJob.status)} text-[10px] font-black uppercase rounded-lg`}>
                                    {selectedJob.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">User Information</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-neutral-500">Name</span>
                                    <span className="text-xs font-bold text-neutral-900">{selectedJob.userName || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-neutral-500">Email</span>
                                    <span className="text-xs font-mono text-neutral-900">{selectedJob.userEmail || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-neutral-500">User ID</span>
                                    <span className="text-xs font-mono text-neutral-400">{selectedJob.userId}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Job Metadata</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-neutral-500">Job ID</span>
                                    <span className="text-xs font-mono text-neutral-400">{selectedJob.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-neutral-500">Items Created</span>
                                    <span className="text-xs font-black text-neutral-900">{selectedJob.itemCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-neutral-500">Created At</span>
                                    <span className="text-xs text-neutral-600">{new Date(selectedJob.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
