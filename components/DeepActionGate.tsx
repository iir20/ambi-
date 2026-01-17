
import React from 'react';

interface DeepActionGateProps {
  action: string;
  onClose: () => void;
  onInitiateAnchor: () => void;
}

const DeepActionGate: React.FC<DeepActionGateProps> = ({ action, onClose, onInitiateAnchor }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-[#111] border border-white/5 rounded-[48px] p-10 space-y-10 text-center shadow-2xl animate-in zoom-in-95 duration-700">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
           <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-serif italic text-white/90">Deepen Your Signal</h2>
          <p className="text-xs text-white/30 leading-relaxed uppercase tracking-widest font-black">
            To {action}, you must anchor your presence in the sanctuary.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <button 
            onClick={onInitiateAnchor}
            className="w-full py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/90 transition-all active:scale-95"
          >
            Anchor My Presence
          </button>
          <button 
            onClick={onClose}
            className="w-full py-5 text-white/20 hover:text-white/60 transition-colors text-[9px] font-black uppercase tracking-widest"
          >
            Keep Drifting
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeepActionGate;
