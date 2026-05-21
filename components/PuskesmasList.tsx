"use client";

import { useEffect, useState } from 'react';
import { puskesmasApi } from '@/lib/api';
import { MapPin, Phone, Building2, AlertCircle } from 'lucide-react';

export default function PuskesmasList({ userLat, userLon }: { userLat?: number, userLon?: number }) {
  const [puskesmas, setPuskesmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPuskesmas = async () => {
      try {
        const response = await puskesmasApi.getAll(userLat, userLon);
        setPuskesmas(response.data.data || []);
      } catch (error) {
        console.error('Error fetching puskesmas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPuskesmas();
  }, [userLat, userLon]);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-[40px] border border-pink-50 shadow-sm w-full animate-pulse flex flex-col items-center justify-center min-h-[200px]">
        <div className="h-10 w-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-gray-400">Mencari Fasilitas Kesehatan Terdekat...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-pink-50 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900">Puskesmas & Rumah Sakit Terdekat</h3>
            <p className="text-xs font-bold text-gray-500">Daftar kontak darurat dan lokasi faskes bidan/dokter Anda.</p>
          </div>
        </div>
      </div>

      {puskesmas.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-[32px] text-center flex flex-col items-center justify-center gap-3 border border-gray-100">
          <AlertCircle className="w-10 h-10 text-gray-400" />
          <div>
            <h4 className="text-sm font-black text-gray-900">Belum Ada Data Fasilitas Kesehatan</h4>
            <p className="text-xs font-medium text-gray-500">Puskesmas di wilayah Anda belum terdaftar di sistem kami.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {puskesmas.map((item) => (
            <div key={item.id} className="bg-gray-50 hover:bg-pink-50/50 p-6 rounded-[28px] border border-gray-150 hover:border-pink-200 transition-all group flex flex-col h-full">
              <div className="mb-4">
                 <h4 className="text-sm md:text-base font-black text-gray-900 mb-1.5 group-hover:text-pink-600 transition-colors line-clamp-1" title={item.name}>{item.name}</h4>
                 <p className="text-[10px] md:text-xs font-medium text-gray-500 line-clamp-2" title={item.address}>{item.address}</p>
              </div>
              
              <div className="space-y-2 mt-auto">
                <a 
                  href={`tel:${item.phone}`} 
                  className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Phone className="w-4 h-4" /> Hubungi Darurat
                </a>
                
                {item.distance !== undefined && item.distance !== null && (
                  <div className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-white text-gray-600 rounded-2xl font-bold text-[10px] border border-gray-200 shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-pink-500" />
                    Berjarak {parseFloat(item.distance).toFixed(2)} KM dari Anda
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
