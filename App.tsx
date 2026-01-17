
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppState, AppView, UserProfileData, Post, Conversation, Message, UserIdentity, SocialMode, Comment, PersonalNote, Story, TimeCapsule, FeedMode, AccountRegistry, AttentionStats } from './types';
import { INITIAL_POSTS, MOCK_USER, INITIAL_CONVERSATIONS, OTHER_USERS, MODE_CONFIGS, INITIAL_TRACES, generateGuestIdentity } from './constants';
import { PRODUCTION_CONFIG, isLowPowerMode } from './services/config';
import FeedItem from './components/FeedItem';
import FeedHeader from './components/FeedHeader';
import FeedStoryStrip from './components/FeedStoryStrip';
import FeedCapsule from './components/FeedCapsule';
import SanctuarySettings from './components/SanctuarySettings';
import Onboarding from './components/Onboarding';
import Profile from './components/Profile';
import Messaging from './components/Messaging';
import TraceCreator from './components/TraceCreator';
import TraceViewer from './components/TraceViewer';
import CapsuleCreator from './components/CapsuleCreator';
import GroupCreator from './components/GroupCreator';
import GroupInfo from './components/GroupInfo';
import InviteModal from './components/InviteModal';
import CaughtUp from './components/CaughtUp';
import DeepActionGate from './components/DeepActionGate';
import ConnectionMap from './components/ConnectionMap';
import CreatorDashboard from './components/CreatorDashboard';
import StillnessSanctuary from './components/StillnessSanctuary';
import { rankAndGroupPosts } from './services/ranking';
import { calculateSignalStrength, applyDecay } from './services/signals';
import { calculateResonanceScore, validateSignal } from './services/attention';
import { getEraName, getEraColor } from './services/resonance';

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error("App Crash:", e);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-1000">
        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/20 animate-pulse">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h2 className="text-2xl font-serif italic text-white/80">Signal Interrupted.</h2>
        <p className="text-[10px] uppercase tracking-widest text-white/20 max-w-xs">A temporal anomaly has occurred. Your sanctuary remains safe, but we must reset the drift.</p>
        <button onClick={() => window.location.reload()} className="px-12 py-5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-white/10 transition-all">Restore Sync</button>
      </div>
    );
  }
  return <>{children}</>;
};

