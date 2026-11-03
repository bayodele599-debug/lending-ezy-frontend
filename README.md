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


## Editorial imagery and motion

The site uses restrained, opt-in-view animations with reduced-motion support. Editorial photography is shown only in a few storytelling sections and on personal/business information pages. The photos are illustrations of everyday life, not Lending Ezy customers, staff, or testimonials.

Photography (free under the Unsplash License at the time selected):
- [Ninthgrid — two women at a café](https://unsplash.com/photos/AB04SBsdHjY)
- [Ninthgrid — woman working at a café](https://unsplash.com/photos/J-IBERCeDTY)
- [GN Group — jewellery maker at a workbench](https://unsplash.com/photos/9rdoc89WxP0)

The images are served from Unsplash's image CDN. Before a high-traffic public launch, review CDN dependency, image-loading privacy and whether to self-host optimised licensed copies.


## Floating navigation and responsive polish

The site header is a persistent sticky, frosted-glass island over the page (with solid fallback for higher-contrast/reduced-transparency preferences). Mobile navigation supports Escape-key dismissal, outside-click dismissal, visible focus states, active-route indication and narrow viewports. The photo-credit links are not rendered on top of images; source attribution is retained in the Editorial imagery section above. Scroll anchor offsets account for the persistent header. Responsive CSS covers small phones, large phones, tablets and desktop widths.

Automated Next.js production builds verify compilation/type safety. Browser-specific responsive visual checks remain separate and should be completed for a full release QA sign-off.
