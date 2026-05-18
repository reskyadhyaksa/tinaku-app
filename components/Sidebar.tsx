"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  LogOut, 
  Heart,
  ChevronRight,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Jika bukan bidan, dokter, atau superadmin, jangan tampilkan sidebar ini
  if (!user || (user.role !== 'bidan' && user.role !== 'dokter' && user.role !== 'superadmin')) return null;

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Data Bumil', href: '/dashboard/admin/bumil', icon: Heart },
    { name: 'Screening Bumil', href: '/dashboard/admin/skrining', icon: ClipboardCheck },
  ];

  if (user.role === 'bidan' || user.role === 'superadmin') {
    menuItems.push({ name: 'User Bidan', href: '/dashboard/admin/bidan', icon: Users });
  }

  if (user.role === 'superadmin') {
    menuItems.push({ name: 'User Dokter', href: '/dashboard/admin/dokter', icon: Users });
  }

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-pink-100/50 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-pink-500 rounded-lg flex items-center justify-center shadow-md shadow-pink-200">
            <Heart className="text-white w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 tracking-tighter">TINAKU</h1>
            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest leading-none">Dashboard</p>
          </div>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors animate-in fade-in duration-200"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Top Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-30 lg:hidden mt-16 animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-pink-100 shadow-2xl z-40 p-5 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-350 lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-pink-500 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span className="font-bold text-sm">{item.name}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-pink-50 pt-4 flex flex-col gap-3">
              <div className="bg-pink-50/30 border border-pink-100/50 rounded-2xl p-3 flex items-center gap-3">
                <div className="h-9 w-9 bg-white rounded-full border-2 border-pink-200 flex items-center justify-center text-pink-500 font-black text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-gray-800 truncate">{user.name}</p>
                  <p className="text-[9px] font-black text-pink-400 uppercase leading-none mt-0.5">{user.role}</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 text-red-500 font-extrabold text-xs hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar Container */}
      <aside className="fixed top-0 left-0 h-full bg-white border-r border-pink-50 w-72 z-40 hidden lg:block">
        <div className="flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
                <Heart className="text-white w-5 h-5 fill-current" />
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tighter">TINAKU</h1>
                <p className="text-[9px] font-bold text-pink-400 uppercase tracking-widest">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' 
                      : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-bold text-xs md:text-sm">{item.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 md:p-5 border-t border-gray-50 mt-auto">
            <div className="bg-gray-50 rounded-xl p-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-white rounded-full border-2 border-pink-200 flex items-center justify-center text-pink-500 font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mt-0.5">{user.role}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white border border-red-50 text-red-500 font-bold text-xs hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
