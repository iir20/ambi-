
import { Post, UserProfileData, FeedMode } from '../types';
import { calculateHoldRatio } from './attention';

/**
 * Deterministic hash for stable randomness.
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * Sigmoid Squeeze: Smoothly penalizes low-quality viral spikes.
 * Returns a multiplier between 0.1 and 1.0.
 */
const calculateQualitySqueeze = (stats: any): number => {
  const { glances, holds } = stats;
  if (glances < 50) return 1.0; // Grace period for discovery

  const ratio = holds / glances;
  // Steep drop-off for ratios below 10% after the discovery phase
  return 1 / (1 + Math.exp(-20 * (ratio - 0.08)));
};

export interface PostWave {
  label: string;
  posts: Post[];
  description: string;
}

/**
 * The Resonance Wave Engine.
 * Converts flat posts into structured waves based on intensity and signal quality.
 */
export const rankAndGroupPosts = (
  posts: Post[], 
  currentUser: UserProfileData, 
  mode: FeedMode, 
  intensity: number
): PostWave[] => {
  const now = Date.now();
  const iFactor = intensity / 100;
  const todaySeed = Math.floor(now / (1000 * 60 * 60 * 24)); // Daily rotation
  const userSeed = hashString(currentUser.id + todaySeed);

  const scoredPosts = posts.map(post => {
    let score = 0;

    // 1. Base Resonance & Quality
    const holdRatio = calculateHoldRatio(post.attention);
    const qualitySqueeze = calculateQualitySqueeze(post.attention);
    score += (post.attention.resonanceScore * 0.5) * qualitySqueeze;

    // 2. Signal Affinity (Sanctuary Weight)
    const isSelf = post.authorId === currentUser.id;
    const signal = currentUser.signals.find(s => s.userId === post.authorId);
    const signalStrength = isSelf ? 100 : (signal?.strength || 0);
    
    // Intensity Slider Logic: 
    // Low intensity -> Weighted heavily toward existing signals (Sanctuary)
    // High intensity -> Weighted toward global resonance (Drift)
    const sanctuaryWeight = (1 - iFactor) * 5.0;
    const driftWeight = iFactor * 2.5;
    
    score += (signalStrength * sanctuaryWeight);
    score += (post.attention.resonanceScore * driftWeight);

    // 3. Temporal Stability (Decay)
    const hoursOld = (now - post.createdAt) / (1000 * 60 * 60);
    const freshnessBoost = Math.max(0, 100 - (hoursOld * 5));
    score += freshnessBoost;

    // 4. Deterministic Drift (Soft Randomness)
    // Ensures same sort for user today, but unique across the userbase
    const postSeed = hashString(post.id);
    const softRandom = ((userSeed ^ postSeed) % 100) / 10;
    score += softRandom;

    return { post, score, isNew: hoursOld < 0.5 };
  });

  // Sort by final resonance score
  const sorted = scoredPosts.sort((a, b) => b.score - a.score);

  // Categorize into Waves
  const waves: PostWave[] = [
    {
      label: "Wave 01: Synced",
      description: "Direct resonance from your inner circle.",
      posts: sorted.filter(p => p.score > 200).map(p => p.post).slice(0, 5)
    },
    {
      label: "Wave 02: Emergent",
      description: "New signals manifesting in the collective.",
      posts: sorted.filter(p => p.isNew && p.score <= 200).map(p => p.post)
    },
    {
      label: "Wave 03: The Drift",
      description: "Lingering echoes from the wider Stillverse.",
      posts: sorted.filter(p => !p.isNew && p.score <= 200).map(p => p.post)
    }
  ];

  return waves.filter(w => w.posts.length > 0);
};

export const getWaveHint = (post: Post, strength: number = 0): string => {
  const holdRatio = calculateHoldRatio(post.attention);
  if (post.authorId === 'me') return "Sanctuary Anchor";
  if (strength > 60) return "Sustained Sync";
  if (holdRatio > 0.6) return "Intentional Resonance";
  return "Converging Signal";
};
