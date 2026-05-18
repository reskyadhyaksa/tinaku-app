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
  UserPlus,
  Calendar,
  Trash2,
  LayoutGrid,
  List,
  MapPin,
  Stethoscope
} from 'lucide-react';
import { bumilApi } from '@/lib/api';
import toast from 'react-hot-toast';


export default function DataBumilPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bumils, setBumils] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1500); 
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!user || (user.role !== 'bidan' && user.role !== 'dokter' && user.role !== 'superadmin')) {
      router.push('/login');
    } else {
      fetchBumils();
    }
  }, [user, currentPage, debouncedSearch, viewMode]);

  const currentLimit = viewMode === 'list' ? 5 : 6;

  const fetchBumils = async () => {
    try {
      setIsLoading(true);
      const res = await bumilApi.getAll({ page: currentPage, limit: currentLimit, search: debouncedSearch });
      const items = res.data.data || (Array.isArray(res.data) ? res.data : []);
      const tPages = res.data.totalPages || 1;
      
      // If the current page is greater than the new total pages, shift page back
      if (currentPage > tPages && tPages >= 1) {
        setCurrentPage(tPages);
        return;
      }
      
      setBumils(items);
      setTotalPages(tPages);
    } catch (error: any) {
      if (error.response && error.response.status === 404 && currentPage > 1) {
        setCurrentPage(1);
      } else {
        toast.error('Gagal mengambil data ibu hamil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      await bumilApi.delete(id);
      toast.success('Data berhasil dihapus');
      
      // If we are deleting the last remaining item on any page > 1, go back to previous page
      if (bumils.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchBumils(); // Refresh data
      }
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset page on search
  }, [debouncedSearch]);


  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-100">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100">
              <Heart className="text-white w-8 h-8 fill-current" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Data Ibu Hamil</h1>
              <p className="text-sm md:text-md text-gray-500 font-medium">Kelola dan lengkapi profil Ibu Hamil</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => router.push('/dashboard/admin/bumil/tambah')}
              className="flex items-center justify-center gap-2 bg-pink-500 text-white px-5 py-4 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all w-full sm:w-auto shrink-0 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Ibu Hamil
            </button>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cari Nama, NIK, atau Alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 self-end sm:self-auto shrink-0">
              <button
                onClick={() => { setViewMode('card'); setCurrentPage(1); }}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-pink-500' : 'text-gray-400 hover:text-gray-600'}`}
                title="Card View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setViewMode('list'); setCurrentPage(1); }}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-pink-500' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bumil Grid/List */}
        <div className={viewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {isLoading ? (
            viewMode === 'card' ? (
              // Card Skeleton Loading
              Array.from({ length: currentLimit }).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] p-4 md:p-5 shadow-sm border border-pink-50 animate-pulse space-y-4 w-full max-w-none">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 bg-gray-100 rounded-xl"></div>
                    <div className="h-5 w-16 bg-amber-50 rounded-full border border-amber-100"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-2.5 bg-gray-100 rounded-lg w-1/2"></div>
                  </div>
                  <div className="space-y-2.5 pt-1">
                    <div className="h-3 bg-gray-100 rounded-md w-1/3"></div>
                    <div className="h-3 bg-gray-100 rounded-md w-2/3"></div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
              ))
            ) : (
              // List Skeleton Loading
              <>
                <div className="hidden md:grid grid-cols-[2.5fr_1fr_2.5fr_auto] gap-6 px-8 py-4 bg-white/50 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                  <div>Ibu Hamil & NIK</div>
                  <div className='ml-7'>Umur</div>
                  <div className='ml-7'>Alamat Tinggal</div>
                  <div className="text-right w-[180px]">Aksi & Kelola</div>
                </div>
                {Array.from({ length: currentLimit }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-5 md:px-8 md:py-5 shadow-sm border border-pink-50 animate-pulse grid grid-cols-1 md:grid-cols-[2.5fr_1fr_2.5fr_auto] items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-2xl shrink-0"></div>
                      <div className="space-y-2 w-full">
                        <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
                        <div className="h-3 bg-gray-100 rounded-md w-1/3"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-md w-16"></div>
                    <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
                    <div className="flex gap-2 justify-end w-full md:w-[180px]">
                      <div className="flex-1 h-9 bg-gray-100 rounded-xl"></div>
                      <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
                      <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </>
            )
          ) : (
            <>
              {viewMode === 'list' && bumils.length > 0 && (
                <div className="hidden md:grid grid-cols-[2.5fr_1fr_2.5fr_auto] gap-6 px-8 py-4 bg-white/50 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                  <div>Ibu Hamil & NIK</div>
                  <div className='ml-7'>Umur</div>
                  <div className='ml-7'>Alamat Tinggal</div>
                  <div className="text-right w-[180px]">Aksi & Kelola</div>
                </div>
              )}
              {bumils.map((bumil) => {
            const isIncomplete = !bumil.nik || !bumil.address || !bumil.kelurahan;
            
            if (viewMode === 'list') {
              return (
                <div key={bumil.id} className="bg-white rounded-3xl p-5 md:px-8 md:py-5 shadow-sm border border-pink-50 hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-[2.5fr_1fr_2.5fr_auto] items-center gap-4 md:gap-6 group">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="h-12 w-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 font-black text-xl shrink-0">
                      {bumil.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-sm md:text-base font-bold text-gray-900 flex flex-wrap items-center gap-2">
                        <span className="truncate">{bumil.name}</span>
                        {isIncomplete && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[9px] font-black uppercase shrink-0">
                            <AlertCircle className="w-3 h-3" /> Tidak Lengkap
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">NIK: {bumil.nik || 'Belum diisi'}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5 text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                        <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded shrink-0">G: {bumil.gravida || 1}</span>
                        <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded shrink-0">P: {bumil.partus || 0}</span>
                        <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded shrink-0">A: {bumil.abortus || 0}</span>
                        {bumil.hpl ? (
                          <span className="bg-purple-100/80 text-purple-800 px-2 py-0.5 rounded shrink-0 border border-purple-200 font-extrabold text-[10px]">HPL: {new Date(bumil.hpl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        ) : (
                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded shrink-0 border border-red-100 font-extrabold text-[10px] uppercase">HPL: hpht belum di inputkan</span>
                        )}
                        {bumil.hpht ? (
                          <span className="bg-blue-100/80 text-blue-800 px-2 py-0.5 rounded shrink-0 border border-blue-200 font-extrabold text-[10px]">HPHT: {new Date(bumil.hpht).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        ) : (
                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded shrink-0 border border-red-100 font-extrabold text-[10px] uppercase">HPHT: hpht belum di inputkan</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 py-2 md:py-0 border-y md:border-none border-gray-50">
                    <Calendar className="w-4 h-4 text-pink-300 shrink-0" />
                    <span className="font-medium">{bumil.age} Tahun</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 py-2 md:py-0 overflow-hidden">
                    <MapPin className="w-4 h-4 text-pink-300 shrink-0" />
                    <span className="font-medium line-clamp-2 md:line-clamp-1 break-words" title={bumil.address}>{bumil.address || 'Alamat belum lengkap'}</span>
                  </div>

                  <div className="flex items-center gap-2 justify-end pt-4 md:pt-0 mt-2 md:mt-0 border-t md:border-none border-gray-50 w-full md:w-[260px]">
                    <button 
                      onClick={() => router.push(`/dashboard/admin/bumil/${bumil.id}/checkup`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-pink-500 text-white rounded-xl font-bold text-xs hover:bg-pink-600 transition-all shrink-0"
                    >
                      <Stethoscope className="w-4 h-4 shrink-0" /> Periksa
                    </button>
                    <button 
                      onClick={() => router.push(`/dashboard/admin/bumil/${bumil.id}/edit`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-pink-50 text-pink-600 rounded-xl font-bold text-xs hover:bg-pink-100 transition-all shrink-0"
                    >
                      <Edit3 className="w-4 h-4 shrink-0" /> Profil
                    </button>
                    <button 
                      onClick={() => router.push(`/dashboard/admin/skrining?id=${bumil.id}`)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-all border border-gray-100 shrink-0"
                    >
                      <ChevronRight className="w-5 h-5 shrink-0" />
                    </button>
                    <button 
                      onClick={() => handleDelete(bumil.id)}
                      className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            }

              return (
              <div 
                key={bumil.id} 
                className="bg-white rounded-[24px] p-4 md:p-5 shadow-sm border border-pink-50 hover:shadow-md transition-all group relative w-full max-w-none"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="h-10 w-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 font-black text-lg">
                    {bumil.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isIncomplete && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span className="text-[8px] md:text-[9px] font-black uppercase">Belum Lengkap</span>
                      </div>
                    )}
                    <button 
                      onClick={() => handleDelete(bumil.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm md:text-base font-bold text-gray-900 mb-0.5">{bumil.name}</h3>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">NIK: {bumil.nik || 'Belum diisi'}</p>
                <div className="flex flex-wrap gap-1 mb-4 text-[8px] md:text-[9px] font-black tracking-wider text-gray-500 uppercase">
                  <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded">G: {bumil.gravida || 1}</span>
                  <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">P: {bumil.partus || 0}</span>
                  <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">A: {bumil.abortus || 0}</span>
                </div>

                <div className="space-y-2 mb-4">
                  {bumil.hpl ? (
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs bg-purple-50 px-2 py-1 rounded-xl border border-purple-200 shadow-sm shadow-purple-50/50">
                      <span className="font-black text-purple-700 uppercase tracking-widest text-[8px] md:text-[9px]">HPL:</span>
                      <span className="font-extrabold text-purple-900 text-[10px] md:text-xs">{new Date(bumil.hpl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs bg-red-50 px-2 py-1 rounded-xl border border-red-100 shadow-sm shadow-red-50/50">
                      <span className="font-black text-red-600 uppercase tracking-widest text-[8px] md:text-[9px]">HPL:</span>
                      <span className="font-extrabold text-red-800 text-[9px] md:text-[10px] uppercase">hpht belum di inputkan</span>
                    </div>
                  )}
                  {bumil.hpht ? (
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs bg-blue-50 px-2 py-1 rounded-xl border border-blue-200 shadow-sm shadow-blue-50/50">
                      <span className="font-black text-blue-700 uppercase tracking-widest text-[8px] md:text-[9px]">HPHT:</span>
                      <span className="font-extrabold text-blue-900 text-[10px] md:text-xs">{new Date(bumil.hpht).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs bg-red-50 px-2 py-1 rounded-xl border border-red-100 shadow-sm shadow-red-50/50">
                      <span className="font-black text-red-600 uppercase tracking-widest text-[8px] md:text-[9px]">HPHT:</span>
                      <span className="font-extrabold text-red-800 text-[9px] md:text-[10px] uppercase">hpht belum di inputkan</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-pink-300" />
                    <span className="font-medium text-xs">{bumil.age} Tahun</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-pink-300" />
                    <span className="font-medium text-xs truncate">{bumil.address || 'Alamat belum lengkap'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button 
                    onClick={() => router.push(`/dashboard/admin/bumil/${bumil.id}/checkup`)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2.5 bg-pink-500 text-white rounded-xl font-bold text-[10px] md:text-xs hover:bg-pink-600 transition-all shadow-md shadow-pink-100"
                  >
                    <Stethoscope className="w-3.5 h-3.5" /> Periksa
                  </button>
                  <button 
                    onClick={() => router.push(`/dashboard/admin/bumil/${bumil.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2.5 bg-pink-50 text-pink-600 rounded-xl font-bold text-[10px] md:text-xs hover:bg-pink-100 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Profil
                  </button>
                  <button 
                    onClick={() => router.push(`/dashboard/admin/skrining?id=${bumil.id}`)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-all border border-gray-100 shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              );
            })}
          </>
        )}
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

        {bumils.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold italic">Data ibu hamil tidak ditemukan</p>
          </div>
        )}

      </div>
    </div>
  );
}
