import { useRef, useState } from "react";
import { Download, ShieldCheck } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import { RIGHTS, CARD_NOTICE } from "../data/rights";

/**
 * A record the bystander can keep and show.
 *
 * Deliberate wording: this is a record, not "proof" or a "certificate". A PNG
 * is not legal proof of anything, and someone relying on it as though it were
 * would be worse off than someone who simply knew their rights. The card
 * states existing law and timestamps the moment; that is all it claims.
 */
export default function ProtectScreen({ coords, onBack }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  // Frozen at first render so the card does not tick while it is being read.
  const [stamp] = useState(() => new Date());

  const save = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      // Loaded on demand — the heaviest dependency in the app, and only this
      // screen needs it.
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `rahi-good-samaritan-${stamp.getTime()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("Could not save the image. Take a screenshot instead.");
    } finally {
      setSaving(false);
    }
  };

  const when = stamp.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <>
      <ScreenHeader title="Good Samaritan Card" onBack={onBack} />

      <div className="pad">
        <div className="gs" ref={cardRef}>
          <div className="gs-row">
            <p className="gs-key">DATE AND TIME</p>
            <p className="gs-val">{when}</p>
          </div>

          <div className="gs-row">
            <p className="gs-key">GPS LOCATION</p>
            <p className="gs-val">
              {coords
                ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)} (±${coords.accuracy} m)`
                : "Not recorded"}
            </p>
          </div>

          <div className="gs-row">
            <p className="gs-key">ACTION TAKEN</p>
            <p className="gs-val">
              Assistance provided at a road accident scene. Emergency services
              contacted.
            </p>
          </div>

          <div className="gs-quote">
            Under Section 134A of the Motor Vehicles Act and the Supreme Court
            Good Samaritan guidelines, a person who helps an accident victim in
            good faith cannot be detained, harassed, or held liable for injuries
            sustained by the victim.
          </div>

          <div className="gs-rights">
            <strong>Your rights as a helper</strong>
            <ul>
              {RIGHTS.map((r) => (
                <li key={r.id}>{r.text}</li>
              ))}
            </ul>
          </div>

          <div className="gs-helpline">
            <span className="num">112</span>
            <span className="cap">
              Call if you are being obstructed or harassed while helping
            </span>
          </div>

          <p className="gs-notice">{CARD_NOTICE}</p>
        </div>

        <button className="contact c-whatsapp" onClick={save} disabled={saving}>
          <Download size={22} strokeWidth={2.4} />
          <span className="contact-label">
            {saving ? "SAVING…" : "SAVE AS IMAGE"}
          </span>
        </button>

        <p className="foot-note">
          <ShieldCheck size={13} strokeWidth={2.4} /> Saves to your gallery, so
          it survives the app closing or the battery dying.
        </p>

        <div className="disclaimer" style={{ marginTop: 18 }}>
          <strong>This is a student project, not a legal service.</strong> The
          rights above are summaries of existing law — read the full text of the
          Motor Vehicles Act and the MoRTH guidelines for exact wording, and
          speak to a lawyer for advice about your own situation.
        </div>
      </div>
    </>
  );
}
