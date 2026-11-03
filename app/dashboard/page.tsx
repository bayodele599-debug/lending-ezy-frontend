"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Copy, Download, Pencil, Plus, Trash2, Wallet, X } from "lucide-react";
import { countries } from "../../lib/countries";
import SubmitFinancingRequest, {requestIntakeEnabled} from "../../components/submit-financing-request";
import {
  downloadSchedule, money, readPlans, removePlan, savePlan, summary,
  type SavedPlan, type BorrowerType
} from "../../lib/plans";

type Filter = "all" | BorrowerType;

export default function Dashboard() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const refresh = useCallback(() => { setPlans(readPlans()); }, []);
  useEffect(() => {
    refresh();
    setReady(true);
    if (new URLSearchParams(window.location.search).get("saved") === "1") setNotice("Your plan has been saved on this device.");
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const visible = useMemo(() => plans.filter(plan => filter === "all" || plan.type === filter), [plans, filter]);
  const compared = useMemo(() => selected.map(id => plans.find(p => p.id === id)).filter((p): p is SavedPlan => Boolean(p)), [selected, plans]);

  function duplicate(plan: SavedPlan) {
    try {
      savePlan({type: plan.type, purpose: plan.purpose, country: plan.country, currency: plan.currency, amount: plan.amount, months: plan.months, annualRate: plan.annualRate});
      refresh();
      setNotice("A copy of your plan was saved.");
      setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not duplicate your plan."); }
  }
  function erase(id: string) {
    try {
      removePlan(id);
      setSelected(list => list.filter(x => x !== id));
      setDeletingId(null);
      refresh();
      setNotice("The plan was deleted from this browser.");
      setError("");
    } catch {
      setError("Unable to delete the plan in this browser.");
    }
  }
  function toggleCompare(id: string) {
    setSelected(items => items.includes(id) ? items.filter(x => x !== id) : items.length < 3 ? [...items, id] : items);
    setError("");
  }

  return <main id="main-content" className="my-plans-page">
    <div className="container saved-hero">
      <div><p className="overline">Your planning space</p><h1>Every plan starts <em>somewhere.</em></h1><p>Keep the scenarios that matter to you, revisit your numbers and compare different paths.</p></div>
      <Link className="button button-primary" href="/apply"><Plus size={18}/> Create a plan</Link>
    </div>
    <div className="container saved-body">
      {(process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_ENABLED==="true"||process.env.NODE_ENV==="development")&&
       <div className="saved-account-prompt"><Wallet size={21}/><p><strong>Want to keep plans across devices?</strong> Sign in to a secure account and choose which browser plans to import. Your browser plans stay here unless you import them.</p><Link href="/account">Explore my account <ArrowUpRight size={16}/></Link></div>}
      <div className="saved-toolbar">
        <div>
          <span className="saved-eyebrow">YOUR SAVED SCENARIOS</span>
          <h2>{ready ? plans.length : "—"} {ready && plans.length === 1 ? "plan" : "plans"}</h2>
        </div>
        <div role="group" className="saved-filters" aria-label="Filter by financing type">
          {(["all", "personal", "business"] as const).map(x =>
            <button type="button" key={x} aria-pressed={filter === x} className={filter === x ? "selected" : ""} onClick={() => setFilter(x)}>
              {x === "all" ? "All" : x === "personal" ? "Personal" : "Business"}
            </button>
          )}
        </div>
      </div>
      {notice && <div className="saved-notice" role="status"><Check size={17}/>{notice}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={16}/></button></div>}
      {error && <p className="planner-error" role="alert">{error}</p>}
      {!ready ? <div className="saved-empty"><p>Loading your saved plans…</p></div> : visible.length === 0 ? (
        <div className="saved-empty">
          <span className="saved-empty-icon"><Wallet size={29}/></span>
          <h3>{plans.length ? "No matching plans yet." : "Make room for your next move."}</h3>
          <p>{plans.length ? "Choose another category to see your saved scenarios." : "Start with your goals, try different repayment amounts and keep your first plan here."}</p>
          <Link className="button button-primary" href="/apply">Build a plan <ArrowUpRight size={17}/></Link>
        </div>
      ) : (
        <div className="saved-grid">
          {visible.map(plan => {
            const cost = summary(plan);
            return <article className="saved-card" key={plan.id}>
              <div className="saved-card-header"><span>{plan.type === "personal" ? "PERSONAL" : "BUSINESS"} / {plan.purpose}</span><span>{countries.find(x => x.code === plan.country)?.label ?? plan.country}</span></div>
              <h3>{money(plan.amount, plan.currency)}</h3>
              <p className="saved-card-purpose">{plan.months} months at an assumed {plan.annualRate}% annual rate</p>
              <div className="saved-payment"><span>Estimated monthly</span><strong>{money(cost.monthly, plan.currency)}</strong></div>
              <dl className="saved-card-stats">
                <div><dt>Interest</dt><dd>{money(cost.interest, plan.currency)}</dd></div>
                <div><dt>Total</dt><dd>{money(cost.total, plan.currency)}</dd></div>
              </dl>
              <div className="saved-card-tools">
                <label className="saved-compare"><input type="checkbox" checked={selected.includes(plan.id)} disabled={!selected.includes(plan.id) && selected.length >= 3} onChange={() => toggleCompare(plan.id)}/> Compare</label>
                <Link title="Edit plan" aria-label="Edit plan" href={"/apply?edit=" + encodeURIComponent(plan.id)}><Pencil size={18}/></Link>
                <button title="Duplicate plan" aria-label="Duplicate plan" type="button" onClick={() => duplicate(plan)}><Copy size={18}/></button>
                <button title="Download repayment schedule" aria-label="Download repayment schedule" type="button" onClick={() => downloadSchedule(plan)}><Download size={18}/></button>
                <button title="Remove plan" aria-label="Remove plan" type="button" onClick={() => setDeletingId(plan.id)}><Trash2 size={18}/></button>
              </div>
              {requestIntakeEnabled && <button type="button" className="saved-request-button" onClick={() => setRequestingId(plan.id)}>Submit financing request <ArrowUpRight size={17}/></button>}
              {deletingId === plan.id && <div className="saved-delete-confirm"><p>Delete this plan from your browser?</p><div><button type="button" onClick={() => setDeletingId(null)}>Cancel</button><button type="button" onClick={() => erase(plan.id)}>Delete plan</button></div></div>}
            </article>;
          })}
        </div>
      )}
      {compared.length > 0 && <section className="saved-compare-panel" aria-label="Compare selected plans">
        <div className="saved-compare-heading"><div><p className="overline">Side by side</p><h2>Compare your <em>options.</em></h2></div><button type="button" onClick={() => setSelected([])}>Clear selection <X size={16}/></button></div>
        <div className="saved-compare-table"><table>
          <thead><tr><th scope="col">Measure</th>{compared.map(p => <th scope="col" key={p.id}>{p.type === "personal" ? "Personal" : "Business"} · {p.purpose}</th>)}</tr></thead>
          <tbody>
            <tr><th scope="row">Amount</th>{compared.map(p => <td key={p.id}>{money(p.amount, p.currency)}</td>)}</tr>
            <tr><th scope="row">Term</th>{compared.map(p => <td key={p.id}>{p.months} months</td>)}</tr>
            <tr><th scope="row">Assumed rate</th>{compared.map(p => <td key={p.id}>{p.annualRate}% / year</td>)}</tr>
            <tr><th scope="row">Monthly</th>{compared.map(p => <td key={p.id}><strong>{money(summary(p).monthly, p.currency)}</strong></td>)}</tr>
            <tr><th scope="row">Total repayable</th>{compared.map(p => <td key={p.id}>{money(summary(p).total, p.currency)}</td>)}</tr>
          </tbody>
        </table></div>
        <p>Figures are shown in each plan's chosen currency; values in different currencies should not be compared directly.</p>
      </section>}
      {requestingId && plans.find(p => p.id === requestingId) && <SubmitFinancingRequest plan={plans.find(p => p.id === requestingId)!} onClose={() => setRequestingId(null)}/>}
      <div className="saved-footnote">
        <div><span><Wallet size={18}/></span><p><strong>Saved on this device.</strong> Plans are stored in this browser, not in an online account. Clearing browser data will remove them. No contact or identity information is stored.</p></div>
        <Link href="/#calculator" className="inline-link">Explore the calculator <ArrowRight size={17}/></Link>
      </div>
    </div>
  </main>;
}
