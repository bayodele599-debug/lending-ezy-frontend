import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, CircleHelp, Globe2, MoveUpRight, ShieldCheck } from "lucide-react";
import RepaymentCalculator from "../components/repayment-calculator";
import PhotoFrame from "../components/photo-frame";
import Reveal from "../components/reveal";

const questions = [
  ["How do I get started?", "Choose personal or business, build your financing plan and review the monthly repayment. You can save and revisit different scenarios."],
  ["Can I change my repayment assumptions?", "Yes. Adjust the amount, currency, interest rate or repayment term as often as you like."],
  ["Where are my saved plans?", "Use My plans to find scenarios stored on this device. You can edit, duplicate, compare, download or remove them."],
  ["Can I speak with Lending Ezy?", "Visit Get in touch for information about reaching the team or making an institutional enquiry."]
];

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero">
        <div className="container hero-layout">
          <div className="hero-copy">
            <p className="overline overline-light"><span className="overline-rule"/> A more thoughtful approach to borrowing</p>
            <h1>Make room for <em>what matters.</em></h1>
            <p className="hero-description">Borrowing is a big decision. Start with clear numbers, straightforward explanations and the confidence to understand your options.</p>
            <div className="hero-actions">
              <Link href="/apply" className="button button-cream">Build your plan <ArrowUpRight size={18}/></Link>
              <Link href="/#calculator" className="text-button text-button-light">Explore repayments <ArrowRight size={18}/></Link>
            </div>
            <p className="hero-disclaimer">A clearer starting point for your next financial decision.</p>
          </div>
          <div className="hero-editorial" role="group" aria-label="Three principles behind Lending Ezy">
            <div className="editorial-top"><span>THE LENDING EZY APPROACH</span><span>01 — 03</span></div>
            <div className="editorial-monogram" aria-hidden="true"><span>le</span><i>.</i></div>
            <div className="editorial-bottom">
              <div><span>01</span><p>Know your numbers.</p></div>
              <div><span>02</span><p>Understand the details.</p></div>
              <div><span>03</span><p>Decide on your terms.</p></div>
            </div>
          </div>
        </div>
        <div className="container hero-baseline"><span>LESS GUESSWORK. MORE CLARITY.</span><span>BUILT FOR THE DECISIONS THAT MATTER <MoveUpRight size={16}/></span></div>
      </section>

      <section className="section intro-section">
        <Reveal className="container intro-layout">
          <div><p className="overline">A different starting point</p><h2>Money is personal.<br/><em>So is your next move.</em></h2></div>
          <div className="intro-right"><p>Whether you are planning a milestone, managing an unexpected expense or looking ahead for your business, understanding the numbers should be the easy part.</p><Link href="/about" className="inline-link">Why we are building Lending Ezy <ArrowUpRight size={17}/></Link></div>
        </Reveal>
      </section>

      <section className="section product-section">
        <div className="container">
          <div className="section-heading-row"><div><p className="overline">Find your direction</p><h2>What are you <em>planning?</em></h2></div><p>Explore the possibilities at your own pace. No pressure, no complicated language.</p></div>
          <Reveal className="product-grid">
            <Link href="/apply?type=personal" className="product-tile product-tile-personal">
              <div className="tile-top"><span>01 / FOR INDIVIDUALS</span><ArrowUpRight size={25}/></div>
              <div className="tile-art tile-art-personal" aria-hidden="true"><span className="tile-circle"/><span className="tile-cut"/></div>
              <div><h3>Personal borrowing</h3><p>Make sense of repayments for the things that matter to you.</p><span className="tile-link">Start a personal plan <ArrowRight size={18}/></span></div>
            </Link>
            <Link href="/apply?type=business" className="product-tile product-tile-business">
              <div className="tile-top"><span>02 / FOR BUSINESSES</span><ArrowUpRight size={25}/></div>
              <div className="tile-art tile-art-business" aria-hidden="true"><span/><span/><span/></div>
              <div><h3>Business borrowing</h3><p>Plan ahead with clearer figures for your next business decision.</p><span className="tile-link">Start a business plan <ArrowRight size={18}/></span></div>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="photo-story-section" aria-labelledby="photo-story-heading">
        <div className="container photo-story-grid">
          <PhotoFrame
            className="photo-story-frame"
            src="https://images.unsplash.com/photo-1739303987875-db274ba45b60?auto=format&fit=crop&w=1600&q=82"
            alt="Two women sharing a cheerful moment across a café table"
            credit="Ninthgrid"
            creditHref="https://unsplash.com/photos/AB04SBsdHjY"
            sizes="(max-width: 900px) 100vw, 58vw"
          />
          <Reveal className="photo-story-copy" delay={0.12}>
            <p className="overline">The human side of money</p>
            <h2 id="photo-story-heading">Behind every number, <em>there's a story.</em></h2>
            <p>Life isn't lived in spreadsheets. There are plans to make, people to support and decisions worth thinking through. We're here to make the numbers easier to understand.</p>
            <Link href="/how-it-works" className="inline-link">Our approach to borrowing <ArrowUpRight size={17}/></Link>
          </Reveal>
        </div>
      </section>

      <section className="section calculator-section" id="calculator">
        <div className="container">
          <div className="section-heading-row"><div><p className="overline">The numbers, made simple</p><h2>See the full <em>picture.</em></h2></div><p>Adjust the amount, interest rate and term. See how each choice changes the estimated monthly repayment and total cost.</p></div>
          <RepaymentCalculator/>
        </div>
      </section>

      <section className="section steps-section">
        <Reveal className="container steps-layout">
          <div className="steps-heading"><p className="overline">A clear way forward</p><h2>One step<br/><em>at a time.</em></h2><p>We believe good financial decisions begin with understanding, not urgency.</p><Link href="/how-it-works" className="inline-link">Read how it works <ArrowUpRight size={17}/></Link></div>
          <div className="steps-list">
            <div><span>01</span><div><h3>Start with your needs</h3><p>Think about what you want to achieve and what repayments would be manageable.</p></div><ChevronRight size={21}/></div>
            <div><span>02</span><div><h3>Explore the figures</h3><p>Use the calculator to understand the relationship between term, rate and total cost.</p></div><ChevronRight size={21}/></div>
            <div><span>03</span><div><h3>Save and compare</h3><p>Keep your favourite scenarios and return to them whenever your plans change.</p></div><ChevronRight size={21}/></div>
          </div>
        </Reveal>
      </section>

      <section className="section principles-section">
        <Reveal className="container principles-layout">
          <div><p className="overline">Our principles</p><h2>Trust is built<br/><em>in the details.</em></h2></div>
          <div className="principles-grid">
            <article><span className="principle-icon"><Check size={22}/></span><h3>Clear information</h3><p>Plain language and transparent assumptions, so the figures are easier to understand.</p></article>
            <article><span className="principle-icon"><ShieldCheck size={22}/></span><h3>Responsible by design</h3><p>Clear calculations, helpful context and responsible planning at every stage.</p></article>
            <article><span className="principle-icon"><Globe2 size={22}/></span><h3>International perspective</h3><p>Designed to work across borders, while respecting the rules of each market.</p></article>
          </div>
        </Reveal>
      </section>

      <section className="section faq-section">
        <div className="container faq-layout"><div><p className="overline">Good to know</p><h2>Questions?<br/><em>Let's make it clear.</em></h2><Link className="inline-link" href="/faq">All common questions <ArrowUpRight size={17}/></Link></div>
          <div className="faq-accordion">{questions.map(([question,answer])=><details key={question}><summary><span>{question}</span><CircleHelp size={19}/></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="closing-section"><div className="container closing-layout"><div><p className="overline overline-light">Your next chapter</p><h2>A little more clarity<br/>goes a long way.</h2><p>Put your goals and the numbers together in a plan you can keep.</p></div><Link href="/apply" className="button button-cream">Get started <ArrowUpRight size={18}/></Link></div></section>
    </main>
  );
}
