import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { TransitNotification } from '../types/transit';
import {
  Bell,
  AlertTriangle,
  Bus as BusIcon,
  X,
  ArrowRight,
} from 'lucide-react';

interface BusAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBus?: (busNumber: string) => void;
}

export const BusAlertsModal: React.FC<BusAlertsModalProps> = ({
  isOpen,
  onClose,
  onSelectBus,
}) => {
  const { notifications, replacements } = useTransit();
  const [filter, setFilter] = useState<'ALL' | 'BUS_REPLACEMENT' | 'DELAY'>('ALL');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'BUS_REPLACEMENT') return n.type === 'BUS_REPLACEMENT';
    if (filter === 'DELAY') return n.type === 'DELAY';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.22)] p-6 sm:p-7 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700 shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide text-[#0f172a]">
                Bus Alerts & Replacement Bulletin
              </h3>
              <p className="text-xs text-[#64748b]">
                Official transport notices issued by AITR Fleet Administration
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

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-[#0f172a] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Notices ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('BUS_REPLACEMENT')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filter === 'BUS_REPLACEMENT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Replacements
          </button>
          <button
            onClick={() => setFilter('DELAY')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filter === 'DELAY'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Delays / Corridors
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No alerts matching the selected category.
            </div>
          ) : (
            filteredNotifications.map((notif: TransitNotification) => {
              const isReplacement = notif.type === 'BUS_REPLACEMENT';
              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isReplacement
                      ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                      : 'bg-slate-50/80 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isReplacement
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {isReplacement ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <BusIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-wide">
                            {notif.bus_number} — {notif.stop_name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isReplacement
                                ? 'bg-amber-200/80 text-amber-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {notif.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          {notif.message}
                        </p>

                        {/* Extra metadata */}
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400 font-semibold">
                          <span className="text-[#0f172a]">
                            Bus: <span className="font-extrabold">{notif.bus_number}</span>
                          </span>
                          <span>
                            {new Date(notif.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {notif.bus_number && onSelectBus && (
                      <button
                        onClick={() => {
                          onSelectBus(notif.bus_number);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-200 text-[11px] font-bold text-sky-700 flex items-center gap-1 shrink-0 transition-all shadow-xs"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">
            Acropolis Fleet Operational Notifications
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0f172a] text-white font-bold hover:bg-sky-700 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
