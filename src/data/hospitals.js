/**
 * PM-JAY / PM RAHAT empanelled hospitals — Bengaluru Urban seed dataset.
 *
 * Sourced from: manual verification against hospitals.pmjay.gov.in (Find
 * Hospitals → Karnataka → Bengaluru Urban), cross-matched with OpenStreetMap
 * for coordinates. See /mnt/skills or the project README for the matching
 * pipeline that produced this (test-overpass.js + match-hospitals.js).
 *
 * "verified: true" means a human checked this hospital's empanelment status
 * on the official portal — not just that the name matching script found it.
 * Do not add entries here with verified: false; keep those in the pipeline's
 * working file until they're checked.
 *
 * lastVerified matters because empanelment changes — hospitals get added,
 * suspended, and removed. Treat this list as "true as of this date," not
 * permanent fact, and show that date in the UI.
 */

export const HOSPITALS_LAST_VERIFIED = "2026-09-11";

export const HOSPITALS = [
  {
    name: "Victoria Hospital",
    lat: 12.9634957,
    lon: 77.5736948,
    address: null,
    phone: null,
  },
  {
    name: "Bowring and Lady Curzon Hospital",
    lat: 12.9830115,
    lon: 77.6047116,
    address: "Lady Curzon Road, Shivaji Nagar",
    phone: "+91-80-25591325",
  },
  {
    name: "KC General Hospital",
    lat: 12.9950532,
    lon: 77.5697431,
    address: "Malleswaram",
    phone: null,
  },
  {
    name: "St. John's Medical College Hospital",
    lat: 12.929648,
    lon: 77.6185932,
    address: "Sarjapur Road, John Nagar, Koramangala",
    phone: null,
  },
  {
    name: "MS Ramaiah Hospital",
    lat: 13.0297293,
    lon: 77.5685912,
    address: null,
    phone: null,
  },
  {
    name: "Sagar Hospitals",
    lat: 12.9279005,
    lon: 77.5998446,
    address:
      "#44, 54, 30th Cross Rd, Bannerughatta Approach Road Layout, 4th T Block East, Tilak Nagar, Jayanagar",
    phone: "08042888888",
  },
  {
    name: "Bhagwan Mahaveer Jain Hospital",
    lat: 12.9914884,
    lon: 77.5952993,
    address: null,
    phone: null,
  },
  {
    name: "Narayana Institute of Cardiac Sciences (Narayana Health City)",
    lat: 12.8096,
    lon: 77.6959,
    address: "258/A, Bommasandra Industrial Area, Hosur Road, Bengaluru 560099",
    phone: null,
    // Coordinates derived from a mapping service's address lookup, not from
    // OSM or a GPS pin — confirm precisely before relying on it for routing.
    approxLocation: true,
  },
  {
    name: "Sanjay Gandhi Institute of Trauma and Orthopaedics",
    lat: 12.9357711,
    lon: 77.5939433,
    address: null,
    phone: null,
  },
  {
    name: "KIMS Hospital and Research Center",
    lat: 12.9563016,
    lon: 77.5747874,
    address: "K. R. Road, V. V. Puram",
    phone: null,
  },
];
