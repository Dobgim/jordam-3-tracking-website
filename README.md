# The Jordans — React + TypeScript + Tailwind

Rebuild of the saved home page in `../demo2.atlascargotransit.com`, using the same layout, copy and images.

```bash
npm install
npm run dev      # http://localhost:5320
npm run build    # production files in dist/
```

## Where things live

| What | File |
| --- | --- |
| All text, links, contact details, reviews, FAQs | `src/data/site.ts` |
| Brand colours, font, animations | `src/index.css` (`@theme` block) |
| Header, footer, Track & Help widget | `src/components/` |
| Home page sections | `src/sections/` |
| Pages (Home, Track, Contact, About, Services, Sign In) | `src/pages/` |
| Images (copied from the original) | `public/img/` |

## Notes

- **Tracking**: no shipment database is connected yet, so `/track?code=…` always shows "No shipment found". Add the lookup in `src/pages/Track.tsx`.
- **Contact form** opens the visitor's email app (mailto). No server needed.
- **Live chat** uses the Smartsupp key from the original site (`brand.smartsuppKey`). Set it to `''` to hide the Live Chat option.
- Only the home page was saved from the original, so About / Services / Contact / Track / Sign In are built from the home page's own pieces in the same style.
- When hosting on a static server, send unknown paths to `index.html` so routes like `/track` work on refresh.
