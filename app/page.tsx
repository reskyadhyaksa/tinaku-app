"use client";

import MapWrapper from '@/components/MapWrapper';
import { mockBumilData } from '@/lib/mockData';
import { AlertCircle, Baby, Activity, AlertTriangle, Users, CalendarClock, Plus } from 'lucide-react';
import { useMemo } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const stats = useMemo(() => {
    const total = mockBumilData.length;
    const krr = mockBumilData.filter(b => b.riskStatus === 'KRR').length;
    const krt = mockBumilData.filter(b => b.riskStatus === 'KRT').length;
    const krst = mockBumilData.filter(b => b.riskStatus === 'KRST').length;
    return { total, krr, krt, krst };
  }, []);

  const alerts = useMemo(() => {
    const today = new Date();
    // High risk and very high risk
    const riskBumil = mockBumilData.filter(b => ['KRT', 'KRST'].includes(b.riskStatus));
    
    // Sort by HPL proximity or missed checkups
    return riskBumil.filter(b => {
      const hplDate = new Date(b.hpl);
      const diffTime = Math.abs(hplDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Alert if HPL is within 30 days or missed a checkup
      return diffDays <= 30 || b.missedCheckup;
    }).sort((a, b) => {
      if (a.missedCheckup && !b.missedCheckup) return -1;
      if (!a.missedCheckup && b.missedCheckup) return 1;
      return new Date(a.hpl).getTime() - new Date(b.hpl).getTime();
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard TINAKU</h1>
            <p className="text-gray-500 mt-2">Ringkasan Pemantauan Ibu Hamil Kelurahan</p>
          </div>
          <Link 
            href="/skrining" 
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Pendaftaran Baru
          </Link>
        </div>

        {/* Widgets Ringkasan (KSP) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Ibu Hamil</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="text-blue-600 h-6 w-6" />
            </div>
          </div>
          
          {/* KRR (Hijau) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Risiko Rendah (KRR)</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.krr}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <Activity className="text-green-600 h-6 w-6" />
            </div>
          </div>

          {/* KRT (Kuning) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Risiko Tinggi (KRT)</p>
              <h3 className="text-3xl font-bold text-yellow-600">{stats.krt}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center">
              <AlertTriangle className="text-yellow-600 h-6 w-6" />
            </div>
          </div>

          {/* KRST (Merah) */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Peta Sebaran Ibu Hamil</h2>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span>KRR</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>KRT</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span>KRST</div>
              </div>
            </div>
            <MapWrapper />
          </div>

          {/* Alert System Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="text-red-500" /> 
              Sistem Peringatan
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {alerts.length > 0 ? alerts.map(alert => (
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
              )) : <div>
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Activity className="w-12 h-12 mb-2 opacity-20" />
                  <p>Tidak ada peringatan saat ini</p>
                </div>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
