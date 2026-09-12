import { ShieldPlus } from "lucide-react";

export default function AppBar() {
  return (
    <header className="appbar">
      <span className="appbar-name">Rahi</span>
      <span className="appbar-badge" aria-hidden="true">
        <ShieldPlus size={19} strokeWidth={2.2} />
      </span>
    </header>
  );
}
