# Road Accident Help — Week 1

A progressive web app for bystanders at road accidents in India. Week 1 scope:
get the user to 112, get them their location, and remove the fear that stops
people from stopping.

**This is a student project. It is not a medical device, an emergency service or
legal advice.**

---

## Running it

You need Node 18 or newer. Check with `node -v`.

```bash
npm install
npm run dev
```

Open the URL it prints. Then, to see it as it will actually be used:

1. DevTools → Toggle device toolbar → pick a phone size.
2. Sensors panel → set a custom GPS location. Browsers block real geolocation
   on plain `http://` from anything but `localhost`.

Test on your actual phone too — thumb reach and sunlight legibility cannot be
judged on a laptop:

```bash
npm run dev -- --host
```

Open the network URL on your phone, on the same WiFi. Geolocation will be
blocked over plain HTTP, so use `npx localtunnel --port 5173` or deploy to
Vercel to get HTTPS.

---

## What is in here

```
src/
├── App.jsx                     screen switching, holds the GPS fix
├── hooks/useGeolocation.js     watchPosition wrapper with accuracy + errors
├── data/rights.js              legal content as reviewable data, never generated
└── components/
    ├── CallStrip.jsx           fixed tel:112 link, present on every screen
    ├── LocationPanel.jsx       permission flow, coordinates, share sheet
    └── SamaritanCard.jsx       timestamped record, exported via html2canvas
```

---

## Week 1 checklist

- [x] Vite + React scaffold
- [x] PWA manifest and viewport meta
- [x] `tel:112` strip fixed to the bottom of every screen
- [x] Geolocation with live accuracy and honest failure states
- [x] Share location via Web Share API, clipboard fallback
- [x] Good Samaritan record card with GPS and timestamp
- [x] PNG export with html2canvas
- [x] Visible student-project disclaimer
- [ ] **Verify every line in `src/data/rights.js`** against the current MoRTH
      text and the Motor Vehicles Act. Do this before you show anyone.
- [ ] Add real `icon-192.png` and `icon-512.png` to `public/`
- [ ] Service worker so the app opens with no signal (see below)
- [ ] Test on a real phone, outdoors, in sunlight

---

## Two things to fix before week 2

**The app does not work offline yet.** The manifest makes it installable, not
offline-capable. You need a service worker. Do not write one by hand — add
`vite-plugin-pwa`, which generates one:

```bash
npm install -D vite-plugin-pwa
```

Register it in `vite.config.js` with `registerType: "autoUpdate"`. Verify by
loading the app, ticking "Offline" in the DevTools Network panel, and
reloading. If the rights list and the 112 button still appear, you are done.

**html2canvas is 190 kB of a 400 kB bundle.** It is only needed on the card
screen. Load it lazily so the first screen stays fast:

```js
const html2canvas = (await import("html2canvas")).default;
```

Move that inside the `save` function and drop the top-level import.

---

## Design decisions worth defending in a demo

Interviewers and judges ask "why". Short answers:

- **Why a `tel:` link and not a button?** It works even if React fails to
  hydrate. The one critical action has no JavaScript dependency.
- **Why `watchPosition` instead of `getCurrentPosition`?** The first fix is
  often a network fix accurate to kilometres. GPS tightens over ~20 seconds. At
  a crash, that difference picks the wrong hospital.
- **Why show the accuracy number?** So the user can judge whether to trust it,
  instead of the app pretending to a precision it does not have.
- **Why the system font stack?** No webfont request means no blocking network
  call on first paint. The app has to open on one bar of signal.
- **Why is the legal text in a data file?** So it can be reviewed, cited and
  translated as a unit, and so it can never be generated at runtime by a model.
- **Why "record" and not "certificate" or "proof"?** A PNG is not legal proof
  of anything. Claiming otherwise would mislead someone at the worst moment.

---

## Sources to verify

- Motor Vehicles Act 1988, s.134A — Good Samaritan protection
- Motor Vehicles Act 1988, s.162 — cashless treatment
- MoRTH Good Samaritan guidelines — https://morth.nic.in/good-samaritan
- PM RAHAT scheme (launched February 2026) — ₹1.5 lakh, 7 days, at designated
  hospitals

---

## HOSPITAL tab (week 2)

