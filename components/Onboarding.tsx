
import React, { useState } from 'react';
import IdentityCreator from './IdentityCreator';
import { UserIdentity } from '../types';

interface OnboardingProps {
  onComplete: (type: 'guest' | 'anchored', aiProfile?: Partial<UserIdentity>) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [subStep, setSubStep] = useState<'main' | 'ai_creation' | 'traditional'>('main');
  
  if (subStep === 'ai_creation') {
    return (
      <IdentityCreator 
        onComplete={(profile) => onComplete('anchored', profile)} 
        onBack={() => setSubStep('main')} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#0F0F0F] flex flex-col items-center justify-center p-8 text-center overflow-y-auto no-scrollbar">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-white/5 rounded-full blur-[100px] breathing" />
      
      <div className="relative z-10 max-w-sm w-full space-y-16 animate-in fade-in duration-1000">
        <header className="space-y-6">
          <h2 className="text-6xl font-serif italic text-white tracking-tighter">Ambi</h2>
          <p className="text-white/20 text-[10px] uppercase tracking-[0.8em] font-black">Choose Your Resonance</p>
        </header>

        <div className="space-y-6">
           <button 
             onClick={() => onComplete('guest')}
             className="w-full p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:bg-white/[0.05] hover:border-white/10 transition-all group flex items-center space-x-6 active:scale-95"
           >
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white transition-all">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </div>
              <div className="text-left">
                 <p className="text-[14px] font-bold text-white/80">Instant Drift</p>
                 <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">Enter as a Guest Echo</p>
              </div>
           </button>

           <button 
             onClick={() => setSubStep('ai_creation')}
             className="w-full p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:bg-white/[0.05] hover:border-white/10 transition-all group flex items-center space-x-6 active:scale-95"
           >
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white transition-all">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div className="text-left">
                 <p className="text-[14px] font-bold text-white/80">AI Resonance</p>
                 <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">Generate identity from vibe</p>
              </div>
           </button>

           <button 
             onClick={() => setSubStep('traditional')}
             className="w-full p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:bg-white/[0.05] hover:border-white/10 transition-all group flex items-center space-x-6 active:scale-95"
           >
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white transition-all">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <div className="text-left">
                 <p className="text-[14px] font-bold text-white/80">Direct Anchor</p>
                 <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">Traditional setup</p>
              </div>
           </button>
        </div>

        <p className="text-[8px] uppercase tracking-[0.4em] text-white/10 font-black px-12 leading-relaxed">
          Ambi is an autonomous space. All entry modes are private and end-to-end quiet.
        </p>
      </div>

      {subStep === 'traditional' && (
        <div className="fixed inset-0 z-[250] bg-black flex items-center justify-center p-8 animate-in slide-in-from-right-20">
           <div className="w-full max-w-xs space-y-12">
              <h3 className="text-2xl font-serif italic">Manual Initiation</h3>
              <div className="space-y-4">
                <input placeholder="Username" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm outline-none" />
                <input type="password" placeholder="Key" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm outline-none" />
              </div>
              <button 
                onClick={() => onComplete('anchored')}
                className="w-full py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                Initiate
              </button>
              <button onClick={() => setSubStep('main')} className="text-[9px] uppercase tracking-widest text-white/20">Cancel</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
