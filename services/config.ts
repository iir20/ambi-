
export const PRODUCTION_CONFIG = {
  VERSION: '2.5.2',
  FEATURES: {
    AI_ENABLED: true,
    NEXUS_ANIMATIONS: true,
    HIGH_FIDELITY_GRAIN: true,
    OFFLINE_RESILIENCE: true,
    PRESENCE_MODES: true
  },
  CACHE: {
    HINT_TTL: 1000 * 60 * 60, // 1 hour for AI hints
    IDENTITY_TTL: 1000 * 60 * 60 * 24 // 24 hours for identity drafts
  },
  PERFORMANCE: {
    NEXUS_MAX_NODES: 100,
    ANIMATION_SPEED_MULTIPLIER: 1.0,
    BLUR_INTENSITY_LIMIT: 40, // px
    GRAIN_OPACITY: 0.04
  },
  MONITORING: {
    TARGET_FPS: 60,
    API_ERROR_THRESHOLD: 0.05, // 5%
    HOLD_RATIO_TARGET: 0.15 // 15% intent
  }
};

/**
 * Deployment Checklist:
 * 1. [ ] Verify Gemini API Key quota limits
 * 2. [ ] Audit CSS will-change properties for Nexus
 * 3. [ ] Confirm LocalStorage hydration safety
 * 4. [ ] Test Guest-to-Anchor conversion flow
 * 5. [ ] Verify low-power mode graceful degradation
 */

export const isLowPowerMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const memory = (navigator as any).deviceMemory || 4;
  return isMobile && memory < 4;
};
