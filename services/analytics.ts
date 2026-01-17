
import { Post, CreatorAnalytics, PresenceInsight } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AMBI COPY GUIDELINES (Encoded in Prompts):
 * - Tone: Poetic Brevity, Lower-case, Intentional.
 * - Vocabulary: Resonance, Drift, Signal, Sync, Stillness, Essence, Artifact.
 * - Avoid: "Engagement", "Viral", "Followers", "Metrics", "Analytics".
 */

const redactSensitiveData = (posts: Post[]): string => {
  return posts.map(p => {
    const type = p.media ? 'Visual Artifact' : 'Text Signal';
    const energy = p.energyLevel;
    const holdRatio = (p.attention.holds / (p.attention.glances || 1)).toFixed(2);
    const returnDensity = p.attention.returns;
    return `[Sig: ${type} | Energy: ${energy} | HoldRatio: ${holdRatio} | Returns: ${returnDensity} | DeepInt: ${p.attention.deepInteractions}]`;
  }).join('\n');
};

export const generateAggregatedAnalytics = (posts: Post[]): Partial<CreatorAnalytics> => {
  const dailyPulse = posts.map(p => ({
    time: p.createdAt,
    intensity: p.attention.resonanceScore
  })).sort((a, b) => a.time - b.time);

  const totalGlances = posts.reduce((acc, p) => acc + p.attention.glances, 0);
  const totalHolds = posts.reduce((acc, p) => acc + p.attention.holds, 0);
  const totalInteractions = posts.reduce((acc, p) => acc + p.attention.deepInteractions, 0);
  
  // Fatigue Index calculation: High glances with low hold density indicates "noise" broadcast.
  // 0 = Fresh/Deep, 100 = Noisy/Fatigued
  const holdDensity = totalGlances > 0 ? (totalHolds / totalGlances) : 1;
  const interactionDensity = totalHolds > 0 ? (totalInteractions / totalHolds) : 1;
  
  // Penalty for high frequency but shallow resonance
  const rawFatigue = (1 - (holdDensity * 0.7 + interactionDensity * 0.3)) * 100;
  const fatigueIndex = Math.min(100, Math.max(0, rawFatigue));

  return {
    dailyPulse,
    fatigueIndex,
    peakMoments: ["Twilight Sync", "Deep-Night Resonance"]
  };
};

export const getStillnessPrompts = async (posts: Post[]): Promise<string[]> => {
  const dataset = redactSensitiveData(posts.slice(0, 5));
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `DATA OBSERVED:\n${dataset}\n\nGENERATE REFLECTIONS:`,
      config: {
        systemInstruction: "You are the Ambi Stillness Guide. Based on the creator's recent signal patterns, generate 3 short, lower-case reflection prompts. Use the Ambi vocabulary (drift, stillness, intent). Never mention metrics directly. Example: 'does this signal need to be anchored?'",
        temperature: 0.6,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return ["what remains unsaid?", "seek the space between signals.", "observe the drift before casting."];
  }
};

export const getApertureInsights = async (posts: Post[], privacyMode: 'redacted' | 'full' = 'redacted'): Promise<PresenceInsight[]> => {
  const dataset = privacyMode === 'redacted' ? redactSensitiveData(posts) : posts.map(p => p.content).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `PATTERN RECOGNITION:\n${dataset}`,
      config: {
        systemInstruction: "You are the Ambi Oracle. Analyze resonance patterns. Do not mention users or numbers. Focus on the soul of the drift. Return 3 insights as JSON.",
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              message: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['fatigue', 'resonance', 'timing', 'growth'] },
              intensity: { type: Type.STRING, enum: ['soft', 'deep'] }
            },
            required: ["title", "message", "type", "intensity"]
          }
        }
      }
    });
    return JSON.parse(response.text).map((item: any, idx: number) => ({ ...item, id: `insight-${idx}` }));
  } catch (e) {
    return [{ id: 'err', title: 'Steady Drift', message: 'Your signals are moving at a natural pace through the collective.', type: 'resonance', intensity: 'soft' }];
  }
};
