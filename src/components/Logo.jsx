import brandMark from "../assets/brand-mark.svg";
import brandMarkSm from "../assets/brand-mark-sm.svg";
import Icon from "./Icon.jsx";

export default function Logo({ size = "md" }) {
  const small = size === "sm";

  return (
    <a href="#top" className="flex items-center gap-[9px] text-ink no-underline">
      <span className={small ? "size-[28px] overflow-hidden" : "size-[34px] overflow-hidden"}>
        <Icon src={small ? brandMarkSm : brandMark} alt="" />
      </span>
      <span
        className={`font-normal tracking-[-1px] ${small ? "text-[23px]" : "text-[28px]"}`}
      >
        velto
      </span>
    </a>
  );
}
