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
    } else if (user.role !== 'bidan') {
      router.push('/login');
    } else {
      fetchBumil();
    }
  }, [user, router]);

  const fetchBumil = async () => {
    try {
      const res = await bumilApi.getAll();
      setBumilData(res.data);
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

  if (!user || user.role !== 'bidan' || loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-pink-500 font-bold text-xl text-center">
          Memuat Dashboard Bidan...<br/>
          <span className="text-sm font-normal text-gray-400">Menyiapkan data pemetaan</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Dashboard Admin Bidan</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium uppercase tracking-wider">Wilayah Kerja Puskesmas</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/skrining" 
              className="inline-flex items-center justify-center gap-2 bg-pink-400 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-500 transition-all w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              Skrining Baru
            </Link>
          </div>
        </div>

        {/* Widgets Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Ibu Hamil</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-pink-50 flex items-center justify-center">
              <Users className="text-pink-400 h-6 w-6" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Risiko Rendah (KRR)</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.krr}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <Activity className="text-green-600 h-6 w-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Risiko Tinggi (KRT)</p>
              <h3 className="text-3xl font-bold text-yellow-600">{stats.krt}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center">
              <AlertTriangle className="text-yellow-600 h-6 w-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Risiko Sangat Tinggi</p>
              <h3 className="text-3xl font-bold text-red-600">{stats.krst}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="text-red-600 h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-pink-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Peta Sebaran Ibu Hamil</h2>
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

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-50 flex flex-col h-[500px] lg:h-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="text-red-500" /> 
              Sistem Peringatan
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {alerts.length > 0 ? (
                <>
                  {alerts.map(alert => (
                    <div key={alert.id} className="p-4 rounded-xl border border-red-100 bg-red-50/30 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{alert.name}</h4>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                            alert.riskStatus === 'KRST' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {alert.riskStatus === 'KRST' ? 'Risiko Sangat Tinggi' : 'Risiko Tinggi'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Baby className="w-4 h-4 text-gray-400" />
                          <span>HPL: <strong>{new Date(alert.hpl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                        </div>
                        {alert.missedCheckup && (
                          <div className="flex items-center gap-2 text-red-600">
                            <CalendarClock className="w-4 h-4" />
                            <span className="font-medium">Terlewat Jadwal Pemantauan</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Activity className="w-12 h-12 mb-2 opacity-20" />
                  <p>Tidak ada peringatan saat ini</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
