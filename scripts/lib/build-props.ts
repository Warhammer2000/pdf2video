import * as fs from "node:fs";
import * as path from "node:path";
import { FPS, TRANSITION_BUFFER_FRAMES, PUBLIC_TTS_DIR } from "./config.js";
import { ensureDir } from "./helpers.js";
import type { BaseProps, BaseScriptItem, AudioScene } from "./types.js";

export function buildFinalProps(
  baseProps: BaseProps,
  audioScenes: AudioScene[],
  originalScript: BaseScriptItem[]
): BaseProps {
  console.log(`\n[4/4] Building final props...`);

  ensureDir(PUBLIC_TTS_DIR);

  const finalScript: BaseScriptItem[] = [];

  for (let i = 0; i < originalScript.length; i++) {
    const original = originalScript[i];
    const audio = audioScenes[i];
    const item: BaseScriptItem = { ...original };

    if (audio.audioPath && audio.durationInSeconds > 0) {
      const audioDurationFrames = Math.ceil(audio.durationInSeconds * FPS);
      const minDuration = original.duration ?? 90;
      item.duration = Math.max(minDuration, audioDurationFrames + TRANSITION_BUFFER_FRAMES);

      const fileName = path.basename(audio.audioPath);
      const publicPath = path.join(PUBLIC_TTS_DIR, fileName);
      if (!fs.existsSync(publicPath)) {
        fs.copyFileSync(audio.audioPath, publicPath);
      }
      item.audioSrc = `tts/${fileName}`;

      console.log(
        `  Scene ${i + 1}: duration ${original.duration ?? 90} → ${item.duration} frames ` +
          `(audio: ${audio.durationInSeconds.toFixed(1)}s)`
      );
    } else {
      console.log(`  Scene ${i + 1}: duration unchanged (${original.duration ?? 90} frames)`);
    }

    finalScript.push(item);
  }

  return {
    ...baseProps,
    script: finalScript,
  };
}