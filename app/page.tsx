"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  ShieldCheck, 
  MapPin, 
  BarChart3, 
  ChevronRight, 
  Users, 
  Activity,
  ArrowRight,
  Info,
  AlertCircle,
  LogOut
} from 'lucide-react';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-pink-100 selection:text-pink-600">
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
              <Heart className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">TINAKU</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#fitur" className="text-sm font-bold text-gray-500 hover:text-pink-500 transition-colors">Fitur</Link>
            <Link href="/edukasi" className="text-sm font-bold text-gray-500 hover:text-pink-500 transition-colors">Edukasi KIA</Link>
            <Link href="#tentang" className="text-sm font-bold text-gray-500 hover:text-pink-500 transition-colors">Tentang Kami</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Akun Aktif</span>
                  <span className="text-sm font-bold text-gray-900">{user.name}</span>
                </div>
                <Link 
                  href={user.role === 'bidan' ? '/dashboard/bidan' : '/dashboard/bumil'} 
                  className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full shadow-lg hover:bg-pink-600 transition-all"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm shadow-red-100"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-6 py-2.5 text-sm font-bold text-gray-700 hover:text-pink-500 transition-all"
                >
                  Masuk
                </Link>
                <Link 
                  href="/register" 
                  className="px-6 py-2.5 bg-pink-500 text-white text-sm font-bold rounded-full shadow-lg shadow-pink-200 hover:bg-pink-600 hover:-translate-y-0.5 transition-all"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-pink-50/50 rounded-l-[100px] hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-500 rounded-full text-xs font-black uppercase tracking-widest border border-pink-100">
              <ShieldCheck className="w-4 h-4" /> Pendamping Digital Ibu Hamil
            </div>
            <h1 className="text-3xl md:text-7xl font-black text-gray-900 leading-[1.2] tracking-tight">
              Kawal Kehamilan <br/>
              <span className="text-pink-500 text-2xl md:text-6xl">Lebih Aman & Pintar.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
              TINAKU hadir untuk membantu Ibu Hamil memantau kesehatan janin secara mandiri dan terhubung langsung dengan Bidan Puskesmas secara real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/register" 
                className="group flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-5 rounded-2xl font-bold shadow-2xl hover:bg-pink-600 transition-all"
              >
                Mulai Pendaftaran <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#fitur" 
                className="flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-8 py-5 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                Pelajari Fitur
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-8 border-t border-gray-100">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-xs">
                    {String.fromCharCode(64+i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Bergabung dengan <span className="text-gray-900 font-bold">500+ Ibu Hamil</span> lainnya.
              </p>
            </div>
          </div>

          <div className="relative animate-in zoom-in duration-1000 delay-200">
            <div className="relative z-10 bg-white p-4 rounded-[40px] shadow-2xl shadow-pink-200/50 border border-pink-100">
              {/* Image Placeholder */}
              <div className="bg-pink-50 rounded-[30px] h-[400px] md:h-[500px] w-full flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent"></div>
                 <Activity className="w-32 h-32 text-pink-200 group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl border border-white/50">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-black text-pink-500 uppercase tracking-widest">Kondisi Klinis</span>
                       <span className="text-xs font-bold text-green-500">Normal</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full w-3/4 bg-pink-500"></div>
                    </div>
                 </div>
              </div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-xl border border-pink-50 animate-bounce duration-[3000ms] hidden md:block">
              <Users className="text-pink-500 w-8 h-8" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-pink-50 animate-pulse hidden md:block">
              <MapPin className="text-pink-500 w-8 h-8" />
            </div>
          </div>
        </div>
      </section>

      {/* 1000 HPK Campaign Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative z-10 bg-gradient-to-br from-pink-500 to-rose-600 p-12 rounded-[50px] text-white shadow-2xl">
                <h3 className="text-3xl md:text-5xl font-black mb-6 leading-tight">1000 <br/><span className="text-pink-200 text-xl md:text-3xl">Hari Pertama</span> Kehidupan</h3>
                <p className="text-lg text-pink-50 leading-relaxed font-medium mb-8">
                  Masa paling krusial dalam pertumbuhan anak. Mencakup <span className="font-black text-white underline decoration-pink-300">270 hari</span> dalam kandungan dan <span className="font-black text-white underline decoration-pink-300">730 hari</span> pertama setelah lahir.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                    <p className="text-3xl font-black mb-1">90%</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Perkembangan Otak</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                    <p className="text-3xl font-black mb-1">Emas</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Periode Pertumbuhan</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-xs font-black text-pink-500 uppercase tracking-[0.2em]">Pentingnya Nutrisi & Stimulasi</h2>
              <h3 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">Investasi Terbaik untuk <span className="text-pink-500">Masa Depan</span> Buah Hati.</h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                Periode ini merupakan jendela kesempatan emas yang menentukan kesehatan dan kecerdasan anak di masa depan. TINAKU membantu Ibu memastikan setiap hari dalam 1000 HPK terpantau dengan baik.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-pink-500 shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">Puncak perkembangan kemampuan berpikir dan fisik anak terjadi pada masa ini.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standar Pemeriksaan Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-pink-500/10 skew-x-12 translate-x-20"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-black text-pink-500 uppercase tracking-[0.2em]">Standar Kuantitas</h2>
            <h3 className="text-3xl md:text-6xl font-black tracking-tight">Wajib Minimal <span className="text-pink-500 underline decoration-white/20">6 Kali</span> Periksa.</h3>
            <p className="text-gray-400 font-medium">Selama masa kehamilan, pastikan Ibu mendapatkan pemeriksaan berkualitas oleh Dokter atau Bidan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm">
              <div className="text-5xl font-black text-pink-500 mb-4">1x</div>
              <h4 className="text-xl font-bold mb-2">Trimester 1</h4>
              <p className="text-sm text-gray-400 font-medium">Usia kehamilan 0-12 minggu. Fokus pada pembentukan janin.</p>
            </div>
            <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm">
              <div className="text-5xl font-black text-pink-500 mb-4">2x</div>
              <h4 className="text-xl font-bold mb-2">Trimester 2</h4>
              <p className="text-sm text-gray-400 font-medium">Usia kehamilan 13-28 minggu. Ibu mulai merasakan gerakan.</p>
            </div>
            <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm">
              <div className="text-5xl font-black text-pink-500 mb-4">3x</div>
              <h4 className="text-xl font-bold mb-2">Trimester 3</h4>
              <p className="text-sm text-gray-400 font-medium">Usia kehamilan 29-40 minggu. Persiapan persalinan matang.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Hotline Section */}
      <section className="py-24 bg-rose-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[50px] p-8 md:p-16 shadow-2xl shadow-rose-200/50 border border-rose-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Activity className="w-64 h-64 text-rose-500" />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" /> Akses Cepat Darurat
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">Kesiapsiagaan Hadapi <br/>Kondisi Darurat.</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Segera hubungi nomor di bawah ini jika mengalami tanda bahaya atau situasi bencana. Kecepatan penanganan menyelamatkan nyawa.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <a href="tel:112" className="flex items-center gap-3 bg-gray-900 text-white px-8 py-5 rounded-3xl font-black hover:bg-rose-600 transition-all shadow-xl">
                    Call Center 112
                  </a>
                  <Link href="/kontak" className="flex items-center gap-3 bg-white border border-rose-100 text-rose-500 px-8 py-5 rounded-3xl font-black hover:bg-rose-50 transition-all">
                    Lihat Kontak Wilayah
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Ambulans</p>
                    <p className="text-2xl font-black text-gray-900">118 / 119</p>
                 </div>
                 <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Puskesmas</p>
                    <p className="text-lg font-black text-gray-900">Hubungi Bidan Desa</p>
                 </div>
                 <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">RSUD Terdekat</p>
                    <p className="text-lg font-black text-gray-900">Siap 24 Jam</p>
                 </div>
                 <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Info Bencana</p>
                    <p className="text-lg font-black text-gray-900">BPBD Setempat</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="text-white w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-black tracking-tighter">TINAKU</span>
            </div>
            <p className="text-gray-400 max-w-sm">
              Inovasi pendamping ibu hamil berbasis digital untuk menurunkan angka kematian ibu dan bayi di Indonesia.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="font-black text-sm uppercase tracking-widest text-pink-500">Layanan</h5>
              <ul className="space-y-2 text-gray-400 text-sm font-bold">
                <li>Dashboard Bumil</li>
                <li>Panel Bidan</li>
                <li>Skrining KSPR</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-black text-sm uppercase tracking-widest text-pink-500">Kontak</h5>
              <ul className="space-y-2 text-gray-400 text-sm font-bold">
                <li>puskesmas@tinaku.id</li>
                <li>+62 812-3456-7890</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
          &copy; 2026 TINAKU - Pendamping Ibu Hamil Digital. All Rights Reserved.
        </div>
      </footer>

    </div>
  );
}
