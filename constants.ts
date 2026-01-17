
import { Post, UserProfileData, Conversation, SocialMode, Story, TimeCapsule, AttentionStats, LifetimeAttention } from './types';

// Fix: Added missing confidenceScore to AttentionStats
const EMPTY_ATTENTION: AttentionStats = {
  glances: 0,
  holds: 0,
  returns: 0,
  deepInteractions: 0,
  resonanceScore: 0,
  confidenceScore: 0
};

const DEFAULT_LIFETIME: LifetimeAttention = {
  totalAttentionTime: 320,
  totalDeepHolds: 45,
  totalMutualSignals: 3,
  totalCapsulesSaved: 2,
  presenceEra: 'Ethereal Era',
  eraColor: '#C4E8D5'
};

export const generateGuestIdentity = (): UserProfileData => {
  const id = 'guest_' + Math.random().toString(36).substr(2, 9);
  return {
    id,
    isGuest: true,
    accountStatus: 'ephemeral',
    mapVisibility: 'visible',
    identity: {
      id,
      name: 'Echo Signal',
      handle: `@echo_${id.substr(0, 4)}`,
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${id}`,
      // Added missing avatarType to satisfy UserIdentity requirement
      avatarType: 'image',
      coverImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80',
      bio: 'Just drifting through the resonance.',
      // Fix: Added missing driftState and tone properties
      driftState: 'surface drifting',
      tone: 'ethereal',
      mood: {
        emoji: '☁️',
        text: 'Drifting',
        color: '#FFFFFF'
      },
      links: []
    },
    signals: [],
    notes: [],
    capsules: [],
    visitors: [],
    lifetimeAttention: { ...DEFAULT_LIFETIME },
    // Fix: Add missing visibility properties for guests
    visibility: {
      notes: 'private',
      artifacts: 'private',
      signals: 'private',
      visitors: 'private',
      attentionHints: 'private',
      signalEmission: 'hidden'
    }
  };
};

export const MOCK_USER: UserProfileData = {
  id: 'me',
  isGuest: false,
  accountStatus: 'anchored',
  mapVisibility: 'visible',
  identity: {
    id: 'me',
    name: 'Alex Rivera',
    handle: '@alex_riv',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    // Added missing avatarType to satisfy UserIdentity requirement
    avatarType: 'image',
    coverImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80',
    bio: 'Living slowly. Digital clay & pottery.',
    // Fix: Added missing driftState and tone properties
    driftState: 'anchoring',
    tone: 'grounded',
    mood: {
      emoji: '🌊',
      text: 'Floating in digital grain',
      color: '#D4C4E8'
    },
    links: [
      { id: '1', label: 'Portfolio', url: 'https://alex.studio' },
      { id: '2', label: 'Vibe', url: 'https://cosmic.vibe' }
    ]
  },
  signals: [
    // Fix: Added missing confidenceScore to UserSignal objects
    { userId: 'sasha', strength: 85, lastActive: Date.now() - 1000, type: 'MUTUAL', confidenceScore: 1.0 },
    { userId: 'jordan', strength: 30, lastActive: Date.now() - 50000, type: 'ACTIVE', confidenceScore: 1.0 }
  ],
  notes: [
    { id: 'n1', text: "The way the light hits the studio at 4 PM is everything.", timestamp: "2h ago", isPrivate: false },
  ],
  capsules: [],
  visitors: [],
  lifetimeAttention: {
    totalAttentionTime: 4500,
    totalDeepHolds: 128,
    totalMutualSignals: 12,
    totalCapsulesSaved: 8,
    presenceEra: 'Anchored Era',
    eraColor: '#E8D5C4'
  },
  // Fix: Add missing visibility properties for MOCK_USER
  visibility: {
    notes: 'public',
    artifacts: 'public',
    signals: 'private',
    visitors: 'public',
    attentionHints: 'visible',
    signalEmission: 'active'
  }
};

export const OTHER_USERS: Record<string, UserProfileData> = {
  'sasha': {
    id: 'sasha',
    isGuest: false,
    accountStatus: 'anchored',
    mapVisibility: 'visible',
    identity: {
      id: 'sasha',
      name: 'Sasha',
      handle: '@sasha_real',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
      // Added missing avatarType to satisfy UserIdentity requirement
      avatarType: 'image',
      bio: 'Charcoal explorer. Night owl.',
      // Fix: Added missing driftState and tone properties
      driftState: 'resonating',
      tone: 'luminous',
      links: [],
      mood: { emoji: '🌙', text: 'Night', color: '#D4C4E8' }
    },
    signals: [],
    notes: [],
    capsules: [],
    visitors: [],
    lifetimeAttention: {
      totalAttentionTime: 8200,
      totalDeepHolds: 340,
      totalMutualSignals: 24,
      totalCapsulesSaved: 15,
      presenceEra: 'Luminous Era',
      eraColor: '#FFFFFF'
    },
    // Fix: Add missing visibility properties for Sasha
    visibility: { 
      notes: 'public', 
      artifacts: 'public', 
      signals: 'public', 
      visitors: 'public',
      attentionHints: 'visible',
      signalEmission: 'active'
    }
  },
  'jordan': {
    id: 'jordan',
    isGuest: false,
    accountStatus: 'anchored',
    mapVisibility: 'visible',
    identity: {
      id: 'jordan',
      name: 'Jordan',
      handle: '@jordan_vibes',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      // Added missing avatarType to satisfy UserIdentity requirement
      avatarType: 'image',
      bio: 'Architect of quiet things.',
      // Fix: Added missing driftState and tone properties
      driftState: 'deeply rooted',
      tone: 'grounded',
      links: [],
      mood: { emoji: '📐', text: 'Focus', color: '#C4E8D5' }
    },
    signals: [],
    notes: [],
    capsules: [],
    visitors: [],
    lifetimeAttention: {
      totalAttentionTime: 1200,
      totalDeepHolds: 45,
      totalMutualSignals: 5,
      totalCapsulesSaved: 3,
      presenceEra: 'Lingering Era',
      eraColor: '#D4C4E8'
    },
    // Fix: Add missing visibility properties for Jordan
    visibility: { 
      notes: 'public', 
      artifacts: 'public', 
      signals: 'public', 
      visitors: 'public',
      attentionHints: 'visible',
      signalEmission: 'active'
    }
  }
};

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    authorName: 'Sasha',
    authorHandle: '@sasha_real',
    authorId: 'sasha',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    content: "Just spent four hours offline. The texture of charcoal is therapeutic.",
    timestamp: '12m ago',
    createdAt: Date.now() - 720000,
    reactions: { '🌿': 8, '✨': 14 },
    userReactions: {},
    comments: [],
    energyLevel: 'calm',
    attention: { ...EMPTY_ATTENTION, resonanceScore: 124, holds: 12, glances: 45 }
  },
  {
    id: '2',
    authorName: 'Jordan',
    authorHandle: '@jordan_vibes',
    authorId: 'jordan',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    content: "Building something that doesn't need to scale. Just needs to exist.",
    timestamp: '2h ago',
    createdAt: Date.now() - 7200000,
    reactions: { '🏗️': 3 },
    userReactions: {},
    comments: [],
    energyLevel: 'creative',
    media: 'https://images.unsplash.com/photo-1516339901600-2e1a62986347?w=800&q=80',
    attention: { ...EMPTY_ATTENTION, resonanceScore: 45, holds: 5, glances: 20 }
  }
];

export const INITIAL_TRACES: Story[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const MODE_CONFIGS = {
  [SocialMode.CONNECT]: { title: 'Connect', textColor: 'text-white' },
  [SocialMode.CREATE]: { title: 'Create', textColor: 'text-[#E8D5C4]' },
  [SocialMode.THINK]: { title: 'Think', textColor: 'text-[#C4E8D5]' },
};