Reads `src/data/hospitals.js` — a manually verified seed list of 10 PM-JAY
empanelled hospitals in Bengaluru Urban, built via the Overpass + fuzzy-match
pipeline (kept as separate scripts outside this app; see the
`hospital-matching` toolkit from this project's build log if you have it).

**This is not a live API.** Outside Bengaluru Urban, the list will just show
far-away hospitals — that's honest behavior for an unfinished dataset, not a
bug. Expanding coverage means running the matching pipeline again for other
districts and appending verified entries to `hospitals.js`.

**Before treating any entry as current:** PM-JAY empanelment changes over
time. `HOSPITALS_LAST_VERIFIED` records when the list was checked against
the official portal — update it whenever you re-verify, and don't let it go
stale silently.

One entry (`Narayana Institute of Cardiac Sciences`) has `approxLocation:
true` because its coordinates came from an address lookup rather than a
direct GPS pin — confirm it against Google Maps before relying on it for
real navigation.

---

## Live hospital fallback (dynamic location support)

The HOSPITAL tab now has two data sources, kept visually distinct on purpose:

1. **Verified seed list** (`src/data/hospitals.js`) — the 10 Bengaluru Urban
   hospitals checked by hand against the PM-JAY portal. Shown with a green
   check badge.
2. **Live Overpass lookup** (`src/lib/overpass.js`) — fetched only when
   needed, shown with an amber warning badge and the text "Not verified for
   PM-JAY". This can find a hospital anywhere, but carries no empanelment
   guarantee — it's raw OpenStreetMap data run through the same specialty
   filter as the offline matching scripts, nothing more.

**When the live search fires:**

- Automatically offered (not automatically run) when the user's nearest
  verified hospital is more than 15km away — a signal they're likely outside
  Bengaluru Urban.
- Available as a manual "Also search OpenStreetMap" button even inside the
  covered area, for extra options.
- Never runs on every GPS update. It's tap-triggered and cached in memory
  for 10 minutes per ~1km grid cell, so moving slightly or re-opening the tab
  doesn't spam the request.

**Why not just always use live data?** Because only the seed list has been
checked against the actual PM-JAY portal. Live results can't carry that
guarantee, and blurring the two together would mean the app claiming cashless
treatment somewhere that was never verified — worse than saying nothing.

**Extending coverage properly:** the right fix for the 15km limitation isn't
a bigger live-fetch radius — it's running the Week 2 matching pipeline
(`test-overpass.js` + `match-hospitals.js`) again for another district and
adding verified entries to `hospitals.js`. That keeps the "verified" badge
meaning something.

---

## Triage tab (week 3) — free version, no API key

The TRIAGE tab reads a description of the accident and shows the matching
first-aid protocol cards. It has three inputs, all feeding one pipeline:

- **Tap chips** — "Heavy bleeding", "Not waking up", "Several hurt". Fastest
  in a panic, no typing.
- **Voice** — the browser's built-in Web Speech API (free, no key). Works in
  Chrome/Edge/Safari; needs a connection (Chrome sends audio to Google to
  transcribe). Falls back gracefully to typing where unsupported.
- **Text box** — always available.

### The safety architecture (important)

The classifier NEVER writes the advice a user sees. It only decides which
pre-written, human-verified cards from `src/data/protocols.js` to show. The
flow is:

```
description → classify → validate → select protocol cards → display
             (keyword)   (schema)    (pure lookup)
```

- `src/lib/keywordClassifier.js` — spots keywords, fills the schema. Dumb on
  purpose: when unsure it returns "unknown", never a guess.
- `src/lib/triageSchema.js` — validates the classification. Treats classifier
  output as untrusted; strips anything unexpected; every failure falls back to
  all-"unknown" → general-care card. A hallucinated "advice" field would be
  silently discarded here.
- `src/data/protocols.js` — the ONLY source of instructions shown to a user.

### Swapping in a paid LLM later

The keyword classifier is one function returning one schema. To upgrade to a
real LLM (smarter at understanding phrasing), replace `classifyByKeywords`
with an API call that returns the same shape — nothing else changes. The free
version is a complete, safe product on its own; the LLM is an optional
accuracy upgrade, not a requirement.

### Known limitations (say these in a demo)

- Keyword matching misses phrasings it wasn't given words for — by design it
  then shows general care rather than guessing wrong.
- English keywords only. Voice in other languages transcribes fine but won't
  match keywords yet, so it safely returns "unknown".
- Voice needs a connection; text and the offline protocol cards do not.
