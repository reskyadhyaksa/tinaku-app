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

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl" />;
  }

  // Ensure coordinates are valid numbers, fallback to Jakarta
  const safeLat = !isNaN(Number(lat)) && Number(lat) !== 0 ? Number(lat) : -6.205000;
  const safeLng = !isNaN(Number(lng)) && Number(lng) !== 0 ? Number(lng) : 106.820000;
  const initialCenter: [number, number] = [safeLat, safeLng];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        key={`map-${safeLat}-${safeLng}`} // Unique key to force re-render if initial center changes significantly
        center={initialCenter} 
        zoom={15} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={safeLat} lng={safeLng} onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-pink-500 z-[1000] shadow-xl border border-pink-100 uppercase tracking-widest">
        Klik Peta Untuk Geser Lokasi
      </div>
    </div>
  );
}
