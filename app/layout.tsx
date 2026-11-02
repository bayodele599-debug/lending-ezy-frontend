import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = {title:'Lending Ezy | Global lending technology',description:'Modern lending infrastructure and transparent illustrative loan calculations.'};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><div className="announcement">PREVIEW ENVIRONMENT <span/> No live loans available</div><header className="site-header"><div className="container nav">
 <Link className="brand" href="/" aria-label="Lending Ezy home"><span className="brand-glyph">L<span>.</span></span><span>LENDING <b>EZY</b></span></Link>
 <nav aria-label="Main navigation"><Link href="/#calculator">Loan calculator</Link><Link href="/partner">For partners</Link><Link href="/dashboard">Dashboard demo</Link></nav>
 <Link href="/join" className="nav-cta">Join early access <span aria-hidden="true">↗</span></Link></div></header>
 {children}<footer className="footer"><div className="container footer-inner"><div><Link className="brand" href="/"><span className="brand-glyph">L<span>.</span></span>LENDING <b>EZY</b></Link><p>A thoughtful foundation for transparent credit experiences.</p></div><div><b>Explore</b><Link href="/#calculator">Calculator</Link><Link href="/apply">Sandbox application</Link><Link href="/partner">Partner technology</Link></div><div><b>Important</b><p>Preview software only. No regulated lending, live applications, approvals or transfers.</p></div></div><div className="container footer-low">© {new Date().getFullYear()} Lending Ezy — Working brand · Financial technology demonstration</div></footer></body></html>;
}
