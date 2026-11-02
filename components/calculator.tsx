'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {motion,useReducedMotion} from 'framer-motion';
import {ArrowRight,Calculator as CalculatorIcon,Info} from 'lucide-react';
import {postJSON,type Quote,type QuoteRequest} from '../lib/api';
const options = [
{id:'flex',label:'Personal loan',min:500,max:50000,terms:[6,12,24,36]},
{id:'growth',label:'Business finance',min:5000,max:250000,terms:[12,24,36,60]},
{id:'advance',label:'Salary advance',min:250,max:10000,terms:[3,6,12]}
];
const currencies=['USD','GBP','EUR','CAD','AUD','SGD'];
function money(value:string|number,currency:string){const n=Number(value);return Number.isFinite(n)?new Intl.NumberFormat('en',{style:'currency',currency,maximumFractionDigits:2}).format(n):'—';}
export default function Calculator(){
 const [productId,setProductId]=useState('flex');
 const [currency,setCurrency]=useState('USD');
 const [amount,setAmount]=useState(12000);
 const [months,setMonths]=useState(24);
 const [quote,setQuote]=useState<Quote|null>(null);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const reduce=useReducedMotion();
 const product=options.find(p=>p.id===productId)!;
 function changeProduct(next:string){const p=options.find(i=>i.id===next)!;setProductId(next);setAmount(Math.max(p.min,Math.min(p.max,12000)));setMonths(p.terms.includes(24)?24:p.terms[0]);}
 useEffect(()=>{
   const ctrl=new AbortController();
   const timer=setTimeout(async()=>{
      setBusy(true);setError('');
      const request:QuoteRequest={product_id:productId,currency,principal:amount.toFixed(2),term_months:months};
      try{const result=await postJSON<Quote>('/api/v1/quote',request,ctrl.signal);if(!ctrl.signal.aborted)setQuote(result);}
      catch(e){if(!ctrl.signal.aborted){setQuote(null);setError(e instanceof Error?e.message:'Quote is unavailable');}}
      finally{if(!ctrl.signal.aborted)setBusy(false);}
   },180);
   return ()=>{clearTimeout(timer);ctrl.abort();};
 },[productId,currency,amount,months]);
 return <div className="calculator-shell"><div className="calc-controls">
 <div className="calc-heading"><span className="eyebrow">INTERACTIVE CALCULATOR</span><h3>Make a plan that fits.</h3><p>Explore hypothetical repayment scenarios. No personal information is needed.</p></div>
 <label className="field-label" htmlFor="product">Loan type</label><select id="product" value={productId} onChange={e=>changeProduct(e.target.value)}>{options.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select>
 <label className="field-label" htmlFor="currency">Illustration currency</label><select id="currency" value={currency} onChange={e=>setCurrency(e.target.value)}>{currencies.map(c=><option key={c}>{c}</option>)}</select>
 <div className="range-heading"><label className="field-label" htmlFor="amount">Loan amount</label><strong>{money(amount,currency)}</strong></div>
 <input id="amount" type="range" min={product.min} max={product.max} step={product.max>100000?1000:250} value={amount} onChange={e=>setAmount(Number(e.target.value))}/>
 <div className="range-caption"><span>{money(product.min,currency)}</span><span>{money(product.max,currency)}</span></div>
 <label className="field-label" htmlFor="term">Repayment term</label><div className="term-grid" id="term">{product.terms.map(m=><button type="button" aria-pressed={months===m} onClick={()=>setMonths(m)} key={m} className={months===m?'term active':'term'}>{m} mo</button>)}</div>
 <div className="calc-note"><Info size={18}/> Example nominal rates are supplied by the sandbox backend. These are not available credit offers.</div>
 </div><div className="calc-summary"><div className="summary-top"><span><CalculatorIcon size={17}/> REPAYMENT OUTLOOK</span><span className="demo-pill">Illustrative</span></div>
 <p className="summary-caption">Estimated monthly payment</p><div aria-live="polite" className="summary-amount">{quote?money(quote.monthly_payment,currency):'—'}</div>
 <p className="summary-note">{busy?'Refreshing illustration…':error?'Backend unavailable — start the sandbox API to calculate.':'Based on a fixed, illustrative nominal annual rate.'}</p>
 <div className="summary-chart"><div style={{height:'38%'}}/><div style={{height:'60%'}}/><div style={{height:'46%'}}/><div style={{height:'76%'}}/><div style={{height:'55%'}}/><div style={{height:'88%'}}/><div style={{height:'70%'}}/><div style={{height:'95%'}}/></div>
 <div className="summary-lines"><div><span>Principal</span><b>{money(amount,currency)}</b></div><div><span>Total interest</span><b>{quote?money(quote.total_interest,currency):'—'}</b></div><div><span>Total repayment</span><b>{quote?money(quote.total_repayment,currency):'—'}</b></div><div><span>Nominal annual rate</span><b>{quote?(quote.nominal_annual_rate_bps/100).toFixed(2)+'%':'—'}</b></div></div>
 <motion.div whileHover={reduce?undefined:{y:-2}}><Link href="/apply" className="button button-white full">Try sandbox application <ArrowRight size={17}/></Link></motion.div>
 <p className="fine-print">Not an offer, APR disclosure, or eligibility decision. Real lending is disabled.</p></div></div>;
}
