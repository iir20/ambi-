
import React from 'react';
import { LifetimeAttention } from '../types';
import { getPresenceLabel, getImpactLabel, getEraName } from '../services/resonance';

interface LifetimeResonanceProps {
  stats: LifetimeAttention;
}

const LifetimeResonance: React.FC<LifetimeResonanceProps> = ({ stats }) => {
  const era = getEraName(stats);
  const presenceLabel = getPresenceLabel(stats);
  const impactLabel = getImpactLabel(stats);

  const hoursTime = Math.round(stats.totalAttentionTime / 3600);

  return (
    <div className="space-y-16 py-10 animate-in fade-in duration-1000">
      <div className="flex flex-col items-center space-y-8">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Orbital Visualization */}
          <div className="absolute inset-0 rounded-full border border-white/[0.03]" />
          <div className="absolute inset-4 rounded-full border border-white/[0.05] animate-spin-slow" style={{ animationDuration: '30s' }} />
          <div className="absolute inset-10 rounded-full border border-white/[0.08] animate-spin-slow" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
          
          <div className="relative z-10 text-center space-y-1">
             <p className="text-[7px] uppercase tracking-[0.6em] text-white/20 font-black">Era Established</p>
             <h4 className="text-2xl font-serif italic text-white/90">{era}</h4>
             <div className="w-8 h-[1px] bg-white/20 mx-auto mt-2" />
          </div>

          {/* Resonance Nodes */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full blur-[1px]"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-110px)`,
                opacity: 0.05 + (stats.totalDeepHolds / 500)
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="p-10 bg-white/[0.01] border border-white/[0.03] rounded-[56px] space-y-4">
          <p className="text-[9px] uppercase tracking-[0.5em] text-white/20 font-black">Presence Synthesis</p>
          <p className="text-xl font-serif italic text-white/60 leading-tight">
            "{presenceLabel}"
          </p>
          <div className="pt-4 flex items-center space-x-4 opacity-20">
             <span className="text-[8px] uppercase tracking-widest">{hoursTime}h Resonated</span>
             <div className="w-1 h-1 bg-white rounded-full" />
             <span className="text-[8px] uppercase tracking-widest">{stats.totalDeepHolds} Deep Holds</span>
          </div>
        </div>

        <div className="p-10 bg-white/[0.01] border border-white/[0.03] rounded-[56px] space-y-4">
          <p className="text-[9px] uppercase tracking-[0.5em] text-white/20 font-black">Impact Horizon</p>
          <p className="text-xl font-serif italic text-white/60 leading-tight">
            "{impactLabel}"
          </p>
          <div className="pt-4 flex items-center space-x-4 opacity-20">
             <span className="text-[8px] uppercase tracking-widest">{stats.totalMutualSignals} Mutuals</span>
             <div className="w-1 h-1 bg-white rounded-full" />
             <span className="text-[8px] uppercase tracking-widest">{stats.totalCapsulesSaved} Captures</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2 pt-10">
         <p className="text-[7px] uppercase tracking-[0.8em] font-black opacity-10">Historical Integrity Verified</p>
      </div>
    </div>
  );
};

export default LifetimeResonance;
