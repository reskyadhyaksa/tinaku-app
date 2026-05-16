"use client";

import { useState } from 'react';
import { 
  BookOpen, 
  Baby, 
  Heart, 
  ShieldAlert, 
  ArrowLeft, 
  ChevronRight, 
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

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-all">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-bold">Kembali</span>
           </Link>
           <div className="flex items-center gap-2">
              <BookOpen className="text-pink-500 w-6 h-6" />
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Katalog Edukasi KIA</h1>
           </div>
           <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row gap-16">
        
        {/* Navigation Sidebar */}
        <aside className="lg:w-80 shrink-0 space-y-4">
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

        {/* Content Area */}
        <main className="flex-1 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
             <div className={`h-16 w-16 ${activeModule.color} rounded-[24px] flex items-center justify-center text-white shadow-xl`}>
                <activeModule.icon className="w-8 h-8" />
             </div>
             <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{activeModule.title}</h2>
                <p className="text-gray-400 font-medium">Lengkap berdasarkan standar resmi Buku KIA.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeModule.sections.map((section, idx) => (
              <div key={idx} className="bg-gray-50/50 p-8 rounded-[40px] border border-gray-100 space-y-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.content.map((point, pIdx) => (
                    <li key={pIdx} className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Tips Overlay */}
          <div className="bg-gray-900 p-10 rounded-[40px] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110 duration-700">
               <Info className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-4 max-w-lg">
               <div className="flex items-center gap-2 text-pink-400 font-black text-xs uppercase tracking-widest">
                  <Clock className="w-4 h-4" /> Tips Penting
               </div>
               <h4 className="text-2xl font-black">Pastikan Suami Terlibat.</h4>
               <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Keberhasilan 1000 HPK dan kesehatan mental Ibu sangat bergantung pada dukungan lingkungan terdekat. Pelajari modul ini bersama pasangan Anda.
               </p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
