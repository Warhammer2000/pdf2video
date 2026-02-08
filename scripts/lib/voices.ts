import { VOICE_PROFILES, ELEVENLABS_VOICES } from "./config.js";
import { getElevenLabsKey } from "./helpers.js";
import type { ElevenLabsVoiceInfo } from "./types.js";

export async function listElevenLabsVoices(filterGender?: string): Promise<void> {
  const apiKey = getElevenLabsKey();

  console.log("Fetching voices from ElevenLabs API...\n");

  let voices: ElevenLabsVoiceInfo[] = [];
  let fromApi = false;

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
    });

    if (response.ok) {
      const data = (await response.json()) as { voices: ElevenLabsVoiceInfo[] };
      voices = data.voices;
      fromApi = true;
    } else {
      console.log("  (API requires 'Voices: Read' permission on your key.)");
      console.log("  Showing built-in voice list instead.\n");
    }
  } catch {
    console.log("  (Could not reach ElevenLabs API. Showing built-in list.)\n");
  }

  if (!fromApi) {
    let entries = Object.entries(ELEVENLABS_VOICES);
    if (filterGender) {
      entries = entries.filter(([, v]) => v.gender === filterGender.toLowerCase());
    }

    console.log(`Built-in ElevenLabs voices (${entries.length}):\n`);
    for (const [name, info] of entries) {
      console.log(`  ${name.padEnd(12)} ${info.id}  [${info.gender}] ${info.character}`);
    }
    console.log("\n  Tip: Add 'Voices: Read' permission to your API key to see ALL voices.");
    console.log("       Or pass any voice_id directly: --voice <voice_id>\n");
    console.log("Usage:");
    console.log(`  npx tsx scripts/tts-pipeline.ts --provider elevenlabs --voice aria ...`);
    return;
  }

  if (filterGender) {
    const g = filterGender.toLowerCase();
    voices = voices.filter((v) => {
      const vGender = (v.labels?.gender ?? "").toLowerCase();
      return vGender === g;
    });
  }

  if (voices.length === 0) {
    console.log("No voices found" + (filterGender ? ` for gender "${filterGender}"` : "") + ".");
    return;
  }

  const grouped: Record<string, ElevenLabsVoiceInfo[]> = {};
  for (const v of voices) {
    const cat = v.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(v);
  }

  const totalVoices = voices.length;
  console.log(`Found ${totalVoices} voices${filterGender ? ` (gender: ${filterGender})` : ""}:\n`);

  for (const [category, catVoices] of Object.entries(grouped)) {
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
    console.log(`--- ${catLabel} (${catVoices.length}) ---`);

    for (const v of catVoices) {
      const gender = v.labels?.gender ?? "?";
      const age = v.labels?.age ?? "";
      const accent = v.labels?.accent ?? "";
      const useCase = v.labels?.use_case ?? v.labels?.["use case"] ?? "";
      const description = v.labels?.description ?? "";

      const tags = [gender, age, accent, useCase, description]
        .filter(Boolean)
        .join(", ");

      console.log(`  ${v.name.padEnd(20)} ${v.voice_id}  [${tags}]`);
    }
    console.log("");
  }

  console.log("Usage:");
  console.log(`  npx tsx scripts/tts-pipeline.ts --provider elevenlabs --voice <name_or_id> ...`);
}

export function listOpenAiVoices(filterGender?: string): void {
  console.log("\nOpenAI available voices:\n");

  let entries = Object.entries(VOICE_PROFILES);
  if (filterGender) {
    entries = entries.filter(([, p]) => p.gender === filterGender.toLowerCase());
  }

  console.log(`Found ${entries.length} voices${filterGender ? ` (gender: ${filterGender})` : ""}:\n`);

  for (const [name, profile] of entries) {
    console.log(`  ${name.padEnd(10)} [${profile.gender.padEnd(7)}] ${profile.character}`);
  }

  console.log("\nUsage example:");
  console.log(`  npx tsx scripts/tts-pipeline.ts --voice nova ...`);
}