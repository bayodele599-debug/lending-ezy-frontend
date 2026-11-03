import {NextRequest,NextResponse} from "next/server";

export const dynamic = "force-dynamic";
type Context={params:Promise<{path:string[]}>};
const COOKIE="lending_ezy_customer_session";
const UUID="[0-9a-fA-F-]{36}";
const permitted=new RegExp("^(register|login|logout|verify-email|resend-verification|password/request-reset|password/reset|me|export|plans|plans/"+UUID+"|requests|requests/"+UUID+"/messages|submit-request)$");

function settings(){
 const allowed=process.env.CUSTOMER_PORTAL_ENABLED==="true"||
  (process.env.NODE_ENV==="development"&&process.env.CUSTOMER_PORTAL_ENABLED!=="false");
 const host=process.env.INTERNAL_API_URL||(process.env.NODE_ENV==="development"?"http://127.0.0.1:8000":"");
 return {allowed,host:host.replace(/\/$/,"")};
}
function problem(message:string,status:number){
 return NextResponse.json({error:message},{status,headers:{"Cache-Control":"no-store"}});
}
async function proxy(req:NextRequest,ctx:Context,method:"GET"|"POST"|"PATCH"|"DELETE"){
 const {allowed,host}=settings();
 if(!allowed||!host)return problem("Customer accounts are not open yet.",503);
 const {path}=await ctx.params;
 const tail=path.join("/");
 if(!permitted.test(tail))return problem("Not found",404);
 if(method!=="GET"){
  if(req.headers.get("sec-fetch-site")==="cross-site")return problem("Invalid origin",403);
  const origin=req.headers.get("origin");
  if(origin&&origin!==req.nextUrl.origin)return problem("Invalid origin",403);
 }
 const token=req.cookies.get(COOKIE)?.value;
 const target=tail==="submit-request"?"/api/v1/financing-requests":"/api/v1/account/"+tail;
 const headers=new Headers({"Accept":"application/json"});
 if(token)headers.set("Authorization","Bearer "+token);
 let body: string|undefined;
 if(method!=="GET"&&method!=="DELETE"){
  body=await req.text();
  if(body.length>25000)return problem("Request is too large",413);
  headers.set("Content-Type","application/json");
 }
 try{
  const response=await fetch(host+target,{method,headers,body,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
  const data=await response.json().catch(()=>({error:"The account service returned an invalid response."}));
  const out=NextResponse.json(data,{status:response.status,headers:{"Cache-Control":"no-store"}});
  if(tail==="login"&&response.ok&&typeof data?.token==="string"){
   const {token:ignored,...safe}=data;
   const secure=NextResponse.json(safe,{status:response.status,headers:{"Cache-Control":"no-store"}});
   secure.cookies.set(COOKIE,data.token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:14*86400});
   return secure;
  }
  if(tail==="logout"){
   out.cookies.set(COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});
  }
  return out;
 }catch{
  if(tail==="logout"){
   const out=NextResponse.json({message:"Signed out locally"},{headers:{"Cache-Control":"no-store"}});
   out.cookies.set(COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});
   return out;
  }
  return problem("Customer account service is unavailable.",502);
 }
}
export async function GET(req:NextRequest,ctx:Context){return proxy(req,ctx,"GET");}
export async function POST(req:NextRequest,ctx:Context){return proxy(req,ctx,"POST");}
export async function PATCH(req:NextRequest,ctx:Context){return proxy(req,ctx,"PATCH");}
export async function DELETE(req:NextRequest,ctx:Context){return proxy(req,ctx,"DELETE");}
