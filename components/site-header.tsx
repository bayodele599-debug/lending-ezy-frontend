"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { href: "/personal", label: "Personal" },
  { href: "/business", label: "Business" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQs" }
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Lending Ezy home" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">le<span>.</span></span>
          <span className="brand-name">lending <strong>ezy</strong></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link className="header-cta" href="/join">Get in touch <ArrowUpRight size={16} strokeWidth={1.8}/></Link>
          <button type="button" className="menu-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"}>{open ? <X size={23}/> : <Menu size={23}/>}</button>
        </div>
      </div>
      <nav id="mobile-navigation" className={open ? "mobile-nav open" : "mobile-nav"} aria-label="Mobile navigation">
        {links.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
        <Link href="/join" className="mobile-contact" onClick={() => setOpen(false)}>Get in touch <ArrowUpRight size={17}/></Link>
      </nav>
    </header>
  );
}
