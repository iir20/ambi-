
import React, { useEffect, useState } from 'react';
import { UserIdentity } from '../types';

interface StillnessSanctuaryProps {
  currentUser: UserIdentity;
  onExit: () => void;
}

const StillnessSanctuary: React.FC<StillnessSanctuaryProps> = ({ currentUser, onExit }) => {
  const [seconds, setSeconds] = useState(0);
  const [othersCount, setOthersCount] = useState(3); // Simulated presence

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#050505] flex flex-col items-center justify-center animate-in fade-in duration-[3000ms]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Presence Nodes */}
        {[...Array(othersCount)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-64 h-64 rounded-full blur-[80px] opacity-10 animate-pulse"
            style={{
              backgroundColor: ['#E8D5C4', '#D4C4E8', '#C4E8D5'][i % 3],
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 80}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: '10s'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-12">
        <div className="space-y-4">
           <h2 className="text-4xl font-serif italic text-white/40 tracking-widest">The Quiet</h2>
           <p className="text-[10px] uppercase tracking-[0.8em] text-white/10 font-black">Shared Stillness Session</p>
        </div>

        <div className="w-48 h-48 rounded-full border border-white/5 flex items-center justify-center relative group mx-auto">
           <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-20" style={{ animationDuration: '4s' }} />
           <p className="text-3xl font-serif italic text-white/60">{formatTime(seconds)}</p>
        </div>

        <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 italic">
          {othersCount} other echoes are present in this silence.
        </p>

        <button 
          onClick={onExit}
          className="px-12 py-5 bg-white/[0.02] border border-white/5 rounded-full text-[9px] uppercase tracking-[0.4em] text-white/30 hover:text-white/60 hover:bg-white/5 transition-all active:scale-95"
        >
          Return to the Drift
        </button>
      </div>

      <div className="absolute bottom-12 left-0 right-0 px-12 opacity-5 pointer-events-none">
         <p className="text-[7px] uppercase tracking-[1em] text-white text-center italic">Presence is enough.</p>
      </div>
    </div>
  );
};

export default StillnessSanctuary;
