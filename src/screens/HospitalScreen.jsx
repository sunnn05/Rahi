import { useMemo, useState, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  BadgeCheck,
  LocateFixed,
  Search,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import { HOSPITALS, HOSPITALS_LAST_VERIFIED } from "../data/hospitals";
import { fetchLiveHospitals } from "../lib/overpass";

/** Straight-line distance in km. Good enough for sorting; not routing distance. */
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

// Beyond this distance from every seed hospital, assume the user is outside
// the verified Bengaluru Urban coverage and offer the live fallback instead
// of pretending the seed list is relevant.
const OUT_OF_COVERAGE_KM = 15;

function HospitalCard({ h }) {
  return (
    <div className="card">
      <div className="card-title">
        {h.verified === false ? (
          <AlertTriangle size={17} strokeWidth={2.4} color="#b26a00" />
        ) : (
          <BadgeCheck size={17} strokeWidth={2.4} color="#2e7d32" />
        )}
        {h.name}
      </div>

      {h.verified === false && (
        <p style={{ margin: "0 0 6px", fontSize: 12.5, color: "#b26a00", fontWeight: 600 }}>
          Not verified for PM-JAY — from OpenStreetMap only
        </p>
      )}

      {h.distance != null && (
        <p style={{ margin: "0 0 6px", fontSize: 14, color: "var(--muted)" }}>
          {h.distance < 1
            ? `${Math.round(h.distance * 1000)} m away`
            : `${h.distance.toFixed(1)} km away`}
          {h.approxLocation && " (approximate location)"}
        </p>
      )}

      {h.address && (
        <p style={{ margin: "0 0 6px", fontSize: 14, color: "var(--body)" }}>
          <MapPin size={13} strokeWidth={2.3} style={{ verticalAlign: -2 }} /> {h.address}
        </p>
      )}

      <div className="card-actions" style={{ marginTop: 10 }}>
        <a
          className="mini"
          href={`https://maps.google.com/?q=${h.lat},${h.lon}`}
          target="_blank"
          rel="noreferrer"
        >
          <Navigation size={15} strokeWidth={2.3} />
          Navigate
        </a>
        {h.phone && (
          <a className="mini" href={`tel:${h.phone.replace(/\s+/g, "")}`}>
            <Phone size={15} strokeWidth={2.3} />
            Call
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Two data sources, clearly separated:
 *
 * 1. The verified seed list (src/data/hospitals.js) — checked by hand against
 *    PM-JAY, only covers Bengaluru Urban.
 * 2. A live Overpass lookup — covers anywhere, but carries no empanelment
 *    guarantee. Never let these two look the same in the UI; a person
 *    deciding where cashless treatment is available needs to know which
 *    kind of answer they're looking at.
 *
 * The live lookup is not automatic. It fires only when the user is outside
 * the seed area AND taps the search button — never silently on every GPS
 * update, out of respect for Overpass being free, donated infrastructure.
 */
export default function HospitalScreen({ geo, onBack }) {
  const { coords, status, start } = geo;

  const [liveResults, setLiveResults] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  const sortedSeed = useMemo(() => {
    if (!coords) return HOSPITALS.map((h) => ({ ...h, distance: null }));
    return [...HOSPITALS]
      .map((h) => ({ ...h, distance: distanceKm(coords.lat, coords.lon, h.lat, h.lon) }))
      .sort((a, b) => a.distance - b.distance);
  }, [coords]);

  const nearestSeedKm = sortedSeed[0]?.distance ?? Infinity;
  const outOfCoverage = coords && nearestSeedKm > OUT_OF_COVERAGE_KM;

  const runLiveSearch = useCallback(async () => {
    if (!coords) return;
    setLiveLoading(true);
    setLiveError(null);
    try {
      const results = await fetchLiveHospitals(coords.lat, coords.lon);
      setLiveResults(results);
    } catch (err) {
      setLiveError(err.message || "Search failed.");
    } finally {
      setLiveLoading(false);
    }
  }, [coords]);

  return (
    <>
      <ScreenHeader title="Nearest Hospitals" onBack={onBack} />

      <div className="pad">
        {status !== "ready" && (
          <div className="loc">
            <span className="loc-icon">
              <LocateFixed size={19} strokeWidth={2.3} />
            </span>
            <div>
              <p className="loc-key">SORT BY DISTANCE</p>
              <p className="loc-note">
                {status === "locating"
                  ? "Finding you…"
                  : "Turn on location to see which hospital is actually nearest."}
              </p>
            </div>
            {status !== "locating" && (
              <button className="loc-btn" onClick={start}>
                Locate
              </button>
            )}
          </div>
        )}

        <div className="disclaimer" style={{ marginBottom: 14 }}>
          <strong>PM-JAY / PM RAHAT empanelled hospitals, Bengaluru Urban only.</strong>{" "}
          Verified against the official portal as of {HOSPITALS_LAST_VERIFIED}. Empanelment
          can change — call ahead or check{" "}
          <a href="https://hospitals.pmjay.gov.in" target="_blank" rel="noreferrer">
            hospitals.pmjay.gov.in
          </a>{" "}
          if it matters urgently.
        </div>

        {outOfCoverage && liveResults === null && (
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 10px", fontSize: 14.5, color: "var(--body)" }}>
              You're about {nearestSeedKm.toFixed(0)} km from our verified Bengaluru
              hospitals — likely outside our checked area.
            </p>
            <button className="mini" onClick={runLiveSearch} disabled={liveLoading}>
              {liveLoading ? (
                <Loader2 size={15} strokeWidth={2.3} className="spin" />
              ) : (
                <Search size={15} strokeWidth={2.3} />
              )}
              {liveLoading ? "Searching…" : "Search hospitals near me"}
            </button>
          </div>
        )}

        {liveError && (
          <div className="card" style={{ color: "#b91c1c", fontSize: 14 }}>
            {liveError}
          </div>
        )}

        {sortedSeed.map((h) => (
          <HospitalCard key={h.name} h={h} />
        ))}

        {liveResults && liveResults.length > 0 && (
          <>
            <div className="rule">OTHER NEARBY HOSPITALS</div>
            {liveResults.map((h) => (
              <HospitalCard key={`live-${h.name}-${h.lat}`} h={h} />
            ))}
          </>
        )}

        {liveResults && liveResults.length === 0 && (
          <div className="card" style={{ fontSize: 14, color: "var(--muted)" }}>
            No hospitals found nearby in OpenStreetMap either. Call 112 — the
            operator can locate the nearest facility directly.
          </div>
        )}

        {!outOfCoverage && coords && liveResults === null && (
          <button
            className="mini"
            onClick={runLiveSearch}
            disabled={liveLoading}
            style={{ margin: "4px auto 14px", display: "flex" }}
          >
            {liveLoading ? (
              <Loader2 size={15} strokeWidth={2.3} className="spin" />
            ) : (
              <Search size={15} strokeWidth={2.3} />
            )}
            {liveLoading ? "Searching…" : "Also search OpenStreetMap"}
          </button>
        )}

        <p className="foot-note">
          Hospital locations © OpenStreetMap contributors. Empanelment data
          verified manually against hospitals.pmjay.gov.in.
        </p>
      </div>
    </>
  );
}

