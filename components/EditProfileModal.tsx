
import React, { useState, useRef } from 'react';
import { UserIdentity, AvatarType } from '../types';
import { generateIdentityFromVibe } from '../services/gemini';

interface EditProfileModalProps {
  identity: UserIdentity;
  onClose: () => void;
  onSave: (updated: Partial<UserIdentity>) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ identity, onClose, onSave }) => {
  const [name, setName] = useState(identity.name);
  const [bio, setBio] = useState(identity.bio);
  const [moodText, setMoodText] = useState(identity.mood?.text || '');
  const [moodEmoji, setMoodEmoji] = useState(identity.mood?.emoji || '');
  const [coverImage, setCoverImage] = useState(identity.coverImage || '');
  const [avatar, setAvatar] = useState(identity.avatar || '');
  const [avatarType, setAvatarType] = useState<AvatarType>(identity.avatarType || 'image');
  const [avatarConfig, setAvatarConfig] = useState(identity.avatarConfig || '');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({
      name,
      bio,
      coverImage,
      avatar,
      avatarType,
      avatarConfig,
      mood: {
        emoji: moodEmoji,
        text: moodText,
        color: identity.mood?.color || '#FFFFFF'
      }
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (target === 'cover') setCoverImage(event.target?.result as string);
        else {
          setAvatar(event.target?.result as string);
          setAvatarType('image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIAvatar = async () => {
    setIsGenerating(true);
    const result = await generateIdentityFromVibe(bio || "minimalist stillness");
    if (result) {
      setAvatarConfig(result.color);
      setAvatarType('ai');
      setAvatar(`https://api.dicebear.com/7.x/shapes/svg?seed=${result.handle}`);
    }
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-[56px] p-12 space-y-12 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
        <header className="flex justify-between items-center">
          <h2 className="text-3xl font-serif italic text-white/90">Sanctuary Refinement</h2>
          <button onClick={onClose} className="p-3 text-white/20 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </header>

        <div className="space-y-12">
          {/* Cover & Avatar Selection Layer */}
          <div className="relative">
            <label className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black mb-6 block text-center">Atmospheric Interface</label>
            <div 
              onClick={() => coverInputRef.current?.click()}
              className="h-40 w-full rounded-[40px] border border-white/5 bg-white/[0.02] overflow-hidden cursor-pointer group relative"
            >
              <img src={coverImage || 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80'} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-opacity" alt="" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[9px] uppercase tracking-[0.4em] font-black bg-black/60 px-6 py-3 rounded-full border border-white/10">Seal New Atmosphere</span>
              </div>
            </div>
            
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-4 border-[#0F0F0F] bg-[#111] overflow-hidden cursor-pointer group/avatar shadow-2xl z-20"
            >
              {avatarType === 'gradient' ? (
                <div className="w-full h-full" style={{ background: avatarConfig }} />
              ) : (
                <img src={avatar} className="w-full h-full object-cover grayscale transition-all group-hover/avatar:grayscale-0" alt="" />
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-4">
             {(['image', 'gradient', 'ai'] as AvatarType[]).map(t => (
               <button 
                key={t}
                onClick={() => {
                  if (t === 'ai') generateAIAvatar();
                  else if (t === 'gradient') { setAvatarType('gradient'); setAvatarConfig('linear-gradient(45deg, #FF9A9E, #FAD0C4)'); }
                  else setAvatarType('image');
                }}
                disabled={isGenerating && t === 'ai'}
                className={`text-[8px] uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${avatarType === t ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20'}`}
               >
                 {isGenerating && t === 'ai' ? 'Manifesting...' : t}
               </button>
             ))}
          </div>

          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
          <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />

          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black px-2">Sanctuary Anchor Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-5 text-base text-white/90 outline-none focus:border-white/40 transition-all font-light"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black px-2">Resonance Narrative</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-[32px] px-8 py-5 text-sm text-white/60 outline-none focus:border-white/40 transition-all h-32 resize-none italic font-light leading-relaxed"
                placeholder="Share your essence..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                 <label className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black px-2">Mood Sigil</label>
                 <input 
                   value={moodEmoji}
                   onChange={(e) => setMoodEmoji(e.target.value)}
                   placeholder="✨"
                   className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-center text-2xl outline-none"
                 />
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black px-2">Current Drift</label>
                 <input 
                   value={moodText}
                   onChange={(e) => setMoodText(e.target.value)}
                   placeholder="Floating..."
                   className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-[10px] uppercase tracking-widest text-white/60 outline-none text-center font-black"
                 />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-7 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[0.6em] hover:bg-white/90 transition-all active:scale-95 shadow-2xl shadow-white/5"
        >
          Anchor Changes
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;
