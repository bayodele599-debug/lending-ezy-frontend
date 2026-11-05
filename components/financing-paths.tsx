import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import PhotoFrame from "./photo-frame";
import Reveal from "./reveal";

const pathways = [
  {
    "code": "03",
    "label": "PROPERTY & HOME",
    "title": "Home & housing",
    "text": "Plan for buying, moving or renovating. Mortgage estimates need longer terms and a separate allowance for property costs.",
    "href": "/apply?type=personal&purpose=Home%20purchase%20%26%20mortgage&months=240",
    "src": "https://images.pexels.com/photos/8730048/pexels-photo-8730048.jpeg?auto=compress&cs=tinysrgb&w=960",
    "alt": "A couple receiving keys to their new home",
    "credit": "Kampus Production",
    "creditHref": "https://www.pexels.com/photo/a-couple-receiving-keys-from-a-broker-8730048/"
  },
  {
    "code": "04",
    "label": "EVERYDAY MOBILITY",
    "title": "Car & vehicle",
    "text": "Compare vehicle repayments alongside insurance, servicing, fuel and other running costs.",
    "href": "/apply?type=personal&purpose=Car%20%26%20transport&months=24",
    "src": "https://images.pexels.com/photos/7144201/pexels-photo-7144201.jpeg?auto=compress&cs=tinysrgb&w=960",
    "alt": "A woman receiving car keys from a salesperson",
    "credit": "Antoni Shkraba",
    "creditHref": "https://www.pexels.com/photo/photo-of-a-woman-getting-a-car-key-7144201/"
  },
  {
    "code": "05",
    "label": "LEARNING & GROWTH",
    "title": "Education",
    "text": "Explore manageable repayment scenarios for tuition, courses or professional development.",
    "href": "/apply?type=personal&purpose=Education&months=24",
    "src": "https://images.pexels.com/photos/7777691/pexels-photo-7777691.jpeg?auto=compress&cs=tinysrgb&w=960",
    "alt": "Two students working with laptops in a library",
    "credit": "Mikhail Nilov",
    "creditHref": "https://www.pexels.com/photo/college-students-with-laptops-inside-the-library-7777691/"
  },
  {
    "code": "06",
    "label": "WHEN LIFE CHANGES",
    "title": "Unexpected expenses",
    "text": "Explore the cost of a temporary financial shortfall before making a borrowing decision.",
    "href": "/apply?type=personal&purpose=Emergency%20expenses&months=24",
    "src": "https://images.pexels.com/photos/5900033/pexels-photo-5900033.jpeg?auto=compress&cs=tinysrgb&w=960",
    "alt": "A woman calculating household expenses with documents and a laptop",
    "credit": "Kaboompics",
    "creditHref": "https://www.pexels.com/photo/woman-doing-accounting-from-home-5900033/"
  },
  {
    "code": "07",
    "label": "GETTING ORGANISED",
    "title": "Debt consolidation",
    "text": "Compare a single repayment estimate with existing debts and check the total interest and fees.",
    "href": "/apply?type=personal&purpose=Debt%20consolidation&months=24",
    "src": "https://images.pexels.com/photos/6963017/pexels-photo-6963017.jpeg?auto=compress&cs=tinysrgb&w=960",
    "alt": "A person reviewing bills and financial documents with a calculator",
    "credit": "Mikhail Nilov",
    "creditHref": "https://www.pexels.com/photo/couple-people-woman-hand-6963017/"
  }
];

export default function FinancingPaths() {
  return <div className="financing-paths" aria-labelledby="financing-paths-title">
    <div className="financing-paths-heading">
      <div><p className="overline">More ways to plan</p><h3 id="financing-paths-title">A plan for every <em>next step.</em></h3></div>
      <p>Explore common borrowing purposes through editable repayment estimates. These are planning tools, not available loan offers.</p>
    </div>
    <Reveal className="financing-path-grid">
      {pathways.map(path => <Link href={path.href} className="financing-path-card" key={path.code} aria-label={`Explore ${path.title} financing plans`}>
        <div className="financing-path-media">
          <PhotoFrame className="financing-path-photo" src={path.src} alt={path.alt} credit={path.credit} creditHref={path.creditHref} sizes="(max-width:650px) 90vw, (max-width:1000px) 46vw, 30vw"/>
          <span className="financing-path-badge">{path.code} / {path.label}</span>
        </div>
        <div className="financing-path-body">
          <div className="financing-path-title-row"><h4>{path.title}</h4><ArrowUpRight size={20}/></div>
          <p>{path.text}</p>
          <span className="financing-path-link">Explore a plan <ArrowRight size={16}/></span>
        </div>
      </Link>)}
    </Reveal>
    <p className="financing-path-disclosure">Illustrative calculations only. Mortgage terms, taxes, insurance, closing costs and other charges vary by country and lender. These scenarios are not loan offers, eligibility checks or credit applications.</p>
  </div>;
}
