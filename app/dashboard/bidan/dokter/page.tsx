"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  Search, 
  ChevronRight, 
  ShieldCheck,
  Briefcase,
  Calendar,
  Activity
} from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UserDokterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dokters, setDokters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state for new dokter
  const [newDokter, setNewDokter] = useState({
    username: '',
    password: '',
    role: 'dokter'
  });

  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      router.push('/dashboard/bidan');
    } else {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await authApi.getUsers();
      // Filter only dokters
      setDokters(res.data.filter((u: any) => u.role === 'dokter'));
    } catch (error) {
      toast.error('Gagal mengambil data user dokter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDokter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.register({
        ...newDokter,
        username: newDokter.username.toLowerCase()
      });
      toast.success('Dokter baru berhasil didaftarkan!');
      setShowAddForm(false);
      setNewDokter({ username: '', password: '', role: 'dokter' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mendaftarkan dokter');
    }
  };

  const filteredDokters = dokters.filter(d => 
    d.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="min-h-screen bg-pink-50 flex items-center justify-center font-bold text-pink-500">Memuat Data Dokter...</div>;

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-100">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100">
              <Users className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Manajemen Dokter</h1>
              <p className="text-gray-500 font-medium">Kelola akun dan akses rekan Dokter Spesialis / Umum</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 bg-pink-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all w-full md:w-auto"
          >
            <UserPlus className="w-5 h-5" />
            {showAddForm ? 'Batal' : 'Tambah Dokter Baru'}
          </button>
        </div>

        {/* Add Form Section */}
        {showAddForm && (
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-200 animate-in slide-in-from-top duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="text-pink-500" /> Registrasi Akun Dokter
            </h2>
            <form onSubmit={handleAddDokter} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Username</label>
                <input 
                  type="text" 
                  value={newDokter.username}
                  onChange={(e) => setNewDokter({...newDokter, username: e.target.value})}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  placeholder="Username Dokter"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password Sementara</label>
                <input 
                  type="password" 
                  value={newDokter.password}
                  onChange={(e) => setNewDokter({...newDokter, password: e.target.value})}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  placeholder="Min. 6 Karakter"
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                  Daftarkan Dokter
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & List */}
        <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-gray-900 text-lg">Daftar Rekan Dokter</h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 outline-none"
              />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left">
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Username</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Spesialisasi</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDokters.map((d) => (
                  <tr key={d.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-500 font-bold">
                          {d.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900">{d.username}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <Briefcase className="w-3 h-3 text-pink-400" /> Dokter Spesialis / Umum
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <Calendar className="w-3 h-3 text-pink-400" /> Rujukan USG
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        <Activity className="w-3 h-3" /> Aktif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-50">
            {filteredDokters.map((d) => (
              <div key={d.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-500 font-bold">
                      {d.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-900">{d.username}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-50 px-2.5 py-0.5 rounded-full">
                    <Activity className="w-3 h-3" /> Aktif
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <Briefcase className="w-3 h-3 text-pink-400" /> Dokter Spesialis / Umum
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredDokters.length === 0 && (
            <div className="p-20 text-center text-gray-400 italic">
              Tidak ada data dokter ditemukan
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
