import * as fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

import type { BaseProps, BaseScriptItem } from "./lib/types.js";
import { LANGUAGE_NAMES, VOICE_PROFILES, ELEVENLABS_VOICES } from "./lib/config.js";
import { parseArgs } from "./lib/cli.js";
import { listElevenLabsVoices, listOpenAiVoices } from "./lib/voices.js";
import { extractText } from "./lib/pdf-extract.js";
import { generateNarrationScript } from "./lib/llm.js";
import { generateAllAudio } from "./lib/tts.js";
import { buildFinalProps } from "./lib/build-props.js";


async function main() {
  console.log("=== pdf2video TTS Pipeline ===\n");

  const rawArgs = process.argv.slice(2);
  if (rawArgs.includes("--list-voices")) {
    const providerIdx = rawArgs.indexOf("--provider");
    const prov = providerIdx >= 0 ? rawArgs[providerIdx + 1] : "openai";
    const genderIdx = rawArgs.indexOf("--gender");
    const filterGender = genderIdx >= 0 ? rawArgs[genderIdx + 1] : undefined;

    if (prov === "elevenlabs") {
      await listElevenLabsVoices(filterGender);
    } else {
      listOpenAiVoices(filterGender);
    }
    process.exit(0);
  }

  const config = parseArgs();

  console.log(`Configuration:`);
  console.log(`  Provider: ${config.provider.toUpperCase()}`);
  console.log(`  Language: ${LANGUAGE_NAMES[config.lang]} (${config.lang})`);
  if (config.provider === "openai") {
    console.log(`  Voice:    ${config.voice} (${VOICE_PROFILES[config.voice]?.character ?? "unknown"})`);
  } else {
    const known = ELEVENLABS_VOICES[config.voice.toLowerCase()];
    console.log(`  Voice:    ${config.voice} (${known?.character ?? "custom voice_id"})`);
  }
  console.log(`  Style:    ${config.style}`);

  if (!fs.existsSync(config.propsPath)) {
    console.error(`ERROR: Props file not found: ${config.propsPath}`);
    process.exit(1);
  }
  const baseProps: BaseProps = JSON.parse(fs.readFileSync(config.propsPath, "utf-8"));

  let scriptToProcess: BaseScriptItem[];

  if (baseProps.script && baseProps.script.length > 0) {
    scriptToProcess = baseProps.script;
  } else if (baseProps.highlights && baseProps.highlights.length > 0) {
    scriptToProcess = [{ type: "stack", duration: 60 }];
    baseProps.highlights.forEach((page, index) => {
      if (index === 0) {
        scriptToProcess.push({ type: "focus", page, duration: 120 });
      } else {
        scriptToProcess.push({ type: "switch", page, duration: 120 });
      }
    });
    scriptToProcess.push({ type: "stack", duration: 60 });
  } else {
    console.error("ERROR: Props must have either 'script' or 'highlights'.");
    process.exit(1);
  }

  const pageNumbers = scriptToProcess
    .filter((item) => item.page !== undefined)
    .map((item) => item.page!);
  const uniquePages = [...new Set(pageNumbers)];

  const extractedPages = await extractText(config.pdfPath, uniquePages);
  const documentTitle = baseProps.title ?? "Untitled Document";
  const narrationScenes = await generateNarrationScript(extractedPages, scriptToProcess, documentTitle, config.lang);
  const audioScenes = await generateAllAudio(narrationScenes, config);
  const finalProps = buildFinalProps(baseProps, audioScenes, scriptToProcess);

  fs.writeFileSync(config.outputPath, JSON.stringify(finalProps, null, 2), "utf-8");
  console.log(`\n✓ Output written to: ${config.outputPath}`);
  console.log(`\nNext step: npx remotion render PdfShowcase out/video.mp4 --props=${config.outputPath}`);
}

main().catch((error) => {
  console.error("\nFATAL ERROR:", error);
  process.exit(1);
});
