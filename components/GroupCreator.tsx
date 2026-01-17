
import React, { useState, useRef } from 'react';
import { OTHER_USERS } from '../constants';
import { UserIdentity, Conversation, ConversationCategory, SocialMode } from '../types';

interface GroupCreatorProps {
  currentUser: UserIdentity;
  onClose: () => void;
  onCreate: (group: Partial<Conversation>) => void;
}

const GroupCreator: React.FC<GroupCreatorProps> = ({ currentUser, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableUsers = Object.values(OTHER_USERS).map(u => u.identity);

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return alert("Circle needs a name.");
    if (selectedUserIds.length === 0) return alert("Select at least one partner.");

    const participants = [
      currentUser,
      ...availableUsers.filter(u => selectedUserIds.includes(u.id))
    ];

    onCreate({
      isGroup: true,
      groupName: name,
      groupAvatar: avatar,
      participants,
      adminIds: [currentUser.id],
      moderatorIds: [],
      category: 'casual',
      mode: SocialMode.CONNECT,
      messages: [],
      unreadCount: 0
    });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#0A0A0A] flex flex-col items-center p-8 animate-in slide-in-from-bottom-20 duration-1000 overflow-y-auto no-scrollbar">
      <header className="w-full max-w-lg flex justify-between items-center mb-16 shrink-0">
        <button onClick={onClose} className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors">Abort</button>
        <h2 className="text-sm font-serif italic text-white/60">New Circle Collective</h2>
        <button 
          onClick={handleCreate} 
          disabled={!name.trim() || selectedUserIds.length === 0 || isUploading} 
          className="text-[10px] uppercase tracking-[0.4em] text-white/90 disabled:opacity-10 transition-opacity"
        >
          Form Circle
        </button>
      </header>

      <div className="w-full max-w-lg flex-1 flex flex-col space-y-12 pb-20">
        <div className="flex flex-col items-center space-y-8">
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="w-32 h-32 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center bg-white/[0.02] cursor-pointer hover:border-white/40 transition-all overflow-hidden relative group"
           >
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Circle Avatar" />
              ) : (
                <div className="text-center space-y-2 opacity-20">
                   <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              )}
           </div>
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
           
           <input 
             type="text" 
             autoFocus
             value={name}
             onChange={(e) => setName(e.target.value)}
             placeholder="Circle Name..."
             className="w-full bg-transparent text-center text-3xl font-serif italic text-white/80 outline-none border-b border-white/5 pb-4 focus:border-white/20 transition-all"
           />
        </div>

        <div className="space-y-8">
           <label className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-black">Invite Connections</label>
           <div className="space-y-4">
              {availableUsers.map(user => (
                <button 
                  key={user.id} 
                  onClick={() => toggleUser(user.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-[28px] border transition-all ${
                    selectedUserIds.includes(user.id) ? 'bg-white/5 border-white/20' : 'bg-white/[0.01] border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-5">
                    <img src={user.avatar} className="w-10 h-10 rounded-full grayscale" alt="" />
                    <div className="text-left">
                       <p className="text-sm font-bold text-white/80">{user.name}</p>
                       <p className="text-[10px] text-white/20 tracking-widest">{user.handle}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    selectedUserIds.includes(user.id) ? 'bg-white border-white' : 'border-white/10'
                  }`}>
                    {selectedUserIds.includes(user.id) && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCreator;
