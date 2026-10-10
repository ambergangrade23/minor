import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import { CharacterState } from './Student3DCanvas';

interface HeroMessageProps {
  onFindAlternatives: () => void;
  onTriggerCharacter: (state: CharacterState) => void;
}

export const HeroMessage: React.FC<HeroMessageProps> = ({
  onFindAlternatives,
  onTriggerCharacter,
}) => {
  return (
    <div className="max-w-md bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 p-5 sm:p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] select-none">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a] leading-none">
        Your route changed.
      </h1>
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0284c7] mt-1 leading-none">
        We'll get you there.
      </h2>

      <p className="text-xs text-slate-600 font-medium mt-3 leading-relaxed">
        Find nearby bus routes, check replacement updates, and get the right driver's contact details instantly across all Indore corridors.
      </p>

      <div className="pt-3 flex items-center gap-3">
        <button
          onClick={() => {
            onTriggerCharacter('react_route');
            onFindAlternatives();
          }}
          className="px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-[#0284c7] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md group"
        >
          <span>Find Nearby Routes</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>

        <span className="text-[11px] font-bold text-slate-400">
          AITR Transport Cell
        </span>
      </div>
    </div>
  );
};
