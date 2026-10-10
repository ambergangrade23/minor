import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import {
  Send,
  AlertOctagon,
  CheckCircle2,
  X,
  Info,
} from 'lucide-react';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ isOpen, onClose }) => {
  const { buses } = useTransit();
  const [selectedBus, setSelectedBus] = useState<string>(buses[0]?.bus_number || 'Route 7');
  const [category, setCategory] = useState<string>('Bus did not arrive');
  const [stopName, setStopName] = useState<string>('Bhanwarkua Chouraha');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate real report transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white/92 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.22)] p-6 sm:p-8 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700 shadow-sm">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide text-[#0f172a]">
                Report Bus Problem
              </h3>
              <p className="text-xs text-[#64748b]">
                Notify AITR Fleet Control & transit coordinators immediately
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

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-[#0f172a] mb-1">Incident Report Transmitted</h4>
            <p className="text-xs text-[#64748b] max-w-sm mb-6 leading-relaxed">
              Ticket #{Math.floor(100000 + Math.random() * 900000)} created. AITR Transit Control is reviewing alternative dispatch for {stopName}.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-[#0f172a] text-white text-xs font-bold uppercase tracking-wider hover:bg-sky-700 transition-all shadow-md"
            >
              Close & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#334155] mb-1">
                  Bus / Route
                </label>
                <select
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200/90 text-[#0f172a] font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.bus_number}>
                      {b.bus_number} — {b.driver_name || 'Assigned Bus'}
                    </option>
                  ))}
                  <option value="General Route">Other / Unscheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#334155] mb-1">
                  Issue Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200/90 text-[#0f172a] font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="Bus did not arrive">Bus did not arrive</option>
                  <option value="Unexpected route change">Unexpected route change</option>
                  <option value="Driver contact issue">Driver contact issue</option>
                  <option value="Incorrect bus information">Incorrect bus information</option>
                  <option value="Overcrowded / skipped stop">Overcrowded / skipped stop</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#334155] mb-1">
                Affected Pickup Stop
              </label>
              <input
                type="text"
                value={stopName}
                onChange={(e) => setStopName(e.target.value)}
                placeholder="e.g. Bhanwarkua, Rajiv Gandhi, Musakhedi"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200/90 text-[#0f172a] font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#334155] mb-1">
                Description & Impact
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred (e.g., replacement bus 12A arrived instead, waited 20 mins past schedule)..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200/90 text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 resize-none font-medium"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                Verified dispatch dispatchers monitor this queue
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-sky-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
