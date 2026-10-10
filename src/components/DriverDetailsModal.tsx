import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { Bus as BusType } from '../types/transit';
import {
  UserCheck,
  Phone,
  ShieldCheck,
  X,
  AlertCircle,
} from 'lucide-react';

interface DriverDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBus?: BusType | null;
}

export const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedBus,
}) => {
  const { buses, replacements } = useTransit();
  const [activeTab, setActiveTab] = useState<string>(selectedBus ? selectedBus.id : buses[0]?.id || '');

  if (!isOpen) return null;

  const currentBus = buses.find((b) => b.id === activeTab) || selectedBus || buses[0];
  const busReplacement = replacements.find((r) => r.regular_bus_number === currentBus?.bus_number && r.status === 'PUBLISHED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.22)] p-6 sm:p-7 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700 shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide text-[#0f172a]">
                Driver & Transit Fleet Details
              </h3>
              <p className="text-xs text-[#64748b]">
                Verified contact details for assigned regular and replacement drivers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bus Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {buses.slice(0, 6).map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveTab(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === b.id
                  ? 'bg-[#0f172a] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {b.bus_number}
            </button>
          ))}
        </div>

        {/* Driver Card */}
        {currentBus && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200/80 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-md">
                    Regular Bus Assignment
                  </span>
                  <h4 className="text-lg font-extrabold text-[#0f172a] mt-1.5">
                    {currentBus.driver_name || 'Driver Not Assigned'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Bus Number: <span className="font-bold text-[#0f172a]">{currentBus.bus_number}</span> · Status: {currentBus.assignment_status || 'REGULAR'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-sky-700 font-black text-sm">
                  {currentBus.bus_number.replace('Bus ', '#')}
                </div>
              </div>

              {/* Verified Contact Details */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Driver Phone
                    </span>
                    <span className="text-xs font-bold text-[#0f172a]">
                      {currentBus.driver_phone || 'Protected / Via Dispatch'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Verification Status
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <span>●</span> {currentBus.driver_phone_verified ? 'Verified Direct Contact' : 'Campus Fleet Registry'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Replacement Notice if exists */}
            {busReplacement ? (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-[#0f172a]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                    Active Replacement Bus: {busReplacement.replacement_bus_number}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-amber-700/80 block">Replacement Driver:</span>
                    <span className="font-bold">{busReplacement.replacement_driver_name || 'Standby Driver'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-700/80 block">Direct Contact:</span>
                    <span className="font-bold">{busReplacement.replacement_driver_phone || 'Call Fleet Desk'}</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 mt-2 font-medium">
                  Reason: {busReplacement.reason || 'Operational adjustment'} (Effective {busReplacement.effective_date})
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-emerald-900 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">
                  No replacement required today. Regular driver is scheduled for both morning shifts.
                </span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">
                AITR Transport Cell Hotline: <span className="font-bold text-[#0f172a]">+91 731 4730000</span>
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#0f172a] text-white font-bold hover:bg-sky-700 transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
