import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
export const metadata: Metadata = { title: "Frequently asked questions", description: "Questions about creating and comparing borrowing plans, repayment figures and Lending Ezy." };
const groups = [
  { title: "Planning & saved scenarios", items: [
    ["How do I start a financing plan?", "Select Get started, choose personal or business, add your country and financing goal, then adjust the figures to suit your plans."],
    ["Can I save more than one plan?", "Yes. You can save up to 25 plans on this device, edit them, make a copy, delete them and select up to three for side-by-side comparison."],
    ["Where are my plans saved?", "Plans are saved in your browser on the device you're using. They are not synced to an online account. Clearing browser data removes them."],
    ["Can I use a different currency?", "Yes. Choose from the currencies in the calculator or planner. Switching currencies changes the unit shown; it does not convert the amount."],
    ["Is a saved plan a loan application?", "No. A saved plan is a private repayment estimate. It does not mean a loan has been applied for, approved or offered."]
  ]},
  { title: "Repayments & costs", items: [
    ["How are monthly repayments calculated?", "The calculator models fixed-rate, monthly amortising repayments using your chosen amount, term and nominal annual rate."],
    ["How can I compare scenarios?", "Save two or three plans, open My plans and tick Compare on the ones you'd like to review. You can also compare scenarios inside the calculator."],
    ["Can I download a repayment schedule?", "Yes. Open the calculator's repayment schedule or use Download on a saved plan to export monthly repayment figures as CSV."],
    ["Does the total include every borrowing cost?", "The estimate includes principal and calculated interest, but excludes fees, taxes, insurance and any charges associated with a lending product."],
    ["Do estimates guarantee an interest rate?", "No. The interest rate is an assumption you enter to understand a financing scenario; it is not a quoted rate or regulated APR."]
  ]},
  { title: "Privacy & partnerships", items: [
    ["What information is saved on my device?", "Your saved plans contain financing assumptions only: purpose, country, currency, amount, term and assumed rate. They do not contain identity documents, passwords or bank details."],
    ["Can a lending institution contact Lending Ezy?", "Visit Get in touch to explore potential partnerships and institution-specific requirements."],
    ["Is lending available in every country?", "No single financial product is available in every market. Any lending service needs the appropriate local provider, authorisations and applicable disclosures."]
  ]}
];
export default function FAQ() { return <main id="main-content">
  <section className="inner-hero"><div className="container inner-hero-grid"><div><p className="overline">Common questions</p><h1>Good questions.<br/><em>Clear answers.</em></h1><p>Find what you need to know about planning, repayments, privacy and working with Lending Ezy.</p></div><div className="editorial-aside"><span>OUR APPROACH</span><blockquote>Plain language, from the first question.</blockquote></div></div></section>
  <section className="section"><div className="container faq-page-content">{groups.map(group => <div className="faq-group" key={group.title}><h2>{group.title}</h2><div className="faq-accordion">{group.items.map(([question, answer]) => <details key={question}><summary><span>{question}</span><Plus size={19}/></summary><p>{answer}</p></details>)}</div></div>)}</div></section>
  <section className="closing-section"><div className="container closing-layout"><div><p className="overline overline-light">A good place to begin</p><h2>Make your next move clearer.</h2><p>Try different numbers and build a plan around your own goals.</p></div><Link href="/apply" className="button button-cream">Get started <ArrowUpRight size={17}/></Link></div></section>
</main>; }
