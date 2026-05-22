"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Calendar,
  Coffee,
  TrendingUp,
  Activity,
  User
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

  const minggu = Math.floor(diffDays / 7);
  const days = diffDays % 7;

  if (minggu >= 42) return "Sudah Waktunya Melahirkan";

  return `${minggu} Minggu ${days} Hari`;
};

export default function AdminTtdMonitoringPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeMonth, setActiveMonth] = useState(1);
  const [pendampingName, setPendampingName] = useState('');
  const [pendampingRelation, setPendampingRelation] = useState('');
  const [monthYears, setMonthYears] = useState<{ [key: number]: string }>({});
  const [logs, setLogs] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'bidan' && user.role !== 'dokter' && user.role !== 'superadmin') {
      router.push('/dashboard/bumil');
    } else {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileRes = await bumilApi.getById(id as string);
      const bumilData = profileRes.data;
      setProfile(bumilData);

      const ttdRes = await bumilApi.getTtd(id as string);
      const { metadata, logs: ttdLogs } = ttdRes.data;

      setPendampingName(metadata.pendamping_name || '-');
      setPendampingRelation(metadata.pendamping_relation || '-');

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
  const compliancePercentage = Math.min(100, Math.round((totalTaken / targetTtd) * 100)) || 0;

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-pink-500 font-bold text-xl text-center">
          Mengambil data kepatuhan TTD ibu hamil...<br />
          <span className="text-sm font-normal text-gray-400 italic">Harap tunggu sebentar</span>
        </div>
      </div>
    );
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header & Back Action */}
        <div className="bg-white p-6 md:px-8 md:py-6 rounded-3xl shadow-sm border border-pink-100 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
              <button
                onClick={() => router.push('/dashboard/admin/bumil')}
                className="h-12 w-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm shrink-0 self-start md:self-auto"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-full">
                <div className="flex flex-col gap-1.5 items-start">
                  <span className="px-2.5 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-black uppercase rounded-full">
                    Pemantauan Kepatuhan TTD
                  </span>
                  <h1 className="text-xl md:text-2xl font-black text-gray-900">Kepatuhan Minum TTD</h1>
                </div>

                <div className="mt-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5 bg-pink-50/40 border border-pink-100/50 p-4 rounded-[24px] w-full flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-gray-400 leading-none">Ibu Hamil</span>
                      <span className="text-xs md:text-sm font-extrabold text-gray-800 mt-1">{profile?.name}</span>
                    </div>
                  </div>

                  <div className="hidden lg:block h-8 w-[1px] bg-pink-100/80" />

                  <div className="flex items-center gap-3 border-t border-pink-100/30 lg:border-t-0 pt-3 lg:pt-0">
                    <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                      <Activity className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-gray-400 leading-none">NIK</span>
                      <span className="text-xs font-mono font-bold text-gray-800 mt-1">{profile?.nik || '-'}</span>
                    </div>
                  </div>

                  <div className="hidden lg:block h-8 w-[1px] bg-pink-100/80" />

                  <div className="flex items-center gap-3 border-t border-pink-100/30 lg:border-t-0 pt-3 lg:pt-0">
                    <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-gray-400 leading-none">Skor KSPR</span>
                      <span className="text-xs font-extrabold text-gray-800 mt-1">
                        {profile?.ksprScore || 2} ({profile?.riskStatus || 'KRR'})
                      </span>
                    </div>
                  </div>

                  <div className="hidden lg:block h-8 w-[1px] bg-pink-100/80" />

                  <div className="flex items-center gap-3 border-t border-pink-100/30 lg:border-t-0 pt-3 lg:pt-0">
                    <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-gray-400 leading-none">Usia Kehamilan</span>
                      <span className="text-xs font-extrabold text-gray-800 mt-1">
                        {getPregnancyAge(profile?.hpht, profile?.hpl)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                {compliancePercentage >= 80 ? 'Kepatuhan Sangat Baik' : 'Kurang Kepatuhan'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-pink-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Data Pendamping Ibu</h3>
              <p className="text-xs text-gray-400">Orang yang mengingatkan/memantau Ibu meminum TTD</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 ml-1">Nama Pendamping</label>
              <div className="relative">
                <input
                  type="text"
                  value={pendampingName}
                  readOnly
                  className="w-full px-4 py-3.5 pl-10 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 outline-none font-medium text-sm"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 ml-1">Hubungan dengan Bumil</label>
              <input
                type="text"
                value={pendampingRelation}
                readOnly
                className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 outline-none font-medium text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-pink-50 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-50">
            <div>
              <h3 className="text-xl font-black text-gray-900">Kartu Pemantauan Bulanan (Read Only)</h3>
              <p className="text-xs text-gray-400">Anda sedang melihat riwayat kepatuhan TTD ibu hamil.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="space-y-6">
              <div className="p-6 bg-pink-50/30 rounded-3xl border border-pink-100/50 space-y-4">
                <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest block">Bulan / Tahun</span>
                <div className="text-lg font-bold text-gray-800">
                  {monthYears[activeMonth] || 'Belum diisi'}
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

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Lembar Kalender Harian</span>
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-3">
                {days.map(d => {
                  const key = `${activeMonth}-${d}`;
                  const isTaken = !!logs[key];

                  return (
                    <div
                      key={d}
                      className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative ${isTaken
                          ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100'
                          : 'bg-white border-gray-100 text-gray-400'
                        }`}
                    >
                      <span className="text-xs font-black">{d}</span>
                      {isTaken && (
                        <span className="text-[8px] absolute bottom-1 font-black leading-none">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
