# Meditate

A distraction-free meditation web app. Static HTML pages (htmx + Pico.css) plus one
serverless function that tracks how many sessions you've completed in MongoDB Atlas.

## Pages

| File | Route | What it is |
| --- | --- | --- |
| `index.html` | Sessions | Timer, presets, video, notes, counter, live scoreboard |
| `why.html` | Why Meditate | Benefits of meditation + how Ray Dalio promotes it (video) |
| `pabb.html` | The PABB Goal | The goal of meditation as PABB (Pain, Abstinence, Barriers, Boredom) |
| `reflections.html` | Intentional Reflections | Pre/post-session intention & reflection prompts |
| `position.html` | Posture & Position | Sitting positions + seven-point posture checklist |
| `breathing.html` | Ohmmm Breathing | Om-chant technique with an animated breath pacer |
| `wandering.html` | Mind Wandering | Why the mind wanders + the four-step return |
| `consciousness.html` | Maps of Consciousness | Hawkins-style spectrum meditation |
| `generate.html` | Generate Audio | fal.ai voices + scripts → Azure-stored MP3s |

A project nav menu at the top links all pages (info pages grouped under a "Learn" dropdown).

## Features

- **Timed sessions** — 5, 10, 15, and 20 minute presets with a large tabular countdown (Start / Pause / Reset).
- **YouTube embeds** — each session length loads a curated guided-meditation video.
- **Distraction-free mode** — the floating **⛶ Focus** button hides all chrome, leaving only timer + video.
- **Counter / chime** — counts down to `00:00`, plays a gentle 528 Hz chime, and increments your session count.
- **Session counter** — total completed sessions stored in MongoDB Atlas via a serverless function, with a localStorage fallback when no backend is present.
- **Note taker** — textarea autosaved to `localStorage`, with **Download as Markdown** and **Clear**.

## The PABB goal

`pabb.html` frames the purpose of practice:

- **P — Pain:** focus on discomfort first rather than avoiding it.
- **A — Abstinence:** create the pause that lets you abstain from addictive, unhealthy behaviors.
- **B — Barriers:** "the obstacle is the way" (Ryan Holiday) — meet barriers with composure.
- **B — Boredom:** tolerate the empty space; it triggers creativity.

## Tech stack

- [Pico.css](https://picocss.com/) v2 (CDN) — classless dark-theme styling.
- [htmx](https://htmx.org/) (CDN) — included per project requirement.
- Vanilla JS for the timer, video swapping, chime, notes, and counter.
- [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) + a Vercel serverless function (`api/meditations.js`).

## Running the static site

The pages work standalone (counter falls back to localStorage):

```bash
open -a "Google Chrome" index.html
# or: python3 -m http.server 8000
```

## Session counter — MongoDB Atlas + serverless

`api/meditations.js` is a Vercel serverless function:

- `GET /api/meditations` → `{ count }` — current total.
- `POST /api/meditations` → `{ count }` — increments and returns the new total (called when a session finishes).

The secret (`MONGODB_URI`) lives only on the server, never in the client.

### Setup

1. Create a free **MongoDB Atlas** cluster and a database user. Copy the connection string.
2. Allow network access (`0.0.0.0/0` for serverless, or Vercel's egress IPs).
3. Deploy to Vercel:
   ```bash
   npm install        # installs the mongodb driver
   vercel              # or connect the repo in the Vercel dashboard
   ```
4. In Vercel → Project → Settings → Environment Variables, set:
   ```
   MONGODB_URI = mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority
   ```

The function uses database `meditate`, collection `counters`, document `_id: "meditations"`.

> On plain GitHub Pages (no serverless), the counter automatically falls back to a
> per-device count in `localStorage`, so the app still works everywhere.

## Live scoreboard — presence (MongoDB)

`api/presence.js` powers the home-page "game" scoreboard:

- `POST /api/presence?id=<clientId>` → records a heartbeat, returns `{ active, total }`.
- `GET /api/presence` → `{ active, total }` without recording.

The page sends a heartbeat every 15s; `active` = clients seen in the last 30s (a TTL index
expires stale heartbeats). Without a backend, the scoreboard shows a friendly simulated count.

## AI audio generation — fal.ai + Azure

`generate.html` creates spoken meditation MP3s:

1. The user pastes a **fal.ai API key**, stored in a **cookie** (`fal_api_key`) on their device.
2. They pick a **voice** and a **script** (a built-in series: Body Scan, Loving Kindness,
   Morning Energy, Deep Sleep, Box Breathing, Consciousness Journey) and can edit the text.
3. The browser calls fal.ai text-to-speech directly with the cookie key.
4. Optionally the MP3 is uploaded to Azure via `api/audio.js` and streamed back.

`api/audio.js` (Vercel serverless) stores blobs in container `audio` under a `meditations/`
folder using `AZURE_STORAGE_CONNECTION_STRING`:

- `POST /api/audio?name=<file>.mp3` (raw mp3 body) → `{ name, url }`.
- `GET /api/audio` → `{ files: [{ name, url }] }` for the cloud library.

> The fal.ai key lives only in the browser cookie — it is never sent to our serverless
> functions. The Azure connection string lives only on the server.

## Customizing videos

Edit the `SESSIONS` map in `index.html` (session length → YouTube video `id` + `label`).
The Ray Dalio video on `why.html` is a standard YouTube embed — swap the `embed/<id>` if needed.

## Notes storage

Notes are saved in `localStorage` under `meditate-notes` and never leave your device
unless you download them as Markdown.
