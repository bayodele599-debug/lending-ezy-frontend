"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, SlidersHorizontal, MoveUpRight } from "lucide-react";
import PhotoFrame from "./photo-frame";
import { defaultPlan, money, summary } from "../lib/plans";

/**
 * A usable financial snapshot, not a decorative fake UI.
 * Every displayed amount derives from the same amortization model as /apply.
 */
export default function HeroPlanPreview() {
  const [amount, setAmount] = useState(20000);
  const [months, setMonths] = useState(36);
  const annualRate = 11.5;
  const scenario = useMemo(
    () => summary({ ...defaultPlan, amount, months, annualRate, currency: "USD" }),
    [amount, months]
  );
  const target = "/apply?type=personal&currency=USD&amount=" + amount + "&months=" + months + "&rate=" + annualRate;

  return (
    <div className="hero-composition">
      <div className="hero-portrait-wrap">
        <PhotoFrame
          className="hero-portrait"
          src="https://images.unsplash.com/photo-1739300293091-6e187cdf4b2c?auto=format&fit=crop&w=1200&q=82"
          alt="A woman taking time to work through her plans at a cafe"
          credit="Ninthgrid"
          creditHref="https://unsplash.com/photos/J-IBERCeDTY"
          sizes="(max-width: 760px) 90vw, (max-width: 1200px) 44vw, 500px"
          priority
        />
        <div className="hero-portrait-label" aria-hidden="true">
          <span>More than numbers.</span><MoveUpRight size={15}/>
        </div>
      </div>

      <div className="hero-snapshot">
        <div className="hero-snapshot-head">
          <div>
            <span className="hero-snapshot-eyebrow"><SlidersHorizontal size={14}/> A LITTLE PERSPECTIVE</span>
            <h2>Your numbers. <em>Your pace.</em></h2>
          </div>
          <span className="snapshot-index" aria-hidden="true">01 / 02</span>
        </div>

        <label className="snapshot-amount-label" htmlFor="hero-preview-amount">
          <span>Financing amount</span><strong>{money(amount, "USD")}</strong>
        </label>
        <input
          id="hero-preview-amount"
          className="snapshot-range"
          type="range"
          min={1000}
          max={100000}
          step={1000}
          value={amount}
          onChange={event => setAmount(Number(event.target.value))}
        />
        <div className="snapshot-range-ends"><span>$1,000</span><span>$100,000</span></div>

        <div className="snapshot-bottom-row">
          <label className="snapshot-term" htmlFor="hero-preview-term">
            <span>Repayment term</span>
            <select id="hero-preview-term" value={months} onChange={event => setMonths(Number(event.target.value))}>
              {[12, 24, 36, 48, 60].map(value => <option key={value} value={value}>{value} months</option>)}
            </select>
          </label>
          <div className="snapshot-monthly" aria-live="polite" aria-atomic="true">
            <span>Estimated monthly</span>
            <strong>{money(scenario.monthly, "USD")}</strong>
          </div>
        </div>
        <div className="snapshot-foot">
          <p>Illustrative at an assumed {annualRate}% annual rate, excluding fees.</p>
          <Link href={target} className="snapshot-go" aria-label="Continue with this financing estimate">
            <ArrowUpRight size={21}/>
          </Link>
        </div>
      </div>
      <Link href="/how-it-works" className="hero-composition-foot">Built for thoughtful decisions <ArrowRight size={15}/></Link>
    </div>
  );
}
