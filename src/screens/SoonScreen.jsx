import { Mic, Hospital } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";

const CONFIG = {
  triage: {
    title: "Describe the Accident",
    Icon: Mic,
    heading: "Voice triage is not built yet",
    body: "Week 3. Speech goes to Bhashini, the text goes to a model that only classifies the situation, and the first-aid text you see comes from vetted protocol cards — never generated on the spot.",
    week: "PLANNED FOR WEEK 3",
  },
  hospital: {
    title: "Nearest Hospitals",
    Icon: Hospital,
    heading: "Hospital finder is not built yet",
    body: "Week 2. Google Places for what is nearby, cross-checked against a seeded PM-JAY list so the app can flag which hospitals take cashless PM RAHAT treatment.",
    week: "PLANNED FOR WEEK 2",
  },
};

/**
 * Honest placeholders. Showing the real shape of the app from week 1, with
 * unbuilt parts labelled as unbuilt, is better in a demo than hiding tabs —
 * and it stops anyone mistaking a stub for a working feature.
 */
export default function SoonScreen({ kind, onBack }) {
  const c = CONFIG[kind];
  const { Icon } = c;

  return (
    <>
      <ScreenHeader title={c.title} onBack={onBack} />
      <div className="soon">
        <div className="soon-mark">
          <Icon size={32} strokeWidth={1.9} />
        </div>
        <h2>{c.heading}</h2>
        <p>{c.body}</p>
        <span className="soon-week">{c.week}</span>
      </div>
    </>
  );
}
