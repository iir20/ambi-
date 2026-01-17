
import { LifetimeAttention } from '../types';

export const getPresenceLabel = (stats: LifetimeAttention): string => {
  const { totalAttentionTime, totalDeepHolds } = stats;
  
  if (totalDeepHolds > 500) return "a presence that anchors the drift";
  if (totalAttentionTime > 10000) return "your signals have become a landscape";
  if (totalDeepHolds > 100) return "people linger in your resonance";
  if (totalAttentionTime > 3600) return "a steady frequency in a noisy world";
  return "a freshly manifested essence";
};

export const getImpactLabel = (stats: LifetimeAttention): string => {
  const { totalCapsulesSaved, totalMutualSignals } = stats;
  
  if (totalCapsulesSaved > 50) return "leaving ripples that outlast the moment";
  if (totalMutualSignals > 20) return "deeply woven into the collective fabric";
  if (totalCapsulesSaved > 5) return "your artifacts are cherished anchors";
  return "building a quiet, intentional impact";
};

export const getEraName = (stats: LifetimeAttention): string => {
  // Balanced score: Time (weighted) + Deep Holds (weighted) + Mutuals (heavy boost)
  const score = (stats.totalAttentionTime / 60) + (stats.totalDeepHolds * 2) + (stats.totalMutualSignals * 10);
  
  if (score > 2000) return "Luminous Era";
  if (score > 800) return "Anchored Era";
  if (score > 200) return "Lingering Era";
  return "Ethereal Era";
};

export const getEraColor = (era: string): string => {
  switch (era) {
    case "Luminous Era": return "#FFFFFF";
    case "Anchored Era": return "#E8D5C4";
    case "Lingering Era": return "#D4C4E8";
    default: return "#C4E8D5";
  }
};
