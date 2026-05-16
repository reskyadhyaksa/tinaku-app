"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockBumilData } from '@/lib/mockData';

// Fix Leaflet's default icon path issues in Next.js
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
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'KRR': return '#22c55e'; // Green
    case 'KRT': return '#eab308'; // Yellow
    case 'KRST': return '#ef4444'; // Red
    default: return '#3b82f6'; // Blue
  }
};

const DashboardMap = () => {
  useEffect(() => {
    // Make sure map doesn't have hydration issues
    L.Icon.Default.imagePath = 'leaflet/dist/images/';
  }, []);

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer 
        center={[-6.205000, 106.820000]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mockBumilData.map((bumil) => (
          <Marker 
            key={bumil.id} 
            position={bumil.coordinates}
            icon={createCustomIcon(getStatusColor(bumil.riskStatus))}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{bumil.name}</h3>
                <div className='flex items-center gap-2 mb-2'>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${
                    bumil.riskStatus === 'KRR' ? 'bg-green-500' :
                    bumil.riskStatus === 'KRT' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {bumil.riskStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 border-b pb-2">{bumil.address}</p>
                <div className="text-sm space-y-1">
                  <p><strong>HPL:</strong> {new Date(bumil.hpl).toLocaleDateString('id-ID')}</p>
                  {bumil.missedCheckup && (
                    <p className="text-red-500 font-semibold flex items-center gap-1">
                      ⚠️ Terlewat Jadwal Pantau
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DashboardMap;
