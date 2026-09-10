# FarmaTodo frontend migration and elevation

## Outcome
Recreate the uploaded five-view Promotion Intelligence Studio at `/` using the selected Clinical instrument panel direction: Clinical Azure colors, Sora headings, Manrope body, compact executive density, and responsive behavior from mobile through wide desktop.

## Implementation
- Port the source application into the existing TanStack Start structure without changing the `/api/v1` endpoint paths, request payloads, response shapes, or filter semantics.
- Keep one shared filter state across Campaign Studio, Analytics, Causal Deep-Dive, Post-Campaign Audit, and Knowledge Graph; preserve category-to-SKU and campaign-to-category/country cascading.
- Rebuild the shell and navigation with the selected light clinical styling, clearer typography, crisp borders, restrained shadows, compact actions, and `min-w-0`/contained overflow throughout.
- Create reusable chart primitives for a data-driven cluster donut, segmented cost structure, purchase-cycle timeline, substitution flow, and five-step causal waterfall.
- Refine the dose-response chart with a smooth sigmoid, commercial-zone backgrounds, 90% confidence ribbon, dashed thresholds, selectable dose pills, and a bounded hover tooltip.
- Preserve table controls, pagination, simulation controls, graph-node selection, filter reset/apply behavior, and the Studio price-review sub-view.
- Add realistic finite fallback datasets for every screen and chart. Sanitize all API numbers so offline or malformed responses never produce blank panels, `NaN`, invalid percentages, or empty critical tables.
- Add route-specific metadata and load Sora/Manrope through document head links.

## Technical details
- Keep the current app as a single TanStack route with in-workspace tabs, matching the uploaded frontend’s state behavior.
- Use semantic Tailwind v4 tokens in `src/styles.css`; avoid raw component color values.
- Keep charts dependency-light with responsive SVG/CSS so API contracts remain untouched.
- Verify the live preview at desktop, tablet, and mobile widths, including all five tabs and key interactions.

## Acceptance checks
- The root view is no longer the blank template.
- All five views remain populated when `/api/v1` is unavailable.
- Donut values, legends, and totals agree; all cost segments are finite and total safely.
- No page-level horizontal overflow at representative desktop, tablet, or mobile widths.
- No runtime errors, broken interactions, blank charts, `$0` placeholders caused by missing API data, or `NaN%` output.
