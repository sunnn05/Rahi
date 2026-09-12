import { useMemo } from "react";
import {
  Phone,
  MapPin,
  Copy,
  MessageCircle,
  Navigation,
  LocateFixed,
} from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import { CONTACTS } from "../data/contacts";

/**
 * The working core of week 1.
 *
 * The dispatch message matters more than it looks: the 112 operator will ask
 * "where are you?" and a bystander on an unfamiliar highway usually cannot
 * answer. A prefilled, copyable message with coordinates in it is the fastest
 * reliable answer, and it survives being pasted into WhatsApp or read aloud.
 */
export default function CallScreen({ geo, onBack }) {
  const { coords, status, start } = geo;

  const dispatch = useMemo(() => {
    const where = coords
      ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)} (accurate to ${coords.accuracy} m)\nhttps://maps.google.com/?q=${coords.lat},${coords.lon}`
      : "Location not available yet";
    return `ROAD ACCIDENT EMERGENCY\n\nLocation: ${where}\n\nA bystander is at the scene providing first aid. Please send an ambulance immediately.\n\nSent from RAHI — Road Accident Help India`;
  }, [coords]);

  const copyDispatch = async () => {
    try {
      await navigator.clipboard.writeText(dispatch);
      alert("Message copied. Paste it to whoever you are contacting.");
    } catch {
      alert("Could not copy. Select the text and copy it manually.");
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(dispatch)}`, "_blank");
  };

  return (
    <>
      <ScreenHeader title="Emergency Contacts" onBack={onBack} />

      <div className="pad">
        <div className="loc">
          <span className="loc-icon">
            {status === "ready" ? (
              <MapPin size={19} strokeWidth={2.3} />
            ) : (
              <LocateFixed size={19} strokeWidth={2.3} />
            )}
          </span>
          <div>
            <p className="loc-key">YOUR LOCATION</p>
            {status === "ready" && coords ? (
              <>
                <p className="loc-val">
                  {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
                </p>
                <p className="loc-note">
                  Accurate to about {coords.accuracy} m. Read this to the
                  operator.
                </p>
              </>
            ) : status === "locating" ? (
              <p className="loc-note">Finding you. Accuracy improves in a few seconds.</p>
            ) : status === "idle" ? (
              <p className="loc-note">Needed so the operator knows where to send help.</p>
            ) : (
              <p className="loc-note">
                No fix. Describe a nearby landmark or kilometre stone instead.
              </p>
            )}
          </div>
          {status !== "ready" && (
            <button className="loc-btn" onClick={start}>
              {status === "locating" ? "…" : "Locate"}
            </button>
          )}
        </div>

        {CONTACTS.map((c) => (
          <a key={c.id} className={`contact ${c.tone}`} href={`tel:${c.number}`}>
            <Phone size={22} strokeWidth={2.4} />
            <span className="contact-num">{c.number}</span>
            <span className="contact-dash">—</span>
            <span className="contact-label">{c.label}</span>
          </a>
        ))}

        <div className="rule">PRE-FILLED DISPATCH MESSAGE</div>

        <div className="dispatch">
          <p className="dispatch-text">{dispatch}</p>
          <button className="mini" onClick={copyDispatch}>
            <Copy size={15} strokeWidth={2.3} />
            Copy message
          </button>
        </div>

        <button className="contact c-whatsapp" onClick={shareWhatsApp}>
          <MessageCircle size={22} strokeWidth={2.4} />
          <span className="contact-label">Share via WhatsApp</span>
        </button>

        {coords && (
          <a
            className="contact c-maps"
            href={`https://maps.google.com/?q=${coords.lat},${coords.lon}`}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation size={22} strokeWidth={2.4} />
            <span className="contact-label">Open my location in Maps</span>
          </a>
        )}
      </div>
    </>
  );
}
