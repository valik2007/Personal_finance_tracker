import Logo from "./Logo.jsx";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#top" },
      { label: "Features", href: "#features" },
      { label: "Security", href: "#security" },
      { label: "Get started" },
    ],
  },
  {
    title: "Resources",
    links: [{ label: "Help center" }, { label: "Contact" }],
  },
  {
    title: "Company",
    links: [{ label: "Privacy policy" }, { label: "Terms of service" }],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border px-5 pt-14 pb-8 lg:px-20 lg:pt-14">
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-[100px]">
        <div className="flex-1">
          <Logo />
          <p className="mt-5 max-w-[280px] text-[13px] leading-[1.7] text-muted">
            A calmer relationship with money.
            <br />
            A clearer path to what’s next.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="flex w-[160px] flex-col gap-[17px] text-[12px]">
            <p className="font-semibold">{column.title}</p>
            {column.links.map((item) =>
              item.href ? (
                <a key={item.label} href={item.href} className="text-muted hover:text-ink">
                  {item.label}
                </a>
              ) : (
                <p key={item.label} className="text-muted">
                  {item.label}
                </p>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-[50px] flex flex-col gap-3 border-t border-border pt-6 text-[10px] text-subtle lg:flex-row lg:justify-between">
        <p>© 2026 Velto. All rights reserved.</p>
        <p>A personal finance tool. Not a bank or financial adviser.</p>
        <p>English · USD ↗</p>
      </div>
    </footer>
  );
}
