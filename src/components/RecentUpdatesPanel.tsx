import React from 'react';
import { useTransit } from '../context/TransitContext';
import { ArrowUpRight, Clock, ChevronRight } from 'lucide-react';
import { CharacterState } from './Student3DCanvas';

interface RecentUpdatesPanelProps {
  onViewAll: () => void;
  onSelectRoute: (busNumber: string) => void;
  onTriggerCharacter: (state: CharacterState) => void;
}

export const RecentUpdatesPanel: React.FC<RecentUpdatesPanelProps> = ({
  onViewAll,
  onSelectRoute,
  onTriggerCharacter,
}) => {
  const { notifications, replacements } = useTransit();

  // Combine real notifications and curated sample status events for the timeline
  const updates = [
    {
      id: 'up-1',
      route: 'Route 12A',
      status: 'Running on time',
      type: 'ontime',
      time: 'Just now',
    },
    {
      id: 'up-2',
      route: 'Route 7',
      status: 'Replacement Required — 12A Assigned',
      type: 'replacement',
      time: '4m ago',
    },
    {
      id: 'up-3',
      route: 'Route 15',
      status: 'Delayed ~8 min · Ring Road Traffic',
      type: 'delayed',
      time: '12m ago',
    },
    {
      id: 'up-4',
      route: 'Route 9',
      status: 'Running on time',
      type: 'ontime',
      time: '18m ago',
    },
  ];

  return (
    <div className="w-full max-w-sm bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/80 p-5 sm:p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#0f172a]">
          Recent Bus Updates
        </h3>
        <button
          onClick={() => {
            onTriggerCharacter('react_alert');
            onViewAll();
          }}
          className="text-[10px] font-black uppercase tracking-wider text-sky-700 hover:text-sky-900 flex items-center gap-0.5"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2.5">
        {updates.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              onTriggerCharacter('react_bus');
              onSelectRoute(item.route);
            }}
            className="p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-white hover:border-sky-200 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Status Dot */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  item.type === 'ontime'
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : item.type === 'replacement'
                    ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                    : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                }`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#0f172a] group-hover:text-[#0284c7] transition-colors">
                    {item.route}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">·</span>
                  <span className="text-[10px] text-slate-500 font-bold truncate">
                    {item.status}
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-2">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
