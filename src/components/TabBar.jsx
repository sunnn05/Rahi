import { Home, Stethoscope, Phone, Hospital, Shield } from "lucide-react";

const TABS = [
  { id: "home", label: "HOME", Icon: Home },
  { id: "triage", label: "TRIAGE", Icon: Stethoscope },
  { id: "call", label: "CALL", Icon: Phone },
  { id: "hospital", label: "HOSPITAL", Icon: Hospital },
  { id: "protect", label: "PROTECT", Icon: Shield },
];

/**
 * Five fixed destinations. Two of them (triage, hospital) are not built yet
 * and say so on arrival — showing the full shape of the app from week 1 is
 * more honest in a demo than hiding tabs and adding them later.
 */
export default function TabBar({ active, onChange }) {
  return (
    <nav className="tabs" aria-label="Main">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className="tab"
          aria-current={active === id ? "page" : undefined}
          onClick={() => onChange(id)}
        >
          <Icon size={21} strokeWidth={active === id ? 2.4 : 2} />
          <span className="tab-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
