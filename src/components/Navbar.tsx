import React from 'react';
import { useTransit } from '../context/TransitContext';
import { Bus, Radio, Bell, Shield, Smartphone, GraduationCap } from 'lucide-react';
import { Role } from '../types/transit';

export const Navbar: React.FC = () => {
  const { role, setRole, wsConnected, notifications } = useTransit();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Bus className="w-5 h-5 text-indigo-400" />
          </div>
          <a href="/" className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
            <span>AITR Transit</span>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              Indore
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links (Clean text navigation) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setRole('student')}
            className={`transition-colors py-1 ${
              role === 'student' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Student & Faculty
          </button>
          <button
            onClick={() => setRole('driver')}
            className={`transition-colors py-1 ${
              role === 'driver' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Driver Cockpit
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`transition-colors py-1 ${
              role === 'admin' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Admin Fleet Control
          </button>
        </nav>

        {/* Zone 3: Interactive Role Segmented Control & Status */}
        <div className="flex items-center gap-3">
          {/* WebSocket Live Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            <span
              className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}
            ></span>
            <span>{wsConnected ? 'Live GPS Sync' : 'Reconnecting'}</span>
          </div>

          {/* Quick Role Switcher Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setRole('student')}
              title="Switch to Student / Faculty view"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                role === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student</span>
            </button>

            <button
              onClick={() => setRole('driver')}
              title="Switch to Driver Cockpit"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                role === 'driver' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Driver</span>
            </button>

            <button
              onClick={() => setRole('admin')}
              title="Switch to Admin Dashboard"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                role === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
