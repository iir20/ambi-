
import React from 'react';
import { Story } from '../types';

interface FeedStoryStripProps {
  traces: Story[];
  onOpenCreator: () => void;
  onViewTrace: (index: number) => void;
  onVisitProfile: (id: string) => void;
}

const FeedStoryStrip: React.FC<FeedStoryStripProps> = ({ traces, onOpenCreator, onViewTrace, onVisitProfile }) => {
  return (
    <div className="mb-16 space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black italic">Active Traces</h3>
        <button onClick={onOpenCreator} className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">+ New Signal</button>
      </div>
      <div className="flex space-x-6 overflow-x-auto no-scrollbar py-4 px-2">
        <button onClick={onOpenCreator} className="flex-shrink-0 w-28 aspect-[2/3] rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center space-y-3 group hover:border-white/20 transition-all">
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <span className="text-[8px] uppercase tracking-widest text-white/10 font-black">Anchor</span>
        </button>
        {traces.map((trace, i) => (
          <div key={trace.id} className="relative flex-shrink-0">
             <button 
                onClick={() => onViewTrace(i)} 
                className="w-28 aspect-[2/3] rounded-[24px] bg-white/[0.02] border border-white/5 overflow-hidden group transition-all relative block"
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: `radial-gradient(circle at center, ${trace.moodColor} 0%, transparent 70%)` }} />
                {trace.media ? (
                  <img src={trace.media} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="" />
                ) : (
                  <div className="w-full h-full p-4 flex items-center justify-center">
                    <p className="text-[10px] font-serif italic text-white/30 text-center leading-tight line-clamp-4">"{trace.content}"</p>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                   <div className="h-full bg-white/40" style={{ width: `${Math.max(0, (trace.duration * 3600000 - (Date.now() - trace.createdAt)) / (trace.duration * 3600000) * 100)}%`, backgroundColor: trace.moodColor }} />
                </div>
             </button>
             <button 
                onClick={() => onVisitProfile(trace.authorId)}
                className="absolute top-2 left-2 z-10 p-0.5 bg-[#0A0A0A] rounded-full border border-white/5 hover:scale-110 transition-transform"
             >
                <img src={trace.authorAvatar} className="w-6 h-6 rounded-full border border-white/10 object-cover" alt="" />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedStoryStrip;
