"use client";

import {useCallback,useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {ArrowRight,ArrowUpRight,CheckCircle2,Download,FileText,LockKeyhole,LogOut,Mail,MessageSquare,Plus,ShieldCheck,Trash2,UploadCloud,Wallet} from "lucide-react";
import {countries} from "../lib/countries";
import {defaultPlan,downloadSchedule,money,readPlans,savePlan,summary,supportedCurrencies,termsForPurpose,businessPurposes,validPlan,type PlanInput,type SavedPlan} from "../lib/plans";
import SubmitFinancingRequest,{requestIntakeEnabled} from "./submit-financing-request";

const enabled=process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_ENABLED==="true"||
  (process.env.NODE_ENV==="development"&&process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_ENABLED!=="false");
type Customer={id:string;full_name:string;email:string;country:string;verified:boolean};
type CloudPlan={id:string;type:"personal"|"business";purpose:string;country:string;currency:string;amount:string;months:number;annual_rate:string;created_at:string;updated_at:string};
type Case={id:string;status:string;kind:string;purpose:string;country:string;currency:string;amount:string;term_months:number;created_at:string};
type ThreadMessage={id:string;author:"admin"|"customer";body:string;created_at:string};
type Mode="signin"|"signup"|"forgot";
type EditDraft=PlanInput&{id?:string};

const statuses:Record<string,string>={
 submitted:"Received",in_review:"Under review",needs_information:"Information requested",
 proceed_to_next_stage:"Proceeding to next stage",not_proceeding:"Not proceeding",closed:"Closed"
};
async function request<T>(path:string,method="GET",body?:unknown):Promise<T>{
 const res=await fetch("/api/account/"+path,{method,headers:body===undefined?undefined:{"Content-Type":"application/json"},
  body:body===undefined?undefined:JSON.stringify(body),cache:"no-store",credentials:"same-origin"});
 const result=await res.json().catch(()=>({error:"The account service could not respond."}));
 if(!res.ok)throw new Error(typeof result.detail==="string"?result.detail:typeof result.error==="string"?result.error:"Please try again.");
 return result as T;
}
function date(value:string){return new Date(value).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});}
function asInput(p:CloudPlan):PlanInput{
 return {type:p.type,purpose:p.purpose,country:p.country,currency:p.currency,
  amount:Number(p.amount),months:p.months,annualRate:Number(p.annual_rate)};
}

