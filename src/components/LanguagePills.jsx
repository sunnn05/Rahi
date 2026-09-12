import { LANGUAGES } from "../data/languages";

export default function LanguagePills({ value, onChange, light = false }) {
  return (
    <div className={light ? "langs langs-light" : "langs"}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className="lang"
          aria-pressed={value === l.code}
          onClick={() => onChange(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
