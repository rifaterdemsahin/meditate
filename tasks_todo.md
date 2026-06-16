# Meditate — Tasks & Setup TODO

Checklist to make the infrastructure and features fully work end-to-end. Static pages run on
GitHub Pages today; the items below light up the cloud features.

## ✅ Done (in the app)

- [x] Timed sessions (5/10/15/20 min) with countdown timer
- [x] Battery indicator that fills to 100% as a session completes
- [x] Distraction-free **Focus** mode
- [x] Audio feedback on completion (3-note chime + spoken confirmation)
- [x] YouTube guided-meditation embeds per session length
- [x] Notes with autosave, **Clear**, and **Download as Markdown**
- [x] Voiceless ambient sounds (Rain / Water / Nature / Ohhh-Om) synthesized in-browser
- [x] Live "game" scoreboard (people meditating now + sessions worldwide)
- [x] Shared nav with BST clock in the header
- [x] Content pages: Why, Rationale, Health Benefits, PABB, Reflections, Position,
      Ohmmm Breathing, Techniques, Mind Wandering, Common Mistakes, Boredom & Flow,
      Maps of Consciousness
- [x] Audio generation page (fal.ai TTS, key in cookie, voices + scripts)
- [x] GitHub link in every footer

## 🔧 Infrastructure to configure

### 1. Hosting
- [ ] **GitHub Pages** (static): Settings → Pages → deploy from `main`. Covers all pages with
      localStorage/simulated fallbacks.
- [ ] **Vercel** (for serverless `/api/*`): import the repo, `npm install`, deploy.
      Needed for the real session counter, live presence, and Azure audio library.

### 2. MongoDB Atlas (session counter + live presence)
- [ ] Create a free Atlas cluster + database user.
- [ ] Network access: allow `0.0.0.0/0` (or Vercel egress IPs).
- [ ] Set env var `MONGODB_URI` in Vercel.
- [ ] Verify `GET /api/meditations` returns `{ count }`.
- [ ] Verify `GET /api/presence` returns `{ active, total }`.
- [ ] Confirm the TTL index on `presence.at` expires stale heartbeats.

### 3. Azure Blob Storage (generated MP3s)
- [ ] Create a Storage account + container named `audio`.
- [ ] Allow public **blob** read (for streaming) or front with signed URLs.
- [ ] Configure CORS on the Storage account for the site origin.
- [ ] Set env var `AZURE_STORAGE_CONNECTION_STRING` in Vercel.
- [ ] Verify upload via `POST /api/audio?name=test.mp3` stores under `meditations/`.
- [ ] Verify `GET /api/audio` lists files and they stream in the library.

### 4. fal.ai (text-to-speech)
- [ ] Get an API key at fal.ai/dashboard/keys.
- [ ] On `generate.html`, save the key (stored in the `fal_api_key` cookie).
- [ ] Confirm the TTS model id in `generate.html` (`fal-ai/playai/tts/v3`) is current.
- [ ] If browser CORS blocks direct calls, add a serverless proxy for fal.ai.

## 🌟 Feature backlog / ideas

- [ ] Map ambient sounds onto real looped field recordings (optional, larger assets).
- [ ] Save generated meditation scripts/voices as a reusable library in the cloud.
- [ ] Streaks & badges on top of the session counter.
- [ ] Per-user accounts so counts/notes sync across devices.
- [ ] Offline support via a service worker (PWA).
- [ ] Accessibility pass (focus order, ARIA labels, prefers-reduced-motion for the pulse).
