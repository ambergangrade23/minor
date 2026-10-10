import React from 'react';
import { Bus, MapPin, Radio, Clock } from 'lucide-react';

export const DynamicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Ambient Glowing Glassmorphic Light Orbs on #F8FAF5 Canvas */}
      <div className="absolute -top-24 -left-24 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-[#A7F3D0]/35 to-[#22C55E]/10 blur-[120px] animate-gentle-pulse" />
      <div className="absolute top-1/3 -right-28 w-[30rem] h-[30rem] rounded-full bg-gradient-to-bl from-[#22C55E]/15 to-[#A7F3D0]/20 blur-[110px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 left-10 w-[26rem] h-[26rem] rounded-full bg-gradient-to-tr from-[#A7F3D0]/25 to-[#166534]/10 blur-[100px] animate-gentle-pulse" />
      <div className="absolute -bottom-24 right-1/4 w-[34rem] h-[34rem] rounded-full bg-gradient-to-t from-[#166534]/10 to-[#22C55E]/10 blur-[120px] animate-glow-pulse" />

      {/* 2. Smooth Vector Transit Arteries */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="routeGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#166534" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#22C55E" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#166534" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* Primary Route Path */}
        <path
          d="M -150 190 C 250 90, 550 330, 950 150 S 1450 390, 2050 170"
          fill="none"
          stroke="url(#routeGradGreen)"
          strokeWidth="3.5"
          strokeDasharray="14 14"
          className="animate-transit-dash"
        />

        {/* Secondary Route Path */}
        <path
          d="M -100 590 C 350 490, 700 790, 1250 530 S 1800 830, 2200 630"
          fill="none"
          stroke="#166534"
          strokeWidth="2.5"
          strokeDasharray="10 14"
          strokeOpacity="0.3"
          className="animate-transit-dash"
        />

        {/* Stable Indore Nodes with subtle radar sweep */}
        <g transform="translate(380, 195)">
          <circle cx="0" cy="0" r="14" fill="#22C55E" fillOpacity="0.15" className="animate-radar-sweep" />
          <circle cx="0" cy="0" r="10" fill="#22C55E" fillOpacity="0.2" />
          <circle cx="0" cy="0" r="6" fill="#166534" />
          <circle cx="0" cy="0" r="2.5" fill="#A7F3D0" />
        </g>

        <g transform="translate(860, 215)">
          <circle cx="0" cy="0" r="16" fill="#22C55E" fillOpacity="0.15" className="animate-radar-sweep" />
          <circle cx="0" cy="0" r="12" fill="#22C55E" fillOpacity="0.2" />
          <circle cx="0" cy="0" r="7" fill="#22C55E" />
          <circle cx="0" cy="0" r="3" fill="#ffffff" />
        </g>

        <g transform="translate(1380, 290)">
          <circle cx="0" cy="0" r="18" fill="#166534" fillOpacity="0.12" className="animate-radar-sweep" />
          <circle cx="0" cy="0" r="14" fill="#166534" fillOpacity="0.15" />
          <circle cx="0" cy="0" r="8" fill="#166534" />
          <circle cx="0" cy="0" r="3.5" fill="#A7F3D0" />
        </g>
      </svg>

      {/* 3. Glassmorphic + Claymorphic Floating Widgets in Margins */}
      {/* Top Left: Fleet Status */}
      <div className="hidden lg:block absolute top-28 left-6 xl:left-10 animate-float-slow">
        <div className="glass-panel px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl clay-btn-primary flex items-center justify-center shrink-0">
            <Bus className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <div className="leading-tight text-[#166534] font-extrabold">AITR FLEET</div>
            <div className="text-[10px] text-[#64748B]">69 Buses Active</div>
          </div>
        </div>
      </div>

      {/* Top Right: Live Telemetry */}
      <div className="hidden lg:block absolute top-32 right-6 xl:right-12 animate-float-reverse">
        <div className="glass-panel px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22c55e]" />
          <div>
            <div className="leading-tight text-[#166534] font-extrabold flex items-center gap-1">
              <span>GPS SYNC</span>
              <Radio className="w-3 h-3 text-[#22C55E]" />
            </div>
            <div className="text-[10px] text-[#22C55E] font-bold">● LIVE</div>
          </div>
        </div>
      </div>

      {/* Mid Left: Campus Hub */}
      <div className="hidden xl:block absolute top-1/2 left-8 animate-float-slow">
        <div className="glass-panel px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl clay-btn-mint flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-[#166534] stroke-[2.5]" />
          </div>
          <div>
            <div className="leading-tight text-[#166534] font-extrabold">CAMPUS HUB</div>
            <div className="text-[10px] text-[#64748B]">Mangliya Bypass</div>
          </div>
        </div>
      </div>

      {/* Bottom Right: Route Shift Timings */}
      <div className="hidden lg:block absolute bottom-28 right-6 xl:right-14 animate-float-reverse">
        <div className="glass-panel px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl clay-btn-mint flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-[#166534] stroke-[2.5]" />
          </div>
          <div>
            <div className="leading-tight text-[#166534] font-extrabold">SCHEDULES</div>
            <div className="text-[10px] text-[#64748B]">8:30 AM & 10:30 AM</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LiveTransitTicker: React.FC = () => {
  return (
    <div className="relative z-10 w-full bg-white/70 backdrop-blur-md border-b border-white/60 overflow-hidden shadow-xs">
      <div className="animate-marquee py-2.5 text-xs font-bold uppercase text-[#17301F] tracking-wide flex items-center">
        <div className="flex items-center gap-8 px-4 whitespace-nowrap shrink-0">
          <span className="flex items-center gap-1.5 clay-pill-live px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22c55e]" />
            <span className="font-extrabold text-[#166534]">● LIVE GPS Tracking Active</span>
          </span>
          <span className="text-[#64748B]">·</span>
          <span className="flex items-center gap-1 text-[#166534] font-extrabold">
            <span>🚌 69 College Buses</span>
          </span>
          <span className="text-[#64748B]">·</span>
          <span>24 Master Route Groups Verified</span>
          <span className="text-[#64748B]">·</span>
          <span className="clay-pill-mint px-2.5 py-0.5 text-[#166534] font-bold">
            Shift 1: 8:30 AM
          </span>
          <span className="clay-pill-mint px-2.5 py-0.5 text-[#166534] font-bold">
            Shift 2: 10:30 AM
          </span>
          <span className="text-[#64748B]">·</span>
          <span className="text-[#64748B]">
            Recommended arrival at stop: 10 minutes before scheduled bus arrival
          </span>
          <span className="text-[#64748B]">·</span>
          <span>Direct Smartphone Geolocation Sync Enabled</span>
        </div>

        {/* Duplicate segment for seamless infinite scroll */}
        <div className="flex items-center gap-8 px-4 whitespace-nowrap shrink-0" aria-hidden="true">
          <span className="flex items-center gap-1.5 clay-pill-live px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22c55e]" />
            <span className="font-extrabold text-[#166534]">● LIVE GPS Tracking Active</span>
          </span>
          <span className="text-[#64748B]">·</span>
          <span className="flex items-center gap-1 text-[#166534] font-extrabold">
            <span>🚌 69 College Buses</span>
          </span>
          <span className="text-[#64748B]">·</span>
          <span>24 Master Route Groups Verified</span>
          <span className="text-[#64748B]">·</span>
          <span className="clay-pill-mint px-2.5 py-0.5 text-[#166534] font-bold">
            Shift 1: 8:30 AM
          </span>
          <span className="clay-pill-mint px-2.5 py-0.5 text-[#166534] font-bold">
            Shift 2: 10:30 AM
          </span>
          <span className="text-[#64748B]">·</span>
          <span className="text-[#64748B]">
            Recommended arrival at stop: 10 minutes before scheduled bus arrival
          </span>
          <span className="text-[#64748B]">·</span>
          <span>Direct Smartphone Geolocation Sync Enabled</span>
        </div>
      </div>
    </div>
  );
};
