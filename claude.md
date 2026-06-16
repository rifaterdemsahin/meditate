# Meditate

A distraction-free meditation web app. Single static `index.html` — no build step, no backend.

## Features

- **Timed sessions** — 5, 10, 15, and 20 minute presets with a large tabular countdown timer (Start / Pause / Reset).
- **YouTube embeds** — each session length loads a curated guided-meditation video underneath the timer.
- **Distraction-free mode** — the floating **⛶ Focus** button hides all chrome (titles, buttons, notes) leaving only the timer and video on a black background.
- **Counter / chime** — counts down to `00:00` and plays a gentle 528 Hz chime via the Web Audio API when a session ends.
- **Note taker** — a simple textarea autosaved to `localStorage`, with **Download as Markdown** (timestamped `.md` file) and **Clear**.

## Tech stack

- [Pico.css](https://picocss.com/) (v2, via CDN) — classless styling, dark theme.
- [htmx](https://htmx.org/) (via CDN) — included per project requirement.
- Vanilla JS for the timer, video swapping, audio chime, and note persistence.

## Running locally

No dependencies or server required — open the file directly:

```bash
open -a "Google Chrome" index.html
```

Or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Customizing videos

Edit the `SESSIONS` map in the `<script>` block of `index.html`. Each entry maps a
session length (minutes) to a YouTube video `id` and a `label`:

```js
const SESSIONS = {
  5:  { id: "inpok4MKVLM", label: "5 Minute Meditation" },
  // ...
};
```

The `id` is the part after `v=` in a YouTube URL.

## Notes storage

Notes are saved to the browser's `localStorage` under the key `meditate-notes`.
They never leave your device unless you download them as Markdown.
