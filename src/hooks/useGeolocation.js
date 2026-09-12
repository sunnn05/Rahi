import { useEffect, useRef, useState } from "react";

/**
 * Tracks the device position continuously.
 *
 * Emergency-specific choices:
 *  - watchPosition, not getCurrentPosition: the first fix is often a coarse
 *    network fix (2000m+). Accuracy improves over ~20s as GPS locks on, and at
 *    a crash scene the difference between 2km and 20m decides which hospital
 *    you send someone to.
 *  - We surface `accuracy` to the UI instead of hiding it. Showing "±18 m"
 *    lets the user judge whether to trust it.
 *  - maximumAge: 0 so we never serve a stale fix from an earlier journey.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null); // { lat, lon, accuracy }
  const [status, setStatus] = useState("idle"); // idle | locating | ready | denied | unavailable
  const [error, setError] = useState(null);
  const watchId = useRef(null);

  const start = () => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      setError("This device cannot report its location.");
      return;
    }

    setStatus("locating");
    setError(null);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          at: pos.timestamp,
        });
        setStatus("ready");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setError("Location permission was refused.");
        } else {
          setStatus("unavailable");
          setError("Could not get a location fix.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return { coords, status, error, start };
}
