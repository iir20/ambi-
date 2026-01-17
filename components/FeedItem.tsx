
import React, { useState, useEffect, useRef } from 'react';
import { Post, UserSignal, Comment } from '../types';
import { getWaveHint } from '../services/ranking';
import { getAttentionLabel, calculateHoldRatio, validateSignal } from '../services/attention';
import { explainPostRelevance } from '../services/gemini';
import AttentionGlow from './AttentionGlow';

interface FeedItemProps {
  post: Post;
  intensity: number;
  signalStrength?: number;
  showTransparency?: boolean;
  onReact: (postId: string, emoji: string) => void;
  onComment: (postId: string, text: string) => void;
  onShare: (postId: string) => void;
  onVisitProfile: (handle: string) => void;
  onMessageUser: (handle: string) => void;
  onAttentionEvent: (postId: string, type: 'GLANCE' | 'HOLD' | 'RETURN') => void;
}

const FeedItem: React.FC<FeedItemProps> = ({ 
  post, intensity, signalStrength = 0, showTransparency = true, onReact, onComment, onShare, onVisitProfile, onMessageUser, onAttentionEvent
}) => {
  const [showDialogue, setShowDialogue] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<number | null>(null);
  const hasGlancedRef = useRef(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    if (showTransparency && !aiHint) {
      const logicReason = getWaveHint(post, signalStrength);
      explainPostRelevance(post.content, 'CONNECT', intensity, logicReason).then(setAiHint);
    }
  }, [showTransparency, post.content, intensity, signalStrength]);

  const startHoldTimer = () => {
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      const validation = validateSignal('HOLD', post.attention);
      if (validation.isValid) {
        onAttentionEvent(post.id, 'HOLD');
        setIsValidated(true);
        setTimeout(() => setIsValidated(false), 2000);
      }
    }, 3000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            if (!hasGlancedRef.current) {
              const validation = validateSignal('GLANCE', post.attention);
              if (validation.isValid) {
                onAttentionEvent(post.id, 'GLANCE');
                hasGlancedRef.current = true;
              }
            } else {
              const validation = validateSignal('RETURN', post.attention);
              if (validation.isValid) {
                onAttentionEvent(post.id, 'RETURN');
              }
            }
            startHoldTimer();
          } else {
            if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
          }
        });
      },
      { threshold: 0.7 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [post.id]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  const isHighResonance = signalStrength > 20 || post.authorId === 'me';
  const attentionLabel = getAttentionLabel(post.attention.resonanceScore, isHighResonance, post.attention);

  const energyStyles = {
    calm: 'border-white/5 bg-white/[0.01]',
    creative: 'border-[#E8D5C4]/10 bg-[#E8D5C4]/[0.02]',
    loud: 'border-white/20 bg-white/[0.03]',
    deep: 'border-[#D4C4E8]/20 bg-[#D4C4E8]/[0.02]'
  };

  return (
    <div 
      ref={containerRef}
      className={`border rounded-[48px] p-10 mb-16 transition-all duration-[2000ms] group relative overflow-hidden ${energyStyles[post.energyLevel]} ${isValidated ? 'ring-1 ring-white/20' : ''}`}
    >
      <AttentionGlow score={post.attention.resonanceScore} color={isHighResonance ? '#FFFFFF' : '#444444'} />

      <div className="absolute top-8 right-10 flex items-center space-x-3 z-10">
         <div className="flex flex-col items-end text-right">
           <span className="text-[7px] uppercase tracking-[0.4em] font-black text-white/30">{attentionLabel}</span>
           {showTransparency && <span className="text-[6px] uppercase tracking-[0.2em] font-black text-white/10 italic">{aiHint || "synchronizing..."}</span>}
         </div>
         <div className={`w-1 h-1 rounded-full ${isHighResonance ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => onVisitProfile(post.authorId)}
            className="flex items-center space-x-4 text-left group/author"
          >
            <div className="relative">
               <img 
                 src={post.authorAvatar} 
                 className={`w-12 h-12 rounded-full border border-white/10 grayscale transition-all duration-1000 object-cover ${signalStrength < 10 && post.authorId !== 'me' ? 'blur-sm opacity-30' : 'opacity-60 group-hover/author:opacity-100 group-hover/author:grayscale-0'}`} 
                 alt={post.authorName} 
               />
               {(isHighResonance || post.authorId === 'me') && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white/80 rounded-full border-2 border-black" />}
            </div>
            <div>
              <h4 className={`text-[14px] font-bold tracking-wide uppercase group-hover/author:text-white transition-colors ${signalStrength < 10 && post.authorId !== 'me' ? 'text-white/10' : 'text-white/80'}`}>
                {signalStrength < 10 && post.authorId !== 'me' ? 'Shrouded Presence' : post.authorName}
              </h4>
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">{post.timestamp}</p>
            </div>
          </button>
        </div>
      </div>

      <p className="text-xl leading-[1.6] text-white/80 font-serif italic mb-10 relative z-10 selection:bg-white/10">
        {post.content}
      </p>

      {post.media && (
        <div className="mb-10 rounded-[40px] overflow-hidden border border-white/5 relative aspect-square max-h-[400px] z-10">
          <img src={post.media} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[3000ms]" alt="post visual" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="flex items-center justify-between pt-8 border-t border-white/[0.03] relative z-10">
        <div className="flex space-x-8">
          {/* Fix: Explicitly cast Object.entries results to ensure count is treated as a number */}
          {(Object.entries(post.reactions) as [string, number][]).map(([emoji, count]) => (
            <button 
              key={emoji} 
              onClick={() => onReact(post.id, emoji)}
              className={`flex items-center space-x-3 transition-all duration-700 ${post.userReactions[emoji] ? 'opacity-100 scale-110' : 'opacity-20 hover:opacity-100'}`}
            >
              <span className="text-xl">{emoji}</span>
              {count > 0 && <span className="text-[11px] text-white/60 font-black tracking-widest">{count}</span>}
            </button>
          ))}
          
          <button 
            onClick={() => setShowDialogue(!showDialogue)}
            className={`flex items-center space-x-3 transition-all duration-700 ${showDialogue ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`}
          >
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
             <span className="text-[11px] text-white/60 font-black tracking-widest">{post.comments.length}</span>
          </button>
        </div>

        <button 
             onClick={() => onShare(post.id)}
             className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 hover:text-white/60 transition-all flex items-center space-x-2"
           >
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
             <span>Capture</span>
        </button>
      </div>

      {/* Dialogue Layer */}
      {showDialogue && (
        <div className="mt-10 pt-10 border-t border-white/[0.03] space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 relative z-10">
          <div className="space-y-6">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex space-x-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-white/10 mt-2 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{comment.authorName}</p>
                    <p className="text-[14px] text-white/60 font-serif italic leading-relaxed">"{comment.content}"</p>
                 </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-[10px] uppercase tracking-widest text-white/10 italic text-center py-4">The dialogue is silent.</p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-4 bg-white/[0.02] border border-white/5 rounded-3xl p-2 pl-6 group focus-within:border-white/20 transition-all">
             <input 
               value={commentText}
               onChange={(e) => setCommentText(e.target.value)}
               placeholder="Whisper a response..."
               className="flex-1 bg-transparent py-3 text-xs outline-none text-white/60 placeholder:text-white/10 italic font-light"
             />
             <button type="submit" disabled={!commentText.trim()} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white disabled:opacity-0 transition-all">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
             </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedItem;
