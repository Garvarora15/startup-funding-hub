# 🚀 Startup Funding Hub

> AI-powered Grant & Funding Finder for Indian Startups — powered by **IBM Granite on IBM Watsonx.ai**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![IBM Watsonx](https://img.shields.io/badge/IBM_Watsonx.ai-eu--de-052FAD?style=flat-square&logo=ibm&logoColor=white)
![IBM Granite](https://img.shields.io/badge/Model-granite--4--h--small-052FAD?style=flat-square&logo=ibm&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start-local)
- [Deploy to Vercel](#️-deploy-to-vercel)
- [Environment Variables](#-environment-variables)
- [IBM AI Details](#-ibm-ai-details)
- [Voice: TTS & STT Behavior](#-voice-tts--stt-behavior)
- [Orchestrate & Compliance Modules](#-orchestrate--compliance-modules)
- [Changelog](#-changelog)
- [License](#-license)

---

## 🌟 Overview

**Startup Funding Hub** is a full-stack AI-powered web application that helps Indian startups discover, evaluate, and apply for government grants and seed funding schemes. Built during the **IBM AICTE University Engagement Internship** (Problem Statement #18).

The app connects to **IBM Watsonx.ai** using the `ibm/granite-4-h-small` model to power a multilingual AI funding strategist, eligibility scoring engine, pitch generator, and proposal drafter — all in one place.

🔗 **Live Demo:** [startup-funding-zeta.vercel.app](https://startup-funding-zeta.vercel.app)
📦 **Repository:** [github.com/Garvarora15/startup-funding](https://github.com/Garvarora15/startup-funding)

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🤖 **AI Chat Agent** | IBM Granite-powered grant strategist — answers funding queries in 7 languages with real-time Watsonx.ai responses |
| 2 | 🔍 **Smart Grant Search** | Browse & filter 66+ live Indian startup grants (SISFS, BIRAC, DST, DPIIT, NASSCOM, and more) |
| 3 | 📊 **Match Score Engine** | Dynamic 0–100% eligibility scoring per grant based on your startup profile (sector, stage, location, funding) |
| 4 | 📝 **Proposal Generator** | AI-drafted 6-section professional grant proposals tailored per scheme with rendered markdown tables |
| 5 | 🎤 **Pitch Generator** | Elevator, one-pager, investor-hook, and Twitter pitches auto-generated in 7 languages |
| 6 | 🔊 **Text to Speech** | Grant details and AI responses read aloud via **Watson TTS** (primary); automatically falls back to the browser's **Web Speech API** if Watson TTS credentials are missing or the request fails, so audio always works |
| 7 | 🎙️ **Speech to Text** | Voice input in the chat agent via the browser's native **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`), language-matched to the active UI language |
| 8 | 🌐 **Multilingual UI** | Full interface in English, Hindi (Devanagari), Punjabi (Gurmukhi), Spanish, French, German, Japanese |
| 9 | ⭐ **Favorites** | Star grants to save them and filter your shortlist |
| 10 | 🔎 **Advanced Filters** | Filter by stage (Idea/Seed/Growth), sector, and funding limit |
| 11 | 🧭 **Watsonx Orchestrate (optional)** | Alternate backend path that can call a deployed IBM watsonx Orchestrate agent (separate from raw Watsonx.ai) instead of the direct Granite chat helper |
| 12 | 🛡️ **Compliance Guardrail** | Blocks the AI agent from attempting to auto-submit applications or handle credentials on external portals, and stamps AI-generated drafts with a "human validation required" notice |

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19 | UI framework |
| **Language** | TypeScript | 5 | Type safety |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS |
| **Build Tool** | Vite | 6 | Dev server & bundler |
| **AI Model** | IBM Granite | `granite-4-h-small` | Chat, proposals, pitches |
| **AI Platform** | IBM Watsonx.ai | eu-de Frankfurt | LLM inference endpoint |
| **Auth** | IBM IAM | — | Auto-refreshed token (5-min buffer) |
| **Backend** | Vercel Serverless Functions | — | Secure API proxy |
| **Deployment** | Vercel | — | CI/CD + Edge hosting |
| **TTS (primary)** | Watson Text to Speech | — | Multilingual voice synthesis |
| **TTS (fallback)** | Web Speech API | — | Browser-native, zero config |

---

## 📁 Project Structure

```
startup-funding/
├── api/                                  # Vercel Serverless Functions
│   ├── lib/
│   │   ├── watsonx.ts                    # IBM IAM auth + Granite chat helper (Watsonx.ai)
│   │   ├── orchestrate.ts                # Optional IBM watsonx Orchestrate agent client (separate IBM service)
│   │   └── compliance.ts                 # Legal-boundary guardrail — blocks auto-submission, stamps "human validation required"
│   ├── grants/
│   │   ├── index.ts                      # GET  /api/grants
│   │   └── calculate-match.ts            # POST /api/grants/calculate-match
│   ├── agent/
│   │   └── chat.ts                       # POST /api/agent/chat
│   ├── proposals/
│   │   └── generate.ts                   # POST /api/proposals/generate
│   ├── profile/
│   │   └── generate-pitch.ts             # POST /api/profile/generate-pitch
│   └── tts/
│       └── synthesize.ts                 # POST /api/tts/synthesize
├── src/
│   ├── components/
│   │   ├── ChatAssistant.tsx             # AI chat panel + TTS + speech input
│   │   ├── CollapsibleFAQ.tsx            # FAQ accordion
│   │   ├── Footer.tsx                    # Site footer
│   │   ├── GrantCard.tsx                 # Grant card with match score
│   │   ├── Navbar.tsx                    # Top nav + language switcher
│   │   ├── PolicyModal.tsx               # Privacy / terms modal
│   │   ├── ProposalGenerator.tsx         # Draft tab with markdown table rendering
│   │   └── StartupProfileForm.tsx        # Left panel profile form
│   ├── data/
│   │   └── grants.ts                     # 66+ curated Indian startup grants
│   ├── locales/
│   │   └── translations.ts               # 7-language UI translation map
│   ├── types.ts                          # Shared TypeScript interfaces
│   ├── main.tsx                          # React entry point
│   └── index.css                         # Global styles
├── .env.example                          # Environment variable template
├── vercel.json                           # Vercel routing config
├── vite.config.ts                        # Vite build config
├── tsconfig.json                         # TypeScript config
└── package.json
```

---

## 🚀 Quick Start (Local)

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Vercel CLI (`npm i -g vercel`) — required to run serverless API routes locally
- IBM Cloud account with Watsonx.ai project

```bash
# 1. Clone the repo
git clone https://github.com/Garvarova15/startup-funding.git
cd startup-funding

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your IBM_API_KEY and IBM_PROJECT_ID

# 4. Start local dev server (with API routes)
vercel dev
```

> **Tip:** Use `npm run dev` for frontend-only (no API routes). Use `vercel dev` for the full stack including serverless functions.

---

## ☁️ Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → **Import repository**
3. Add the following environment variables in the Vercel dashboard:

| Variable | Required | Value |
|----------|----------|-------|
| `IBM_API_KEY` | ✅ Yes | Your IBM Cloud API key |
| `IBM_PROJECT_ID` | ✅ Yes | Your Watsonx.ai Project ID |
| `WATSON_TTS_API_KEY` | ⚡ Optional | Watson Text to Speech key |
| `WATSON_TTS_URL` | ⚡ Optional | Watson TTS service URL |

4. Click **Deploy** ✅

---

## 🔑 Environment Variables

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `IBM_API_KEY` | ✅ Required | IBM Cloud API key for IAM authentication | [cloud.ibm.com/iam/apikeys](https://cloud.ibm.com/iam/apikeys) |
| `IBM_PROJECT_ID` | ✅ Required | Watsonx.ai Project ID (eu-de region) | [eu-de.dataplatform.cloud.ibm.com](https://eu-de.dataplatform.cloud.ibm.com/projects) |
| `WATSON_TTS_API_KEY` | ⚡ Optional | Watson Text to Speech API key | IBM Cloud catalog → Watson TTS |
| `WATSON_TTS_URL` | ⚡ Optional | Watson TTS service endpoint URL | IBM Cloud resource page |

> **Note:** If Watson TTS credentials are not provided, the app automatically falls back to the browser's built-in **Web Speech API** — speech always works regardless.

---

## 🤖 IBM AI Details

| Property | Value |
|----------|-------|
| **Platform** | IBM Watsonx.ai |
| **Region** | eu-de (Frankfurt) |
| **Model ID** | `ibm/granite-4-h-small` |
| **Endpoint** | `https://eu-de.ml.cloud.ibm.com/ml/v1/text/chat?version=2024-05-31` |
| **Auth** | IBM IAM token — auto-refreshed, cached with 5-min safety buffer |
| **Offline Resilience** | Local heuristic fallback activates automatically when Watsonx.ai is unavailable |
| **Languages Supported** | English, Hindi, Punjabi, Spanish, French, German, Japanese |

---

## 🔊 Voice: TTS & STT Behavior

**Text to Speech (`/api/tts/synthesize`)**
1. The serverless function checks for `WATSON_TTS_API_KEY` and `WATSON_TTS_URL`.
2. If both are present, it calls Watson Text to Speech with a language-matched voice (e.g. `hi-IN_AditiVoice` for Hindi/Punjabi, `es-ES_LauraV3Voice` for Spanish, `fr-FR_ReneeV3Voice` for French, `de-DE_BirgitV3Voice` for German, `ja-JP_EmiV3Voice` for Japanese, `en-US_AllisonV3Voice` otherwise) and returns base64 MP3 audio.
3. If the credentials are missing, the Watson API call fails, or any error is thrown, the function responds with `{ success: false, fallback: true }` instead of erroring out.
4. The frontend (`ChatAssistant.tsx`) checks that response: on `fallback: true` (or any network/audio playback error), it automatically switches to the browser's native **Web Speech API** (`window.speechSynthesis`) using the same language mapping — so the "🔊 Listen" feature never breaks even without IBM TTS credentials configured.

**Speech to Text (mic input)**
- Voice input is handled entirely client-side via the browser's native `SpeechRecognition` / `webkitSpeechRecognition` API — there is no IBM STT service involved.
- The recognition language is set to match the active UI language before listening starts.
- If the browser doesn't support speech recognition, the mic button alerts the user rather than failing silently.

---

## 🧭 Orchestrate & Compliance Modules

| Module | Purpose |
|--------|---------|
| `api/lib/orchestrate.ts` | An optional, alternate integration path that calls a **deployed IBM watsonx Orchestrate agent** (a separate IBM Cloud service from raw Watsonx.ai) over its chat/completions endpoint, using its own IAM auth/token caching. Useful if the agent logic is built in the Orchestrate Agent Builder console instead of being hardcoded in `watsonx.ts`. Requires `ORCHESTRATE_SERVICE_URL`, `ORCHESTRATE_AGENT_ID`, and `ORCHESTRATE_IAM_APIKEY`. |
| `api/lib/compliance.ts` | A legal-boundary guardrail addressing Problem Statement #18's requirement that the agent "respects legal boundaries and submission rules." It (1) detects and blocks any request asking the agent to act on the user's behalf on an external portal — auto-submitting forms, auto-logging in, entering credentials, bypassing CAPTCHA/verification — and (2) stamps AI-generated proposals/eligibility outputs with a clear "human validation required" notice, since such drafts are expected to need human review before submission. |

---



### v2.1.0 — June 2026
- 📝 **Docs:** README Project Structure now includes `api/lib/orchestrate.ts` (optional watsonx Orchestrate agent client) and `api/lib/compliance.ts` (submission-boundary guardrail)
- 📝 **Docs:** Added explicit Speech-to-Text feature entry and a full TTS/STT fallback behavior section
- 📝 **Docs:** Added dedicated section documenting the Orchestrate and Compliance backend modules

### v2.0.0 — June 2026
- ✅ **Fix:** TTS voice pre-loading on app mount — eliminates ~60s startup lag
- ✅ **Fix:** TTS language mapping extended to all 7 languages (Spanish `es-ES`, French `fr-FR`, German `de-DE`, Japanese `ja-JP` were previously falling back to English)
- ✅ **Fix:** Proposal Generator now renders markdown pipe tables as proper HTML tables with styled headers and alternating rows
- ✅ **Improvement:** `parseMarkdownToHtml` rewritten with a two-pass block-grouping approach for reliable table detection
- ✅ **Improvement:** README updated with full markdown tables, changelog, and table of contents

### v1.0.0 — June 2026
- 🚀 Initial release — IBM AICTE internship submission
- AI Chat Agent powered by IBM Granite via Watsonx.ai
- 30+ Indian startup grant schemes with eligibility matching
- Multilingual UI (7 languages) with Watson TTS
- Proposal Generator and Pitch Generator
- Deployed on Vercel

---

## 📜 License

MIT — Built as part of the **IBM AICTE University Engagement Internship**.

**Problem Statement #18** — AI Grant and Funding Finder for Startups

---

<div align="center">
  Made with ❤️ using IBM Granite + Watsonx.ai
</div>
