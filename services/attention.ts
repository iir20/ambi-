
import { AttentionStats } from '../types';

/**
 * Validates a signal event to filter out artificial engagement.
 */
export const validateSignal = (
  type: 'GLANCE' | 'HOLD' | 'RETURN', 
  stats: AttentionStats
): { isValid: boolean; confidence: number } => {
  const now = Date.now();
  
  // Anti-Abuse: Rapid Return Filtering (minimum 2 min between returns)
  if (type === 'RETURN' && stats.lastReturnTimestamp && (now - stats.lastReturnTimestamp < 120000)) {
    return { isValid: false, confidence: 0 };
  }

  // Anti-Abuse: Velocity check (If glances > 100 with 0 holds, signal is suspect)
  if (type === 'GLANCE' && stats.glances > 50 && stats.holds === 0) {
    return { isValid: true, confidence: 0.2 };
  }

  return { isValid: true, confidence: 1.0 };
};

/**
 * Calculates a resonance score based on attention modalities.
 * Uses confidence as a multiplier.
 */
export const calculateResonanceScore = (stats: AttentionStats): number => {
  const base = (
    stats.glances * 0.5 + 
    stats.holds * 10 +    
    stats.returns * 15 +  
    stats.deepInteractions * 30 
  );
  return base * (stats.confidenceScore || 1);
};

export const calculateHoldRatio = (stats: AttentionStats): number => {
  if (stats.glances === 0) return 0;
  return stats.holds / stats.glances;
};

export const calculateFatigueRate = (stats: AttentionStats): number => {
  const ratio = calculateHoldRatio(stats);
  return Math.max(0, 1.0 - ratio);
};

export const getAttentionLabel = (score: number, isMutual: boolean, stats?: AttentionStats): string => {
  if (stats) {
    const fatigue = calculateFatigueRate(stats);
    if (fatigue > 0.8 && stats.glances > 50) return "Shallow Drift";
    if (calculateHoldRatio(stats) > 0.6) return "High Intent";
  }

  if (isMutual && score > 50) return "Synchronicity";
  if (score > 100) return "Deep Resonance";
  if (score > 40) return "Steady Echo";
  if (score > 10) return "Active Signal";
  if (score > 0) return "Quiet Attention";
  return "Fresh Drift";
};

export const getGlowIntensity = (score: number): number => {
  return Math.min(0.15, (score / 200) * 0.15);
};

export const getPulseRate = (score: number): string => {
  if (score > 100) return '8s';
  if (score > 40) return '5s';
  return '3s';
};
