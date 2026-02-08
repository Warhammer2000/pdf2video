import * as fs from "node:fs";
import * as path from "node:path";
import {
  OPENAI_API_URL,
  TTS_MODEL,
  TTS_CACHE_DIR,
  VOICE_PROFILES,
  ELEVENLABS_VOICES,
  ELEVENLABS_LANG_MAP,
  STYLE_INSTRUCTIONS,
} from "./config.js";
import { getOpenAiKey, getElevenLabsKey, resolveElevenLabsVoiceId, ensureDir, sha256, getAudioDuration } from "./helpers.js";
import type { PipelineConfig, NarrationScene, AudioScene } from "./types.js";

async function generateAudioOpenAI(
  narrationText: string,
  cachePath: string,
  voice: string,
  styleInstructions: string
): Promise<void> {
  const apiKey = getOpenAiKey();

  const response = await fetch(`${OPENAI_API_URL}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: TTS_MODEL,
      input: narrationText,
      voice,
      instructions: styleInstructions,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI TTS API error (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(cachePath, Buffer.from(arrayBuffer));
}

async function generateAudioElevenLabs(
  narrationText: string,
  cachePath: string,
  voice: string,
  lang: string
): Promise<void> {
  const apiKey = getElevenLabsKey();
  const voiceId = resolveElevenLabsVoiceId(voice);
  const languageCode = ELEVENLABS_LANG_MAP[lang] ?? lang;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: narrationText,
        model_id: "eleven_multilingual_v2",
        language_code: languageCode,
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.80,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ElevenLabs TTS API error (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(cachePath, Buffer.from(arrayBuffer));
}

async function generateAudioForScene(
  narrationText: string,
  cacheKey: string,
  config: PipelineConfig
): Promise<string> {
  const fileName = `${cacheKey}.mp3`;
  const cachePath = path.join(TTS_CACHE_DIR, fileName);

  if (fs.existsSync(cachePath)) {
    return cachePath;
  }

  if (config.provider === "elevenlabs") {
    await generateAudioElevenLabs(narrationText, cachePath, config.voice, config.lang);
  } else {
    const styleInstructions = STYLE_INSTRUCTIONS[config.style] ?? "";
    await generateAudioOpenAI(narrationText, cachePath, config.voice, styleInstructions);
  }

  return cachePath;
}

export async function generateAllAudio(
  scenes: NarrationScene[],
  config: PipelineConfig
): Promise<AudioScene[]> {
  const { provider, voice, style } = config;

  console.log(`\n[3/4] Generating speech via TTS...`);
  console.log(`  Provider: ${provider.toUpperCase()}`);

  if (provider === "openai") {
    const voiceProfile = VOICE_PROFILES[voice];
    console.log(`  Model: ${TTS_MODEL}`);
    console.log(`  Voice: ${voice} (${voiceProfile?.character ?? "unknown"})`);
  } else {
    const known = ELEVENLABS_VOICES[voice.toLowerCase()];
    console.log(`  Model: eleven_multilingual_v2`);
    console.log(`  Voice: ${voice} (${known?.character ?? "custom voice_id"})`);
    console.log(`  Language: ${config.lang}`);
  }
  console.log(`  Style: ${style}`);

  ensureDir(TTS_CACHE_DIR);

  const audioScenes: AudioScene[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    if (!scene.narrationText) {
      audioScenes.push({ ...scene, audioPath: "", durationInSeconds: 0 });
      console.log(`  Scene ${i + 1}/${scenes.length}: skipped (no narration)`);
      continue;
    }

    const cacheKey = sha256(scene.narrationText + provider + voice + style);
    const cached = fs.existsSync(path.join(TTS_CACHE_DIR, `${cacheKey}.mp3`));

    try {
      const audioPath = await generateAudioForScene(scene.narrationText, cacheKey, config);
      const durationInSeconds = getAudioDuration(audioPath);

      audioScenes.push({ ...scene, audioPath, durationInSeconds });

      console.log(
        `  Scene ${i + 1}/${scenes.length}: ${durationInSeconds.toFixed(1)}s` +
          (cached ? " (cached)" : " (generated)")
      );
    } catch (error) {
      console.error(`  ERROR generating audio for scene ${i + 1}:`, error);
      process.exit(1);
    }
  }

  return audioScenes;
}