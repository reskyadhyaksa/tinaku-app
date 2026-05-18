"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, 
  Activity, 
  BookOpen, 
  Home, 
  LogOut, 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  ClipboardCheck, 
  Sparkles,
  ArrowRight,
  Tablet,
  FileText
} from 'lucide-react';

export default function FiturAplikasiPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-pink-500 font-bold text-lg">
          Loading fitur...
        </div>
      </div>
    );
  }

  const features = [
    {
      category: "Fitur Ibu Hamil",
      badge: "Untuk Anda",
      badgeColor: "bg-pink-100 text-pink-700 border-pink-200/50",
      icon: Heart,
      iconBg: "bg-pink-50 text-pink-500",
      description: "Pantau kesehatan kehamilan Anda setiap hari dengan alat pelacakan mandiri yang modern.",
      items: [
        {
          name: "Pemantauan Tablet Tambah Darah (TTD)",
          desc: "Pelaporan konsumsi TTD harian secara digital, lengkap dengan kalkulator persentase kepatuhan minum dan proteksi validasi tanggal pendaftaran.",
          icon: Tablet
        },
        {
          name: "Grafik Pemantauan Medis Real-time",
          desc: "Visualisasi grafik denyut jantung janin (DJJ), tinggi fundus uteri (TFU), dan berat badan yang terupdate otomatis pasca pemeriksaan klinis.",
          icon: Activity
        },
        {
          name: "Status Risiko KSPR Mandiri",
          desc: "Menampilkan skor hasil skrining Poedji Rochjati Anda beserta tingkat kategori risiko (KRR/KRT/KRST) secara detail.",
          icon: ShieldCheck
        },
        {
          name: "Katalog Edukasi KIA Digital",
          desc: "Modul lengkap kurikulum resmi Buku KIA 2024 yang dioptimalkan khusus untuk kenyamanan membaca di perangkat mobile.",
          icon: BookOpen
        }
      ]
    },
    {
      category: "Fitur Bidan",
      badge: "Layanan Klinis",
      badgeColor: "bg-teal-100 text-teal-700 border-teal-200/50",
      icon: Users,
      iconBg: "bg-teal-50 text-teal-500",
      description: "Memudahkan Bidan dalam mencatat, mengelola, dan melacak data klinis seluruh ibu hamil secara terpusat.",
      items: [
        {
          name: "Registrasi & Profil Ibu Hamil",
          desc: "Kelola biodata dasar, riwayat kehamilan (gravida, partus, abortus), domisili peta/koordinat rumah, HPHT, dan HPL ibu hamil secara rapi.",
          icon: Users
        },
        {
          name: "Pencatatan Hasil Pemeriksaan Fisik",
          desc: "Form khusus bidan untuk menginputkan berat badan, tekanan darah, tinggi fundus, DJJ, dan status kesehatan HB.",
          icon: Stethoscope
        },
        {
          name: "Kuesioner KSPR Digital",
          desc: "Penentuan faktor risiko secara presisi melalui formulir KSPR digital yang menghitung skor otomatis secara real-time.",
          icon: ClipboardCheck
        }
      ]
    },
    {
      category: "Fitur Dokter Spesialis",
      badge: "Pemeriksaan USG",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200/50",
      icon: Stethoscope,
      iconBg: "bg-purple-50 text-purple-500",
      description: "Akses pemeriksaan medis lanjutan eksklusif bagi Dokter Spesialis Kandungan.",
      items: [
        {
          name: "Form Pencatatan USG Spesialis",
          desc: "Khusus untuk dokter, form usg akan terbuka secara eksklusif untuk mendokumentasikan temuan klinis pencitraan rahim.",
          icon: Sparkles
        },
        {
          name: "Diagnosis Medis Lanjutan",
          desc: "Kolaborasi pemeriksaan bidan & dokter yang terdokumentasi terpadu dalam satu rekam medis ibu hamil.",
          icon: FileText
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans pb-24 animate-fade-in-up">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-3xl shadow-sm border border-pink-100/50">
          <div className="flex items-center gap-6">
            <Link href={user ? (user.role === 'bumil' ? '/dashboard/bumil' : '/dashboard/admin') : '/'} className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-bold transition-all text-sm">
              <Home className="w-4 h-4 text-pink-400" />
              <span>Beranda</span>
            </Link>
            <Link href="/fitur" className="flex items-center gap-2 text-pink-500 font-bold transition-all text-sm">
              <Activity className="w-4 h-4 text-pink-500" />
              <span>Fitur Aplikasi</span>
            </Link>
            <Link href="/edukasi" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-bold transition-all text-sm">
              <BookOpen className="w-4 h-4 text-pink-400" />
              <span>Edukasi KIA</span>
            </Link>
          </div>
          {user ? (
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-pink-500 transition-colors">Masuk</Link>
              <Link href="/register" className="px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full shadow-md shadow-pink-100 hover:bg-pink-600 transition-all">Daftar</Link>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-gray-900 via-pink-950 to-gray-900 text-white rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-48 h-48 text-pink-400" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Peta Fitur Ekosistem TINAKU
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">Fitur Aplikasi</h1>
            <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed">
              TINAKU hadir sebagai jembatan digital yang menghubungkan Ibu Hamil, Bidan, dan Dokter dalam satu ekosistem terpadu demi kehamilan yang sehat, terpantau, dan bebas risiko tinggi.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {features.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 ${cat.iconBg} rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-pink-100/50`}>
                  <cat.icon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{cat.category}</h2>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${cat.badgeColor}`}>
                      {cat.badge}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm font-medium mt-0.5">{cat.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {cat.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className="bg-white p-6 md:p-8 rounded-[32px] border border-pink-50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex items-start gap-5"
                  >
                    <div className="h-12 w-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm md:text-base font-bold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-pink-100 p-8 rounded-[40px] text-center space-y-4">
          <h3 className="text-lg md:text-xl font-black text-gray-900">Mari Pantau Kesehatan Anda Hari Ini</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Perbarui log minum Tablet Tambah Darah atau tinjau kembali data perkembangan denyut jantung janin dan fisik Anda sekarang di dashboard personal.
          </p>
          <Link 
            href={user ? (user.role === 'bumil' ? '/dashboard/bumil' : '/dashboard/admin') : '/register'} 
            className="inline-flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs md:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-pink-100 transition-all active:scale-95"
          >
            <span>{user ? 'Buka Dashboard Anda' : 'Daftar Sekarang & Mulai Pantau'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
