import React from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { Navbar } from './components/Navbar';
import { StudentView } from './components/StudentView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';
import { DynamicBackground, LiveTransitTicker } from './components/DynamicBackground';

const MainContent: React.FC = () => {
  const { role } = useTransit();

  return (
    <div className="relative min-h-screen flex flex-col bg-transit-dashboard text-[#17301F] font-sans selection:bg-[#A7F3D0] selection:text-[#166534] overflow-x-hidden">
      <DynamicBackground />
      <Navbar />
      <LiveTransitTicker />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'student' && <StudentView />}
        {role === 'driver' && <DriverView />}
        {role === 'admin' && <AdminView />}
      </main>

      <footer className="relative z-10 border-t border-white/80 bg-white/75 backdrop-blur-md py-6 mt-12 text-xs font-medium text-[#64748B] shadow-[0_-4px_20px_rgba(22,101,52,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-sm text-[#166534]">Acropolis Institute of Technology & Research (AITR)</span>
            <span className="mx-2">·</span>
            <span>Indore Bypass Road, Mangliya, MP 453771</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 clay-pill-mint text-[#166534] text-[11px] font-bold uppercase tracking-wide">
              AITR Campus Fleet
            </span>
            <span className="text-[#64748B]">OpenStreetMap & Direct Smartphone Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TransitProvider>
      <MainContent />
    </TransitProvider>
  );
}
