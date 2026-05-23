"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Layers, Building2, Hospital, Maximize2, X, Map, Settings } from 'lucide-react';
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
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 2px solid white;
        box-shadow: 0 3px 8px rgba(236,72,153,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

const createRumahSakitIcon = () => {
  return L.divIcon({
    className: 'rumahsakit-icon',
    html: `
      <div style="
        background-color: #3b82f6;
        background-image: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 2px solid white;
        box-shadow: 0 3px 8px rgba(59,130,246,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6v4" />
          <path d="M14 14h-4" />
          <path d="M14 18h-4" />
          <path d="M14 8h-4" />
          <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
          <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
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

const getCoordinates = (item: any): [number, number] | null => {
  if (!item) return null;
  
  // 1. Try if it has standard coordinates array
  if (Array.isArray(item.coordinates) && item.coordinates.length === 2) {
    const lat = typeof item.coordinates[0] === 'number' ? item.coordinates[0] : parseFloat(item.coordinates[0]);
    const lon = typeof item.coordinates[1] === 'number' ? item.coordinates[1] : parseFloat(item.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
      return [lat, lon];
    }
  }

  // 2. Try latitude/longitude fields
  const latVal = item.latitude !== undefined && item.latitude !== null ? item.latitude : item.lat;
  const lonVal = item.longitude !== undefined && item.longitude !== null ? item.longitude : (item.lon || item.lng);
  
  const lat = typeof latVal === 'number' ? latVal : parseFloat(latVal || '');
  const lon = typeof lonVal === 'number' ? lonVal : parseFloat(lonVal || '');
  
  if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
    return [lat, lon];
  }
  
  return null;
};

export default function DashboardMap({ data }: { data: any[] }) {
  const [filter, setFilter] = useState<'ALL' | 'KRR' | 'KRT' | 'KRST'>('ALL');
  const [isMounted, setIsMounted] = useState(false);
  const [puskesmasList, setPuskesmasList] = useState<any[]>([]);
  const [rumahSakitList, setRumahSakitList] = useState<any[]>([]);
  const [showFaskes, setShowFaskes] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModalSettings, setShowModalSettings] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    L.Icon.Default.imagePath = 'leaflet/dist/images/';

    const fetchFaskes = async () => {
      try {
        const [puskRes, rsRes] = await Promise.all([
          puskesmasApi.getAll(),
          rumahSakitApi.getAll()
        ]);
        const puskData = puskRes.data.data || (Array.isArray(puskRes.data) ? puskRes.data : []);
        const rsData = rsRes.data.data || (Array.isArray(rsRes.data) ? rsRes.data : []);
        setPuskesmasList(puskData);
        setRumahSakitList(rsData);
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

  if (!isMounted) return <div className="h-full min-h-[400px] w-full bg-gray-100 animate-pulse rounded-2xl" />;

  return (
    <>
      <div className="h-full w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0 group">
      
      {/* Floating Filter / Settings Pill Bar */}
      <div 
        className={`absolute z-[1000] flex items-center bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/50 transition-all duration-300 ease-out bottom-3 left-3 right-3 sm:bottom-auto sm:left-auto sm:top-4 sm:right-4 ${
          !showSettings 
            ? 'max-w-[190px] mx-auto sm:max-w-none sm:mx-0' 
            : 'max-w-md mx-auto sm:max-w-none sm:mx-0'
        }`}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* State A: Collapsed - Clicking it toggles filter bar expansion */}
        {!showSettings ? (
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-gray-50 active:scale-95 text-gray-800 transition-all duration-200 group/pill"
            title="Klik untuk memfilter data"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 transition-transform group-hover/pill:scale-110" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wide">{filteredData.length} Ibu Hamil</span>
          </button>
        ) : (
          /* State B: Expanded - Shows filters with close button */
          <div 
            className="flex items-center justify-center gap-1 sm:gap-1.5 animate-in fade-in zoom-in-95 duration-200 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden flex-nowrap w-full sm:w-auto py-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              title="Tutup Filter"
            >
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            
            <div className="h-3.5 w-[1px] bg-gray-200 mx-0.5 sm:mx-1 shrink-0"></div>

            <button 
              onClick={() => setFilter('ALL')}
              className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all shrink-0 ${
                filter === 'ALL' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilter('KRR')}
              className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                filter === 'KRR' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:bg-green-50'
              }`}
            >
              <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${filter === 'KRR' ? 'bg-white' : 'bg-green-500'}`}></span>
              KRR
            </button>
            <button 
              onClick={() => setFilter('KRT')}
              className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                filter === 'KRT' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-500 hover:bg-yellow-50'
              }`}
            >
              <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${filter === 'KRT' ? 'bg-white' : 'bg-yellow-500'}`}></span>
              KRT
            </button>
            <button 
              onClick={() => setFilter('KRST')}
              className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                filter === 'KRST' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-red-50'
              }`}
            >
              <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${filter === 'KRST' ? 'bg-white' : 'bg-red-500'}`}></span>
              KRST
            </button>

            <div className="h-3.5 w-[1px] bg-gray-200 mx-0.5 sm:mx-1 shrink-0"></div>

            <button 
              onClick={() => setShowFaskes(!showFaskes)}
              className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                showFaskes ? 'bg-pink-500 text-white shadow-md' : 'text-gray-500 hover:bg-pink-50'
              }`}
              title="Tampilkan/Sembunyikan Faskes"
            >
              <Building2 className="w-3 sm:w-3.5 sm:h-3.5 h-3" />
              Faskes
            </button>
          </div>
        )}

        {/* Fullscreen Expand Icon - always visible on the right */}
        <div className="h-5 w-[1px] bg-gray-200 mx-1.5"></div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 rounded-xl text-gray-700 hover:text-pink-500 hover:bg-pink-50 hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
          title="Perbesar Peta (Fullscreen)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
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
          const coords = getCoordinates(pusk);
          if (!coords) return null;

          return (
            <Marker 
              key={`pusk-${pusk.id}`} 
              position={coords}
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
          const coords = getCoordinates(rs);
          if (!coords) return null;

          return (
            <Marker 
              key={`rs-${rs.id}`} 
              position={coords}
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

    {isModalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center sm:p-4 p-0">
        <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col w-full h-full sm:w-[85vw] sm:h-[75vh] max-w-7xl sm:max-h-[90vh] overflow-hidden relative animate-in fade-in zoom-in duration-200">
          
          {/* Header Modal */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white relative z-[10001]">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 text-pink-600 p-1.5 sm:p-2 rounded-xl">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm md:text-base font-black text-gray-900">Detail Peta Sebaran Ibu Hamil</h2>
                <p className="text-[10px] text-gray-500 font-bold mt-0.5 hidden sm:block">Tampilan interaktif peta sebaran risiko kehamilan dan fasilitas kesehatan</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Map Container */}
          <div className="flex-1 w-full relative z-0">
            
            {/* Floating Filter / Settings Pill Bar inside Modal */}
            <div 
              className={`absolute z-[1000] flex items-center bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/50 transition-all duration-300 ease-out bottom-3 left-3 right-3 sm:bottom-auto sm:left-auto sm:top-4 sm:right-4 ${
                !showModalSettings 
                  ? 'max-w-[190px] mx-auto sm:max-w-none sm:mx-0' 
                  : 'max-w-md mx-auto sm:max-w-none sm:mx-0'
              }`}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              {/* State A: Collapsed */}
              {!showModalSettings ? (
                <button
                  onClick={() => setShowModalSettings(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-gray-50 active:scale-95 text-gray-800 transition-all duration-200 group/pill"
                  title="Klik untuk memfilter data"
                >
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 transition-transform group-hover/pill:scale-110" />
                  <span className="text-[10px] sm:text-[11px] font-black tracking-wide">{filteredData.length} Ibu Hamil</span>
                </button>
              ) : (
                /* State B: Expanded */
                <div 
                  className="flex items-center justify-center gap-1 sm:gap-1.5 animate-in fade-in zoom-in-95 duration-200 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden flex-nowrap w-full sm:w-auto py-0.5"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <button
                    onClick={() => setShowModalSettings(false)}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    title="Tutup Filter"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  
                  <div className="h-3.5 w-[1px] bg-gray-200 mx-0.5 sm:mx-1 shrink-0"></div>

                  <button 
                    onClick={() => setFilter('ALL')}
                    className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all shrink-0 ${
                      filter === 'ALL' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Semua
                  </button>
                  <button 
                    onClick={() => setFilter('KRR')}
                    className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                      filter === 'KRR' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:bg-green-50'
                    }`}
                  >
                    <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${filter === 'KRR' ? 'bg-white' : 'bg-green-500'}`}></span>
                    KRR
                  </button>
                  <button 
                    onClick={() => setFilter('KRT')}
                    className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                      filter === 'KRT' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-500 hover:bg-yellow-50'
                    }`}
                  >
                    <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${filter === 'KRT' ? 'bg-white' : 'bg-yellow-500'}`}></span>
                    KRT
                  </button>
                  <button 
                    onClick={() => setFilter('KRST')}
                    className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                      filter === 'KRST' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-red-50'
                    }`}
                  >
                    <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${filter === 'KRST' ? 'bg-white' : 'bg-red-500'}`}></span>
                    KRST
                  </button>

                  <div className="h-3.5 w-[1px] bg-gray-200 mx-0.5 sm:mx-1 shrink-0"></div>

                  <button 
                    onClick={() => setShowFaskes(!showFaskes)}
                    className={`px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                      showFaskes ? 'bg-pink-500 text-white shadow-md' : 'text-gray-500 hover:bg-pink-50'
                    }`}
                  >
                    <Building2 className="w-3 sm:w-3.5 sm:h-3.5 h-3" />
                    Faskes
                  </button>
                </div>
              )}
            </div>

            <MapContainer 
              center={[-0.888612, 119.844387]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {filteredData.map((bumil) => (
                <Marker 
                  key={`modal-bumil-${bumil.id}`} 
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
                const coords = getCoordinates(pusk);
                if (!coords) return null;

                return (
                  <Marker 
                    key={`modal-pusk-${pusk.id}`} 
                    position={coords}
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
                const coords = getCoordinates(rs);
                if (!coords) return null;

                return (
                  <Marker 
                    key={`modal-rs-${rs.id}`} 
                    position={coords}
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
        </div>
      </div>
    )}
    </>
  );
}
