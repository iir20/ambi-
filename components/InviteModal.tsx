
import React from 'react';
import { OTHER_USERS } from '../constants';
import { UserIdentity } from '../types';

interface InviteModalProps {
  currentParticipants: UserIdentity[];
  onClose: () => void;
  onInvite: (user: UserIdentity) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ currentParticipants, onClose, onInvite }) => {
  const currentIds = new Set(currentParticipants.map(p => p.id));
  const availableToInvite = Object.values(OTHER_USERS)
    .map(u => u.identity)
    .filter(identity => !currentIds.has(identity.id));

  return (
    <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 space-y-10 animate-in zoom-in-95 duration-700">
        <header className="flex justify-between items-center">
          <h2 className="text-xl font-serif italic text-white/90">Extend Resonance</h2>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </header>

        <div className="space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
          {availableToInvite.length > 0 ? (
            availableToInvite.map(user => (
              <button 
                key={user.id} 
                onClick={() => onInvite(user)}
                className="w-full flex items-center space-x-5 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/20 transition-all group"
              >
                <img src={user.avatar} className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all" alt="" />
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-white/80">{user.name}</p>
                  <p className="text-[10px] text-white/20 tracking-widest">{user.handle}</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white group-hover:border-white/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
              </button>
            ))
          ) : (
            <div className="py-10 text-center opacity-20">
              <p className="text-[10px] uppercase tracking-widest font-black">All connections already within the circle.</p>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 text-[9px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InviteModal;
