"use client";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="h-10 w-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
    </div>
  );

  const isLandingPage = pathname === '/';
  const isBidan = user && user.role === 'bidan';
  const isBumil = user && user.role === 'bumil';

  return (
    <div className={`flex-1 flex flex-col lg:flex-row w-full ${isBidan && !isLandingPage ? '' : 'block'}`}>
      {!isLandingPage && <Sidebar />}
      <main className={`flex-1 w-full transition-all duration-300 ${isBidan && !isLandingPage ? 'lg:ml-72' : ''}`}>
        {children}
      </main>
    </div>
  );
}
