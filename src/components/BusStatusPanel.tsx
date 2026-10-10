import React from 'react';
import { useTransit } from '../context/TransitContext';
import { Bus, UserCheck, Clock, ArrowRight, MapPin } from 'lucide-react';
import { CharacterState } from './Student3DCanvas';

interface BusStatusPanelProps {
  onOpenDetails: () => void;
  onTriggerCharacter: (state: CharacterState) => void;
}

export const BusStatusPanel: React.FC<BusStatusPanelProps> = ({
  onOpenDetails,
  onTriggerCharacter,
}) => {
  const { buses, activeBus, shift, replacements } = useTransit();

  // Find active bus or first bus
  const displayBus = activeBus || buses[0];
  const busReplacement = replacements.find(
    (r) => r.regular_bus_number === displayBus?.bus_number && r.status === 'PUBLISHED'
  );

  const hasReplacement = Boolean(busReplacement);
  const driverName = hasReplacement
    ? busReplacement?.replacement_driver_name || 'Rameshwar Ji (Standby)'
    : displayBus?.driver_name || 'Dinesh Sharma';
  const driverPhone = hasReplacement
    ? busReplacement?.replacement_driver_phone || '+91 98260 11223'
    : displayBus?.driver_phone || '+91 94250 88761';
  const busNumber = hasReplacement
    ? busReplacement?.replacement_bus_number || '12A'
    : displayBus?.bus_number || 'Route 7';
  const regularBus = displayBus?.bus_number || 'Route 7';
  const departureTime = shift === 'shift_1' ? '07:15 AM' : '08:45 AM';
  const currentPickupStop = displayBus?.pickup_areas?.[0] || 'Bhanwarkua Chouraha';

  return (
    <div
      onClick={() => {
        onTriggerCharacter('react_bus');
        onOpenDetails();
      }}
      className="w-full max-w-sm bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 p-5 sm:p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_48px_rgba(2,132,199,0.18)] hover:scale-[1.01] transition-all cursor-pointer group"
    >
      {/* Header with Today's Bus Status & Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              hasReplacement
                ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
            }`}
          />
          <h3 className="text-xs font-black uppercase tracking-widest text-[#0f172a]">
            Today's Bus Status
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-sky-700 group-hover:translate-x-0.5 transition-transform">
          <span className="text-[10px] uppercase font-black">Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Bus Status Highlight */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Regular Bus
            </span>
            <div className="text-sm font-black text-[#0f172a]">{regularBus}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operational Status
            </span>
            <div
              className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full inline-block ${
                hasReplacement
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}
            >
              {hasReplacement ? 'Replacement Active' : 'On Schedule'}
            </div>
          </div>
        </div>

        {/* Big Replacement or Active Number Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50/50 border border-sky-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
              Boarding Bus Number
            </span>
            <div className="text-xl font-black text-[#0f172a] tracking-tight">
              {busNumber}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 shadow-xs flex items-center justify-center text-[#0284c7]">
            <Bus className="w-5 h-5" />
          </div>
        </div>

        {/* Driver Name & Verified Contact */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Driver Name
            </span>
            <span className="font-extrabold text-[#0f172a] truncate block">
              {driverName}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Driver Contact
            </span>
            <span className="font-extrabold text-sky-700 truncate block">
              {driverPhone}
            </span>
          </div>
        </div>

        {/* Departure Time & Pickup Point */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-[#0f172a]">{departureTime}</span>
            <span className="text-[10px] text-slate-400">
              ({shift === 'shift_1' ? 'Shift 1' : 'Shift 2'})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="font-semibold text-slate-700 truncate">{currentPickupStop}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
