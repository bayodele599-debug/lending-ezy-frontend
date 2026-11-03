import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export const metadata: Metadata = { title: "How it works", description: "Build, calculate, save and compare borrowing plans with Lending Ezy." };
const steps = [
  { number: "01", title: "Choose your goal", body: "Start with a personal or business purpose and select your country. Build a plan that reflects what you're working towards." },
  { number: "02", title: "Explore the numbers", body: "Adjust your amount, term, currency and assumed interest rate. See how the monthly repayment and total cost change." },
  { number: "03", title: "Save your plan", body: "Keep a borrowing scenario on your device and return to it later. Edit your figures or duplicate the plan to try a different approach." },
  { number: "04", title: "Compare your options", body: "Put up to three browser-saved plans side by side, review the total cost and download a repayment schedule for your own records." },
  { number: "05", title: "Track a request, when available", body: "When secure accounts and financing intake are enabled, use a verified account to send a request, follow the review team's progress and reply privately. This is a manual enquiry, not a loan approval." }
];
export default function HowItWorks() { return <main id="main-content">
  <section className="inner-hero"><div className="container inner-hero-grid"><div><p className="overline">How it works</p><h1>A better decision,<br/><em>step by step.</em></h1><p>From an idea to a clear financial plan, every step is designed to help you make sense of your options.</p><Link href="/apply" className="button button-primary">Build your plan <ArrowUpRight size={17}/></Link></div><div className="editorial-aside"><span>YOUR PLAN, YOUR PACE</span><blockquote>Understand the numbers. Then decide what's next.</blockquote></div></div></section>
  <section className="section"><div className="container"><div className="numbered-steps">{steps.map(step => <article key={step.number}><span>{step.number}</span><div><h2>{step.title}</h2><p>{step.body}</p></div></article>)}</div></div></section>
  <section className="closing-section"><div className="container closing-layout"><div><p className="overline overline-light">Your next move</p><h2>Keep the clarity with you.</h2><p>Create a plan now or revisit a scenario you've already saved.</p></div><Link href="/dashboard" className="button button-cream">My saved plans <ArrowUpRight size={18}/></Link></div></section>
</main>; }
