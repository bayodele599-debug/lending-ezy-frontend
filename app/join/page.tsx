"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Info, LockKeyhole, Mail } from "lucide-react";
import { postJSON } from "../../lib/api";
import { countries } from "../../lib/countries";

type Kind = "borrower" | "partner";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const enabled = process.env.NEXT_PUBLIC_INQUIRIES_ENABLED === "true" && Boolean(process.env.NEXT_PUBLIC_API_URL) && (process.env.NODE_ENV !== "production" || Boolean(siteKey));

export default function Join() {
  const [kind, setKind] = useState<Kind>("borrower");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [institution, setInstitution] = useState("");
  const [interest, setInterest] = useState("personal");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || busy) return;
    setBusy(true); setError("");
    try {
      const turnstile_token = siteKey ? document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value : undefined;
      const result = await postJSON<{ received: boolean; reference?: string }>("/api/v1/inquiries", {
        kind, name, email, country, institution: kind === "partner" ? institution : undefined,
        product_interest: kind === "borrower" ? interest : undefined,
        message: message.trim() || undefined, consent_to_contact: consent, website, turnstile_token
      });
      if (result.received) setReference(result.reference || "received");
      else setError("Your message could not be recorded. Please try again.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't send your message. Please try again.");
    } finally { setBusy(false); }
  }

  return <main id="main-content" className="contact-page">
    <section className="container contact-layout">
      <div className="contact-side">
        <Link href="/" className="back-link"><ArrowLeft size={17}/> Back to home</Link>
        <p className="overline">Get in touch</p>
        <h1>Let's start a <em>conversation.</em></h1>
        <p>Whether you're interested in future borrowing options or building with us as a lending partner, we'd like to hear from you.</p>
        <div className="contact-points"><div><span><Mail size={19}/></span><div><h3>A direct enquiry</h3><p>Share a question or describe your institution and its requirements.</p></div></div><div><span><LockKeyhole size={19}/></span><div><h3>Only the essentials</h3><p>We don't ask for bank details, identity documents or credit history here.</p></div></div></div>
        
      </div>
      <div className="contact-card">
        {reference ? <div className="contact-success"><span className="success-symbol"><Check size={31}/></span><h2>Thank you for reaching out.</h2><p>Your message has been recorded. Our team can review it using the reference below.</p><div className="reference-box"><span>Your reference</span><strong>{reference}</strong></div><Link href="/" className="button button-primary">Back to home <ArrowUpRight size={17}/></Link></div> :
        <>
          <div className="contact-card-header"><span>CONTACT LENDING EZY</span><h2>{enabled ? "Tell us a little about yourself." : "Start with a plan you can keep."}</h2><p>{enabled ? "We will use your details only to respond to this enquiry." : "Choose your goals, explore repayment figures and save financing scenarios."}</p></div>
          {enabled && <div className="contact-tabs" role="group" aria-label="Reason for contacting us"><button type="button" aria-pressed={kind === "borrower"} className={kind === "borrower" ? "active" : ""} onClick={() => {setKind("borrower");setError("");}}>I'm an individual</button><button type="button" aria-pressed={kind === "partner"} className={kind === "partner" ? "active" : ""} onClick={() => {setKind("partner");setError("");}}>I'm a lending business</button></div>}
          {!enabled && <div className="service-notice"><Info size={20}/><div><p>Direct enquiries are currently closed. You can still build, save and compare your financing plans.</p><Link href="/apply" className="inline-link">Start a plan <ArrowUpRight size={17}/></Link></div></div>}
          {enabled && <form className="contact-form" onSubmit={submit}>
            <div className="form-row"><label className="form-field"><span>Full name *</span><input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your full name"/></label><label className="form-field"><span>Email address *</span><input required type="email" maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label></div>
            <label className="form-field"><span>Country or region *</span><select required value={country} onChange={event => setCountry(event.target.value)}><option value="">Select where you live or operate</option>{countries.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
            {kind === "partner" ? <label className="form-field"><span>Institution or business name *</span><input required minLength={2} maxLength={150} value={institution} onChange={event => setInstitution(event.target.value)} placeholder="Your organisation"/></label> :
              <label className="form-field"><span>What are you interested in?</span><select value={interest} onChange={event => setInterest(event.target.value)}><option value="personal">Personal borrowing</option><option value="business">Business borrowing</option><option value="salary_advance">Salary advance</option><option value="other">Something else</option></select></label>}
            <label className="form-field"><span>Your message (optional)</span><textarea rows={4} maxLength={1500} value={message} onChange={event => setMessage(event.target.value)} placeholder={kind === "partner" ? "Tell us about your organisation and what you're looking for." : "Tell us what you'd like to know. Please don't include financial account details."}/></label>
            <div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)}/></label></div>
            <label className="consent-label"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)}/><span>I agree to be contacted about this enquiry. See <Link href="/privacy">privacy & data</Link>.</span></label>
            {siteKey && <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive"/><div className="cf-turnstile" data-sitekey={siteKey}/></>}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary submit-button" type="submit" disabled={!consent || busy}>{busy ? "Sending enquiry…" : "Send enquiry"} <ArrowRight size={17}/></button>
            <p className="form-footnote">For privacy, please do not include financial account credentials or identity documents in your message.</p>
          </form>}
        </>}
      </div>
    </section>
  </main>;
}
