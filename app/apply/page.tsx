'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,CheckCircle2,LockKeyhole} from 'lucide-react';
import {postJSON,type QuoteRequest} from '../../lib/api';
const products=[{id:'flex',label:'Personal loan',min:500,max:50000,terms:[6,12,24,36]},{id:'growth',label:'Business finance',min:5000,max:250000,terms:[12,24,36,60]},{id:'advance',label:'Salary advance',min:250,max:10000,terms:[3,6,12]}];
export default function Apply(){
 const [productId,setProductId]=useState('flex'),[currency,setCurrency]=useState('USD'),[amount,setAmount]=useState('5000'),[months,setMonths]=useState(12),[saving,setSaving]=useState(false),[error,setError]=useState(''),[record,setRecord]=useState('');
 const p=products.find(x=>x.id===productId)!;
 async function submit(e:React.FormEvent){e.preventDefault();setError('');setRecord('');setSaving(true);
 const payload:QuoteRequest={product_id:productId,currency,principal:amount,term_months:months};
 try{const r=await postJSON<{id:string;status:string}>('/api/v1/sandbox/applications',payload);setRecord(r.id);}
 catch(e){setError(e instanceof Error?e.message:'Unable to submit demo application');}
 finally{setSaving(false);}
 }
 return <main className="simple-page"><div className="container narrow"><Link href="/" className="back"><ArrowLeft size={17}/> Back to home</Link><div className="page-heading"><span className="eyebrow">APPLICATION PREVIEW</span><h1>Explore a sample <em>application.</em></h1><p>No names, contact details, bank accounts or identity documents are collected. This is not a real loan application.</p></div>
 {record?<div className="simple-card success-card"><CheckCircle2 size={35}/><h2>Saved to the sandbox</h2><p>Test reference: <code>{record}</code></p><p>No actual credit decision or payment will occur.</p><Link href="/dashboard" className="button button-primary">See dashboard preview <ArrowRight size={16}/></Link></div>
 :<form className="simple-card form-grid" onSubmit={submit}><label>Loan product<select value={productId} onChange={e=>{const v=e.target.value;setProductId(v);const n=products.find(p=>p.id===v)!;setAmount(String(n.min));setMonths(n.terms[0]);}}>{products.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
 <label>Currency<select value={currency} onChange={e=>setCurrency(e.target.value)}>{['USD','GBP','EUR','CAD','AUD','SGD'].map(c=><option key={c}>{c}</option>)}</select></label>
 <label>Illustrative principal<input required type="number" min={p.min} max={p.max} step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
 <label>Repayment term<select value={months} onChange={e=>setMonths(Number(e.target.value))}>{p.terms.map(m=><option key={m} value={m}>{m} months</option>)}</select></label>
 <p className="form-disclosure"><LockKeyhole size={18}/> This demo saves only non-identifying loan parameters. The backend rejects sandbox applications outside local development mode.</p>
 {error&&<p className="form-error" role="alert">{error}. Ensure the sandbox backend is running locally.</p>}
 <button disabled={saving} type="submit" className="button button-primary">{saving?'Saving…':'Submit test application'} <ArrowRight size={17}/></button>
 </form>}
 </div></main>;
}
