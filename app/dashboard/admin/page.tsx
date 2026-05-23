"use client";

import MapWrapper from '@/components/MapWrapper';
import {
  AlertCircle,
  Baby,
  Activity,
  AlertTriangle,
  Users,
  CalendarClock,
  Plus,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Heart,
  Stethoscope,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { bumilApi, bidanApi, dokterApi } from '@/lib/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const getWeeksPregnant = (hpl: string): number => {
  if (!hpl) return 0;
  const hplDate = new Date(hpl);
  const today = new Date();
  const remainingDays = Math.ceil(
    (hplDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysPregnant = 280 - remainingDays;
  return Math.max(0, Math.floor(daysPregnant / 7));
};

const getTrimester = (weeks: number): 1 | 2 | 3 => {
  if (weeks <= 13) return 1;
  if (weeks <= 27) return 2;
  return 3;
};

const getDaysUntilHpl = (hpl: string): number => {
  if (!hpl) return 999;
  const hplDate = new Date(hpl);
  hplDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((hplDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatDateFull = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

interface StatItemProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  valueColor: string;
  iconBg: string;
  iconColor: string;
  badge?: { text: string; color: string };
}

function StatItem({ label, value, icon, valueColor, iconBg, iconColor, badge }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`h-9 w-9 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xl font-black ${valueColor} leading-none`}>{value}</span>
          {badge && (
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.text}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bumilData, setBumilData] = useState<any[]>([]);
  const [bidanCount, setBidanCount] = useState<number | null>(null);
  const [dokterCount, setDokterCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!user) {
      router.push('/login');
    } else if (user.role === 'bumil') {
      router.push('/dashboard/bumil');
    } else if (user.role !== 'bidan' && user.role !== 'dokter' && user.role !== 'superadmin') {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [user, router]);

  const fetchData = async () => {
    try {
      const res = await bumilApi.getAll({ limit: 1000 });
      const items = res.data.data || (Array.isArray(res.data) ? res.data : []);
      setBumilData(items);

      if (user?.role === 'superadmin') {
        const [bidanRes, dokterRes] = await Promise.allSettled([
          bidanApi.getAll({ limit: 1000 }),
          dokterApi.getAll({ limit: 1000 }),
        ]);
        if (bidanRes.status === 'fulfilled') {
          const b = bidanRes.value.data;
          setBidanCount((b.data || (Array.isArray(b) ? b : [])).length);
        }
        if (dokterRes.status === 'fulfilled') {
          const d = dokterRes.value.data;
          setDokterCount((d.data || (Array.isArray(d) ? d : [])).length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = bumilData.length;
    const krr = bumilData.filter(b => b.riskStatus === 'KRR').length;
    const krt = bumilData.filter(b => b.riskStatus === 'KRT').length;
    const krst = bumilData.filter(b => b.riskStatus === 'KRST').length;

    const nearHpl = bumilData.filter(b => {
      const days = getDaysUntilHpl(b.hpl);
      return days >= 0 && days <= 14;
    }).length;

    const neverChecked = bumilData.filter(b => b.missedCheckup === true || !b.lastCheckup).length;

    // Trimester distribution
    const t1 = bumilData.filter(b => getTrimester(getWeeksPregnant(b.hpl)) === 1).length;
    const t2 = bumilData.filter(b => getTrimester(getWeeksPregnant(b.hpl)) === 2).length;
    const t3 = bumilData.filter(b => getTrimester(getWeeksPregnant(b.hpl)) === 3).length;

    return { total, krr, krt, krst, nearHpl, neverChecked, t1, t2, t3 };
  }, [bumilData]);

  const trimesterChartData = useMemo(() => [
    { name: 'Trimester 1 (0-13 mgg)', value: stats.t1, color: '#a78bfa' },
    { name: 'Trimester 2 (14-27 mgg)', value: stats.t2, color: '#60a5fa' },
    { name: 'Trimester 3 (28+ mgg)', value: stats.t3, color: '#f472b6' },
  ], [stats]);

  const nearHplList = useMemo(() =>
    bumilData
      .map(b => ({ ...b, daysLeft: getDaysUntilHpl(b.hpl) }))
      .filter(b => b.daysLeft >= 0 && b.daysLeft <= 14)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 8),
    [bumilData]
  );

  const missedCheckupList = useMemo(() =>
    bumilData
      .filter(b => b.missedCheckup === true || !b.lastCheckup)
      .filter(b => b.riskStatus === 'KRT' || b.riskStatus === 'KRST')
      .sort((a, b) => {
        const dateA = a.hpl ? new Date(a.hpl).getTime() : Infinity;
        const dateB = b.hpl ? new Date(b.hpl).getTime() : Infinity;
        return dateA - dateB;
      })
      .slice(0, 6),
    [bumilData]
  );

  const alerts = useMemo(() => {
    const today = new Date();
    const riskBumil = bumilData.filter(b => ['KRT', 'KRST'].includes(b.riskStatus));
    return riskBumil.filter(b => {
      const hplDate = new Date(b.hpl);
      const diffTime = Math.abs(hplDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 || b.missedCheckup;
    }).sort((a, b) => {
      if (a.missedCheckup && !b.missedCheckup) return -1;
      if (!a.missedCheckup && b.missedCheckup) return 1;
      return new Date(a.hpl).getTime() - new Date(b.hpl).getTime();
    });
  }, [bumilData]);

  if (!user || (user.role !== 'bidan' && user.role !== 'dokter' && user.role !== 'superadmin') || loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-pink-500 font-bold text-xl text-center">
          Memuat Dashboard...<br />
          <span className="text-sm font-normal text-gray-400">Menyiapkan data analitik</span>
        </div>
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans pb-24 animate-fade-in-up">
      {/* ── Sticky Navigation Bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 py-3 px-2 md:px-0 backdrop-blur-sm bg-pink-50/50 mb-6">
        <div className="max-w-7xl mx-auto relative z-50">
          <div className="flex items-center justify-between bg-white px-4 py-3 md:px-6 md:py-4 rounded-3xl shadow-sm border border-pink-100/50">
            {/* Left: Logo & Role */}
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 fill-current animate-pulse" />
              <span className="text-lg font-black text-pink-500 tracking-tight animate-fade-in-down">TINAKU</span>
              <span className="text-[9px] font-black bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {user.role === 'superadmin' ? 'Superadmin' : user.role === 'bidan' ? 'Bidan' : 'Dokter'}
              </span>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden md:flex items-center gap-5">
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-1.5 text-pink-500 font-bold hover:opacity-80 transition-all text-xs"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/dashboard/admin/bumil"
                className="flex items-center gap-1.5 text-gray-600 hover:text-pink-500 font-bold transition-all text-xs"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Data Bumil</span>
              </Link>
              <Link
                href="/dashboard/admin/skrining"
                className="flex items-center gap-1.5 text-gray-600 hover:text-pink-500 font-bold transition-all text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Skrining</span>
              </Link>
              {user.role === 'superadmin' && (
                <Link
                  href="/dashboard/admin/faskes"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-pink-500 font-bold transition-all text-xs"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Faskes</span>
                </Link>
              )}
              <Link
                href="/dashboard/admin/export"
                className="flex items-center gap-1.5 text-gray-600 hover:text-pink-500 font-bold transition-all text-xs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Export</span>
              </Link>
            </div>

            {/* Right: User Greeting & Logout */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden lg:block text-right">
                <span className="text-xs font-black text-gray-800 tracking-tight">Halo, {user.name} 👋</span>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 leading-none">
                  {formatDate(today.toISOString())}
                </p>
              </div>
              <div className="h-4 w-px bg-gray-100 hidden lg:block" />
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 font-bold transition-all text-xs shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-500 hover:text-pink-500 transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl border border-pink-100/50 p-4 flex flex-col gap-2 md:hidden animate-fade-in-up">
              <Link
                href="/dashboard/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-pink-500 font-bold p-3 rounded-xl hover:bg-pink-50 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/dashboard/admin/bumil"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-600 font-bold p-3 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Data Bumil</span>
              </Link>
              <Link
                href="/dashboard/admin/skrining"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-600 font-bold p-3 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Skrining</span>
              </Link>
              {user.role === 'superadmin' && (
                <Link
                  href="/dashboard/admin/faskes"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-600 font-bold p-3 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Faskes</span>
                </Link>
              )}
              <Link
                href="/dashboard/admin/export"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-600 font-bold p-3 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Export</span>
              </Link>
              <div className="h-px bg-gray-100 w-full my-2"></div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 text-red-500 font-bold p-3 rounded-xl hover:bg-red-50 transition-colors text-left w-full cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Unified Stats Panel ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-pink-100/50 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
            <div>
              <h2 className="text-xs font-black text-gray-900 tracking-tight">Ringkasan Data Bumil</h2>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Statistik sebaran risiko klinis ibu hamil</p>
            </div>
            <Link
              href="/dashboard/admin/bumil"
              className="text-[10px] font-bold text-pink-500 hover:text-pink-600 transition-colors"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-5">
            {/* Card 1: Total Bumil */}
            <div className="bg-pink-50/20 border border-pink-100/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="h-12 w-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Ibu Hamil</p>
                <span className="text-2xl font-black text-gray-900">{stats.total}</span>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Terdaftar di sistem</p>
              </div>
            </div>

            {/* Card 2: KRR */}
            <div className="bg-green-50/20 border border-green-100/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="h-12 w-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risiko Rendah (KRR)</p>
                <span className="text-2xl font-black text-green-600">{stats.krr}</span>
                <p className="text-[9px] text-green-600/70 font-semibold mt-0.5">Kehamilan normal & aman</p>
              </div>
            </div>

            {/* Card 3: KRT */}
            <div className="bg-yellow-50/20 border border-yellow-100/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="h-12 w-12 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risiko Tinggi (KRT)</p>
                <span className="text-2xl font-black text-yellow-600">{stats.krt}</span>
                <p className="text-[9px] text-yellow-600/70 font-semibold mt-0.5">Perlu pemantauan rutin</p>
              </div>
            </div>

            {/* Card 4: KRST */}
            <div className="bg-red-50/20 border border-red-100/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="h-12 w-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risiko Sgt Tinggi (KRST)</p>
                <span className="text-2xl font-black text-red-600">{stats.krst}</span>
                <p className="text-[9px] text-red-600/70 font-semibold mt-0.5">Prioritas penanganan medis</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main 2-Column Layout: Peta (kiri) + Sidebar (kanan) ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-17.5rem)] h-auto">

          {/* Kiri: Peta (full height) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-pink-100/50 flex flex-col h-[450px] lg:h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0">
              <div>
                <h2 className="text-sm font-black text-gray-900">Peta Sebaran Ibu Hamil</h2>
                <p className="text-[10px] text-gray-400 font-semibold">{stats.total} ibu hamil terpetakan</p>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] font-bold text-gray-500">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />KRR ({stats.krr})</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />KRT ({stats.krt})</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />KRST ({stats.krst})</div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-b-3xl">
              <MapWrapper data={bumilData} />
            </div>
          </div>

          {/* Kanan: Sidebar Scrollable */}
          <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-3.5 custom-scrollbar h-auto lg:h-full lg:max-h-full">

            {/* Sistem Peringatan */}
            <div className="bg-white rounded-3xl shadow-sm border border-red-50 shrink-0 h-[217px] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">Sistem Peringatan</p>
                    <p className="text-[9px] text-gray-400 font-semibold leading-none mt-0.5">KRT/KRST dekat HPL / terlambat periksa</p>
                  </div>
                </div>
                {alerts.length > 0 && (
                  <span className="text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse shrink-0">
                    {alerts.length}
                  </span>
                )}
              </div>
              <div className="py-4 pl-4 pr-3 space-y-2.5 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map(alert => (
                    <Link
                      key={alert.id}
                      href={`/dashboard/admin/bumil/${alert.id}/checkup?tab=histori`}
                      className="flex items-center justify-between p-2.5 rounded-2xl border border-red-100/70 bg-red-50/20 hover:bg-red-50 hover:border-red-200 transition-all group shrink-0"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-800 truncate group-hover:text-red-700">{alert.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${alert.riskStatus === 'KRST' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {alert.riskStatus}
                          </span>
                          <span className="text-[9px] text-gray-400">HPL: {formatDate(alert.hpl)}</span>
                        </div>
                        {alert.missedCheckup && (
                          <p className="text-[9px] text-red-600 font-bold mt-0.5 flex items-center gap-1">
                            <CalendarClock className="w-3 h-3 shrink-0" /> Terlewat jadwal
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-400 shrink-0 ml-2" />
                    </Link>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-4">
                    <CheckCircle2 className="w-8 h-8 mb-1.5" />
                    <p className="text-[10px] text-gray-400 font-semibold">Tidak ada peringatan aktif</p>
                  </div>
                )}
              </div>
            </div>

            {/* HPL Countdown */}
            {nearHplList.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-blue-50 shrink-0 h-[217px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Baby className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">Mendekati Persalinan</p>
                      <p className="text-[9px] text-gray-400 font-semibold leading-none mt-0.5">{nearHplList.length} ibu dalam 14 hari</p>
                    </div>
                  </div>
                  <Link href="/dashboard/admin/bumil" className="text-[9px] font-bold text-blue-500 hover:text-blue-600 transition-colors shrink-0">
                    Semua →
                  </Link>
                </div>
                <div className="py-4 pl-4 pr-3 space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
                  {nearHplList.map(b => {
                    const isUrgent = b.daysLeft <= 3;
                    const isToday = b.daysLeft === 0;
                    return (
                      <Link
                        key={b.id}
                        href={`/dashboard/admin/bumil/${b.id}`}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-blue-100/60 bg-blue-50/20 hover:bg-blue-50/60 hover:border-blue-200 transition-all group"
                      >
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 font-black text-[10px] ${isUrgent ? 'bg-red-500 text-white shadow-sm shadow-red-200' : 'bg-blue-100 text-blue-700'}`}>
                          {isToday ? '🤱' : `${b.daysLeft}h`}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-gray-800 truncate group-hover:text-blue-700">{b.name}</p>
                          <p className="text-[9px] text-gray-400">{formatDate(b.hpl)}</p>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 ${b.riskStatus === 'KRST' ? 'bg-red-100 text-red-700' : b.riskStatus === 'KRT' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {b.riskStatus}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Belum Diperiksa */}
            {missedCheckupList.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-orange-50 shrink-0 h-[217px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <XCircle className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">Belum Diperiksa</p>
                      <p className="text-[9px] text-gray-400 font-semibold leading-none mt-0.5">KRT/KRST tanpa pemeriksaan</p>
                    </div>
                  </div>
                  <Link href="/dashboard/admin/bumil" className="text-[9px] font-bold text-orange-500 hover:text-orange-600 transition-colors shrink-0">
                    Semua →
                  </Link>
                </div>
                <div className="py-4 pl-4 pr-3 space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
                  {missedCheckupList.map(b => (
                    <Link
                      key={b.id}
                      href={`/dashboard/admin/bumil/${b.id}/checkup`}
                      className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-orange-100/60 bg-orange-50/20 hover:bg-orange-50/60 transition-all group"
                    >
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 font-black text-[9px] uppercase ${b.riskStatus === 'KRST' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                        {b.riskStatus}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-gray-800 truncate group-hover:text-orange-700">{b.name}</p>
                        <p className="text-[9px] text-gray-400">HPL: {formatDate(b.hpl)}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

