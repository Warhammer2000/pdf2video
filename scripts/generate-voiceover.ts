import * as fs from "node:fs";
import * as path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY not found in .env");
  process.exit(1);
}

const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_PATH = path.resolve("out/voiceover-eddie-v1.mp3");

// Full voiceover script — minimal explicit breaks, let punctuation drive natural rhythm.
// Only truly dramatic beats get hard breaks.
const VOICEOVER_SCRIPT = `Your pipeline breaks. <break time="0.7s"/> Again. \
The errors pile up... and the pressure mounts. You know what comes next.

Copy the error into ChatGPT. Open twenty browser tabs. Message the on-call engineer. \
Three hours to find one root cause. Sound familiar?

What if your infrastructure... could explain itself? <break time="0.9s"/> Meet PipelineAI.

Just ask. PipelineAI's multi-agent system connects to your stack, traces the failure across services, \
and delivers a root-cause analysis — in seconds. Not hours. Seconds.

And it is secure — by design. A lightweight agent runs inside your infrastructure. \
Your credentials never leave your network. Ever.

Bring your own model — cloud or local. Upload your private documentation and let the AI learn your infrastructure. \
Deploy fully on-premise, air-gapped. Total control.

Proactive alerts with the root cause already identified. Before your team even wakes up.

Stop debugging. <break time="0.6s"/> Start building. <break time="0.9s"/> \
PipelineAI. AI-powered diagnostics for your data pipelines.`;

const VOICE_ID = "VsQmyFHffusQDewmHB5v"; // Eddie Stirling — British Corporate, Clear & Reliable

async function findHaleVoiceId(): Promise<string> {
  console.log(`Using voice: Eddie Stirling — British Corporate (${VOICE_ID})`);
  return VOICE_ID;
}

async function generateVoiceover(voiceId: string): Promise<void> {
  console.log("\nGenerating voiceover...");
  console.log(`  Model:  ${MODEL_ID}`);
  console.log(`  Output: ${OUTPUT_PATH}`);
  console.log(`  Script length: ${VOICEOVER_SCRIPT.length} chars\n`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY!,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: VOICEOVER_SCRIPT,
        model_id: MODEL_ID,
        language_code: "en",
        voice_settings: {
          stability: 0.40,       // Eric flows smoothly at this range
          similarity_boost: 0.75,
          style: 0.55,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs TTS error (${res.status}): ${body}`);
  }

  const buf = await res.arrayBuffer();
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, Buffer.from(buf));
  console.log(`✓ Saved to: ${OUTPUT_PATH}`);
  console.log(`  File size: ${(buf.byteLength / 1024).toFixed(1)} KB`);
}

async function main() {
  console.log("=== ElevenLabs Voiceover Generator ===\n");
  const voiceId = await findHaleVoiceId();
  await generateVoiceover(voiceId);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  process.exit(1);
});
