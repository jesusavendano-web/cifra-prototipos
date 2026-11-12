# Implementation Tasks: cifra-prototipos Architectural Parity

This document tracks all tasks required to bring `cifra-prototipos` into full architectural modularity, token consolidation, and component-scoped styling.

---

## Phase 1: Static Server & Infrastructure
- [x] **TASK-01: Update `serve.js` for nested directory resolution**
  - Add support for automatic `index.html` resolution when directory paths are requested (e.g. `/modules/reports/` -> `/modules/reports/index.html`).
  - Add content type resolution for `.webp`, `.svg`, and `.css` files located deep within nested modules.
  - Ensure parent directory escapes (`..`) remain blocked.

## Phase 2: Design Token & `globals.css` Audit, Refactoring & Cleanup
- [x] **TASK-02: Audit and refine `shared/globals.css`**
  - Verify that `shared/globals.css` contains exclusively canonical `--c-*` tokens, HTML resets, FOUC/CLS defenses, universal utilities (`.sr-only`, `input.no-spinners`), and global dark tooltip surface overrides.
  - Review and remove any layout-specific rows (`.dashboard-filterbar-row`, `.c-listrow`, `.c-inset`) or module overrides from `globals.css`.
  - Move layout helpers into their respective co-located component files or module stylesheets.
  - Strip any legacy `--s-*` tokens or ad-hoc overrides.

- [x] **TASK-03: Deconstruct and completely delete monolithic `shared/cifra.css`**
  - Extract prototype diagnostic tool styles (`.proto-bar`, `body.show-custom`) into a dedicated helper stylesheet `shared/proto-bar.css`.
  - Create `shared/components/Tabs/` and move `.c-tabs` rules into `shared/components/Tabs/Tabs.css`.
  - Create `shared/components/SegmentedControl/` and move `.c-segmented` rules into `shared/components/SegmentedControl/SegmentedControl.css`.
  - Create `shared/components/FilterBar/` and move `.c-filterbar`, `.c-pill`, `.c-popover`, `.c-daterange` into `shared/components/FilterBar/FilterBar.css`.
  - Create `shared/components/KpiCard/` and move `.c-card`, `.c-kpi__*`, `.c-delta` into `shared/components/KpiCard/KpiCard.css`.
  - Create `shared/components/Skeleton/` and move `.c-skeleton` into `shared/components/Skeleton/Skeleton.css`.
  - Move domain-specific styles into their respective module directories:
    - Dashboards grid/customizer CSS -> `modules/dashboards/dashboards.css`
    - Reports table/cohort CSS -> `modules/reports/reports.css`
    - Ask thread/composer CSS -> `modules/ask/ask.css`
    - Schedules/alert CSS -> `modules/schedules/schedules.css`
    - Settings/costs CSS -> `modules/settings/settings.css`
    - Metric tree canvas CSS -> `modules/metric-tree/metric-tree.css`
  - Update all HTML files to import `shared/globals.css`, `shared/proto-bar.css`, and their specific scoped component/module CSS files.
  - **Permanently delete `shared/cifra.css`** once all rules are migrated and verified.

## Phase 3: Modular Directory Reorganization
- [x] **TASK-04: Setup `modules/home/`**
  - Move `home.html` -> `modules/home/index.html`.
  - Move `home-sync.html` -> `modules/home/sync.html`.
  - Create `modules/home/home.css` for screen-specific home layouts.
  - Update local asset, CSS, and JS import paths.

- [x] **TASK-05: Setup `modules/onboarding/`**
  - Move `onboarding.html` -> `modules/onboarding/index.html`.
  - Extract screen-specific onboarding CSS into `modules/onboarding/onboarding.css`.
  - Update paths for assets and dependencies.

- [x] **TASK-06: Setup `modules/dashboards/`**
  - Move `dashboard.html` -> `modules/dashboards/index.html`.
  - Move `dashboard-customize.html` -> `modules/dashboards/customize.html`.
  - Create `modules/dashboards/dashboards.css`.
  - Update script/link paths.

- [x] **TASK-07: Setup `modules/reports/`**
  - Move `reports.html` -> `modules/reports/index.html`.
  - Move `report.html` -> `modules/reports/detail.html`.
  - Move `report-new.html` -> `modules/reports/new.html`.
  - Create `modules/reports/reports.css` (custom report tables, sticky headers, cohort heatmaps).
  - Update script/link paths.

- [x] **TASK-08: Setup `modules/ask/`**
  - Move `chat.html` -> `modules/ask/index.html`.
  - Create `modules/ask/ask.css` for chat threads, feedback bars, composer, and response cards.
  - Update script/link paths.

- [x] **TASK-09: Setup `modules/schedules/`**
  - Move `schedules.html` -> `modules/schedules/index.html`.
  - Move `schedule.html` -> `modules/schedules/new-schedule.html`.
  - Move `alert.html` -> `modules/schedules/alert.html`.
  - Move `shared/alerts.js` or link it properly from `modules/schedules/`.
  - Create `modules/schedules/schedules.css`.
  - Update script/link paths.

- [x] **TASK-10: Setup `modules/metric-tree/`**
  - Move `metric-tree.html` -> `modules/metric-tree/index.html`.
  - Create `modules/metric-tree/metric-tree.css`.
  - Update script/link paths.

- [x] **TASK-11: Setup `modules/settings/`**
  - Move `settings.html` -> `modules/settings/index.html`.
  - Move `settings-cost-custom.html` -> `modules/settings/costs-custom.html`.
  - Move `settings-cost-gateways.html` -> `modules/settings/costs-gateways.html`.
  - Move `settings-cost-products.html` -> `modules/settings/costs-products.html`.
  - Move `settings-cost-shipping.html` -> `modules/settings/costs-shipping.html`.
  - Create `modules/settings/settings.css`.
  - Update script/link paths.

- [x] **TASK-12: Setup `modules/integrations/` and `modules/system-states/`**
  - Move `integrations.html`, `integration-klaviyo.html`, `integration-meta.html` -> `modules/integrations/`.
  - Move `insights.html` -> `modules/insights/index.html`.
  - Move `system-states.html` -> `modules/system-states/index.html`.
  - Update script/link paths.

## Phase 4: Prototype Bar & Navigation Updates
- [x] **TASK-13: Update prototype navigation and index inventory**
  - Update `index.html` component links to point to the new modular URLs.
  - Update `shared/cifra.js` `PAGES` array to reflect the new `modules/<domain>/` paths.
  - Verify that the "Resaltar custom" toggle functions across all moved screens.

## Phase 5: Verification & Quality Assurance
- [x] **TASK-14: Audit for strict class naming & hex-code eradication**
  - Audit all moved HTML screens to ensure all custom blocks carry `.c-*` and `data-custom`.
  - Ensure zero raw hex values remain in inline `style="..."` attributes (use `var(--c-*)`).
  - Verify seamless, pixel-perfect rendering across all modular screens.
