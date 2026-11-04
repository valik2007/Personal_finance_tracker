export default function FeatureCard({ icon, title, description, children }) {
  return (
    <article className="flex flex-col gap-6 rounded-card border border-border bg-surface p-7">
      <div className="flex size-10 items-center justify-center rounded-control bg-elevated">
        <span className="size-5 overflow-hidden">{icon}</span>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-[22px] tracking-[-0.6px]">{title}</h3>
        <p className="text-[14px] leading-[1.7] text-muted">{description}</p>
      </div>
      <div className="flex min-h-[152px] flex-col gap-3.5 rounded-[14px] bg-canvas p-[18px]">
        {children}
      </div>
    </article>
  );
}
