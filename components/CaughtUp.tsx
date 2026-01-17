
import React from 'react';

const CaughtUp: React.FC = () => {
  return (
    <div className="py-40 text-center animate-in fade-in duration-[2000ms] space-y-12">
      <div className="relative inline-block">
        <div className="w-[1px] h-32 bg-gradient-to-b from-white/20 to-transparent mx-auto" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl opacity-20 breathing" />
      </div>
      
      <div className="space-y-6">
        <h3 className="text-3xl font-serif italic text-white/80">Stillness achieved.</h3>
        <p className="text-[10px] uppercase tracking-[0.6em] text-white/10 font-black">Presence Balance Restored</p>
        
        <div className="max-w-xs mx-auto space-y-8 pt-8">
          <p className="text-[12px] text-white/30 leading-relaxed italic font-light">
            You have witnessed all current signals from your circle. The world is quiet now.
          </p>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-10 py-4 border border-white/5 rounded-full text-[9px] uppercase tracking-[0.4em] font-black text-white/20 hover:text-white/60 hover:border-white/20 transition-all duration-700 bg-white/[0.01]"
          >
            Reflect from the top
          </button>
        </div>
      </div>
      
      <div className="pt-20">
         <div className="w-1.5 h-1.5 rounded-full bg-white/5 mx-auto animate-pulse" />
      </div>
    </div>
  );
};

export default CaughtUp;
