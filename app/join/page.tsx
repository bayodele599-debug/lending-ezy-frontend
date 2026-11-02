'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,Building2,CheckCircle2,LockKeyhole,Mail,ShieldCheck,UserRound} from 'lucide-react';
import {postJSON} from '../../lib/api';
type Kind='borrower'|'partner';
const countries=[['US','United States'],['GB','United Kingdom'],['CA','Canada'],['AU','Australia'],['NZ','New Zealand'],['DE','Germany'],['FR','France'],['ES','Spain'],['IT','Italy'],['NL','Netherlands'],['BE','Belgium'],['IE','Ireland'],['SE','Sweden'],['NO','Norway'],['DK','Denmark'],['CH','Switzerland'],['AT','Austria'],['PL','Poland'],['PT','Portugal'],['FI','Finland'],['SG','Singapore'],['AE','United Arab Emirates'],['IN','India'],['JP','Japan'],['KR','South Korea'],['CN','China'],['HK','Hong Kong'],['MY','Malaysia'],['ID','Indonesia'],['PH','Philippines'],['TH','Thailand'],['VN','Vietnam'],['ZA','South Africa'],['NG','Nigeria'],['KE','Kenya'],['GH','Ghana'],['EG','Egypt'],['MA','Morocco'],['BR','Brazil'],['MX','Mexico'],['AR','Argentina'],['CL','Chile'],['CO','Colombia'],['SA','Saudi Arabia'],['QA','Qatar'],['TR','Türkiye'],['IL','Israel'],['PK','Pakistan'],['BD','Bangladesh']].sort((a,b)=>a[1].localeCompare(b[1]));
const active=process.env.NEXT_PUBLIC_INQUIRIES_ENABLED==='true';
const siteKey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY||'';
export default function Join(){
 const [kind,setKind]=useState<Kind>('borrower'),[name,setName]=useState(''),[email,setEmail]=useState(''),[country,setCountry]=useState(''),[institution,setInstitution]=useState(''),[product,setProduct]=useState('personal'),[message,setMessage]=useState(''),[consent,setConsent]=useState(false),[website,setWebsite]=useState(''),[busy,setBusy]=useState(false),[reference,setReference]=useState(''),[error,setError]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();if(!active)return;setBusy(true);setError('');
 try{
 const turnstile_token=siteKey?document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value:undefined;
 const r=await postJSON<{received:boolean;reference:string;message:string}>('/api/v1/inquiries',{kind,name,email,country,institution:kind==='partner'?institution:undefined,product_interest:kind==='borrower'?product:undefined,message:message||undefined,consent_to_contact:consent,website,turnstile_token});
 if(r.received){setReference(r.reference||'submitted');}else{setError('Unable to record your enquiry.');}
 }catch(e){setError(e instanceof Error?e.message:'Unable to submit your enquiry.');}finally{setBusy(false);}
 }
 return <main className="simple-page"><div className="container narrow"><Link className="back" href="/"><ArrowLeft size={17}/> Back to home</Link><div className="page-heading"><span className="eyebrow">GET IN TOUCH</span><h1>Start a conversation.<br/><em>Move forward.</em></h1><p>Leave a few details and we'll know how to reach you. No bank account, identity document or credit history is required.</p></div>
 {reference?<div className="simple-card success-card"><CheckCircle2 size={40}/><h2>Thank you for reaching out</h2><p>We've recorded your enquiry, not a loan application. Your reference is <code>{reference}</code>.</p><Link href="/" className="button button-primary">Back to homepage <ArrowRight size={16}/></Link></div>:
 <div className="simple-card inquiry-card"><div className="join-tabs" role="group" aria-label="Enquiry type"><button type="button" className={kind==='borrower'?'join-tab active':'join-tab'} aria-pressed={kind==='borrower'} onClick={()=>{setKind('borrower');setError('')}}><UserRound size={19}/> I'm interested in a loan</button><button type="button" className={kind==='partner'?'join-tab active':'join-tab'} aria-pressed={kind==='partner'} onClick={()=>{setKind('partner');setError('')}}><Building2 size={19}/> I'm a lending business</button></div>
 <div className="join-intro"><h2>{kind==='borrower'?'Join the early access list':'Request a lending-platform demo'}</h2><p>{kind==='borrower'?'We are not offering loans yet. Register interest and we may notify you if an authorised lending partner becomes available in your country.':'Tell us about your lending institution. Our team can discuss a technology partnership when onboarding becomes available.'}</p></div>
 {!active&&<div className="inquiry-notice"><LockKeyhole size={19}/><div><strong>Registration preview only</strong><p>New enquiries are not being accepted yet. The secure backend and email service must be connected before submissions can open.</p></div></div>}
 <form className="join-form" onSubmit={submit}>
 <label>Full name <span aria-hidden="true">*</span><input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label>
 <label>Email address <span aria-hidden="true">*</span><input required type="email" maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
 <label>Country <span aria-hidden="true">*</span><select required value={country} onChange={e=>setCountry(e.target.value)}><option value="">Select your country</option>{countries.map(([code,label])=><option value={code} key={code}>{label}</option>)}</select></label>
 {kind==='borrower'?<label>What are you interested in? <select value={product} onChange={e=>setProduct(e.target.value)}><option value="personal">Personal lending</option><option value="business">Business lending</option><option value="salary_advance">Salary advance</option><option value="other">Other lending products</option></select></label>:<label>Institution / company name <span aria-hidden="true">*</span><input required minLength={2} maxLength={150} value={institution} onChange={e=>setInstitution(e.target.value)} placeholder="Your organisation"/></label>}
 <label className="join-full">Message (optional)<textarea maxLength={1500} rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder={kind==='partner'?'Tell us about your institution and what you need.':'What would you like to know? Please do not include financial account details.'}/></label>
 <div className="hidden-field" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
 <label className="consent-row join-full"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/><span>I agree to be contacted about this enquiry using the email I provide. I understand this is not a loan application and does not guarantee an offer.</span></label>
 {siteKey&&<><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer/><div className="cf-turnstile join-full" data-sitekey={siteKey}/></>}
 <p className="join-privacy"><ShieldCheck size={16}/> Only the information needed to respond to your enquiry is requested. Do not submit identity or financial documents.</p>
 {error&&<p className="form-error join-full" role="alert">{error}</p>}
 <button type="submit" disabled={!active||busy||!consent} className="button button-primary join-submit">{busy?'Submitting…':active?'Submit enquiry':'Submissions open soon'} <ArrowRight size={16}/></button>
 </form></div>}
 <div className="join-assurance"><Mail size={20}/><p>When enquiries open, messages will reach the secure admin inbox. Replies will be sent by email through a configured provider.</p></div>
 </div></main>;
}
