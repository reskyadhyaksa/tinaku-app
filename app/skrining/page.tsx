"use client";

import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  ClipboardCheck, 
  Save, 
  LocateFixed, 
  ArrowLeft,
  AlertCircle,
  Map as MapIcon,
  MousePointer2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl mt-4" />
});

// 20 Faktor Risiko KSPR (Kartu Poedji Rochjati)
const ksprQuestions = [
  { id: 1, text: "Umur Terlalu Muda (≤ 20 tahun)", score: 4 },
  { id: 2, text: "Umur Terlalu Tua (≥ 35 tahun)", score: 4 },
  { id: 3, text: "Terlalu Lambat Hamil I (≥ 4 tahun kawin)", score: 4 },
  { id: 4, text: "Terlalu Lama Hamil Lagi (≥ 10 tahun)", score: 4 },
  { id: 5, text: "Terlalu Cepat Hamil Lagi (< 2 tahun)", score: 4 },
  { id: 6, text: "Terlalu Banyak Anak (4 atau lebih)", score: 4 },
  { id: 7, text: "Terlalu Pendek (Tinggi badan < 145 cm)", score: 4 },
  { id: 8, text: "Pernah Gagal Kehamilan (Keguguran/Lahir Mati)", score: 4 },
  { id: 9, text: "Pernah Lahir dengan Tindakan (Vakum/Sungsang)", score: 4 },
  { id: 10, text: "Pernah Operasi Caesar", score: 8 },
  { id: 11, text: "Penyakit (Kurang Darah/Malaria/TBC/Jantung)", score: 4 },
  { id: 12, text: "Bengkak Muka/Tangan & Tekanan Darah Tinggi", score: 4 },
  { id: 13, text: "Hamil Kembar", score: 4 },
  { id: 14, text: "Hidramnion (Air ketuban terlalu banyak)", score: 4 },
  { id: 15, text: "Bayi Mati dalam Kandungan", score: 4 },
  { id: 16, text: "Kehamilan Lebih Bulan (Serotinus)", score: 4 },
  { id: 17, text: "Letak Sungsang", score: 8 },
  { id: 18, text: "Letak Lintang", score: 8 },
  { id: 19, text: "Perdarahan dalam Kehamilan", score: 8 },
  { id: 20, text: "Preeklampsia Berat / Eklampsia (Kejang)", score: 8 },
];

export default function SkriningPage() {
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    age: '',
    address: '',
    kelurahan: '',
    lat: '',
    lng: ''
  });

  const [responses, setResponses] = useState<Record<number, boolean>>({});
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKSPRChange = (id: number) => {
    setResponses(prev => ({ ...prev, [id]: !prev[id] }));
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
          alert("Gagal mengambil lokasi: " + error.message);
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation tidak didukung di browser ini.");
      setIsLocating(false);
    }
  };

  const calculateTotalScore = () => {
    let total = 2; // Skor Awal Ibu Hamil
    ksprQuestions.forEach(q => {
      if (responses[q.id]) total += q.score;
    });
    return total;
  };

  const getRiskStatus = (score: number) => {
    if (score === 2) return { label: 'KRR (Risiko Rendah)', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 6 && score <= 10) return { label: 'KRT (Risiko Tinggi)', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'KRST (Risiko Sangat Tinggi)', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const totalScore = calculateTotalScore();
  const riskStatus = getRiskStatus(totalScore);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button & Title */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="h-10 w-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pendaftaran & Skrining</h1>
              <p className="text-sm text-gray-500">Input data baru pemeriksaan ibu hamil</p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${riskStatus.bg}`}>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Skor KSPR</p>
              <p className={`text-xl font-black ${riskStatus.color}`}>{totalScore}</p>
            </div>
            <div className="w-[1px] h-8 bg-gray-200"></div>
            <p className={`font-bold text-sm ${riskStatus.color}`}>{riskStatus.label}</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Section 1: Data Personal */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <User className="text-blue-600 w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Data Personal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Contoh: Siti Aminah"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">NIK (Nomor Induk Kependudukan)</label>
                <input 
                  type="text" name="nik" value={formData.nik} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="16 digit nomor NIK"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Umur (Tahun)</label>
                <input 
                  type="number" name="age" value={formData.age} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Contoh: 28"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Kelurahan</label>
                <input 
                  type="text" name="kelurahan" value={formData.kelurahan} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Masukkan nama kelurahan"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Alamat Lengkap</label>
                <textarea 
                  name="address" value={formData.address} onChange={handleInputChange} rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Jl. Merdeka No. 123..."
                />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span>Titik Koordinat Rumah</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowMap(!showMap)}
                    className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                      showMap ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <MapIcon className="w-4 h-4" />
                    {showMap ? 'Tutup Peta' : 'Pilih di Peta'}
                  </button>
                  <button 
                    onClick={getCurrentLocation}
                    disabled={isLocating}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Mencari Lokasi...' : 'Lokasi Saat Ini'}
                  </button>
                </div>
              </div>

              {showMap && (
                <LocationPickerMap 
                  lat={parseFloat(formData.lat) || 0} 
                  lng={parseFloat(formData.lng) || 0} 
                  onChange={(lat, lng) => {
                    setFormData(prev => ({
                      ...prev,
                      lat: lat.toFixed(6),
                      lng: lng.toFixed(6)
                    }));
                  }}
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-sm">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Latitude</span>
                  <span className="font-mono text-gray-700">{formData.lat || '-'}</span>
                </div>
                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-sm">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Longitude</span>
                  <span className="font-mono text-gray-700">{formData.lng || '-'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Kuesioner KSPR */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="text-purple-600 w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Skrining KSPR Digital</h2>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800 leading-relaxed">
                Pilih <strong>"Ya"</strong> jika kondisi di bawah ini ditemukan pada ibu hamil. Skor akan dihitung otomatis sesuai bobot Kartu Poedji Rochjati.
              </p>
            </div>

            <div className="space-y-1">
              {ksprQuestions.map((q) => (
                <div 
                  key={q.id} 
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-gray-50 cursor-pointer group ${responses[q.id] ? 'bg-purple-50/50' : ''}`}
                  onClick={() => handleKSPRChange(q.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-300 group-hover:text-purple-300 transition-colors w-4">{q.id}.</span>
                    <span className={`text-sm font-medium ${responses[q.id] ? 'text-purple-900' : 'text-gray-700'}`}>
                      {q.text}
                    </span>
                  </div>
                  
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${responses[q.id] ? 'bg-purple-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${responses[q.id] ? 'left-7' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 pb-12">
            <button className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Simpan Data & Skrining
            </button>
            <button className="px-8 bg-white border border-gray-200 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all">
              Batal
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
