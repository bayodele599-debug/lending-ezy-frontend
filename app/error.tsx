"use client";
import Link from "next/link";
import {RefreshCcw,ArrowUpRight} from "lucide-react";
export default function ErrorPage({reset}:{error:Error & {digest?:string};reset:()=>void}){return <main id="main-content" className="site-system-page"><div className="container"><p className="overline">Something interrupted your visit</p><h1>We can try <em>that again.</em></h1><p>This page could not finish loading. Try again, or go back to your planning space.</p><div className="site-system-actions"><button type="button" onClick={reset} className="button button-primary"><RefreshCcw size={17}/> Try again</button><Link href="/dashboard" className="inline-link">My saved plans <ArrowUpRight size={17}/></Link></div></div></main>}
