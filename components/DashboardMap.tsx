"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Layers } from 'lucide-react';

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

  useEffect(() => {
    setIsMounted(true);
    L.Icon.Default.imagePath = 'leaflet/dist/images/';
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
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/50 flex flex-col sm:flex-row gap-1">
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
        </div>
        
        {/* Count Indicator */}
        <div className="bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold self-end shadow-lg flex items-center gap-2">
          <Layers className="w-3 h-3 text-pink-400" />
          {filteredData.length} Ibu Hamil
        </div>
      </div>

      <MapContainer 
        center={[-6.205000, 106.820000]} 
        zoom={12} 
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
      </MapContainer>
    </div>
  );
}
