import * as path from "node:path";
import type { PipelineConfig, TtsProvider } from "./types.js";
import {
  VOICE_PROFILES,
  ELEVENLABS_VOICES,
  OPENAI_GENDER_MAP,
  ELEVENLABS_GENDER_MAP,
  LANGUAGE_NAMES,
  STYLE_INSTRUCTIONS,
} from "./config.js";


export function printUsage(): void {
  console.log(`
Usage:
  npx tsx scripts/tts-pipeline.ts --pdf <path> --props <path> --output <path> [options]

Required:
  --pdf      Path to PDF file
  --props    Path to base props JSON
  --output   Path for output props JSON with audio

Provider:
  --provider     TTS engine: openai | elevenlabs (default: openai)

Discovery:
  --list-voices  Fetch and display all available voices from the API
                 Combine with --provider and --gender to filter

Voice options:
  --lang     Language: ${Object.keys(LANGUAGE_NAMES).join(", ")} (default: ru)
  --voice    Voice name (see lists below, or pass ElevenLabs voice_id directly)
  --gender   Auto-pick voice: male, female, neutral (default: female)
  --style    Style: ${Object.keys(STYLE_INSTRUCTIONS).join(", ")} (default: professional)

OpenAI voices (--provider openai):
${Object.entries(VOICE_PROFILES)
  .map(([name, p]) => `  ${name.padEnd(10)} [${p.gender.padEnd(7)}] ${p.character}`)
  .join("\n")}

ElevenLabs voices (--provider elevenlabs):
${Object.entries(ELEVENLABS_VOICES)
  .map(([name, p]) => `  ${name.padEnd(10)} [${p.gender.padEnd(7)}] ${p.character}`)
  .join("\n")}
  (or pass any voice_id directly: --voice JBFqnCBsd6RMkjVDRZzb)

Examples:
  # OpenAI: Russian female professional (default)
  npx tsx scripts/tts-pipeline.ts --pdf doc.pdf --props p.json --output out.json

  # ElevenLabs: Russian female, natural voice
  npx tsx scripts/tts-pipeline.ts --pdf doc.pdf --props p.json --output out.json \\
    --provider elevenlabs --voice aria --style professional

  # ElevenLabs: male narrator, calm style
  npx tsx scripts/tts-pipeline.ts --pdf doc.pdf --props p.json --output out.json \\
    --provider elevenlabs --gender male --style calm

  # OpenAI: English male energetic
  npx tsx scripts/tts-pipeline.ts --pdf doc.pdf --props p.json --output out.json \\
    --lang en --gender male --style energetic

  # List all ElevenLabs voices
  npx tsx scripts/tts-pipeline.ts --provider elevenlabs --list-voices

  # List only female ElevenLabs voices
  npx tsx scripts/tts-pipeline.ts --provider elevenlabs --list-voices --gender female

  # List OpenAI voices
  npx tsx scripts/tts-pipeline.ts --list-voices
`);
}

export function parseArgs(): PipelineConfig {
  const args = process.argv.slice(2);
  let pdfPath = "";
  let propsPath = "";
  let outputPath = "";
  let provider: TtsProvider = "openai";
  let lang = "ru";
  let voice = "";
  let gender = "female";
  let style = "professional";

  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--pdf":      pdfPath = args[++i] ?? ""; break;
      case "--props":    propsPath = args[++i] ?? ""; break;
      case "--output":   outputPath = args[++i] ?? ""; break;
      case "--provider": provider = (args[++i] ?? "openai") as TtsProvider; break;
      case "--lang":     lang = args[++i] ?? "ru"; break;
      case "--voice":    voice = args[++i] ?? ""; break;
      case "--gender":   gender = args[++i] ?? "female"; break;
      case "--style":    style = args[++i] ?? "professional"; break;
    }
  }

  if (!pdfPath || !propsPath || !outputPath) {
    printUsage();
    process.exit(1);
  }

  if (provider !== "openai" && provider !== "elevenlabs") {
    console.error(`ERROR: Unknown provider "${provider}". Available: openai, elevenlabs`);
    process.exit(1);
  }

  if (!LANGUAGE_NAMES[lang]) {
    console.error(`ERROR: Unknown language "${lang}". Available: ${Object.keys(LANGUAGE_NAMES).join(", ")}`);
    process.exit(1);
  }

  if (!STYLE_INSTRUCTIONS[style]) {
    console.error(`ERROR: Unknown style "${style}". Available: ${Object.keys(STYLE_INSTRUCTIONS).join(", ")}`);
    process.exit(1);
  }

  if (provider === "openai") {
    if (voice) {
      if (!VOICE_PROFILES[voice]) {
        console.error(`ERROR: Unknown OpenAI voice "${voice}". Available: ${Object.keys(VOICE_PROFILES).join(", ")}`);
        process.exit(1);
      }
    } else {
      voice = OPENAI_GENDER_MAP[gender] ?? OPENAI_GENDER_MAP["female"];
    }
  } else {
    if (voice) {
      if (!ELEVENLABS_VOICES[voice.toLowerCase()] && voice.length < 15) {
        console.error(
          `ERROR: Unknown ElevenLabs voice "${voice}". Available names: ${Object.keys(ELEVENLABS_VOICES).join(", ")}\n` +
          `       Or pass a raw voice_id (e.g. --voice JBFqnCBsd6RMkjVDRZzb)`
        );
        process.exit(1);
      }
    } else {
      voice = ELEVENLABS_GENDER_MAP[gender] ?? ELEVENLABS_GENDER_MAP["female"];
    }
  }

  return {
    pdfPath: path.resolve(pdfPath),
    propsPath: path.resolve(propsPath),
    outputPath: path.resolve(outputPath),
    provider,
    lang,
    voice,
    style,
  };
}