const ComposeModal: React.FC<{ onClose: () => void; onPost: (content: string, media?: string) => void }> = ({ onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setMedia(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[48px] p-10 space-y-8 shadow-2xl">
        <header className="flex justify-between items-center">
          <h2 className="text-xl font-serif italic text-white/90">Release Signal</h2>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </header>
        <textarea 
          autoFocus
          className="w-full bg-transparent text-2xl font-serif italic text-white/80 outline-none h-40 resize-none placeholder:text-white/5"
          placeholder="What's resonating?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {media && (
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
            <img src={media} className="w-full h-full object-cover grayscale" alt="" />
            <button onClick={() => setMedia(undefined)} className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white">×</button>
          </div>
        )}
        <div className="flex justify-between items-center pt-4">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()} 
            className="p-4 bg-white/5 rounded-full text-white/40 hover:text-white border border-white/10 transition-all active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2.0 0 112.828 0L16 16m-2-2l1.586-1.586a2 2.0 0 112.828 0L20 14m-6-6h.01M6 20h12a2 2.0 0 02-2V6a2 2.0 0 0-2-2H6a2 2.0 0 0-2 2v12a2 2.0 0 02 2z"></path></svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <button 
            onClick={() => onPost(content, media)}
            disabled={!content.trim()}
            className="px-10 py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] disabled:opacity-20 transition-all active:scale-95"
          >
            Broadcast
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [registry, setRegistry] = useState<AccountRegistry>(() => {
    try {
      const saved = localStorage.getItem('ambi_account_registry');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn("Registry hydration failed"); }
    return { activeId: 'me', accounts: { 'me': MOCK_USER } };
  });

  // Fix: Explicitly type currentUser using UserProfileData to ensure correct property access throughout the component
  const currentUser = useMemo<UserProfileData>(() => (registry.accounts[registry.activeId] || MOCK_USER) as UserProfileData, [registry]);

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('ambi_posts');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch (e) { return INITIAL_POSTS; }
  });

  const [traces, setTraces] = useState<Story[]>(INITIAL_TRACES);
  
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('ambi_conversations');
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch (e) { return INITIAL_CONVERSATIONS; }
  });

  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem('ambi_app_state');
    const onboarded = localStorage.getItem('ambi_onboarding_complete');
    
    const defaultAI = {
      enabled: PRODUCTION_CONFIG.FEATURES.AI_ENABLED,
      insightPrivacy: 'redacted' as const,
      generationIntensity: 'conservative' as const,
      lastCalled: 0
    };

    const isLowPower = isLowPowerMode();

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...parsed, 
          currentView: onboarded ? AppView.FEED : AppView.ONBOARDING,
          showTransparencyHints: parsed.showTransparencyHints ?? true,
          aiSettings: parsed.aiSettings ?? defaultAI,
          intensity: isLowPower ? Math.min(parsed.intensity, 30) : parsed.intensity
        };
      } catch (e) { /* fallback */ }
    }
    return { 
      currentView: onboarded ? AppView.FEED : AppView.ONBOARDING, 
      intensity: isLowPower ? 20 : 30, 
      textSize: 20, 
      highContrast: false, 
      hasCompletedOnboarding: !!onboarded, 
      selectedChatId: '', 
      feedMode: 'SIGNAL',
      showTransparencyHints: true,
      aiSettings: defaultAI
    };
  });

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isTraceCreatorOpen, setIsTraceCreatorOpen] = useState(false);
  const [isCapsuleCreatorOpen, setIsCapsuleCreatorOpen] = useState(false);
  const [isGroupCreatorOpen, setIsGroupCreatorOpen] = useState(false);
  const [selectedGroupInfoId, setSelectedGroupInfoId] = useState<string | null>(null);
  const [activeTraceIndex, setActiveTraceIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRegistry(prev => {
      const updated = { ...prev };
      if (updated.accounts[updated.activeId]) {
        updated.accounts[updated.activeId].signals = applyDecay(updated.accounts[updated.activeId].signals);
      }
      return updated;
    });
  }, []);

  // System Persistence
  useEffect(() => {
    const timer = setTimeout(() => {
       localStorage.setItem('ambi_account_registry', JSON.stringify(registry));
       localStorage.setItem('ambi_app_state', JSON.stringify(appState));
       localStorage.setItem('ambi_conversations', JSON.stringify(conversations));
       localStorage.setItem('ambi_posts', JSON.stringify(posts));
    }, 1500);
    return () => clearTimeout(timer);
  }, [registry, appState, conversations, posts]);

  const updateLifetimeStats = (type: 'TIME' | 'HOLD' | 'SIGNAL' | 'CAPSULE' | 'INTERACTION', value: number = 1) => {
    setRegistry(prev => {
      const acc = prev.accounts[prev.activeId];
      if (!acc) return prev;
      const stats = { ...acc.lifetimeAttention };
      if (type === 'TIME') stats.totalAttentionTime += value;
      if (type === 'HOLD') stats.totalDeepHolds += value;
      if (type === 'SIGNAL') stats.totalMutualSignals += value;
      if (type === 'CAPSULE') stats.totalCapsulesSaved += value;
      if (type === 'INTERACTION') stats.totalDeepHolds += 0.5; 
      
      const newEra = getEraName(stats);
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [prev.activeId]: { 
            ...acc, 
            lifetimeAttention: { 
              ...stats, 
              presenceEra: newEra, 
              eraColor: getEraColor(newEra) 
            } 
          }
        }
      };
    });
  };

  const emitSignal = (userId: string, action: string) => {
    if (!userId || userId === currentUser.id) return;
    if (currentUser.visibility.signalEmission === 'hidden' && action !== 'MESSAGE') return;

    setRegistry(prev => {
      const acc = prev.accounts[prev.activeId];
      if (!acc) return prev;
      const updatedSignals = calculateSignalStrength(acc.signals, userId, action);
      const wasMutual = acc.signals.find(s => s.userId === userId)?.type === 'MUTUAL';
      const isNowMutual = updatedSignals.find(s => s.userId === userId)?.type === 'MUTUAL';
      
      if (!wasMutual && isNowMutual) setTimeout(() => updateLifetimeStats('SIGNAL'), 0);
      
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [prev.activeId]: { ...acc, signals: updatedSignals }
        }
      };
    });
  };

  const handleSendMessage = (chatId: string, text: string, media?: Partial<Message>) => {
    const newMessage: Message = {
      id: 'm-' + Date.now(),
      senderId: currentUser.id || 'me',
      senderName: currentUser.identity.name,
      text,
      timestamp: 'Just now',
      status: 'delivered',
      ...media
    };

    setConversations(prev => prev.map(c => {
      if (c.id === chatId) {
        const partner = c.participants.find(p => p.id !== currentUser.id);
        if (partner) {
          emitSignal(partner.id, 'MESSAGE');
          updateLifetimeStats('INTERACTION', 2);
        }
        return {
          ...c,
          messages: [...c.messages, newMessage],
          unreadCount: 0
        };
      }
      return c;
    }));
  };

  const handleAcceptSignal = (chatId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === chatId) {
        const partner = c.participants.find(p => p.id !== currentUser.id);
        if (partner) {
          emitSignal(partner.id, 'MESSAGE'); 
          updateLifetimeStats('SIGNAL');
        }
        return { ...c, signalAccepted: true };
      }
      return c;
    }));
  };

  const handleReact = (postId: string, emoji: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        emitSignal(p.authorId, 'REACT');
        updateLifetimeStats('INTERACTION');
        const userReactions = { ...p.userReactions };
        const reactions = { ...p.reactions };
        
        if (userReactions[emoji]) {
          reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
          delete userReactions[emoji];
        } else {
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          userReactions[emoji] = true;
        }

        const attention = { 
          ...p.attention, 
          deepInteractions: p.attention.deepInteractions + 1,
          resonanceScore: calculateResonanceScore({ ...p.attention, deepInteractions: p.attention.deepInteractions + 1 })
        };

        return { ...p, reactions, userReactions, attention };
      }
      return p;
    }));
  };

  const handleComment = (postId: string, text: string) => {
    const newComment: Comment = {
      id: 'c-' + Date.now(),
      authorName: currentUser.identity.name,
      content: text,
      timestamp: 'Just now'
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        emitSignal(p.authorId, 'COMMENT');
        updateLifetimeStats('INTERACTION', 2);
        const attention = { 
          ...p.attention, 
          deepInteractions: p.attention.deepInteractions + 3,
          resonanceScore: calculateResonanceScore({ ...p.attention, deepInteractions: p.attention.deepInteractions + 3 })
        };
        return { 
          ...p, 
          comments: [...p.comments, newComment],
          attention 
        };
      }
      return p;
    }));
  };

  const handleShare = (postId: string) => {
    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;

    emitSignal(originalPost.authorId, 'SAVE');
    updateLifetimeStats('CAPSULE');

    const repost: Post = {
      id: 'rp-' + Date.now(),
      authorName: currentUser.identity.name,
      authorHandle: currentUser.identity.handle,
      authorAvatar: currentUser.identity.avatar,
      authorId: currentUser.id,
      content: originalPost.content,
      media: originalPost.media,
      timestamp: 'Just now',
      createdAt: Date.now(),
      reactions: { '✨': 1 },
      userReactions: { '✨': true },
      comments: [],
      energyLevel: 'creative',
      isMemory: true,
      resonanceReason: `Shared from ${originalPost.authorName}'s signal`,
      attention: { glances: 0, holds: 0, returns: 0, deepInteractions: 0, resonanceScore: 0, confidenceScore: 1.0 }
    };

    setPosts(prev => [repost, ...prev]);
    setIsNavigating(true);
    setTimeout(() => {
      setAppState(prev => ({ ...prev, currentView: AppView.FEED }));
      setIsNavigating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const handleAttentionEvent = (postId: string, type: 'GLANCE' | 'HOLD' | 'RETURN') => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextAttention = { ...p.attention };
        const validation = validateSignal(type, nextAttention);
        
        if (!validation.isValid) return p;

        if (type === 'GLANCE') {
          nextAttention.glances += 1;
          updateLifetimeStats('TIME', 2); 
        }
        if (type === 'HOLD') {
            nextAttention.holds += 1;
            emitSignal(p.authorId, 'VIEW');
            updateLifetimeStats('HOLD');
            updateLifetimeStats('TIME', 10);
        }
        if (type === 'RETURN') {
          nextAttention.returns += 1;
          nextAttention.lastReturnTimestamp = Date.now();
          updateLifetimeStats('TIME', 5);
        }
        
        nextAttention.confidenceScore = (nextAttention.confidenceScore + validation.confidence) / 2;
        nextAttention.resonanceScore = calculateResonanceScore(nextAttention);
        return { ...p, attention: nextAttention };
      }
      return p;
    }));
  };

  const feedWaves = useMemo(() => {
    return rankAndGroupPosts(posts, currentUser, appState.feedMode, appState.intensity);
  }, [posts, appState.feedMode, appState.intensity, currentUser]);

  const handleOnboardingComplete = (type: 'guest' | 'anchored', aiProfile?: Partial<UserIdentity>) => {
    const newId = type === 'guest' ? 'guest_' + Date.now() : 'anchored_' + Date.now();
    let newUser: UserProfileData;

    if (type === 'guest') {
      newUser = generateGuestIdentity();
      newUser.id = newId;
    } else {
      const baseIdentity = generateGuestIdentity().identity;
      newUser = {
        ...generateGuestIdentity(),
        id: newId,
        isGuest: false,
        accountStatus: 'anchored',
        identity: {
          ...baseIdentity,
          id: newId,
          avatarType: aiProfile?.avatarType || 'image',
          avatarConfig: aiProfile?.avatarConfig,
          ...aiProfile
        },
        visibility: {
          ...generateGuestIdentity().visibility,
          attentionHints: 'visible',
          signalEmission: 'active'
        }
      };
    }

    setRegistry(prev => ({
      ...prev,
      activeId: newId,
      accounts: { ...prev.accounts, [newId]: newUser }
    }));

    setAppState(prev => ({ ...prev, currentView: AppView.FEED, hasCompletedOnboarding: true }));
    localStorage.setItem('ambi_onboarding_complete', 'true');
  };

  const handleVisitProfile = (handleOrId: string) => {
    setIsNavigating(true);
    setTimeout(() => {
      // Fix: Cast registry.accounts and OTHER_USERS Object.values to UserProfileData[] to resolve unknown type errors during handle search
      const foundInRegistry = (Object.values(registry.accounts) as UserProfileData[]).find(u => u.identity.handle === handleOrId || u.id === handleOrId);
      const foundInStatic = (Object.values(OTHER_USERS) as UserProfileData[]).find(u => u.identity.handle === handleOrId || u.id === handleOrId);
      
      const targetId = foundInRegistry?.id || foundInStatic?.id;
      if (targetId) {
        if (targetId !== currentUser.id) emitSignal(targetId, 'VIEW');
        setSelectedProfileId(targetId);
        setAppState(prev => ({ ...prev, currentView: AppView.PROFILE }));
      }
      setIsNavigating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleUpdateIdentity = (updated: Partial<UserIdentity>) => {
    setRegistry(prev => {
      const acc = prev.accounts[prev.activeId];
      if (!acc) return prev;
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [prev.activeId]: {
            ...acc,
            identity: { ...acc.identity, ...updated }
          }
        }
      };
    });
  };

  const handleAddNote = (text: string) => {
    const newNote: PersonalNote = {
      id: 'n-' + Date.now(),
      text,
      timestamp: 'Just now',
      isPrivate: true
    };
    setRegistry(prev => {
      const acc = prev.accounts[prev.activeId];
      if (!acc) return prev;
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [prev.activeId]: {
            ...acc,
            notes: [newNote, ...acc.notes]
          }
        }
      };
    });
  };

  const handleDeleteNote = (id: string) => {
    setRegistry(prev => {
      const acc = prev.accounts[prev.activeId];
      if (!acc) return prev;
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [prev.activeId]: {
            ...acc,
            notes: acc.notes.filter(n => n.id !== id)
          }
        }
      };
    });
  };

  const handleSwitchAccount = (id: string) => {
    setRegistry(prev => ({ ...prev, activeId: id }));
    setIsSettingsOpen(false);
  };

  const handleLogout = (id: string) => {
    setRegistry(prev => {
      const newAccounts = { ...prev.accounts };
      delete newAccounts[id];
      const accountIds = Object.keys(newAccounts);
      let nextId = prev.activeId;
      
      if (id === prev.activeId) {
        if (accountIds.length === 0) {
          const guest = generateGuestIdentity();
          return { activeId: guest.id, accounts: { [guest.id]: guest } };
        }
        nextId = accountIds[0];
      }
      
      return { activeId: nextId, accounts: newAccounts };
    });
  };

  const textSizeBase = 12 + (appState.textSize / 100) * 8;

  const renderContent = () => {
    switch(appState.currentView) {
      case AppView.STILLNESS:
        return <StillnessSanctuary 
          currentUser={currentUser.identity} 
          onExit={() => setAppState(prev => ({ ...prev, currentView: AppView.FEED }))} 
        />;
      case AppView.ANALYTICS:
        return <CreatorDashboard 
          userPosts={posts.filter(p => p.authorId === currentUser.id)} 
          onClose={() => setAppState(prev => ({ ...prev, currentView: AppView.PROFILE }))} 
          aiPrivacy={appState.aiSettings.insightPrivacy}
          aiEnabled={appState.aiSettings.enabled}
        />;
      case AppView.NEXUS:
        return <ConnectionMap currentUser={currentUser} onVisitUser={handleVisitProfile} />;
      case AppView.PROFILE:
        const profileId = selectedProfileId || currentUser.id;
        // Fix: Cast registry lookup result to UserProfileData for strict type checking
        const profileData = (registry.accounts[profileId] as UserProfileData) || (OTHER_USERS[profileId] as UserProfileData) || MOCK_USER;
        return (
          <div className="relative">
            <Profile 
              user={profileData} 
              currentUserSignal={currentUser.signals.find(s => s.userId === profileData.id)} 
              isOwnProfile={profileId === currentUser.id} 
              onBack={() => setAppState(prev => ({ ...prev, currentView: AppView.FEED }))} 
              onUpdateIdentity={handleUpdateIdentity}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenCapsuleCreator={() => setIsCapsuleCreatorOpen(true)}
              userPosts={posts.filter(p => p.authorId === profileId)} 
              userTraces={traces.filter(t => t.authorId === profileId)}
              onMessage={(id) => {
                const existing = conversations.find(c => c.participants.some(p => p.id === id) && !c.isGroup);
                if (existing) {
                  setAppState(prev => ({ ...prev, currentView: AppView.MESSAGES, selectedChatId: existing.id }));
                } else {
                  // Fix: Cast Object.values to UserProfileData[] to ensure targetUser properties are accessible
                  const targetUser = (OTHER_USERS[id] as UserProfileData) || (Object.values(registry.accounts) as UserProfileData[]).find(u => u.id === id);
                  const newChat: Conversation = {
                    id: 'chat-' + Date.now(),
                    category: 'casual',
                    mode: SocialMode.CONNECT,
                    participants: [currentUser.identity, targetUser?.identity || MOCK_USER.identity],
                    unreadCount: 0,
                    messages: [],
                    signalAccepted: false
                  };
                  setConversations(prev => [newChat, ...prev]);
                  setAppState(prev => ({ ...prev, currentView: AppView.MESSAGES, selectedChatId: newChat.id }));
                }
              }}
            />
          </div>
        );
      case AppView.MESSAGES:
        return <Messaging 
          conversations={conversations} 
          selectedChatId={appState.selectedChatId} 
          onSelectChat={(id) => setAppState(prev => ({ ...prev, selectedChatId: id }))} 
          onSendMessage={handleSendMessage} 
          onAcceptSignal={handleAcceptSignal}
          onVisitProfile={handleVisitProfile} 
          onOpenGroupCreator={() => setIsGroupCreatorOpen(true)} 
          onOpenGroupInfo={(id) => setSelectedGroupInfoId(id)} 
          currentUserId={currentUser.id} 
          currentUserSignals={currentUser.signals}
          mode={SocialMode.CONNECT} 
        />;
      case AppView.FEED:
      default:
        return (
          <div className="max-w-2xl mx-auto pt-24 px-4 pb-48">
            <FeedHeader 
              mode={SocialMode.CONNECT} 
              feedMode={appState.feedMode} 
              setFeedMode={(m) => setAppState(prev => ({ ...prev, feedMode: m }))} 
              intensity={appState.intensity} 
              onOpenSettings={() => setIsSettingsOpen(true)} 
              onRefresh={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              onEnterStillness={() => setAppState(prev => ({ ...prev, currentView: AppView.STILLNESS }))}
            />
            <FeedStoryStrip traces={traces} onOpenCreator={() => setIsTraceCreatorOpen(true)} onViewTrace={(i) => setActiveTraceIndex(i)} onVisitProfile={handleVisitProfile} />
            <div onClick={() => setIsComposeOpen(true)} className="mb-24 group cursor-pointer border-b border-white/5 pb-12 transition-all hover:border-white/10">
               <div className="flex items-center space-x-8">
                 <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></div>
                 <span className="text-2xl text-white/20 font-serif italic group-hover:text-white/60 transition-all duration-1000">Release a signal...</span>
               </div>
            </div>
            
            <div className="space-y-20">
              {feedWaves.map((wave) => (
                <div key={wave.label} className="space-y-12">
                  <header className="px-10 space-y-2 opacity-30 group">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white group-hover:text-white transition-colors">{wave.label}</h3>
                      <div className="flex-1 h-[1px] bg-white/10" />
                    </div>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-white/40 italic">{wave.description}</p>
                  </header>
                  
                  <div className="space-y-16">
                    {wave.posts.map((item) => (
                      <FeedItem 
                        key={item.id} 
                        post={item} 
                        intensity={appState.intensity} 
                        showTransparency={appState.showTransparencyHints && appState.aiSettings.enabled}
                        signalStrength={currentUser.signals.find(s => s.userId === item.authorId)?.strength || 0} 
                        onReact={handleReact} 
                        onComment={handleComment} 
                        onShare={handleShare} 
                        onVisitProfile={handleVisitProfile} 
                        onMessageUser={handleVisitProfile} 
                        onAttentionEvent={handleAttentionEvent}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <CaughtUp />
            </div>
          </div>
        );
    }
  };

  if (!appState.hasCompletedOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <ErrorBoundary>
      <div 
        className={`h-screen w-full flex flex-col bg-[#0A0A0A] text-white overflow-hidden ${!mounted ? 'opacity-0' : 'opacity-100 transition-opacity duration-[2000ms]'} ${appState.highContrast ? 'high-contrast' : ''}`} 
        style={{ fontSize: `${textSizeBase}px` }}
      >
        {isNavigating && <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300"><div className="w-12 h-12 rounded-full border border-white/10 border-t-white animate-spin" /></div>}
        <main className="flex-1 overflow-y-auto no-scrollbar">{renderContent()}</main>
        <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-8 z-[100]">
          {[ { view: AppView.FEED, label: 'Feed' }, { view: AppView.NEXUS, label: 'Nexus' }, { view: AppView.MESSAGES, label: 'Signals' }, { view: AppView.PROFILE, label: 'Sanctuary' } ].map((item) => (
            <button key={item.view} onClick={() => { setSelectedProfileId(null); setAppState(prev => ({ ...prev, currentView: item.view })); }} className={`flex flex-col items-center transition-all duration-500 active:scale-95 ${appState.currentView === item.view && !selectedProfileId ? 'opacity-100 scale-110' : 'opacity-20 hover:opacity-50'}`}>
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">{item.label}</span>
              {appState.currentView === item.view && !selectedProfileId && <div className="w-1 h-1 bg-white rounded-full mt-2" />}
            </button>
          ))}
        </nav>
        <SanctuarySettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} accounts={registry.accounts} activeId={registry.activeId} appState={appState} onSwitchAccount={handleSwitchAccount} onAddAccount={() => { setIsSettingsOpen(false); setAppState(prev => ({ ...prev, currentView: AppView.ONBOARDING, hasCompletedOnboarding: false })); }} onLogout={handleLogout} updateAppState={(updates) => setAppState(prev => ({ ...prev, ...updates }))} />
        {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} onPost={(c, m) => { const newPost: Post = { id: 'p-' + Date.now(), authorName: currentUser.identity.name, authorHandle: currentUser.identity.handle, authorAvatar: currentUser.identity.avatar, authorId: currentUser.id, content: c, media: m, timestamp: 'Just now', createdAt: Date.now(), reactions: { '✨': 1 }, userReactions: { '✨': true }, comments: [], energyLevel: 'creative', attention: { glances: 0, holds: 0, returns: 0, deepInteractions: 0, resonanceScore: 0, confidenceScore: 1.0 } }; setPosts(prev => [newPost, ...prev]); setIsComposeOpen(false); }} />}
        {isTraceCreatorOpen && <TraceCreator currentUser={currentUser.identity} onClose={() => setIsTraceCreatorOpen(false)} onPost={(trace) => { const newTrace: Story = { id: 't-' + Date.now(), authorId: currentUser.id, authorName: currentUser.identity.name, authorAvatar: currentUser.identity.avatar, content: trace.content || '', media: trace.media, type: trace.type || 'text', createdAt: Date.now(), duration: trace.duration || 24, moodColor: trace.moodColor || '#FFFFFF', isPrivate: trace.isPrivate || false, attention: { glances: 0, holds: 0, returns: 0, deepInteractions: 0, resonanceScore: 0, confidenceScore: 1.0 } }; setTraces(prev => [newTrace, ...prev]); setIsTraceCreatorOpen(false); }} />}
        {isCapsuleCreatorOpen && <CapsuleCreator currentUser={currentUser.identity} onClose={() => setIsCapsuleCreatorOpen(false)} onPost={(cap) => { const newCapsule: TimeCapsule = { id: 'cap-' + Date.now(), authorId: currentUser.id, authorName: currentUser.identity.name, authorAvatar: currentUser.identity.avatar, content: cap.content || '', media: cap.media, type: cap.type || 'memory', createdAt: Date.now(), unlockAt: cap.unlockAt || Date.now() + 86400000, privacy: cap.privacy || 'private', contributorIds: cap.contributorIds }; setRegistry(prev => { const acc = (prev.accounts[prev.activeId] as UserProfileData); return { ...prev, accounts: { ...prev.accounts, [prev.activeId]: { ...acc, capsules: [newCapsule, ...acc.capsules] } } }; }); setIsCapsuleCreatorOpen(false); }} />}
        {isGroupCreatorOpen && <GroupCreator currentUser={currentUser.identity} onClose={() => setIsGroupCreatorOpen(false)} onCreate={(group) => { const newChat: Conversation = { id: 'chat-' + Date.now(), category: 'casual', mode: SocialMode.CONNECT, participants: group.participants || [], messages: [], unreadCount: 0, isGroup: true, groupName: group.groupName, groupAvatar: group.groupAvatar, adminIds: group.adminIds, moderatorIds: [] }; setConversations(prev => [newChat, ...prev]); setAppState(prev => ({ ...prev, currentView: AppView.MESSAGES, selectedChatId: newChat.id })); setIsGroupCreatorOpen(false); }} />}
        {activeTraceIndex !== null && <TraceViewer traces={traces} startIndex={activeTraceIndex} onClose={() => setActiveTraceIndex(null)} onVisitProfile={handleVisitProfile} />}
      </div>
    </ErrorBoundary>
  );
};

export default App;
