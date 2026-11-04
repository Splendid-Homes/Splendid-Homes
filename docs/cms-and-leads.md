# CMS and lead inbox (Phase 9)

The site's content and every enquiry now live in **Payload CMS 3.91**. Payload runs inside the same Next.js app, at `/admin`. Data is stored in **Cloudflare D1** (SQLite) and uploaded files in **Cloudflare R2**. Locally, Wrangler emulates both under `.wrangler/state`, so no Cloudflare account is needed until deployment (Phase 10).

## Running it locally

```bash
npm install
npm run migrate        # create/upgrade the local database schema
npm run seed           # load the prototype content (skips anything already there)
NEXT_PUBLIC_SITE_URL=http://localhost:3100 npx next build && npx next start -p 3100
```

- Admin: <http://localhost:3100/admin>. The seed creates the first **Main admin**. Its email and generated password are in `.env.local` (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). Change the password after the first sign-in.
- `npm run seed -- --fresh` reloads the sample content. It keeps staff accounts and leads.
- Schema changes: edit the collections in `src/payload/`, then run `npm run payload -- migrate:create <name>` and `npm run migrate`.

## What's in the admin

| Section | Contents | Who can edit |
| --- | --- | --- |
| Leads → Leads, Lead board | Every enquiry, plus the New / Contacted / Qualified / Closed board | Main admin (all); Sales agent (own leads: status and notes only) |
| Leads → CVs, Exports | Career-application CVs (private); CSV exports of leads | Main admin only |
| Listings | Properties (sale, rent, commercial) and off-plan projects | Main admin, Editor |
| Content | Communities, developers, team, articles, testimonials, services, careers | Main admin, Editor |
| Admin → Site settings | Company/NAP, homepage editor (section toggles), market-data source, currency rates, lead-alert emails, legal pages | Editor; Main admin only for legal name, ORN and lead-alert settings |
| Admin → Staff accounts, Activity log, Media | Users and roles; who changed what; media library | Main admin (activity log is read-only) |

Roles follow Document 5 ("Who can see what"):

- Visitors see only published content and can never reach leads.
- Editors never see leads.
- Sales agents see only the leads assigned to them. They can change the status and add notes, but not the client's details.
- The Main admin sees everything, can export, and manages staff.

Switching off a staff account blocks sign-in immediately. Every staff change is recorded in the activity log.

**Publishing:** content has a Draft / Published switch, and only Published items appear on the site. Edits show up on the live site on the next page view; the content cache is tagged and refreshed by Payload hooks.

## How a lead flows

1. A visitor submits any form. All forms post to one server action (`src/lib/leadActions.ts`) and work without JavaScript too.
2. **Checks:**
   - Lead types and fields are allow-listed, with email/phone validation and recorded privacy consent.
   - A hidden honeypot quietly drops bots.
   - Each email address is limited to 5 submissions per 10 minutes.
   - Uploaded CVs are checked by content: PDF or Word only, up to 5 MB.
3. **Saved** in Leads with:
   - type, contact details, message and form-specific details (viewing day/time, valuation property, budget…);
   - the linked listing, project or job, and the source page;
   - the **assigned agent** (listing enquiries go to the listing's agent automatically).
4. **After the reply is sent** (`after()`, so the visitor never waits):
   - an **email alert** goes to the addresses in *Site settings → Lead alerts* plus the assigned agent, with a button that opens the lead in the dashboard;
   - a **Google Sheets row** is added when enabled (F27): date/time, type, name, phone, email, property or service, source page, assigned agent;
   - for brochure requests, the visitor is emailed the project's brochure PDF once one is uploaded.

   The outcome is stored on the lead under *Delivery*. A failed email shows its error instead of a false "sent".

| Form | Lead type | Where |
| --- | --- | --- |
| Property enquiry | Property inquiry | Property pages (sidebar) |
| Book a viewing | Viewing request | Property pages (dialog, sticky mobile bar) |
| Register interest / Get the brochure | Register interest / Brochure download | Off-plan project pages |
| Valuation | Valuation request | Homepage, /sell (3 steps) |
| Talk to a specialist | Service enquiry | /services (each service) |
| Get pre-approved | Mortgage request | /mortgage |
| Property alert | Property alert | Empty search results on /buy, /rent |
| Contact form ("I'm interested in…") | Contact form | /contact, /commercial |
| Speak to the author | Callback | Every article |
| Newsletter | Newsletter | Footer, /insights |
| Apply now (with CV upload) | Career application | /careers |

## Needed from the client before launch

| Item | Why | Where it goes |
| --- | --- | --- |
| **Resend account + verified sending domain** (e.g. `splendidhomes.ae`) | Lead alert emails and staff password resets. Until then emails are only written to the server log, and each lead says so under *Delivery*. | `RESEND_API_KEY`, `EMAIL_FROM` (Worker secrets) |
| **Lead alert recipients** | Who receives every lead (defaults to the office email) | Admin → Site settings → Lead alerts |
| **Google Sheet + service account** (F27) | Copy each lead to the existing Google Sheet CRM | `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`; share the sheet with the service account; tick *Copy leads to Google Sheets* |
| **Staff list and roles** | Named accounts for each admin, editor and agent | Admin → Staff accounts (Main admin) |
| **Real content** | Replace the prototype sample data: listings with real DLD permits, real off-plan launches, photos, market figures, legal text | Admin (see `docs/content-checklist.md`) |

## Verification done (local)

- **Regression:** 66 pages pass the site audit; 0 broken internal links; all schema suites pass. The JSON-LD type counts are identical to the pre-CMS build.
- **Access (16 checks):** anonymous visitors can't reach leads, staff, CVs, activity or exports, can't see drafts, can't see lead-alert emails, and can't post leads directly. The admin dashboard and lead board render.
- **Leads end to end (36 checks, real browser):**
  - All 11 form types are stored with the correct type, links, details, assigned agent, consent and source page.
  - Validation errors are shown, and typed values are kept after an error.
  - The honeypot blocks bots.
  - A corrupt PDF is rejected politely; a real CV is stored privately.
  - Email delivery status is reported honestly.
- **CMS behaviour (11 checks):**
  - A sales agent sees only their leads and can update status and notes, but can't change client details, export, or read the activity log.
  - Notes and status changes are stamped with author and time.
  - Staff changes are logged.
  - An admin price edit appears on the live page.
- **Performance after the CMS:** home 97 / 100 / 100 / 100 (LCP 1.2 s); property page 99 / 100 / 100 / 100 (LCP 1.8 s), both mobile.

  This needed one fix. Payload sends a `Critical-CH` client-hint header on every path for its admin dark mode. That made Chrome retry each public page (about 600 ms) and would have split the CDN cache, so it's now limited to `/admin`.
