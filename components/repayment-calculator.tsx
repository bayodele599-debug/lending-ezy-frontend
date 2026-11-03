"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download, Info, Plus, RotateCcw, X } from "lucide-react";

type Product = "personal" | "business";
type Row = { month: number; payment: number; principal: number; interest: number; balance: number };
type Comparison = { id: number; amount: number; months: number; rate: number; currency: string; monthly: number; total: number };

const currencyOptions = ["USD", "GBP", "EUR", "CAD", "AUD", "SGD", "NGN", "ZAR", "INR", "AED", "KES", "GHS"];
const termOptions = [6, 12, 18, 24, 36, 48, 60];
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function calculate(amount: number, rate: number, months: number): Row[] {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || amount <= 0 || months <= 0) return [];
  const periodic = rate / 1200;
  const basePayment = periodic === 0 ? amount / months : amount * periodic / (1 - Math.pow(1 + periodic, -months));
  let balance = round(amount);
  const rows: Row[] = [];
  for (let month = 1; month <= months; month++) {
    const interest = round(balance * periodic);
    const principal = month === months ? balance : Math.min(balance, Math.max(0, round(basePayment - interest)));
    const payment = round(principal + interest);
    balance = round(Math.max(0, balance - principal));
    rows.push({ month, payment, principal, interest, balance });
  }
  return rows;
}

function formatMoney(value: number, currency: string) {
  try { return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(value); }
  catch { return currency + " " + value.toFixed(2); }
}

