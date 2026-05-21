"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { rumahSakitApi } from '@/lib/api';
import { ArrowLeft, Save, Hospital, ChevronDown, MapPin, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-2xl bg-gray-100 flex items-center justify-center animate-pulse border border-gray-200">
      <div className="text-gray-400 font-medium">Memuat Peta Lokasi...</div>
    </div>
  )
});

export default function EditRumahSakitPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [form, setForm] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleLocationChange = (newLat: number, newLng: number) => {
    setForm(prev => ({
      ...prev,
      latitude: newLat.toFixed(6),
      longitude: newLng.toFixed(6)
    }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolokasi tidak didukung oleh browser Anda');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));
        toast.success('Lokasi berhasil diambil dari GPS!');
      },
      (error) => {
        console.error('Error mendapatkan lokasi:', error);
        toast.error('Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.');
      }
    );
  };

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const response = await rumahSakitApi.getAll();
        const allData = response.data.data || [];
        const found = allData.find((item: any) => item.id.toString() === params.id);
        if (found) {
          setForm({
            name: found.name || '',
            type: found.type || '',
            address: found.address || '',
            phone: found.phone || '',
            latitude: found.latitude || '',
            longitude: found.longitude || ''
          });
        }
      } catch (error) {
        toast.error('Gagal memuat data rumah sakit');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0
      };

      if (isNew) {
        await rumahSakitApi.create(payload);
        toast.success('Rumah Sakit berhasil ditambahkan');
      } else {
        await rumahSakitApi.update(params.id as string, payload);
        toast.success('Rumah Sakit berhasil diperbarui');
      }
      router.push('/dashboard/admin/faskes');
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-pink-50 flex items-center justify-center font-bold text-pink-500">Memuat Detail...</div>;

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-pink-500 font-bold text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        {/* Form Container */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-50">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100 shrink-0">
              <Hospital className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{isNew ? 'Tambah Rumah Sakit Baru' : 'Edit Rumah Sakit'}</h2>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Lengkapi detail profil rumah sakit di bawah ini.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Nama Rumah Sakit</label>
              <input
                required
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                placeholder="Contoh: RSUD Kota Madiun"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Tipe / Kelas</label>
              <div className="relative">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full appearance-none pr-10 px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold text-gray-800"
                >
                  <option value="">Pilih Tipe</option>
                  <option value="Tipe A">Tipe A</option>
                  <option value="Tipe B">Tipe B</option>
                  <option value="Tipe C">Tipe C</option>
                  <option value="Tipe D">Tipe D</option>
                  <option value="RSIA">RS Ibu & Anak (RSIA)</option>
                  <option value="Klinik">Klinik</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Alamat Lengkap</label>
              <textarea
                required
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold resize-none"
                placeholder="Jalan, RT/RW, Kelurahan..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">No. Telepon</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                  placeholder="Contoh: 08123456789"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-pink-500" /> Pilih Lokasi di Peta
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="flex items-center gap-1 bg-pink-50 hover:bg-pink-100 text-pink-600 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-all shadow-sm cursor-pointer animate-pulse"
                >
                  <Navigation className="w-3 h-3" /> Gunakan GPS Saya
                </button>
              </div>
              <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-100 relative z-0">
                <LocationPickerMap 
                  lat={parseFloat(form.latitude) || 0} 
                  lng={parseFloat(form.longitude) || 0} 
                  onChange={handleLocationChange} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                  placeholder="-6.200000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-2xl text-gray-700 border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm font-semibold"
                  placeholder="106.816666"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all disabled:opacity-50 mt-4 text-sm"
            >
              <Save className="w-4 h-4" /> {submitting ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
