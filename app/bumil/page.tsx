"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Search, 
  Edit3, 
  AlertCircle, 
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  Calendar,
  Trash2
} from 'lucide-react';
import { bumilApi } from '@/lib/api';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 6;

export default function DataBumilPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bumils, setBumils] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || user.role !== 'bidan') {
      router.push('/login');
    } else {
      fetchBumils();
    }
  }, [user]);

  const fetchBumils = async () => {
    try {
      const res = await bumilApi.getAll();
      setBumils(res.data);
    } catch (error) {
      toast.error('Gagal mengambil data ibu hamil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      await bumilApi.delete(id);
      toast.success('Data berhasil dihapus');
      fetchBumils(); // Refresh data
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset page on search
  }, [searchQuery]);

  const filteredBumils = bumils.filter(b => 
    (b.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (b.nik?.includes(searchQuery) || false)
  );

  const totalPages = Math.ceil(filteredBumils.length / ITEMS_PER_PAGE);
  const paginatedBumils = filteredBumils.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) return <div className="min-h-screen bg-pink-50 flex items-center justify-center font-bold text-pink-500">Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-100">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100">
              <Heart className="text-white w-8 h-8 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Data Ibu Hamil</h1>
              <p className="text-gray-500 font-medium">Kelola dan lengkapi profil Ibu Hamil</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari Nama atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Bumil Grid/List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBumils.map((bumil) => {
            const isIncomplete = !bumil.nik || !bumil.address || !bumil.kelurahan;
            
            return (
              <div 
                key={bumil.id} 
                className="bg-white rounded-3xl p-6 shadow-sm border border-pink-50 hover:shadow-md transition-all group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 font-black text-xl">
                    {bumil.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isIncomplete && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Belum Lengkap</span>
                      </div>
                    )}
                    <button 
                      onClick={() => handleDelete(bumil.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{bumil.name}</h3>
                <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">NIK: {bumil.nik || 'Belum diisi'}</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-pink-300" />
                    <span className="font-medium">{bumil.age} Tahun</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-pink-300" />
                    <span className="font-medium truncate">{bumil.address || 'Alamat belum lengkap'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-50">
                  <button 
                    onClick={() => router.push(`/bumil/${bumil.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-pink-500 text-white rounded-xl font-bold text-xs hover:bg-pink-600 transition-all"
                  >
                    <Edit3 className="w-4 h-4" /> Lengkapi Data
                  </button>
                  <button 
                    onClick={() => router.push(`/skrining?id=${bumil.id}`)}
                    className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-all border border-gray-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-3 bg-white rounded-xl border border-pink-100 text-gray-500 hover:text-pink-500 disabled:opacity-30 disabled:hover:text-gray-500 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    currentPage === i + 1 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' 
                    : 'bg-white text-gray-400 border border-gray-100 hover:bg-pink-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-3 bg-white rounded-xl border border-pink-100 text-gray-500 hover:text-pink-500 disabled:opacity-30 disabled:hover:text-gray-500 transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {filteredBumils.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold italic">Data ibu hamil tidak ditemukan</p>
          </div>
        )}

      </div>
    </div>
  );
}
