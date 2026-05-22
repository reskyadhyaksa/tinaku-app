"use client";

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Baby, 
  Heart, 
  ShieldAlert, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2, 
  Clock,
  Waves,
  Stethoscope,
  Smile,
  ShieldCheck,
  Smartphone,
  Info
} from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    id: 'A',
    title: 'Perjalanan Kehamilan Ibu',
    icon: Baby,
    color: 'bg-pink-500',
    sections: [
      {
        title: 'Trimester 1 (1–3 Bulan)',
        content: [
          'Masa penting pembentukan bagian tubuh janin.',
          'Edukasi cara mengatasi gejala mual, muntah, dan mudah lelah.',
          'Panduan porsi makan seimbang dan kewajiban minum Tablet Tambah Darah (TTD) secara rutin sebelum tidur.'
        ]
      },
      {
        title: 'Trimester 2 (4–6 Bulan)',
        content: [
          'Ibu mulai merasakan gerakan janin (menendang) pada usia 5 bulan.',
          'Panduan pengisian persiapan melahirkan (P4K) sejak dini.',
          'Tanda Bahaya: Demam tinggi, muntah darah, nyeri perut hebat, perdarahan.'
        ]
      },
      {
        title: 'Trimester 3 (7–9 Bulan)',
        content: [
          'Kondisi Normal: Mudah lelah, sulit tidur, sering BAK, kaki bengkak.',
          'Pemantauan Gerakan: Minimal 10 kali dalam 12 jam.',
          'Tanda Bahaya: Ketuban pecah tanpa kontraksi, pusing berat.'
        ]
      },
      {
        title: 'Kesehatan Jiwa & Kelas Ibu',
        content: [
          'Edukasi gejolak emosi (sedih, marah, stres) dan dampaknya bagi janin.',
          'Pentingnya Kelas Ibu Hamil bersama dukungan suami.'
        ]
      }
    ]
  },
  {
    id: 'B',
    title: 'Proses Melahirkan',
    icon: Waves,
    color: 'bg-blue-500',
    sections: [
      {
        title: 'Tanda Awal Persalinan',
        content: [
          'Mulas teratur yang semakin lama semakin kuat.',
          'Keluarnya lendir bercampur darah atau cairan ketuban.'
        ]
      },
      {
        title: 'Pentingnya Fasyankes',
        content: [
          'Wajib dilakukan di Puskesmas, RS, atau Klinik Bersalin untuk penanganan medis darurat.'
        ]
      },
      {
        title: 'Tanda Bahaya & IMD',
        content: [
          'Bahaya: Tali pusat/tangan bayi keluar, kejang, ketuban hijau berbau.',
          'Inisiasi Menyusu Dini (IMD): Kontak kulit ke kulit minimal 1 jam segera setelah lahir.'
        ]
      }
    ]
  },
  {
    id: 'C',
    title: 'Pasca Melahirkan',
    icon: Heart,
    color: 'bg-rose-500',
    sections: [
      {
        title: 'Pelayanan Kesehatan Nifas',
        content: [
          'Minimal 4 kali kunjungan nifas (KF1–KF4) oleh tenaga kesehatan.'
        ]
      },
      {
        title: 'Perawatan Ibu Nifas',
        content: [
          'Kebersihan diri, perawatan luka operasi, gizi bervariasi.',
          'Minum minimal 14 gelas sehari pada 6 bulan pertama menyusui.'
        ]
      },
      {
        title: 'ASI Eksklusif',
        content: [
          'Pemberian hanya ASI saja selama 6 bulan pertama kehidupan anak.'
        ]
      }
    ]
  },
  {
    id: 'D',
    title: 'Perjalanan Anak & Pola Asuh',
    icon: Smile,
    color: 'bg-amber-500',
    sections: [
      {
        title: 'Perawatan Bayi Baru Lahir',
        content: [
          'Mengenali pola tidur (hingga 16 jam sehari).',
          'Perawatan tali pusat agar tetap terbuka dan kering.'
        ]
      },
      {
        title: 'Aturan Penggunaan Gawai (Gadget)',
        content: [
          'Usia < 18 bulan: Tidak boleh menggunakan gawai (kecuali video-call didampingi).',
          'Dampak Buruk: Speech delay, tantrum, gangguan kognitif.'
        ]
      },
      {
        title: 'Pemantauan Rutin',
        content: [
          'Rutin ke Posyandu setiap bulan untuk pantau tumbuh kembang.'
        ]
      }
    ]
  },
  {
    id: 'E',
    title: 'Informasi Umum & Darurat',
    icon: ShieldAlert,
    color: 'bg-gray-800',
    sections: [
      {
        title: 'Keselamatan Lingkungan',
        content: [
          'Hindarkan anak dari risiko cedera, luka bakar, bahaya listrik, dan tenggelam.'
        ]
      },
      {
        title: 'Kesiapsiagaan Bencana',
        content: [
          'Panduan khusus bumil, nifas, dan balita dalam menghadapi bencana.',
          'Pembuatan rencana darurat keluarga dan menjaga stabilitas psikologis.'
        ]
      }
    ]
  }
];

