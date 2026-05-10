'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signInWithPopup,
    GoogleAuthProvider,
    signOut, 
    User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AdminUser {
    id: string;
    email: string;
    displayName: string;
    isAdmin: boolean;
}

interface AuthContextType {
    user: AdminUser | null;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import axios from 'axios';

// Configure axios interceptor for admin auth
axios.interceptors.request.use(async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        try {
            const token = await currentUser.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            console.error('[AxiosInterceptor] Failed to get ID token', error);
        }
    }
    return config;
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
            if (fbUser) {
                // Check custom claims
                const idTokenResult = await fbUser.getIdTokenResult();
                const isAdmin = !!idTokenResult.claims.admin;

                if (isAdmin) {
                    setUser({
                        id: fbUser.uid,
                        email: fbUser.email || '',
                        displayName: fbUser.displayName || 'Admin',
                        isAdmin: true,
                    });
                } else {
                    console.error('[AuthContext] Access denied: User is not an admin');
                    setUser(null);
                    await signOut(auth);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        } catch (error: any) {
            setIsLoading(false);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            setIsLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
