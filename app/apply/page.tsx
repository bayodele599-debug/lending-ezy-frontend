"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Info, LockKeyhole, SlidersHorizontal } from "lucide-react";
import { countries } from "../../lib/countries";
import {
  businessPurposes, defaultPlan, money, personalPurposes, repaymentTerms,
  savePlan, readPlans, summary, supportedCurrencies, validPlan,
  type PlanInput, type BorrowerType
} from "../../lib/plans";

const steps = ["Your goals", "The numbers", "Review & save"];

export default function Apply() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const plannerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef(0);
  const [plan, setPlan] = useState<PlanInput>(defaultPlan);
  const [editingId, setEditingId] = useState<string>();
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const estimate = useMemo(() => summary(plan), [plan]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (editId) {
      const found = readPlans().find(item => item.id === editId);
      if (found) {
        setPlan({type: found.type, purpose: found.purpose, country: found.country, currency: found.currency, amount: found.amount, months: found.months, annualRate: found.annualRate});
        setEditingId(found.id);
      }
    } else {
      const type = params.get("type") === "business" ? "business" : "personal";
      const amount = Number(params.get("amount"));
      const months = Number(params.get("months"));
      const rate = Number(params.get("rate"));
      const currency = params.get("currency");
      const allowedCurrency = supportedCurrencies.find(x => x === currency);
      setPlan(old => ({
        ...old,
        type,
        purpose: type === "business" ? businessPurposes[0] : personalPurposes[0],
        amount: params.has("amount") && Number.isFinite(amount) && amount >= 500 && amount <= 10000000
          ? amount : type === "business" ? 60000 : 12000,
        months: repaymentTerms.find(x => x === months) ?? (type === "business" ? 36 : 24),
        annualRate: params.has("rate") && Number.isFinite(rate) && rate >= 0 && rate <= 40 ? rate : 12,
        currency: allowedCurrency ?? "USD"
      }));
    }
    setReady(true);
  }, []);

  // Focus the new step and align the actual form below the persistent island header.
  // Do not scroll to the top of the entire page: that hides the form beneath the intro.
  useEffect(() => {
    if (!ready || previousStepRef.current === step) return;
    previousStepRef.current = step;
    headingRef.current?.focus({preventScroll: true});
    plannerRef.current?.scrollIntoView({
      block: "start",
      behavior: "auto"
    });
  }, [step, ready]);

  function update<K extends keyof PlanInput>(key: K, value: PlanInput[K]) {
    setError("");
    setPlan(current => ({...current, [key]: value}));
  }

  function chooseType(type: BorrowerType) {
    setPlan(current => ({
      ...current, type, purpose: type === "business" ? businessPurposes[0] : personalPurposes[0],
      amount: type === "business" && current.type !== type ? 60000 : type === "personal" && current.type !== type ? 12000 : current.amount
    }));
    setError("");
  }

  function next() {
    if (step === 0 && (!plan.country || !plan.purpose)) {
      setError("Choose your country and financing purpose to continue.");
      return;
    }
    if (step === 1 && !validPlan(plan)) {
      setError("Enter an amount from 500 to 10,000,000 and a rate from 0% to 40%.");
      return;
    }
    setStep(value => Math.min(value + 1, 2));
    setError("");

  }

  function finish() {
    if (!validPlan(plan)) {
      setError("Please review your plan before saving.");
      return;
    }
    try {
      savePlan(plan, editingId);
      router.push("/dashboard?saved=1");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this plan.");
    }
  }

  return (
    <main id="main-content" className="planner-page">
      <div className="container planner-intro">
        <div>
          <p className="overline">Your financing plan</p>
          <h1>{editingId ? "Refine your" : "Make a plan for"} <em>{editingId ? "next move." : "what's next."}</em></h1>
          <p>Explore a borrowing scenario at your own pace. Adjust the details, understand your estimated costs and keep your plan in one place.</p>
        </div>
        <Link href="/dashboard" className="planner-my-plans">My saved plans <ArrowUpRight size={17}/></Link>
      </div>
      <div className="container planner-shell">
        <section className="planner-main" ref={plannerRef} aria-label="Build your financing plan">
          <div className="planner-progress" aria-label="Progress">
            {steps.map((label, index) => (
              <div key={label} className={"planner-progress-step" + (index === step ? " active" : "") + (index < step ? " done" : "")} aria-current={index === step ? "step" : undefined}>
                <span>{index < step ? <Check size={15}/> : String(index + 1).padStart(2, "0")}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {!ready ? <p role="status">Preparing your plan…</p> : (
            <>
              {step === 0 && <div className="planner-panel">
                <p className="overline">01 / Your goals</p>
                <h2 tabIndex={-1} ref={headingRef}>What are you <em>planning for?</em></h2>
                <p className="planner-helper">Choose a purpose and the country where you would explore financing.</p>
                <div className="planner-type-grid" role="group" aria-label="Financing type">
                  <button type="button" className={plan.type === "personal" ? "selected" : ""} aria-pressed={plan.type === "personal"} onClick={() => chooseType("personal")}>
                    <strong>Personal</strong><span>Plans for life, home, travel or family.</span>
                  </button>
                  <button type="button" className={plan.type === "business" ? "selected" : ""} aria-pressed={plan.type === "business"} onClick={() => chooseType("business")}>
                    <strong>Business</strong><span>Working capital, inventory or your next stage.</span>
                  </button>
                </div>
                <div className="planner-field-grid">
                  <label className="planner-field"><span>What is the financing for?</span>
                    <select value={plan.purpose} onChange={event => update("purpose", event.target.value)}>
                      {(plan.type === "business" ? businessPurposes : personalPurposes).map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="planner-field"><span>Country or region</span>
                    <select value={plan.country} onChange={event => update("country", event.target.value)} required>
                      <option value="" disabled>Choose a country</option>
                      {countries.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}
                    </select>
                  </label>
                </div>
              </div>}
              {step === 1 && <div className="planner-panel">
                <p className="overline">02 / The numbers</p>
                <h2 tabIndex={-1} ref={headingRef}>Put the numbers <em>in perspective.</em></h2>
                <p className="planner-helper">Change each figure to see its effect on monthly repayments and total cost.</p>
                <div className="planner-field-grid">
                  <label className="planner-field"><span>Currency</span>
                    <select value={plan.currency} onChange={event => update("currency", event.target.value)}>
                      {supportedCurrencies.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="planner-field"><span>Repayment term</span>
                    <select value={plan.months} onChange={event => update("months", Number(event.target.value))}>
                      {repaymentTerms.map(item => <option key={item} value={item}>{item} months</option>)}
                    </select>
                  </label>
                  <label className="planner-field"><span>Financing amount ({plan.currency})</span>
                    <input type="number" value={plan.amount} min={500} max={10000000} step={100} inputMode="decimal" onChange={event => update("amount", Number(event.target.value))}/>
                  </label>
                  <label className="planner-field"><span>Assumed annual interest rate (%)</span>
                    <input type="number" value={plan.annualRate} min={0} max={40} step={0.25} inputMode="decimal" onChange={event => update("annualRate", Number(event.target.value))}/>
                  </label>
                </div>
                <div className="planner-range-label"><span>Adjust amount</span><strong>{money(plan.amount || 0, plan.currency)}</strong></div>
                <input className="planner-range" type="range" min={500} max={plan.amount > 250000 ? 10000000 : 250000} step={plan.amount > 250000 ? 10000 : 500} aria-label="Adjust financing amount" value={Math.min(plan.amount > 250000 ? 10000000 : 250000, Math.max(500, plan.amount))} onChange={event => update("amount", Number(event.target.value))}/>
                <div className="planner-interest-note"><Info size={18}/><span>The interest rate is an assumption you control, not a lender's quoted rate. Choosing a currency does not convert exchange rates.</span></div>
              </div>}
              {step === 2 && <div className="planner-panel">
                <p className="overline">03 / Review & save</p>
                <h2 tabIndex={-1} ref={headingRef}>A clearer view of <em>your plan.</em></h2>
                <p className="planner-helper">Check the details before saving this plan to your device.</p>
                <dl className="planner-review">
                  <div><dt>Financing</dt><dd>{plan.type === "personal" ? "Personal" : "Business"} · {plan.purpose}</dd></div>
                  <div><dt>Country</dt><dd>{countries.find(x => x.code === plan.country)?.label ?? plan.country}</dd></div>
                  <div><dt>Amount</dt><dd>{money(plan.amount, plan.currency)}</dd></div>
                  <div><dt>Term & assumption</dt><dd>{plan.months} months · {plan.annualRate}% yearly</dd></div>
                  <div><dt>Est. monthly repayment</dt><dd>{money(estimate.monthly, plan.currency)}</dd></div>
                  <div><dt>Est. total repayment</dt><dd>{money(estimate.total, plan.currency)}</dd></div>
                </dl>
                <p className="planner-trust-note"><LockKeyhole size={19}/> This saves a private financial estimate in this browser. It does not send a credit application or create a loan offer.</p>
              </div>}
              {error && <p className="planner-error" role="alert">{error}</p>}
              <div className="planner-actions">
                {step > 0 ? <button type="button" className="button button-outline-dark" onClick={() => {setStep(step - 1);setError("");}}><ArrowLeft size={17}/> Back</button> : <Link href="/" className="planner-secondary-link"><ArrowLeft size={17}/> Back to home</Link>}
                <button type="button" className="button button-primary" onClick={step === 2 ? finish : next} disabled={!ready}>
                  {step === 2 ? (editingId ? "Update saved plan" : "Save my plan") : "Continue"}
                  {step === 2 ? <Check size={18}/> : <ArrowRight size={18}/>}
                </button>
              </div>
            </>
          )}
        </section>
        <aside className="planner-summary" aria-label="Live repayment summary">
          <span className="planner-summary-overline"><SlidersHorizontal size={16}/> YOUR PLAN AT A GLANCE</span>
          <h2>{money(estimate.monthly, plan.currency)}</h2>
          <p>Estimated monthly repayment</p>
          <div className="planner-summary-bar"><span style={{width: estimate.total ? (plan.amount / estimate.total * 100) + "%" : "100%"}}/></div>
          <dl>
            <div><dt>Amount</dt><dd>{money(plan.amount || 0, plan.currency)}</dd></div>
            <div><dt>Term</dt><dd>{plan.months} months</dd></div>
            <div><dt>Assumed rate</dt><dd>{plan.annualRate}% / year</dd></div>
            <div><dt>Est. interest</dt><dd>{money(estimate.interest, plan.currency)}</dd></div>
            <div className="planner-summary-total"><dt>Est. total repayment</dt><dd>{money(estimate.total, plan.currency)}</dd></div>
          </dl>
          <p className="planner-summary-fine">Repayment illustration excludes fees, taxes and other charges. Change the assumptions to compare outcomes.</p>
        </aside>
      </div>
      <section className="container planner-bottom"><span>Prefer to start with repayment figures?</span><Link href="/#calculator" className="inline-link">Open the full calculator <ArrowUpRight size={16}/></Link></section>
    </main>
  );
}
