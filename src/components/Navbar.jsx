import { useState } from "react";
import Logo from "./Logo.jsx";
import Button from "./Button.jsx";
import Icon from "./Icon.jsx";
import menuIcon from "../assets/menu.svg";

const links = [
  { href: "#why-velto", label: "Why Velto" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#security", label: "Security" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-canvas">
      <nav className="flex h-[76px] items-center justify-between px-5 lg:h-24 lg:px-20">
        <span className="lg:hidden">
          <Logo size="sm" />
        </span>
        <span className="hidden lg:inline-flex">
          <Logo />
        </span>

        <div className="hidden items-center gap-8 text-[13px] text-muted lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          <Button variant="ghost" size="sm" inert className="px-0 text-[13px] font-medium">
            Sign In
          </Button>
          <Button variant="primary" size="sm" inert showArrow>
            Get Started
          </Button>
        </div>

        <div className="flex items-center gap-[22px] lg:hidden">
          <Button variant="ghost" size="sm" inert className="h-auto px-0 text-[12px] font-normal">
            Sign In
          </Button>
          <button
            type="button"
            className="size-[22px] overflow-hidden"
            aria-expanded={open}
            aria-label="Open menu"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon src={menuIcon} alt="" />
          </button>
        </div>
      </nav>

      {open ? (
        <div className="flex flex-col gap-4 border-t border-border bg-canvas px-5 py-5 lg:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] text-muted"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}
