import FeatureCard from "./FeatureCard.jsx";
import Icon from "./Icon.jsx";
import SectionEyebrow from "./SectionEyebrow.jsx";
import walletLg from "../assets/wallet-lg.svg";
import landmark from "../assets/landmark.svg";
import signalMuted from "../assets/signal-muted.svg";
import sliders from "../assets/sliders.svg";
import chartCombined from "../assets/chart-combined.svg";
import sparkles from "../assets/sparkles.svg";

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-5 py-16 lg:px-20 lg:py-[100px]">
      <div className="mb-11 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-[120px]">
        <div className="max-w-[650px]">
          <SectionEyebrow>LESS NOISE. MORE KNOW-HOW.</SectionEyebrow>
          <h2 className="mt-[18px] text-[36px] leading-[1.13] tracking-[-1.8px] lg:text-[46px]">
            Everything you need.
            <br />
            Nothing in your way.
          </h2>
        </div>
        <p className="max-w-[510px] text-[16px] leading-[1.7] text-muted">
          From the daily coffee to the bigger picture. A thoughtful toolkit that
          makes your money make sense.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <FeatureCard
          icon={<Icon src={walletLg} alt="" />}
          title="Your money, simplified."
          description="Track your income, expenses, and total balance in one place."
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-[30px] items-center justify-center rounded-[9px] bg-track">
              <span className="size-3.5 overflow-hidden">
                <Icon src={landmark} alt="" />
              </span>
            </div>
            <p className="flex-1 text-[11px]">Total balance</p>
            <p className="text-[12px]">$24,680.50</p>
          </div>
          <div className="flex items-center gap-[5px]">
            <span className="size-1 overflow-hidden">
              <Icon src={signalMuted} alt="" />
            </span>
            <p className="text-[9px] text-muted">Manually tracked</p>
          </div>
        </FeatureCard>

        <FeatureCard
          icon={<Icon src={sliders} alt="" />}
          title="A plan that fits your life."
          description="Give every category a little intention. Flexible budgets help you spend with confidence."
        >
          <div className="flex justify-between text-[11px]">
            <p>Food & groceries</p>
            <p className="text-[10px] text-emerald">On track</p>
          </div>
          <p className="text-[27px] font-medium tracking-[-1px]">
            $620 <span className="text-[12px] font-normal text-subtle">/ $800</span>
          </p>
          <div className="h-1.5 overflow-hidden rounded-[5px] bg-track">
            <div className="h-1.5 w-[77.5%] rounded-[5px] bg-emerald" />
          </div>
          <p className="text-[10px] text-muted">$180 left to spend this month</p>
        </FeatureCard>

        <FeatureCard
          icon={<Icon src={chartCombined} alt="" />}
          title="See the story, not a sheet."
          description="Turn everyday transactions into clear insights. Find the patterns. Keep the good habits."
        >
          <div className="flex items-center gap-2">
            <span className="size-3.5 overflow-hidden">
              <Icon src={sparkles} alt="" />
            </span>
            <p className="text-[10px] text-emerald">YOUR MONTH, A LITTLE SMARTER</p>
          </div>
          <p className="text-[27px] font-medium tracking-[-1px]">4.1% less</p>
          <p className="text-[12px] leading-[1.6] text-muted">
            You spent less than last month. Small shifts. Real progress.
          </p>
        </FeatureCard>
      </div>
    </section>
  );
}
