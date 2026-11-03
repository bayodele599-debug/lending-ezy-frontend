import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
export const metadata: Metadata = { title: "Frequently asked questions", description: "Answers about Lending Ezy, repayment estimates, country availability and contact enquiries." };
const groups = [
  { title: "Borrowing & availability", items: [
    ["Can I borrow money through Lending Ezy right now?", "Not yet. This website currently provides information and a repayment calculator. We do not accept loan applications, make credit decisions or disburse funds."],
    ["Is Lending Ezy available worldwide?", "The website is accessible internationally, but that does not mean loans are available in every country. Any future lending service will depend on local regulation, authorised lending providers and operational readiness."],
    ["Can I check if I'm eligible?", "There is no live eligibility or credit-checking service on this website. A calculator result does not indicate approval or eligibility."],
    ["Can I register my interest?", "When the contact service is enabled, you can submit a basic enquiry through our Get in touch page. It is not a loan application."]
  ]},
  { title: "Calculator & costs", items: [
    ["How does the repayment calculator work?", "It calculates a standard amortising monthly repayment using your amount, term and assumed annual interest rate. You can change each value and compare scenarios."],
    ["Are the displayed interest rates offered by a lender?", "No. The rate is an assumption you can edit. The calculator does not retrieve rates from a lender and does not calculate a regulated APR."],
    ["Are fees included?", "No. The calculator excludes origination fees, insurance, taxes, penalties and other charges. A future lender's full disclosures would be needed to understand the actual total cost."],
    ["Can I download my calculation?", "Yes. Open the repayment schedule in the calculator and select Download CSV. The file contains a month-by-month illustration."]
  ]},
  { title: "Privacy & partners", items: [
    ["Do I need to share bank or identity information?", "No. The public enquiry form does not request bank details, passwords, identification documents or credit reports."],
    ["Can lending institutions contact you?", "Yes. Use the Get in touch page and choose I'm a lending business to describe your institution and requirements."],
    ["Will I receive an offer if I send an enquiry?", "No. An enquiry does not create an application, guarantee a response time or imply that any lending product is available."]
  ]}
];
export default function FAQ() { return <main id="main-content"><section className="inner-hero"><div className="container inner-hero-grid"><div><p className="overline">Common questions</p><h1>Good questions.<br/><em>Clear answers.</em></h1><p>Everything you need to know about the website, repayment estimates and what comes next.</p></div><div className="editorial-aside"><span>OUR PROMISE</span><blockquote>Plain language, from the first question.</blockquote></div></div></section><section className="section"><div className="container faq-page-content">{groups.map(group => <div className="faq-group" key={group.title}><h2>{group.title}</h2><div className="faq-accordion">{group.items.map(([question, answer]) => <details key={question}><summary><span>{question}</span><Plus size={19}/></summary><p>{answer}</p></details>)}</div></div>)}</div></section><section className="closing-section"><div className="container closing-layout"><div><p className="overline overline-light">Something else?</p><h2>Ask us directly.</h2><p>Have a question we haven't covered?</p></div><Link href="/join" className="button button-cream">Get in touch <ArrowUpRight size={17}/></Link></div></section></main>; }
