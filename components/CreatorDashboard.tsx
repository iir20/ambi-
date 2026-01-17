
import React, { useEffect, useState } from 'react';
import { Post, CreatorAnalytics, PresenceInsight } from '../types';
import { generateAggregatedAnalytics, getApertureInsights, getStillnessPrompts } from '../services/analytics';

interface CreatorDashboardProps {
  userPosts: Post[];
  onClose: () => void;
  aiPrivacy: 'redacted' | 'full';
  aiEnabled: boolean;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ userPosts, onClose, aiPrivacy, aiEnabled }) => {
  const [analytics, setAnalytics] = useState<Partial<CreatorAnalytics> | null>(null);
  const [insights, setInsights] = useState<PresenceInsight[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseData = generateAggregatedAnalytics(userPosts);
    setAnalytics(baseData);
    
    const loadAI = async () => {
      if (aiEnabled && userPosts.length > 0) {
        try {
          const [resInsights, resPrompts] = await Promise.all([
            getApertureInsights(userPosts, aiPrivacy),
            getStillnessPrompts(userPosts)
          ]);
          setInsights(resInsights);
          setPrompts(resPrompts);
        } catch (e) {
          console.error("AI Insights Error", e);
        }
      } else {
        setInsights([{ id: 'off', title: 'Oracle Asleep', message: 'Enable AI in settings for deep resonance insights.', type: 'resonance', intensity: 'soft' }]);
        setPrompts(["observe the silence.", "presence is enough."]);
      }
      setLoading(false);
    };

    loadAI();
  }, [userPosts, aiEnabled, aiPrivacy]);

  const fatigue = analytics?.fatigueIndex || 0;

  // SVG Wave Path Generator
  const generateWavePath = () => {
    if (!analytics?.dailyPulse || analytics.dailyPulse.length < 2) return "";
    const points = analytics.dailyPulse;
    const width = 400;
    const height = 100;
    const step = width / (points.length - 1);
    
    return points.reduce((path, p, i) => {
      const x = i * step;
      const y = height - (Math.min(100, (p.intensity / 200) * 100));
      return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, "");
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#0A0A0A] flex flex-col p-8 overflow-y-auto no-scrollbar animate-in fade-in duration-1000">
      <header className="flex justify-between items-center mb-16 shrink-0">
        <button onClick={onClose} className="p-4 bg-white/[0.03] rounded-full text-white/30 hover:text-white transition-all active:scale-90">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="text-center">
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-white/80 italic">Resonance Lab</h2>
          <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 mt-1">Private Presence Analytics</p>
        </div>
        <div className="w-12" />
      </header>

      <div className="max-w-xl mx-auto w-full space-y-20 pb-32">
        {/* Fatigue Warning Layer */}
        {fatigue > 60 && (
          <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[60px] space-y-4 animate-in zoom-in-95 duration-1000">
             <div className="flex justify-center mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
             </div>
             <h3 className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-black text-center">Signal Fatigue Detected</h3>
             <p className="text-sm font-serif italic text-white/30 text-center leading-relaxed">
               Your presence is currently drifting into shallow frequencies. Consider a period of total stillness to recover signal density.
             </p>
          </div>
        )}

        {/* The Wave Visualization */}
        <section className="space-y-8">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-black">Resonance Pulse</h3>
            <span className="text-[8px] text-white/10 uppercase tracking-widest">{analytics?.peakMoments?.[0]}</span>
          </div>
          <div className="relative h-48 bg-white/[0.01] border border-white/[0.03] rounded-[48px] overflow-hidden flex items-center justify-center p-8">
             {userPosts.length > 1 ? (
               <svg viewBox="0 0 400 100" className="w-full h-full opacity-40">
                 <path 
                   d={generateWavePath()} 
                   fill="none" 
                   stroke="white" 
                   strokeWidth="0.5" 
                   strokeDasharray="4 4"
                   className="animate-pulse"
                 />
                 {analytics?.dailyPulse?.map((p, i) => (
                   <circle 
                    key={i} 
                    cx={(i * (400 / (analytics.dailyPulse!.length - 1)))} 
                    cy={100 - (Math.min(100, (p.intensity / 200) * 100))} 
                    r="1.5" 
                    fill="white" 
                    className="opacity-20"
                   />
                 ))}
               </svg>
             ) : (
               <p className="text-[10px] uppercase tracking-[0.4em] text-white/10 italic">Awaiting more signal data...</p>
             )}
             <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-[#0A0A0A] pointer-events-none" />
          </div>
        </section>

        {/* Reflection Prompts Layer */}
        <section className="space-y-10">
           <div className="text-center space-y-1">
              <h3 className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-black">Stillness Reflections</h3>
              <p className="text-[8px] text-white/10 uppercase tracking-widest">AI Guided Contemplation</p>
           </div>
           <div className="grid gap-4">
              {prompts.map((p, i) => (
                <div key={i} className="p-8 bg-white/[0.01] border border-white/[0.02] rounded-[40px] hover:border-white/5 transition-all group">
                   <p className="text-base font-serif italic text-white/30 group-hover:text-white/60 transition-colors text-center">"{p}"</p>
                </div>
              ))}
           </div>
        </section>

        {/* Hardened Aperture Insights */}
        <section className="space-y-8">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-black">The Oracle's Aperture</h3>
            <div className="flex space-x-1">
               {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/10" />)}
            </div>
          </div>
          <div className="grid gap-6">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-32 bg-white/[0.01] border border-white/[0.03] rounded-[48px] animate-pulse" />)
            ) : (
              insights.map(insight => (
                <div key={insight.id} className="p-10 bg-white/[0.01] border border-white/[0.03] rounded-[56px] space-y-4 hover:bg-white/[0.02] transition-all">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] uppercase tracking-[0.5em] font-black px-4 py-1 rounded-full border border-white/5 ${insight.intensity === 'deep' ? 'bg-white/5 text-white' : 'text-white/20'}`}>
                      {insight.type}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${insight.intensity === 'deep' ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white/10'}`} />
                  </div>
                  <h5 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/80">{insight.title}</h5>
                  <p className="text-[14px] text-white/30 leading-relaxed font-light italic">"{insight.message}"</p>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="pt-20 text-center space-y-4">
           <div className="w-[1px] h-12 bg-white/5 mx-auto" />
           <p className="text-[7px] uppercase tracking-[1em] text-white/5">Verification: Stillverse Analytics Protocol v4.2</p>
        </footer>
      </div>
    </div>
  );
};

export default CreatorDashboard;
