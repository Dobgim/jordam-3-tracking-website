# The Jordans — React + TypeScript + Tailwind

Rebuild of the saved home page in `../demo2.atlascargotransit.com`, using the same layout, copy and images,
plus an **admin dashboard** for managing shipments and a public **Track** page that shows them.

```bash
npm install
npm run dev      # http://localhost:5320        (admin: http://localhost:5320/admin)
npm run build    # production files in dist/
```

## Admin dashboard (`/admin`)

- **Overview** — counts by status, recently updated shipments, overdue deliveries, quick find by tracking number.
- **Shipments** — search, filter by status or type, sort, pagination, change status straight from the list,
  select several and delete, export to CSV.
- **New / Edit shipment** — tracking number (blank = generated, format `TJ-2026-XXXXXXX`), shipment type,
  service level, status, progress %, origin, destination, current location, carrier, vehicle/vessel,
  sender and receiver (name, email, phone, address), package (description, pieces, weight, L×W×H, declared value),
  payment (cost, currency, status, method), pickup / departure / estimated / delivered dates,
  a message shown to the customer and an internal note.
- **Shipment page** — every detail, progress bar, tracking history (add, edit, delete updates), copy the customer
  tracking link, view it as the customer sees it, print, edit, delete.
- **Shipment types** — add, rename (renames it on every shipment) and delete (blocked while shipments use it).

Changing the status adds a history entry. Posting the newest tracking update also moves the shipment to that
status and location and sets its progress.

### Demo mode vs live database

Without database keys the dashboard runs in **demo mode**: any email/password signs in and data is saved only in
that browser. A yellow banner says so. To go live:

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/migrations/20261111000000_shipments.sql`.
3. In **Authentication → Users**, add the admin user (email + password).
4. In **SQL Editor**, run `supabase/make_admin.sql` with that email filled in.
5. Copy `.env.example` to `.env.local` and fill in the Project URL and anon/publishable key
   (Project Settings → API). On Vercel, add the same two variables in the project settings.
6. Rebuild / redeploy.

Security: only users listed in `public.admins` can read or change shipments (row-level security).
Visitors can only call `track_shipment(code)`, which returns one shipment without emails, phone numbers,
addresses, costs or internal notes.

## Where things live

| What | File |
| --- | --- |
| All public-site text, links, contact details, reviews, FAQs | `src/data/site.ts` |
| Shipment fields, statuses, default progress per status | `src/lib/types.ts` |
| Data layer (Supabase or demo) | `src/lib/store/` |
| Admin dashboard | `src/admin/` |
| Database schema, security rules, triggers | `supabase/migrations/` |
| Brand colours, font, animations | `src/index.css` (`@theme` block) |
| Header, footer, Track & Help widget | `src/components/` |
| Home page sections / pages | `src/sections/`, `src/pages/` |
| Images (copied from the original) | `public/img/` |

## Hosting

Any page address must be served `index.html` so routes like `/track` and `/admin` work on refresh.
`vercel.json` does this on Vercel and `public/.htaccess` (copied into `dist/`) does it on Apache/cPanel.

## Other notes

- The contact form opens the visitor's email app (mailto). No server needed.
- Live chat uses the Smartsupp key from the original site (`brand.smartsuppKey` in `src/data/site.ts`).
- Only the home page was saved from the original, so About / Services / Contact / Track / Sign In are built from
  the home page's own pieces in the same style.
