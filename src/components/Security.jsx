import Icon from "./Icon.jsx";
import SectionEyebrow from "./SectionEyebrow.jsx";
import shieldCheck from "../assets/shield-check.svg";
import lock from "../assets/lock.svg";
import fingerprint from "../assets/fingerprint.svg";

const items = [
  {
    icon: shieldCheck,
    title: "Your finances, organized.",
    description: "Keep your income, expenses, and budgets together in one place.",
  },
  {
    icon: lock,
    title: "You're in control.",
    description: "Add and manage your transactions manually, whenever you want.",
  },
  {
    icon: fingerprint,
    title: "Simple by design.",
    description: "Track your finances without connecting a bank account.",
  },
];

export default function Security() {
  return (
    <section
      id="security"
      className="scroll-mt-24 border-b border-border bg-surface px-5 py-16 lg:flex lg:items-center lg:gap-24 lg:px-20 lg:py-[72px]"
    >
      <div className="mb-10 max-w-[480px] lg:mb-0">
        <SectionEyebrow>SIMPLE BY DESIGN</SectionEyebrow>
        <h2 className="mt-[18px] text-[36px] leading-[1.13] tracking-[-1.8px] lg:text-[46px]">
          Your money. Your decisions.
        </h2>
        <p className="mt-[18px] text-[17px] leading-[1.65] text-muted">
          Clarity should never come at the cost of control.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-7">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-[18px]">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-elevated">
              <span className="size-5 overflow-hidden">
                <Icon src={item.icon} alt="" />
              </span>
            </div>
            <div>
              <p className="text-[15px] font-medium">{item.title}</p>
              <p className="mt-[7px] text-[13px] text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
