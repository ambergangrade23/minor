import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { ShiftType } from '../types/transit';
import { Settings, BellRing, RotateCcw, X, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { shift, setShift } = useTransit();
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [autoRefreshEta, setAutoRefreshEta] = useState<boolean>(true);
  const [preferredRadius, setPreferredRadius] = useState<number>(1.5);
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.22)] p-6 sm:p-7 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide text-[#0f172a]">
                Transit Preferences
              </h3>
              <p className="text-xs text-[#64748b]">Configure display & smart alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Shift Selection */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
            <label className="block text-[11px] font-black uppercase tracking-wider text-[#334155] mb-2">
              Default Academic Shift
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShift('shift_1')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  shift === 'shift_1'
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Shift 1 (08:30 AM)
              </button>
              <button
                type="button"
                onClick={() => setShift('shift_2')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  shift === 'shift_2'
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Shift 2 (10:00 AM)
              </button>
            </div>
          </div>

          {/* Walking Distance Threshold */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#334155]">
                Alternative Walk Radius
              </span>
              <span className="text-xs font-black text-sky-700">{preferredRadius} km</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.5"
              value={preferredRadius}
              onChange={(e) => setPreferredRadius(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>500 m (5 mins)</span>
              <span>1.5 km (Optimal)</span>
              <span>3.0 km</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <BellRing className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-[#0f172a]">Live Bus Replacement Push</span>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 accent-sky-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-[#0f172a]">Continuous ETA Auto-Refresh</span>
              </div>
              <input
                type="checkbox"
                checked={autoRefreshEta}
                onChange={(e) => setAutoRefreshEta(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 accent-sky-600"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-sky-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
