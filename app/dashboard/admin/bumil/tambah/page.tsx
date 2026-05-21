"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  UserPlus, 
  ArrowLeft,
  CheckCircle, 
  MapPin, 
  LocateFixed, 
  Save,
  Eye,
  EyeOff,
  BookOpen,
  X,
  Heart,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { authApi, bumilApi } from '@/lib/api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center font-bold text-gray-300">Menyiapkan Peta...</div>
});

export default function TambahBumilPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'bidan' && currentUser.role !== 'dokter' && currentUser.role !== 'superadmin')) {
      router.push('/login');
    }
  }, [currentUser]);

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
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const stepNames = [
    'Akses Akun',
    'Data Personal',
    'Lokasi Rumah',
    'Riwayat Kesehatan'
  ];

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
    if (currentStep === 4) {
      setIsSubmitDisabled(true);
      const timer = setTimeout(() => {
        setIsSubmitDisabled(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (formData.username.length < 3) {
        toast.error('Username minimal 3 karakter');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password minimal 6 karakter');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.name || !formData.nik || !formData.age || !formData.kelurahan || !formData.address) {
        toast.error('Mohon lengkapi semua data personal');
        return;
      }
      if (formData.nik.length !== 16) {
        toast.error('NIK harus tepat 16 digit!');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.lat || !formData.lng) {
        toast.error('Silakan tentukan lokasi rumah pada peta!');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateForm = () => {
    if (formData.username.length < 3) return false;
    if (formData.password.length < 6) return false;
    if (formData.nik.length !== 16) return false;
    if (!formData.lat || !formData.lng) return false;
    if (!formData.gravida || !formData.partus || !formData.abortus) {
      toast.error('Mohon lengkapi riwayat kesehatan');
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
      // 1. Register Akun Bumil
      const regRes = await authApi.register({
        username: formData.username.toLowerCase(),
        password: formData.password,
        role: 'bumil'
      });

      const newUserId = regRes.data.id;

      // 2. Create Bumil Profile linked to the new user_id
      await bumilApi.create({
        user_id: newUserId,
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

      toast.success('Ibu Hamil berhasil didaftarkan!');
      router.push('/dashboard/admin/bumil');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Pendaftaran gagal, silakan coba lagi';
      setError(msg);
      toast.error(msg);
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
      }, (error) => {
        toast.error("Gagal mendeteksi lokasi: " + error.message);
      });
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header dengan tombol kembali */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-pink-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard/admin/bumil')} 
              className="h-9 w-9 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm shrink-0"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-bold text-gray-900">Tambah Ibu Hamil</h1>
              <p className="text-[10px] md:text-xs text-gray-500 font-medium">Registrasi Akun dan Profil Ibu Hamil Baru</p>
            </div>
          </div>
          <div className="h-10 w-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-pink-100">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
 
        {/* Form Box */}
        <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6 border border-pink-50">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 md:mb-8 lg:mb-10">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  currentStep === s ? 'bg-pink-500 text-white shadow-md shadow-pink-200 scale-110' : 
                  currentStep > s ? 'bg-pink-200 text-pink-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div className={`h-1 w-8 md:w-16 mx-1 rounded-full transition-colors duration-300 ${currentStep > s ? 'bg-pink-200' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>

          {showTutorial && (
            <div className="mb-8 bg-gradient-to-br from-pink-500/5 to-pink-500/10 border border-pink-100/50 rounded-3xl p-5 relative overflow-hidden animate-in fade-in duration-300">
              <button 
                type="button" 
                onClick={() => setShowTutorial(false)} 
                className="absolute top-4 right-4 h-7 w-7 bg-white border border-pink-100 rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors shadow-sm active:scale-95 z-10"
                title="Tutup Panduan"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm shrink-0 border border-pink-50">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-3 w-full pr-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">💡 Panduan Registrasi: Langkah {currentStep} - {stepNames[currentStep - 1]}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Petunjuk pengisian untuk mempermudah pendaftaran:</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-pink-50/50 space-y-1 shadow-sm transition-all duration-300">
                    {currentStep === 1 && (
                      <>
                        <span className="text-[9px] font-black text-pink-500 tracking-wider uppercase block">Tahap 1: Akses Akun</span>
                        <h5 className="text-xs font-bold text-gray-800">Pembuatan Username & Password</h5>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Buatlah <span className="font-semibold text-gray-800">Username</span> dan <span className="font-semibold text-gray-800">Password</span> unik (minimal 6 karakter) untuk Ibu Hamil masuk ke sistem TINAKU nanti.
                        </p>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <span className="text-[9px] font-black text-pink-500 tracking-wider uppercase block">Tahap 2: Data Personal</span>
                        <h5 className="text-xs font-bold text-gray-800">Kelengkapan Identitas & HPHT</h5>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Masukkan <span className="font-semibold text-gray-800">Nama Lengkap</span>, <span className="font-semibold text-gray-800">NIK (tepat 16 digit)</span>, umur, kelurahan, dan alamat. Isi juga <span className="font-semibold text-gray-800">HPHT</span> untuk perhitungan perkiraan HPL otomatis.
                        </p>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <span className="text-[9px] font-black text-pink-500 tracking-wider uppercase block">Tahap 3: Lokasi Rumah</span>
                        <h5 className="text-xs font-bold text-gray-800">Menentukan Lokasi Geografis</h5>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Gunakan deteksi lokasi GPS saat ini atau geser pin di peta tepat di atas bangunan rumah Ibu Hamil agar pemantauan lebih mudah dan akurat.
                        </p>
                      </>
                    )}
                    {currentStep === 4 && (
                      <>
                        <span className="text-[9px] font-black text-pink-500 tracking-wider uppercase block">Tahap 4: Riwayat Kesehatan</span>
                        <h5 className="text-xs font-bold text-gray-800">Informasi Kehamilan Sebelumnya (G-P-A)</h5>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Isi data riwayat kesehatan: <span className="font-semibold text-gray-800">G (Kehamilan ke)</span>, <span className="font-semibold text-gray-800">P (Melahirkan)</span>, dan <span className="font-semibold text-gray-800">A (Keguguran)</span>.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form 
            onSubmit={handleSubmit} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }} 
            className="space-y-8"
          >
            
            <div className="min-h-[300px]">
              {currentStep === 1 && (
                <section className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="flex items-center gap-3 border-l-4 border-pink-500 pl-4 py-1 mb-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">01. Akses Akun</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Username</label>
                      <input type="text" name="username" value={formData.username} onChange={handleInputChange} required={currentStep === 1} className="w-full px-4 py-3 md:px-5 md:py-3.5 lg:py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="Buat username" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          name="password" 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          required={currentStep === 1} 
                          className="w-full px-4 py-3 md:px-5 md:py-3.5 lg:py-4 pr-12 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" 
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
              )}

              {currentStep === 2 && (
                <section className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="flex items-center gap-3 border-l-4 border-pink-500 pl-4 py-1 mb-6">
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">02. Data Personal</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Nama Lengkap</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required={currentStep === 2} className="w-full px-4 py-3 md:px-5 md:py-3.5 lg:py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="Sesuai KTP" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 ml-1">NIK (16 Digit)</label>
                        <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} required={currentStep === 2} maxLength={16} className="w-full px-4 py-3 md:px-5 md:py-3.5 lg:py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="16 digit angka" />
                        <span className="text-[10px] text-gray-400 block mt-1 ml-1 leading-normal">Harus tepat 16 angka KTP</span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 ml-1">Umur</label>
                        <input type="number" name="age" value={formData.age} onChange={handleInputChange} required={currentStep === 2} className="w-full px-4 py-3 md:px-5 md:py-3.5 lg:py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="Tahun" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 ml-1">Kelurahan</label>
                      <input type="text" name="kelurahan" value={formData.kelurahan} onChange={handleInputChange} required={currentStep === 2} className="w-full px-4 py-3 md:px-5 md:py-3.5 lg:py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium" placeholder="Kelurahan domisili" />
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
                            className="w-full pl-2 pr-4 py-2.5 md:py-3 lg:py-3.5 rounded-xl text-xs font-bold text-gray-700 outline-none border-none focus:ring-0 bg-transparent cursor-pointer"
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
                            className="w-full pl-2 pr-4 py-2.5 md:py-3 lg:py-3.5 rounded-xl text-xs font-bold text-gray-700 outline-none border-none focus:ring-0 bg-transparent cursor-pointer"
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
                      <textarea name="address" value={formData.address} onChange={handleInputChange} required={currentStep === 2} rows={3} className="w-full px-4 py-3 md:px-5 md:py-3.5 lg:py-4 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all text-sm font-medium resize-none" placeholder="RT/RW, Nama Jalan, No. Rumah"></textarea>
                    </div>
                  </div>
                </section>
              )}

              {currentStep === 3 && (
                <section className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="flex items-center gap-3 border-l-4 border-pink-500 pl-4 py-1 mb-6">
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">03. Lokasi Geografis</h3>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <div className="space-y-1">
                      <button type="button" onClick={getCurrentLocation} className="w-full bg-white text-pink-500 font-black py-3 lg:py-4 rounded-2xl text-xs hover:bg-pink-50 transition-all border-2 border-pink-100 flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]">
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
              )}

              {currentStep === 4 && (
                <section className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="flex items-center gap-3 border-l-4 border-pink-500 pl-4 py-1 mb-6">
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                       <Heart className="w-4 h-4 text-pink-500 animate-pulse" /> 04. Riwayat Kesehatan Ibu
                     </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2 p-4 bg-pink-50/20 rounded-2xl border border-pink-100/30">
                      <label className="text-xs font-black text-pink-700 block uppercase tracking-wider">G - Hamil Ke</label>
                      <input type="number" name="gravida" value={formData.gravida} onChange={handleInputChange} required={currentStep === 4} min={1} className="w-full px-4 py-3 rounded-xl text-pink-750 border border-pink-100 bg-pink-50/30 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all font-bold text-xs" placeholder="Ke-berapa" />
                    </div>
                    <div className="space-y-2 p-4 bg-green-50/20 rounded-2xl border border-green-100/30">
                      <label className="text-xs font-black text-green-700 block uppercase tracking-wider">P - Melahirkan</label>
                      <input type="number" name="partus" value={formData.partus} onChange={handleInputChange} required={currentStep === 4} min={0} className="w-full px-4 py-3 rounded-xl text-green-750 border border-green-100 bg-green-50/30 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all font-bold text-xs" placeholder="Melahirkan" />
                    </div>
                    <div className="space-y-2 p-4 bg-red-50/20 rounded-2xl border border-red-100/30">
                      <label className="text-xs font-black text-red-700 block uppercase tracking-wider">A - Keguguran</label>
                      <input type="number" name="abortus" value={formData.abortus} onChange={handleInputChange} required={currentStep === 4} min={0} className="w-full px-4 py-3 rounded-xl text-red-750 border border-red-100 bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition-all font-bold text-xs" placeholder="Keguguran" />
                    </div>
                  </div>
                </section>
              )}
            </div>
            
            <div className="pt-6 mt-3 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full md:w-auto px-4 py-2.5 md:py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-200 text-xs md:text-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Sebelumnya
                </button>
              )}
              
              <div className={`flex-1 text-center md:text-left ${currentStep > 1 ? 'order-last md:order-none' : ''}`}>
              </div>

              {currentStep < 4 ? (
                <button
                  key="next-button"
                  type="button"
                  onClick={handleNextStep}
                  className={`w-full md:w-auto px-5 py-2.5 md:py-3 bg-pink-500 text-white font-black rounded-2xl shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all flex items-center justify-center gap-2 group text-xs md:text-sm ${currentStep === 1 ? 'ml-auto' : ''}`}
                >
                  Selanjutnya <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  key="submit-button"
                  type="submit"
                  disabled={isLoading || isSubmitDisabled}
                  className="w-full md:w-auto px-5 py-2.5 md:py-3 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-pink-600 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 text-xs md:text-sm animate-bounce-subtle"
                >
                  {isLoading ? 'Memproses...' : 'Selesaikan Pendaftaran'}
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
