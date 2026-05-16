"use client";

import dynamic from 'next/dynamic';

const DashboardMap = dynamic(() => import('./DashboardMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-2xl bg-gray-100 flex items-center justify-center animate-pulse border border-gray-200">
      <div className="text-gray-400 font-medium">Memuat Peta...</div>
    </div>
  )
});

export default function MapWrapper() {
  return <DashboardMap />;
}
