import React, { useState } from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { FuturisticCampusDashboard } from './components/FuturisticCampusDashboard';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';
import { Navbar } from './components/Navbar';
import { ArrowLeft, Sparkles, GraduationCap } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role, setRole } = useTransit();
  const [dashboardMode, setDashboardMode] = useState<'futuristic' | 'standard'>('futuristic');

  // When in student mode and futuristic mode (default), show the CAMPUSOPS reference experience
  if (role === 'student' && dashboardMode === 'futuristic') {
    return (
      <div className="relative w-screen h-screen overflow-hidden">
        <FuturisticCampusDashboard />
        
        {/* Discreet bottom mode switch allowing standard grid mode or driver/admin switches */}
        <div className="fixed bottom-3 left-24 z-40 hidden sm:flex items-center gap-2">
          <button
            onClick={() => setDashboardMode('standard')}
            className="px-3 py-1.5 rounded-xl bg-white/75 hover:bg-white text-slate-600 hover:text-[#0f172a] backdrop-blur-md border border-white/80 shadow-xs text-[10px] font-black uppercase tracking-wider transition-all"
            title="Switch to detailed transit tables"
          >
            Switch to Detailed Grid View
          </button>
        </div>
      </div>
    );
  }

  // Driver, Admin, or Detailed Student Mode with standard navigation bar
  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 text-[#0f172a] font-sans selection:bg-sky-100 selection:text-sky-900 overflow-x-hidden">
      <Navbar />

      {/* Futuristic Mode Return Banner */}
      {role === 'student' && (
        <div className="bg-sky-50 border-b border-sky-100 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Viewing Detailed Transit Roster
            </span>
            <button
              onClick={() => setDashboardMode('futuristic')}
              className="px-3 py-1 rounded-xl bg-[#0f172a] hover:bg-sky-700 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to 3D Dashboard</span>
            </button>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'student' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#0f172a]">Acropolis Transit Operations</h1>
                <p className="text-xs text-slate-500 font-semibold">Standard tabular schedules, corridor matrices, and verified route sheets.</p>
              </div>
            </div>
            {/* Lazy-load or import existing StudentView components */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <p className="text-sm text-slate-600 mb-4">
                You can toggle between the 3D cinematic CAMPUSOPS view and detailed fleet telemetry at any time.
              </p>
              <button
                onClick={() => setDashboardMode('futuristic')}
                className="px-6 py-3 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                Launch 3D Campus Experience
              </button>
            </div>
          </div>
        )}
        {role === 'driver' && <DriverView />}
        {role === 'admin' && <AdminView />}
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-white/80 backdrop-blur-md py-6 mt-12 text-xs font-medium text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-sm text-[#0f172a]">AITR BUS TRACKING ETA</span>
            <span className="mx-2">·</span>
            <span>Acropolis Institute of Technology & Research (AITR), Indore</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold uppercase tracking-wide">
              CAMPUSOPS Engine
            </span>
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
