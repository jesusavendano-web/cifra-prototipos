# cifra-prototipos Architectural Knowledge Base

This document records the architectural standards, design decisions, and system constraints required to maintain a modular, production-ready design prototype environment with pixel-perfect precision.

---

## 1. System Role and Environment

- **`cifra-prototipos` (Product Design Reference):**
  - Serves as the interactive, standalone source of truth for the product interface.
  - Implements Shopify's Polaris 2.0 Web Components (`https://cdn.shopify.com/shopifycloud/polaris-2.0-rc.js`) directly against standard HTML and CSS.
  - Runs with zero build dependencies via `node serve.js` on port `4321`.
  - Built to be modular, clean, and production-compatible so that any view or component can be directly referenced or ported with zero styling translations.

---

## 2. Mandatory Validation via Shopify Dev MCP

Whenever agents or developers are adding new UI, updating existing screens, modifying components, or need to clarify official Shopify Polaris / Web Component approaches:

- **Always Validate with Shopify Dev MCP:**
  - Before writing custom markup or implementing ambiguous UI patterns, consult and validate using the **Shopify Dev MCP** tools (`search_docs_chunks`, `learn_shopify_api`, `validate`).
  - Search official documentation via MCP to verify element specifications, supported slot names, declarative command bindings (`commandFor`), accessibility properties, and attribute naming conventions.
  - Avoid improvising custom solutions or guessing API structures when official Polaris Web Component standards can be looked up and verified directly through the MCP.

---

## 3. Directory Architecture

The repository enforces a modular domain structure:

| Domain | Module Path | Purpose |
| :--- | :--- | :--- |
| **Home** | `modules/home/index.html`, `sync.html` | Overview KPIs, greetings, sync status banners |
| **Dashboards** | `modules/dashboards/index.html`, `customize.html` | P&L dashboards, customizable widget layouts |
| **Reports** | `modules/reports/index.html`, `detail.html`, `new.html` | High-density tables, metric breakdowns, cohort heatmaps |
| **Chat / AI Assistant**| `modules/ask/index.html` | AI assistant thread, suggestions, markdown responses |
| **Schedules & Alerts** | `modules/schedules/index.html`, `new-schedule.html`, `alert.html`, `alerts.js` | Automated alerts, cadence triggers, preview timelines |
| **Settings & Costs** | `modules/settings/index.html`, `costs-*.html` | Store preferences, multi-tier cost allocations |
| **Onboarding** | `modules/onboarding/index.html` | First-time setup wizard and welcome screens |
| **Metric Tree** | `modules/metric-tree/index.html` | Interactive financial metric decomposition tree |
| **Insights** | `modules/insights/index.html` | Active / dismissed insights list |
| **Integrations** | `modules/integrations/index.html`, `klaviyo.html`, `meta.html` | Third-party data sources and connection status |
| **System States** | `modules/system-states/index.html` | Maintenance, error 500 and not-found states |
| **Shared Primitives** | `shared/components/<Name>/` | Reusable non-native custom components |

Shared files at the root of `shared/`:

| File | Purpose |
| :--- | :--- |
| `shared/globals.css` | Token dictionary, resets, FOUC defenses, universal utilities, dark tooltip surfaces |
| `shared/proto-bar.css` | Prototype navigation bar and "Resaltar custom" diagnostics (not part of the app) |
| `shared/inventory.css` | Styles for the root `index.html` component inventory only |
| `shared/cifra.js` | Behaviour of custom components + prototype bar. Resolves the repo root from its own `src`, so it works at any folder depth |

**Stylesheet order in every screen:** `globals.css` → `proto-bar.css` → the `shared/components/*/*.css` the screen uses (in the canonical order Card, FilterBar, Tabs, SegmentedControl, KpiCard, Charts, AskBar, Skeleton, Layout, Source, IndexTable, IconMask) → `modules/<domain>/<domain>.css`. Paths are always relative (`../../shared/...`) so the site works both on `node serve.js` and on GitHub Pages.

**Legacy redirects:** the old flat URLs (`home.html`, `report.html`, …) remain at the root only as redirect stubs to the new `modules/` paths (query and hash preserved), so links already shared keep working. Never edit or add UI there.

---

## 4. Core Architecture Directives

### Directive 1: Shopify Web Components First
- Always use native `<s-*>` custom elements whenever supported by `polaris-2.0-rc.js`.
- Never create custom HTML/CSS wrappers for native buttons, input fields, selects, badges, banners, modals, or tables.
- Use declarative command slots and attributes (`commandFor`, `command="--show"`).

### Directive 2: Consolidated `--c-*` Design Tokens
- Standardize all design tokens on the canonical `--c-*` prefix inside `shared/globals.css`.
- Never use `--s-*` tokens or rely on private Shopify Shadow DOM hashes.
- Core tokens:
  - Surfaces: `--c-bg`, `--c-surface`, `--c-surface-hover`, `--c-surface-subdued`
  - Text: `--c-text`, `--c-text-secondary`, `--c-text-tertiary`
  - Borders: `--c-border`, `--c-border-strong`
  - Deltas: `--c-delta-up` (`#0c5132`), `--c-delta-down` (`#8e0b21`)
  - Radii: `--c-radius-card` (`20px`), `--c-radius-inner` (`12px`), `--c-radius-control` (`9999px`)
  - Shadows: `--c-shadow-card`, `--c-shadow-popover`
  - Charts: `--c-chart-1` through `--c-chart-5`, `--c-chart-grid`, `--c-charttip-bg`
  - Interaction & brand: `--c-focus`, `--c-brand`, `--c-ai-glow`
  - Alpha scale for composite shadows/rings: `--c-alpha-03` … `--c-alpha-14`, `--c-overlay`
  - Cohorts: `--c-chart-axis`, `--c-heat-0` … `--c-heat-4`, `--c-heat-text`, `--c-cohort-1` … `--c-cohort-10`
- Component and module CSS contain zero raw hex/rgb values; when a new measured value is needed, add a token to `globals.css` first.

### Directive 3: Scoped Custom Elements & Deconstructed Styles
- The monolithic `shared/cifra.css` is deconstructed and eliminated.
- Components not provided by Polaris (`Tabs`, `SegmentedControl`, `FilterBar`, `KpiCard`) must be co-located:
  - Markup snippet: `shared/components/[Name]/[Name].html`
  - Scoped styling: `shared/components/[Name]/[Name].css`
- Module-specific layouts and screens use `modules/[domain]/[domain].css`.
- All custom classes must use the `.c-` prefix and have `data-custom="[Name]"` on the root container.

---

## 5. Polaris 2.0 Web Component Known Constraints

- **Shadow DOM Scope:** CSS variables inside Polaris custom elements live in a scoped Shadow DOM with variable hashes. Never attempt to query or style inner shadow elements directly from screen CSS.
- **Container Queries:** Polaris `@container` rules on `<s-grid>` and `<s-stack>` only operate inside `<s-query-container>`. Always wrap responsive grid views with `<s-query-container>`.
- **Title Bar Integration:** Native Shopify Admin top action bars must be implemented using `<s-page>` slots:
  - `slot="breadcrumb-actions"`
  - `slot="primary-action"`
  - `slot="secondary-actions"`
