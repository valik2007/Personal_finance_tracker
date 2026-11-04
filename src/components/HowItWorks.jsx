import Icon from "./Icon.jsx";
import SectionEyebrow from "./SectionEyebrow.jsx";
import link from "../assets/link.svg";
import chartPieLg from "../assets/chart-pie-lg.svg";
import flag from "../assets/flag.svg";

const steps = [
  {
    number: "01",
    icon: link,
    title: "Track your money.",
    description:
      "Add your income and expenses manually. Keep everything organized in one place.",
  },
  {
    number: "02",
    icon: chartPieLg,
    title: "Plan your spending.",
    description:
      "Set monthly budgets for different categories and track your progress.",
  },
  {
    number: "03",
    icon: flag,
    title: "Understand your finances.",
    description: "View your balance, transaction history, and spending charts.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-border bg-surface px-5 py-16 lg:px-20 lg:pt-20 lg:pb-24"
    >
      <div className="mb-[50px] flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[700px]">
          <SectionEyebrow>SMALL STEPS. CLEAR DIRECTION.</SectionEyebrow>
          <h2 className="mt-[18px] text-[36px] leading-[1.13] tracking-[-1.8px] lg:text-[46px]">
            A fresh start, in three steps.
          </h2>
        </div>
        <p className="text-[12px] text-muted">Less setup. More living.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-14">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <p className="text-[13px] text-emerald">{step.number}</p>
              <span className="size-5 overflow-hidden">
                <Icon src={step.icon} alt="" />
              </span>
            </div>
            <h3 className="text-[22px] font-medium tracking-[-0.5px]">{step.title}</h3>
            <p className="text-[14px] leading-[1.7] text-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
