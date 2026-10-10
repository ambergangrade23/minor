import React from 'react';
import { Bus, Bell, ArrowRight, TrendingUp } from 'lucide-react';
import { CharacterState } from './Student3DCanvas';

interface StudentProfilePanelProps {
  onFindBus: () => void;
  onBusAlerts: () => void;
  onTriggerCharacter: (state: CharacterState) => void;
}

export const StudentProfilePanel: React.FC<StudentProfilePanelProps> = ({
  onFindBus,
  onBusAlerts,
  onTriggerCharacter,
}) => {
  return (
    <div className="w-full max-w-sm bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 p-5 sm:p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all">
      {/* Student Welcome Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/student_avatar_icon.jpg"
              alt="Student Avatar"
              referrerPolicy="no-referrer"
              className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-md shadow-sky-500/10"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0369a1]">
              Welcome Back,
            </span>
            <h2 className="text-xl font-black text-[#0f172a] tracking-tight">
              Student 👋
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              Smarter routes · Real-time updates
            </p>
          </div>
        </div>

        {/* Decorative Activity Spark Graph */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/50">
            <TrendingUp className="w-3 h-3" />
            <span>98% On-Time</span>
          </div>
          {/* Mini weekly transit bars */}
          <div className="flex items-end gap-1 h-6 mt-1.5">
            <span className="w-1.5 h-3 rounded-full bg-slate-300" />
            <span className="w-1.5 h-4 rounded-full bg-slate-300" />
            <span className="w-1.5 h-5 rounded-full bg-sky-400" />
            <span className="w-1.5 h-6 rounded-full bg-[#0284c7]" />
            <span className="w-1.5 h-4.5 rounded-full bg-sky-400" />
          </div>
        </div>
      </div>

      {/* Two Prominent Action Tiles matching the reference */}
      <div className="space-y-3 pt-1">
        {/* Tile 1: Find My Bus (White card, Navy text) */}
        <button
          onClick={() => {
            onTriggerCharacter('react_bus');
            onFindBus();
          }}
          className="w-full p-4 rounded-2xl bg-white/90 hover:bg-white border border-white shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(2,132,199,0.15)] hover:scale-[1.02] transition-all flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100 group-hover:bg-[#0284c7] group-hover:text-white transition-colors">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0f172a] group-hover:text-[#0284c7] transition-colors">
                Find My Bus
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 line-clamp-1">
                Check my route and nearby alternatives.
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-sky-100 text-slate-700 group-hover:text-[#0284c7] flex items-center justify-center shrink-0 transition-colors ml-2">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Tile 2: Bus Alerts (Navy blue card, White text) */}
        <button
          onClick={() => {
            onTriggerCharacter('react_alert');
            onBusAlerts();
          }}
          className="w-full p-4 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)] hover:shadow-[0_12px_28px_rgba(2,132,199,0.25)] hover:scale-[1.02] transition-all flex items-center justify-between text-left group border border-slate-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 border border-slate-700 group-hover:bg-[#0284c7] group-hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Bus Alerts
              </h3>
              <p className="text-[11px] text-slate-300 font-semibold mt-0.5 line-clamp-1">
                View recent bus changes and notifications.
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-[#0284c7] text-white flex items-center justify-center shrink-0 transition-colors ml-2">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
