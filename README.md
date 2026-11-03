# Lending Ezy — Customer website

A responsive international lending-information website built with Next.js 15 and React 19. The customer experience uses an editorial forest-green and ivory identity, straightforward copy, and restrained interactions.

## Routes

- `/` — home, product discovery, repayment calculator, how it works and FAQs
- `/personal` and `/business` — borrowing information and calculator
- `/partner` — information for potential institutional partners
- `/how-it-works`, `/about`, `/faq` — supporting content
- `/join` — individual and partner enquiries
- `/privacy`, `/terms` — website and data-use information

Legacy `/apply` and `/dashboard` links redirect to `/join` until a properly authorised, authenticated loan service exists.

## Working features

The repayment calculator works independently of the backend. Visitors can change principal, currency, term and assumed interest rate, compare up to three scenarios, inspect a month-by-month repayment schedule and download a CSV. The calculator uses illustrative amortisation mathematics, not live lender rates or regulated APR calculations.

## Development

1. Run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.
5. Verify with `npm run typecheck` and `npm run build`.

## Enquiry activation

The contact page uses `lending-ezy-backend` via `NEXT_PUBLIC_API_URL`. To accept submissions, configure the backend database, secure admin inbox, production bot protection, and required privacy/compliance processes. Set `NEXT_PUBLIC_INQUIRIES_ENABLED=true` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` only when the backend and privacy arrangements are ready. Until then, the form clearly indicates that online enquiries are closed.

## Financial-service boundary

This is an informational website. It does not currently accept credit applications, verify eligibility, approve or disburse loans, or process repayments. Country-specific credit products require authorised lending entities, operational readiness, and legally reviewed disclosures before activation.
