import Button from "./Button.jsx";
import SectionEyebrow from "./SectionEyebrow.jsx";

export default function FinalCta() {
  return (
    <section className="px-5 py-16 lg:px-20 lg:pb-20">
      <div className="flex flex-col items-center gap-[25px] rounded-panel border border-[#2b4438] bg-linear-to-r from-[#182c24] via-[#101b17] to-surface px-6 py-16 text-center lg:px-[180px] lg:py-[72px]">
        <SectionEyebrow>YOUR NEXT CHAPTER STARTS HERE</SectionEyebrow>
        <h2 className="max-w-[920px] text-[36px] leading-[1.15] tracking-[-2.4px] lg:text-[53px]">
          Good with money.
          <br />
          <span className="text-emerald">Great at being you.</span>
        </h2>
        <p className="text-[16px] text-muted">
          Make space for what matters. We’ll help with the numbers.
        </p>
        <Button inert showArrow>
          Get Started — it’s free
        </Button>
        <p className="text-[11px] text-subtle">No credit card. No pressure. Just clarity.</p>
      </div>
    </section>
  );
}
