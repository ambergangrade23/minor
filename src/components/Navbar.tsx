import React from 'react';
import { useTransit } from '../context/TransitContext';
import { Bus, Smartphone, GraduationCap, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { role, setRole, wsConnected } = useTransit();

  return (
    <header className="sticky top-0 z-40 bg-[#166534]/92 backdrop-blur-xl border-b border-white/15 shadow-[0_8px_32px_0_rgba(10,46,24,0.22)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark with Claymorphic Bus Icon & Mint Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 clay-btn-green text-white rounded-2xl flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <a href="/" className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
              AITR Transit
            </span>
            <span className="hidden sm:inline-block text-[11px] font-extrabold uppercase px-2.5 py-0.5 clay-pill-mint text-[#166534]">
              Indore Campus
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setRole('student')}
            className={`py-1 transition-all ${
              role === 'student'
                ? 'text-white border-b-2 border-[#22C55E] drop-shadow-xs'
                : 'text-white/75 hover:text-white'
            }`}
          >
            Student & Faculty
          </button>
          <button
            onClick={() => setRole('driver')}
            className={`py-1 transition-all ${
              role === 'driver'
                ? 'text-white border-b-2 border-[#22C55E] drop-shadow-xs'
                : 'text-white/75 hover:text-white'
            }`}
          >
            Driver Cockpit
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`py-1 transition-all ${
              role === 'admin'
                ? 'text-white border-b-2 border-[#22C55E] drop-shadow-xs'
                : 'text-white/75 hover:text-white'
            }`}
          >
            Admin Fleet
          </button>
        </nav>

        {/* Zone 3: Live Sync Badge & Claymorphic Role Selector */}
        <div className="flex items-center gap-3">
          {/* Live Status Badge (Claymorphic) */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold bg-[#114b26]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/10 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.15)]">
            <span
              className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-[#DC2626]'}`}
            />
            <span className="text-[11px] uppercase tracking-wide">
              {wsConnected ? '● Live Telemetry' : 'Connecting'}
            </span>
          </div>

          {/* Claymorphic Segmented Role Switcher */}
          <div className="flex items-center bg-[#114b26]/95 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-[inset_1.5px_2px_4px_rgba(0,0,0,0.35)] gap-1">
            <button
              onClick={() => setRole('student')}
              title="Student view"
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 ${
                role === 'student'
                  ? 'clay-btn-green text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student</span>
            </button>

            <button
              onClick={() => setRole('driver')}
              title="Driver Cockpit"
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 ${
                role === 'driver'
                  ? 'clay-btn-green text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Driver</span>
            </button>

            <button
              onClick={() => setRole('admin')}
              title="Admin Dashboard"
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 ${
                role === 'admin'
                  ? 'clay-btn-green text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
