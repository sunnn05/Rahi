import { useState, useCallback } from "react";
import {
  Mic,
  MicOff,
  Type,
  Send,
  Droplet,
  MoonStar,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  Share2,
  HeartPulse,
} from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import PositionImage from "../components/PositionImage";
import { POSITION_IMAGES } from "../data/positionImages";
import { useSpeechInput } from "../hooks/useSpeechInput";
import { classifyByKeywords } from "../lib/keywordClassifier";
import { validateClassification, toProtocolInput, TRISTATE } from "../lib/triageSchema";
import { selectProtocols } from "../data/protocols";

/**
 * Each protocol card gets a bold, unambiguous category header — a clear icon
 * on a colour band that says at a glance WHAT KIND of emergency this is.
 *
 * Deliberate choice over illustrated "how-to" drawings: a drawing of a
 * technique (recovery position, applying pressure) is a sequence, not a
 * symbol, and renders ambiguously at icon size — a misread first-aid diagram
 * is dangerous. So the icon labels the category; the verified text steps carry
 * the actual instructions. Icons are from lucide-react (already a dependency),
 * so no external files, no attribution, identical rendering everywhere.
 */
const CARD_HEADERS = {
  severeBleeding: { Icon: Droplet, label: "SEVERE BLEEDING", tone: "hdr-red" },
  unconscious: { Icon: MoonStar, label: "UNCONSCIOUS", tone: "hdr-red" },
  general: { Icon: HeartPulse, label: "GENERAL CARE", tone: "hdr-amber" },
  multipleVictims: { Icon: Users, label: "MULTIPLE INJURED", tone: "hdr-red" },
};

/**
 * Turns any description (typed, spoken, or built from quick-tap chips) into a
 * classification, then shows the matching human-verified protocol cards.
 *
 * The model/classifier NEVER writes what the user reads. It only decides which
 * pre-written cards from src/data/protocols.js appear. Swapping the free
 * keyword classifier for a paid LLM later means changing one import line.
 */