export default function AccountWorkspace(){
 const [user,setUser]=useState<Customer|null>(null),[checking,setChecking]=useState(true);
 const [mode,setMode]=useState<Mode>("signin"),[busy,setBusy]=useState(false);
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState("");
 const [country,setCountry]=useState("US"),[consent,setConsent]=useState(false);
 const [notice,setNotice]=useState(""),[error,setError]=useState("");
 const [plans,setPlans]=useState<CloudPlan[]>([]),[cases,setCases]=useState<Case[]>([]);
 const [draft,setDraft]=useState<EditDraft>({...defaultPlan}),[editing,setEditing]=useState<string|null>(null),[showEditor,setShowEditor]=useState(false);
 const [threadId,setThreadId]=useState<string|null>(null),[messages,setMessages]=useState<ThreadMessage[]>([]),[reply,setReply]=useState("");
 const [requestPlan,setRequestPlan]=useState<SavedPlan|null>(null);

 const reload=useCallback(async()=>{
  const current=await request<Customer>("me");
  setUser(current);setName(current.full_name);setEmail(current.email);setCountry(current.country);
  const [saved,requests]=await Promise.all([request<{plans:CloudPlan[]}>("plans"),request<{requests:Case[]}>("requests")]);
  setPlans(saved.plans);setCases(requests.requests);
 },[]);
 useEffect(()=>{
  if(!enabled){setChecking(false);return;}
  reload().catch(()=>setUser(null)).finally(()=>setChecking(false));
 },[reload]);
 async function authentication(event:FormEvent){
  event.preventDefault();setBusy(true);setError("");setNotice("");
  try{
   if(mode==="signup"){
    const result=await request<{message:string}>("register","POST",{
     full_name:name,email,country,password,consent_to_terms:consent});
    setNotice(result.message);setMode("signin");setPassword("");
   }else if(mode==="forgot"){
    const result=await request<{message:string}>("password/request-reset","POST",{email});
    setNotice(result.message);setMode("signin");
   }else{
    await request("login","POST",{email,password});setPassword("");
    await reload();setNotice("Signed in securely.");
   }
  }catch(e){setError(e instanceof Error?e.message:"Unable to continue");}
  finally{setBusy(false);}
 }
 async function signout(){
  setBusy(true);await request("logout","POST").catch(()=>undefined);
  setUser(null);setPlans([]);setCases([]);setThreadId(null);setMessages([]);setBusy(false);
  setNotice("Signed out on this device.");
 }
 async function updateProfile(event:FormEvent){
  event.preventDefault();setBusy(true);setError("");setNotice("");
  try{const next=await request<Customer>("me","PATCH",{full_name:name,country});setUser(next);setNotice("Your profile was updated.");}
  catch(e){setError(e instanceof Error?e.message:"Could not update profile");}
  finally{setBusy(false);}
 }
 async function exportAccount(){
  setBusy(true);setError("");
  try{
   const data=await request<Record<string,unknown>>("export");
   const contents=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
   const url=URL.createObjectURL(contents);
   const anchor=document.createElement("a");
   anchor.href=url;anchor.download="lending-ezy-account-data.json";
   document.body.appendChild(anchor);anchor.click();anchor.remove();
   window.setTimeout(()=>URL.revokeObjectURL(url),1500);
   setNotice("Your account data export was generated on this device.");
  }catch(e){setError(e instanceof Error?e.message:"Could not export account data");}
  finally{setBusy(false);}
 }
 async function loadData(){
  const [a,b]=await Promise.all([request<{plans:CloudPlan[]}>("plans"),request<{requests:Case[]}>("requests")]);
  setPlans(a.plans);setCases(b.requests);
 }
 async function saveCloud(event:FormEvent){
  event.preventDefault();
  if(!validPlan(draft)){setError("Check the plan figures and required fields.");return;}
  setBusy(true);setError("");setNotice("");
  const path=editing?"plans/"+editing:"plans";
  try{
   await request(path,editing?"PATCH":"POST",{
    type:draft.type,purpose:draft.purpose,country:draft.country,currency:draft.currency,
    amount:draft.amount,months:draft.months,annual_rate:draft.annualRate
   });
   await loadData();setShowEditor(false);setEditing(null);setDraft({...defaultPlan});
   setNotice(editing?"Plan updated.":"Plan saved securely to your account.");
  }catch(e){setError(e instanceof Error?e.message:"Unable to save plan");}
  finally{setBusy(false);}
 }
 async function removeCloud(id:string){
  if(!window.confirm("Delete this plan from your account?"))return;
  setBusy(true);setError("");
  try{await request("plans/"+id,"DELETE");await loadData();setNotice("Plan deleted from your account.");}
  catch(e){setError(e instanceof Error?e.message:"Could not delete plan");}
  finally{setBusy(false);}
 }
 async function importLocal(){
  setBusy(true);setError("");setNotice("");
  const known=new Set(plans.map(x=>x.id));let imported=0,skipped=0;
  try{
   for(const p of readPlans()){
    if(!validPlan(p)||known.has(p.id)){skipped++;continue;}
    const id=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(p.id)?p.id:crypto.randomUUID();
    try{
     await request("plans","POST",{id,type:p.type,purpose:p.purpose,country:p.country,
      currency:p.currency,amount:p.amount,months:p.months,annual_rate:p.annualRate});
     imported++;known.add(id);
    }catch(e){
     if(e instanceof Error&&e.message.includes("already exists")){skipped++;continue;}
     throw e;
    }
   }
   await loadData();
   setNotice(imported+" plan(s) imported. "+skipped+" previously imported or duplicate plan(s) skipped.");
  }catch(e){setError(e instanceof Error?e.message:"Unable to import plans");await loadData().catch(()=>undefined);}
  finally{setBusy(false);}
 }
 async function openThread(id:string){
  setThreadId(id);setReply("");setError("");
  try{const result=await request<{messages:ThreadMessage[]}>("requests/"+id+"/messages");setMessages(result.messages);}
  catch(e){setError(e instanceof Error?e.message:"Unable to load conversation");}
 }
 async function sendReply(event:FormEvent){
  event.preventDefault();if(!threadId||reply.trim().length<2)return;
  setBusy(true);setError("");
  try{await request("requests/"+threadId+"/messages","POST",{body:reply.trim()});setReply("");
   await openThread(threadId);setNotice("Reply saved in your private request conversation.");}
  catch(e){setError(e instanceof Error?e.message:"Unable to send reply");}
  finally{setBusy(false);}
 }
 function beginEdit(p:CloudPlan){setEditing(p.id);setDraft(asInput(p));setShowEditor(true);}
 function beginRequest(p:CloudPlan){
  const plan=asInput(p);
  setRequestPlan({...plan,id:p.id,createdAt:p.created_at,updatedAt:p.updated_at});
 }
 const localCount=typeof window==="undefined"?0:readPlans().length;

 return <main id="main-content" className="account-page">
  <div className="container account-container">
   <div className="account-heading"><p className="overline">Lending Ezy / Your space</p>
    <h1>Plan your next move.<br/><em>Keep it yours.</em></h1>
    <p>A private place for financing scenarios and conversations with the review team. No automated credit decisions.</p>
   </div>
   {!enabled?<div className="account-availability"><LockKeyhole size={25}/>
    <div><h2>Secure accounts are being prepared.</h2><p>Account registration and online storage are not enabled on this preview. You can still use the repayment calculator and save plans locally on your device.</p>
    <Link href="/dashboard" className="button button-primary">Go to my local plans <ArrowUpRight size={17}/></Link></div>
   </div>:checking?<div className="account-availability"><p role="status">Checking your session…</p></div>:
   !user?<div className="account-auth-layout">
    <section className="account-auth-card">
     <div className="account-auth-heading"><span><LockKeyhole size={21}/></span>
      <p className="overline">{mode==="signup"?"Create a private account":mode==="forgot"?"Recover access":"Secure customer access"}</p>
      <h2>{mode==="signup"?"Get started.":mode==="forgot"?"Reset your password.":"Welcome back."}</h2>
      <p>{mode==="signup"?"Confirm your email to activate your account.":"Your financing plans and messages stay attached to your verified account."}</p>
     </div>
     {error&&<p role="alert" className="account-error">{error}</p>}
     {notice&&<p role="status" className="account-notice">{notice}</p>}
     <form className="account-form" onSubmit={authentication}>
      {mode==="signup"&&<>
       <label>Full name<input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></label>
       <label>Country or region<select value={country} onChange={e=>setCountry(e.target.value)}>{countries.map(x=><option key={x.code} value={x.code}>{x.label}</option>)}</select></label>
      </>}
      <label>Email address<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      {mode!=="forgot"&&<label>Password<input type="password" required minLength={mode==="signup"?12:1} maxLength={128} autoComplete={mode==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)}/>{mode==="signup"&&<small>Use a unique password of at least 12 characters.</small>}</label>}
      {mode==="signup"&&<label className="account-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I agree to the <Link href="/terms">terms</Link> and <Link href="/privacy">privacy notice</Link>.</span></label>}
      <button type="submit" className="button button-primary" disabled={busy}>{busy?"Please wait…":mode==="signup"?"Create account":mode==="forgot"?"Send reset link":"Sign in"} <ArrowRight size={17}/></button>
     </form>
     <div className="account-auth-links">
      <button type="button" onClick={()=>{setMode(mode==="signup"?"signin":"signup");setError("");setNotice("");}}>{mode==="signup"?"I already have an account":"Create an account"}</button>
      {mode!=="forgot"?<button type="button" onClick={()=>{setMode("forgot");setError("");setNotice("");}}>Forgot password?</button>:<button type="button" onClick={()=>{setMode("signin");setError("");setNotice("");}}>Back to sign in</button>}
     </div>
     <div className="account-resend"><button type="button" onClick={async()=>{if(!email){setError("Enter your email first.");return;}setBusy(true);setError("");try{const r=await request<{message:string}>("resend-verification","POST",{email});setNotice(r.message);}catch(e){setError(e instanceof Error?e.message:"Unable to resend");}finally{setBusy(false);}}} disabled={busy}>Resend verification email</button></div>
    </section>
    <aside className="account-auth-aside"><span>YOUR FINANCIAL THINKING, IN ONE PLACE</span>
     <h2>Clarity now.<br/><em>Confidence later.</em></h2>
     <div><ShieldCheck size={23}/><p>Verified access and private stored financial assumptions</p></div>
     <div><Wallet size={23}/><p>Bring plans saved on this browser into your account</p></div>
     <div><MessageSquare size={23}/><p>Track a request and reply directly to the review team</p></div>
     <p>Repayment estimates are illustrative. No loan offer, underwriting decision or disbursement is made here.</p>
    </aside>
   </div>:<>
    <div className="account-member-bar"><div><p className="overline">Verified customer workspace</p><h2>Welcome, {user.full_name.split(" ")[0]}.</h2><p>{user.email} · {user.country}</p></div><button type="button" onClick={signout} disabled={busy}><LogOut size={16}/> Sign out</button></div>
    {error&&<p role="alert" className="account-error">{error}</p>}
    {notice&&<p role="status" className="account-notice">{notice}</p>}
    <div className="account-summary-grid">
     <div><Wallet size={19}/><span>Account plans</span><strong>{plans.length}</strong><small>Stored securely on the server</small></div>
     <div><FileText size={19}/><span>Financing requests</span><strong>{cases.length}</strong><small>Submitted while signed in</small></div>
     <div><Mail size={19}/><span>Information requests</span><strong>{cases.filter(x=>x.status==="needs_information").length}</strong><small>Awaiting your response</small></div>
    </div>
    <div className="account-workspace-grid">
     <section className="account-workspace-main">
      <div className="account-section-head"><div><p className="overline">01 / Your scenarios</p><h2>Saved financing plans</h2></div><button type="button" className="button button-primary" onClick={()=>{setDraft({...defaultPlan,country:user.country});setEditing(null);setShowEditor(true);}}><Plus size={17}/> New plan</button></div>
      <div className="account-import"><UploadCloud size={23}/><div><strong>Bring your local plans with you</strong><p>Import existing plans from this browser into your account. Nothing transfers without your action.</p></div><button type="button" disabled={busy||localCount===0} onClick={importLocal}>Import from device</button></div>
      {showEditor&&<form className="account-plan-editor" onSubmit={saveCloud}>
       <div className="account-section-head"><div><p className="overline">{editing?"Update plan":"New plan"}</p><h3>Make the numbers yours.</h3></div><button type="button" onClick={()=>setShowEditor(false)}>Cancel</button></div>
       <div className="account-field-grid">
        <label>Financing type<select value={draft.type} onChange={e=>setDraft(p=>{
          const type=e.target.value as "personal"|"business";
          return type==="business" && p.purpose==="Home purchase & mortgage"
            ? {...p,type,purpose:businessPurposes[0],months:36}
            : {...p,type};
        })}><option value="personal">Personal</option><option value="business">Business</option></select></label>
        <label>Purpose<input required minLength={2} maxLength={80} value={draft.purpose} onChange={e=>setDraft(p=>{
          const purpose=e.target.value;
          const allowed=termsForPurpose(purpose);
          return {...p,purpose,months:allowed.some(m=>m===p.months)?p.months:purpose==="Home purchase & mortgage"?240:24};
        })}/></label>
        <label>Country<select value={draft.country} onChange={e=>setDraft(p=>({...p,country:e.target.value}))}>{countries.map(x=><option key={x.code} value={x.code}>{x.label}</option>)}</select></label>
        <label>Currency<select value={draft.currency} onChange={e=>setDraft(p=>({...p,currency:e.target.value}))}>{supportedCurrencies.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
        <label>Amount<input type="number" min="500" max="10000000" step="100" required value={draft.amount} onChange={e=>setDraft(p=>({...p,amount:Number(e.target.value)}))}/></label>
        <label>Repayment months<select value={draft.months} onChange={e=>setDraft(p=>({...p,months:Number(e.target.value)}))}>{termsForPurpose(draft.purpose).map(x=><option key={x} value={x}>{x >= 12 && x%12===0 ? `${x/12} ${x===12?"year":"years"}` : `${x} months`}</option>)}</select></label>
        <label>Assumed annual rate (%)<input type="number" min="0" max="40" step="0.25" required value={draft.annualRate} onChange={e=>setDraft(p=>({...p,annualRate:Number(e.target.value)}))}/></label>
       </div>
       <p className="account-rate-note">These are personal planning assumptions, not a quoted lending rate.</p>
       <button className="button button-primary" type="submit" disabled={busy}>{busy?"Saving…":"Save to my account"} <ArrowRight size={16}/></button>
      </form>}
      {plans.length===0?<div className="account-empty"><Wallet size={25}/><h3>Your planning starts here.</h3><p>Save your first account plan, or import a scenario you previously saved on this device.</p></div>:
      <div className="account-plans">{plans.map(p=>{const s=summary(asInput(p));return <article key={p.id} className="account-plan">
       <div className="account-plan-top"><span>{p.type} / {p.purpose}</span><small>{p.country} · Updated {date(p.updated_at)}</small></div>
       <h3>{money(Number(p.amount),p.currency)}</h3><p>{p.months} months · {p.annual_rate}% assumed annual rate</p>
       <div className="account-plan-total"><span>Estimated monthly</span><strong>{money(s.monthly,p.currency)}</strong></div>
       <div className="account-plan-tools">
        <button type="button" onClick={()=>beginEdit(p)} disabled={busy}>Edit</button>
        <button type="button" onClick={()=>downloadSchedule(asInput(p))}><Download size={15}/> Export</button>
        <button type="button" onClick={()=>removeCloud(p.id)} disabled={busy}><Trash2 size={15}/> Delete</button>
        {requestIntakeEnabled&&<button type="button" onClick={()=>beginRequest(p)}>Send request <ArrowUpRight size={14}/></button>}
       </div>
      </article>})}</div>}
      <div className="account-section-head account-cases-heading"><div><p className="overline">02 / Request tracking</p><h2>Financing requests</h2></div><span>Not credit approvals</span></div>
      {cases.length===0?<div className="account-empty"><FileText size={25}/><h3>No online requests yet.</h3><p>Submitted requests appear here when you are signed in. Anonymous submissions cannot be claimed later by email.</p></div>:
      <div className="account-case-list">{cases.map(c=><article key={c.id} className="account-case">
       <div><span>{c.kind} / {c.purpose}</span><h3>{money(Number(c.amount),c.currency)}</h3><small>Ref {c.id.slice(0,8).toUpperCase()} · {date(c.created_at)}</small></div>
       <div><strong className="account-case-status">{statuses[c.status]||c.status}</strong><button type="button" onClick={()=>openThread(c.id)}><MessageSquare size={16}/> Open conversation</button></div>
      </article>)}</div>}
      {threadId&&<section className="account-thread" aria-label="Private financing conversation">
       <div className="account-section-head"><div><p className="overline">Private communication</p><h3>Conversation · {threadId.slice(0,8).toUpperCase()}</h3></div><button type="button" onClick={()=>setThreadId(null)}>Close</button></div>
       {messages.length===0?<p className="account-thread-empty">No messages yet. You can ask the review team a question here.</p>:
        <div className="account-messages">{messages.map(m=><div key={m.id} className={"account-message "+(m.author==="customer"?"own":"")}><span>{m.author==="customer"?"You":"Review team"} · {date(m.created_at)}</span><p>{m.body}</p></div>)}</div>}
       <form onSubmit={sendReply} className="account-reply"><label>Your reply<textarea required minLength={2} maxLength={2000} rows={3} value={reply} onChange={e=>setReply(e.target.value)} placeholder="Add a question or the information the team requested. Never share passwords or payment card details."/></label><button className="button button-primary" disabled={busy||reply.trim().length<2}>Send message <ArrowRight size={16}/></button></form>
       <p className="account-rate-note">Replies are saved in your account conversation. Email notifications require separately configured delivery.</p>
      </section>}
     </section>
     <aside className="account-profile">
      <div className="account-profile-top"><CheckCircle2 size={21}/><span>EMAIL VERIFIED</span></div>
      <h2>Account details</h2>
      <form onSubmit={updateProfile} className="account-form">
       <label>Full name<input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></label>
       <label>Email address<input readOnly value={user.email} aria-label="Verified email address"/></label>
       <label>Country or region<select value={country} onChange={e=>setCountry(e.target.value)}>{countries.map(x=><option key={x.code} value={x.code}>{x.label}</option>)}</select></label>
       <button className="button button-primary" disabled={busy} type="submit">Update profile</button>
      </form>
      <p>Only an authenticated customer can access their saved account plans and linked requests.</p>
      <Link href="/dashboard" className="inline-link">My browser-only plans <ArrowUpRight size={16}/></Link>
      <button className="account-data-download" type="button" onClick={exportAccount} disabled={busy}><Download size={16}/> Download account data</button>
     </aside>
    </div>
   </>}
  </div>
  {requestPlan&&<SubmitFinancingRequest plan={requestPlan} onClose={()=>{setRequestPlan(null);void loadData();}}/>}
 </main>;
}
