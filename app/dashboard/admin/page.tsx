"use client";

import MapWrapper from '@/components/MapWrapper';
import { AlertCircle, Baby, Activity, AlertTriangle, Users, CalendarClock, Plus, LogOut } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { bumilApi } from '@/lib/api';

export default function BidanDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bumilData, setBumilData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'bumil') {
      router.push('/dashboard/bumil');
    } else if (user.role !== 'bidan' && user.role !== 'dokter' && user.role !== 'superadmin') {
      router.push('/login');
    } else {
      fetchBumil();
    }
  }, [user, router]);

  const fetchBumil = async () => {
    try {
      const res = await bumilApi.getAll({ limit: 1000 });
      const items = res.data.data || (Array.isArray(res.data) ? res.data : []);
      setBumilData(items);
    } catch (error) {
      console.error('Failed to fetch bumil data');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = bumilData.length;
    const krr = bumilData.filter(b => b.riskStatus === 'KRR').length;
    const krt = bumilData.filter(b => b.riskStatus === 'KRT').length;
    const krst = bumilData.filter(b => b.riskStatus === 'KRST').length;
    return { total, krr, krt, krst };
  }, [bumilData]);

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
          Memuat Dashboard...<br/>
          <span className="text-sm font-normal text-gray-400">Menyiapkan data pemetaan</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-pink-100">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Dashboard Admin Bidan</h1>
            <p className="text-gray-500 mt-1 text-xs font-medium uppercase tracking-wider">Wilayah Kerja Puskesmas</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/dashboard/admin/skrining" 
              className="inline-flex items-center justify-center gap-2 bg-pink-400 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-500 transition-all w-full sm:w-auto text-xs md:text-sm"
            >
              <Plus className="w-4 h-4" />
              Skrining Baru
            </Link>
          </div>
        </div>

        {/* Desktop View: Separate spacious widgets */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Ibu Hamil</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.total}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
              <Users className="text-pink-400 w-6 h-6" />
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">KRR (Normal)</p>
              <h3 className="text-2xl font-black text-green-600">{stats.krr}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 shrink-0">
              <Activity className="text-green-600 w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Risiko Tinggi (KRT)</p>
              <h3 className="text-2xl font-black text-yellow-600">{stats.krt}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-500 shrink-0">
              <AlertTriangle className="text-yellow-600 w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sgt Tinggi (KRST)</p>
              <h3 className="text-2xl font-black text-red-600">{stats.krst}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <AlertCircle className="text-red-600 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Mobile & Tablet View: Sleek compact horizontal stats card */}
        <div className="lg:hidden bg-white p-3.5 rounded-3xl shadow-sm border border-pink-100">
          <div className="grid grid-cols-4 divide-x divide-pink-100/50">
            {/* Stat 1: Total Ibu Hamil */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="h-8 w-8 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center shrink-0 mb-1.5">
                <Users className="w-4 h-4 text-pink-400" />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block leading-tight">Total Ibu</span>
              <h3 className="text-sm font-black text-gray-900 mt-1 leading-none">
                {stats.total}
              </h3>
            </div>

            {/* Stat 2: KRR */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="h-8 w-8 bg-green-50 text-green-500 rounded-xl flex items-center justify-center shrink-0 mb-1.5">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block leading-tight">KRR</span>
              <h3 className="text-sm font-black text-green-600 mt-1 leading-none">
                {stats.krr}
              </h3>
            </div>

            {/* Stat 3: KRT */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="h-8 w-8 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shrink-0 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block leading-tight">KRT</span>
              <h3 className="text-sm font-black text-yellow-600 mt-1 leading-none">
                {stats.krt}
              </h3>
            </div>

            {/* Stat 4: KRST */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="h-8 w-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 mb-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block leading-tight">KRST</span>
              <h3 className="text-sm font-black text-red-600 mt-1 leading-none">
                {stats.krst}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-pink-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Peta Sebaran Ibu Hamil</h2>
              <div className="flex flex-wrap gap-3 text-xs md:text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span>KRR</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>KRT</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span>KRST</div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <MapWrapper data={bumilData} />
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-pink-50 flex flex-col h-[500px] lg:h-auto">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-500 w-5 h-5" /> 
              Sistem Peringatan
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {alerts.length > 0 ? (
                <>
                  {alerts.map(alert => (
                    <div key={alert.id} className="p-3 md:p-3.5 rounded-xl border border-red-100 bg-red-50/30 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs md:text-sm font-semibold text-gray-900">{alert.name}</h4>
                          <span className={`text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider ${
                            alert.riskStatus === 'KRST' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {alert.riskStatus === 'KRST' ? 'Risiko Sangat Tinggi' : 'Risiko Tinggi'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-[11px] md:text-xs text-gray-600 mt-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Baby className="w-3.5 h-3.5 text-gray-400" />
                          <span>HPL: <strong>{new Date(alert.hpl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                        </div>
                        {alert.missedCheckup && (
                          <div className="flex items-center gap-1.5 text-red-600">
                            <CalendarClock className="w-3.5 h-3.5" />
                            <span className="font-bold">Terlewat Jadwal Pemantauan</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Activity className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-xs">Tidak ada peringatan saat ini</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
