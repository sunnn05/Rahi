import { Ambulance, ArrowRight, ShieldCheck } from "lucide-react";
import LanguagePills from "../components/LanguagePills";
import { LANGUAGES } from "../data/languages";

export default function HomeScreen({ lang, setLang, onStart }) {
  const chosen = LANGUAGES.find((l) => l.code === lang);
  const pending = chosen && !chosen.ready;

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-mark">
          <Ambulance size={44} strokeWidth={1.7} />
        </div>

        <h1>RAHI</h1>
        <p className="hero-sub">ROAD ACCIDENT HELP INDIA</p>
        <p className="hero-tag">
          First-aid guidance and legal cover for anyone who stops to help.
        </p>

        <LanguagePills value={lang} onChange={setLang} />

        {pending && (
          <p className="lang-note">
            {chosen.label} arrives in week 4 with Bhashini. The app is in
            English until then.
          </p>
        )}

        <button className="cta" onClick={onStart}>
          START RESCUE
          <ArrowRight size={24} strokeWidth={2.6} />
        </button>

        <p className="hero-legal">
          <ShieldCheck size={15} strokeWidth={2.4} />
          <span>
            <strong>You are legally protected</strong> under the Good Samaritan
            guidelines. Motor Vehicles Act, s.134A — no liability for helping in
            good faith.
          </span>
        </p>
      </div>
    </section>
  );
}
