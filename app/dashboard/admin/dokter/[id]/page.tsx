"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Briefcase, User as UserIcon, Building2, ChevronDown, Key, Eye, EyeOff } from 'lucide-react';
import { authApi, dokterApi, puskesmasApi, rumahSakitApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DokterEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [targetUser, setTargetUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [puskesmasList, setPuskesmasList] = useState<any[]>([]);
  const [rumahSakitList, setRumahSakitList] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    name: '',
    nik: '',
    sip: '',
    specialization: '',
    address: '',
    phone: '',
    faskes_type: '',
    faskes_id: ''
  });

  // State for Change Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'superadmin') {
      router.push('/dashboard/admin');
    } else {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    try {
      const resUsers = await authApi.getUsers();
      const foundUser = resUsers.data.find((u: any) => u.id.toString() === id);
      if (!foundUser) {
        toast.error('User tidak ditemukan');
        router.push('/dashboard/admin/dokter');
        return;
      }
      setTargetUser(foundUser);

      const [resPuskesmas, resRumahSakit] = await Promise.all([
        puskesmasApi.getAll(),
        rumahSakitApi.getAll()
      ]);
      setPuskesmasList(resPuskesmas.data.data || []);
      setRumahSakitList(resRumahSakit.data.data || []);

      const resProfile = await dokterApi.getAll();
      const dokterProfile = resProfile.data.data.find((d: any) => d.user_id.toString() === id);
      
      if (dokterProfile) {
        setProfile(dokterProfile);
        let faskes_type = '';
        let faskes_id = '';
        if (dokterProfile.puskesmas_id) {
          faskes_type = 'puskesmas';
          faskes_id = dokterProfile.puskesmas_id.toString();
        } else if (dokterProfile.rumah_sakit_id) {
          faskes_type = 'rumah_sakit';
          faskes_id = dokterProfile.rumah_sakit_id.toString();
        }
        
        setForm({
          name: dokterProfile.name || '',
          nik: dokterProfile.nik || '',
          sip: dokterProfile.sip || '',
          specialization: dokterProfile.specialization || '',
          address: dokterProfile.address || '',
          phone: dokterProfile.phone || '',
          faskes_type,
          faskes_id
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data dokter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        user_id: parseInt(id as string),
        name: form.name,
        nik: form.nik,
        sip: form.sip,
        specialization: form.specialization,
        address: form.address,
        phone: form.phone,
        puskesmas_id: form.faskes_type === 'puskesmas' && form.faskes_id ? parseInt(form.faskes_id) : null,
        rumah_sakit_id: form.faskes_type === 'rumah_sakit' && form.faskes_id ? parseInt(form.faskes_id) : null,
      };

      if (profile) {
        await dokterApi.update(profile.id.toString(), payload);
        toast.success('Profil dokter berhasil diperbarui');
      } else {
        await dokterApi.create(payload);
        toast.success('Profil dokter berhasil dibuat');
      }
      router.push('/dashboard/admin/dokter');
    } catch (error) {
      toast.error('Gagal menyimpan profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await authApi.changePassword({
        userId: parseInt(id as string),
        newPassword
      });
      toast.success('Password berhasil diperbarui');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-pink-50 flex items-center justify-center font-bold text-pink-500">Memuat Detail...</div>;
  if (!targetUser) return null;

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push("/dashboard/admin/dokter")}
          className="flex items-center gap-2 text-gray-500 hover:text-pink-500 font-bold text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        {/* Form Container */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-50">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100 text-white shrink-0">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Edit Profil Dokter: {targetUser.username}</h2>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Lengkapi informasi pribadi dan pekerjaan dokter spesialis.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                  placeholder="Nama Lengkap dengan Gelar"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Spesialisasi</label>
                <input
                  type="text"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                  placeholder="Spesialis Kandungan (Sp.OG)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">NIK</label>
                <input
                  type="text"
                  name="nik"
                  value={form.nik}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                  placeholder="Nomor Induk Kependudukan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">SIP / Nomor STR</label>
                <input
                  type="text"
                  name="sip"
                  value={form.sip}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                  placeholder="Surat Izin Praktik"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">No. Telepon</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                  placeholder="0812..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Alamat Lengkap</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold resize-none"
                placeholder="Jalan, Kelurahan..."
              />
            </div>

            <div className="p-5 bg-pink-50/20 rounded-3xl border border-pink-100/50 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-pink-500" /> Relasi Fasilitas Kesehatan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Tipe Faskes</label>
                  <div className="relative">
                    <select
                      name="faskes_type"
                      value={form.faskes_type}
                      onChange={(e) => {
                        setForm({ ...form, faskes_type: e.target.value, faskes_id: '' });
                      }}
                      className="w-full appearance-none pr-10 px-4 py-3.5 rounded-2xl text-gray-705 border border-gray-100 bg-white focus:ring-2 focus:ring-pink-200 outline-none text-sm font-bold transition-all"
                    >
                      <option value="">Pilih Tipe</option>
                      <option value="puskesmas">Puskesmas</option>
                      <option value="rumah_sakit">Rumah Sakit</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Pilih Instalasi</label>
                  <div className="relative">
                    <select
                      name="faskes_id"
                      value={form.faskes_id}
                      onChange={handleChange}
                      disabled={!form.faskes_type}
                      className="w-full appearance-none pr-10 px-4 py-3.5 rounded-2xl text-gray-705 border border-gray-100 bg-white focus:ring-2 focus:ring-pink-200 outline-none text-sm font-bold transition-all disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">Pilih Nama Faskes</option>
                      {form.faskes_type === 'puskesmas' && puskesmasList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                      {form.faskes_type === 'rumah_sakit' && rumahSakitList.map((rs) => (
                        <option key={rs.id} value={rs.id}>{rs.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all disabled:opacity-50 mt-4 text-sm"
            >
              <Save className="w-4 h-4" /> {isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 shrink-0">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ubah Password</h2>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Perbarui password login untuk akun dokter ini.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Password Baru</label>
                <div className="relative">
                  <input
                    required
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl text-gray-750 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                    placeholder="Min. 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 animate-fade-in"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl text-gray-750 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                    placeholder="Ketik ulang password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 animate-fade-in"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
            >
              <Key className="w-4 h-4" /> {isUpdatingPassword ? 'Memperbarui...' : 'Ubah Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
