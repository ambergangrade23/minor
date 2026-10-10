import React from 'react';
import { MapPin, UserCheck, AlertOctagon, Bell, ArrowRight } from 'lucide-react';
import { CharacterState } from './Student3DCanvas';

interface QuickActionsPanelProps {
  onNearbyRoutes: () => void;
  onDriverDetails: () => void;
  onReportProblem: () => void;
  onViewAlerts: () => void;
  onTriggerCharacter: (state: CharacterState) => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onNearbyRoutes,
  onDriverDetails,
  onReportProblem,
  onViewAlerts,
  onTriggerCharacter,
}) => {
  const actions = [
    {
      id: 'nearby',
      title: 'Nearby Routes',
      desc: 'Find available buses near your stop',
      icon: MapPin,
      iconBg: 'bg-sky-50 text-sky-700',
      action: onNearbyRoutes,
      character: 'react_route' as CharacterState,
    },
    {
      id: 'driver',
      title: 'Driver Details',
      desc: 'View available driver contact info',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-700',
      action: onDriverDetails,
      character: 'react_driver' as CharacterState,
    },
    {
      id: 'report',
      title: 'Report Bus Problem',
      desc: 'Report delays, missed bus, or route issues',
      icon: AlertOctagon,
      iconBg: 'bg-rose-50 text-rose-700',
      action: onReportProblem,
      character: 'idle' as CharacterState,
    },
    {
      id: 'alerts',
      title: 'View Bus Alerts',
      desc: 'Check recent route changes and notices',
      icon: Bell,
      iconBg: 'bg-amber-50 text-amber-700',
      action: onViewAlerts,
      character: 'react_alert' as CharacterState,
    },
  ];

  return (
    <div className="w-full max-w-sm bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 p-5 sm:p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all">
      <div className="pb-3 border-b border-slate-200/60 mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#0f172a]">
          Quick Actions
        </h3>
      </div>

      <div className="space-y-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => {
                onTriggerCharacter(act.character);
                act.action();
              }}
              className="w-full p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-white hover:border-sky-200 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0f172a] group-hover:text-[#0284c7] transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold line-clamp-1">
                    {act.desc}
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-sky-100 text-slate-500 group-hover:text-[#0284c7] flex items-center justify-center shrink-0 transition-colors ml-2">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
