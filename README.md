# 🧘 Meditate

A distraction-free meditation web app — timed sessions, guided videos, breathing pacers,
AI-generated meditation audio, a markdown note taker, and a live community scoreboard.
Built with **htmx** + **Pico.css**.

## 🌐 Live demo

**https://rifaterdemsahin.github.io/meditate/**

## Features

- **Timed sessions** — 5, 10, 15, and 20 minute presets with a large countdown timer.
- **YouTube embeds** — a curated guided-meditation video for each session length.
- **Distraction-free mode** — the floating **⛶ Focus** button hides everything except timer + video.
- **Audio feedback** — on completion you hear a 3-note singing-bowl chime and a spoken
  "Session complete. Well done." confirmation.
- **Live scoreboard (game)** — the home page shows **people meditating right now** (real-time
  presence) and **sessions completed worldwide**, counting up like a scoreboard.
- **AI audio generation** — turn guided scripts into spoken meditation MP3s with **fal.ai**
  text-to-speech; save and stream them from **Azure Blob Storage**.
- **Note taker** — autosaved notes with **Download as Markdown**.

## Pages

| Page | What it is |
| --- | --- |
| **Sessions** (`index.html`) | Timer, presets, video, notes, live scoreboard |
| **Why Meditate** (`why.html`) | Benefits + how Ray Dalio promotes meditation |
| **The PABB Goal** (`pabb.html`) | Pain · Abstinence · Barriers · Boredom |
| **Intentional Reflections** (`reflections.html`) | Pre/post-session intention & reflection prompts |
| **Posture & Position** (`position.html`) | Sitting positions + seven-point posture checklist |
| **Ohmmm Breathing** (`breathing.html`) | Om-chant breathing technique with a guided pacer |
| **Mind Wandering** (`wandering.html`) | Why the mind wanders and the four-step return |
| **Maps of Consciousness** (`consciousness.html`) | Hawkins-style spectrum meditation |
| **Generate Audio** (`generate.html`) | fal.ai voices + scripts → Azure-stored MP3s |

## Run locally

```bash
open -a "Google Chrome" index.html
# or
python3 -m http.server 8000
```

The static pages work standalone; cloud features degrade gracefully when no backend is present.

## Cloud backends (serverless)

Deploy to **Vercel** (`npm install` then `vercel`). Set these environment variables:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `api/meditations.js`, `api/presence.js` | Session counter + live presence |
| `AZURE_STORAGE_CONNECTION_STRING` | `api/audio.js` | Store/stream generated MP3s |

### Endpoints

- `GET/POST /api/meditations` — total completed sessions (POST increments).
- `GET/POST /api/presence` — `{ active, total }` people meditating now (POST = heartbeat).
- `GET/POST /api/audio` — list / upload MP3s in the Azure `meditations/` folder.

### AI audio generation

`generate.html` asks for your **fal.ai API key** and stores it in a **cookie** on your
device (never sent to our server). It calls fal.ai text-to-speech directly, then optionally
uploads the MP3 to Azure via `/api/audio` for streaming from the cloud library.

> Without the serverless backends, the scoreboard shows a friendly simulated count, the
> session counter falls back to `localStorage`, and the Azure library is hidden — so the app
> still runs on plain GitHub Pages.

See [`claude.md`](./claude.md) for full setup and customization details.

## Tech stack

[Pico.css](https://picocss.com/) · [htmx](https://htmx.org/) · vanilla JS ·
[MongoDB Atlas](https://www.mongodb.com/atlas) · [Azure Blob Storage](https://azure.microsoft.com/products/storage/blobs) ·
[fal.ai](https://fal.ai/) · [Vercel](https://vercel.com/) serverless.
