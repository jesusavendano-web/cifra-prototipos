# Agent Operating Rules: cifra-prototipos

These rules are mandatory for all autonomous agents, product designers, and engineers modifying, adding, or deleting UI within `cifra-prototipos`.

---

## 1. Shopify Web Components First Strategy
- **Rule 1.1:** Always verify if a native element exists in Polaris 2.0-rc before implementing any custom DOM.
  - Page layout: `<s-page>`, `<s-section>`, `<s-box>`, `<s-stack>`, `<s-grid>`.
  - Actions & Header: `slot="breadcrumb-actions"`, `slot="primary-action"`, `slot="secondary-actions"`.
  - Controls: `<s-button>`, `<s-text-field>`, `<s-number-field>`, `<s-email-field>`, `<s-select>`, `<s-switch>`, `<s-checkbox>`.
  - Dialogs & Menus: `<s-menu>`, `<s-popover>`, `<s-modal>` using declarative attributes `commandFor` and `command="--show"`.
  - Feedback: `<s-banner>`, `<s-badge>`, `<s-chip>`, `<s-clickable-chip>`, `<s-progress>`, `<s-spinner>`, `<s-empty-state>`.
  - Tables: `<s-table>`, `<s-table-header-row>`, `<s-table-row>`, `<s-table-cell>`.
- **Rule 1.2:** Never create custom wrappers or reinvent native Polaris controls (e.g. do not create custom buttons, custom standard selects, or custom badges).

## 2. Token Discipline & Color Conventions
- **Rule 2.1:** Standardize 100% on the `--c-*` prefix for design tokens.
- **Rule 2.2:** Never introduce `--s-*` tokens or rely on private Shopify shadow DOM hashes (e.g., `--p-color-bg-surface-6e076`).
- **Rule 2.3:** No hardcoded hex values, rgb values, or arbitrary pixel values in component markup or screen CSS.
  - Always use `var(--c-surface)`, `var(--c-border)`, `var(--c-text)`, `var(--c-radius-card)`, etc.
  - Allowed exceptions: specific third-party brand logos (e.g. Shopify green `#95bf47`) only when encapsulated within a designated brand badge class.

## 3. Strict Rules for `globals.css`: What MUST and MUST NOT Be Included

### What MUST Be in `shared/globals.css`:
- **The Canonical Token Dictionary:** All root CSS custom properties (`:root { --c-*: ... }`).
- **Universal Box Resets & HTML Normalization:** `html { scrollbar-gutter: stable; box-sizing: border-box; }`, `*, *::before, *::after`.
- **Base Body Typography & Background:** Default font family, font smoothing, and document background.
- **FOUC & CLS Defenses for Web Components:** `s-*:not(:defined)` block containment definitions for un-upgraded elements.
- **Universal Standard Utilities:** Accessible `.sr-only` / `.visually-hidden`, `input.no-spinners`, `@media (prefers-reduced-motion)`.
- **Global Theme Overrides for Shadow DOM Surfaces:** Universal tooltip and popover dark surfaces (`.c-charttip`, `s-tooltip`, `.c-tooltip-surface`) and bottom viewport fades (`body::after`).

### What MUST NOT Be in `shared/globals.css` (Strictly Prohibited):
- **Component-Specific Visual Styles:** Never put `.c-tabs`, `.c-segmented`, `.c-kpi-card`, `.c-filterbar`, `.c-pill`, `.c-tree`, or `.c-chat` in `globals.css`. These belong strictly inside their co-located component stylesheets (`shared/components/[Name]/[Name].css`).
- **Module or Page Layout Hacks:** Never put screen-specific rules (such as dashboard grids, settings forms, onboarding steps, or report table headers) in `globals.css`.
- **Ad-Hoc Helper Classes:** Never create arbitrary utility classes (e.g. `.mt-20`, `.flex-center`, `.font-bold`) in `globals.css`. Rely on `<s-stack>`, `<s-grid>`, `<s-box>` layout properties or semantic component CSS.
- **Why Avoid Misuse:** Polluting `globals.css` causes cascading side effects, specificity wars, breaks component isolation, and prevents clean, modular porting of UI elements.

## 4. Scoped Styling & Component Co-location
- **Rule 4.1:** All custom CSS classes must use the `.c-` namespace prefix (e.g. `.c-kpi-card`, `.c-tabs`, `.c-segmented`).
- **Rule 4.2:** Every custom component root element must include a `data-custom="[ComponentName]"` attribute for the visual diagnostics tool ("Resaltar custom").
- **Rule 4.3:** Component styles must be co-located in `shared/components/[Name]/[Name].css` (if shared across modules) or `modules/[domain]/[domain].css` (if domain-specific).
- **Rule 4.4:** Do not add global styling rules or element selectors (e.g. `div { ... }` or `p { ... }`) in component stylesheets.

## 5. Architectural Directory Structure
- **Rule 5.1:** Never add flat `.html` files in the root folder. All UI screens belong inside their corresponding domain under `modules/<domain>/`.
- **Rule 5.2:** Follow standardized domain names strictly:
  - `modules/home/`
  - `modules/dashboards/`
  - `modules/reports/`
  - `modules/ask/`
  - `modules/schedules/`
  - `modules/settings/`
  - `modules/onboarding/`
  - `modules/metric-tree/`
  - `modules/integrations/`
- **Rule 5.3:** Use relative path references that support standalone local serving via `node serve.js` on port `4321`.

## 6. UI Modifications, Additions & Removals
- **Rule 6.1 (Adding UI):**
  1. Determine the appropriate domain in `modules/`.
  2. Implement markup using `<s-*>` for all standard components.
  3. Co-locate any custom `.c-*` CSS rules in the module's CSS file or in a shared component.
  4. Register the new screen in `shared/cifra.js` (`PAGES` list) and `index.html`.
- **Rule 6.2 (Updating UI):**
  1. Maintain standard class names across components.
  2. Test responsive behavior using `<s-query-container>` when container queries are required.
- **Rule 6.3 (Removing UI):**
  1. Clean up unused scoped CSS classes in the module stylesheet.
  2. Remove references from `shared/cifra.js` and `index.html`.
