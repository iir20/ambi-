
import React, { useState, useEffect } from 'react';
import { Story } from '../types';

interface TraceViewerProps {
  traces: Story[];
  startIndex: number;
  onClose: () => void;
  onVisitProfile: (id: string) => void; // New prop for profile navigation
}

const TraceViewer: React.FC<TraceViewerProps> = ({ traces, startIndex, onClose, onVisitProfile }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentTrace = traces[currentIndex];

  const handleNext = () => {
    if (currentIndex < traces.length - 1) setCurrentIndex(currentIndex + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const timeLeft = Math.max(0, currentTrace.duration * 3600000 - (Date.now() - currentTrace.createdAt));
  const progress = (timeLeft / (currentTrace.duration * 3600000)) * 100;

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="absolute top-0 left-0 right-0 z-50 p-8 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={() => { onClose(); onVisitProfile(currentTrace.authorId); }}
          className="flex items-center space-x-4 group active:scale-95 transition-transform"
        >
          <img src={currentTrace.authorAvatar} className="w-10 h-10 rounded-full border border-white/20 grayscale group-hover:grayscale-0 transition-all" alt="" />
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-white">{currentTrace.authorName}</p>
            <p className="text-[8px] opacity-40 uppercase tracking-[0.2em] text-white/60">Fading in {Math.round(timeLeft / 3600000)}h</p>
          </div>
        </button>
        <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="w-full h-full relative group flex items-center justify-center">
        {/* Navigation Hotspots */}
        <div className="absolute inset-y-0 left-0 w-1/4 z-40 cursor-w-resize" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-1/4 z-40 cursor-e-resize" onClick={handleNext} />

        <div className="w-full h-full max-w-lg bg-[#0A0A0A] relative overflow-hidden flex flex-col justify-center">
          {currentTrace.media && (
            <img 
              src={currentTrace.media} 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 blur-3xl scale-110" 
              alt="" 
            />
          )}
          
          <div className="relative z-10 p-12 space-y-8 text-center">
            {currentTrace.media && (
              <div className="aspect-[3/4] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl mx-auto max-w-xs">
                <img src={currentTrace.media} className="w-full h-full object-cover grayscale" alt="Trace content" />
              </div>
            )}
            <p className="text-2xl font-serif italic text-white/80 leading-relaxed px-4">
              "{currentTrace.content}"
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 px-12 z-50 space-y-4">
        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/40 transition-all duration-1000" 
            style={{ width: `${progress}%`, backgroundColor: currentTrace.moodColor }}
          />
        </div>
        <p className="text-[8px] text-center uppercase tracking-[0.5em] text-white/10">Ephemeral Signal Trace</p>
      </div>
    </div>
  );
};

export default TraceViewer;
