'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
    Search, 
    Mail, 
    CheckCircle2,
    XCircle,
    Clock,
    X
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    status: 'active' | 'disabled';
    noteCount: number;
}

export default function UsersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading && user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoading(true);
            axios.get('/api/admin/users')
                .then(res => setUsers(res.data.users))
                .catch(err => console.error('Failed to fetch users:', err))
                .finally(() => setIsLoading(false));
        }
    }, [user, authLoading]);

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or ID..."
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
            </div>

            <div className="bg-white rounded-[2rem] border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-50">
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">User Information</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Joined Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">Items</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-8 py-6">
                                            <div className="h-12 bg-neutral-50 rounded-2xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-neutral-400 font-medium">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center text-dark-green">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-900">
                                                        {user.name && user.name !== 'User' ? user.name : user.email}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                                        {user.name && user.name !== 'User' ? user.email : user.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-neutral-600 font-medium text-sm">
                                                <Clock className="w-3.5 h-3.5 text-neutral-300" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.status === 'active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-dark-green/5 text-dark-green text-[10px] font-black uppercase tracking-wider rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger/5 text-danger text-[10px] font-black uppercase tracking-wider rounded-full">
                                                    <XCircle className="w-3 h-3" />
                                                    Disabled
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-sm font-black text-neutral-900">{user.noteCount}</span>
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
