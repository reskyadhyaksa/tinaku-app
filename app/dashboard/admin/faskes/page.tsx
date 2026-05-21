"use client";

import { useEffect, useState } from 'react';
import { puskesmasApi, rumahSakitApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Edit, Trash2, Hospital } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FaskesAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'puskesmas' | 'rumahsakit'>('puskesmas');
  const [puskesmasList, setPuskesmasList] = useState<any[]>([]);
  const [rumahSakitList, setRumahSakitList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'puskesmas') {
        const response = await puskesmasApi.getAll();
        setPuskesmasList(response.data.data || []);
      } else {
        const response = await rumahSakitApi.getAll();
        setRumahSakitList(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching faskes:', error);
      toast.error('Gagal mengambil data fasilitas kesehatan');
    } finally {
      setIsLoading(false);
    }
  };

  const setIsLoading = (val: boolean) => {
    setLoading(val);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDelete = async (id: string, type: 'puskesmas' | 'rumahsakit') => {
    if (!confirm('Apakah Anda yakin ingin menghapus fasilitas ini?')) return;
    try {
      if (type === 'puskesmas') {
        await puskesmasApi.delete(id);
      } else {
        await rumahSakitApi.delete(id);
      }
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch (error) {
      console.error('Error deleting faskes:', error);
      toast.error('Gagal menghapus data');
    }
  };

  const listToRender = activeTab === 'puskesmas' ? puskesmasList : rumahSakitList;

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-pink-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Fasilitas Kesehatan</h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Kelola data Puskesmas dan Rumah Sakit</p>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/dashboard/admin/faskes/${activeTab === 'puskesmas' ? 'puskesmas' : 'rumah-sakit'}/new`)}
            className="flex items-center justify-center gap-2 bg-pink-500 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all w-full md:w-auto text-xs md:text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah {activeTab === 'puskesmas' ? 'Puskesmas' : 'Rumah Sakit'}
          </button>
        </div>

        {/* Tab & List Wrapper */}
        <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('puskesmas')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-sm transition-all ${
                activeTab === 'puskesmas' 
                  ? 'text-pink-600 bg-pink-50/30 border-b-2 border-pink-500' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4" /> Puskesmas
            </button>
            <button
              onClick={() => setActiveTab('rumahsakit')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-sm transition-all ${
                activeTab === 'rumahsakit' 
                  ? 'text-pink-600 bg-pink-50/30 border-b-2 border-pink-500' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Hospital className="w-4 h-4" /> Rumah Sakit
            </button>
          </div>

          <div className="p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-l-xl">Nama Fasilitas</th>
                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Alamat</th>
                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">No. Telepon</th>
                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right rounded-r-xl">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {listToRender.map((item) => (
                        <tr key={item.id} className="hover:bg-pink-50/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-500 font-bold text-xs shrink-0">
                                {activeTab === 'puskesmas' ? <Building2 className="w-4 h-4 text-pink-500" /> : <Hospital className="w-4 h-4 text-pink-500" />}
                              </div>
                              <div>
                                <span className="font-bold text-xs md:text-sm text-gray-900">{item.name}</span>
                                {activeTab === 'rumahsakit' && item.type && (
                                  <span className="ml-2 px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full border border-pink-100 text-[9px] font-black uppercase shrink-0">
                                    {item.type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold text-gray-500 max-w-xs truncate" title={item.address}>
                            {item.address || '-'}
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold text-gray-500">
                            {item.phone || '-'}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => router.push(`/dashboard/admin/faskes/${activeTab === 'puskesmas' ? 'puskesmas' : 'rumah-sakit'}/${item.id}`)}
                                className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-pink-100 text-pink-500"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id.toString(), activeTab)}
                                className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100 text-red-500"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-50">
                  {listToRender.map((item) => (
                    <div key={item.id} className="py-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-500 font-bold shrink-0">
                            {activeTab === 'puskesmas' ? <Building2 className="w-5 h-5 text-pink-500" /> : <Hospital className="w-5 h-5 text-pink-500" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                            {activeTab === 'rumahsakit' && item.type && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full border border-pink-100 text-[8px] font-black uppercase">
                                {item.type}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => router.push(`/dashboard/admin/faskes/${activeTab === 'puskesmas' ? 'puskesmas' : 'rumah-sakit'}/${item.id}`)}
                            className="p-2 text-pink-500 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id.toString(), activeTab)}
                            className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs font-semibold text-gray-500">
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Alamat</span>
                          <span className="text-gray-700 font-medium">{item.address || '-'}</span>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">No. Telepon</span>
                          <span className="text-gray-700 font-medium">{item.phone || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {listToRender.length === 0 && (
                  <div className="p-12 text-center text-gray-400 italic text-sm font-medium">
                    Belum ada data {activeTab === 'puskesmas' ? 'Puskesmas' : 'Rumah Sakit'}.
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
