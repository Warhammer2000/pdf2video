import * as fs from "node:fs";
import * as crypto from "node:crypto";
import { execSync } from "node:child_process";
import { ELEVENLABS_VOICES } from "./config.js";

export function getOpenAiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === "sk-your-key-here") {
    console.error("ERROR: OPENAI_API_KEY not set in .env file.");
    process.exit(1);
  }
  return key;
}

export function getElevenLabsKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key || key === "your-key-here") {
    console.error("ERROR: ELEVENLABS_API_KEY not set in .env file.");
    console.error("  Get your key at https://elevenlabs.io/settings/api-keys");
    process.exit(1);
  }
  return key;
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export function resolveElevenLabsVoiceId(voice: string): string {
  const known = ELEVENLABS_VOICES[voice.toLowerCase()];
  if (known) return known.id;
  return voice;
}

export function getAudioDuration(filePath: string): number {
  try {
    const command = `ffprobe -v quiet -print_format json -show_format "${filePath}"`;
    const result = execSync(command, { encoding: "utf-8" });
    const format = JSON.parse(result).format;
    return parseFloat(format.duration);
  } catch {
    console.warn(`  WARNING: ffprobe failed for ${filePath}, estimating from file size.`);
    const stats = fs.statSync(filePath);
    return stats.size / 16000;
  }
}