
import React, { useState, useRef } from 'react';
import { TimeCapsule, CapsuleType, UserIdentity } from '../types';
import { OTHER_USERS } from '../constants';

interface CapsuleCreatorProps {
  onClose: () => void;
  onPost: (capsule: Partial<TimeCapsule>) => void;
  currentUser: UserIdentity;
}

const CapsuleCreator: React.FC<CapsuleCreatorProps> = ({ onClose, onPost, currentUser }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string | undefined>();
  const [type, setType] = useState<CapsuleType>('memory');
  const [privacy, setPrivacy] = useState<TimeCapsule['privacy']>('private');
  const [unlockDate, setUnlockDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedContributors, setSelectedContributors] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const availableUsers = Object.values(OTHER_USERS).map(u => u.identity);

  const handlePost = () => {
    if (!unlockDate) {
      alert("Please select a time of revelation.");
      return;
    }
    const unlockAt = new Date(unlockDate).getTime();
    if (unlockAt <= Date.now()) {
      alert("Temporal anchors must be set in the future.");
      return;
    }

    onPost({
      content,
      media,
      type,
      privacy,
      unlockAt,
      createdAt: Date.now(),
      contributorIds: type === 'collective' ? selectedContributors : undefined
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
      reader.readAsDataURL(file);
    }
  };

  const toggleContributor = (id: string) => {
    setSelectedContributors(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#0A0A0A] flex flex-col items-center p-8 animate-in slide-in-from-bottom-20 duration-1000 overflow-y-auto no-scrollbar">
      <header className="w-full max-w-lg flex justify-between items-center mb-16 shrink-0">
        <button onClick={onClose} className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors">Abort</button>
        <h2 className="text-sm font-serif italic text-white/60">Temporal Anchor</h2>
        <button onClick={handlePost} disabled={!content.trim() || isUploading} className="text-[10px] uppercase tracking-[0.4em] text-white/90 disabled:opacity-10 transition-opacity">Seal</button>
      </header>

      <div className="w-full max-w-lg flex-1 flex flex-col space-y-12 pb-20">
        <div className="space-y-6">
          <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">Anchor Type</label>
          <div className="flex flex-wrap gap-3">
            {(['memory', 'goal', 'letter', 'collective'] as CapsuleType[]).map(t => (
              <button 
                key={t}
                onClick={() => setType(t)}
                className={`px-6 py-2 rounded-full border text-[10px] uppercase tracking-widest transition-all ${type === t ? 'border-white/40 bg-white/5 text-white' : 'border-white/5 text-white/20'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {type === 'collective' && (
          <div className="space-y-6 animate-in fade-in duration-700">
            <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">Invite Contributors</label>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
               {availableUsers.map(user => (
                 <button 
                  key={user.id} 
                  onClick={() => toggleContributor(user.id)}
                  className={`flex-shrink-0 w-16 h-16 rounded-full border-2 transition-all p-1 ${selectedContributors.includes(user.id) ? 'border-white animate-pulse' : 'border-white/5 grayscale'}`}
                 >
                   <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                 </button>
               ))}
            </div>
          </div>
        )}

        <div className="relative group">
          <textarea 
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-2xl font-serif italic text-white/80 outline-none resize-none h-40 placeholder:text-white/5"
            placeholder={type === 'goal' ? "What do you want to achieve?" : type === 'letter' ? "Dear future me..." : type === 'collective' ? "A shared intention..." : "A moment to preserve..."}
          />
        </div>

        <div className="space-y-6">
          <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">Visual Seal</label>
          {media ? (
            <div className="relative group/artifact">
               <div className="aspect-video w-full rounded-[32px] overflow-hidden border border-white/10 bg-white/[0.02]">
                  <img src={media} className="w-full h-full object-cover grayscale opacity-50 blur-[2px] group-hover/artifact:blur-0 group-hover/artifact:grayscale-0 transition-all duration-1000" alt="Artifact" />
               </div>
               <button onClick={() => setMedia(undefined)} className="absolute top-4 right-4 p-3 bg-black/60 rounded-full border border-white/10">×</button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 bg-white/[0.02] border border-white/5 border-dashed rounded-[32px] hover:bg-white/[0.04] transition-all flex flex-col items-center space-y-4"
            >
              <svg className="w-5 h-5 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
              <span className="text-[9px] uppercase tracking-widest text-white/20">Seal a visual memory</span>
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="space-y-8 pt-12 border-t border-white/5">
           <div className="flex flex-col space-y-4">
              <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">Revelation Moment</span>
              <input 
                type="datetime-local" 
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white/60 outline-none focus:border-white/20 transition-all"
              />
           </div>
           
           <div className="flex justify-between items-center">
              <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">Aperture</span>
              <div className="flex space-x-2">
                {(['private', 'friends', 'public'] as const).map(p => (
                  <button 
                    key={p}
                    onClick={() => setPrivacy(p)}
                    className={`text-[9px] uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${privacy === p ? 'border-white/40 bg-white/5 text-white' : 'border-white/5 text-white/10'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CapsuleCreator;
