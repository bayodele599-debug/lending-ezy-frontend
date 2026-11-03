"use client";
import {useEffect,useRef,useState,type FormEvent} from "react";
import Link from "next/link";
import Script from "next/script";
import {ArrowRight,Check,LockKeyhole,X} from "lucide-react";
import {postJSON} from "../lib/api";
import {money,type SavedPlan} from "../lib/plans";

const siteKey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY||"";
export const requestIntakeEnabled=process.env.NEXT_PUBLIC_FINANCING_REQUESTS_ENABLED==="true" &&
 Boolean(process.env.NEXT_PUBLIC_API_URL) && (process.env.NODE_ENV!=="production"||Boolean(siteKey));
type Props={plan:SavedPlan;onClose:()=>void};

export default function SubmitFinancingRequest({plan,onClose}:Props){
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[businessName,setBusinessName]=useState("");
 const [message,setMessage]=useState(""),[consent,setConsent]=useState(false),[acknowledged,setAcknowledged]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[reference,setReference]=useState("");
 const [token,setToken]=useState("");
 const formRef=useRef<HTMLDivElement>(null);
 const busyRef=useRef(false);
 const onCloseRef=useRef(onClose);
 busyRef.current=busy;
 onCloseRef.current=onClose;
 useEffect(()=>{
  setToken(crypto.randomUUID());
  const prev=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  function dismiss(event:KeyboardEvent){
   if(event.key==="Escape"&&!busyRef.current){event.preventDefault();onCloseRef.current();return;}
   if(event.key!=="Tab")return;
   const nodes=Array.from(formRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]')||[])
     .filter(node=>node.getClientRects().length>0);
   if(!nodes.length){event.preventDefault();return;}
   const first=nodes[0],last=nodes[nodes.length-1];
   if(event.shiftKey&&(document.activeElement===first||document.activeElement===formRef.current)){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===formRef.current)){event.preventDefault();first.focus();}
  }
  document.addEventListener("keydown",dismiss);
  formRef.current?.focus();
  return()=>{document.body.style.overflow=prev;document.removeEventListener("keydown",dismiss);previousFocus?.focus({preventScroll:true});};
 },[]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!requestIntakeEnabled||!token||busy||!consent||!acknowledged)return;
  setBusy(true);setError("");
  try{
   const captcha=siteKey?document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value:undefined;
   if(siteKey&&!captcha)throw new Error("Complete the verification check before submitting.");
   const response=await postJSON<{received:boolean;reference?:string|null;status:string}>("/api/v1/financing-requests",{
    client_token:token,kind:plan.type,purpose:plan.purpose,country:plan.country,currency:plan.currency,
    amount:plan.amount.toFixed(2),term_months:plan.months,assumed_annual_rate:plan.annualRate.toFixed(2),
    name,email,business_name:plan.type==="business"?businessName:undefined,
    message:message.trim()||undefined,consent_to_contact:consent,confirms_estimate_only:acknowledged,
    turnstile_token:captcha
   });
   if(!response.received||!response.reference)throw new Error("We could not confirm receipt. Please retry.");
   setReference(response.reference);
  }catch(caught){setError(caught instanceof Error?caught.message:"Unable to submit your request.");}
  finally{setBusy(false);}
 }
 return <div className="request-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget&&!busy)onClose();}}>
  <div className="request-modal" role="dialog" aria-modal="true" aria-label="Submit financing request" tabIndex={-1} ref={formRef}>
   <header className="request-modal-head"><div><span>YOUR NEXT STEP</span><h2>{reference?"Request received":"Send your plan for review"}</h2></div><button type="button" aria-label="Close request form" onClick={onClose}><X size={23}/></button></header>
   {reference?<div className="request-success">
    <span className="request-success-mark"><Check size={31}/></span><h3>Your financing request has been received.</h3>
    <p>We have recorded your plan and contact details. Keep this reference for your records.</p>
    <div className="request-reference"><span>Reference</span><strong>{reference}</strong></div>
    <p>Our team can review your request internally. Any financing terms would need separate confirmation by an authorised provider.</p>
    <button type="button" className="button button-primary" onClick={onClose}>Return to my plans <ArrowRight size={17}/></button>
   </div>:<>
    <div className="request-plan"><span>FINANCING SUMMARY</span><strong>{money(plan.amount,plan.currency)}</strong><p>{plan.type==="personal"?"Personal":"Business"} · {plan.purpose} · {plan.months} months · {plan.annualRate}% assumed annual rate</p></div>
    <form className="request-form" onSubmit={submit}>
     <div className="request-two-col">
      <label><span>Full name *</span><input autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label>
      <label><span>Email address *</span><input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
     </div>
     {plan.type==="business"&&<label><span>Business / organisation name *</span><input required minLength={2} maxLength={150} autoComplete="organization" value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Your business name"/></label>}
     <label><span>Additional message (optional)</span><textarea rows={3} value={message} maxLength={1500} onChange={e=>setMessage(e.target.value)} placeholder="Any context you would like the team to consider? Do not include bank account details."/></label>
     <label className="request-check"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I agree to be contacted about this request and to the handling of my details described in the <Link href="/privacy">privacy notice</Link>.</span></label>
     <label className="request-check"><input type="checkbox" required checked={acknowledged} onChange={e=>setAcknowledged(e.target.checked)}/><span>I understand that the figures are estimates and submitting a request is not a loan approval or offer.</span></label>
     {siteKey&&<><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive"/><div className="cf-turnstile" data-sitekey={siteKey}/></>}
     {error&&<p className="request-error" role="alert">{error}</p>}
     <div className="request-submit-row"><p><LockKeyhole size={16}/> Your contact and plan details go to our review team.</p>
      <button className="button button-primary" type="submit" disabled={busy||!token||!consent||!acknowledged}>{busy?"Submitting…":"Submit request"} <ArrowRight size={17}/></button>
     </div>
    </form>
   </>}
  </div>
 </div>;
}
