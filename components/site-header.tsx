"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { href: "/personal", label: "Personal" },
  { href: "/business", label: "Business" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/dashboard", label: "My plans" }
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // An expanded navigation can be dismissed without navigating, and focus returns to its button.
  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    function closeOutside(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Lending Ezy home" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">le<span>.</span></span>
          <span className="brand-name">lending <strong>ezy</strong></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(item => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="header-cta" href="/apply" aria-current={pathname === "/apply" ? "page" : undefined} onClick={() => setOpen(false)}>
            Get started <ArrowUpRight size={16} strokeWidth={1.8}/>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            onClick={() => setOpen(value => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={23}/> : <Menu size={23}/>}
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className={open ? "mobile-nav open" : "mobile-nav"} aria-label="Mobile navigation">
        {links.map(item => (
          <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
        <Link href="/apply" className="mobile-contact" aria-current={pathname === "/apply" ? "page" : undefined} onClick={() => setOpen(false)}>
          Get started <ArrowUpRight size={17}/>
        </Link>
      </nav>
    </header>
  );
}
