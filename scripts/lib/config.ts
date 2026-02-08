
import * as path from "node:path";
import type { VoiceProfile, ElevenLabsVoiceProfile } from "./types.js";

export const FPS = 30;
export const TRANSITION_BUFFER_FRAMES = 30;
export const TTS_CACHE_DIR = path.resolve(".cache/tts");
export const PUBLIC_TTS_DIR = path.resolve("public/tts");
export const OPENAI_API_URL = "https://api.openai.com/v1";
export const LLM_MODEL = "gpt-4.1-mini";
export const TTS_MODEL = "gpt-4o-mini-tts";

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  alloy:   { gender: "neutral",  character: "Balanced and clear, works for any content" },
  ash:     { gender: "male",     character: "Warm, confident male voice" },
  ballad:  { gender: "male",     character: "Deep, resonant, storyteller quality" },
  coral:   { gender: "female",   character: "Warm and conversational female voice" },
  echo:    { gender: "male",     character: "Smooth and steady, good for narration" },
  fable:   { gender: "female",   character: "Expressive and engaging, British-accented" },
  nova:    { gender: "female",   character: "Professional, clear and confident female voice" },
  onyx:    { gender: "male",     character: "Authoritative and deep, great for presentations" },
  sage:    { gender: "female",   character: "Calm and wise, professorial tone" },
  shimmer: { gender: "female",   character: "Bright and energetic female voice" },
};

export const OPENAI_GENDER_MAP: Record<string, string> = {
  male: "onyx",
  female: "nova",
  neutral: "alloy",
};

export const ELEVENLABS_VOICES: Record<string, ElevenLabsVoiceProfile> = {
  aria:     { id: "9BWtsMINqrJLrRacOk9x", gender: "female",  character: "Expressive and confident, great for narration" },
  roger:    { id: "CwhRBWXzGAHq8TQ4Fs17", gender: "male",    character: "Authoritative and clear, perfect for presentations" },
  sarah:    { id: "EXAVITQu4vr4xnSDxMaL", gender: "female",  character: "Soft and professional, calm delivery" },
  laura:    { id: "FGY2WhTYpPnrIDTdsKH5", gender: "female",  character: "Warm and natural, conversational tone" },
  charlie:  { id: "IKne3meq5aSn9XLyUdCD", gender: "male",    character: "Casual and friendly, approachable" },
  george:   { id: "JBFqnCBsd6RMkjVDRZzb", gender: "male",    character: "Warm British accent, storyteller quality" },
  river:    { id: "SAz9YHcvj6GT2YYXdXww", gender: "neutral", character: "Non-binary, smooth and modern" },
  chris:    { id: "iP95p4xoKVk53GoZ742B", gender: "male",    character: "Casual and clear, good for tutorials" },
  jessica:  { id: "cgSgspJ2msm6clMCkdW9", gender: "female",  character: "Expressive and engaging, lively delivery" },
  eric:     { id: "cjVigY5qzO86Huf0OWal", gender: "male",    character: "Deep and steady, professional tone" },
  lily:     { id: "pFZP5JQG7iQjIQuC4Bku", gender: "female",  character: "Warm British accent, gentle and clear" },
  bill:     { id: "pqHfZKP75CvOlQylNhV4", gender: "male",    character: "Deep and authoritative, documentary narrator" },
};

export const ELEVENLABS_GENDER_MAP: Record<string, string> = {
  male: "roger",
  female: "aria",
  neutral: "river",
};

export const ELEVENLABS_LANG_MAP: Record<string, string> = {
  en: "en", ru: "ru", de: "de", fr: "fr",
  es: "es", zh: "zh", ja: "ja", ko: "ko",
};

export const LANGUAGE_NAMES: Record<string, string> = {
  ru: "Russian",  en: "English",  ko: "Korean",     zh: "Chinese",
  de: "German",   fr: "French",   es: "Spanish",    ja: "Japanese",
  tr: "Turkish",  pt: "Portuguese", it: "Italian",  ar: "Arabic",
  hi: "Hindi",
};

export const STYLE_INSTRUCTIONS: Record<string, string> = {
  professional:
    "Speak in a clear, professional, and confident tone. " +
    "Maintain a steady, measured pace. Articulate every word distinctly. " +
    "Sound like a seasoned presenter delivering an important business presentation.",
  friendly:
    "Speak in a warm, friendly, and approachable tone. " +
    "Sound like you're explaining something interesting to a colleague over coffee. " +
    "Be natural and conversational, with light enthusiasm.",
  academic:
    "Speak in a thoughtful, measured, academic tone. " +
    "Sound like an experienced professor giving a lecture. " +
    "Be precise and authoritative, but not dry — maintain engagement.",
  energetic:
    "Speak with energy and enthusiasm! " +
    "Sound excited about the content. Vary your intonation to keep the listener engaged. " +
    "Think TED talk energy — passionate but clear.",
  calm:
    "Speak in a calm, soothing, and reassuring tone. " +
    "Take your time. Let pauses breathe. " +
    "Sound like a meditation guide explaining a complex topic simply.",
};