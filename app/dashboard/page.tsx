import Link from 'next/link';
import {ArrowUpRight,CircleDollarSign,CalendarClock,ChartNoAxesCombined,ShieldCheck} from 'lucide-react';
export default function Dashboard(){return <main className="simple-page"><div className="container"><div className="page-heading"><span className="eyebrow">BORROWER PORTAL CONCEPT</span><h1>A clearer financial <em>overview.</em></h1><p>This dashboard is a design preview, not an authenticated account or a representation of a customer's finances.</p></div><div className="dashboard-grid">
 <article className="stat-card"><CircleDollarSign/><span>Outstanding loan balance</span><strong>—</strong><small>No live lending enabled</small></article>
 <article className="stat-card"><CalendarClock/><span>Next repayment</span><strong>—</strong><small>No active loan</small></article>
 <article className="stat-card"><ChartNoAxesCombined/><span>Application status</span><strong>Preview</strong><small>Sandbox only</small></article>
 </div><div className="simple-card dashboard-callout"><ShieldCheck size={28}/><div><h2>Designed for informed borrowing.</h2><p>In an authorised launch, this space will provide verified loan balances, repayment calendars, and downloadable statements.</p><Link className="text-link" href="/apply">Try a sandbox application <ArrowUpRight size={16}/></Link></div></div></div></main>;}
