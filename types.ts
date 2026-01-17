
export enum AppView {
  FEED = 'FEED',
  NEXUS = 'NEXUS',
  MESSAGES = 'MESSAGES',
  PROFILE = 'PROFILE',
  ONBOARDING = 'ONBOARDING',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
  STILLNESS = 'STILLNESS'
}

export enum SocialMode {
  CONNECT = 'CONNECT',
  CREATE = 'CREATE',
  THINK = 'THINK'
}

export type FeedMode = 'SIGNAL' | 'DRIFT' | 'CAPSULE';
export type SignalType = 'SOFT' | 'ACTIVE' | 'MUTUAL';
export type DriftState = 'anchoring' | 'surface drifting' | 'deeply rooted' | 'shrouded' | 'resonating';
export type PresenceTone = 'ethereal' | 'grounded' | 'luminous' | 'shadow';

export interface UserSignal {
  userId: string;
  strength: number;
  lastActive: number;
  type: SignalType;
  confidenceScore: number; 
}

export interface AttentionStats {
  glances: number;
  holds: number;
  returns: number;
  deepInteractions: number;
  resonanceScore: number;
  confidenceScore: number; 
  lastReturnTimestamp?: number;
}

export interface LifetimeAttention {
  totalAttentionTime: number; 
  totalDeepHolds: number;
  totalMutualSignals: number;
  totalCapsulesSaved: number;
  presenceEra: string;
  eraColor: string;
}

export interface PresenceInsight {
  id: string;
  title: string;
  message: string;
  type: 'fatigue' | 'resonance' | 'timing' | 'growth';
  intensity: 'soft' | 'deep';
}

export interface CreatorAnalytics {
  dailyPulse: { time: number; intensity: number }[];
  holdPowerByCategory: Record<string, number>;
  fatigueIndex: number; 
  peakMoments: string[];
  insights: PresenceInsight[];
}

export type ConversationCategory = 'casual' | 'emotional' | 'professional' | 'anonymous';
export type MessageStatus = 'pending' | 'delivered' | 'read' | 'shrouded' | 'failed';

export interface Message {
  id: string;
  text?: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  status: MessageStatus;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file' | 'pdf' | 'zip';
  fileName?: string;
  fileSize?: string;
  resonanceGated?: boolean;
}

export interface Conversation {
  id: string;
  category: ConversationCategory;
  mode: SocialMode;
  participants: UserIdentity[];
  unreadCount: number;
  messages: Message[];
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  adminIds?: string[];
  moderatorIds?: string[];
  restrictedMessaging?: boolean;
  signalAccepted?: boolean;
}

export interface UserLink {
  id: string;
  label: string;
  url: string;
}

export interface Visitor {
  id: string;
  name: string;
  avatar: string;
  timestamp: string;
}

export type AvatarType = 'image' | 'gradient' | 'ai';

export interface UserIdentity {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  avatarType: AvatarType;
  avatarConfig?: string; 
  coverImage?: string;
  bio: string;
  driftState: DriftState;
  tone: PresenceTone;
  mood?: {
    emoji: string;
    text: string;
    color?: string;
  };
  links: UserLink[];
}

export type CapsuleType = 'memory' | 'goal' | 'letter' | 'collective';

export interface TimeCapsule {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  media?: string;
  type: CapsuleType;
  createdAt: number;
  unlockAt: number;
  privacy: 'private' | 'friends' | 'public';
  contributorIds?: string[];
  artifacts?: { authorName: string; content: string; media?: string }[];
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  media?: string;
  type: 'text' | 'image' | 'mixed';
  createdAt: number;
  duration: number;
  moodColor: string;
  isPrivate: boolean;
  attention: AttentionStats;
}

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface PersonalNote {
  id: string;
  text: string;
  timestamp: string;
  isPrivate: boolean;
}

export interface UserProfileData {
  id: string;
  identity: UserIdentity;
  signals: UserSignal[];
  notes: PersonalNote[]; 
  capsules: TimeCapsule[]; 
  visitors: Visitor[];
  lifetimeAttention: LifetimeAttention;
  analytics?: CreatorAnalytics;
  isGuest: boolean;
  accountStatus: 'ephemeral' | 'partial' | 'anchored';
  mapVisibility: 'visible' | 'anonymous' | 'hidden';
  visibility: {
    notes: 'private' | 'public' | 'synced'; 
    artifacts: 'private' | 'public'; 
    signals: 'private' | 'public';
    visitors: 'private' | 'public';
    attentionHints: 'visible' | 'private';
    signalEmission: 'active' | 'hidden';
  };
}

export interface AccountRegistry {
  activeId: string;
  accounts: Record<string, UserProfileData>;
}

export interface Post {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  authorId: string;
  content: string;
  timestamp: string;
  createdAt: number;
  reactions: Record<string, number>;
  userReactions: Record<string, boolean>;
  comments: Comment[];
  media?: string;
  isMemory?: boolean;
  resonanceReason?: string;
  energyLevel: 'calm' | 'creative' | 'loud' | 'deep';
  attention: AttentionStats;
}

export interface AppState {
  currentView: AppView;
  intensity: number;
  textSize: number; 
  highContrast: boolean;
  hasCompletedOnboarding: boolean;
  selectedChatId?: string;
  feedMode: FeedMode;
  showTransparencyHints: boolean;
  aiSettings: {
    enabled: boolean;
    insightPrivacy: 'redacted' | 'full';
    generationIntensity: 'conservative' | 'diverse';
    lastCalled: number;
  };
}