export default function TriageScreen({ onBack }) {
  const speech = useSpeechInput({ lang: "en-IN" });
  const [text, setText] = useState("");
  const [result, setResult] = useState(null); // { classification, cards }
  const [analyzing, setAnalyzing] = useState(false);

  // Quick-tap symptom flags — the fastest input in a real panic, no typing.
  const [flags, setFlags] = useState({ bleeding: false, unconscious: false, multiple: false });

  // Optional scene photo — for SHARING with responders, NOT for AI diagnosis.
  // The app never analyses this image or lets it change the triage result.
  const [photo, setPhoto] = useState(null); // { dataUrl, name }

  const onPhotoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto({ dataUrl: reader.result, name: file.name });
    reader.readAsDataURL(file);
  };

  const sharePhoto = async () => {
    if (!photo) return;
    try {
      const res = await fetch(photo.dataUrl);
      const blob = await res.blob();
      const file = new File([blob], photo.name || "accident.jpg", { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Accident scene",
          text: "Photo from a road accident scene.",
        });
      } else {
        alert("Sharing images isn't supported here. Send it manually from your gallery to whoever you're calling.");
      }
    } catch {
      /* user dismissed share sheet */
    }
  };

  const runClassification = useCallback((description, flagOverrides) => {
    setAnalyzing(true);

    // Keyword classify the text, then let any explicitly-tapped chips override
    // — a deliberate tap is stronger evidence than a keyword guess.
    const base = classifyByKeywords(description || "");
    const merged = { ...base };
    if (flagOverrides?.bleeding) merged.severeBleeding = TRISTATE.YES;
    if (flagOverrides?.unconscious) merged.conscious = TRISTATE.NO;
    if (flagOverrides?.multiple && (merged.victims == null || merged.victims < 2)) {
      merged.victims = 2;
    }

    const classification = validateClassification(merged);
    const cards = selectProtocols(toProtocolInput(classification));

    // Tiny delay so the UI reads as "analysing" rather than flickering.
    setTimeout(() => {
      setResult({ classification, cards });
      setAnalyzing(false);
    }, 250);
  }, []);

  const onSubmitText = () => {
    const combined = [speech.transcript, text].filter(Boolean).join(" ");
    runClassification(combined, flags);
  };

  const onTapAnalyzeFlags = () => runClassification("", flags);

  const toggleFlag = (key) => setFlags((f) => ({ ...f, [key]: !f[key] }));

  const reset = () => {
    setResult(null);
    setText("");
    setFlags({ bleeding: false, unconscious: false, multiple: false });
    speech.setTranscript("");
  };

  if (result) {
    return (
      <>
        <ScreenHeader title="What to do" onBack={onBack} />
        <div className="pad">
          <ProtocolResults result={result} onReset={reset} />
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Describe the Accident" onBack={onBack} />
      <div className="pad">
        {/* Quick-tap chips: fastest path, no typing needed */}
        <p className="rule">TAP WHAT YOU SEE</p>
        <div className="chips">
          <Chip
            active={flags.bleeding}
            onClick={() => toggleFlag("bleeding")}
            Icon={Droplet}
            label="Heavy bleeding"
          />
          <Chip
            active={flags.unconscious}
            onClick={() => toggleFlag("unconscious")}
            Icon={MoonStar}
            label="Not waking up"
          />
          <Chip
            active={flags.multiple}
            onClick={() => toggleFlag("multiple")}
            Icon={Users}
            label="Several hurt"
          />
        </div>

        {/* Voice input, if the browser supports it */}
        {speech.supported && (
          <>
            <p className="rule">OR SPEAK</p>
            <button
              className={`mic ${speech.listening ? "mic-on" : ""}`}
              onClick={speech.listening ? speech.stop : speech.start}
            >
              {speech.listening ? (
                <>
                  <MicOff size={22} strokeWidth={2.3} /> Stop
                </>
              ) : (
                <>
                  <Mic size={22} strokeWidth={2.3} /> Tap to speak
                </>
              )}
            </button>
            {speech.transcript && (
              <p className="transcript">“{speech.transcript}”</p>
            )}
            {speech.error && <p className="speech-err">{speech.error}</p>}
          </>
        )}

        {/* Text input, always available */}
        <p className="rule">
          <Type size={13} strokeWidth={2.3} style={{ verticalAlign: -2 }} /> OR TYPE
        </p>
        <textarea
          className="triage-text"
          rows={3}
          placeholder="e.g. one person, bleeding from the leg, awake"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Optional scene photo — prompts the human to tap what they see,
            then attaches for sharing. No AI reads the image. */}
        <p className="rule">
          <Camera size={13} strokeWidth={2.3} style={{ verticalAlign: -2 }} /> OPTIONAL PHOTO
        </p>
        {!photo ? (
          <label className="photo-pick">
            <Camera size={20} strokeWidth={2.3} />
            Add a photo of the scene
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPhotoPick}
              style={{ display: "none" }}
            />
          </label>
        ) : (
          <div className="photo-preview">
            <img src={photo.dataUrl} alt="Accident scene, for sharing with responders" />
            <p className="photo-prompt">
              Looking at the photo, tap what you see above (bleeding, not waking
              up, several hurt) so the app can show the right steps.
            </p>
            <div className="photo-actions">
              <button className="mini" onClick={sharePhoto}>
                <Share2 size={15} strokeWidth={2.3} /> Send to 112
              </button>
              <button className="mini" onClick={() => setPhoto(null)}>
                <XCircle size={15} strokeWidth={2.3} /> Remove
              </button>
            </div>
          </div>
        )}
        <p className="photo-note">
          The app can't read the photo — you tap what you see, and the photo is
          sent to the 112 operator or responders, who can.
        </p>

        <button
          className="btn btn-solid btn-wide"
          onClick={
            text || speech.transcript
              ? onSubmitText
              : onTapAnalyzeFlags
          }
          disabled={
            analyzing ||
            (!text && !speech.transcript && !flags.bleeding && !flags.unconscious && !flags.multiple)
          }
          style={{ marginTop: 16, borderRadius: "var(--r-lg)" }}
        >
          {analyzing ? (
            <>
              <Loader2 size={18} strokeWidth={2.5} className="spin" /> Reading…
            </>
          ) : (
            <>
              <Send size={18} strokeWidth={2.5} /> Get first-aid steps
            </>
          )}
        </button>

        <div className="disclaimer" style={{ marginTop: 18 }}>
          <strong>This reads keywords, not meaning.</strong> It shows general
          first-aid steps and will say when it's unsure — always follow what the
          112 operator tells you over this screen.
        </div>
      </div>
    </>
  );
}

function Chip({ active, onClick, Icon, label }) {
  return (
    <button
      className={`chip ${active ? "chip-on" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <Icon size={18} strokeWidth={2.3} />
      {label}
    </button>
  );
}

function ProtocolResults({ result, onReset }) {
  const { classification, cards } = result;
  const lowConfidence =
    classification._fallback || classification.confidence === "low";

  return (
    <>
      {lowConfidence && (
        <div className="triage-uncertain">
          <AlertTriangle size={17} strokeWidth={2.4} />
          <span>
            Some details were unclear, so these are general steps. Tell the 112
            operator what you see and follow their instructions.
          </span>
        </div>
      )}

      {cards.map((card) => {
        const header = CARD_HEADERS[card.id];
        const HeaderIcon = header?.Icon;
        return (
          <div
            key={card.id}
            className={`proto ${card.urgent ? "proto-urgent" : ""}`}
          >
            {header && (
              <div className={`proto-header ${header.tone}`}>
                <HeaderIcon size={26} strokeWidth={2.4} />
                <span>{header.label}</span>
              </div>
            )}
            <div className="proto-body">
              <div className="proto-title">{card.title}</div>

              <PositionImage image={POSITION_IMAGES[card.id]} />

              <ol className="proto-steps">
                {card.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>

              {card.doNots && card.doNots.length > 0 && (
                <ul className="proto-donts">
                  {card.doNots.map((d, i) => (
                    <li key={i}>
                      <XCircle size={14} strokeWidth={2.4} /> {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}

      <button
        className="btn btn-wide"
        onClick={onReset}
        style={{ marginTop: 8, borderRadius: "var(--r-lg)" }}
      >
        Start over
      </button>

      <p className="foot-note" style={{ marginTop: 12 }}>
        First-aid steps based on the Indian First Aid Manual (St John Ambulance
        India / Indian Red Cross). Not a substitute for professional care.
      </p>
    </>
  );
}
