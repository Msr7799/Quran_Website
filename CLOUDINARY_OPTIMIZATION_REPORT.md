# Cloudinary / static-asset optimization (v4)

## What changed

- Replaced the runtime `/api/media/... -> MongoDB -> 307 -> Cloudinary` chain for migrated image/video assets with direct `res.cloudinary.com` delivery.
- Added Cloudinary DNS prefetch + preconnect because hero/video and selected large images use Cloudinary directly.
- Kept fonts, Lottie JSON, PDF.js WASM and optimized navigation assets on the same-origin Vercel static CDN. Moving these to Cloudinary would add a second origin and would not improve the critical path.
- `LottiePlayer` now fetches `/lottie/*.json` directly from Vercel instead of querying `/api/media`.
- `MushafViewer` now loads PDF.js WASM from `/pdfjs/wasm/` directly.
- Kept `images/library/quran_pdf/012.svg` and `013.svg` local because the original migration script skips non-video files larger than 10 MB. A live Cloudinary audit should confirm duplicates before deleting them.
- Removed three unused local payloads after source-reference checks: `HafsSmart.pdf`, `library/collections.json`, `library/azkar.json`.
- Added `scripts/audit-cloudinary-assets.mjs`, a read-only Cloudinary Admin API audit that writes `cloudinary-audit.json` and never prints credentials.

## Why not move everything to Cloudinary?

The optimized WOFF2 fonts and small SVG/WebP/Lottie/WASM assets are already better served same-origin from Vercel. The old PageSpeed report showed Cloudinary-hosted TTF fonts on the critical path; putting the optimized fonts back on Cloudinary would reintroduce an extra DNS/TLS origin and could worsen FCP/LCP.

The best architecture is hybrid:
- Cloudinary: hero videos, large photos, large library artwork.
- Vercel `/public`: fonts, tiny icons, optimized SVG/WebP, Lottie JSON, PDF.js WASM.
- APIs/MongoDB: structured data, not static-file redirects.
