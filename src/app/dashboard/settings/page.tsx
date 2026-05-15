'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    { ssr: false }
);

interface AppSettings {
    privacyPolicy: string;
    termsOfService: string;
    supportEmail: string;
}

export default function SettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    
    // Separate states to prevent massive re-renders on every keystroke
    const [privacyPolicy, setPrivacyPolicy] = useState('');
    const [termsOfService, setTermsOfService] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!authLoading && user) {
            fetchSettings();
        }
    }, [user, authLoading]);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get('/api/admin/settings');
            setPrivacyPolicy(res.data.privacyPolicy || '');
            setTermsOfService(res.data.termsOfService || '');
            setSupportEmail(res.data.supportEmail || '');
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setMessage(null);
            await axios.post('/api/admin/settings', {
                privacyPolicy,
                termsOfService,
                supportEmail
            });
            setMessage({ type: 'success', text: 'Settings saved successfully. Changes will reflect in the mobile app immediately.' });

            // Clear success message after 5 seconds
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="w-full">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-neutral-900">App Settings</h1>
                    </div>
                    <p className="text-neutral-500">Manage legal content and support configuration for the Zander mobile app.</p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${message.type === 'success'
                        ? 'bg-lime/20 border-dark-green/20 text-dark-green'
                        : 'bg-red-50 border-red-100 text-red-600'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        )}
                        <p className="font-medium text-sm">{message.text}</p>
                    </div>
                )}

                <div className="bg-white rounded-[2rem] border border-neutral-100 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-green"></div>
                        </div>
                    ) : (
                        <div className="p-6 md:p-8 space-y-8">

                            {/* Support Configuration */}
                            <section>
                                <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">Support Configuration</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Support Email Address</label>
                                        <p className="text-xs text-neutral-500 mb-3">This email is used when users tap &quot;Contact Support&quot; in the mobile app.</p>
                                        <input
                                            type="email"
                                            value={supportEmail}
                                            onChange={(e) => setSupportEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-dark-green focus:border-transparent outline-none transition-all"
                                            placeholder="support@zander.app"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Legal Content */}
                            <section>
                                <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">Legal Content</h2>
                                <p className="text-xs text-neutral-500 mb-6">Content updated here will instantly replace the hardcoded legal text in the mobile app.</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">Privacy Policy</label>
                                        <div data-color-mode="light" className="border border-neutral-200 rounded-[1.5rem] focus-within:ring-4 focus-within:ring-dark-green/5 focus-within:border-dark-green/20 transition-all bg-white">
                                            <MDEditor
                                                value={privacyPolicy}
                                                onChange={(val) => setPrivacyPolicy(val || '')}
                                                height={400}
                                                className="!border-none !bg-transparent"
                                                previewOptions={{
                                                    components: {
                                                        img: ({ src, alt }: any) => {
                                                            if (!src) return null;
                                                            return <img src={src} alt={alt || 'Markdown Image'} />;
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-2">Terms of Service</label>
                                        <div data-color-mode="light" className="border border-neutral-200 rounded-[1.5rem] focus-within:ring-4 focus-within:ring-dark-green/5 focus-within:border-dark-green/20 transition-all bg-white">
                                            <MDEditor
                                                value={termsOfService}
                                                onChange={(val) => setTermsOfService(val || '')}
                                                height={400}
                                                className="!border-none !bg-transparent"
                                                previewOptions={{
                                                    components: {
                                                        img: ({ src, alt }: any) => {
                                                            if (!src) return null;
                                                            return <img src={src} alt={alt || 'Markdown Image'} />;
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Actions */}
                            <div className="pt-6 border-t border-neutral-100 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-3 bg-dark-green hover:bg-dark-green/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
