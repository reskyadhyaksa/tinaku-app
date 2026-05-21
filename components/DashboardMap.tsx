"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Layers, Building2, Hospital } from 'lucide-react';
import { puskesmasApi, rumahSakitApi } from '@/lib/api';

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const createPuskesmasIcon = () => {
  return L.divIcon({
    className: 'puskesmas-icon',
    html: `
      <div style="
        background-color: #ec4899;
        background-image: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(236,72,153,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
          <path d="M6 18h12"/>
          <path d="M6 14h12"/>
          <path d="M6 10h12"/>
          <path d="M6 6h12"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createRumahSakitIcon = () => {
  return L.divIcon({
    className: 'rumahsakit-icon',
    html: `
      <div style="
        background-color: #3b82f6;
        background-image: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(59,130,246,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6v12"/>
          <path d="M6 12h12"/>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'KRR': return '#22c55e';
    case 'KRT': return '#eab308';
    case 'KRST': return '#ef4444';
    default: return '#3b82f6';
  }
};

export default function DashboardMap({ data }: { data: any[] }) {
  const [filter, setFilter] = useState<'ALL' | 'KRR' | 'KRT' | 'KRST'>('ALL');
  const [isMounted, setIsMounted] = useState(false);
  const [puskesmasList, setPuskesmasList] = useState<any[]>([]);
  const [rumahSakitList, setRumahSakitList] = useState<any[]>([]);
  const [showFaskes, setShowFaskes] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    L.Icon.Default.imagePath = 'leaflet/dist/images/';

    const fetchFaskes = async () => {
      try {
        const [puskRes, rsRes] = await Promise.all([
          puskesmasApi.getAll(),
          rumahSakitApi.getAll()
        ]);
        setPuskesmasList(puskRes.data.data || []);
        setRumahSakitList(rsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching faskes data for map:', error);
      }
    };

    fetchFaskes();
    return () => setIsMounted(false);
  }, []);

  const filteredData = filter === 'ALL' 
    ? data 
    : data.filter(b => b.riskStatus === filter);

  if (!isMounted) return <div className="h-[450px] w-full bg-gray-100 animate-pulse rounded-2xl" />;

  return (
    <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0 group">
      
      {/* Floating Filter Button */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/50 flex flex-col sm:flex-row gap-1 items-center">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              filter === 'ALL' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Semua
          </button>
          <button 
            onClick={() => setFilter('KRR')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
              filter === 'KRR' ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'text-gray-500 hover:bg-green-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filter === 'KRR' ? 'bg-white' : 'bg-green-500'}`}></span>
            KRR
          </button>
          <button 
            onClick={() => setFilter('KRT')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
              filter === 'KRT' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-100' : 'text-gray-500 hover:bg-yellow-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filter === 'KRT' ? 'bg-white' : 'bg-yellow-500'}`}></span>
            KRT
          </button>
          <button 
            onClick={() => setFilter('KRST')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
              filter === 'KRST' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'text-gray-500 hover:bg-red-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filter === 'KRST' ? 'bg-white' : 'bg-red-500'}`}></span>
            KRST
          </button>

          <div className="h-5 w-[1px] bg-gray-200 hidden sm:block mx-1"></div>

          <button 
            onClick={() => setShowFaskes(!showFaskes)}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${
              showFaskes ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' : 'text-gray-500 hover:bg-pink-50'
            }`}
            title="Tampilkan/Sembunyikan Faskes"
          >
            <Building2 className="w-3.5 h-3.5" />
            Faskes
          </button>
        </div>
        
        {/* Count Indicator */}
        <div className="bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold self-end shadow-lg flex items-center gap-2">
          <Layers className="w-3 h-3 text-pink-400" />
          {filteredData.length} Ibu Hamil
        </div>
      </div>

      <MapContainer 
        center={[-0.888612, 119.844387]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredData.map((bumil) => (
          <Marker 
            key={bumil.id} 
            position={bumil.coordinates}
            icon={createCustomIcon(getStatusColor(bumil.riskStatus))}
          >
            <Popup>
              <div className="p-2 min-w-[200px] font-sans">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{bumil.name}</h3>
                <div className='flex items-center gap-2 mb-2'>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${
                    bumil.riskStatus === 'KRR' ? 'bg-green-500' :
                    bumil.riskStatus === 'KRT' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {bumil.riskStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 border-b border-gray-100 pb-2 leading-relaxed">{bumil.address}</p>
                <div className="text-[11px] space-y-1.5">
                  <p className="flex justify-between">
                    <span className="text-gray-400">Estimasi HPL:</span>
                    <span className="font-bold text-gray-700">{new Date(bumil.hpl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Umur:</span>
                    <span className="font-bold text-gray-700">{bumil.age} Tahun</span>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {showFaskes && puskesmasList.map((pusk) => {
          const lat = parseFloat(pusk.latitude);
          const lon = parseFloat(pusk.longitude);
          if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) return null;

          return (
            <Marker 
              key={`pusk-${pusk.id}`} 
              position={[lat, lon]}
              icon={createPuskesmasIcon()}
            >
              <Popup>
                <div className="p-2 min-w-[200px] font-sans">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                      Puskesmas
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">{pusk.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 border-b border-gray-100 pb-2 leading-relaxed">{pusk.address || 'Alamat belum diisi'}</p>
                  {pusk.phone && (
                    <p className="text-[10px] font-bold text-pink-600 flex items-center gap-1">
                      <span className="text-gray-400 font-medium">Hubungi:</span> {pusk.phone}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {showFaskes && rumahSakitList.map((rs) => {
          const lat = parseFloat(rs.latitude);
          const lon = parseFloat(rs.longitude);
          if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) return null;

          return (
            <Marker 
              key={`rs-${rs.id}`} 
              position={[lat, lon]}
              icon={createRumahSakitIcon()}
            >
              <Popup>
                <div className="p-2 min-w-[200px] font-sans">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                      Rumah Sakit {rs.type ? `Kelas ${rs.type}` : ''}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">{rs.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 border-b border-gray-100 pb-2 leading-relaxed">{rs.address || 'Alamat belum diisi'}</p>
                  {rs.phone && (
                    <p className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                      <span className="text-gray-400 font-medium">Hubungi:</span> {rs.phone}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
