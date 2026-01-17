
import { GoogleGenAI, Type } from "@google/genai";
import { PRODUCTION_CONFIG } from "./config";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Local cache to reduce API overhead
const responseCache: Record<string, { data: any; timestamp: number }> = {};

const getFromCache = (key: string, ttl: number) => {
  const entry = responseCache[key];
  if (entry && Date.now() - entry.timestamp < ttl) return entry.data;
  return null;
};

const setCache = (key: string, data: any) => {
  responseCache[key] = { data, timestamp: Date.now() };
};

export const generateIdentityFromVibe = async (vibe: string, seed?: string) => {
  const cacheKey = `id_${vibe}_${seed || 'root'}`;
  const cached = getFromCache(cacheKey, PRODUCTION_CONFIG.CACHE.IDENTITY_TTL);
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `MANIFEST IDENTITY: Vibe "${vibe}", Seed "${seed || 'initial'}"`,
      config: {
        systemInstruction: "You are the Ambi Identity Manifestor. Generate a poetic, minimalist identity in JSON.",
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            handle: { type: Type.STRING },
            bio: { type: Type.STRING },
            color: { type: Type.STRING }
          },
          required: ["name", "handle", "bio", "color"]
        }
      }
    });
    const parsed = JSON.parse(response.text);
    setCache(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.warn("AI Identity Failure - Fallback Engaged", error);
    return {
      name: "Ephemeral Signal",
      handle: "@drift_" + Math.random().toString(36).substring(7),
      bio: "A presence manifested through local intuition.",
      color: "#FFFFFF"
    };
  }
};

export const explainPostRelevance = async (postContent: string, mode: string, intensity: number, logicReason?: string) => {
  if (!PRODUCTION_CONFIG.FEATURES.AI_ENABLED) return "surfaced via temporal resonance.";

  const cacheKey = `hint_${postContent.substring(0, 20)}_${logicReason}`;
  const cached = getFromCache(cacheKey, PRODUCTION_CONFIG.CACHE.HINT_TTL);
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `TRANSPARENCY HINT for: ${logicReason}`,
      config: {
        systemInstruction: "Short poetic lowercase sentence explaining relevance. Under 6 words.",
        temperature: 0.1,
      }
    });
    const text = response.text.toLowerCase();
    setCache(cacheKey, text);
    return text;
  } catch (error) {
    return "surfaced via temporal resonance.";
  }
};
