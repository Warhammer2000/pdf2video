<div align="center">

# 📄 pdf2video

**Transform PDF documents into engaging video presentations with smooth animations.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Fork](https://img.shields.io/badge/Fork-TTS_Enhanced-orange.svg)](https://github.com/JinsFavorites/pdf2video)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Remotion](https://img.shields.io/badge/Remotion-4.0-purple.svg)](https://www.remotion.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

[Features](#features) • [TTS Enhancement](#-tts-enhancement-fork-addition) • [Quick Start](#quick-start) • [Configuration](#configuration) • [Demo](#demo)

---

</div>

## Demo

https://github.com/user-attachments/assets/464622be-c855-42c6-bc9e-988350906d92

---

## 🔊 TTS Enhancement (Fork Addition)

This fork adds **automated Text-to-Speech narration** to PDF videos using AI-powered voice synthesis.

### Key Additions

- **Dual TTS Provider Support**
  - OpenAI TTS (gpt-4o-mini-tts) with 10 voice options
  - ElevenLabs Multilingual v2 with 12+ premium voices

- **Intelligent Script Generation**
  - LLM-powered narration from PDF content
  - Automatic scene timing based on audio duration
  - Multi-language support (English, Russian, Chinese, Japanese, and more)

- **Voice Customization**
  - Multiple voice styles (professional, friendly, academic, energetic, calm)
  - Gender-based voice selection
  - Voice caching for faster re-renders

### Example Videos with TTS

**ElevenLabs Voice (Roger - Authoritative):**


https://github.com/user-attachments/assets/500ae393-5ce6-4c6b-94e0-c5edab5139c4



**OpenAI Voice (Onyx - Deep & Professional):**


https://github.com/user-attachments/assets/4c3b4306-669a-40d4-89b6-540917d2f2e0



See [TTS Pipeline](#tts-pipeline) section below for detailed usage.

---

## Features

- **Multiple Scene Types**
  - `stack` - Card stack display with entrance animation
  - `focus` - Extract and zoom into a specific page with scroll support
  - `switch` - Smooth page transitions with slide animations
  - `fan` - Fan/wheel layout with rotation and focus effects

- **Smart Animations**
  - Natural card spread when focusing (like poker cards)
  - Breathing effect before scrolling
  - Bounce effect at scroll stop
  - Collapse animation for seamless scene transitions

- **Title System**
  - Main title + subtitle at opening
  - Persistent corner title during page viewing
  - Per-page custom titles

- **Bottom Info Bar**
  - Scene title with typing effect for descriptions
  - Progress indicator (1/5 format)
  - Customizable per-page descriptions

- **Ending Scene**
  - PDF stack moves to left with staggered cards
  - "Thank you" message with title on right
  - Animated decoration line

- **Dynamic Duration**
  - Auto-calculates video length from script configuration

- **Background Music**
  - Auto fade-in/fade-out (2 seconds each)
  - Duration matches video length automatically

- **High Quality Rendering**
  - Focus pages render at 2x resolution for sharp zoom

## Quick Start

### Installation

```bash
npm install
```

### Add Your Files

Place your PDF and background music in the `public/` folder:

```bash
# PDF document
cp /path/to/your/document.pdf public/sample.pdf

# Background music (optional)
cp /path/to/your/music.mp3 public/background.mp3
```

### Development Preview

```bash
npm run dev

# Preview with custom props
npx remotion preview --props=./props/example.json
```

### Render Video

```bash
npm run build

# Render with custom props
npx remotion render PdfShowcase out/example.mp4 --props=./props/example.json
```

## Configuration

### Basic Props

```tsx
{
  src: "/sample.pdf",           // PDF file path (in public folder)
  title: "Document Title",       // Main title
  subtitle: "Subtitle",          // Optional subtitle
  highlights: [1, 3, 5],        // Pages to showcase
  pageTitles: {                 // Per-page titles
    "1": "Cover",
    "3": "Key Points",
    "5": "Summary",
  },
  pageDescriptions: {           // Per-page descriptions (typing effect)
    "1": "Introduction to the document...",
    "3": "The core findings are...",
    "5": "In conclusion...",
  },
}
```

### Custom Script

Full control over the presentation flow:

```tsx
{
  src: "/sample.pdf",
  title: "Custom Flow",
  script: [
    { type: "stack", duration: 60 },            // Stack display
    { type: "focus", page: 1, duration: 120 },  // Focus page 1
    { type: "switch", page: 3, duration: 120 }, // Switch to page 3
    { type: "fan", page: 5, duration: 150 },    // Fan mode for page 5
    { type: "stack", duration: 120 },           // Ending stack
  ],
}
```

### Script Item Types

| Type | Description | Default Duration |
|------|-------------|------------------|
| `stack` | Card stack display | 60 frames |
| `focus` | Zoom into a page | 120 frames |
| `switch` | Slide transition | 120 frames |
| `fan` | Fan wheel layout | 150 frames |

## Example Configurations

### Standard Mode

```json
{
  "src": "/sample.pdf",
  "title": "Technical Report",
  "subtitle": "Key Insights",
  "highlights": [1, 3, 9, 14, 20],
  "pageTitles": {
    "1": "Abstract",
    "3": "Architecture",
    "9": "Training",
    "14": "Results",
    "20": "Conclusion"
  },
  "pageDescriptions": {
    "1": "Overview of the technical approach...",
    "3": "The system architecture consists of...",
    "9": "Training process involves...",
    "14": "Benchmark results show...",
    "20": "Key takeaways include..."
  }
}
```

### Fan Mode

```json
{
  "src": "/sample.pdf",
  "title": "Technical Report",
  "subtitle": "Key Insights",
  "script": [
    { "type": "stack", "duration": 60 },
    { "type": "fan", "page": 1, "duration": 150 },
    { "type": "fan", "page": 3, "duration": 150 },
    { "type": "fan", "page": 9, "duration": 150 },
    { "type": "stack", "duration": 120 }
  ]
}
```

## Claude Code Skill

This project includes a Claude Code skill (`.claude/skills/pdf-to-video/`) for automated PDF to video conversion.

### Setup

The skill is already in the correct location. If you want to use it globally, copy to your home directory:

```bash
cp -r .claude/skills/pdf-to-video ~/.claude/skills/
```

### Usage

Once installed, simply tell Claude:

> "帮我把这个 PDF 转成展示视频：/path/to/document.pdf"

Claude will:
1. Read and analyze the PDF content
2. Extract key points and page titles
3. Generate props.json configuration
4. Render the video automatically

## TTS Pipeline

The TTS (Text-to-Speech) pipeline automatically generates narration for your PDF videos.

### Prerequisites

Set up your API keys in `.env` file:

```bash
# For OpenAI TTS
OPENAI_API_KEY=your_openai_api_key_here

# For ElevenLabs TTS (optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### Basic Usage

```bash
# Generate video with default settings (OpenAI, onyx voice)
npm run tts -- --pdf public/sample.pdf --props props/example.json

# Use ElevenLabs with custom voice
npm run tts -- --pdf public/sample.pdf --props props/example.json \
  --provider elevenlabs --voice roger --lang en

# Customize voice style (OpenAI only)
npm run tts -- --pdf public/sample.pdf --props props/example.json \
  --provider openai --voice nova --style professional
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--pdf` | Path to PDF file | Required |
| `--props` | Path to props.json | Required |
| `--provider` | TTS provider: `openai` or `elevenlabs` | `openai` |
| `--voice` | Voice name (see list below) | `onyx` (OpenAI), `roger` (ElevenLabs) |
| `--style` | Voice style (OpenAI only): `professional`, `friendly`, `academic`, `energetic`, `calm` | `professional` |
| `--lang` | Language code: `en`, `ru`, `zh`, `ja`, `ko`, etc. | `en` |
| `--output` | Output path for generated props | `props/{basename}-tts.json` |

### List Available Voices

```bash
# List OpenAI voices
npm run tts -- --list-voices --provider openai

# List ElevenLabs voices
npm run tts -- --list-voices --provider elevenlabs

# Filter by gender
npm run tts -- --list-voices --provider openai --gender male
npm run tts -- --list-voices --provider elevenlabs --gender female
```

### OpenAI Voices

| Voice | Gender | Character |
|-------|--------|-----------|
| onyx | male | Authoritative and deep, great for presentations |
| echo | male | Smooth and steady, good for narration |
| fable | female | Expressive and engaging, British-accented |
| nova | female | Professional, clear and confident |
| shimmer | female | Bright and energetic |
| alloy | neutral | Balanced and clear, works for any content |

### ElevenLabs Voices

| Voice | Gender | Character |
|-------|--------|-----------|
| roger | male | Authoritative and clear, perfect for presentations |
| aria | female | Expressive and confident, great for narration |
| george | male | Warm British accent, storyteller quality |
| laura | female | Warm and natural, conversational tone |
| river | neutral | Non-binary, smooth and modern |

### How It Works

1. **PDF Text Extraction** - Extracts text from specified pages
2. **LLM Script Generation** - Uses GPT to create natural narration from PDF content
3. **TTS Audio Generation** - Generates speech audio via OpenAI or ElevenLabs
4. **Duration Adjustment** - Automatically adjusts scene durations to match audio length
5. **Props Update** - Creates final props.json with audio references

### Example Workflow

```bash
# 1. Create base props with highlights
cat > props/my-presentation.json << EOF
{
  "src": "/my-paper.pdf",
  "title": "Research Findings",
  "subtitle": "2024 Results",
  "highlights": [1, 5, 10, 15, 20]
}
EOF

# 2. Generate TTS narration
npm run tts -- --pdf public/my-paper.pdf --props props/my-presentation.json \
  --provider elevenlabs --voice aria --style professional --lang en

# 3. Render final video
npx remotion render PdfShowcase out/my-presentation.mp4 \
  --props=props/my-presentation-tts.json
```

### Cache System

Generated audio files are cached in `.cache/tts/` to avoid regenerating identical narration. The cache key includes:
- Narration text content
- Provider (openai/elevenlabs)
- Voice name
- Style (for OpenAI)

Delete `.cache/tts/` to force regeneration.

## Project Structure

```
├── props/                      # Props configuration files
│   └── example.json            # Example: props/glm45.json
├── public/                     # Static assets
│   ├── *.pdf                   # PDF source files
│   ├── background.mp3          # Background music
│   └── tts/                    # Generated TTS audio files (auto-created)
├── out/                        # Rendered video output
│   └── example.mp4             # Example: out/glm45.mp4
├── .cache/                     # TTS audio cache (auto-created)
│   └── tts/                    # Cached audio files
├── scripts/                    # TTS pipeline scripts
│   ├── tts-pipeline.ts         # Main TTS pipeline script
│   └── lib/                    # Pipeline modules
│       ├── cli.ts              # Command-line argument parser
│       ├── config.ts           # Voice profiles and configurations
│       ├── helpers.ts          # Utility functions
│       ├── llm.ts              # LLM-powered script generation
│       ├── pdf-extract.ts      # PDF text extraction
│       ├── tts.ts              # TTS API integration (OpenAI/ElevenLabs)
│       ├── types.ts            # TypeScript type definitions
│       ├── voices.ts           # Voice listing utilities
│       └── build-props.ts      # Final props builder with audio
└── src/
    ├── index.ts                # Entry point
    ├── Root.tsx                # Remotion root component
    └── templates/
        ├── Blank.tsx           # Blank template
        └── PdfShowcase/        # PDF showcase template
            ├── index.tsx       # Main component (with TTS support)
            ├── types.ts        # Type definitions (with audio types)
            ├── PdfPage.tsx     # PDF page renderer
            ├── StackScene.tsx  # Stack scene
            ├── FocusScene.tsx  # Focus scene
            ├── SwitchScene.tsx # Switch scene
            ├── FanScene.tsx    # Fan scene
            ├── GridBackground.tsx  # Animated grid background
            ├── PersistentTitle.tsx # Persistent title component
            ├── BottomInfo.tsx  # Bottom info bar
            └── EndingOverlay.tsx   # Ending overlay
```

## Video Specs

- Resolution: 1920 x 1080
- Frame Rate: 30 fps
- Duration: Dynamic (based on script)

## Tech Stack

### Core
- [Remotion](https://www.remotion.dev/) - React video framework
- [react-pdf](https://github.com/wojtekmaj/react-pdf) - PDF rendering
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) - PDF parsing
- [Zod](https://zod.dev/) - Schema validation

### TTS Pipeline
- [OpenAI API](https://platform.openai.com/docs/api-reference/audio/createSpeech) - GPT-4o-mini TTS & LLM
- [ElevenLabs API](https://elevenlabs.io/) - Multilingual TTS v2
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) - Audio duration detection
- [dotenv](https://github.com/motdotla/dotenv) - Environment variable management

---

<div align="center">

## Author

Created by **[@JinsFavorites](https://x.com/JinsFavorites)**

If you find this useful, give it a ⭐️!

[![Twitter Follow](https://img.shields.io/twitter/follow/JinsFavorites?style=social)](https://x.com/JinsFavorites)

</div>

## License

MIT
