import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Lending Ezy | Borrowing, made clearer", template: "%s | Lending Ezy" },
  description: "Build personal and business financing plans, explore repayment estimates, compare options and save your scenarios with Lending Ezy.",
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="container footer-main">
            <div className="footer-brand">
              <Link className="brand brand-footer" href="/" aria-label="Lending Ezy home">
                <span className="brand-mark" aria-hidden="true">le<span>.</span></span>
                <span className="brand-name">lending <strong>ezy</strong></span>
              </Link>
              <p>A more considered way to explore borrowing, built around clearer information and better choices.</p>
            </div>
            <div className="footer-column"><h2>Explore</h2><Link href="/personal">Personal borrowing</Link><Link href="/business">For businesses</Link><Link href="/apply">Build a plan</Link><Link href="/dashboard">My saved plans</Link>{(process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_ENABLED==="true"||process.env.NODE_ENV==="development")&&<Link href="/account">Customer account</Link>}<Link href="/#calculator">Repayment calculator</Link><Link href="/how-it-works">How it works</Link></div>
            <div className="footer-column"><h2>Lending Ezy</h2><Link href="/about">About us</Link><Link href="/partner">For lending partners</Link><Link href="/faq">Common questions</Link><Link href="/join">Get in touch</Link></div>
            <div className="footer-column"><h2>Information</h2><Link href="/privacy">Privacy & data</Link><Link href="/terms">Website information</Link><p>Clear assumptions, considered decisions and tools that put your plans in your hands.</p></div>
          </div>
          <div className="container footer-bottom"><span>© {new Date().getFullYear()} Lending Ezy. All rights reserved.</span><span>Clear information. Considered decisions.</span></div>
        </footer>
      </body>
    </html>
  );
}
