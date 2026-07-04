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
- [Main Path vs. Fallback](#-main-path-vs-fallback--every-ai-dependent-feature)
- [Orchestrate & Compliance Modules](#-orchestrate--compliance-modules)
- [Changelog](#-changelog)
- [License](#-license)

---

## 🌟 Overview

**Startup Funding Hub** is a full-stack AI-powered web application that helps Indian startups discover, evaluate, and apply for government grants and seed funding schemes. Built during the **IBM AICTE University Engagement Internship** (Problem Statement #18).

The app connects to **IBM Watsonx.ai** using the `ibm/granite-4-h-small` model to power a multilingual AI funding strategist, eligibility scoring engine, pitch generator, and proposal drafter — all in one place.

🔗 **Live Demo:** [startup-funding-hub.vercel.app](https://startup-funding-hub.vercel.app)
📦 **Repository:** [github.com/Garvarora15/startup-funding-hub](https://github.com/Garvarora15/startup-funding-hub)

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🤖 **AI Chat Agent** | IBM Granite-powered grant strategist — answers funding queries in 7 languages with real-time Watsonx.ai responses |
| 2 | 🔍 **Smart Grant Search** | Browse & filter 84 live Indian startup grants (SISFS, BIRAC, DST, DPIIT, NASSCOM, and more) |
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
startup-funding-hub/
├── api/                                   # Vercel Serverless Functions (Node runtime)
│   ├── lib/
│   │   ├── watsonx.ts                     # ★ MAIN AI CLIENT — IBM IAM auth (token cached, 5-min refresh buffer)
│   │   │                                  #   + callGraniteWithRetry() → IBM Granite (granite-4-h-small) on Watsonx.ai
│   │   ├── orchestrate.ts                 # OPTIONAL alternate path — calls a deployed IBM watsonx Orchestrate
│   │   │                                  #   agent instead of raw Watsonx.ai chat, with its own IAM token cache
│   │   └── compliance.ts                  # Guardrail — blocks auto-submission requests, stamps AI drafts with
│   │                                       #   a "human validation required" notice
│   ├── grants/
│   │   ├── index.ts                       # GET  /api/grants               — search/filter the static grants DB
│   │   └── calculate-match.ts             # POST /api/grants/calculate-match — 0–100% eligibility scoring
│   ├── agent/
│   │   └── chat.ts                        # POST /api/agent/chat            — MAIN: Watsonx.ai Granite chat
│   │                                       #   FALLBACK: generateLocalChatFallback() heuristic reply if
│   │                                       #   Watsonx.ai (and Orchestrate, if enabled) both fail/error
│   ├── proposals/
│   │   └── generate.ts                    # POST /api/proposals/generate    — MAIN: Watsonx.ai 9-section draft
│   │                                       #   FALLBACK: generateLocalFallback() static templated proposal
│   ├── profile/
│   │   └── generate-pitch.ts              # POST /api/profile/generate-pitch — MAIN: Watsonx.ai pitch copy
│   │                                       #   FALLBACK: getSmartFallbackPitch() per-domain templated pitch
│   │                                       #   (always in English, with a translated "AI unavailable" notice
│   │                                       #   appended for the other 6 languages)
│   └── tts/
│       └── synthesize.ts                  # POST /api/tts/synthesize        — MAIN: Watson Text to Speech
│                                           #   FALLBACK: returns { success:false, fallback:true } if TTS
│                                           #   credentials are missing/invalid or the call errors — frontend
│                                           #   then switches to the browser's Web Speech API automatically
├── src/
│   ├── components/
│   │   ├── ChatAssistant.tsx              # AI chat panel — calls /api/agent/chat; handles TTS playback
│   │   │                                  #   (with syncing state) + mic input (browser SpeechRecognition,
│   │   │                                  #   no IBM STT service involved — 100% client-side, no fallback needed)
│   │   ├── CollapsibleFAQ.tsx             # FAQ accordion (static content)
│   │   ├── Footer.tsx                     # Site footer + policy links
│   │   ├── GrantCard.tsx                  # Grant card — match score, TTS "read aloud", favorite toggle
│   │   ├── Navbar.tsx                     # Top nav + language switcher (7 languages)
│   │   ├── PolicyModal.tsx                # Privacy / cookies / terms modal
│   │   ├── ProposalGenerator.tsx          # Draft tab — calls /api/proposals/generate, renders markdown tables
│   │   └── StartupProfileForm.tsx         # Left panel profile form (feeds match scoring + pitch generation)
│   ├── data/
│   │   └── grants.ts                      # 84 curated Indian startup grants (static — the single source of
│   │                                       #   truth for /api/grants*; no external scraping or DB at runtime)
│   ├── locales/
│   │   └── translations.ts                # 7-language UI translation map (English, Hindi, Punjabi, Spanish,
│   │                                       #   French, German, Japanese)
│   ├── App.tsx                            # Top-level state: profile, grants, match scores, active tab, favorites
│   ├── types.ts                           # Shared TypeScript interfaces (Grant, StartupProfile, ChatMessage…)
│   ├── main.tsx                           # React entry point (ReactDOM root)
│   └── index.css                          # Global styles + Tailwind v4 "Granite & Sprout" design tokens
├── .env.example                           # Environment variable template
├── vercel.json                            # Vercel routing config (SPA rewrite + API routes)
├── vite.config.ts                         # Vite build config
├── tsconfig.json                          # TypeScript config (strict mode)
└── package.json
```

### 🧩 How the pieces connect (data flow)

```
StartupProfileForm ──▶ App.tsx (profile state)
                          │
                          ├──▶ /api/grants/calculate-match   ──▶ match % + reasons  ──▶ GrantCard
                          ├──▶ /api/grants (q/stage/domain)  ──▶ filtered grant list ──▶ Browse tab
                          │
ChatAssistant ────────────┼──▶ /api/agent/chat               ──▶ watsonx.ts (Granite) ──▶ [orchestrate.ts, optional]
                          │                                       ⤷ on failure: local heuristic reply
                          │
ProposalGenerator ────────┼──▶ /api/proposals/generate       ──▶ watsonx.ts (Granite, 9-section draft)
                          │                                       ⤷ on failure: static templated draft
                          │                                   ──▶ compliance.ts stamps "human validation required"
                          │
StartupProfileForm (pitch)┴──▶ /api/profile/generate-pitch    ──▶ watsonx.ts (Granite pitch copy)
                                                                    ⤷ on failure: per-domain templated pitch

GrantCard / ChatAssistant ───▶ /api/tts/synthesize            ──▶ Watson Text to Speech
                                                                    ⤷ on failure: browser Web Speech API
```

---

## 🚀 Quick Start (Local)

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Vercel CLI (`npm i -g vercel`) — required to run serverless API routes locally
- IBM Cloud account with a Watsonx.ai project (only needed for live AI responses — the app runs and is fully clickable without it, using the fallback content described throughout this README)

```bash
# 1. Clone the repo
git clone https://github.com/Garvarora15/startup-funding-hub.git
cd startup-funding-hub

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your IBM_API_KEY and IBM_PROJECT_ID
# (WATSON_TTS_API_KEY / WATSON_TTS_URL and the ORCHESTRATE_* vars are optional)

# 4. Start the local dev server
vercel dev
```

Then open **http://localhost:3000** (Vercel CLI's default port — it will print the actual port in the terminal).

> **Frontend-only mode:** `npm run dev` starts just the Vite dev server (fast, hot-reload) but **without** the `/api/*` serverless routes — grant matching, chat, proposals, pitches, and TTS will all silently use their offline fallbacks or fail to fetch. Use `vercel dev` whenever you need the real backend, even without IBM credentials configured (the API routes still run locally and gracefully fall back to local heuristics).

> **First time using Vercel CLI?** Running `vercel dev` in a fresh clone will prompt you to log in and link the folder to a Vercel project — you can select "no" / create a new project if you don't want to link it to your actual deployment.

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

## 🔁 Main Path vs. Fallback — Every AI-Dependent Feature

Every feature that depends on an external service degrades gracefully instead of breaking the UI. This table is the single source of truth for what runs when, and why:

| Feature | Main path | Triggers fallback when… | Fallback behavior |
|---|---|---|---|
| **Chat Agent** (`/api/agent/chat`) | IBM Granite (`granite-4-h-small`) via Watsonx.ai, optionally routed through watsonx Orchestrate first if `ORCHESTRATE_*` vars are set | Watsonx.ai request errors/times out, or (if enabled) Orchestrate call fails | `generateLocalChatFallback()` — a local heuristic reply built from keyword-matching the user's message against `src/data/grants.ts`, still returned as `success: true` so the chat UI never shows a hard error |
| **Grant Proposal** (`/api/proposals/generate`) | Watsonx.ai Granite drafts a 9-section proposal, tone-steered by the selected Proposal Tone (Formal/Technical/Persuasive/Concise) | Watsonx.ai request errors/times out | `generateLocalFallback()` — a fully templated 9-section proposal using the same section headings, filled in with the startup's profile fields |
| **Pitch Generator** (`/api/profile/generate-pitch`) | Watsonx.ai Granite generates pitch copy in the requested format & language | Watsonx.ai request errors/times out | `getSmartFallbackPitch()` — a per-domain templated pitch (English only); for non-English languages, a translated one-line notice ("this pitch is shown in English because the AI service is temporarily unavailable") is appended |
| **Grant Matching** (`/api/grants/calculate-match`) | Deterministic scoring logic (stage/domain/location/funding rules) — **not** AI-dependent, so there is no fallback path; it always runs the same way | — | — |
| **Text to Speech** (`/api/tts/synthesize`) | Watson Text to Speech, voice matched to the active UI language (`en-US_AllisonV3Voice`, `hi-IN_AditiVoice`, etc.) | `WATSON_TTS_API_KEY` / `WATSON_TTS_URL` are missing, the Watson call errors, or Punjabi is selected (no real Watson Punjabi voice exists yet) | Frontend receives `{ success:false, fallback:true }` and switches to the browser's native **Web Speech API** (`window.speechSynthesis`), using the same language mapping. The Listen button shows a distinct **Syncing…** state (spinner) while this handoff happens, so the wait is never mistaken for the button being unresponsive |
| **Speech to Text** (mic input in Chat Agent) | Browser-native `SpeechRecognition` / `webkitSpeechRecognition` — there is no IBM STT service in this app at all | Browser doesn't support the Web Speech API | The mic button shows an alert telling the user their browser isn't supported; there's no secondary fallback since it's already the "default" path |
| **Watsonx Orchestrate** (`api/lib/orchestrate.ts`) | Off by default. If `ORCHESTRATE_SERVICE_URL`, `ORCHESTRATE_AGENT_ID`, and `ORCHESTRATE_IAM_APIKEY` are all set, `chat.ts` tries the Orchestrate agent **before** falling through to the raw Granite/Watsonx.ai path | Orchestrate call errors, or the env vars aren't set at all | Falls through to the normal Watsonx.ai Granite chat path described above (which itself falls through to the local heuristic reply if that also fails) |

---

## 🧭 Orchestrate & Compliance Modules

| Module | Purpose |
|--------|---------|
| `api/lib/orchestrate.ts` | An optional, alternate integration path that calls a **deployed IBM watsonx Orchestrate agent** (a separate IBM Cloud service from raw Watsonx.ai) over its chat/completions endpoint, using its own IAM auth/token caching. Useful if the agent logic is built in the Orchestrate Agent Builder console instead of being hardcoded in `watsonx.ts`. Requires `ORCHESTRATE_SERVICE_URL`, `ORCHESTRATE_AGENT_ID`, and `ORCHESTRATE_IAM_APIKEY`. |
| `api/lib/compliance.ts` | A legal-boundary guardrail addressing Problem Statement #18's requirement that the agent "respects legal boundaries and submission rules." It (1) detects and blocks any request asking the agent to act on the user's behalf on an external portal — auto-submitting forms, auto-logging in, entering credentials, bypassing CAPTCHA/verification — and (2) stamps AI-generated proposals/eligibility outputs with a clear "human validation required" notice, since such drafts are expected to need human review before submission. |

---

## 📜 Changelog

### v2.1.0 — July 2026 (Voice & Data Expansion)
- 🎙️ **Feature:** Chat agent voice input now has a proper 3-state cycle — **Listen → Syncing → Stop** — with a matching **Syncing…** state added to the TTS "Listen" playback button too, so both the mic and audio playback show a clear loading state instead of looking unresponsive. Fully localized across all 7 languages.
- 🚚 **Data:** Grant database expanded from 66 → **84 real, verifiable schemes** — added CGSS, Fund of Funds 2.0, state-level funds (Maharashtra, Tamil Nadu, Telangana, Gujarat, Karnataka), NIDHI SSP, iDEX DISC, MeitY GENESIS, BIRAC SITARE/Grand Challenges, PMEGP, MUDRA, and 3 new logistics/trucking schemes under a new `logistics` domain.
- 🏷️ **Fix:** Domain filter dropdowns synced with every domain actually present in the database (incl. new Logistics category) across all languages; normalized a few scholarship entries that showed "USD" as text instead of `$`.
- ✨ **Feature:** Proposal Generator expanded from 6 → **9 sections** (added Traction & Validation, Team & Execution Capability, Risk & Compliance Mitigation) and gained a **Tone selector** (Formal/Technical/Persuasive/Concise) that steers both the live Watsonx.ai prompt and the offline fallback copy.
- 📝 **Docs:** Full README overhaul — fixed a stale clone URL/repo name, rebuilt the Project Structure tree to cover every file with main-vs-fallback notes, added a data-flow diagram, and added a consolidated "Main Path vs. Fallback" table for all 6 AI/voice-dependent features.

### v2.0.0 — June–July 2026 (Reliability & Docs)
- ✅ **Fix:** TTS voice pre-loading on app mount (eliminated ~60s startup lag); TTS language mapping extended to all 7 languages (Spanish, French, German, Japanese were previously silently falling back to English).
- ✅ **Improvement:** Proposal Generator now renders markdown pipe tables as proper styled HTML tables (`parseMarkdownToHtml` rewritten with a two-pass block-grouping approach).
- 📝 **Docs:** README restructured with full tables, changelog, table of contents, an explicit Speech-to-Text section, a full TTS/STT fallback behavior writeup, and documentation of the Orchestrate/Compliance backend modules.

### v1.0.0 — June 2026 (Initial Release)
- 🚀 Initial release for the IBM AICTE internship submission — AI Chat Agent powered by IBM Granite via Watsonx.ai, 30+ Indian startup grant schemes with eligibility matching, multilingual UI (7 languages) with Watson TTS, Proposal Generator, Pitch Generator, deployed on Vercel.

---

## 📜 License

MIT — Built as part of the **IBM Skills Build for University Engagements**m

**Problem Statement #18** — AI Grant and Funding Finder for Startups

---

<div align="center">
  Made with ❤️ using IBM Granite + Watsonx.ai
</div>
