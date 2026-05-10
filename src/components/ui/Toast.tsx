'use client';

import { Toaster } from 'react-hot-toast';

export function ToasterProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#1A1A1A',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                },
                success: {
                    iconTheme: { primary: '#22c55e', secondary: '#fff' },
                },
                error: {
                    iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
            }}
        />
    );
}
