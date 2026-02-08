import { OPENAI_API_URL, LLM_MODEL, LANGUAGE_NAMES } from "./config.js";
import { getOpenAiKey } from "./helpers.js";
import type { ExtractedPage, NarrationScene, BaseScriptItem } from "./types.js";

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = getOpenAiKey();

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI LLM API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as any;
  return data.choices[0].message.content.trim();
}

export async function generateNarrationScript(
  extractedPages: ExtractedPage[],
  script: BaseScriptItem[],
  documentTitle: string,
  lang: string
): Promise<NarrationScene[]> {
  const langName = LANGUAGE_NAMES[lang] ?? "English";
  console.log(`\n[2/4] Generating narration script via LLM (${LLM_MODEL}, language: ${langName})...`);

  const systemPrompt =
    `You are a professional narrator for video presentations. ` +
    `You MUST respond ONLY in ${langName}. Every single word must be in ${langName}. ` +
    `Do NOT mix languages. Do NOT use English terms unless they are commonly used ` +
    `as-is in ${langName} (like "AI", "HCI", "UX"). ` +
    `Respond ONLY with the narration text. No markdown, no quotes, no commentary.`;

  const scenes: NarrationScene[] = [];

  for (let i = 0; i < script.length; i++) {
    const item = script[i];
    const isOpeningStack = i === 0 && item.type === "stack";
    const isEndingStack = i === script.length - 1 && item.type === "stack";

    if (isEndingStack) {
      scenes.push({ pageNumber: null, narrationText: "", sceneType: "stack" });
      console.log(`  Scene ${i + 1}/${script.length}: ending-stack — skipped (no narration)`);
      continue;
    }

    let userPrompt: string;

    if (isOpeningStack) {
      userPrompt =
        `Create a short, engaging opening line (1-2 sentences, max 200 characters) ` +
        `for a video presentation of a document titled "${documentTitle}". ` +
        `Speak in first person. Go straight to the point. Do not say "welcome" or "hello". ` +
        `IMPORTANT: Write in ${langName} only.`;
    } else {
      const pageNum = item.page!;
      const pageText = extractedPages.find((p) => p.pageNumber === pageNum)?.text ?? "";

      if (pageText.length === 0) {
        console.warn(`  Scene ${i + 1}/${script.length}: page ${pageNum} — no text, using title`);
        userPrompt =
          `Create a brief narration (1-2 sentences, max 200 characters) for a slide titled ` +
          `"${item.title || `Page ${pageNum}`}" in a document about "${documentTitle}". ` +
          `IMPORTANT: Write in ${langName} only.`;
      } else {
        userPrompt =
          `Create narrator text for a video presentation based on the following slide. ` +
          `Requirements: 2-3 sentences, no more than 400 characters; speak in first person; ` +
          `do not reference the slide ("on this slide", "here we see"); go straight to the content. ` +
          `IMPORTANT: Write in ${langName} only.\n` +
          `Slide text:\n---\n${pageText.slice(0, 3000)}\n---`;
      }
    }

    try {
      const narrationText = await callLLM(systemPrompt, userPrompt);
      scenes.push({
        pageNumber: item.page ?? null,
        narrationText,
        sceneType: item.type,
      });
      console.log(
        `  Scene ${i + 1}/${script.length}: ${item.type}` +
          (item.page ? ` (page ${item.page})` : "") +
          ` — ${narrationText.length} chars`
      );
    } catch (error) {
      console.error(`  ERROR generating narration for scene ${i + 1}:`, error);
      process.exit(1);
    }
  }

  return scenes;
}