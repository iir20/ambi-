
import React, { useState } from 'react';
import { UserProfileData, UserIdentity, Post, PersonalNote, TimeCapsule, UserSignal, Story, DriftState } from '../types';
import LifetimeResonance from './LifetimeResonance';
import EditProfileModal from './EditProfileModal';

interface ProfileProps {
  user: UserProfileData;
  currentUserSignal?: UserSignal;
  isOwnProfile: boolean;
  onUpdateIdentity?: (updated: Partial<UserIdentity>) => void;
  onAddNote?: (text: string) => void;
  onDeleteNote?: (id: string) => void;
  onBack?: () => void;
  onMessage?: (userId: string) => void;
  onOpenSettings?: () => void;
  userPosts: Post[];
  userTraces?: Story[];
  onOpenCapsuleCreator?: () => void;
}

const DRIFT_STATE_CONFIG: Record<DriftState, { label: string; color: string; description: string }> = {
  'anchoring': { label: 'Anchoring in Silence', color: '#E8D5C4', description: 'Intentional stillness, limited signal emission.' },
  'surface drifting': { label: 'Surface Drifting', color: '#FFFFFF', description: 'Observing the collective without heavy intent.' },
  'deeply rooted': { label: 'Deeply Rooted', color: '#C4E8D5', description: 'Core resonance with the surrounding sanctuary.' },
  'shrouded': { label: 'Shrouded Frequency', color: '#444444', description: 'Veiled presence, high-privacy drift.' },
  'resonating': { label: 'Resonating with the Collective', color: '#D4C4E8', description: 'Active frequency sync with mutual signals.' }
};

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  currentUserSignal,
  isOwnProfile, 
  onUpdateIdentity, 
  onAddNote,
  onDeleteNote,
  onBack,
  onMessage,
  onOpenSettings,
  userPosts,
  userTraces = [],
  onOpenCapsuleCreator
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'artifacts' | 'traces' | 'vault' | 'archives' | 'resonance'>('artifacts');

  const signalStrength = isOwnProfile ? 100 : (currentUserSignal?.strength || 0);

  // Visibility Thresholds
  const isGhost = !isOwnProfile && signalStrength <= 10;
  const isEcho = !isOwnProfile && signalStrength > 10 && signalStrength <= 25;
  const isSynced = isOwnProfile || signalStrength > 25;

  const driftConfig = DRIFT_STATE_CONFIG[user.identity.driftState || 'surface drifting'];

  const renderAvatar = () => {
    if (user.identity.avatarType === 'gradient') {
      return (
        <div 
          className="w-full h-full" 
          style={{ background: user.identity.avatarConfig || 'linear-gradient(45deg, #111, #333)' }} 
        />
      );
    }
    return (
      <img 
        src={user.identity.avatar} 
        className={`w-full h-full object-cover grayscale transition-all duration-1000 ${isGhost ? 'opacity-0' : 'opacity-90 hover:grayscale-0 hover:opacity-100'}`} 
        alt="" 
      />
    );
  };

  const tabs = (['artifacts', 'traces', 'vault', 'archives', 'resonance'] as const).filter(t => {
    if (!isOwnProfile && (t === 'resonance' || t === 'vault')) return false;
    return true;
  });

  // Calculate abstracted stats for details section
  const totalResonance = userPosts.reduce((acc, p) => acc + (p.attention.resonanceScore || 0), 0);
  const signalDensity = userPosts.length > 0 ? (totalResonance / userPosts.length).toFixed(1) : "0.0";

  return (
    <div className="animate-in fade-in duration-1000 pb-48 overflow-x-hidden scroll-smooth bg-[#0A0A0A] min-h-screen">
      <div className="relative h-[45vh] w-full group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/40 to-[#0A0A0A] z-10" />
        <img 
          src={user.identity.coverImage || 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80'} 
          className={`w-full h-full object-cover grayscale transition-all duration-1000 ${isGhost ? 'blur-3xl opacity-5 scale-110' : 'opacity-40'}`} 
          alt="" 
        />
        
        <div className="absolute top-12 left-0 right-0 px-8 z-20 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 text-white/40 hover:text-white transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          <div className="flex items-center space-x-3">
            {isOwnProfile ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-[10px] uppercase tracking-[0.4em] font-black text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  Edit Sanctuary
                </button>
                <button 
                  onClick={onOpenSettings}
                  className="p-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-white/40 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </button>
              </>
            ) : (
              <button 
                onClick={() => onMessage?.(user.id)}
                className="px-8 py-2.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-[10px] uppercase tracking-[0.4em] font-black text-white hover:bg-white/20 transition-all"
              >
                Send Signal
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 -mt-36 relative z-20 space-y-16">
        <div className="flex flex-col items-center text-center space-y-8">
           <div className="relative group">
              {/* Drift State Aura */}
              <div 
                className="absolute inset-0 rounded-full blur-[40px] opacity-20 animate-pulse transition-colors duration-1000"
                style={{ backgroundColor: driftConfig.color }}
              />
              <div className={`w-44 h-44 rounded-full border-4 border-[#0A0A0A] bg-[#111] overflow-hidden shadow-2xl relative transition-all duration-1000 ${isGhost ? 'blur-2xl scale-75 opacity-20' : 'active:scale-95'}`}>
                {renderAvatar()}
              </div>
              {!isGhost && user.identity.mood && (
                <div className="absolute -bottom-2 -right-2 flex items-center bg-[#111]/80 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl animate-in zoom-in-50 duration-700">
                  <span className="text-lg mr-3">{user.identity.mood.emoji}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/70 font-black italic">
                    {user.identity.mood.text}
                  </span>
                </div>
              )}
           </div>

           <div className="space-y-4">
             <div className="space-y-1">
               <h2 className={`text-6xl font-serif italic tracking-tighter transition-all duration-1000 ${isGhost ? 'text-white/5 blur-sm' : 'text-white/90'}`}>
                 {isGhost ? 'Veiled Frequency' : user.identity.name}
               </h2>
               <p className="text-[11px] uppercase tracking-[0.8em] text-white/10 font-black">
                 {isGhost ? '@shrouded_origin' : user.identity.handle}
               </p>
             </div>
             {!isGhost && (
               <div className="flex items-center justify-center space-x-3 opacity-30">
                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: driftConfig.color }} />
                 <span className="text-[8px] uppercase tracking-[0.4em] font-black italic">{driftConfig.label}</span>
               </div>
             )}
           </div>

           <p className={`max-w-sm text-[16px] leading-relaxed italic font-light transition-all duration-1000 ${isGhost ? 'text-white/0 blur-xl select-none' : isEcho ? 'text-white/10 blur-[0.5px]' : 'text-white/50'}`}>
             "{isGhost ? 'A presence awaiting synchronization.' : user.identity.bio}"
           </p>
        </div>

        {/* Presence Details Enrichment Layer */}
        {!isGhost && (
          <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-[40px] overflow-hidden animate-in fade-in duration-1000">
             <div className="bg-[#0A0A0A] p-8 space-y-2">
                <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">Signal Density</p>
                <div className="flex items-end space-x-2">
                   <p className="text-3xl font-serif italic text-white/80">{signalDensity}</p>
                   <p className="text-[7px] text-white/10 uppercase mb-2 tracking-widest">hz/artifact</p>
                </div>
             </div>
             <div className="bg-[#0A0A0A] p-8 space-y-2">
                <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">Current Era</p>
                <p className="text-xl font-serif italic text-white/80 leading-none">{user.lifetimeAttention.presenceEra}</p>
                <p className="text-[7px] text-white/20 uppercase tracking-[0.2em] font-black italic">est. {new Date(user.lifetimeAttention.totalAttentionTime).getFullYear() || '2025'}</p>
             </div>
             <div className="col-span-2 bg-[#0A0A0A] p-8 border-t border-white/5">
                <div className="flex justify-between items-center mb-4">
                   <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">Frequency Context</p>
                   <div className="flex space-x-1">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/10" />)}
                   </div>
                </div>
                <p className="text-xs text-white/30 italic font-light leading-relaxed">
                  {driftConfig.description} manifested as a <span className="text-white/60 font-black uppercase tracking-widest">{user.identity.tone}</span> essence. 
                  this sanctuary contains <span className="text-white/60">{userPosts.length} artifacts</span> preserved from the drift.
                </p>
             </div>
          </div>
        )}

        <div className="space-y-12">
            <nav className="flex items-center space-x-12 border-b border-white/[0.03] px-4 overflow-x-auto no-scrollbar pb-1">
                {tabs.map(tab => {
                  const label = tab.charAt(0).toUpperCase() + tab.slice(1);
                  return (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)} 
                      className={`text-[10px] uppercase tracking-[0.4em] font-black pb-5 transition-all whitespace-nowrap ${activeTab === tab ? 'text-white border-b-2 border-white/40' : 'text-white/20 hover:text-white/40'}`}
                    >
                      {label}
                    </button>
                  );
                })}
            </nav>

            <div className="px-2 min-h-[400px]">
                {activeTab === 'artifacts' && (
                  <div className={`grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isGhost ? 'blur-3xl opacity-5 pointer-events-none' : isEcho ? 'blur-md opacity-20' : ''}`}>
                    {userPosts.length > 0 ? (
                      userPosts.map(post => (
                        <div key={post.id} className="relative aspect-[4/5] rounded-[36px] overflow-hidden border border-white/5 bg-white/[0.01] group/item transition-all hover:border-white/10">
                          {post.media ? (
                             <img src={post.media} className="w-full h-full object-cover grayscale opacity-60 group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all duration-[2000ms]" alt="" />
                          ) : (
                             <div className="w-full h-full p-8 flex items-center justify-center text-center">
                               <p className="text-[12px] font-serif italic text-white/40 group-hover/item:text-white/80 transition-colors line-clamp-6 leading-relaxed">"{post.content}"</p>
                             </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-40 text-center opacity-10">
                        <p className="text-xl font-serif italic uppercase tracking-[0.3em]">Total Stillness</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'traces' && (
                  <div className={`grid grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isGhost ? 'blur-3xl opacity-5' : !isSynced ? 'blur-xl opacity-10' : ''}`}>
                    {userTraces.length > 0 ? (
                      userTraces.map(trace => (
                        <div key={trace.id} className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] group/trace">
                          {trace.media ? (
                            <img src={trace.media} className="w-full h-full object-cover grayscale opacity-40 group-hover/trace:grayscale-0 transition-all" alt="" />
                          ) : (
                            <div className="w-full h-full p-4 flex items-center justify-center">
                              <div className="w-1 h-1 bg-white/10 rounded-full" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 py-40 text-center opacity-10">
                        <p className="text-sm font-serif italic uppercase tracking-[0.4em]">Traces Faded</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'vault' && isOwnProfile && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-6">
                      <div className="p-8 bg-white/[0.02] border border-white/10 border-dashed rounded-[40px] text-center space-y-4 group cursor-pointer hover:bg-white/[0.04] transition-all" onClick={() => onOpenCapsuleCreator?.()}>
                          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 group-hover:text-white/60 transition-colors">+ Seal Personal Note</span>
                      </div>
                      {user.notes.length > 0 ? (
                        user.notes.map(note => (
                          <div key={note.id} className="p-10 bg-white/[0.01] border border-white/[0.03] rounded-[44px] group relative">
                            <p className="text-[15px] leading-relaxed text-white/60 font-light italic">"{note.text}"</p>
                            <button onClick={() => onDeleteNote?.(note.id)} className="absolute top-8 right-8 p-3 text-white/0 group-hover:text-white/20 hover:text-red-500/40 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                          </div>
                        ))
                      ) : (
                        <div className="py-40 text-center opacity-10"><p className="text-xl font-serif italic uppercase tracking-[0.4em]">Silent Vault</p></div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'archives' && (
                  <div className={`animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 ${isGhost ? 'blur-3xl opacity-5' : ''}`}>
                    <div className="grid gap-8">
                      {user.capsules.length > 0 ? (
                        user.capsules.map(capsule => (
                          <div key={capsule.id} className="p-10 bg-white/[0.01] border border-white/[0.03] rounded-[48px] space-y-6">
                            <div className="flex justify-between items-center">
                               <span className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-black">{capsule.type}</span>
                               <span className="text-[8px] text-white/10 uppercase tracking-widest">{new Date(capsule.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[16px] italic text-white/60 font-light leading-relaxed">
                              {capsule.unlockAt > Date.now() ? 'Sealed until a future moment...' : `"${capsule.content}"`}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-40 text-center opacity-10"><p className="text-xl font-serif italic uppercase tracking-[0.4em]">Empty Archives</p></div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'resonance' && isOwnProfile && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <LifetimeResonance stats={user.lifetimeAttention} />
                  </div>
                )}
            </div>
        </div>
      </div>

      {isEditing && (
        <EditProfileModal 
          identity={user.identity} 
          onClose={() => setIsEditing(false)} 
          onSave={(updated) => { onUpdateIdentity?.(updated); setIsEditing(false); }} 
        />
      )}
    </div>
  );
};

export default Profile;
