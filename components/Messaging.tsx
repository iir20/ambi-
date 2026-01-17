
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, SocialMode, ConversationCategory, Message, MessageStatus } from '../types';
import { OTHER_USERS } from '../constants';

interface MessagingProps {
  conversations: Conversation[];
  onSelectChat: (id: string) => void;
  onSendMessage: (chatId: string, text: string, media?: Partial<Message>) => void;
  onVisitProfile: (handle: string) => void;
  onOpenGroupCreator: () => void;
  onOpenGroupInfo: (id: string) => void;
  onAcceptSignal: (chatId: string) => void;
  selectedChatId?: string;
  mode: SocialMode;
  currentUserId: string;
  currentUserSignals: any[];
}

const CATEGORY_STYLES: Record<ConversationCategory, { text: string; bg: string; border: string; label: string }> = {
  casual: { 
    text: 'text-white/70', 
    bg: 'bg-white/[0.02]', 
    border: 'border-white/[0.05]',
    label: 'Casual Resonance'
  },
  emotional: { 
    text: 'text-[#E8D5C4] italic font-serif text-lg leading-relaxed', 
    bg: 'bg-[#E8D5C4]/[0.03]', 
    border: 'border-[#E8D5C4]/10',
    label: 'Deep Emotional Drift'
  },
  professional: { 
    text: 'text-[#C4E8D5] font-mono tracking-tight text-xs uppercase', 
    bg: 'bg-black/40', 
    border: 'border-[#C4E8D5]/20',
    label: 'Protocol Signal'
  },
  anonymous: { 
    text: 'text-white/40 blur-[0.3px]', 
    bg: 'bg-white/[0.01]', 
    border: 'border-white/[0.02]',
    label: 'Shadow Collective'
  }
};

