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
  Activity,
  X,
  Eye,
  EyeOff,
  Building2,
  ChevronDown
} from 'lucide-react';
import { authApi, dokterApi, puskesmasApi, rumahSakitApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UserDokterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dokters, setDokters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [puskesmasList, setPuskesmasList] = useState<any[]>([]);
  const [rumahSakitList, setRumahSakitList] = useState<any[]>([]);
  
  // Form state for new dokter
  const [newDokter, setNewDokter] = useState({
    username: '',
    password: '',
    name: '',
    specialization: '',
    nik: '',
    sip: '',
    phone: '',
    address: '',
    faskes_type: '', // 'puskesmas' or 'rumah_sakit'
    faskes_id: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      router.push('/dashboard/admin');
    } else {
      fetchUsers();
      fetchFaskes();
    }
  }, [user]);

  const fetchFaskes = async () => {
    try {
      const [resPuskesmas, resRumahSakit] = await Promise.all([
        puskesmasApi.getAll(),
        rumahSakitApi.getAll()
      ]);
      setPuskesmasList(resPuskesmas.data.data || []);
      setRumahSakitList(resRumahSakit.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data faskes:', error);
    }
  };

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
    if (newDokter.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Register User
      const registerRes = await authApi.register({
        username: newDokter.username.toLowerCase(),
        password: newDokter.password,
        role: 'dokter'
      });
      
      const createdUserId = registerRes.data?.user?.id;
      if (!createdUserId) {
        throw new Error('Gagal mendapatkan ID user baru');
      }

      // 2. Create Dokter Profile
      await dokterApi.create({
        user_id: createdUserId,
        name: newDokter.name,
        specialization: newDokter.specialization,
        nik: newDokter.nik,
        sip: newDokter.sip,
        phone: newDokter.phone,
        address: newDokter.address,
        puskesmas_id: newDokter.faskes_type === 'puskesmas' && newDokter.faskes_id ? parseInt(newDokter.faskes_id) : null,
        rumah_sakit_id: newDokter.faskes_type === 'rumah_sakit' && newDokter.faskes_id ? parseInt(newDokter.faskes_id) : null,
      });

      toast.success('Dokter baru berhasil terdaftar!');
      setShowAddForm(false);
      setNewDokter({
        username: '',
        password: '',
        name: '',
        specialization: '',
        nik: '',
        sip: '',
        phone: '',
        address: '',
        faskes_type: '',
        faskes_id: ''
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Gagal mendaftarkan dokter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDokters = dokters.filter(d => 
    d.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="min-h-screen bg-pink-50 flex items-center justify-center font-bold text-pink-500">Memuat Data Dokter...</div>;

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-pink-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Manajemen Dokter</h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Kelola akun dan akses rekan Dokter Spesialis / Umum</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 bg-pink-500 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all w-full md:w-auto text-xs md:text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Dokter Baru
          </button>
        </div>

        {/* Add Popup Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl border border-pink-100 p-6 md:p-8 w-full max-w-2xl transform scale-100 transition-all z-50 my-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 leading-tight">Tambah Dokter Baru</h2>
                    <p className="text-xs text-gray-500 font-medium">Buat akun login dan profil Dokter sekaligus.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddDokter} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Akun Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Username</label>
                    <input 
                      type="text" 
                      value={newDokter.username}
                      onChange={(e) => setNewDokter({...newDokter, username: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-xs font-semibold text-gray-800"
                      placeholder="Username login"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={newDokter.password}
                        onChange={(e) => setNewDokter({...newDokter, password: e.target.value})}
                        required
                        className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-xs font-semibold text-gray-800"
                        placeholder="Min. 6 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-655"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Profil Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={newDokter.name}
                      onChange={(e) => setNewDokter({...newDokter, name: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-xs font-semibold text-gray-800"
                      placeholder="Nama Lengkap dengan Gelar"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Spesialisasi</label>
                    <input 
                      type="text" 
                      value={newDokter.specialization}
                      onChange={(e) => setNewDokter({...newDokter, specialization: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-xs font-semibold text-gray-800"
                      placeholder="Contoh: Spesialis Kandungan (Sp.OG)"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">NIK</label>
                    <input 
                      type="text" 
                      value={newDokter.nik}
                      onChange={(e) => setNewDokter({...newDokter, nik: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-xs font-semibold text-gray-800"
                      placeholder="16 Digit NIK"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">SIP / Nomor STR</label>
                    <input 
                      type="text" 
                      value={newDokter.sip}
                      onChange={(e) => setNewDokter({...newDokter, sip: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-xs font-semibold text-gray-800"
                      placeholder="Surat Izin Praktik"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">No. Telepon</label>
                    <input 
                      type="text" 
                      value={newDokter.phone}
                      onChange={(e) => setNewDokter({...newDokter, phone: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-xs font-semibold text-gray-800"
                      placeholder="0812..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Alamat Lengkap</label>
                  <textarea 
                    value={newDokter.address}
                    onChange={(e) => setNewDokter({...newDokter, address: e.target.value})}
                    required
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-xs font-semibold resize-none text-gray-800"
                    placeholder="Jalan, Kelurahan..."
                  />
                </div>

                {/* Faskes Relasi */}
                <div className="p-4 bg-pink-50/20 rounded-2xl border border-pink-100/50 space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-pink-500" /> Relasi Fasilitas Kesehatan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Tipe Faskes</label>
                      <div className="relative">
                        <select
                          value={newDokter.faskes_type}
                          onChange={(e) => setNewDokter({...newDokter, faskes_type: e.target.value, faskes_id: ''})}
                          className="w-full appearance-none pr-8 px-3 py-2.5 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-pink-200 outline-none text-xs font-bold transition-all text-gray-800"
                        >
                          <option value="">Pilih Tipe</option>
                          <option value="puskesmas">Puskesmas</option>
                          <option value="rumah_sakit">Rumah Sakit</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Pilih Instalasi</label>
                      <div className="relative">
                        <select
                          value={newDokter.faskes_id}
                          onChange={(e) => setNewDokter({...newDokter, faskes_id: e.target.value})}
                          disabled={!newDokter.faskes_type}
                          className="w-full appearance-none pr-8 px-3 py-2.5 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-pink-200 outline-none text-xs font-bold transition-all disabled:bg-gray-100 disabled:text-gray-400 text-gray-800"
                        >
                          <option value="">Pilih Nama Faskes</option>
                          {newDokter.faskes_type === 'puskesmas' && puskesmasList.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                          {newDokter.faskes_type === 'rumah_sakit' && rumahSakitList.map((rs) => (
                            <option key={rs.id} value={rs.id}>{rs.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="w-1/2 py-3 bg-gray-105 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all text-xs"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan & Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search & List */}
        <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-gray-900 text-sm md:text-base">Daftar Rekan Dokter</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-pink-200 outline-none"
              />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left">
                  <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</th>
                  <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Spesialisasi</th>
                  <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDokters.map((d) => (
                  <tr key={d.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-500 font-bold text-xs">
                          {d.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-xs md:text-sm text-gray-900">{d.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-gray-500">
                          <Briefcase className="w-3 h-3 text-pink-400" /> Dokter Spesialis / Umum
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-gray-500">
                          <Calendar className="w-3 h-3 text-pink-400" /> Rujukan USG
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right flex items-center justify-end gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-wide">
                        <Activity className="w-3 h-3" /> Aktif
                      </span>
                      <button 
                        onClick={() => router.push(`/dashboard/admin/dokter/${d.id}`)}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-pink-100 text-pink-500"
                        title="Edit Profil"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
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
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-50 px-2.5 py-0.5 rounded-full">
                      <Activity className="w-3 h-3" /> Aktif
                    </span>
                    <button 
                      onClick={() => router.push(`/dashboard/admin/dokter/${d.id}`)}
                      className="p-2 bg-pink-50 text-pink-500 rounded-lg hover:bg-pink-100 transition-colors"
                      title="Edit Profil"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
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