export default function RepaymentCalculator() {
  const [product, setProduct] = useState<Product>("personal");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState(12000);
  const [months, setMonths] = useState(24);
  const [rate, setRate] = useState(12);
  const [showSchedule, setShowSchedule] = useState(false);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [feedback, setFeedback] = useState("");

  const schedule = useMemo(() => calculate(amount, rate, months), [amount, rate, months]);
  const total = useMemo(() => round(schedule.reduce((sum, row) => sum + row.payment, 0)), [schedule]);
  const monthly = schedule[0]?.payment ?? 0;
  const interest = round(Math.max(0, total - amount));
  const money = (value: number) => formatMoney(value, currency);

  function chooseProduct(next: Product) {
    setProduct(next);
    setAmount(next === "business" ? 60000 : 12000);
    setMonths(next === "business" ? 36 : 24);
    setFeedback("");
  }

  function addComparison() {
    if (comparisons.length >= 3) { setFeedback("You can compare up to three scenarios. Remove one to add another."); return; }
    setComparisons(current => [...current, { id: Date.now(), amount, months, rate, currency, monthly, total }]);
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
    URL.revokeObjectURL(url);
  }

  function reset() { setProduct("personal"); setCurrency("USD"); setAmount(12000); setMonths(24); setRate(12); setFeedback(""); }

  return (
    <div className="calculator">
      <div className="calculator-controls">
        <div className="calculator-top"><div><span className="calculator-label">YOUR REPAYMENT ESTIMATE</span><h3>Make the numbers yours.</h3></div><button type="button" className="reset-button" onClick={reset}><RotateCcw size={16}/> Reset</button></div>
        <div className="segment-control" role="group" aria-label="Borrowing purpose">
          <button type="button" aria-pressed={product === "personal"} className={product === "personal" ? "selected" : ""} onClick={() => chooseProduct("personal")}>Personal</button>
          <button type="button" aria-pressed={product === "business"} className={product === "business" ? "selected" : ""} onClick={() => chooseProduct("business")}>Business</button>
        </div>
        <div className="form-row">
          <label className="form-field"><span>Currency</span><select value={currency} onChange={event => setCurrency(event.target.value)}>{currencyOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
          <label className="form-field"><span>Repayment period</span><select value={months} onChange={event => setMonths(Number(event.target.value))}>{termOptions.map(option => <option key={option} value={option}>{option} months</option>)}</select></label>
        </div>
        <div className="amount-heading"><label htmlFor="loan-amount">Amount to borrow</label><span>{money(amount)}</span></div>
        <input id="loan-amount" className="amount-range" type="range" min="500" max="250000" step="500" value={Math.min(250000, Math.max(500, amount))} onChange={event => setAmount(Number(event.target.value))}/>
        <div className="range-labels"><span>{money(500)}</span><span>{money(250000)}</span></div>
        <div className="form-row calc-bottom-fields">
          <label className="form-field"><span>Amount ({currency})</span><input type="number" inputMode="decimal" min="1" max="10000000" step="100" value={amount} onChange={event => setAmount(Math.min(10000000, Math.max(0, Number(event.target.value))))}/></label>
          <label className="form-field"><span>Assumed annual interest (%)</span><input type="number" inputMode="decimal" min="0" max="40" step="0.25" value={rate} onChange={event => setRate(Math.min(40, Math.max(0, Number(event.target.value))))}/></label>
        </div>
        <div className="calculator-guidance"><Info size={18}/><p>Choose your own interest rate to explore different outcomes. The starting rate is an example, not a rate offered by Lending Ezy or a lender. Currency selection does not perform an exchange conversion.</p></div>
      </div>
      <div className="calculator-results">
        <div className="result-header"><span>YOUR ESTIMATED REPAYMENT</span><span className="result-dot" aria-hidden="true"/></div>
        <p className="result-subtitle">Estimated monthly payment</p>
        <div className="result-amount" aria-live="polite">{money(monthly)}</div>
        <p className="result-term">Over {months} months at an assumed {rate}% annual interest rate</p>
        <div className="cost-bar" aria-label="Principal and estimated interest as portions of total repayment"><span style={{width: (total > 0 ? amount / total * 100 : 100) + "%"}}/><span/></div>
        <div className="cost-legend"><span><i className="legend-principal"/> Amount borrowed</span><span><i className="legend-interest"/> Interest</span></div>
        <div className="result-breakdown"><div><span>Amount borrowed</span><strong>{money(amount)}</strong></div><div><span>Estimated total interest</span><strong>{money(interest)}</strong></div><div className="result-total"><span>Estimated total repayment</span><strong>{money(total)}</strong></div></div>
        <div className="result-actions">
          <button type="button" onClick={addComparison} className="button button-outline-dark"><Plus size={17}/> Add to comparison</button><Link href={"/apply?type=" + product + "&currency=" + currency + "&amount=" + amount + "&months=" + months + "&rate=" + rate} className="result-link">Save as plan <ArrowUpRight size={17}/></Link>
          <button type="button" onClick={() => setShowSchedule(value => !value)} className="result-link" aria-expanded={showSchedule}>{showSchedule ? "Hide" : "View"} repayment schedule <ArrowRight size={16}/></button>
        </div>
        {feedback && <p className="calculator-feedback" role="status">{feedback}</p>}
        <p className="calculator-disclosure">Illustrative calculations only. Excludes fees, insurance and other charges. Not an offer, regulated APR or credit assessment.</p>
      </div>
      {comparisons.length > 0 && <div className="comparison-section"><div className="comparison-heading"><h4>Compare scenarios</h4><button type="button" onClick={() => {setComparisons([]); setFeedback("");}}>Clear all</button></div><div className="comparison-grid">{comparisons.map(item => <div className="comparison-card" key={item.id}><button className="comparison-remove" type="button" aria-label="Remove scenario" onClick={() => setComparisons(current => current.filter(entry => entry.id !== item.id))}><X size={17}/></button><span>{item.currency} · {item.months} months · {item.rate}%</span><strong>{formatMoney(item.monthly, item.currency)}<small> / month</small></strong><p>Borrow {formatMoney(item.amount, item.currency)} · Total {formatMoney(item.total, item.currency)}</p></div>)}</div></div>}
      {showSchedule && <div className="schedule-section"><div className="schedule-heading"><div><h4>Repayment schedule</h4><p>Month-by-month breakdown based on your assumptions.</p></div><button type="button" className="button button-outline-dark" onClick={downloadSchedule}><Download size={17}/> Download CSV</button></div><div className="table-scroll"><table><thead><tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>{schedule.map(row => <tr key={row.month}><td>{row.month}</td><td>{money(row.payment)}</td><td>{money(row.principal)}</td><td>{money(row.interest)}</td><td>{money(row.balance)}</td></tr>)}</tbody></table></div></div>}
      <div className="calculator-footer"><span>Want to return to these figures later?</span><Link href={"/apply?type=" + product + "&currency=" + currency + "&amount=" + amount + "&months=" + months + "&rate=" + rate} className="inline-link">Build a saved plan <ArrowUpRight size={17}/></Link></div>
    </div>
  );
}
