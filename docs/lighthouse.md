# Lighthouse and Core Web Vitals report

Lab results from a local production build (`next build` + `next start`, `NEXT_PUBLIC_ENV=production`). Lighthouse 12, Chrome 155, run on 21 Oct 2026.

- **Mobile:** 390×844, devtools throttling (slow 4G, 4× CPU), 3 runs per page. All runs were taken with CPU benchmark index ≈ 4,000–4,300.
- **Desktop:** desktop preset.
- Scores are Performance / Accessibility / Best Practices / SEO.

## Current build (inline CSS on)

| Page | Mobile score | LCP | CLS | TBT | Desktop |
| --- | --- | --- | --- | --- | --- |
| Home `/` (Phase 9, CMS) | 97 / 100 / 100 / 100 | 1.2 s | 0 | ~130 ms | 99 |
| Property `/property/…` (Phase 9, CMS) | 99 / 100 / 100 / 100 | 1.8 s | 0 | 60 ms | 99 |
| Home `/` (Phase 8) | 95–96 / 100 / **100** / 100 | 1.2 s | 0 | ~190 ms | 99 |
| Sell `/sell` (Phase 8) | 99 / 100 / 100 / 100 | 1.8 s | 0 | 70 ms | 100 |
| Mortgage `/mortgage` (Phase 8) | 99 / 100 / 100 / 100 | 1.8 s | 0 | 60 ms | 100 |
| Buy `/buy` | 97 / 100 / 96 / 100 | 1.8 s | 0 | ~200 ms | 99 |
| Community `/community/dubai-marina` | 98–99 / 100 / 96 / 100 | 1.8 s | 0 | 70–120 ms | 99 |
| Property `/property/…` | 98–99 / 100 / 96 / 100 | 1.8 s | 0 | 60–90 ms | 99 |
| Off-plan `/off-plan` ¹ | 94–99 / 100 / 96 / 100 | 1.8 s | 0 | 0–250 ms | 99 |
| Project `/off-plan/the-aurum-residences` ¹ | 86–93 / 100 / 96 / 100 | 1.8–1.9 s | 0 | 270–530 ms | 99 |
| Insights `/insights` ¹ | 91–97 / 100 / 96 / 100 | 1.9 s | 0 | 180–370 ms | 99 |
| Article `/insights/mortgage-guide-…` ¹ | 95–96 / 100 / 96 / 100 | 1.8–1.9 s | 0 | 200–220 ms | 100 |

¹ Measured on 21 Oct 2026 in the laptop's slow mode (benchmark ≈ 1,250), with CPU slowdown scaled to 1.5× so it equals the 4× runs above.

Targets from the SEO brief: LCP < 2.5 s ✔, CLS ≈ 0 ✔. INP is a field metric and can only be measured after launch, using Search Console or CrUX. Lab TBT is low, which is a good proxy.

## Inline CSS A/B (same machine, same throttling)

Tailwind's stylesheet is ~13 KB gzipped. Inlining it (`experimental.inlineCss`) removes one render-blocking round trip.

| | External stylesheet | Inlined |
| --- | --- | --- |
| Home FCP / LCP | 2.1–2.2 s / 2.1–2.2 s | 1.5 s / 1.5 s |
| Community FCP / LCP | 2.2 s / 2.2–2.3 s | 1.3–1.4 s / 1.8 s |

The trade-off is that returning visitors re-download ~13 KB of CSS inside each HTML page instead of using a cached file. That is worth it while most traffic is first-time mobile visitors. Revisit once real analytics are available.

## Layout-shift fixes (Phase 7)

- `/off-plan` first measured **CLS 0.23**: its Suspense placeholder was far shorter than the streamed results, so the section below painted in view and was then pushed down. All URL-filtered pages now share `ResultsSkeleton`, sized like the real filter bar and card row, and are at **CLS 0**.
- `/insights` measured **CLS 0.086** on mobile from the Fraunces italic swapping in late and re-wrapping the hero heading. Fraunces now uses `display: optional`, like Manrope: it is preloaded and used when ready, otherwise the size-adjusted fallback stays for that view. Result: **CLS 0**.

## CMS build (Phase 9)

Pages are still prerendered; content comes from Payload through one cached, tagged loader. One regression was found and fixed: Payload adds `Critical-CH: Sec-CH-Prefers-Color-Scheme` to every path. That made Chrome restart each public page request (an internal 307, about 600 ms on slow 4G; property LCP 1.8 → 2.4 s), so the header is now limited to `/admin`, and property LCP is back to 1.8 s.

## Best Practices: now 100

Until Phase 8 Best Practices was 96 because of the audit described below. With every linked route now built (0 broken internal links in the crawl), it is **100**.

### Previously: why it was 96

The only failing audit is `errors-in-console`. Next prefetches links to routes not built yet, and those requests return 404. As of Phase 7 these are `/team/*`, `/developer/*`, `/sell`, `/commercial`, `/services`, `/mortgage`, `/about`, `/contact`, `/careers`, `/developers` and `/saved`. This clears as the remaining pages ship.

## Notes for reading lab numbers on this laptop

The laptop's CPU benchmark swings between ~1,200 and ~4,300 (power/thermal state). Compare runs only at similar `environment.benchmarkIndex`. On a slow-mode machine, scale `--throttling.cpuSlowdownMultiplier` to `4 × bench / 3400`.

## Still to do

- Field data (CrUX/Search Console) after launch.
- Re-run on the Cloudflare staging URL. Edge caching and HTTP/2 should improve TTFB and image delivery over localhost.
