import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google"; // Use Host_Grotesk for Google Fonts
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Zander | Admin Dashboard",
  description: "Advanced AI Control Center for Zander Knowledge System",
  icons: {
    icon: '/icon.svg',
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { ToasterProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hostGrotesk.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans antialiased" style={{ margin: 0 }} suppressHydrationWarning>
        <AuthProvider>
          <ToasterProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


