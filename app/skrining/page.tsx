"use client";

import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Save, 
  ArrowLeft,
  AlertCircle,
  Users,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { bumilApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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

export default function SkriningBidanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bumilList, setBumilList] = useState<any[]>([]);
  const [selectedBumilId, setSelectedBumilId] = useState('');
  const [responses, setResponses] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // State untuk Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user || user.role !== 'bidan') {
      router.push('/login');
    } else {
      fetchBumil();
    }
  }, [user, router]);

  const fetchBumil = async () => {
    try {
      const res = await bumilApi.getAll();
      setBumilList(res.data);
    } catch (error) {
      console.error('Failed to fetch bumil');
    } finally {
      setIsFetching(false);
    }
  };

  // Logika Filter & Pagination
  const filteredBumil = bumilList.filter(b => 
    (b.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (b.nik?.includes(searchQuery) || false)
  );

  const totalPages = Math.ceil(filteredBumil.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBumil.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1); // Reset ke halaman 1 saat mencari
  }, [searchQuery]);

  useEffect(() => {
    if (selectedBumilId) {
      const selectedBumil = bumilList.find(b => b.id.toString() === selectedBumilId);
      if (selectedBumil && selectedBumil.ksprResponses) {
        // Jika ada data ksprResponses sebelumnya, gunakan itu
        setResponses(selectedBumil.ksprResponses);
      } else {
        // Jika tidak ada, kosongkan
        setResponses({});
      }
    } else {
      setResponses({});
    }
  }, [selectedBumilId, bumilList]);

  const handleKSPRChange = (id: number) => {
    setResponses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateTotalScore = () => {
    let total = 2;
    ksprQuestions.forEach(q => {
      if (responses[q.id]) total += q.score;
    });
    return total;
  };

  const totalScore = calculateTotalScore();

  const getRiskStatus = (score: number) => {
    if (score === 2) return 'KRR';
    if (score >= 6 && score <= 10) return 'KRT';
    return 'KRST';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBumilId) {
      toast.error('Pilih Ibu Hamil terlebih dahulu!');
      return;
    }

    setIsLoading(true);
    const riskStatus = getRiskStatus(totalScore);

    try {
      const selectedBumil = bumilList.find(b => b.id.toString() === selectedBumilId);
      await bumilApi.update(selectedBumilId, {
        ...selectedBumil,
        riskStatus,
        ksprScore: totalScore,
        ksprResponses: responses // Simpan seluruh jawaban kuesioner
      });
      toast.success('Skrining berhasil disimpan!');
      router.push('/');
    } catch (error) {
      toast.error('Gagal menyimpan hasil skrining');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="min-h-screen bg-pink-50 flex items-center justify-center font-bold text-pink-500">Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:px-8 md:py-6 rounded-3xl shadow-sm border border-pink-50">
          <div className="flex items-center gap-4">
            <Link href="/" className="h-10 w-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm shrink-0">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Skrining Faktor Risiko</h1>
              <p className="text-xs md:text-sm text-gray-500">Kuesioner KSPR Digital</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-pink-50/50 p-3 rounded-2xl border border-pink-100 self-end md:self-auto">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Skor</p>
              <p className="text-2xl font-black text-pink-500 leading-none">{totalScore}</p>
            </div>
            <div className="w-[1px] h-8 bg-pink-100"></div>
            <div className={`font-bold px-3 py-1.5 rounded-xl text-xs md:text-sm ${
              totalScore === 2 ? 'bg-green-500 text-white shadow-sm shadow-green-100' :
              totalScore <= 10 ? 'bg-yellow-500 text-white shadow-sm shadow-yellow-100' : 'bg-red-500 text-white shadow-sm shadow-red-100'
            }`}>
              {getRiskStatus(totalScore)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Pilih Bumil */}
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pink-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Pilih Ibu Hamil</h2>
              </div>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari Nama / NIK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {currentItems.length > 0 ? (
                currentItems.map((bumil) => (
                  <div 
                    key={bumil.id}
                    onClick={() => setSelectedBumilId(bumil.id.toString())}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                      selectedBumilId === bumil.id.toString() 
                        ? 'bg-pink-50 border-pink-200 shadow-sm shadow-pink-100' 
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        selectedBumilId === bumil.id.toString() ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                      }`}>
                        {bumil.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${selectedBumilId === bumil.id.toString() ? 'text-pink-900' : 'text-gray-900'}`}>
                          {bumil.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-medium">NIK: {bumil.nik}</p>
                      </div>
                    </div>
                    {selectedBumilId === bumil.id.toString() && (
                      <div className="h-6 w-6 bg-pink-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 font-medium italic">Ibu hamil tidak ditemukan</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-medium">
                  Halaman <span className="text-gray-900">{currentPage}</span> dari {totalPages}
                </p>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button 
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-gray-900 text-white disabled:opacity-30 hover:bg-gray-800 transition-colors"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Section: Kuesioner KSPR */}
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-rose-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Kuesioner KSPR</h2>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 md:p-5 mb-8 flex gap-4">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-amber-800 leading-relaxed font-medium">
                Pilih <strong className="text-amber-900">"Ya"</strong> jika kondisi di bawah ini ditemukan pada ibu hamil.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {ksprQuestions.map((q) => (
                <div 
                  key={q.id} 
                  className={`flex items-center justify-between p-4 md:p-5 rounded-2xl transition-all cursor-pointer border ${
                    responses[q.id] 
                      ? 'bg-rose-50 border-rose-200 shadow-sm shadow-rose-100' 
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => handleKSPRChange(q.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-gray-300 w-5 uppercase">{q.id.toString().padStart(2, '0')}</span>
                    <span className={`text-sm font-bold leading-tight ${responses[q.id] ? 'text-rose-900' : 'text-gray-600'}`}>
                      {q.text}
                    </span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-all shrink-0 ${responses[q.id] ? 'bg-rose-500' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${responses[q.id] ? 'left-5 shadow-sm' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={isLoading || !selectedBumilId}
            className="w-full bg-pink-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Hasil Skrining'}
            <Save className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
