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
  TrendingUp
} from 'lucide-react';
import { bumilApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TtdMonitoringPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingMetadata, setSavingMetadata] = useState(false);

  // Form states
  const [activeMonth, setActiveMonth] = useState(1);
  const [pendampingName, setPendampingName] = useState('');
  const [pendampingRelation, setPendampingRelation] = useState('');
  const [monthYears, setMonthYears] = useState<{ [key: number]: string }>({});
  const [logs, setLogs] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'bumil') {
      // If Bidan access this page, redirect or handle, but let's assume it's for bumil
      // We will also allow bidan to view this page if we pass an ID in URL, but right now this is for the logged in bumil
      router.push('/dashboard/bidan');
    } else {
      fetchData();
    }
  }, [user, router]);

  const fetchData = async () => {
    try {
      // 1. Fetch bumil profile
      const profileRes = await bumilApi.getMe();
      const bumilData = profileRes.data;
      setProfile(bumilData);

      // 2. Fetch TTD data
      const ttdRes = await bumilApi.getTtd(bumilData.id);
      const { metadata, logs: ttdLogs } = ttdRes.data;

      setPendampingName(metadata.pendamping_name || '');
      setRelationPreset(metadata.pendamping_relation || '');

      // Parse logs into quick lookup map: "month_ke-day" -> true
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

      // Auto-select month of pregnancy based on HPL (approx 280 days total pregnancy)
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

  // Save Husband/Companion metadata
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
    } catch (error) {
      console.error('Failed to save metadata:', error);
      toast.error('Gagal menyimpan data pendamping');
    } finally {
      setSavingMetadata(false);
    }
  };

  // Toggle checkbox intake log
  const handleToggleDay = async (monthKe: number, day: number) => {
    if (!profile) return;

    // Check if the day is before registration date
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

    // Optimistic UI update
    setLogs(prev => ({
      ...prev,
      [key]: isTaking
    }));

    try {
      const monthYearStr = monthYears[monthKe] || '';
      await bumilApi.toggleTtdLog(profile.id, {
        bulan_ke: monthKe,
        bulan_tahun: monthYearStr,
        day: day,
        taken: isTaking
      });
      toast.success(`Hari ke-${day} Bulan ke-${monthKe} berhasil diperbarui!`, { id: 'ttd-toast' });
    } catch (error) {
      // Revert UI on failure
      setLogs(prev => ({
        ...prev,
        [key]: wasTaken
      }));
      toast.error('Gagal mengubah status minum TTD');
    }
  };

  // Handle month/year text input changes and autosave
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
      // To save the month year string, we trigger a toggle call on a dummy day (e.g. day 0) or just update metadata.
      // In our toggle endpoint, any day toggle also updates the 'bulan_tahun' for that month_ke.
      // So we can send a toggled taken status for day 1 (or just let the user toggle normally and save the string).
      // Let's call the API to save the month year by toggling day 1 with its current state.
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

  // Dynamic Target Calculation
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

  // Stats calculation
  const targetTtd = getDynamicTarget(profile?.created_at, profile?.hpl);
  const totalTaken = Object.values(logs).filter(Boolean).length;
  const compliancePercentage = Math.min(100, Math.round((totalTaken / targetTtd) * 100)); // Target dynamically calculated based on registration date

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
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard/bumil" className="flex items-center gap-2 text-pink-500 font-bold hover:opacity-80 transition-all text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
            <span className="text-xs font-bold text-gray-500">Sinkronisasi Cloud Aktif</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 md:p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Calendar className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-4 max-w-2xl">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold tracking-widest uppercase">Buku KIA Halaman 7</span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Jangan Lupa Minum TTD / MMS</h1>
            <p className="text-pink-100 text-sm md:text-base leading-relaxed">
              Untuk mencegah anemia (kekurangan darah), Tablet Tambah Darah (TTD) wajib diminum setiap hari selama kehamilan. Pantau asupan harian Anda bersama suami/pendamping secara disiplin di sini.
            </p>
          </div>
        </div>

        {/* Informational Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-pink-100/50 flex gap-4">
            <div className="h-10 w-10 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Tips Minum Terbaik</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Minumlah TTD pada **malam hari sebelum tidur** untuk meminimalisir rasa mual atau pusing setelah konsumsi obat.
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
                **Jangan** minum TTD bersama kopi, teh, susu, atau obat maag karena dapat mengikat zat besi sehingga tidak diserap tubuh.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">Total Tablet Diminum</span>
              <h3 className="text-2xl font-black text-gray-900">{totalTaken} <span className="text-xs font-normal text-gray-400">Tablet</span></h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="h-12 w-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">Tingkat Kepatuhan (Target {targetTtd})</span>
              <h3 className="text-2xl font-black text-gray-900">{compliancePercentage}%</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${compliancePercentage >= 80 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">Status Pemantauan</span>
              <h3 className={`text-lg font-black ${compliancePercentage >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                {compliancePercentage >= 80 ? 'Kepatuhan Sangat Baik' : 'Tingkatkan Konsumsi'}
              </h3>
            </div>
          </div>
        </div>

        {/* Companion / Husband Input Form */}
        <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-pink-50">
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
              <div className="flex gap-2 flex-wrap">
                {['Suami', 'Ibu', 'Kakak', 'Bidan'].map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setRelationPreset(rel)}
                    className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${
                      pendampingRelation === rel
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
                <input 
                  type="text" 
                  value={['Suami', 'Ibu', 'Kakak', 'Bidan'].includes(pendampingRelation) ? '' : pendampingRelation}
                  onChange={(e) => setPendampingRelation(e.target.value)}
                  placeholder="Lainnya..."
                  className="w-24 px-3 py-1.5 text-xs rounded-full border border-gray-150 outline-none focus:border-pink-300"
                />
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
        </div>

        {/* Month Selector & Interactive Monthly Grid */}
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
          <div className="bg-white rounded-[40px] border border-pink-50 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-50">
              <div>
                <h3 className="text-xl font-black text-gray-900">Kartu Pemantauan Bulanan</h3>
                <p className="text-xs text-gray-400">Silakan pilih bulan kehamilan dan centang hari saat Anda meminum TTD.</p>
              </div>
              
              {/* Navigation Slider */}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left side: Month & Info */}
              <div className="space-y-6">
                <div className="p-6 bg-pink-50/30 rounded-3xl border border-pink-100/50 space-y-4">
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest block">Pengaturan Bulan</span>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 block">Bulan / Tahun Kalender</label>
                    <input
                      type="text"
                      value={monthYears[activeMonth] || ''}
                      onChange={(e) => handleMonthYearChange(activeMonth, e.target.value)}
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

              {/* Right side: 31-Day Checkbox Calendar Grid */}
              <div className="md:col-span-2 space-y-4">
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
