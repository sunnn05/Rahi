import { ArrowLeft } from "lucide-react";

export default function ScreenHeader({ title, onBack }) {
  return (
    <div className="shead">
      <button className="shead-back" onClick={onBack} aria-label="Go back">
        <ArrowLeft size={21} strokeWidth={2.4} />
      </button>
      <h1>{title}</h1>
    </div>
  );
}
