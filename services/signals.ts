
import { UserSignal, SignalType } from '../types';

const SIGNAL_WEIGHTS: Record<string, number> = {
  VIEW: 1,
  SAVE: 2,
  REACT: 3,
  COMMENT: 5,
  MESSAGE: 8
};

/**
 * Enhanced Distance Formula for the Nexus.
 * Uses a power curve to ensure clear separation between high and low resonance signals.
 */
export const getDistance = (strength: number, maxRadius: number = 350): number => {
  const innerBound = 60; // Minimum distance from center
  const normalizedStrength = Math.min(100, Math.max(0, strength)) / 100;
  // Exponential curve: strength closer to 100 pulls much tighter to center
  const distanceFactor = Math.pow(1 - normalizedStrength, 1.2); 
  return innerBound + (distanceFactor * (maxRadius - innerBound));
};

export const calculateSignalStrength = (currentSignals: UserSignal[], userId: string, action: string): UserSignal[] => {
  const now = Date.now();
  const weight = SIGNAL_WEIGHTS[action] || 1;
  
  const existingIndex = currentSignals.findIndex(s => s.userId === userId);
  
  if (existingIndex > -1) {
    const updated = [...currentSignals];
    updated[existingIndex] = {
      ...updated[existingIndex],
      strength: Math.min(100, updated[existingIndex].strength + weight),
      lastActive: now,
      type: (updated[existingIndex].strength + weight > 20 ? 'MUTUAL' : 'ACTIVE') as SignalType,
      confidenceScore: 1.0
    };
    return updated;
  }
  
  return [...currentSignals, {
    userId,
    strength: weight,
    lastActive: now,
    type: 'SOFT',
    confidenceScore: 1.0
  }];
};

/**
 * Natural Logarithmic Decay
 * Signals decay slower over time to simulate long-term digital presence.
 */
export const applyDecay = (signals: UserSignal[]): UserSignal[] => {
  const now = Date.now();
  const MS_IN_DAY = 24 * 60 * 60 * 1000;
  
  return signals.map(s => {
    const daysSince = (now - s.lastActive) / MS_IN_DAY;
    if (daysSince < 0.5) return s; 
    
    const decayFactor = 1 / (1 + Math.log(daysSince + 1) * 0.5);
    const newStrength = s.strength * decayFactor;
    
    return {
      ...s,
      strength: Math.max(0, newStrength),
      type: (newStrength > 20 ? 'MUTUAL' : newStrength > 5 ? 'ACTIVE' : 'SOFT') as SignalType
    };
  }).filter(s => s.strength > 0.1); 
};
