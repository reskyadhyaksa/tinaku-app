"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Heart, 
  User, 
  Users, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Coffee,
  HelpCircle,
  TrendingUp,
  Home,
  Activity,
  BookOpen,
  Menu,
  X,
  Edit2
} from 'lucide-react';
import { bumilApi } from '@/lib/api';
import toast from 'react-hot-toast';

const getSmartGeneratedMonthYear = (
  targetMonth: number,
  currentMonthYears: { [key: number]: string },
  currentLogs: { [key: string]: boolean }
): string | null => {
  const prevMonth = targetMonth - 1;
  if (prevMonth >= 1) {
    const prevVal = currentMonthYears[prevMonth];
    if (prevVal) {
      // Check if they ever checked a day in that month
      const hasChecked = Object.keys(currentLogs).some(key => {
        const parts = key.split('-');
        return parts.length === 2 && parseInt(parts[0], 10) === prevMonth && currentLogs[key] === true;
      });

      if (hasChecked) {
        const parts = prevVal.split('/');
        if (parts.length === 2) {
          const mm = parseInt(parts[0], 10);
          const yyyy = parseInt(parts[1], 10);
          if (!isNaN(mm) && !isNaN(yyyy)) {
            let newMm = mm + 1;
            let newYyyy = yyyy;
            if (newMm > 12) {
              newMm = 1;
              newYyyy += 1;
            }
            return `${String(newMm).padStart(2, '0')}/${newYyyy}`;
          }
        }
      }
    }
  }
  return null;
};

