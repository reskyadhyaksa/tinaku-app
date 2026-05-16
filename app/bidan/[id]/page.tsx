"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  MapPin, 
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  Activity,
  Award
} from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function BidanDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'bidan') {
      router.push('/login');
    } else {
      fetchUserDetail();
    }
  }, [user, id]);

  const fetchUserDetail = async () => {
    try {
      const res = await authApi.getUsers();
      const found = res.data.find((u: any) => u.id.toString() === id);
      if (found) {
        setTargetUser(found);
      } else {
        toast.error('User tidak ditemukan');
        router.push('/bidan');
      }
    } catch (error) {
      toast.error('Gagal mengambil data detail');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-pink-50 flex items-center justify-center font-bold text-pink-500">Memuat Detail...</div>;
  if (!targetUser) return null;

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Button & Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-pink-50">
          <div className="flex items-center gap-4">
            <Link href="/bidan" className="h-10 w-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm shrink-0">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Profil Bidan</h1>
              <p className="text-xs text-gray-500 font-medium">Informasi lengkap tenaga kesehatan</p>
            </div>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-green-600">Aktif</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-pink-50 text-center">
              <div className="h-24 w-24 bg-pink-100 rounded-3xl mx-auto mb-4 flex items-center justify-center text-pink-500 font-black text-3xl shadow-inner border-4 border-white">
                {targetUser.username.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{targetUser.username}</h2>
              <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mt-1">Tenaga Medis</p>
              
              <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Role Akses</p>
                    <p className="text-xs font-bold text-gray-700 capitalize">{targetUser.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Terdaftar Sejak</p>
                    <p className="text-xs font-bold text-gray-700">{new Date(targetUser.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-3xl shadow-xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <Award className="text-pink-400 w-5 h-5" />
                <p className="font-bold text-sm">Status Verifikasi</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                <p className="text-xs leading-relaxed text-gray-300 italic">"Akun ini telah terverifikasi sebagai tenaga medis resmi di wilayah kerja Puskesmas TINAKU."</p>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Fields */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-pink-50">
              <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Briefcase className="text-pink-500 w-5 h-5" /> Informasi Pekerjaan & Pribadi
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tempat Bekerja</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <span className="font-bold">Puskesmas TINAKU Utama</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Umur</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <UserIcon className="w-4 h-4 text-pink-500" />
                    <span className="font-bold">28 Tahun</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Kepegawaian</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Activity className="w-4 h-4 text-pink-500" />
                    <span className="font-bold">Tenaga Honorer / ASN</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nomor STR</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <ShieldCheck className="w-4 h-4 text-pink-500" />
                    <span className="font-bold">123456789-STR</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-50">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Kontak Darurat</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Phone className="w-4 h-4 text-pink-500" />
                    <span className="text-xs font-bold text-gray-700">0812-3456-7890</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Mail className="w-4 h-4 text-pink-500" />
                    <span className="text-xs font-bold text-gray-700">{targetUser.username}@tinaku.id</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-white border border-gray-200 text-gray-900 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                Edit Profil
              </button>
              <button className="flex-1 bg-red-50 border border-red-100 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-100 transition-all">
                Nonaktifkan Akun
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
