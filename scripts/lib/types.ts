export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface NarrationScene {
  pageNumber: number | null;
  narrationText: string;
  sceneType: "focus" | "stack" | "switch" | "fan";
}

export interface AudioScene extends NarrationScene {
  audioPath: string;
  durationInSeconds: number;
}

export interface BaseScriptItem {
  type: "focus" | "stack" | "switch" | "fan";
  page?: number;
  duration?: number;
  title?: string;
  audioSrc?: string;
}

export interface BaseProps {
  src: string;
  title?: string;
  subtitle?: string;
  pages?: number[];
  highlights?: number[];
  pageTitles?: Record<string, string>;
  pageDescriptions?: Record<string, string>;
  script?: BaseScriptItem[];
}

export type TtsProvider = "openai" | "elevenlabs";

export interface PipelineConfig {
  pdfPath: string;
  propsPath: string;
  outputPath: string;
  provider: TtsProvider;
  lang: string;
  voice: string;
  style: string;
}

export interface VoiceProfile {
  gender: string;
  character: string;
}

export interface ElevenLabsVoiceProfile extends VoiceProfile {
  id: string;
}

export interface ElevenLabsVoiceInfo {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}