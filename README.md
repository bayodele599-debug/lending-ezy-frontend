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

The contact-page country/region selector uses a committed, stable list of English country labels to avoid server/client locale-data hydration differences.


## Customer-facing planning workflow

The public site now has functional customer screens (not placeholder redirects):

- \`/apply\`: guided personal/business financing planner with three steps, country and currency selection, validation, live repayment estimates, edit and save flow.
- \`/dashboard\`: browser-based planning space with create, edit, duplicate, deletion with confirmation, filters, up to three plans compared, and per-plan CSV download.
- Calculator-to-planner deep links preserve the selected amount, term, assumed rate, type and currency.
- \`/join\`: the actual enquiry submission form appears only when the existing backend and bot protection are configured; otherwise the page offers a working plan builder instead of disabled form controls.

Saved assumptions remain in the local browser storage on the same device. This is not an online borrower account. Sensitive documents, identity information, financial account credentials and payment data are intentionally excluded from the planning workflow. Credit origination, approval, disbursement and repayments require regulated backend services; the user interface does not represent saved plans as submitted applications. Appropriate disclosure is provided at review and in the legal pages rather than repeated across the marketing sections.


## Financing request intake integration

When \`NEXT_PUBLIC_FINANCING_REQUESTS_ENABLED=true\`, \`NEXT_PUBLIC_API_URL\` points to the deployed FastAPI backend and the Turnstile site key is configured in production, each saved plan offers **Submit financing request**. The visitor gives contact details, a business name when appropriate, consent and acknowledgement, then sends the plan with an idempotency UUID to \`POST /api/v1/financing-requests\`. Only a confirmed backend response displays a server-issued reference.

The administrator's protected \`/requests\` page displays submissions and their manual case histories when the backend and both applications are connected. Unsumbitted financial scenarios remain in the user's browser. Administrative case triage is separate from binding lending decisions, disbursements, repayments or credit offers.



## Atelier visual system — November 2026

This design refresh preserves the working FastAPI/Next.js contracts, local planning state and account-free borrowing estimator. It introduces:

- A photographic homepage hero with a real interactive borrowing preview. The preview uses exactly the same amortisation code as the full calculator and passes its assumptions to \`/apply\`; it does not invent trust statistics or loan offers.
- Context-sensitive glass island navigation that deepens on scroll, illustrated editorial cards with existing attributed photography, refined section composition and premium green/ivory/sage textures.
- A shared visual treatment for repayment calculator, personal/business pages, financing wizard, My Plans, contact, FAQ, partner pages, and responsive mobile screens.
- Reduced-motion and reduced-transparency fallbacks. Glass is used for navigation and selected summary surfaces; forms and financial figures remain readable.
- The Chromium responsive audit checks 132 viewport/route combinations, WCAG accessibility at key widths, sticky navigation, the interactive hero, planner journey, exports, and saved-plan integrity.

Source photography is served from the same external photo sources already documented in this README. No image credits are placed over photography.


## Private customer account workspace (optional, Nov 2026)

When both the frontend server flags \`CUSTOMER_PORTAL_ENABLED\` and
\`NEXT_PUBLIC_CUSTOMER_PORTAL_ENABLED\` are true and the FastAPI backend is
running with \`CUSTOMER_ACCOUNTS_ENABLED=true\`, the following are available:

- Customer registration, one-time email verification, login, password recovery,
  14-day revocable HttpOnly-cookie sessions (cookie held only by Next.js proxy)
- Durable account-based financial planning, create/edit/delete/export, and an
  **explicit** import from existing browser-local scenarios
- Account-linked financing request tracking, private admin/customer messages,
  and optional generic email updates where SMTP is configured
- Account page \`/account\`, email verification \`/account/verify\`, and
  password reset \`/account/reset\`; none are indexed by search engines

Existing browser-only My plans remains available without registration. An
anonymous case is not automatically joined to an account on matching email.
Do not enable accounts on Vercel until backend, SMTP, retention/privacy and
applicant-status workflows have been reviewed and deployed securely.

Local test: backend \`deploy/Start-LendingEzy.ps1\` now starts PostgreSQL and
Mailpit (http://127.0.0.1:8025), FastAPI on 8000, customer on 3000 and admin
on 3001. No external delivery occurs in local development.

## Lending-purpose imagery and planner presets (Nov 2026)
The homepage offers personal and business planning plus housing/mortgage, vehicle, education, unexpected-expense and consolidation scenarios. These are illustrative repayment plans, not lender products or financing offers. Direct category links preselect the corresponding purpose in /apply. Housing illustrations support 5–30 years, with a note excluding escrow, insurance, property taxes and other fees. Other scenarios remain short-term; historical browser plans stay intact.

Pexels free-to-use photography (served by images.pexels.com and subject to third-party availability):
- Hero — RDNE Stock project: https://www.pexels.com/photo/woman-uses-calculator-7491011/
- Personal — Mikhail Nilov: https://www.pexels.com/photo/woman-budgeting-her-bills-6962992/
- Housing — Kampus Production: https://www.pexels.com/photo/a-couple-receiving-keys-from-a-broker-8730048/
- Auto — Antoni Shkraba: https://www.pexels.com/photo/photo-of-a-woman-getting-a-car-key-7144201/
- Education — Mikhail Nilov: https://www.pexels.com/photo/college-students-with-laptops-inside-the-library-7777691/
- Emergency — Kaboompics: https://www.pexels.com/photo/woman-doing-accounting-from-home-5900033/
- Debt consolidation — Mikhail Nilov: https://www.pexels.com/photo/couple-people-woman-hand-6963017/
- Story photo — RDNE Stock project: https://www.pexels.com/photo/happy-couple-holding-and-showing-a-house-key-8293700/

All plans exclude fees, property taxes, insurance and other lender- and market-specific charges. They do not constitute loan applications, credit approvals or mortgage offers.

## Photo-composition and first-fold refinements
The hero uses a side-by-side image and live finance estimate on wider screens, a portrait/estimate stack on mid-size laptops, and the established photo-first layout on mobile. Personal and business portraits use an upper-face crop with their editorial notes **below** the photo instead of placed over the subject. The first informational section begins closer to the hero. These rules are covered by first-fold browser geometry checks at 1440×800, 1280×720, 1024×700 and 390×760.
