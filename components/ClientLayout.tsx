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
  const isEdukasiPage = pathname === '/edukasi' || pathname.startsWith('/edukasi/');
  const hideSidebar = isLandingPage || isEdukasiPage;
  const hasSidebarAccess = user && (user.role === 'bidan' || user.role === 'dokter' || user.role === 'superadmin');
  const showSidebar = hasSidebarAccess && !hideSidebar;

  return (
    <div className={`flex-1 flex flex-col lg:flex-row w-full ${showSidebar ? '' : 'block'}`}>
      {showSidebar && <Sidebar />}
      <main className={`flex-1 w-full transition-all duration-300 ${showSidebar ? 'lg:ml-72 pt-16 lg:pt-0' : ''}`}>
        {children}
      </main>
    </div>
  );
}
