import React, { useState } from 'react';
import {
  Home,
  Search,
  Bell,
  MapPin,
  UserCheck,
  AlertOctagon,
  Settings,
  Shield,
  Smartphone,
  GraduationCap,
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { CharacterState } from './Student3DCanvas';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onTriggerCharacter: (state: CharacterState) => void;
}

export const FuturisticSidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onTriggerCharacter,
}) => {
  const { role, setRole, notifications } = useTransit();
  const unreadAlerts = notifications.length;

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      characterAction: 'walking' as CharacterState,
    },
    {
      id: 'find_bus',
      label: 'Find Bus',
      icon: Search,
      characterAction: 'react_bus' as CharacterState,
    },
    {
      id: 'alerts',
      label: 'Bus Alerts',
      icon: Bell,
      badge: unreadAlerts > 0 ? unreadAlerts : undefined,
      characterAction: 'react_alert' as CharacterState,
    },
    {
      id: 'nearby',
      label: 'Nearby Routes',
      icon: MapPin,
      characterAction: 'react_route' as CharacterState,
    },
    {
      id: 'drivers',
      label: 'Driver Details',
      icon: UserCheck,
      characterAction: 'react_driver' as CharacterState,
    },
    {
      id: 'report',
      label: 'Report Problem',
      icon: AlertOctagon,
      characterAction: 'idle' as CharacterState,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      characterAction: 'idle' as CharacterState,
    },
  ];

  const handleItemClick = (id: string, action: CharacterState) => {
    onTabChange(id);
    onTriggerCharacter(action);
  };

  return (
    <aside className="fixed left-3 sm:left-4 top-20 bottom-6 z-40 w-16 sm:w-20 flex flex-col items-center justify-between py-5 bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition-all">
      {/* Top Brand Glyph */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0284c7] to-[#0ea5e9] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(2,132,199,0.35)]">
          <span className="font-black text-sm tracking-tighter">PS</span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-[#0369a1]">
          v2.6
        </span>
      </div>

      {/* Main Navigation Stack */}
      <nav className="flex flex-col items-center gap-2.5 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id, item.characterAction)}
              title={item.label}
              className={`group relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-sky-100 text-[#0369a1] shadow-[0_4px_16px_rgba(2,132,199,0.18)] scale-105'
                  : 'text-slate-500 hover:text-[#0f172a] hover:bg-white/90'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2] transition-transform group-hover:scale-110" />

              {/* Unread Alert Bubble */}
              {item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}

              {/* Minimal Tooltip for small screen / hover accessibility */}
              <span className="absolute left-16 px-2.5 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Switcher: Student / Driver / Admin */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-200/60 w-full px-2">
        <button
          onClick={() => setRole(role === 'student' ? 'driver' : role === 'driver' ? 'admin' : 'student')}
          title={`Active View: ${role.toUpperCase()}`}
          className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-all"
        >
          {role === 'student' && <GraduationCap className="w-4 h-4 text-sky-600" />}
          {role === 'driver' && <Smartphone className="w-4 h-4 text-emerald-600" />}
          {role === 'admin' && <Shield className="w-4 h-4 text-purple-600" />}
        </button>
      </div>
    </aside>
  );
};
