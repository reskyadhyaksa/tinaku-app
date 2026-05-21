"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Save, 
  LocateFixed, 
  LogOut,
  Map as MapIcon,
  CheckCircle,
  Heart,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bumilApi } from '@/lib/api';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl mt-4" />
});

export default function PendaftaranBumilPage() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    age: '',
    address: '',
    kelurahan: '',
    lat: '',
    lng: '',
    gravida: '1',
    partus: '0',
    abortus: '0',
    hpht: '',
    hpl: ''
  });
  const [existingId, setExistingId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Calendar Popover States for HPHT and HPL
  const [isHphtOpen, setIsHphtOpen] = useState(false);
  const [isHplOpen, setIsHplOpen] = useState(false);
  const [calendarDateHpht, setCalendarDateHpht] = useState<Date>(() => new Date());
  const [calendarDateHpl, setCalendarDateHpl] = useState<Date>(() => new Date());

  const monthsList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const daysList = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonthHpht = () => {
    setCalendarDateHpht(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonthHpht = () => {
    setCalendarDateHpht(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleSelectDayHpht = (day: number) => {
    const selected = new Date(calendarDateHpht.getFullYear(), calendarDateHpht.getMonth(), day);
    const offset = selected.getTimezoneOffset();
    const localDate = new Date(selected.getTime() - (offset * 60 * 1000));
    const dateStr = localDate.toISOString().split('T')[0];
    
    // Auto-calculate HPL: HPHT + 280 days
    const suggestedHpl = new Date(selected.getTime() + 280 * 24 * 60 * 60 * 1000);
    const hplStr = suggestedHpl.toISOString().split('T')[0];

    setFormData(prev => ({ ...prev, hpht: dateStr, hpl: hplStr }));
    setIsHphtOpen(false);
  };

  const handlePrevMonthHpl = () => {
    setCalendarDateHpl(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonthHpl = () => {
    setCalendarDateHpl(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleSelectDayHpl = (day: number) => {
    const selected = new Date(calendarDateHpl.getFullYear(), calendarDateHpl.getMonth(), day);
    const offset = selected.getTimezoneOffset();
    const localDate = new Date(selected.getTime() - (offset * 60 * 1000));
    const dateStr = localDate.toISOString().split('T')[0];
    
    // Auto-calculate HPHT: HPL - 280 days
    const suggestedHpht = new Date(selected.getTime() - 280 * 24 * 60 * 60 * 1000);
    const hphtStr = suggestedHpht.toISOString().split('T')[0];

    setFormData(prev => ({ ...prev, hpl: dateStr, hpht: hphtStr }));
    setIsHplOpen(false);
  };

  // Sync calendarDates when formData changes
  useEffect(() => {
    if (formData.hpht) {
      setCalendarDateHpht(new Date(formData.hpht));
    }
  }, [formData.hpht]);

  useEffect(() => {
    if (formData.hpl) {
      setCalendarDateHpl(new Date(formData.hpl));
    }
  }, [formData.hpl]);

  useEffect(() => {
    if (user && user.role !== 'bumil') {
      window.location.href = '/';
    } else if (user) {
      checkExistingData();
    }
  }, [user]);

  const checkExistingData = async () => {
    try {
      const res = await bumilApi.getMe();
      const myData = res.data;
      
      if (myData) {
        setFormData({
          name: myData.name,
          nik: myData.nik || '',
          age: myData.age.toString(),
          address: myData.address,
          kelurahan: myData.kelurahan || '',
          lat: myData.latitude.toString(),
          lng: myData.longitude.toString(),
          gravida: (myData.gravida || 1).toString(),
          partus: (myData.partus || 0).toString(),
          abortus: (myData.abortus || 0).toString(),
          hpht: myData.hpht ? new Date(myData.hpht).toISOString().split('T')[0] : '',
          hpl: myData.hpl ? new Date(myData.hpl).toISOString().split('T')[0] : ''
        });
        setExistingId(myData.id);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Gagal mengecek data lama');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          }));
          setIsLocating(false);
        },
        (error) => {
          toast.error("Gagal mengambil lokasi: " + error.message);
          setIsLocating(false);
        }
      );
    }
  };

  const validateForm = () => {
    if (formData.nik.length !== 16) {
      toast.error('NIK harus tepat 16 digit!');
      return false;
    }
    if (!/^\d+$/.test(formData.nik)) {
      toast.error('NIK hanya boleh berisi angka!');
      return false;
    }
    if (!formData.kelurahan.trim()) {
      toast.error('Kelurahan wajib diisi!');
      return false;
    }
    if (formData.address.trim().length < 10) {
      toast.error('Alamat lengkap minimal 10 karakter!');
      return false;
    }
    if (!formData.lat || !formData.lng) {
      toast.error('Silakan tentukan lokasi rumah pada peta!');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        gravida: parseInt(formData.gravida) || 1,
        partus: parseInt(formData.partus) || 0,
        abortus: parseInt(formData.abortus) || 0,
        coordinates: [parseFloat(formData.lat) || 0, parseFloat(formData.lng) || 0],
        riskStatus: 'KRR',
        hpht: formData.hpht || null,
        hpl: formData.hpl || null,
        missedCheckup: false
      };

      if (existingId) {
        await bumilApi.update(existingId, payload);
        toast.success('Data pendaftaran berhasil diperbarui!');
      } else {
        await bumilApi.create(payload);
        toast.success('Pendaftaran Anda berhasil dikirim!');
        setIsSubmitted(true);
      }
    } catch (error) {
      toast.error('Gagal mengirim data. Pastikan semua kolom terisi dengan benar.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md border border-pink-100">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500 w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 mb-8">Data Anda telah tersimpan. Bidan akan segera meninjau dan melakukan skrining lanjutan.</p>
          <button onClick={logout} className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl">
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 md:px-8 md:py-6 rounded-3xl shadow-sm border border-pink-50">
          <div className="text-center sm:text-left">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Halo, {user?.name}</h1>
            <p className="text-xs md:text-sm text-gray-500">Silakan lengkapi data diri Anda</p>
          </div>
          <button onClick={logout} className="flex items-center justify-center gap-2 text-red-500 font-bold text-xs md:text-sm bg-red-50 px-5 py-2.5 rounded-xl hover:bg-red-100 transition-colors border border-red-100 w-full sm:w-auto">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pink-50">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Data Personal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all" placeholder="Sesuai KTP" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">NIK</label>
                <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} required className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all" placeholder="16 Digit NIK" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Umur</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} required className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all" placeholder="Tahun" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Kelurahan</label>
                <input type="text" name="kelurahan" value={formData.kelurahan} onChange={handleInputChange} required className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all" placeholder="Nama Kelurahan" />
              </div>
              <div className="space-y-2 bg-pink-50/20 p-4 rounded-2xl border border-pink-100/30 relative">
                <label className="text-sm font-bold text-pink-700">HPHT (Hari Pertama Haid Terakhir)</label>
                <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300 transition-all">
                  <button 
                    type="button"
                    onClick={() => setIsHphtOpen(!isHphtOpen)}
                    className="pl-4 pr-1 text-pink-500 shrink-0 hover:scale-110 active:scale-95 transition-all outline-none"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <input 
                    type="text" 
                    readOnly
                    value={formData.hpht ? new Date(formData.hpht).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih Tanggal'} 
                    onClick={() => setIsHphtOpen(true)}
                    className="w-full pl-2 pr-4 py-3.5 rounded-2xl text-xs font-bold text-gray-700 outline-none border-none focus:ring-0 bg-transparent cursor-pointer"
                  />

                  {isHphtOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsHphtOpen(false)} />
                      <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-3xl p-4 shadow-xl border border-pink-100 w-[280px] sm:w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
                          <button 
                            type="button"
                            onClick={handlePrevMonthHpht}
                            className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold transition-colors text-sm"
                          >
                            &larr;
                          </button>
                          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">
                            {monthsList[calendarDateHpht.getMonth()]} {calendarDateHpht.getFullYear()}
                          </span>
                          <button 
                            type="button"
                            onClick={handleNextMonthHpht}
                            className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold transition-colors text-sm"
                          >
                            &rarr;
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {daysList.map(d => (
                            <span key={d} className="text-[9px] font-black text-pink-300 uppercase text-center">{d}</span>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: getFirstDayOfMonth(calendarDateHpht.getFullYear(), calendarDateHpht.getMonth()) }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}
                          
                          {Array.from({ length: getDaysInMonth(calendarDateHpht.getFullYear(), calendarDateHpht.getMonth()) }).map((_, i) => {
                            const dayNum = i + 1;
                            const isSelected = formData.hpht && 
                              new Date(formData.hpht).getDate() === dayNum &&
                              new Date(formData.hpht).getMonth() === calendarDateHpht.getMonth() &&
                              new Date(formData.hpht).getFullYear() === calendarDateHpht.getFullYear();

                            const isToday = new Date().getDate() === dayNum &&
                              new Date().getMonth() === calendarDateHpht.getMonth() &&
                              new Date().getFullYear() === calendarDateHpht.getFullYear();

                            return (
                              <button
                                key={`day-${dayNum}`}
                                type="button"
                                onClick={() => handleSelectDayHpht(dayNum)}
                                className={`py-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                                  isSelected 
                                    ? 'bg-pink-500 text-white shadow-md shadow-pink-100 font-black' 
                                    : isToday 
                                      ? 'bg-pink-50 text-pink-600 border border-pink-200 font-extrabold'
                                      : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                {dayNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-2 bg-pink-50/20 p-4 rounded-2xl border border-pink-100/30 relative">
                <label className="text-sm font-bold text-pink-700">HPL (Hari Perkiraan Lahir)</label>
                <div className="relative rounded-2xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300 transition-all">
                  <button 
                    type="button"
                    onClick={() => setIsHplOpen(!isHplOpen)}
                    className="pl-4 pr-1 text-pink-500 shrink-0 hover:scale-110 active:scale-95 transition-all outline-none"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <input 
                    type="text" 
                    readOnly
                    value={formData.hpl ? new Date(formData.hpl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih Tanggal'} 
                    onClick={() => setIsHplOpen(true)}
                    className="w-full pl-2 pr-4 py-3.5 rounded-2xl text-xs font-bold text-gray-700 outline-none border-none focus:ring-0 bg-transparent cursor-pointer"
                  />

                  {isHplOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsHplOpen(false)} />
                      <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-3xl p-4 shadow-xl border border-pink-100 w-[280px] sm:w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
                          <button 
                            type="button"
                            onClick={handlePrevMonthHpl}
                            className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold transition-colors text-sm"
                          >
                            &larr;
                          </button>
                          <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">
                            {monthsList[calendarDateHpl.getMonth()]} {calendarDateHpl.getFullYear()}
                          </span>
                          <button 
                            type="button"
                            onClick={handleNextMonthHpl}
                            className="p-1 hover:bg-pink-50 rounded-lg text-pink-500 font-bold transition-colors text-sm"
                          >
                            &rarr;
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {daysList.map(d => (
                            <span key={d} className="text-[9px] font-black text-pink-300 uppercase text-center">{d}</span>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: getFirstDayOfMonth(calendarDateHpl.getFullYear(), calendarDateHpl.getMonth()) }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}
                          
                          {Array.from({ length: getDaysInMonth(calendarDateHpl.getFullYear(), calendarDateHpl.getMonth()) }).map((_, i) => {
                            const dayNum = i + 1;
                            const isSelected = formData.hpl && 
                              new Date(formData.hpl).getDate() === dayNum &&
                              new Date(formData.hpl).getMonth() === calendarDateHpl.getMonth() &&
                              new Date(formData.hpl).getFullYear() === calendarDateHpl.getFullYear();

                            const isToday = new Date().getDate() === dayNum &&
                              new Date().getMonth() === calendarDateHpl.getMonth() &&
                              new Date().getFullYear() === calendarDateHpl.getFullYear();

                            return (
                              <button
                                key={`day-${dayNum}`}
                                type="button"
                                onClick={() => handleSelectDayHpl(dayNum)}
                                className={`py-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                                  isSelected 
                                    ? 'bg-pink-500 text-white shadow-md shadow-pink-100 font-black' 
                                    : isToday 
                                      ? 'bg-pink-50 text-pink-600 border border-pink-200 font-extrabold'
                                      : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                {dayNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Alamat Lengkap</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={2} className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all" placeholder="Alamat Domisili" />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <MapPin className="text-pink-500 w-5 h-5" /> Lokasi Rumah
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button type="button" onClick={() => setShowMap(!showMap)} className="flex-1 md:flex-none text-xs font-bold bg-gray-100 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors">
                    <MapIcon className="w-4 h-4 inline mr-1.5" /> {showMap ? 'Tutup Peta' : 'Pilih di Peta'}
                  </button>
                  <button type="button" onClick={getCurrentLocation} className="flex-1 md:flex-none text-xs font-bold bg-pink-50 px-4 py-2.5 rounded-xl text-pink-500 hover:bg-pink-100 transition-colors border border-pink-100">
                    <LocateFixed className="w-4 h-4 inline mr-1.5" /> Lokasi Saat Ini
                  </button>
                </div>
              </div>

              {showMap && (
                <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-50 mt-4 shadow-sm z-0">
                  <LocationPickerMap 
                    key="registration-picker-map"
                    lat={parseFloat(formData.lat) || -6.205} 
                    lng={parseFloat(formData.lng) || 106.82} 
                    onChange={(lat, lng) => setFormData(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }))} 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 block">LATITUDE</span>
                  <span className="text-sm font-mono">{formData.lat || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 block">LONGITUDE</span>
                  <span className="text-sm font-mono">{formData.lng || '-'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Riwayat Singkat Kesehatan Ibu */}
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pink-50">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Riwayat Singkat Kesehatan Ibu</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-2 p-4 bg-pink-50/20 rounded-2xl border border-pink-100/30">
                <label className="text-sm font-bold text-pink-700 block">Gravida (G) - Hamil Ke</label>
                <input type="number" name="gravida" value={formData.gravida} onChange={handleInputChange} required min={1} className="w-full px-4 py-3.5 rounded-2xl text-pink-750 border border-pink-100 bg-pink-50/30 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all font-bold" placeholder="Hamil ke-berapa" />
              </div>
              <div className="space-y-2 p-4 bg-green-50/20 rounded-2xl border border-green-100/30">
                <label className="text-sm font-bold text-green-700 block">Partus (P) - Melahirkan</label>
                <input type="number" name="partus" value={formData.partus} onChange={handleInputChange} required min={0} className="w-full px-4 py-3.5 rounded-2xl text-green-750 border border-green-100 bg-green-50/30 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all font-bold" placeholder="Jumlah melahirkan" />
              </div>
              <div className="space-y-2 p-4 bg-red-50/20 rounded-2xl border border-red-100/30">
                <label className="text-sm font-bold text-red-700 block">Abortus (A) - Keguguran</label>
                <input type="number" name="abortus" value={formData.abortus} onChange={handleInputChange} required min={0} className="w-full px-4 py-3.5 rounded-2xl text-red-750 border border-red-100 bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition-all font-bold" placeholder="Jumlah keguguran" />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Mengirim...' : 'Kirim Data Pendaftaran'}
            <Save className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
