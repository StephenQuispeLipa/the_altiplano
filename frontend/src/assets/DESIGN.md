```markdown
# Design System Document: The Earth & Hearth Directive

## 1. Overview & Creative North Star: "The Modern Altiplano"
This design system moves away from the sterile, plastic nature of modern SaaS dashboards to embrace the soul of the Bolivian landscape. Our Creative North Star is **"The Modern Altiplano."** This philosophy balances the rugged, organic textures of the Andes with the sophisticated, editorial clarity of a high-end culinary journal.

We avoid "template" layouts. Instead, we use **intentional asymmetry** and **tonal layering** to guide the eye. Imagine a dashboard not as a grid of boxes, but as a curated table setting—organized, warm, and deeply authentic. Elements should feel as though they were placed by hand, using depth and color rather than lines and borders to create structure.

---

## 2. Colors: Tonal Earth & Highland Soul
Our palette is derived from the mineral-rich soils of Potosí, the lush valleys of Cochabamba, and the vibrant heritage of the national flag.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Boundaries must be defined through background color shifts. For example, a `surface-container-low` side panel sitting on a `surface` background provides all the separation needed. Lines create visual noise; tonal shifts create atmosphere.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of organic material.
*   **Base Layer:** `surface` (#fcf9f4) – The "fine paper" foundation.
*   **Secondary Content:** `surface-container-low` (#f6f3ee) – For subtle grouping.
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) – To create a crisp, "lifted" feel against darker backgrounds.
*   **Nested Elements:** Use `surface-container-high` (#ebe8e3) for internal elements (like search bars inside a header) to create a "carved out" effect.

### The "Glass & Gradient" Rule
To elevate the dashboard from "flat" to "premium," use Glassmorphism for floating overlays (e.g., side navigation or floating action panels). Use `surface` with a 70% opacity and a `20px` backdrop-blur. 

**Signature Gradients:** For primary CTAs and high-impact analytics, use a subtle linear gradient from `primary` (#85341f) to `primary-container` (#a44b34). This mimics the natural variation in terracotta clay.

---

## 3. Typography: Editorial Sophistication
We pair the historic weight of a serif with the industrial precision of a sans-serif.

*   **The Voice (Noto Serif):** Used for `display`, `headline`, and `title` scales. This provides an authoritative, "menu-like" feel that honors tradition.
*   **The Engine (Manrope):** Used for `body` and `label` scales. A modern sans-serif that ensures high legibility for complex data like inventory counts and order numbers.

**Hierarchy as Identity:** Use high contrast between scales. A `display-lg` headline should feel significantly more "grand" than the `body-md` text beneath it, creating a rhythmic, editorial flow.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders are replaced by light and material logic.

*   **The Layering Principle:** Stacking surface tiers creates natural hierarchy. A `surface-container-lowest` card placed on a `surface-container` background creates an immediate focal point without a single pixel of shadow.
*   **Ambient Shadows:** Use only for elements that truly "float" (modals, dropdowns).
    *   *Spec:* `Y: 8px, Blur: 24px, Spread: 0, Color: on-surface @ 6%`.
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use the `outline-variant` (#dbc1ba) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Use semi-transparent `surface-variant` colors for headers. This allows the earthy background tones to "bleed" through, making the UI feel like a singular, integrated experience.

---

## 5. Components: Crafted Primitives

### Buttons
*   **Primary:** Terracotta gradient (`primary` to `primary-container`), white text. `0.375rem` (md) corner radius.
*   **Secondary:** Deep Green (`secondary` #3b6934). Use for "success" actions or valley-inspired accents.
*   **Tertiary:** Transparent background with `on-surface` text and a Ghost Border on hover.

### Cards & Lists (The Divider-Free Rule)
*   **Cards:** No borders. Use `surface-container-low` and a `0.5rem` (lg) radius.
*   **Lists:** Forbid divider lines. Separate items using `12px` of vertical white space and a subtle background hover state using `surface-container-highest`.

### Input Fields
*   **Style:** Minimalist. Background color `surface-container-high` with a bottom-only "active" indicator in `primary` (#85341f).
*   **Labels:** Always use `label-md` in `on-surface-variant` for a clean, understated look.

### Specialized Components
*   **The "Regional Badge":** Use `tertiary` (Gold/Yellow) and `error` (Bolivian Red) for status indicators. They should be styled as "stamps" using `label-sm` and a `full` (pill) radius.
*   **Dish Analytics Card:** A high-end card using `surface-container-lowest`, featuring a large `headline-md` serif number for "Top Seller" and a small `secondary` (Green) sparkline.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a structural tool. Let the typography breathe.
*   **DO** use the `secondary` green for growth, health, and "freshness" metrics.
*   **DO** mix the serif and sans-serif within the same module to create "Editorial" texture.
*   **DO** use `surface-dim` for background elements that need to recede, like empty states.

### Don't
*   **DON'T** use 100% black. Use `on-background` (#1c1c19) for all "black" text to maintain the warm, organic feel.
*   **DON'T** use harsh 90-degree corners. Even the most "organized" element should have at least a `0.125rem` (sm) radius to feel "hand-finished."
*   **DON'T** use generic "Material Blue" or "Bootstrap Purple." Every color must map back to the Earthy/Terracotta/Green palette provided.
*   **DON'T** use heavy drop shadows. If it looks like it’s floating in a void, it’s too heavy. It should look like it’s resting on a table.```