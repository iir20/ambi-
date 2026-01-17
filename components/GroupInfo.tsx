
import React, { useState } from 'react';
import { Conversation, UserIdentity } from '../types';
import { OTHER_USERS } from '../constants';

interface GroupInfoProps {
  conversation: Conversation;
  currentUserId: string;
  onClose: () => void;
  onUpdate: (updates: Partial<Conversation>) => void;
  onLeave: () => void;
  onDissolve?: () => void;
  onVisitProfile: (handle: string) => void;
  onInviteClick: () => void; // New prop for triggering invitation
}

const GroupInfo: React.FC<GroupInfoProps> = ({ 
  conversation, currentUserId, onClose, onUpdate, onLeave, onDissolve, onVisitProfile, onInviteClick 
}) => {
  const isAdmin = conversation.adminIds?.includes(currentUserId);
  const isMod = conversation.moderatorIds?.includes(currentUserId);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(conversation.groupName || '');

  const handleSaveName = () => {
    onUpdate({ groupName: tempName });
    setIsEditing(false);
  };

  const removeMember = (userId: string) => {
    if (!isAdmin) return;
    const nextParticipants = conversation.participants.filter(p => p.id !== userId);
    onUpdate({ participants: nextParticipants });
  };

  const toggleModerator = (userId: string) => {
    if (!isAdmin) return;
    const isCurrentlyMod = conversation.moderatorIds?.includes(userId);
    const nextMods = isCurrentlyMod 
      ? conversation.moderatorIds?.filter(id => id !== userId) || []
      : [...(conversation.moderatorIds || []), userId];
    onUpdate({ moderatorIds: nextMods });
  };

  return (
    <div className="fixed inset-0 z-[400] bg-[#0A0A0A] flex flex-col items-center animate-in fade-in duration-700 overflow-y-auto no-scrollbar">
      <header className="w-full max-w-lg flex justify-between items-center p-8 shrink-0">
        <button onClick={onClose} className="p-4 bg-white/[0.03] rounded-full text-white/30 hover:text-white transition-all">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h2 className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-black">Circle Aperture</h2>
        <div className="w-12" />
      </header>

      <div className="w-full max-w-lg px-8 pb-32 space-y-16">
        <div className="flex flex-col items-center space-y-8">
           <div className="w-40 h-40 rounded-full border border-white/5 bg-white/[0.01] overflow-hidden relative shadow-2xl">
              <img src={conversation.groupAvatar || 'https://via.placeholder.com/400'} className="w-full h-full object-cover grayscale opacity-80" alt="" />
           </div>
           <div className="text-center space-y-2">
              {isEditing && isAdmin ? (
                <div className="flex flex-col items-center space-y-4">
                  <input 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-transparent text-3xl font-serif italic text-white/90 border-b border-white/20 outline-none text-center"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white">Apply Signature</button>
                </div>
              ) : (
                <h3 className="text-4xl font-serif italic text-white/90 flex items-center justify-center space-x-3">
                   <span>{conversation.groupName}</span>
                   {isAdmin && (
                     <button onClick={() => setIsEditing(true)} className="p-2 opacity-20 hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     </button>
                   )}
                </h3>
              )}
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">Collective of {conversation.participants.length}</p>
           </div>
        </div>

        <div className="space-y-8">
           <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-black">Presence Log</label>
              {isAdmin && (
                <button 
                  onClick={onInviteClick} 
                  className="text-[9px] text-white/40 hover:text-white transition-colors"
                >
                  + Extend Invitations
                </button>
              )}
           </div>
           <div className="space-y-4">
              {conversation.participants.map(member => {
                const isMemberAdmin = conversation.adminIds?.includes(member.id);
                const isMemberMod = conversation.moderatorIds?.includes(member.id);
                return (
                  <div key={member.id} className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/[0.03] rounded-[32px] group hover:bg-white/[0.02] transition-all">
                     <button 
                       onClick={() => onVisitProfile(member.handle)}
                       className="flex items-center space-x-5 text-left flex-1"
                     >
                        <img src={member.avatar} className="w-12 h-12 rounded-full border border-white/5 grayscale" alt="" />
                        <div>
                           <div className="flex items-center space-x-3">
                              <p className="text-[14px] font-bold text-white/80">{member.name}</p>
                              {isMemberAdmin && <span className="text-[7px] border border-white/20 text-white/40 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Anchor</span>}
                              {isMemberMod && <span className="text-[7px] border border-white/10 text-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Watcher</span>}
                           </div>
                           <p className="text-[9px] text-white/20 uppercase tracking-widest">{member.handle}</p>
                        </div>
                     </button>
                     
                     {isAdmin && member.id !== currentUserId && (
                       <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => toggleModerator(member.id)}
                            className={`p-3 rounded-full border transition-all ${isMemberMod ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20 hover:text-white'}`}
                            title={isMemberMod ? 'Demote' : 'Promote to Mod'}
                          >
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          </button>
                          <button 
                            onClick={() => removeMember(member.id)}
                            className="p-3 rounded-full border border-white/5 text-red-500/20 hover:text-red-500 transition-all"
                            title="Sever Link"
                          >
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                       </div>
                     )}
                  </div>
                );
              })}
           </div>
        </div>

        {isAdmin && (
          <div className="space-y-8 pt-8 border-t border-white/5">
             <label className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-black">Aperture Settings</label>
             <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/[0.05] rounded-[32px]">
                   <div className="space-y-1">
                      <p className="text-xs font-bold text-white/80">Restricted Signal</p>
                      <p className="text-[9px] text-white/20 italic">Only Anchors can broadcast</p>
                   </div>
                   <button 
                     onClick={() => onUpdate({ restrictedMessaging: !conversation.restrictedMessaging })}
                     className={`w-10 h-5 rounded-full relative p-1 transition-all ${conversation.restrictedMessaging ? 'bg-white' : 'bg-white/5'}`}
                   >
                      <div className={`w-3 h-3 rounded-full transition-all ${conversation.restrictedMessaging ? 'translate-x-5 bg-black' : 'bg-white/20'}`} />
                   </button>
                </div>
             </div>
          </div>
        )}

        <div className="pt-12 space-y-6">
           <button 
             onClick={onLeave}
             className="w-full py-6 rounded-[32px] border border-white/5 text-[10px] uppercase tracking-[0.5em] text-white/40 hover:text-white hover:border-white/20 transition-all font-black"
           >
             Leave Collective
           </button>
           {isAdmin && (
             <button 
               onClick={onDissolve}
               className="w-full py-6 rounded-[32px] border border-red-500/10 text-[10px] uppercase tracking-[0.5em] text-red-500/40 hover:text-red-500 hover:border-red-500/40 transition-all font-black"
             >
               Dissolve Presence
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;
