"use client";

import { useMemo, useRef, useState } from "react";
import {amortization, roundMoney, money as formatMoney, supportedCurrencies, repaymentTerms} from "../lib/plans";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download, Info, Plus, RotateCcw, X } from "lucide-react";

type Product = "personal" | "business";
type Comparison = { id: number; amount: number; months: number; rate: number; currency: string; monthly: number; total: number };

export default function RepaymentCalculator({initialProduct = "personal"}: {initialProduct?: Product}) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState(initialProduct === "business" ? 60000 : 12000);
  const [months, setMonths] = useState(initialProduct === "business" ? 36 : 24);
  const [rate, setRate] = useState(12);
  const [showSchedule, setShowSchedule] = useState(false);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [feedback, setFeedback] = useState("");
  const comparisonId = useRef(0);
  const canCalculate = Number.isFinite(amount) && amount >= 500 && amount <= 10000000 && Number.isFinite(rate) && rate >= 0 && rate <= 40;

  const schedule = useMemo(() => canCalculate ? amortization(amount, rate, months) : [], [amount, rate, months, canCalculate]);
  const total = useMemo(() => roundMoney(schedule.reduce((sum, row) => sum + row.payment, 0)), [schedule]);
  const monthly = schedule[0]?.payment ?? 0;
  const interest = roundMoney(Math.max(0, total - amount));
  const money = (value: number) => formatMoney(value, currency);
  const sliderMax = amount > 250000 ? 10000000 : 250000;

  function chooseProduct(next: Product) {
    setProduct(next);
    setAmount(next === "business" ? 60000 : 12000);
    setMonths(next === "business" ? 36 : 24);
    setFeedback("");
  }

  function addComparison() {
    if (!canCalculate) { setFeedback("Enter an amount from 500 to 10,000,000 and a rate from 0% to 40%."); return; }
    if (comparisons.some(x => x.amount === amount && x.months === months && x.rate === rate && x.currency === currency)) {
      setFeedback("This scenario is already in your comparison."); return;
    }
    if (comparisons.length >= 3) { setFeedback("You can compare up to three scenarios. Remove one to add another."); return; }
    setComparisons(current => [...current, { id: ++comparisonId.current, amount, months, rate, currency, monthly, total }]);
    setFeedback("Scenario added to your comparison.");
  }

  function downloadSchedule() {
    const lines = [
      ["Month", "Payment", "Principal", "Interest", "Remaining balance"].join(","),
      ...schedule.map(row => [row.month, row.payment.toFixed(2), row.principal.toFixed(2), row.interest.toFixed(2), row.balance.toFixed(2)].join(","))
    ];
    const header = "Lending Ezy repayment illustration (" + currency + ", assumed annual rate " + rate + "%)\n";
    const blob = new Blob([header + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lending-ezy-repayment-schedule.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function reset() { setProduct(initialProduct); setCurrency("USD"); setAmount(initialProduct === "business" ? 60000 : 12000); setMonths(initialProduct === "business" ? 36 : 24); setRate(12); setFeedback(""); setShowSchedule(false); setComparisons([]); }

  return (
    <div className="calculator">
      <div className="calculator-controls">
        <div className="calculator-top"><div><span className="calculator-label">YOUR REPAYMENT ESTIMATE</span><h3>Make the numbers yours.</h3></div><button type="button" className="reset-button" onClick={reset}><RotateCcw size={16}/> Reset</button></div>
        <div className="segment-control" role="group" aria-label="Borrowing purpose">
          <button type="button" aria-pressed={product === "personal"} className={product === "personal" ? "selected" : ""} onClick={() => chooseProduct("personal")}>Personal</button>
          <button type="button" aria-pressed={product === "business"} className={product === "business" ? "selected" : ""} onClick={() => chooseProduct("business")}>Business</button>
        </div>
        <div className="form-row">
          <label className="form-field"><span>Currency</span><select value={currency} onChange={event => setCurrency(event.target.value)}>{supportedCurrencies.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
          <label className="form-field"><span>Repayment period</span><select value={months} onChange={event => setMonths(Number(event.target.value))}>{repaymentTerms.map(option => <option key={option} value={option}>{option} months</option>)}</select></label>
        </div>
        <div className="amount-heading"><label htmlFor="loan-amount">Amount to borrow</label><span>{money(amount)}</span></div>
        <input id="loan-amount" className="amount-range" type="range" min="500" max={sliderMax} step={amount > 250000 ? 10000 : 500} value={Math.min(sliderMax, Math.max(500, amount))} onChange={event => setAmount(Number(event.target.value))}/>
        <div className="range-labels"><span>{money(500)}</span><span>{money(sliderMax)}</span></div>
        <div className="form-row calc-bottom-fields">
          <label className="form-field"><span>Amount ({currency})</span><input type="number" inputMode="decimal" min="500" max="10000000" step="100" value={amount} onChange={event => setAmount(Number(event.target.value))} onBlur={() => setAmount(value => Number.isFinite(value) ? Math.min(10000000, Math.max(500, value)) : 500)}/></label>
          <label className="form-field"><span>Assumed annual interest (%)</span><input type="number" inputMode="decimal" min="0" max="40" step="0.25" value={rate} onChange={event => setRate(Number(event.target.value))} onBlur={() => setRate(value => Number.isFinite(value) ? Math.min(40, Math.max(0, value)) : 12)}/></label>
        </div>
        <div className="calculator-guidance"><Info size={18}/><p>Choose your own interest rate to explore different outcomes. The starting rate is an example, not a rate offered by Lending Ezy or a lender. Currency selection does not perform an exchange conversion.</p></div>
      </div>
      <div className="calculator-results">
        {!canCalculate && <p className="calculator-feedback" role="alert">Enter a valid amount (500–10,000,000) and interest rate (0–40%) to calculate repayments.</p>}
        <div className="result-header"><span>YOUR ESTIMATED REPAYMENT</span><span className="result-dot" aria-hidden="true"/></div>
        <p className="result-subtitle">Estimated monthly payment</p>
        <div className="result-amount" aria-live="polite">{money(monthly)}</div>
        <p className="result-term">Over {months} months at an assumed {rate}% annual interest rate</p>
        <div className="cost-bar" aria-label="Principal and estimated interest as portions of total repayment"><span style={{width: (total > 0 ? amount / total * 100 : 100) + "%"}}/><span/></div>
        <div className="cost-legend"><span><i className="legend-principal"/> Amount borrowed</span><span><i className="legend-interest"/> Interest</span></div>
        <div className="result-breakdown"><div><span>Amount borrowed</span><strong>{money(amount)}</strong></div><div><span>Estimated total interest</span><strong>{money(interest)}</strong></div><div className="result-total"><span>Estimated total repayment</span><strong>{money(total)}</strong></div></div>
        <div className="result-actions">
          <button type="button" onClick={addComparison} disabled={!canCalculate} className="button button-outline-dark"><Plus size={17}/> Add to comparison</button>{canCalculate && <Link href={"/apply?type=" + product + "&currency=" + currency + "&amount=" + amount + "&months=" + months + "&rate=" + rate} className="result-link">Save as plan <ArrowUpRight size={17}/></Link>}
          <button type="button" disabled={!canCalculate} onClick={() => setShowSchedule(value => !value)} className="result-link" aria-expanded={showSchedule}>{showSchedule ? "Hide" : "View"} repayment schedule <ArrowRight size={16}/></button>
        </div>
        {feedback && <p className="calculator-feedback" role="status">{feedback}</p>}
        <p className="calculator-disclosure">Illustrative calculations only. Excludes fees, insurance and other charges. Not an offer, regulated APR or credit assessment.</p>
      </div>
      {comparisons.length > 0 && <div className="comparison-section"><div className="comparison-heading"><h4>Compare scenarios</h4><button type="button" onClick={() => {setComparisons([]); setFeedback("");}}>Clear all</button></div><div className="comparison-grid">{comparisons.map(item => <div className="comparison-card" key={item.id}><button className="comparison-remove" type="button" aria-label="Remove scenario" onClick={() => setComparisons(current => current.filter(entry => entry.id !== item.id))}><X size={17}/></button><span>{item.currency} · {item.months} months · {item.rate}%</span><strong>{formatMoney(item.monthly, item.currency)}<small> / month</small></strong><p>Borrow {formatMoney(item.amount, item.currency)} · Total {formatMoney(item.total, item.currency)}</p></div>)}</div></div>}
      {showSchedule && <div className="schedule-section"><div className="schedule-heading"><div><h4>Repayment schedule</h4><p>Month-by-month breakdown based on your assumptions.</p></div><button type="button" className="button button-outline-dark" onClick={downloadSchedule}><Download size={17}/> Download CSV</button></div><div className="table-scroll"><table><thead><tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>{schedule.map(row => <tr key={row.month}><td>{row.month}</td><td>{money(row.payment)}</td><td>{money(row.principal)}</td><td>{money(row.interest)}</td><td>{money(row.balance)}</td></tr>)}</tbody></table></div></div>}
      <div className="calculator-footer"><span>Want to return to these figures later?</span>{canCalculate ? <Link href={"/apply?type=" + product + "&currency=" + currency + "&amount=" + amount + "&months=" + months + "&rate=" + rate} className="inline-link">Build a saved plan <ArrowUpRight size={17}/></Link> : <span className="calculator-guidance-inline">Enter valid figures to continue.</span>}</div>
    </div>
  );
}
