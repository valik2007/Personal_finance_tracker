import Icon from "./Icon.jsx";
import arrowUpRight from "../assets/arrow-up-right.svg";

const variants = {
  primary:
    "bg-emerald text-emerald-ink border border-transparent hover:bg-[#7aedba]",
  secondary:
    "bg-elevated text-ink border border-border hover:bg-surface",
  ghost: "bg-transparent text-ink border-0",
};

export default function Button({
  variant = "primary",
  size = "md",
  inert = false,
  showArrow = false,
  className = "",
  children,
}) {
  const height = size === "sm" ? "h-10 px-4 text-[13px]" : "h-[50px] px-[22px] text-[14px]";

  return (
    <button
      type="button"
      disabled={inert}
      aria-disabled={inert}
      className={`inline-flex items-center justify-center gap-2.5 rounded-control font-semibold leading-normal disabled:opacity-100 ${variants[variant]} ${height} ${className}`}
    >
      {children}
      {showArrow ? <Icon src={arrowUpRight} alt="" /> : null}
    </button>
  );
}
