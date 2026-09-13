# RAHI — Road Accident Help India

> A progressive web app that gives any bystander at a road accident the tools to act confidently in the first few minutes — before an ambulance arrives.

**Live demo:** https://rahi-umber.vercel.app/
**Built by:** Suneha (3rd year CSE)  
**Stack:** React · Vite · PWA · OpenStreetMap · Web Speech API

---

## The problem

India records over 150,000 road accident deaths every year. Most happen in the first hour — the "Golden Hour" — when a bystander is already at the scene but doesn't know what to do, fears legal trouble for helping, or can't find a nearby hospital that accepts cashless government treatment.

RAHI addresses all three barriers in one app that works even without signal.

---

## What it does

### 🚨 One-tap emergency call
A persistent `tel:112` button on every screen — built as a plain HTML anchor so it works even if the JavaScript fails to load. The 112 operator reaches police, fire, and ambulance in one call.

### 📍 Live location + dispatch message
Tracks GPS accuracy in real time using `watchPosition` (not `getCurrentPosition`) so the fix tightens over time. Generates a pre-filled dispatch message with coordinates that the bystander can copy and paste into WhatsApp or read aloud to the 112 operator.

### 🏥 Hospital finder
Shows the nearest PM-JAY / PM RAHAT empanelled hospitals in Bengaluru Urban — manually verified against the official portal (`hospitals.pmjay.gov.in`), sorted by real distance from the user's GPS position. Outside the verified coverage area, a live fallback queries OpenStreetMap (free, no API key) and shows results clearly labelled as unverified, so the app never conflates a government-checked hospital with a raw map result.

### 🩺 Voice + tap triage
Three ways to describe the accident — tap quick-symptom chips ("Heavy bleeding", "Not waking up"), speak naturally (Web Speech API, free, no key), or type. A keyword classifier extracts victim count, consciousness state, and bleeding severity, then maps the result to pre-written, human-verified first-aid protocol cards sourced from the **Indian First Aid Manual** (St John Ambulance India / Indian Red Cross Society).

The AI classifier never writes what the user reads. It only selects which card to show. The instructions always come from the verified cards — this is a deliberate architectural decision to prevent confident-but-wrong medical advice.

### 🛡️ Good Samaritan protection card
Generates a timestamped, GPS-stamped record of assistance provided, exportable as a PNG. Displays the bystander's rights under the Motor Vehicles Act 1988 (s.134A) and PM RAHAT cashless treatment scheme — removing the fear of police harassment that stops most people from helping.

### 📵 Works offline
A Workbox-generated service worker precaches the entire app shell. The rights text, emergency contacts, first-aid cards, and the 112 button all render with zero network access — critical for highway accidents where signal drops out.

---

## Safety architecture

This is the most important design decision in the project.

```
voice / text / tap
       ↓
keyword classifier   ← only extracts facts, never generates advice
       ↓
schema validator     ← treats classifier output as untrusted; unknown beats wrong
       ↓
protocol selector    ← pure lookup, no generation
       ↓
verified cards       ← the ONLY source of instructions a user sees
```

Every first-aid card is:
- Sourced from the Indian First Aid Manual (IFAM, 7th ed.)
- Checked against ANZCOR 2020 guidelines for bleeding
- Marked `verified: true` in code only after manual cross-check
- Updated during development when sources contradicted the draft (e.g. limb elevation for bleeding was removed after checking ILCOR evidence)

A wrong triage classification degrades to "unknown", which shows general-care guidance — not a false "everything is fine". The failure mode is cautious, never confident-wrong.

---

## Hospital data pipeline

The hospital dataset was built with a custom pipeline rather than an API:

1. **Overpass API** (free OpenStreetMap query layer) — fetched 271 named hospitals in Bengaluru Urban, filtered to 227 after removing specialty clinics (eye, dental, diagnostic, ayurvedic) using a keyword denylist that handles both English and transliterated terms (e.g. "netralaya")
2. **Fuzzy name matching** — Jaccard similarity with normalised tokens (stopwords removed, initials collapsed) to cross-reference the OSM results against the PM-JAY portal list
3. **Manual verification** — each of the 10 seed hospitals confirmed individually on `hospitals.pmjay.gov.in`
4. **Distance-sorted at runtime** using the Haversine formula against the live GPS fix

This approach costs nothing (no Google Maps API, no billing account) and produced a more defensible dataset than a live API call would — you know exactly what's in it and when it was checked.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React + Vite | Fast build, PWA plugin support |
| Offline | vite-plugin-pwa + Workbox | Auto-generates service worker; precaches app shell |
| Maps / hospitals | OpenStreetMap + Overpass API | Free, no API key, no billing account |
| Voice | Web Speech API | Free, built into Chrome/Edge/Safari |
| Icons | lucide-react | Lightweight, consistent, no external files |
| Deployment | Vercel | Auto-deploys on every git push |

No paid APIs. No backend server. No database.

---

## Running locally

```bash
git clone https://github.com/sunnn05/Rahi.git
cd Rahi
npm install
npm run dev        # development (service worker not active)
npm run build
npm run preview    # production build with offline support
```

To test offline: open DevTools → Application → Service Workers → confirm "activated and running" → Network tab → tick Offline → reload.

---

## Known limitations (honest)

- **Hospital data covers Bengaluru Urban only.** Outside this area the live Overpass fallback runs, clearly labelled as unverified.
- **Keyword classifier is English-only.** Voice in other languages transcribes correctly but won't match English keywords — safely returns "unknown" and shows general care.
- **First-aid cards verified against published sources, not reviewed by a certified instructor in person.** The multiple-victims card in particular should be confirmed against IFAM section N.6 before real deployment.
- **Voice needs a connection.** Chrome's Web Speech API sends audio to Google's servers. Text input and all protocol cards work offline.

---

## Disclaimer

RAHI is a student project. It is not a certified medical device, an emergency service, or legal advice. Always call 112 first. The first-aid steps are sourced from the Indian First Aid Manual and are provided for general guidance only.
