export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/,'');
export type QuoteRequest = { product_id:string; currency:string; principal:string; term_months:number };
export type Quote = {currency:string;principal:string;monthly_payment:string;total_interest:string;total_repayment:string;nominal_annual_rate_bps:number;term_months:number;illustrative:boolean;assumptions:string;schedule:Array<{installment:number;payment:string;principal:string;interest:string;balance:string}>};
export async function postJSON<T>(path:string,payload:unknown,signal?:AbortSignal):Promise<T>{
 const response=await fetch(API_URL+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal,cache:'no-store'});
 if(!response.ok){const err=await response.json().catch(()=>null);throw new Error(typeof err?.detail==='string'?err.detail:`API returned ${response.status}`);}
 return response.json();
}
