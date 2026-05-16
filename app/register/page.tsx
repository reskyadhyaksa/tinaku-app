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
  EyeOff
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
    lng: ''
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Auto-show map for everyone after 2 seconds
    const timer = setTimeout(() => {
      setShowMap(true);
      setMapReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
        riskStatus: 'KRR',
        hpl: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-xl p-6 md:p-10 border border-pink-100">
        
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-16 w-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="text-pink-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pendaftaran Ibu Hamil</h1>
          <p className="text-gray-500 text-sm mt-1">Lengkapi satu langkah mudah untuk mendapatkan layanan TINAKU</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            <div className="space-y-8">
              <section className="space-y-6">
                <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] border-l-4 border-pink-500 pl-4 py-1">01. Akses Akun</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 ml-1">Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="w-full px-5 py-4 rounded-[20px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all" placeholder="Username" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        name="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required 
                        className="w-full px-5 py-4 pr-12 rounded-[20px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all" 
                        placeholder="Min. 6 char" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] border-l-4 border-pink-500 pl-4 py-1">02. Data Personal</h3>
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 ml-1">Nama Lengkap</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-5 py-4 rounded-[20px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all" placeholder="Sesuai KTP" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 ml-1">NIK (16 Digit)</label>
                      <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} required maxLength={16} className="w-full px-5 py-4 rounded-[20px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all" placeholder="Angka Saja" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 ml-1">Umur</label>
                      <input type="number" name="age" value={formData.age} onChange={handleInputChange} required className="w-full px-5 py-4 rounded-[20px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all" placeholder="Tahun" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 ml-1">Kelurahan</label>
                    <input type="text" name="kelurahan" value={formData.kelurahan} onChange={handleInputChange} required className="w-full px-5 py-4 rounded-[20px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all" placeholder="Kelurahan Domisili" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 ml-1">Alamat Lengkap</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={2} className="w-full px-5 py-4 rounded-[20px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all resize-none" placeholder="RT/RW, No. Rumah, dll"></textarea>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="space-y-6">
                <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] border-l-4 border-pink-500 pl-4 py-1">03. Lokasi Geografis</h3>
                
                <div className="flex flex-col gap-6">
                  <button type="button" onClick={getCurrentLocation} className="w-full bg-pink-50 text-pink-500 font-black py-4 rounded-[20px] text-xs hover:bg-pink-100 transition-all border border-pink-100 flex items-center justify-center gap-3 shadow-sm">
                    <LocateFixed className="w-5 h-5" /> Deteksi Lokasi Saya (GPS)
                  </button>

                  <div className="h-[250px] md:h-[350px] rounded-[32px] overflow-hidden border-4 border-white shadow-2xl relative bg-gray-100 flex items-center justify-center">
                    {!showMap && (
                      <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="h-10 w-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Memuat Peta...</p>
                      </div>
                    )}
                    {showMap && (
                      <div className="absolute inset-0 animate-in fade-in zoom-in-95 duration-700">
                        <LocationPickerMap 
                          key="register-full-map-instance"
                          lat={parseFloat(formData.lat) || -6.205} 
                          lng={parseFloat(formData.lng) || 106.82} 
                          onChange={(lat, lng) => setFormData(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }))} 
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm">
                      <span className="text-[10px] font-black text-gray-400 block uppercase tracking-tighter mb-1">Latitude</span>
                      <span className="text-xs font-mono font-black text-pink-500">{formData.lat || '0.000000'}</span>
                    </div>
                    <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm">
                      <span className="text-[10px] font-black text-gray-400 block uppercase tracking-tighter mb-1">Longitude</span>
                      <span className="text-xs font-mono font-black text-pink-500">{formData.lng || '0.000000'}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                     <MapIcon className="w-5 h-5 text-blue-500 shrink-0" />
                     <p className="text-[10px] font-bold text-blue-600 leading-relaxed">Geser penanda di atas untuk menentukan posisi rumah Ibu dengan lebih akurat.</p>
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
