
import React, { useState } from 'react';
import { MODE_CONFIGS } from '../constants';
import { SocialMode, FeedMode } from '../types';

interface FeedHeaderProps {
  mode: SocialMode;
  feedMode: FeedMode;
  setFeedMode: (m: FeedMode) => void;
  intensity: number;
  onOpenSettings: () => void;
  onRefresh: () => void;
  onEnterStillness: () => void; // New prop
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ 
  mode, feedMode, setFeedMode, intensity, onOpenSettings, onRefresh, onEnterStillness
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const config = MODE_CONFIGS[mode];

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-10 mb-12 animate-in fade-in duration-1000">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h1 className={`text-6xl font-serif italic tracking-tighter ${config.textColor} transition-colors duration-1000`}>
            {config.title}
          </h1>
          <div className="flex items-center space-x-4">
             <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black italic">
               Aperture: {intensity}%
             </p>
             <div className="w-[1px] h-3 bg-white/10" />
             <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black italic">
               Wave: {feedMode}
             </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
           <button 
             onClick={onEnterStillness}
             className="p-4 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
             title="Stillness Session"
           >
             <div className="w-4 h-4 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-white/40">
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse group-hover:bg-white/40" />
             </div>
           </button>
           <button 
             onClick={handleRefresh}
             className={`p-4 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group ${isRefreshing ? 'animate-pulse' : ''}`}
           >
             <svg className={`w-4 h-4 text-white/30 transition-transform duration-1000 ${isRefreshing ? 'rotate-[360deg]' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
             </svg>
           </button>
           <button 
             onClick={onOpenSettings}
             className="p-4 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
           >
             <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
           </button>
        </div>
      </div>

      <nav className="flex space-x-12 border-b border-white/[0.03] pb-4">
        {(['SIGNAL', 'DRIFT', 'CAPSULE'] as FeedMode[]).map((m) => (
          <button 
            key={m}
            onClick={() => setFeedMode(m)}
            className={`text-[9px] uppercase tracking-[0.6em] font-black transition-all ${feedMode === m ? 'text-white' : 'text-white/10 hover:text-white/30'}`}
          >
            {m}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default FeedHeader;
