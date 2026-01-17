
import React, { useState, useRef } from 'react';
import { Story, UserIdentity } from '../types';

interface TraceCreatorProps {
  onClose: () => void;
  onPost: (trace: Partial<Story>) => void;
  currentUser: UserIdentity;
}

const TraceCreator: React.FC<TraceCreatorProps> = ({ onClose, onPost, currentUser }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string | undefined>();
  const [duration, setDuration] = useState<1 | 6 | 12 | 24>(24);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    onPost({
      content,
      media,
      duration,
      isPrivate,
      type: media ? 'mixed' : 'text',
      moodColor: currentUser.mood?.color || '#FFFFFF'
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setMedia(event.target?.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
        alert("Failed to capture artifact.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#0A0A0A] flex flex-col items-center p-8 animate-in slide-in-from-bottom-20 duration-1000 overflow-y-auto no-scrollbar">
      <header className="w-full max-w-lg flex justify-between items-center mb-16 shrink-0">
        <button onClick={onClose} className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors">Discard</button>
        <h2 className="text-sm font-serif italic text-white/60">New Trace</h2>
        <button onClick={handlePost} disabled={!content.trim() || isUploading} className="text-[10px] uppercase tracking-[0.4em] text-white/90 disabled:opacity-10 transition-opacity">Cast</button>
      </header>

      <div className="w-full max-w-lg flex-1 flex flex-col space-y-12">
        <div className="relative group">
          <textarea 
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-3xl font-serif italic text-white/80 outline-none resize-none h-32 placeholder:text-white/5"
            placeholder="A fleeting thought..."
          />
          <div className="absolute -bottom-4 left-0 text-[8px] text-white/10 uppercase tracking-widest">{content.length}/140 chars</div>
        </div>

        <div className="space-y-6">
          {media ? (
            <div className="relative group/artifact animate-in zoom-in-95 duration-500">
               <div className="aspect-[4/5] w-full rounded-[40px] overflow-hidden border border-white/10 bg-white/[0.02]">
                  <img src={media} className="w-full h-full object-cover grayscale group-hover/artifact:grayscale-0 transition-all duration-700" alt="Artifact" />
               </div>
               <button 
                onClick={() => setMedia(undefined)}
                className="absolute top-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-full text-white opacity-0 group-hover/artifact:opacity-100 transition-opacity border border-white/10"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-12 bg-white/[0.02] border border-white/5 border-dashed rounded-[40px] hover:bg-white/[0.04] hover:border-white/20 transition-all flex flex-col items-center space-y-6 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black group-hover:text-white/40 transition-colors">
                {isUploading ? 'Capturing...' : 'Seal an Artifact'}
              </span>
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment"
            onChange={handleFileChange} 
          />
        </div>

        <div className="space-y-8 pt-12 border-t border-white/5 mb-12">
           <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-widest text-white/20 font-black">Decay Cycle</span>
              <div className="flex space-x-3">
                {[1, 6, 12, 24].map(h => (
                  <button 
                    key={h} 
                    onClick={() => setDuration(h as any)}
                    className={`text-[9px] w-12 h-12 rounded-full border flex items-center justify-center transition-all ${duration === h ? 'border-white/40 bg-white/5 text-white' : 'border-white/5 text-white/20'}`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
           </div>
           
           <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-widest text-white/20 font-black">Privacy Layer</span>
              <button 
                onClick={() => setIsPrivate(!isPrivate)}
                className={`text-[9px] uppercase tracking-widest border px-8 py-3 rounded-full transition-all ${isPrivate ? 'bg-white/10 text-white border-white/20' : 'text-white/20 border-white/5'}`}
              >
                {isPrivate ? 'Inner Circle Only' : 'Resonance (Public)'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TraceCreator;
