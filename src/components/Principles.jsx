import Icon from "./Icon.jsx";
import check from "../assets/check.svg";

const principles = [
  {
    title: "Your finances in one place",
    description: "Income, expenses, and balance together",
  },
  {
    title: "Simple manual tracking",
    description: "Add and organize transactions yourself",
  },
  {
    title: "Manage your money your way",
    description: "Stay in control of your financial records",
  },
];

export default function Principles() {
  return (
    <section
      id="why-velto"
      className="scroll-mt-24 grid gap-8 border-y border-border px-6 py-11 lg:grid-cols-3 lg:items-center lg:justify-between lg:gap-10 lg:px-[110px] lg:py-11"
    >
      {principles.map((item) => (
        <div key={item.title} className="flex items-center gap-3.5">
          <span className="size-[17px] shrink-0 overflow-hidden">
            <Icon src={check} alt="" />
          </span>
          <div>
            <p className="text-[14px] text-ink">{item.title}</p>
            <p className="mt-1.5 text-[12px] text-muted">{item.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
