"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix icon issue
const customIcon = L.divIcon({
  className: 'custom-icon',
  html: `
    <div style="
      background-color: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 4px solid white;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onChange }: LocationPickerProps) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // Auto focus when lat/lng props change (e.g. from GPS button)
  useEffect(() => {
    if (lat !== 0 && lng !== 0) {
      map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [lat, lng, map]);

  return lat !== 0 ? (
    <Marker position={[lat, lng]} icon={customIcon} />
  ) : null;
}

export default function LocationPickerMap({ lat, lng, onChange }: LocationPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const initialCenter: [number, number] = lat && lng ? [lat, lng] : [-6.205000, 106.820000];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl" />;

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 mt-4 relative z-0">
      <MapContainer 
        key="unique-map-instance" // Stable key to prevent rapid re-mounting
        center={initialCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 z-[1000] shadow-sm border border-gray-100">
        Klik pada peta untuk menentukan lokasi
      </div>
    </div>
  );
}
