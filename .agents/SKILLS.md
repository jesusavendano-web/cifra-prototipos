# Agent Skills & Operational Procedures: cifra-prototipos

This guide documents the procedures that automated agents and engineers must trigger when taking actions in `cifra-prototipos`.

---

## 1. Skill: Audit & Validate via Shopify Dev MCP
**Trigger:** Before creating, modifying, or refactoring any Polaris UI pattern, component tag, slot, or attribute.
**Action:**
1. Call the **Shopify Dev MCP** tools (`search_docs_chunks`, `learn_shopify_api`, `validate`) to query official documentation and verify specs.
2. Confirm component availability, attribute formats, and supported slots in Polaris 2.0 Web Components.
3. Check the live component inventory at `index.html` and verify runtime registration via `window.customElements.get("s-<name>")`.
4. Implement native declarative patterns (e.g. `commandFor`, `command="--show"`).

## 2. Skill: Co-locate & Scope Custom Styles
**Trigger:** When creating a UI block that Polaris does not provide natively (e.g. tabs, segmented controls, KPI sparkline cards, metric trees).
**Action:**
1. Determine if the component is shared across domains or specific to one module.
2. If shared:
   - Create `shared/components/<ComponentName>/<ComponentName>.html` (example snippet).
   - Create `shared/components/<ComponentName>/<ComponentName>.css`.
3. If module-specific:
   - Place styles in `modules/<domain>/<domain>.css`.
4. Prefix all classes with `.c-<component-name>`.
5. Add `data-custom="<ComponentName>"` on the container element.
6. Verify styles resolve purely through `var(--c-*)` tokens.

## 3. Skill: Production Readiness Verification
**Trigger:** When preparing or validating any UI mockups in `cifra-prototipos`.
**Action:**
1. Ensure the module structure follows clean domain boundaries under `modules/<domain>/`.
2. Check that markup uses native `<s-*>` custom elements and semantic attributes.
3. Validate that custom styling is cleanly isolated in co-located `.css` files.
4. Confirm zero `--s-*` tokens or raw hex styles are present.
5. Verify that visual rendering is consistent and pixel-perfect across views.

## 4. Skill: Verification & Diagnostic Auditing
**Trigger:** After making modifications to any prototype screen.
**Action:**
1. Start the static server: `node serve.js`.
2. Open the page in a browser and click **"Resaltar custom"** in the top prototype navigation bar.
3. Confirm that all custom non-Polaris sections are highlighted with red dashed outlines and correct `custom · [Name]` badges.
4. Ensure no native Polaris components (`<s-*>`) are accidentally wrapped in custom classes that alter standard Shopify Admin Next behavior.
