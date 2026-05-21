"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PuskesmasList from '@/components/PuskesmasList';
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
  BarChart3,
  BookOpen,
  ShieldAlert
} from 'lucide-react';
import { bumilApi } from '@/lib/api';
import toast from 'react-hot-toast';

const getPregnancyAge = (hpht: string, hpl: string) => {
  if (!hpht && !hpl) return "Belum Ditentukan";
  
  let hphtDate: Date;
  if (hpht) {
    hphtDate = new Date(hpht);
  } else {
    const hplDate = new Date(hpl);
    hphtDate = new Date(hplDate.getTime() - 280 * 24 * 60 * 60 * 1000);
  }
  
  const today = new Date();
  const diffMs = today.getTime() - hphtDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Belum Mulai";
  
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  
  if (weeks >= 42) return "Sudah Waktunya Melahirkan";
  
  return `${weeks} Minggu ${days} Hari`;
};

const getLast7Days = (hpl: string) => {
  const list = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    
    let pregnancyMonth = 1;
    let pregnancyDay = 1;
    
    if (hpl) {
      const hplDate = new Date(hpl);
      const diffMs = hplDate.getTime() - d.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const daysPregnant = 280 - diffDays;
      
      pregnancyMonth = Math.max(1, Math.min(10, Math.ceil(daysPregnant / 30)));
      pregnancyDay = Math.max(1, Math.min(31, (daysPregnant % 30) || 30));
    }
    
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayName = dayNames[d.getDay()];
    
    const monthsNamesIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateLabel = `${d.getDate()} ${monthsNamesIndo[d.getMonth()]}`;
    
    list.push({
      dateLabel,
      dayName,
      pregnancyMonth,
      pregnancyDay,
      key: `${pregnancyMonth}-${pregnancyDay}`,
      actualDate: d
    });
  }
  return list;
};

