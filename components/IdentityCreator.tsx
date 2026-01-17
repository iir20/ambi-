
import React, { useState, useEffect } from 'react';
import { generateIdentityFromVibe } from '../services/gemini';
import { UserIdentity, PresenceTone } from '../types';

interface IdentityCreatorProps {
  onComplete: (identity: Partial<UserIdentity>) => void;
  onBack: () => void;
}

const MANIFESTATION_PHASES = [
  "scanning the collective frequency...",
  "sifting through the digital drift...",
  "anchoring your resonance...",
  "synthesizing your unique essence...",
  "manifesting presence..."
];

const IdentityCreator: React.FC<IdentityCreatorProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<'vibe' | 'tone' | 'preview'>('vibe');
  const [vibe, setVibe] = useState('');
  const [tone, setTone] = useState<PresenceTone>('ethereal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [preview, setPreview] = useState<any>(null);
  const [seedCount, setSeedCount] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      interval = window.setInterval(() => {
        setLoadingPhase(prev => (prev + 1) % MANIFESTATION_PHASES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (refine: boolean = false) => {
    if (!vibe.trim()) return;
    setIsGenerating(true);
    setLoadingPhase(0);
    
    const enrichedVibe = `${vibe} with a ${tone} presence tone`;
    const seed = refine && preview ? `${preview.handle}_v${seedCount + 1}` : undefined;
    
    if (refine) setSeedCount(prev => prev + 1);
    else setSeedCount(0);

    try {
      const result = await generateIdentityFromVibe(enrichedVibe, seed);
      // Give the user a moment to feel the manifestation
      setTimeout(() => {
        setPreview({ ...result, tone });
        setIsGenerating(false);
        setStep('preview');
      }, 3000);
    } catch (e) {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000 overflow-y-auto no-scrollbar">
      
      {/* Manifestation Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[400] bg-[#0A0A0A] flex flex-col items-center justify-center p-12 space-y-12 animate-in fade-in duration-1000">
           <div 
             className="w-64 h-64 rounded-full blur-[100px] opacity-20 breathing"
             style={{ backgroundColor: preview?.color || '#FFFFFF' }}
           />
           <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.8em] text-white/10 font-black animate-pulse">Manifesting Identity</p>
              <p className="text-2xl font-serif italic text-white/40 animate-in fade-in slide-in-from-bottom-2 duration-1000" key={loadingPhase}>
                {MANIFESTATION_PHASES[loadingPhase]}
              </p>
           </div>
        </div>
      )}

      {step === 'vibe' && !isGenerating && (
        <div className="w-full max-w-sm space-y-12 animate-in slide-in-from-right-10">
          <header className="space-y-4">
            <h2 className="text-4xl font-serif italic text-white/90">Define Your Vibe</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">How do you want to exist here?</p>
          </header>
          
          <div className="space-y-4">
             <textarea 
               autoFocus
               value={vibe}
               onChange={(e) => setVibe(e.target.value)}
               placeholder="Slow living, forest rain, minimalist pottery..."
               className="w-full bg-white/[0.02] border border-white/5 rounded-[40px] p-8 text-xl font-serif italic text-white/60 outline-none focus:border-white/20 transition-all resize-none h-40 placeholder:text-white/5"
             />
             <div className="flex flex-wrap gap-2 justify-center">
                {['Dark Academia', 'Solarpunk', 'Retro Minimal', 'Cyber Zen'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setVibe(tag)}
                    className="px-4 py-2 bg-white/5 rounded-full text-[8px] uppercase tracking-widest text-white/20 hover:text-white transition-all"
                  >
                    {tag}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4 pt-10">
            <button 
              onClick={() => setStep('tone')}
              disabled={!vibe.trim()}
              className="w-full py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] disabled:opacity-20 active:scale-95 transition-all"
            >
              Continue
            </button>
            <button onClick={onBack} className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white transition-colors">Abort</button>
          </div>
        </div>
      )}

      {step === 'tone' && !isGenerating && (
        <div className="w-full max-w-sm space-y-12 animate-in slide-in-from-right-10">
          <header className="space-y-4">
            <h2 className="text-4xl font-serif italic text-white/90">Resonance Tone</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">The soul of your frequency</p>
          </header>
          
          <div className="grid grid-cols-2 gap-4">
            {(['ethereal', 'grounded', 'luminous', 'shadow'] as PresenceTone[]).map(t => (
              <button 
                key={t}
                onClick={() => setTone(t)}
                className={`p-8 rounded-[40px] border transition-all text-left space-y-2 ${tone === t ? 'bg-white/10 border-white/40' : 'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-100'}`}
              >
                <div className={`w-3 h-3 rounded-full mb-4 ${t === 'ethereal' ? 'bg-purple-200' : t === 'grounded' ? 'bg-amber-100' : t === 'luminous' ? 'bg-white' : 'bg-gray-700'}`} />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/90">{t}</p>
                <p className="text-[8px] text-white/20 leading-relaxed italic">
                  {t === 'ethereal' ? 'Light and shifting signals.' : t === 'grounded' ? 'Steady, rooted frequencies.' : t === 'luminous' ? 'Vibrant, active resonance.' : 'Quiet, shrouded echoes.'}
                </p>
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-10">
            <button 
              onClick={() => handleGenerate(false)}
              disabled={isGenerating}
              className="w-full py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] disabled:opacity-20 active:scale-95 transition-all"
            >
              Manifest Identity
            </button>
            <button onClick={() => setStep('vibe')} className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white transition-colors">Back</button>
          </div>
        </div>
      )}

      {step === 'preview' && preview && !isGenerating && (
        <div className="w-full max-w-sm space-y-12 animate-in zoom-in-95 duration-700">
           <header className="space-y-4">
              <h2 className="text-4xl font-serif italic text-white/90">Identity Manifested</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
           </header>

           <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[56px] space-y-8 relative overflow-hidden group">
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none blur-3xl" 
                style={{ backgroundColor: preview.color }} 
              />
              <div className="relative z-10 space-y-6">
                <div 
                  className="w-24 h-24 rounded-full mx-auto border-4 border-[#0A0A0A] shadow-2xl overflow-hidden"
                  style={{ backgroundColor: preview.color }}
                >
                  <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${preview.handle}`} alt="" className="w-full h-full opacity-60" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif italic text-white">{preview.name}</h3>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">{preview.handle}</p>
                </div>
                <p className="text-sm text-white/40 italic font-light leading-relaxed">"{preview.bio}"</p>
                <div className="pt-4">
                   <span className="text-[7px] border border-white/10 px-3 py-1 rounded-full text-white/30 uppercase tracking-[0.3em] font-black italic">{preview.tone} essence</span>
                </div>
              </div>
           </div>

           <div className="space-y-4">
              <button 
                onClick={() => onComplete(preview)}
                className="w-full py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] active:scale-95 transition-all"
              >
                Inhabit This Presence
              </button>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating}
                  className="py-4 border border-white/5 rounded-full text-[9px] uppercase tracking-widest text-white/40 hover:text-white transition-all"
                 >
                   Refine Resonance
                 </button>
                 <button 
                  onClick={() => setStep('vibe')}
                  className="py-4 border border-white/5 rounded-full text-[9px] uppercase tracking-widest text-white/40 hover:text-white transition-all"
                 >
                   New Vibe
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default IdentityCreator;
