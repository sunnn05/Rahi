/**
 * Live, client-side fallback for locations outside the verified seed dataset.
 *
 * Important distinction from src/data/hospitals.js: results from here are
 * NOT checked against PM-JAY empanelment. They're raw OpenStreetMap data,
 * filtered for obvious non-trauma specialties, nothing more. The UI must
 * never claim these take cashless treatment — only the seed list can say that.
 *
 * This calls a public, donated API directly from the browser. That's
 * acceptable for occasional, user-triggered lookups (someone taps "search
 * this area" once), but must never run automatically on every location
 * update — that would hammer free infrastructure every time a phone's GPS
 * jitters. See CACHE_TTL_MS below for the guardrail against repeat calls.
 */

const ENDPOINT = "https://overpass-api.de/api/interpreter";
const RADIUS_M = 8000;
const CACHE_TTL_MS = 10 * 60 * 1000; // don't re-fetch the same area for 10 min

const NOT_TRAUMA_KEYWORDS = [
  "eye", "dental", "diagnostic", "skin", "fertility", "ivf", "physio",
  "dermatology", "cosmetic", "veterinary", "homeo", "ayurved",
  "netralaya", "netra", "dant",
];

function looksLikeSpecialtyClinic(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return NOT_TRAUMA_KEYWORDS.some((word) => lower.includes(word));
}

/** Straight-line distance in km. */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// In-memory cache, keyed by rounded coordinates so small GPS jitter (a few
// metres) reuses the same result instead of firing a fresh request.
const cache = new Map();

function cacheKey(lat, lon) {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`; // ~1km grid
}

/**
 * Fetches nearby hospitals from OpenStreetMap via Overpass.
 * Throws on network failure — the caller decides how to show that.
 */
export async function fetchLiveHospitals(lat, lon) {
  const key = cacheKey(lat, lon);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.data;
  }

  const query = `
[out:json][timeout:20];
(
  node["amenity"="hospital"](around:${RADIUS_M},${lat},${lon});
  way["amenity"="hospital"](around:${RADIUS_M},${lat},${lon});
);
out center tags;
`.trim();

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
  });

  if (!res.ok) {
    throw new Error(
      res.status === 429
        ? "Too many requests right now — try again in a minute."
        : `Lookup failed (${res.status}).`
    );
  }

  const data = await res.json();
  const results = (data.elements ?? [])
    .filter((el) => el.tags?.name && !looksLikeSpecialtyClinic(el.tags.name))
    .map((el) => {
      const hLat = el.lat ?? el.center?.lat;
      const hLon = el.lon ?? el.center?.lon;
      return {
        name: el.tags.name,
        lat: hLat,
        lon: hLon,
        distance: distanceKm(lat, lon, hLat, hLon),
        address: el.tags["addr:full"] ?? el.tags["addr:street"] ?? null,
        phone: el.tags.phone ?? el.tags["contact:phone"] ?? null,
        verified: false, // never claim PM-JAY status for live results
      };
    })
    .sort((a, b) => a.distance - b.distance);

  cache.set(key, { at: Date.now(), data: results });
  return results;
}