export default function BumilDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [ttdLogs, setTtdLogs] = useState<any[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    if (!user) {
      router.push('/login');
    } else if (user.role !== 'bumil') {
      router.push('/dashboard/admin');
    } else {
      fetchProfile();
    }
    return () => clearTimeout(timer);
  }, [user, router]);

  const handleToggleDashboardDay = async (item: any) => {
    if (!profile) return;

    const regDate = new Date(profile.created_at);
    regDate.setHours(0,0,0,0);
    const actualDate = new Date(item.actualDate);
    actualDate.setHours(0,0,0,0);
    if (actualDate < regDate) {
      toast.error('Hari ini berada sebelum tanggal pendaftaran pertama kali Anda melapor.');
      return;
    }

    const isCurrentlyTaken = ttdLogs.some((log: any) => log.bulan_ke === item.pregnancyMonth && log.day === item.pregnancyDay && log.taken);
    const isTaking = !isCurrentlyTaken;

    try {
      await bumilApi.toggleTtdLog(profile.id, {
        bulan_ke: item.pregnancyMonth,
        bulan_tahun: '',
        day: item.pregnancyDay,
        taken: isTaking
      });
      toast.success(`Hari ke-${item.pregnancyDay} Bulan ke-${item.pregnancyMonth} berhasil diperbarui!`, { id: 'ttd-toast' });
      fetchProfile();
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperbarui status minum TTD');
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await bumilApi.getMe();
      setProfile(res.data);
      
      const [ttdRes, checkupsRes] = await Promise.all([
        bumilApi.getTtd(res.data.id),
        bumilApi.getCheckups(res.data.id)
      ]);
      setTtdLogs(ttdRes.data.logs || []);
      setMedicalHistory(checkupsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch profile, TTD logs, or checkup history');
    } finally {
      setLoading(false);
    }
  };

  const latestCheckup = medicalHistory.length > 0 ? medicalHistory[medicalHistory.length - 1] : null;

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

  const getDynamicTarget = (createdAt: string, hpl: string) => {
    if (!createdAt || !hpl) return 180;
    const regDate = new Date(createdAt);
    const hplDate = new Date(hpl);
    const diffMs = hplDate.getTime() - regDate.getTime();
    const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const daysPregnantAtReg = 280 - remainingDays;
    const monthsPregnantAtReg = Math.ceil(daysPregnantAtReg / 30);
    if (monthsPregnantAtReg >= 5) {
      return Math.min(180, remainingDays);
    }
    return 180;
  };

  const targetTtd = getDynamicTarget(profile.created_at, profile.hpl);
  const totalTtdTaken = ttdLogs.filter((log: any) => log.taken).length;
  const compliancePct = Math.min(100, Math.round((totalTtdTaken / targetTtd) * 100));
  const last7DaysList = getLast7Days(profile.hpl);

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans pb-24 animate-fade-in-up">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-3xl shadow-sm border border-pink-100/50">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/dashboard/bumil" className="flex items-center gap-2 text-pink-500 font-bold hover:opacity-80 transition-all text-sm">
              <Home className="w-4 h-4 text-pink-500" />
              <span>Dashboard</span>
            </Link>
            <Link href="/fitur" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-bold transition-all text-sm">
              <Activity className="w-4 h-4 text-pink-400" />
              <span>Fitur Aplikasi</span>
            </Link>
            <Link href="/edukasi" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-bold transition-all text-sm">
              <BookOpen className="w-4 h-4 text-pink-400" />
              <span>Edukasi KIA</span>
            </Link>
            <Link href="/tanda-bahaya" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-bold transition-all text-sm">
              <ShieldAlert className="w-4 h-4 text-pink-400" />
              <span>Buku Saku Tanda Bahaya</span>
            </Link>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold transition-all text-sm shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-pink-100">
          <div className="flex items-center gap-5">
            <div className="md:h-20 md:w-20 h-14 w-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-xl shadow-pink-200">
              <Heart className="md:w-10 md:h-10 w-5 h-5 text-white fill-current animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Halo, Ibu {profile.name}!</h1>
              <p className="text-gray-500 font-semibold text-xs md:text-sm mt-1">
                Usia Kehamilan: <span className="text-pink-500 font-black">{getPregnancyAge(profile.hpht, profile.hpl)}</span>
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] md:text-xs font-medium text-gray-400">
                <span>HPHT: <strong className="text-gray-600 font-bold">{profile.hpht ? new Date(profile.hpht).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</strong></span>
                <span>HPL: <strong className="text-pink-500 font-bold">{profile.hpl ? new Date(profile.hpl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</strong></span>
              </div>
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

        {/* Interactive Danger Signs Digital Pocket Book Banner */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-[32px] p-6 sm:p-8 text-white shadow-xl shadow-red-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" /> PENTING UNTUK IBU & JANIN
            </span>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight">
              Buku Saku Digital Tanda Bahaya Kehamilan (Bisa Bersuara)
            </h2>
            <p className="text-xs sm:text-sm text-red-50 font-semibold leading-relaxed">
              Khusus untuk Ibu yang malas membaca atau ingin informasi praktis, halaman ini bisa membacakan tanda bahaya kehamilan secara langsung dengan suara bahasa Indonesia, lengkap dengan kuis harian interaktif!
            </p>
          </div>
          <Link 
            href="/tanda-bahaya"
            className="w-full md:w-auto bg-white text-red-650 hover:bg-red-50 px-6 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg text-center whitespace-nowrap active:scale-[0.98] transition-transform relative z-10"
          >
            Buka Buku Saku Suara →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <div className="h-10 w-10 md:h-14 md:w-14 bg-blue-50 text-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
               <Droplets className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
               <p className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">HB</p>
               <h4 className="text-sm md:text-xl font-black text-gray-900 truncate">
                 {latestCheckup ? `${latestCheckup.hb} g/dL` : 'Belum Ada'}
               </h4>
               {latestCheckup ? (
                 <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                   latestCheckup.hb_status === 'Normal' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
                 }`}>
                   {latestCheckup.hb_status}
                 </span>
               ) : (
                 <span className="text-[8px] md:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Belum Periksa</span>
               )}
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <div className="h-10 w-10 md:h-14 md:w-14 bg-rose-50 text-rose-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
               <Activity className="text-rose-500 w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
               <p className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Tekanan Darah</p>
               <h4 className="text-sm md:text-xl font-black text-gray-900 truncate">
                 {latestCheckup ? latestCheckup.tekanan_darah : 'Belum Ada'}
               </h4>
               {latestCheckup ? (
                 <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                   latestCheckup.tekanan_darah_status === 'Normal' ? 'text-green-500 bg-green-50' : 
                   latestCheckup.tekanan_darah_status === 'Pantau' ? 'text-yellow-600 bg-yellow-50' : 'text-red-500 bg-red-50'
                 }`}>
                   {latestCheckup.tekanan_darah_status}
                 </span>
               ) : (
                 <span className="text-[8px] md:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Belum Periksa</span>
               )}
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <div className="h-10 w-10 md:h-14 md:w-14 bg-amber-50 text-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
               <TrendingUp className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
               <p className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Fundus (TFU)</p>
               <h4 className="text-sm md:text-xl font-black text-gray-900 truncate">
                 {latestCheckup ? `${latestCheckup.tfu} cm` : 'Belum Ada'}
               </h4>
               {latestCheckup ? (
                 <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                   latestCheckup.tfu_status === 'Sesuai' ? 'text-blue-500 bg-blue-50' : 'text-yellow-600 bg-yellow-50'
                 }`}>
                   {latestCheckup.tfu_status}
                 </span>
               ) : (
                 <span className="text-[8px] md:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Belum Periksa</span>
               )}
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <div className="h-10 w-10 md:h-14 md:w-14 bg-emerald-50 text-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
               <Heart className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
               <p className="text-[8px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">DJJ</p>
               <h4 className="text-sm md:text-xl font-black text-gray-900 truncate">
                 {latestCheckup ? `${latestCheckup.djj} bpm` : 'Belum Ada'}
               </h4>
               {latestCheckup ? (
                 <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                   latestCheckup.djj_status === 'Baik' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
                 }`}>
                   {latestCheckup.djj_status}
                 </span>
               ) : (
                 <span className="text-[8px] md:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Belum Periksa</span>
               )}
            </div>
          </div>
        </div>

        {medicalHistory.length === 0 ? (
          <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-pink-100 flex flex-col items-center justify-center text-center py-16 space-y-4">
            <div className="h-16 w-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 shadow-inner">
              <AlertCircle className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-lg">
              <h4 className="text-lg font-black text-gray-900">Grafik Pemantauan Medis Belum Tersedia</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Grafik pemantauan denyut jantung janin (DJJ), tinggi fundus uteri (TFU), dan berat badan akan otomatis terupdate secara real-time setelah Bidan melakukan pemeriksaan klinis berkala dan menginputkannya.
              </p>
            </div>
          </div>
        ) : (
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-pink-50 flex flex-col justify-between">
            {profile.status === 'melahirkan' ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4 my-auto">
                <span className="text-5xl animate-bounce">👶🎉</span>
                <h4 className="text-xl font-black text-gray-900">Selamat atas Kelahiran Buah Hati Anda!</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                  Status Anda saat ini adalah <strong className="text-pink-500">Sudah Melahirkan</strong>. Pemantauan minum Tablet Tambah Darah (TTD) telah selesai dilakukan dengan penuh dedikasi.
                </p>
                <div className="bg-pink-500 text-white font-extrabold text-xs px-6 py-2.5 rounded-full shadow-lg shadow-pink-100">
                  Total TTD Diminum: {totalTtdTaken} dari target {targetTtd} Tablet
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-pink-500" />
                      Tablet Tambah Darah
                    </h3>
                    <Link href="/dashboard/bumil/ttd" className="text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
                      History Minum TTD →
                    </Link>
                  </div>

                  <div className="bg-pink-50/30 p-4 rounded-2xl border border-pink-100/50 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Konsumsi Anda</p>
                      <p className="text-sm md:text-base font-black text-gray-800">{totalTtdTaken} dari target {targetTtd} Tablet</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Kepatuhan</p>
                      <p className="text-sm md:text-base font-black text-pink-500">{compliancePct}%</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-3 mt-2">
                  {last7DaysList.map((item, idx) => {
                    const isTaken = ttdLogs.some((log: any) => log.bulan_ke === item.pregnancyMonth && log.day === item.pregnancyDay && log.taken);
                    
                    const regDate = new Date(profile.created_at);
                    regDate.setHours(0,0,0,0);
                    const actualDate = new Date(item.actualDate);
                    actualDate.setHours(0,0,0,0);
                    const isBeforeReg = actualDate < regDate;

                    return (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => handleToggleDashboardDay(item)}
                        disabled={isBeforeReg}
                        className={`flex flex-col items-center gap-1.5 md:gap-2 focus:outline-none group active:scale-95 transition-all ${isBeforeReg ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                         <div className={`w-full aspect-square rounded-xl md:rounded-2xl flex items-center justify-center border-2 transition-all ${
                           isBeforeReg
                             ? 'bg-gray-100 border-dashed border-gray-200 text-gray-400'
                             : isTaken 
                               ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100' 
                               : 'bg-white border-gray-100 text-transparent hover:border-pink-300'
                         }`}>
                            <span className="text-[10px] font-black text-white">{isBeforeReg ? '🔒' : '✓'}</span>
                         </div>
                         <div className="text-center">
                           <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase block">{item.dayName}</span>
                           <span className="text-[7px] md:text-[8px] font-bold text-gray-500 block truncate">{item.dateLabel}</span>
                         </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
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

        <PuskesmasList userLat={profile.latitude} userLon={profile.longitude} />

      </div>
    </div>
  );
}