const Messaging: React.FC<MessagingProps> = ({ 
  conversations, onSelectChat, onSendMessage, onVisitProfile, onOpenGroupCreator, onOpenGroupInfo, onAcceptSignal, selectedChatId, mode, currentUserId, currentUserSignals
}) => {
  const [activeCategory, setActiveCategory] = useState<ConversationCategory | 'all'>('all');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [pendingFile, setPendingFile] = useState<{ file: File; preview: string; type: Message['mediaType'] } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = conversations.filter(c => 
    c.mode === mode && (activeCategory === 'all' || c.category === activeCategory)
  );

  const selectedChat = conversations.find(c => c.id === selectedChatId);
  const partner = selectedChat?.participants.find(p => p.id !== currentUserId) || selectedChat?.participants[0];
  const partnerSignal = currentUserSignals.find(s => s.userId === partner?.id);
  const isResonanceGated = !selectedChat?.isGroup && (partnerSignal?.strength < 10 && !selectedChat?.signalAccepted);

  const isAdmin = selectedChat?.adminIds?.includes(currentUserId);
  const canMessage = !selectedChat?.restrictedMessaging || isAdmin || selectedChat?.moderatorIds?.includes(currentUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages.length, selectedChatId]);

  const handleSend = async () => {
    if (!canMessage || (!messageText.trim() && !pendingFile) || !selectedChatId || isSending) return;
    
    setIsSending(true);
    
    if (pendingFile) {
      // Realistic Upload Pipeline Simulation: "Temporal Transfer"
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }
      
      onSendMessage(selectedChatId, messageText, {
        mediaUrl: pendingFile.preview,
        mediaType: pendingFile.type,
        fileName: pendingFile.file.name,
        fileSize: (pendingFile.file.size / 1024).toFixed(1) + ' KB',
        status: 'delivered'
      });
      setPendingFile(null);
      setUploadProgress(0);
    } else {
      onSendMessage(selectedChatId, messageText, { status: 'delivered' });
    }

    setMessageText('');
    setIsSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let type: Message['mediaType'] = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type === 'application/pdf') type = 'pdf';
      else if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) type = 'zip';

      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingFile({
          file,
          preview: event.target?.result as string,
          type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderMessageContent = (msg: Message, chat: Conversation) => {
    const style = CATEGORY_STYLES[chat.category];
    const isSelf = msg.senderId === currentUserId;
    const isAnonymous = chat.category === 'anonymous' && !isSelf;

    return (
      <div className={`space-y-3 ${isSelf ? 'items-end' : 'items-start'}`}>
        {!isSelf && (
          <div className="flex items-center space-x-2">
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">
              {isAnonymous ? 'Shadow Signal' : msg.senderName}
            </span>
          </div>
        )}
        
        {msg.mediaType === 'image' && (
          <div className={`rounded-3xl overflow-hidden border ${style.border} group/img relative aspect-square max-w-[240px]`}>
            <img src={msg.mediaUrl} alt="" className="w-full h-full object-cover grayscale opacity-80 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-[1.5s]" />
          </div>
        )}

        {msg.text && (
          <div className={`p-5 rounded-[28px] border transition-all ${isSelf ? 'bg-white/10 border-white/20' : `${style.bg} ${style.border}`}`}>
            <p className={`${isSelf ? 'text-white/90 text-[14px] font-light' : style.text}`}>
              {msg.text}
            </p>
          </div>
        )}

        {(msg.mediaType === 'file' || msg.mediaType === 'pdf' || msg.mediaType === 'zip') && (
          <div className={`flex items-center space-x-4 p-4 rounded-2xl border ${isSelf ? 'bg-white/5 border-white/10' : style.border + ' ' + style.bg}`}>
            <div className="p-2 bg-white/5 rounded-lg">
               {msg.mediaType === 'pdf' ? (
                 <svg className="w-4 h-4 text-red-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
               ) : msg.mediaType === 'zip' ? (
                 <svg className="w-4 h-4 text-amber-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
               ) : (
                 <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
               )}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-bold text-white/60 truncate uppercase">{msg.fileName}</p>
               <p className="text-[8px] uppercase tracking-widest text-white/20">{msg.fileSize} • {msg.mediaType}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isCreatingNew) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 px-6 pb-40 max-w-lg mx-auto">
        <header className="flex items-center justify-between py-6">
          <button onClick={() => setIsCreatingNew(false)} className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors">Abort</button>
          <h2 className="text-sm font-serif italic text-white/60">New Signal Initiation</h2>
          <div className="w-12" />
        </header>

        <div className="space-y-12">
           <button onClick={() => { setIsCreatingNew(false); onOpenGroupCreator(); }} className="w-full p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:bg-white/[0.04] transition-all flex items-center space-x-6 active:scale-[0.98]">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></div>
              <div className="text-left"><p className="text-[14px] font-bold text-white/80">Circle Collective</p><p className="text-[9px] text-white/20 uppercase tracking-widest">Form a multi-presence group</p></div>
           </button>

           <div className="space-y-6">
              <p className="text-[8px] uppercase tracking-[0.6em] text-white/10 font-black px-2">Frequent Echoes</p>
              {Object.values(OTHER_USERS).map((user) => (
                <button key={user.id} onClick={() => { setIsCreatingNew(false); onVisitProfile(user.identity.handle); }} className="w-full flex items-center space-x-4 p-4 hover:bg-white/[0.02] rounded-3xl transition-all active:scale-95">
                  <img src={user.identity.avatar} className="w-10 h-10 rounded-full grayscale opacity-40" alt="" />
                  <div className="text-left"><p className="text-sm font-bold text-white/60">{user.identity.name}</p><p className="text-[9px] text-white/10 uppercase tracking-widest">{user.identity.handle}</p></div>
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  }

  if (selectedChatId && selectedChat) {
    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-700 flex flex-col h-[calc(100vh-280px)] px-4 max-w-lg mx-auto">
        <header className="flex items-center justify-between pb-8 border-b border-white/[0.03] mb-8">
           <div className="flex items-center space-x-4">
              <button onClick={() => onSelectChat('')} className="p-3 text-white/20 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
              <div className="flex items-center space-x-4">
                 <img src={selectedChat.isGroup ? selectedChat.groupAvatar : partner?.avatar} className="w-10 h-10 rounded-full border border-white/10 grayscale" alt="" />
                 <div className="text-left">
                    <h3 className="text-lg font-serif italic text-white/90">{selectedChat.isGroup ? selectedChat.groupName : partner?.name}</h3>
                    <p className={`text-[7px] uppercase tracking-[0.4em] font-black ${CATEGORY_STYLES[selectedChat.category].text}`}>{CATEGORY_STYLES[selectedChat.category].label}</p>
                 </div>
              </div>
           </div>
           <button onClick={() => selectedChat.isGroup ? onOpenGroupInfo(selectedChat.id) : onVisitProfile(partner?.id || '')} className="p-3 text-white/10 hover:text-white/40"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></button>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-10 py-4">
           {isResonanceGated ? (
             <div className="py-20 text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                <div className="w-16 h-16 rounded-full border border-dashed border-white/10 mx-auto flex items-center justify-center text-white/10"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
                <div className="space-y-2">
                   <p className="text-2xl font-serif italic text-white/20">Shrouded Signal</p>
                   <p className="text-[10px] uppercase tracking-widest text-white/10 px-12">This frequency has not been synced yet. Content is currently veiled.</p>
                </div>
                <button onClick={() => onAcceptSignal(selectedChatId)} className="px-10 py-4 bg-white/[0.03] border border-white/10 rounded-full text-[10px] uppercase tracking-[0.4em] font-black text-white/60 hover:bg-white/5 transition-all">Tune Into Frequency</button>
             </div>
           ) : (
             <>
               {selectedChat.messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {renderMessageContent(msg, selectedChat)}
                    </div>
                 </div>
               ))}
               <div ref={messagesEndRef} />
             </>
           )}
        </div>

        {canMessage && !isResonanceGated && (
          <div className="pt-8 mb-10 space-y-4">
            {pendingFile && (
              <div className="p-4 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center space-x-4 animate-in slide-in-from-bottom-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                   {pendingFile.type === 'pdf' ? (
                     <svg className="w-5 h-5 text-red-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                   ) : pendingFile.type === 'zip' ? (
                     <svg className="w-5 h-5 text-amber-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                   ) : (
                     <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2.0 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                   )}
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-bold text-white/60 truncate uppercase">{pendingFile.file.name}</p>
                    <div className="h-0.5 w-full bg-white/5 mt-1 rounded-full overflow-hidden">
                       <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                 </div>
                 <button onClick={() => setPendingFile(null)} className="text-white/20 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
            )}
            
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2 bg-white/[0.01] border border-white/[0.05] rounded-[36px] p-2 pr-6 group focus-within:border-white/20 transition-all">
               <button type="button" onClick={() => fileInputRef.current?.click()} className="p-4 text-white/10 hover:text-white/40 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></button>
               <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
               <input 
                 value={messageText}
                 onChange={(e) => setMessageText(e.target.value)}
                 placeholder="Broadcast intent..."
                 className="flex-1 bg-transparent px-2 py-4 text-sm outline-none text-white/60 placeholder:text-white/10 font-light"
               />
               <button type="submit" disabled={isSending || (!messageText.trim() && !pendingFile)} className="p-3 text-white/10 hover:text-white disabled:opacity-0 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-1000 space-y-12 px-6 pb-48 max-w-lg mx-auto">
      <header className="flex justify-between items-center py-4">
        <div className="flex space-x-6 overflow-x-auto no-scrollbar">
           {(['all', 'casual', 'emotional', 'professional', 'anonymous'] as const).map(cat => (
             <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-[10px] uppercase tracking-[0.4em] font-black pb-2 border-b-2 transition-all whitespace-nowrap ${activeCategory === cat ? 'text-white border-white/20' : 'text-white/10 border-transparent hover:text-white/40'}`}>{cat}</button>
           ))}
        </div>
        <button onClick={() => setIsCreatingNew(true)} className="p-4 bg-white/[0.03] border border-white/10 rounded-full hover:bg-white/5 transition-all"><svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></button>
      </header>

      <div className="space-y-4">
        {filtered.map(convo => {
          const lastMsg = convo.messages[convo.messages.length - 1];
          const chatPartner = convo.participants.find(p => p.id !== currentUserId) || convo.participants[0];
          const isGated = !convo.isGroup && (currentUserSignals.find(s => s.userId === chatPartner.id)?.strength < 10 && !convo.signalAccepted);

          return (
            <button key={convo.id} onClick={() => onSelectChat(convo.id)} className="w-full text-left p-6 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] rounded-[40px] transition-all group flex items-center space-x-6 active:scale-[0.98]">
              <div className="relative">
                 <img src={convo.isGroup ? convo.groupAvatar : chatPartner.avatar} className={`w-14 h-14 rounded-full border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700 ${isGated ? 'blur-md opacity-20' : 'opacity-60'}`} alt="" />
                 {convo.unreadCount > 0 && <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full border-2 border-[#0A0A0A]" />}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[14px] font-bold text-white/60 group-hover:text-white uppercase tracking-wider">{isGated ? 'Shrouded Frequency' : (convo.isGroup ? convo.groupName : chatPartner.name)}</h4>
                    <span className="text-[8px] text-white/10 uppercase tracking-widest">{lastMsg?.timestamp}</span>
                 </div>
                 <p className="text-[12px] text-white/20 truncate italic font-light">
                   {isGated ? "Sync required to view signal..." : (lastMsg?.mediaType ? "Artifact shared." : (lastMsg?.text ? `"${lastMsg.text}"` : "Dialogue manifest open."))}
                 </p>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <div className="py-40 text-center opacity-10"><p className="font-serif italic text-3xl">Silent Drift.</p></div>}
      </div>
    </div>
  );
};

export default Messaging;
