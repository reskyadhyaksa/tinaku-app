"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  User as UserIcon, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  MapPin, 
  LocateFixed, 
  Map as MapIcon, 
  Save,
  Eye,
  EyeOff,
  BookOpen,
  X,
  Heart,
  Calendar,
  Clock
} from 'lucide-react';
import { authApi, bumilApi } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center font-bold text-gray-300">Menyiapkan Peta...</div>
});

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const router = useRouter();

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
    setFormData(prev => ({ ...prev, hpht: dateStr }));
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
    setFormData(prev => ({ ...prev, hpl: dateStr }));
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
    const isTutorialClosed = localStorage.getItem('hideRegisterTutorial');
    if (isTutorialClosed === 'true') {
      setShowTutorial(false);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hideRegisterTutorial', 'true');
  };

  useEffect(() => {
    // Auto-show map for everyone after 2 seconds
    const timer = setTimeout(() => {
      setShowMap(true);
      setMapReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-calculate suggested HPL based on HPHT (HPHT + 280 days Naegele's rule)
  useEffect(() => {
    if (formData.hpht) {
      const hphtDate = new Date(formData.hpht);
      if (!isNaN(hphtDate.getTime())) {
        const suggestedHpl = new Date(hphtDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        setFormData(prev => ({ ...prev, hpl: suggestedHpl.toISOString().split('T')[0] }));
      }
    }
  }, [formData.hpht]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.username.length < 3) {
      toast.error('Username minimal 3 karakter');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return false;
    }
    if (formData.nik.length !== 16) {
      toast.error('NIK harus tepat 16 digit!');
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
    
    setError('');
    setIsLoading(true);

    try {
      // 1. Register Akun
      await authApi.register({
        username: formData.username.toLowerCase(),
        password: formData.password,
        role: 'bumil'
      });

      // 2. Login untuk dapat token (dibutuhkan untuk create profile)
      const loginRes = await authApi.login({
        username: formData.username.toLowerCase(),
        password: formData.password
      });
      
      const token = loginRes.data.token;
      localStorage.setItem('token', token);

      // 3. Create Profil Bumil
      await bumilApi.create({
        name: formData.name,
        nik: formData.nik,
        age: parseInt(formData.age),
        address: formData.address,
        kelurahan: formData.kelurahan,
        coordinates: [parseFloat(formData.lat), parseFloat(formData.lng)],
        gravida: parseInt(formData.gravida) || 1,
        partus: parseInt(formData.partus) || 0,
        abortus: parseInt(formData.abortus) || 0,
        riskStatus: 'KRR',
        hpht: formData.hpht || null,
        hpl: formData.hpl || null
      });

      toast.success('Pendaftaran Berhasil!');
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Pendaftaran gagal, silakan coba lagi';
      setError(msg);
      toast.error(msg);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6)
        }));
        toast.success("Lokasi terdeteksi!");
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-pink-100 animate-in fade-in zoom-in duration-300">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500 w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Bergabung!</h2>
          <p className="text-gray-500">Pendaftaran akun dan data diri Anda berhasil. Mengarahkan Anda ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white w-full max-w-6xl rounded-[40px] shadow-2xl p-6 md:p-12 lg:p-16 border border-pink-100">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-16 w-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="text-pink-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pendaftaran Ibu Hamil</h1>
          <p className="text-gray-500 text-sm mt-1">Lengkapi satu langkah mudah untuk mendapatkan layanan TINAKU</p>
        </div>

        {showTutorial && (
          <div className="mb-8 bg-gradient-to-br from-pink-500/5 to-pink-500/10 border border-pink-100/50 rounded-3xl p-5 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <button 
              type="button" 
              onClick={closeTutorial} 
              className="absolute top-4 right-4 h-7 w-7 bg-white border border-pink-100 rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors shadow-sm active:scale-95 z-10"
              title="Tutup Panduan"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm shrink-0 border border-pink-50">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-4 w-full pr-4">
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900">💡 Panduan Cepat Registrasi (Khusus HP)</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Ikuti 3 langkah mudah berikut untuk mendaftar:</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-pink-50/50 space-y-1 shadow-sm">
                    <span className="text-[9px] font-black text-pink-500 tracking-wider uppercase block">Langkah 1</span>
                    <h5 className="text-[11px] font-bold text-gray-800">Akses Akun</h5>
                    <p className="text-[10px] text-gray-500 leading-relaxed">Buat Username & Password unik (min. 6 karakter) untuk login nantinya.</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-pink-50/50 space-y-1 shadow-sm">
                    <span className="text-[9px] font-black text-pink-500 tracking-wider uppercase block">Langkah 2</span>
                    <h5 className="text-[11px] font-bold text-gray-800">Data Diri & NIK</h5>
                    <p className="text-[10px] text-gray-500 leading-relaxed">Isi NIK KTP Anda. Pastikan **tepat 16 digit** angka agar sistem memvalidasi.</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-pink-50/50 space-y-1 shadow-sm">
                    <span className="text-[9px] font-black text-pink-500 tracking-wider uppercase block">Langkah 3</span>
                    <h5 className="text-[11px] font-bold text-gray-800">Lokasi Rumah</h5>
                    <p className="text-[10px] text-gray-500 leading-relaxed">Klik **"Deteksi Lokasi GPS"** agar GPS HP mendeteksi, atau klik manual di peta.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
            
            <div className="space-y-10">
              {/* Section 01: Akses Akun */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-pink-500 pl-4 py-1">
                   <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">01. Akses Akun</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="w-full px-5 py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="Buat username" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        name="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required 
                        className="w-full px-5 py-4 pr-12 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" 
                        placeholder="Min. 6 Karakter" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1 ml-1 leading-normal">Minimal 6 karakter mudah diingat</span>
                  </div>
                </div>
              </section>

              {/* Section 02: Data Personal */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-pink-500 pl-4 py-1">
                   <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">02. Data Personal</h3>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Nama Lengkap</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-5 py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="Sesuai KTP" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">NIK (16 Digit)</label>
                      <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} required maxLength={16} className="w-full px-5 py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="16 digit angka" />
                      <span className="text-[10px] text-gray-400 block mt-1 ml-1 leading-normal">Harus tepat 16 angka KTP</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Umur</label>
                      <input type="number" name="age" value={formData.age} onChange={handleInputChange} required className="w-full px-5 py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="Tahun" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Kelurahan</label>
                    <input type="text" name="kelurahan" value={formData.kelurahan} onChange={handleInputChange} required className="w-full px-5 py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="Kelurahan domisili" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2 bg-pink-50/20 p-4 rounded-2xl border border-pink-100/30 relative">
                      <label className="text-xs font-bold text-pink-700 ml-1">HPHT (Hari Pertama Haid Terakhir)</label>
                      <div className="relative rounded-xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300 transition-all">
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
                          className="w-full pl-2 pr-4 py-3.5 rounded-xl text-xs font-bold text-gray-700 outline-none border-none focus:ring-0 bg-transparent cursor-pointer"
                        />

                        {isHphtOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsHphtOpen(false)} />
                            <div className="absolute bottom-full left-0 z-50 mb-2 bg-white rounded-3xl p-4 shadow-xl border border-pink-100 w-[280px] sm:w-[320px] animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                      <label className="text-xs font-bold text-pink-700 ml-1">HPL (Hari Perkiraan Lahir)</label>
                      <div className="relative rounded-xl bg-white border border-gray-100 flex items-center shadow-sm focus-within:border-pink-300 transition-all">
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
                          className="w-full pl-2 pr-4 py-3.5 rounded-xl text-xs font-bold text-gray-700 outline-none border-none focus:ring-0 bg-transparent cursor-pointer"
                        />

                        {isHplOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsHplOpen(false)} />
                            <div className="absolute bottom-full left-0 z-50 mb-2 bg-white rounded-3xl p-4 shadow-xl border border-pink-100 w-[280px] sm:w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
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
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Alamat Lengkap</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={3} className="w-full px-5 py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium resize-none" placeholder="RT/RW, Nama Jalan, No. Rumah"></textarea>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-10">
              {/* Section 03: Lokasi Geografis */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-pink-500 pl-4 py-1">
                   <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">03. Lokasi Geografis</h3>
                </div>
                
                <div className="flex flex-col gap-6">
                  <div className="space-y-1">
                    <button type="button" onClick={getCurrentLocation} className="w-full bg-white text-pink-500 font-black py-4 rounded-2xl text-xs hover:bg-pink-50 transition-all border-2 border-pink-100 flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]">
                      <LocateFixed className="w-5 h-5" /> Deteksi Lokasi GPS Saya
                    </button>
                    <span className="text-[10px] text-gray-400 block text-center mt-1">Pastikan menu Lokasi / GPS di HP Anda menyala</span>
                  </div>

                  <div className="h-[280px] md:h-[400px] rounded-[32px] overflow-hidden border-4 border-white shadow-xl relative bg-gray-50">
                    <LocationPickerMap 
                      lat={parseFloat(formData.lat) || 0} 
                      lng={parseFloat(formData.lng) || 0} 
                      onChange={(lat, lng) => setFormData(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }))} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl text-gray-700 border border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider mb-1">Latitude</span>
                      <span className="text-xs font-mono font-bold text-gray-600">{formData.lat || '-'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-gray-700 border border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider mb-1">Longitude</span>
                      <span className="text-xs font-mono font-bold text-gray-600">{formData.lng || '-'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 04: Riwayat Singkat Kesehatan Ibu */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-pink-500 pl-4 py-1">
                   <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                     <Heart className="w-4 h-4 text-pink-500 animate-pulse" /> 04. Riwayat Kesehatan Ibu
                   </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2 p-3 bg-pink-50/20 rounded-2xl border border-pink-100/30">
                    <label className="text-[11px] font-black text-pink-700 block uppercase tracking-wider">G - Hamil Ke</label>
                    <input type="number" name="gravida" value={formData.gravida} onChange={handleInputChange} required min={1} className="w-full px-4 py-3 rounded-xl text-pink-750 border border-pink-100 bg-pink-50/30 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all font-bold text-xs" placeholder="Ke-berapa" />
                  </div>
                  <div className="space-y-2 p-3 bg-green-50/20 rounded-2xl border border-green-100/30">
                    <label className="text-[11px] font-black text-green-700 block uppercase tracking-wider">P - Melahirkan</label>
                    <input type="number" name="partus" value={formData.partus} onChange={handleInputChange} required min={0} className="w-full px-4 py-3 rounded-xl text-green-750 border border-green-100 bg-green-50/30 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all font-bold text-xs" placeholder="Melahirkan" />
                  </div>
                  <div className="space-y-2 p-3 bg-red-50/20 rounded-2xl border border-red-100/30">
                    <label className="text-[11px] font-black text-red-700 block uppercase tracking-wider">A - Keguguran</label>
                    <input type="number" name="abortus" value={formData.abortus} onChange={handleInputChange} required min={0} className="w-full px-4 py-3 rounded-xl text-red-750 border border-red-100 bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition-all font-bold text-xs" placeholder="Keguguran" />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-sm font-medium text-gray-500 text-center md:text-left">
              Sudah memiliki akun? <Link href="/login" className="text-pink-500 font-black hover:underline">Masuk Sekarang</Link>
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto md:px-12 bg-gray-900 text-white font-black py-5 rounded-[24px] shadow-2xl hover:bg-pink-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
            >
              {isLoading ? 'Sedang Memproses...' : 'Selesaikan Pendaftaran'}
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
