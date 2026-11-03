"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {ArrowRight,CheckCircle2,LockKeyhole} from "lucide-react";

export default function AccountTokenAction({mode}:{mode:"verify"|"reset"}){
 const [token,setToken]=useState(""),[password,setPassword]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[done,setDone]=useState("");
 useEffect(()=>{
  const next=new URLSearchParams(window.location.search).get("token")||"";
  window.history.replaceState(null,"",window.location.pathname);
  if(!next){setError("This link is missing a verification token.");return;}
  setToken(next);
  if(mode==="verify"){
   setBusy(true);
   fetch("/api/account/verify-email",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({token:next}),cache:"no-store"})
    .then(async response=>{
     const body=await response.json().catch(()=>({}));
     if(!response.ok)throw new Error(body.detail||body.error||"Unable to verify email");
     setDone("Email verified. Your account is ready to sign in.");
    })
    .catch(e=>setError(e instanceof Error?e.message:"Verification failed"))
    .finally(()=>setBusy(false));
  }
 },[mode]);
 async function reset(e:FormEvent){
  e.preventDefault();if(!token||password.length<12)return;
  setBusy(true);setError("");
  try{
   const res=await fetch("/api/account/password/reset",{method:"POST",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password})});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data.detail||data.error||"Unable to reset password");
   setPassword("");setDone("Password updated. You can now sign in.");
  }catch(e){setError(e instanceof Error?e.message:"Unable to reset password");}
  finally{setBusy(false);}
 }
 return <main id="main-content" className="account-page">
  <div className="container account-token-shell"><div className="account-auth-card">
   <div className="account-auth-heading"><span><LockKeyhole size={22}/></span>
    <p className="overline">Secure customer access</p>
    <h1>{mode==="verify"?"Verify your email.":"Set a new password."}</h1>
    <p>{mode==="verify"?"Confirming your email address for Lending Ezy.":"Choose a new unique password with at least 12 characters."}</p>
   </div>
   {busy&&<p role="status" className="account-notice">Checking your request…</p>}
   {error&&<p role="alert" className="account-error">{error}</p>}
   {done&&<div role="status" className="account-token-success"><CheckCircle2 size={27}/><p>{done}</p></div>}
   {mode==="reset"&&token&&!done&&<form className="account-form" onSubmit={reset}>
    <label>New password<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <button type="submit" className="button button-primary" disabled={busy||password.length<12}>Reset password <ArrowRight size={17}/></button>
   </form>}
   <Link href="/account" className="inline-link">Back to account sign-in <ArrowRight size={17}/></Link>
  </div></div>
 </main>;
}
