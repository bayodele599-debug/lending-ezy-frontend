"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Info, LockKeyhole, Mail } from "lucide-react";
import { postJSON } from "../../lib/api";

type Kind = "borrower" | "partner";
const isoCodes = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" ");
const names = new Intl.DisplayNames(["en"], { type: "region" });
const countries = isoCodes.map(code => ({ code, label: names.of(code) || code })).sort((a,b) => a.label.localeCompare(b.label));
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
        <div className="contact-points"><div><span><Mail size={19}/></span><div><h3>A direct enquiry</h3><p>Your message goes to our team when online enquiries are open.</p></div></div><div><span><LockKeyhole size={19}/></span><div><h3>Only the essentials</h3><p>We don't ask for bank details, identity documents or credit history here.</p></div></div></div>
        <p className="contact-availability">Actual lending services are not yet available through this website.</p>
      </div>
      <div className="contact-card">
        {reference ? <div className="contact-success"><span className="success-symbol"><Check size={31}/></span><h2>Thank you for reaching out.</h2><p>We've received your enquiry. It is not a credit application or a guarantee of an offer.</p><div className="reference-box"><span>Your reference</span><strong>{reference}</strong></div><Link href="/" className="button button-primary">Back to home <ArrowUpRight size={17}/></Link></div> :
        <>
          <div className="contact-card-header"><span>CONTACT LENDING EZY</span><h2>Tell us a little about yourself.</h2><p>We'll use your details only to respond to this enquiry.</p></div>
          <div className="contact-tabs" role="group" aria-label="Reason for contacting us"><button type="button" aria-pressed={kind === "borrower"} className={kind === "borrower" ? "active" : ""} onClick={() => {setKind("borrower");setError("");}}>I'm an individual</button><button type="button" aria-pressed={kind === "partner"} className={kind === "partner" ? "active" : ""} onClick={() => {setKind("partner");setError("");}}>I'm a lending business</button></div>
          {!enabled && <div className="service-notice"><Info size={20}/><p>Online enquiries are not open yet. The contact service must be activated before we can receive your details. You can still explore the site and repayment calculator.</p></div>}
          <form className="contact-form" onSubmit={submit}>
            <div className="form-row"><label className="form-field"><span>Full name *</span><input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your full name"/></label><label className="form-field"><span>Email address *</span><input required type="email" maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label></div>
            <label className="form-field"><span>Country or region *</span><select required value={country} onChange={event => setCountry(event.target.value)}><option value="">Select where you live or operate</option>{countries.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
            {kind === "partner" ? <label className="form-field"><span>Institution or business name *</span><input required minLength={2} maxLength={150} value={institution} onChange={event => setInstitution(event.target.value)} placeholder="Your organisation"/></label> :
              <label className="form-field"><span>What are you interested in?</span><select value={interest} onChange={event => setInterest(event.target.value)}><option value="personal">Personal borrowing</option><option value="business">Business borrowing</option><option value="salary_advance">Salary advance</option><option value="other">Something else</option></select></label>}
            <label className="form-field"><span>Your message (optional)</span><textarea rows={4} maxLength={1500} value={message} onChange={event => setMessage(event.target.value)} placeholder={kind === "partner" ? "Tell us about your organisation and what you're looking for." : "Tell us what you'd like to know. Please don't include financial account details."}/></label>
            <div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)}/></label></div>
            <label className="consent-label"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)}/><span>I agree to be contacted about this enquiry. I understand this is not a loan application and does not guarantee any offer. See <Link href="/privacy">privacy & data</Link>.</span></label>
            {siteKey && <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive"/><div className="cf-turnstile" data-sitekey={siteKey}/></>}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary submit-button" type="submit" disabled={!enabled || !consent || busy}>{busy ? "Sending enquiry…" : enabled ? "Send enquiry" : "Enquiries opening soon"} <ArrowRight size={17}/></button>
            <p className="form-footnote">Please do not share identity documents, banking credentials or sensitive financial information.</p>
          </form>
        </>}
      </div>
    </section>
  </main>;
}
