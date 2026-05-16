"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';
import { 
  Heart, 
  Activity, 
  Scale, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Droplets,
  LogOut,
  Home,
  BarChart3
} from 'lucide-react';
import { bumilApi } from '@/lib/api';
import toast from 'react-hot-toast';

// Mock Data for Visualizations
const medicalHistory = [
  { week: '12', djj: 0, tfu: 10, hb: 11.2, sys: 110, dia: 70, weight: 55 },
  { week: '16', djj: 145, tfu: 14, hb: 11.5, sys: 115, dia: 75, weight: 57 },
  { week: '20', djj: 150, tfu: 18, hb: 11.0, sys: 120, dia: 80, weight: 60 },
  { week: '24', djj: 148, tfu: 22, hb: 10.8, sys: 118, dia: 78, weight: 62 },
  { week: '28', djj: 142, tfu: 26, hb: 11.3, sys: 122, dia: 82, weight: 65 },
  { week: '32', djj: 140, tfu: 30, hb: 11.6, sys: 120, dia: 80, weight: 68 },
];

const ttdCompliance = [
  { day: 'Sen', taken: true },
  { day: 'Sel', taken: true },
  { day: 'Rab', taken: false },
  { day: 'Kam', taken: true },
  { day: 'Jum', taken: true },
  { day: 'Sab', taken: true },
  { day: 'Min', taken: true },
];

export default function BumilDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    if (!user) {
      router.push('/login');
    } else if (user.role !== 'bumil') {
      router.push('/dashboard/bidan');
    } else {
      fetchProfile();
    }
    return () => clearTimeout(timer);
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const res = await bumilApi.getMe();
      setProfile(res.data);
    } catch (error) {
      console.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-pink-500 font-bold text-xl text-center">
          Menyiapkan Dashboard Personal Anda...<br/>
          <span className="text-sm font-normal text-gray-400 italic">Menganalisis data klinis</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navbar for Bumil */}
        <div className="flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 text-pink-500 font-bold hover:opacity-80 transition-all">
              <Home className="w-5 h-5" />
              <span>Kembali ke Beranda</span>
           </Link>
           <button 
              onClick={logout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold transition-all text-sm"
           >
              <LogOut className="w-5 h-5" />
              Keluar
           </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-pink-100">
          <div className="flex items-center gap-5">
            <div className="md:h-20 md:w-20 h-14 w-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-xl shadow-pink-200">
              <Heart className="md:w-10 md:h-10 w-5 h-5 text-white fill-current animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Halo, Ibu {profile.name}!</h1>
              <p className="text-gray-500 font-medium text-sm">Usia Kehamilan: <span className="text-pink-500 font-bold">28 Minggu 4 Hari</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-pink-50 p-4 rounded-3xl border border-pink-100">
            <div className="text-right">
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Status Risiko</p>
              <p className={`text-lg font-black ${profile.riskStatus === 'KRR' ? 'text-green-500' : 'text-red-500'}`}>
                {profile.riskStatus === 'KRR' ? 'Kehamilan Normal (KRR)' : 'Risiko Tinggi (KRT)'}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${profile.riskStatus === 'KRR' ? 'bg-green-500 shadow-green-100' : 'bg-red-500 shadow-red-100'} shadow-lg text-white`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <div className="h-10 w-10 md:h-14 md:w-14 bg-blue-50 text-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
               <Droplets className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
               <p className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">HB</p>
               <h4 className="text-sm md:text-xl font-black text-gray-900 truncate">11.3 g/dL</h4>
               <span className="text-[8px] md:text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Normal</span>
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <div className="h-10 w-10 md:h-14 md:w-14 bg-rose-50 text-rose-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
               <Activity className="text-rose-500 w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
               <p className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Tekanan Darah</p>
               <h4 className="text-sm md:text-xl font-black text-gray-900 truncate">122/82</h4>
               <span className="text-[8px] md:text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Pantau</span>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <div className="h-10 w-10 md:h-14 md:w-14 bg-amber-50 text-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
               <TrendingUp className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
               <p className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Fundus (TFU)</p>
               <h4 className="text-sm md:text-xl font-black text-gray-900 truncate">26 cm</h4>
               <span className="text-[8px] md:text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Sesuai</span>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <div className="h-10 w-10 md:h-14 md:w-14 bg-emerald-50 text-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
               <Heart className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
               <p className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">DJJ</p>
               <h4 className="text-sm md:text-xl font-black text-gray-900 truncate">142 bpm</h4>
               <span className="text-[8px] md:text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Baik</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-pink-50">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                     <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Evaluasi Medis Kehamilan</h3>
               </div>
               <div className="flex gap-2 text-[10px] font-black uppercase">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span> DJJ</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> TFU</div>
               </div>
            </div>
            <div className="h-[200px] md:h-[300px] w-full min-w-0 relative">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" aspect={window.innerWidth < 768 ? 1.5 : 2}>
                  <AreaChart data={medicalHistory}>
                    <defs>
                      <linearGradient id="colorDjj" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="djj" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorDjj)" />
                    <Area type="monotone" dataKey="tfu" stroke="#3b82f6" strokeWidth={3} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-pink-50 min-w-0 relative">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                     <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-gray-900">Berat Badan</h3>
               </div>
            </div>
            <div className="h-[200px] md:h-[300px] w-full min-w-0 relative">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" aspect={window.innerWidth < 768 ? 1.5 : 2}>
                  <LineChart data={medicalHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                    <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-pink-50">
            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-pink-500" />
              Tablet Tambah Darah
            </h3>
            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {ttdCompliance.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 md:gap-3">
                   <div className={`w-full aspect-square rounded-xl md:rounded-2xl flex items-center justify-center border-2 ${item.taken ? 'bg-pink-500 border-pink-500 shadow-lg shadow-pink-100' : 'bg-white border-gray-100 text-gray-300'}`}>
                      {item.taken && <CheckCircle2 className="text-white w-4 h-4 md:w-6 md:h-6" />}
                   </div>
                   <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl text-white">
             <h3 className="text-lg md:text-xl font-black mb-6 md:mb-10 flex items-center gap-3">
                <AlertCircle className="text-pink-500" />
                Skor KSPR
             </h3>
             <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 md:border-8 border-pink-500 flex items-center justify-center">
                   <span className="text-2xl md:text-4xl font-black">2</span>
                </div>
                <h4 className="text-lg md:text-xl font-black text-green-400 text-center">NORMAL (KRR)</h4>
                <button onClick={() => router.push('/skrining')} className="w-full bg-white/10 hover:bg-white/20 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all">
                   Update Data
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
