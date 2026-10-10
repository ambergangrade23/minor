import React from 'react';
import { useTransit } from '../context/TransitContext';
import { Bell, User, Wifi, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenAlerts: () => void;
  onOpenSettings: () => void;
}

export const TopCenterBranding: React.FC<HeaderProps> = ({
  onOpenAlerts,
  onOpenSettings,
}) => {
  const { wsConnected, notifications } = useTransit();
  const alertCount = notifications.length;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-20 flex items-center justify-between px-6 sm:px-10 pointer-events-none">
      {/* Empty Left Spacer (Sidebar alignment) */}
      <div className="w-20 hidden sm:block pointer-events-auto" />

      {/* Top Center Branding: AITR BUS TRACKING ETA */}
      <div className="flex flex-col items-center pointer-events-auto select-none">
        <h1 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.22em] text-[#0f172a] drop-shadow-xs flex items-center gap-1.5">
          <span>AITR BUS</span>
          <span className="text-[#0284c7]">TRACKING ETA</span>
        </h1>
      </div>

      {/* Top Right User Profile & Notification Badge */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Notification Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative w-10 h-10 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(15,23,42,0.08)] flex items-center justify-center text-slate-700 hover:text-[#0284c7] hover:scale-105 transition-all"
        >
          <Bell className="w-4 h-4 stroke-[2.2]" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0284c7] text-white text-[10px] font-black flex items-center justify-center shadow-md">
              {alertCount}
            </span>
          )}
        </button>

        {/* User Avatar Capsule */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:scale-105 transition-all"
        >
          <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-xs">
            <User className="w-3.5 h-3.5 text-sky-300" />
          </div>
          <span className="text-xs font-black text-[#0f172a] hidden lg:inline">
            AITR Student
          </span>
        </button>
      </div>
    </header>
  );
};