export default function TtdMonitoringPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingMetadata, setSavingMetadata] = useState(false);

  const [activeMonth, setActiveMonth] = useState(1);
  const [pendampingName, setPendampingName] = useState('');
  const [pendampingRelation, setPendampingRelation] = useState('');
  const [isEditingPendamping, setIsEditingPendamping] = useState(false);
  const [monthYears, setMonthYears] = useState<{ [key: number]: string }>({});
  const [logs, setLogs] = useState<{ [key: string]: boolean }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobile Tips Carousel States & Handlers
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      setActiveTipIndex(prev => Math.min(prev + 1, 1));
    } else if (isRightSwipe) {
      setActiveTipIndex(prev => Math.max(prev - 1, 0));
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'bumil') {

      router.push('/dashboard/admin');
    } else {
      fetchData();
    }
  }, [user, router]);

  const fetchData = async () => {
    try {
      
      const profileRes = await bumilApi.getMe();
      const bumilData = profileRes.data;
      setProfile(bumilData);

      const ttdRes = await bumilApi.getTtd(bumilData.id);
      const { metadata, logs: ttdLogs } = ttdRes.data;

      setPendampingName(metadata.pendamping_name || '');
      setRelationPreset(metadata.pendamping_relation || '');

      const hasSavedPendamping = !!metadata.pendamping_name && !!metadata.pendamping_relation;
      setIsEditingPendamping(!hasSavedPendamping);

      const logsMap: { [key: string]: boolean } = {};
      const monthYearsMap: { [key: number]: string } = {};

      ttdLogs.forEach((log: any) => {
        if (log.taken) {
          logsMap[`${log.bulan_ke}-${log.day}`] = true;
        }
        if (log.bulan_tahun) {
          monthYearsMap[log.bulan_ke] = log.bulan_tahun;
        }
      });

      setLogs(logsMap);
      setMonthYears(monthYearsMap);

      if (bumilData.hpl) {
        const hplDate = new Date(bumilData.hpl);
        const today = new Date();
        const diffMs = hplDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const daysPregnant = 280 - diffDays;
        const calculatedMonth = Math.max(1, Math.min(10, Math.ceil(daysPregnant / 30)));
        setActiveMonth(calculatedMonth);
      }
    } catch (error) {
      console.error('Failed to fetch TTD data:', error);
      toast.error('Gagal memuat data pemantauan TTD');
    } finally {
      setLoading(false);
    }
  };

  const setRelationPreset = (val: string) => {
    setPendampingRelation(val);
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingMetadata(true);
    try {
      await bumilApi.updateTtdMetadata(profile.id, {
        pendamping_name: pendampingName,
        pendamping_relation: pendampingRelation
      });
      toast.success('Data pendamping berhasil disimpan');
      setIsEditingPendamping(false);
    } catch (error) {
      console.error('Failed to save metadata:', error);
      toast.error('Gagal menyimpan data pendamping');
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleToggleDay = async (monthKe: number, day: number) => {
    if (!profile) return;

    if (profile.hpl && profile.created_at) {
      const hplDate = new Date(profile.hpl);
      const daysPregnant = (monthKe - 1) * 30 + day;
      const diffDays = 280 - daysPregnant;
      const actualDate = new Date(hplDate.getTime() - diffDays * 24 * 60 * 60 * 1000);
      actualDate.setHours(0,0,0,0);

      const regDate = new Date(profile.created_at);
      regDate.setHours(0,0,0,0);

      if (actualDate < regDate) {
        toast.error('Hari ini berada sebelum tanggal pendaftaran pertama kali Anda melapor.');
        return;
      }
    }

    const key = `${monthKe}-${day}`;
    const wasTaken = !!logs[key];
    const isTaking = !wasTaken;

    // Check if monthYears[monthKe] is empty, if so, automatically generate it under smart conditions
    let monthYearStr = monthYears[monthKe] || '';
    let autoFilled = false;
    if (!monthYearStr) {
      const generated = getSmartGeneratedMonthYear(monthKe, monthYears, logs);
      if (generated) {
        monthYearStr = generated;
        autoFilled = true;
        setMonthYears(prev => ({
          ...prev,
          [monthKe]: monthYearStr
        }));
      }
    }

    setLogs(prev => ({
      ...prev,
      [key]: isTaking
    }));

    try {
      await bumilApi.toggleTtdLog(profile.id, {
        bulan_ke: monthKe,
        bulan_tahun: monthYearStr,
        day: day,
        taken: isTaking
      });
      toast.success(`Hari ke-${day} Bulan ke-${monthKe} berhasil diperbarui!`, { id: 'ttd-toast' });
      if (autoFilled) {
        toast.success(`Otomatis mengisi Bulan/Tahun: ${monthYearStr}`, { id: 'auto-fill-toast' });
      }
    } catch (error) {
      setLogs(prev => ({
        ...prev,
        [key]: wasTaken
      }));
      toast.error('Gagal mengubah status minum TTD');
    }
  };

  const handleMonthYearChange = (monthKe: number, val: string) => {
    setMonthYears(prev => ({
      ...prev,
      [monthKe]: val
    }));
  };

  const saveMonthYear = async (monthKe: number) => {
    if (!profile) return;
    const monthYearStr = monthYears[monthKe] || '';
    try {

      const currentDay1State = !!logs[`${monthKe}-1`];
      await bumilApi.toggleTtdLog(profile.id, {
        bulan_ke: monthKe,
        bulan_tahun: monthYearStr,
        day: 1,
        taken: currentDay1State
      });
      toast.success(`Bulan/Tahun untuk Bulan ke-${monthKe} disimpan!`);
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan Bulan/Tahun');
    }
  };

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

  const targetTtd = getDynamicTarget(profile?.created_at, profile?.hpl);
  const totalTaken = Object.values(logs).filter(Boolean).length;
  const compliancePercentage = Math.min(100, Math.round((totalTaken / targetTtd) * 100)); 

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-pink-500 font-bold text-xl text-center">
          Menyiapkan Kartu Pemantauan TTD Anda...<br/>
          <span className="text-sm font-normal text-gray-400 italic">Buku KIA Halaman 7</span>
        </div>
      </div>
    );
  }

  const months = Array.from({ length: 10 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans pb-24 animate-fade-in-up">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="relative z-50">
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-3xl shadow-sm border border-pink-100/50">
            {/* Mobile View: TINAKU logo + Hamburger */}
            <div className="flex md:hidden items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500" />
                <span className="text-xl font-black text-pink-500 tracking-tight">TINAKU</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-pink-500 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-wrap items-center gap-6">
              <Link href="/dashboard/bumil" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-bold transition-all text-sm">
                <Home className="w-4 h-4 text-pink-400" />
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
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-ping animate-duration-1000"></div>
              <span className="text-[10px] font-bold text-gray-500">Sinkronisasi Cloud Aktif</span>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl border border-pink-100/50 p-4 flex flex-col gap-2 md:hidden animate-fade-in-up">
              <Link href="/dashboard/bumil" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-600 font-bold p-3 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-colors">
                <Home className="w-5 h-5 text-pink-400" />
                <span>Dashboard</span>
              </Link>
              <Link href="/fitur" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-600 font-bold p-3 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-colors">
                <Activity className="w-5 h-5 text-pink-400" />
                <span>Fitur Aplikasi</span>
              </Link>
              <Link href="/edukasi" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-600 font-bold p-3 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-colors">
                <BookOpen className="w-5 h-5 text-pink-400" />
                <span>Edukasi KIA</span>
              </Link>
              <div className="h-px bg-gray-100 w-full my-2"></div>
              <div className="flex items-center gap-3 p-3 rounded-xl">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-ping animate-duration-1000"></div>
                <span className="text-[10px] font-bold text-gray-500">Sinkronisasi Cloud Aktif</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-4 md:p-8 rounded-3xl md:rounded-[40px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Calendar className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-2 md:space-y-4 max-w-2xl">
            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-extrabold tracking-widest uppercase">Buku KIA Halaman 7</span>
            <h1 className="text-lg md:text-4xl font-black tracking-tight">Jangan Lupa Minum TTD / MMS</h1>
            <p className="hidden md:block text-pink-100 text-sm md:text-base leading-relaxed">
              Untuk mencegah anemia (kekurangan darah), Tablet Tambah Darah (TTD) wajib diminum setiap hari selama kehamilan. Pantau asupan harian Anda bersama suami/pendamping secara disiplin di sini.
            </p>
            <p className="block md:hidden text-pink-100 text-xs leading-normal">
              Tablet Tambah Darah (TTD) wajib diminum setiap hari untuk mencegah anemia selama kehamilan. Pantau asupan harian bersama pendamping di sini.
            </p>
          </div>
        </div>

        {/* Mobile Swipeable Carousel */}
        <div 
          className="block md:hidden relative overflow-hidden bg-white rounded-3xl border border-pink-100/50 p-5 min-h-[140px] transition-all duration-300 select-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-out" 
            style={{ transform: `translateX(-${activeTipIndex * 100}%)` }}
          >
            {/* Slide 1: Tips Minum Terbaik */}
            <div className="w-full shrink-0 flex gap-4 pr-4">
              <div className="h-10 w-10 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Tips Minum Terbaik</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Minumlah TTD pada <span className="font-bold">malam hari sebelum tidur</span> untuk meminimalisir rasa mual atau pusing setelah konsumsi obat.
                </p>
              </div>
            </div>
            
            {/* Slide 2: Pantangan Konsumsi */}
            <div className="w-full shrink-0 flex gap-4 pl-4 pr-4">
              <div className="h-10 w-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-red-700 uppercase tracking-wider">⚠️ Pantangan Konsumsi</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  <span className="font-bold">Jangan</span> minum TTD bersama kopi, teh, susu, atau obat maag karena dapat mengikat zat besi sehingga tidak diserap tubuh.
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation Indicators */}
          <div className="flex justify-center items-center gap-1.5 mt-4">
            <button
              onClick={() => setActiveTipIndex(0)}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeTipIndex === 0 ? 'w-5 bg-pink-500' : 'w-1.5 bg-gray-200'}`}
              aria-label="Tips Minum Terbaik"
            />
            <button
              onClick={() => setActiveTipIndex(1)}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeTipIndex === 1 ? 'w-5 bg-pink-500' : 'w-1.5 bg-gray-200'}`}
              aria-label="Pantangan Konsumsi"
            />
          </div>
        </div>

        {/* Desktop View: Keep grid layout */}
        <div className="hidden md:grid grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-pink-100/50 flex gap-4">
            <div className="h-10 w-10 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Tips Minum Terbaik</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Minumlah TTD pada <span className="font-bold">malam hari sebelum tidur</span> untuk meminimalisir rasa mual atau pusing setelah konsumsi obat.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-3xl border border-pink-100/50 flex gap-4">
            <div className="h-10 w-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-red-700 uppercase tracking-wider">⚠️ Pantangan Konsumsi</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                <span className="font-bold">Jangan</span> minum TTD bersama kopi, teh, susu, atau obat maag karena dapat mengikat zat besi sehingga tidak diserap tubuh.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop View: Separate spacious widgets */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Total TTD</span>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalTaken} <span className="text-sm font-normal text-gray-400">Tablet</span></h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Kepatuhan</span>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                {compliancePercentage}%
                <span className="text-xs font-bold text-gray-400 ml-2">Target {targetTtd}</span>
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
              compliancePercentage >= 80 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
            }`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Status</span>
              <h3 className={`text-xl font-black mt-0.5 ${
                compliancePercentage >= 80 ? 'text-green-600' : 'text-yellow-600'
              }`}>{compliancePercentage >= 80 ? 'Sangat Baik' : 'Tingkatkan'}</h3>
            </div>
          </div>
        </div>

        {/* Mobile View: Sleek compact horizontal stats card */}
        <div className="md:hidden bg-white p-4 rounded-3xl shadow-sm border border-pink-100">
          <div className="grid grid-cols-3 divide-x divide-pink-100/50">
            {/* Stat 1: Total Tablet */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="h-9 w-9 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center shrink-0 mb-1.5">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block leading-tight">Total TTD</span>
              <h3 className="text-sm font-black text-gray-900 mt-1 leading-none">
                {totalTaken} <span className="text-[9px] font-normal text-gray-400 block">Tablet</span>
              </h3>
            </div>

            {/* Stat 2: Kepatuhan */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="h-9 w-9 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0 mb-1.5">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block leading-tight">Kepatuhan</span>
              <h3 className="text-sm font-black text-gray-900 mt-1 leading-none">
                {compliancePercentage}%
                <span className="text-[8px] font-bold text-gray-400 block mt-0.5">Target {targetTtd}</span>
              </h3>
            </div>

            {/* Stat 3: Status Pemantauan */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 mb-1.5 ${
                compliancePercentage >= 80 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
              }`}>
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block leading-tight">Status</span>
              <span className={`text-[10px] font-black leading-tight mt-1 block truncate max-w-full ${
                compliancePercentage >= 80 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {compliancePercentage >= 80 ? 'Sangat Baik' : 'Tingkatkan'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-pink-50 relative overflow-hidden">
          {!isEditingPendamping ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Pendamping Ibu Hamil</span>
                  <h3 className="text-xl font-black text-gray-900 mt-0.5">{pendampingName}</h3>
                  <span className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-600 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full border border-pink-100/50 mt-1.5">
                    <Heart className="w-3 h-3 fill-current text-pink-500" /> {pendampingRelation}
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsEditingPendamping(true)}
                className="absolute top-3 right-3 md:top-5 md:right-5 flex items-center gap-1 text-gray-400 hover:text-pink-600 hover:bg-pink-50/50 py-1 px-2 md:py-1.5 md:px-2.5 rounded-xl transition-all text-[11px] md:text-xs font-bold active:scale-95 shrink-0"
              >
                <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400 group-hover:text-pink-600" />
                <span>Ubah</span>
              </button>
            </div>
          ) : (
            <>
              {/* If there is a saved pendamping, show a cancel close button */}
              {(pendampingName || pendampingRelation) && (
                <button
                  type="button"
                  onClick={() => {
                    fetchData();
                    setIsEditingPendamping(false);
                  }}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Data Pendamping Ibu</h3>
                  <p className="text-xs text-gray-400">Siapa yang mengingatkan/memantau Ibu meminum TTD?</p>
                </div>
              </div>

              <form onSubmit={handleSaveMetadata} className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">Nama Pendamping</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={pendampingName} 
                      onChange={(e) => setPendampingName(e.target.value)} 
                      required 
                      className="w-full px-4 py-3.5 pl-10 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" 
                      placeholder="Nama suami / keluarga" 
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">Hubungan dengan Bumil</label>
                  <div className="relative">
                    <select
                      value={pendampingRelation}
                      onChange={(e) => setPendampingRelation(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium cursor-pointer appearance-none"
                    >
                      <option value="">Pilih Hubungan</option>
                      <option value="Suami">Suami</option>
                      <option value="Ibu">Ibu</option>
                      <option value="Bapak">Bapak</option>
                      <option value="Mertua">Mertua</option>
                      <option value="Kakak">Kakak / Adik</option>
                      <option value="Keluarga Lainnya">Keluarga Lainnya</option>
                      <option value="Bidan">Bidan / Nakes</option>
                      {pendampingRelation && !['Suami', 'Ibu', 'Bapak', 'Mertua', 'Kakak', 'Keluarga Lainnya', 'Bidan'].includes(pendampingRelation) && (
                        <option value={pendampingRelation}>{pendampingRelation}</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingMetadata}
                  className="w-full bg-gray-900 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl hover:bg-pink-600 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingMetadata ? 'Menyimpan...' : 'Simpan Pendamping'}
                </button>
              </form>
            </>
          )}
        </div>

        {profile.status === 'melahirkan' ? (
          <div className="bg-white rounded-[40px] border border-pink-50 shadow-sm p-8 text-center flex flex-col items-center justify-center space-y-6">
            <span className="text-7xl animate-bounce">👶🎉🥳</span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Selamat atas Kelahiran Buah Hati Anda!</h2>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
              Status Kehamilan Anda saat ini tercatat sebagai <strong className="text-pink-500">Sudah Melahirkan</strong>. Pemantauan minum Tablet Tambah Darah (TTD) selama masa kehamilan telah resmi diselesaikan. Terima kasih atas disiplin dan perjuangan Anda untuk masa depan sehat si kecil!
            </p>
            <div className="bg-pink-50/50 p-6 rounded-3xl border border-pink-100/50 flex flex-col sm:flex-row gap-6 sm:gap-12 justify-center mx-auto">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Total TTD Diminum</span>
                <span className="text-3xl font-black text-pink-500">{totalTaken} <span className="text-sm font-normal text-gray-500">Tablet</span></span>
              </div>
              <div className="hidden sm:block border-l border-pink-200"></div>
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tingkat Kepatuhan (Target {targetTtd})</span>
                <span className="text-3xl font-black text-green-600">{compliancePercentage}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl md:rounded-[40px] border border-pink-50 shadow-sm p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 md:pb-6 border-b border-gray-50">
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-900">Kartu Pemantauan Bulanan</h3>
                <p className="text-xs text-gray-400 mt-0.5 hidden md:block">
                  Silakan pilih bulan kehamilan dan centang hari saat Anda meminum TTD.
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 block md:hidden">
                  Pilih bulan kehamilan & centang hari minum TTD.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={activeMonth === 1}
                  onClick={() => setActiveMonth(prev => prev - 1)}
                  className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold disabled:opacity-30 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
                >
                  ←
                </button>
                
                <div className="bg-pink-50 border border-pink-100 text-pink-600 font-black px-5 py-2 rounded-xl text-sm min-w-36 text-center">
                  Bulan ke-{activeMonth}
                </div>

                <button
                  type="button"
                  disabled={activeMonth === 10}
                  onClick={() => setActiveMonth(prev => prev + 1)}
                  className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold disabled:opacity-30 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              
              {/* Mobile View: Sleek Integrated Row */}
              <div className="block md:hidden bg-pink-50/20 p-3.5 rounded-2xl border border-pink-100/30 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column: Month/Year Input */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-pink-500 uppercase tracking-wider block">Bulan/Tahun</label>
                    <input
                      type="text"
                      value={monthYears[activeMonth] || ''}
                      onChange={(e) => handleMonthYearChange(activeMonth, e.target.value)}
                      onFocus={() => {
                        if (!monthYears[activeMonth]) {
                          const generated = getSmartGeneratedMonthYear(activeMonth, monthYears, logs);
                          if (generated) {
                            handleMonthYearChange(activeMonth, generated);
                          }
                        }
                      }}
                      onBlur={() => saveMonthYear(activeMonth)}
                      placeholder="MM/YYYY"
                      className="w-full px-2.5 py-1.5 border border-gray-150 bg-white rounded-lg outline-none focus:border-pink-300 font-extrabold text-gray-700 text-xs transition-all text-center"
                    />
                  </div>
                  
                  {/* Right Column: Progress */}
                  <div className="space-y-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Progres</span>
                      <span className="text-xs font-black text-gray-900">
                        {days.filter(d => logs[`${activeMonth}-${d}`]).length}/31 <span className="text-[9px] font-normal text-gray-400">Hari</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-1">
                      <div 
                        className="bg-pink-500 h-full transition-all duration-500"
                        style={{ width: `${(days.filter(d => logs[`${activeMonth}-${d}`]).length / 31) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop View: Keep original full-size sidebar */}
              <div className="hidden md:block space-y-6">
                <div className="p-6 bg-pink-50/30 rounded-3xl border border-pink-100/50 space-y-4">
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest block">Pengaturan Bulan</span>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 block">Bulan / Tahun Kalender</label>
                    <input
                      type="text"
                      value={monthYears[activeMonth] || ''}
                      onChange={(e) => handleMonthYearChange(activeMonth, e.target.value)}
                      onFocus={() => {
                        if (!monthYears[activeMonth]) {
                          const generated = getSmartGeneratedMonthYear(activeMonth, monthYears, logs);
                          if (generated) {
                            handleMonthYearChange(activeMonth, generated);
                          }
                        }
                      }}
                      onBlur={() => saveMonthYear(activeMonth)}
                      placeholder="Contoh: 05/2026"
                      className="w-full px-4 py-3 border border-gray-150 bg-white rounded-2xl outline-none focus:border-pink-300 font-bold text-gray-700 text-sm transition-all"
                    />
                    <span className="text-[10px] text-gray-400 block italic leading-normal">
                      *Masukkan bulan/tahun (MM/YYYY) kalender nyata lalu klik di luar untuk menyimpan.
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Progres Bulan Ini</span>
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-3xl font-black text-gray-900">
                      {days.filter(d => logs[`${activeMonth}-${d}`]).length}
                    </h4>
                    <span className="text-xs text-gray-400 font-bold">dari 31 Hari</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-pink-500 h-full transition-all duration-500"
                      style={{ width: `${(days.filter(d => logs[`${activeMonth}-${d}`]).length / 31) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Lembar Kalender Harian</span>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">Ketuk untuk Mengisi</span>
                </div>

                <div className="grid grid-cols-7 gap-2 md:gap-3">
                  {days.map(d => {
                    const key = `${activeMonth}-${d}`;
                    const isTaken = !!logs[key];

                    const isBeforeReg = (() => {
                      if (!profile.hpl || !profile.created_at) return false;
                      const hplDate = new Date(profile.hpl);
                      const daysPregnant = (activeMonth - 1) * 30 + d;
                      const diffDays = 280 - daysPregnant;
                      const actualDate = new Date(hplDate.getTime() - diffDays * 24 * 60 * 60 * 1000);
                      actualDate.setHours(0,0,0,0);
                      const regDate = new Date(profile.created_at);
                      regDate.setHours(0,0,0,0);
                      return actualDate < regDate;
                    })();

                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleToggleDay(activeMonth, d)}
                        disabled={isBeforeReg}
                        className={`aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative active:scale-90 ${
                          isBeforeReg
                            ? 'bg-gray-100 border-dashed border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            : isTaken
                              ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100'
                              : 'bg-white border-gray-100 text-gray-400 hover:border-pink-300 hover:text-pink-500'
                        }`}
                      >
                        <span className="text-xs font-black">{isBeforeReg ? '🔒' : d}</span>
                        {isTaken && (
                          <span className="text-[8px] absolute bottom-1 font-black leading-none">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
