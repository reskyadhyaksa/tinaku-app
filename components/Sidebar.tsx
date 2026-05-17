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
    { name: 'Dashboard', href: '/dashboard/bidan', icon: LayoutDashboard },
    { name: 'Data Bumil', href: '/dashboard/bidan/bumil', icon: Heart },
    { name: 'Screening Bumil', href: '/dashboard/bidan/skrining', icon: ClipboardCheck },
  ];

  if (user.role === 'bidan' || user.role === 'superadmin') {
    menuItems.push({ name: 'User Bidan', href: '/dashboard/bidan/bidan', icon: Users });
  }

  if (user.role === 'superadmin') {
    menuItems.push({ name: 'User Dokter', href: '/dashboard/bidan/dokter', icon: Users });
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-pink-500 text-white rounded-xl shadow-lg"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-pink-50 w-72 z-40 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                <Heart className="text-white w-6 h-6 fill-current" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tighter">TINAKU</h1>
                <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' 
                      : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-pink-500'}`} />
                    <span className="font-bold text-sm">{item.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-6 border-t border-gray-50">
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-white rounded-full border-2 border-pink-200 flex items-center justify-center text-pink-500 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{user.role}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white border border-red-50 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
