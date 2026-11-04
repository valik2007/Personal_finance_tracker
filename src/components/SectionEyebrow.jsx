import Icon from "./Icon.jsx";
import signal from "../assets/signal.svg";

export default function SectionEyebrow({ children, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="size-1.5 overflow-hidden">
        <Icon src={signal} alt="" />
      </span>
      <p className="text-[11px] font-semibold tracking-[1.8px] text-emerald">
        {children}
      </p>
    </div>
  );
}
