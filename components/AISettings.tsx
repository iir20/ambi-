
import React from 'react';

interface AISettingsProps {
  intensity: number;
  setIntensity: (val: number) => void;
  textSize: number;
  setTextSize: (val: number) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AISettings: React.FC<AISettingsProps> = ({ 
  intensity, setIntensity, 
  textSize, setTextSize,
  highContrast, setHighContrast,
  isOpen, onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center px-4 pb-12 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-sm bg-[#1A1A1A] rounded-[40px] p-8 border border-white/[0.05] shadow-2xl slide-in-from-bottom-20 animate-in duration-700">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-serif italic text-white/90">Presence Settings</h3>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">
              <span>Feed Intensity</span>
              <span>{intensity}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-[1px] bg-white/10 appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">
              <span>Text Size</span>
              <span>{Math.round(12 + (textSize/100)*8)}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={textSize}
              onChange={(e) => setTextSize(parseInt(e.target.value))}
              className="w-full h-[1px] bg-white/10 appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white/80">High Contrast</h4>
              <p className="text-[8px] text-white/20 uppercase tracking-widest italic">Enhanced visibility</p>
            </div>
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`w-10 h-5 rounded-full relative transition-colors ${highContrast ? 'bg-white' : 'bg-white/5'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${highContrast ? 'right-1 bg-black' : 'left-1 bg-white/20'}`} />
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 border border-white/10 text-white/60 hover:text-white hover:border-white/30 rounded-2xl text-[9px] font-bold uppercase tracking-[0.4em] transition-all"
          >
            Adjust Presence
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
