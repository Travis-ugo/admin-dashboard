"use client";

import { usePathname } from "next/navigation";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left side - Branded Side Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-dark-green relative items-center justify-center overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-sage/10 rounded-full -ml-32 -mb-32 blur-3xl" />
                
                <div className="relative z-10 text-white text-center px-12">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] mx-auto mb-8 flex items-center justify-center border border-white/20 overflow-hidden p-4">
                        <img src="/logo.svg" alt="Zander" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight text-white">Zander Portal</h1>
                    <p className="text-xl text-sage font-medium opacity-90 max-w-sm mx-auto leading-relaxed">
                        Secure administrative oversight for the Zander Personal Knowledge ecosystem.
                    </p>
                </div>

                {/* Bottom Footer Pattern */}
                <div className="absolute bottom-12 left-0 right-0 text-center">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
                        Internal Use Only • Authorized Access
                    </p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 bg-white overflow-y-auto">
                <div className="min-h-full flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 text-neutral-900">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