export default function EdukasiPage() {
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (hasLoaded) {
      const element = document.getElementById('module-content');
      if (element) {
        const yOffset = -90; // Elegant offset to clear the sticky header
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      setHasLoaded(true);
    }
  }, [activeModule.id]);

  const activeIndex = modules.findIndex(m => m.id === activeModule.id);

  return (
    <div className="min-h-screen bg-white font-sans pb-16 animate-fade-in-up">

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-center relative">
          <div className="absolute left-4 md:left-6">
            <Link 
              href="/" 
              className="h-9 w-9 md:h-10 md:w-10 bg-white border border-gray-150 rounded-xl flex items-center justify-center hover:bg-gray-50 text-gray-500 hover:text-pink-500 transition-all shadow-sm shrink-0"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="text-pink-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <h1 className="text-sm md:text-xl font-black text-gray-900 tracking-tight">Katalog Edukasi KIA</h1>
           </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-12 space-y-4 md:space-y-8">

        <div className="bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-xl shadow-red-200 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 relative overflow-hidden">
          <div className="space-y-1.5 md:space-y-2 max-w-2xl relative z-10 w-full">
            <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> BARU & INTERAKTIF
            </span>
            <h2 className="text-sm md:text-2xl font-black tracking-tight leading-snug">
              Buku Saku Digital Tanda Bahaya Kehamilan (Bisa Bersuara)
            </h2>
            <p className="hidden md:block text-xs md:text-sm text-red-50 font-semibold leading-relaxed">
              Khusus untuk Ibu yang malas membaca atau ingin cara praktis, halaman ini bisa membacakan tanda bahaya kehamilan langsung dengan suara bahasa Indonesia, lengkap dengan kuis interaktif kebiasaan harian (Boleh vs Tidak Boleh)!
            </p>
          </div>
          <Link 
            href="/tanda-bahaya"
            className="w-full md:w-auto bg-white text-red-600 hover:bg-red-50 py-2 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider shadow-lg text-center whitespace-nowrap active:scale-[0.98] transition-all relative z-10 mt-1 md:mt-0"
          >
            Buka Buku Saku Suara →
          </Link>
        </div>

        <div className="lg:hidden relative w-full mb-4 md:mb-8">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-gray-900 text-white rounded-2xl md:rounded-3xl border border-gray-800 shadow-xl shadow-gray-200/50 transition-all hover:bg-gray-800 active:scale-[0.99] text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 md:h-11 md:w-11 ${activeModule.color} rounded-xl md:rounded-2xl flex items-center justify-center text-white shrink-0`}>
                <activeModule.icon className="w-5 h-5 md:w-5.5 md:h-5.5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase opacity-60 tracking-wider">Modul Terpilih</p>
                <h3 className="text-xs md:text-sm font-black mt-0.5 leading-tight">{activeModule.title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-2 py-0.5 bg-white/10 rounded-full">
                {activeIndex + 1}/{modules.length}
              </span>
              {isDropdownOpen ? <ChevronUp className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> : <ChevronDown className="w-3.5 h-3.5 text-pink-400" />}
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute top-[58px] md:top-[72px] left-0 right-0 z-50 bg-white border border-gray-100 rounded-2xl md:rounded-[28px] p-2 shadow-2xl space-y-1 animate-in slide-in-from-top-3 duration-250 max-h-[300px] overflow-y-auto">
                {modules.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setActiveModule(m);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 p-2.5 rounded-xl transition-all border text-left ${
                      activeModule.id === m.id 
                      ? 'bg-pink-50 text-pink-600 border-pink-100/50 font-bold shadow-sm' 
                      : 'bg-white text-gray-600 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activeModule.id === m.id ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <m.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-black uppercase opacity-60">Modul {m.id}</p>
                      <p className="text-xs font-bold truncate">{m.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">

          <aside className="hidden lg:block w-full lg:w-80 shrink-0 space-y-4">
            <div className="p-6 bg-pink-50 rounded-3xl border border-pink-100 mb-8">
               <p className="text-xs font-black text-pink-500 uppercase tracking-widest mb-2">Kurikulum</p>
               <h2 className="text-lg font-bold text-gray-900 leading-tight">Materi Resmi KIA 2024</h2>
            </div>
            
            <div className="space-y-2">
              {modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                    activeModule.id === m.id 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200' 
                    : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    activeModule.id === m.id ? 'bg-pink-500' : 'bg-gray-100'
                  }`}>
                    <m.icon className={`w-5 h-5 ${activeModule.id === m.id ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase opacity-50">Modul {m.id}</p>
                    <p className="text-sm font-bold truncate w-40">{m.title}</p>
                  </div>
                  <ChevronRight className={`ml-auto w-4 h-4 transition-transform ${activeModule.id === m.id ? 'translate-x-1' : ''}`} />
                </button>
              ))}
            </div>
          </aside>

          <main id="module-content" className="flex-1 space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="flex items-center gap-3 md:gap-6 pb-4 md:pb-8 border-b border-gray-100">
               <div className={`h-12 w-12 md:h-16 md:w-16 ${activeModule.color} rounded-2xl md:rounded-[24px] flex items-center justify-center text-white shadow-lg md:shadow-xl shrink-0`}>
                  <activeModule.icon className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <div>
                  <h2 className="text-lg md:text-4xl font-black text-gray-900 tracking-tight leading-tight">{activeModule.title}</h2>
                  <p className="text-gray-400 text-[10px] md:text-sm font-medium mt-0.5">Lengkap berdasarkan standar resmi Buku KIA.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {activeModule.sections.map((section, idx) => (
                <div key={idx} className="bg-gray-50/50 p-4 md:p-8 rounded-2xl md:rounded-[40px] border border-gray-100 space-y-3 md:space-y-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
                  <h3 className="text-sm md:text-xl font-black text-gray-900 flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-pink-500 shrink-0"></span>
                    {section.title}
                  </h3>
                  <ul className="space-y-2 md:space-y-4">
                    {section.content.map((point, pIdx) => (
                      <li key={pIdx} className="flex gap-2.5 md:gap-4">
                        <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                           <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 p-5 md:p-10 rounded-2xl md:rounded-[40px] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110 duration-700 hidden md:block">
                 <Info className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-2 md:space-y-4 max-w-lg">
                 <div className="flex items-center gap-2 text-pink-400 font-black text-xs uppercase tracking-widest">
                    <Clock className="w-4 h-4" /> Tips Penting
                 </div>
                 <h4 className="text-base md:text-2xl font-black">Pastikan Suami Terlibat.</h4>
                 <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
                    Keberhasilan 1000 HPK dan kesehatan mental Ibu sangat bergantung pada dukungan lingkungan terdekat. Pelajari modul ini bersama pasangan Anda.
                 </p>
              </div>
            </div>

            <div className="flex flex-row justify-between items-center gap-3 pt-4 md:pt-8 border-t border-gray-100 w-full">
              <button
                type="button"
                onClick={() => {
                  if (activeIndex > 0) {
                    setActiveModule(modules[activeIndex - 1]);
                  }
                }}
                disabled={activeIndex === 0}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-[10px] sm:text-xs md:text-sm border shadow-sm transition-all active:scale-98 ${
                  activeIndex === 0
                    ? 'bg-gray-50 border-gray-150 text-gray-300 cursor-not-allowed opacity-55'
                    : 'bg-white border-gray-205 text-gray-700 hover:border-pink-300 hover:text-pink-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">Sebelumnya</span>
              </button>

              <span className="hidden sm:inline-block text-xs font-black text-gray-400 uppercase tracking-widest text-center shrink-0">
                {activeIndex + 1} dari {modules.length} Modul
              </span>

              <button
                type="button"
                onClick={() => {
                  if (activeIndex < modules.length - 1) {
                    setActiveModule(modules[activeIndex + 1]);
                  }
                }}
                disabled={activeIndex === modules.length - 1}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-[10px] sm:text-xs md:text-sm border shadow-sm transition-all active:scale-98 ${
                  activeIndex === modules.length - 1
                    ? 'bg-gray-50 border-gray-150 text-gray-300 cursor-not-allowed opacity-55'
                    : 'bg-gray-900 border-gray-900 text-white hover:bg-pink-600 hover:border-pink-600 shadow-lg shadow-pink-100'
                }`}
              >
                <span className="truncate">Selanjutnya</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
