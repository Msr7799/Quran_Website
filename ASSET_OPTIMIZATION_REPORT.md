# Asset & Font Optimization Report

## Summary

### SVG / image assets

- Converted 11 large, actively used SVG assets (10 navigation icons + search icon) to **256×256 lossless WebP**.
- FFmpeg `libwebp` was used with lossless encoding; each output was decoded and verified pixel-identical to its 256×256 raster reference.
- Converted assets: **17.32 MiB → 123.3 KiB**.
- Deleted **72 unused SVG files**, saving about **5.25 MiB**.
- Preserved dynamic SVG families still used by code: `public/svg/hijri` (12) and `public/svg/alwaqf` (5).
- Removed all **114 local Surah-name SVGs** from `public/svg/surah_name` (**765,384 bytes**) because Surah-name artwork is now sourced only from the Quran Data API.
- The Surah page now uses the API response field `image_url`; if the artwork API is temporarily unavailable, the text Surah heading remains usable instead of referencing a missing local image.

### Surah-name API

- API base already configured by `src/lib/quran-data-api.ts`:
  - `https://msr-quran-data.vercel.app/api`
- `getSurahNameAssets()` requests:
  - `https://msr-quran-data.vercel.app/api/surah-names`
- API results are server-fetched and revalidated for 24 hours, avoiding a client-side request waterfall.
- Returned relative `image_url` values are resolved against `https://msr-quran-data.vercel.app` by `quranDataAssetUrl()`.

### Fonts

Repository scan found only these runtime font families in use:

- `Uthmanic`
- `Arabic Home`
- normal variable `Google Sans`

Removed unused font files, including:

- all 16 `public/fonts/Google_Sans/static/*.ttf` files
- `GoogleSans-Italic-VariableFont_GRAD,opsz,wght.ttf`
- the original normal Google Sans TTF after lossless WOFF2 conversion
- original `uthmanic-hafs.ttf` and `arabic-font.ttf` after lossless WOFF2 conversion
- unused `arabquranislamic#U0661#U0664#U0660-Regular.ttf`
- obsolete Google Sans package README (license file retained)

Lossless WOFF2 conversions:

| Font | Before | After | Glyphs preserved |
|---|---:|---:|---:|
| Uthmanic | 795,444 B | 137,280 B | 1,572 / 1,572 |
| Arabic Home | 366,760 B | 81,140 B | 753 / 753 |
| Google Sans variable normal | 4,845,504 B | 1,498,248 B | 7,536 / 7,536 |

The Google Sans variable axes (`opsz`, `wght`, `GRAD`) were preserved.

Total `public/fonts` payload in the repository:

- **Before:** 45,221,512 bytes across 23 files
- **After:** 1,721,062 bytes across 4 files (including `OFL.txt`)
- **Reduction:** 43,500,450 bytes (~96.2%)

All three runtime fonts are now served directly from `/public/fonts/*.woff2` instead of `/api/media/...`, removing the MongoDB lookup + redirect + Cloudinary request chain for fonts.

`arabic-font.woff2` is preloaded because it is the global body font. Uthmanic and Google Sans are left demand-loaded to avoid unnecessary initial requests.

## Code updated

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/quran/[surahId]/page.tsx`
- `src/lib/quran.ts`
- plus the earlier asset consumers from the first optimization pass

## Validation

- All 88 TypeScript/TSX files were syntax-parsed successfully with TypeScript.
- All literal local `/svg/...` and `/fonts/...` references were checked: **0 missing files**.
- WOFF2 outputs were reopened with fontTools and verified for glyph counts; Google Sans variable axes were also verified.
- Local Surah-name directory no longer exists and no code references it.
- Full `pnpm build` could not be run in this environment because project dependencies are not installed here.

## Safety note

The optimized archive intentionally excludes `.env` so credentials are not re-shared. Copy your existing `.env` locally from your original project after extraction.


## HeroCarousel responsive loading optimization
- Mobile no longer assumes desktop on the first client render; hero media is selected after matchMedia.
- Only the active slide and its immediate neighbors are mounted instead of every hero slide.
- Only the active video uses preload=auto; adjacent videos use metadata.
- Active images use eager/high priority; adjacent images use lazy/low priority.
- Existing visual dimensions, controls, timing and CSS transitions were not changed.
