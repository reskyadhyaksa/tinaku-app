import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TINAKU",
  description: "Pendamping Ibu Hamil Berbasis Digital",
};

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ClientLayout from "@/components/ClientLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-pink-50">
        <AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: {
                borderRadius: '16px',
                background: '#333',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
              },
            }} 
          />
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
