
import React, { useState, useEffect } from 'react';
import { TimeCapsule } from '../types';

interface FeedCapsuleProps {
  capsule: TimeCapsule;
  onVisitProfile: (id: string) => void;
}

const CountdownTimer: React.FC<{ target: number }> = ({ target }) => {
  const [timeLeft, setTimeLeft] = useState(target - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(target - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const h = Math.floor((timeLeft / (1000 * 60 * 60)));
  const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="flex space-x-2 font-black italic tracking-tighter text-[10px]">
      <span>{h}H</span><span>:</span><span>{m}M</span><span>:</span><span>{s}S</span>
    </div>
  );
};

const FeedCapsule: React.FC<FeedCapsuleProps> = ({ capsule, onVisitProfile }) => {
  const isLocked = capsule.unlockAt > Date.now();

  return (
    <div className="bg-white/[0.01] border border-dashed border-white/[0.08] rounded-[48px] p-10 mb-12 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <button onClick={() => onVisitProfile(capsule.authorId)} className="flex items-center space-x-4">
          <img src={capsule.authorAvatar} className="w-8 h-8 rounded-full grayscale opacity-40" alt="" />
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{capsule.authorName}</p>
            <p className="text-[8px] text-white/10 uppercase tracking-[0.2em]">Temporal Anchor</p>
          </div>
        </button>
        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
           <p className="text-[7px] font-black uppercase tracking-widest text-white/30">{capsule.type}</p>
        </div>
      </div>

      <div className="relative py-4">
        {isLocked ? (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4 opacity-20">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <p className="text-xl font-serif italic text-white/10 select-none">
              Artifact shrouded in time.
            </p>
            <div className="pt-4 border-t border-white/[0.03] flex flex-col items-center">
               <p className="text-[8px] uppercase tracking-[0.5em] text-white/20 mb-2 font-black">Revelation In</p>
               <CountdownTimer target={capsule.unlockAt} />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-1000">
            <p className="text-base leading-relaxed text-white/70 font-light italic">
              "{capsule.content}"
            </p>
            {capsule.media && (
              <div className="mt-6 rounded-[32px] overflow-hidden border border-white/5">
                <img src={capsule.media} className="w-full grayscale opacity-80" alt="Revealed artifact" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative gradient for locked feel */}
      {isLocked && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default FeedCapsule;
