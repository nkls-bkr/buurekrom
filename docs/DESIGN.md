# Design System: Modern Agrarian Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Tactile Almanac"**
This design system rejects the sterile, "tech-first" look of traditional agricultural software. Instead, it draws inspiration from high-end independent gardening journals and architectural digests. We aim to create a digital environment that feels as grounded as the soil and as clear as a summer morning.

The system breaks the "standard app" mold through **intentional asymmetry** and **tonal depth**. By utilizing a generous typography scale and layered surfaces rather than rigid grids and borders, we evoke a sense of organic growth. This is "Modern Agrarian": a sophisticated blend of heritage warmth and precision-grade functionality.

---

### 2. Colors: The Earth & The Atmosphere
We utilize a palette rooted in the natural world, moving away from "digital neons" toward pigment-inspired hues.

*   **Primary (`#17341d`) & Primary Container (`#2d4b32`):** Our "Deep Forest." Used for high-authority elements and core navigation.
*   **Secondary (`#4d6450`):** "Soft Sage." This acts as our functional workhorse for secondary actions and utility icons.
*   **Tertiary (`#561a00`):** "Earthy Terracotta." Use this sparingly for moments of vital information, alerts, or "harvest-ready" statuses.
*   **Background (`#fdf9f0`):** A "Warm Cream" that reduces eye strain in the field and feels more premium than pure white.

**The "No-Line" Rule:**
To maintain an editorial feel, **1px solid borders are strictly prohibited** for sectioning. Definition must be achieved through background shifts. For example, a card should be `surface-container-lowest` sitting on a `surface` background.

**Signature Textures & Glass:**
For floating action buttons or high-level navigation overlays, utilize **Glassmorphism**. Apply `surface` at 80% opacity with a `24px` backdrop blur. This allows the lush photography of crops to "bleed" through the UI, making the app feel integrated with the environment.

---

### 3. Typography: The Editorial Voice
We pair two distinct personalities to create a hierarchy that feels both professional and approachable.

*   **Display & Headline (Plus Jakarta Sans):** A modern sans-serif with geometric leanings. Use `display-lg` (3.5rem) and `headline-md` (1.75rem) to create clear entry points for content. Don't be afraid to use asymmetric alignment (e.g., a left-aligned headline with a right-aligned image).
*   **Body & Label (Be Vietnam Pro):** Chosen for its exceptional legibility and friendly, open terminals.
    *   `body-lg` (1rem) for long-form farm logs or crop descriptions.
    *   `label-sm` (0.6875rem) for technical data points (e.g., soil pH, moisture levels).

The contrast between the bold, structured headers and the soft, airy body text creates an authoritative yet "homestead" feel.

---

### 4. Elevation & Depth: Tonal Layering
In this design system, depth is a physical property of "stacked paper," not digital light.

*   **The Layering Principle:** Avoid shadows where color can do the work.
    *   **Base:** `surface` (#fdf9f0)
    *   **Sections:** `surface-container-low` (#f7f3ea)
    *   **Primary Cards:** `surface-container-lowest` (#ffffff)
*   **Ambient Shadows:** If a card must "float" (e.g., a critical weather alert), use a highly diffused shadow: `0px 12px 32px rgba(28, 28, 23, 0.06)`. Note the tint—we use the `on-surface` color (#1c1c17) at a very low opacity, never pure black.
*   **The "Ghost Border" Fallback:** For input fields or essential accessibility boundaries, use the `outline-variant` (#c2c8bf) at **20% opacity**. It should be felt, not seen.

---

### 5. Components: Functional Elegance

*   **Buttons:**
    *   **Primary:** Solid `primary` (#17341d) with `on-primary` text. Use `xl` (1.5rem) corner radius.
    *   **Secondary:** A subtle gradient from `primary-container` to `secondary-container` to give a "satin" finish.
*   **Cards:** Strictly no borders. Use `surface-container-highest` for inactive states and `surface-container-lowest` for active/tappable states. Padding must follow the `spacing-6` (2rem) rule to ensure the content "breathes."
*   **Inputs:** Use `surface-container-low` with a `md` (0.75rem) corner radius. Labels should always be in `label-md` uppercase for a "data-sheet" aesthetic.
*   **Chips:** Use `secondary-fixed` for an organic, "leaf-like" feel.
*   **Farming Context Specials:**
    *   **Growth Trackers:** Use a thick `primary-fixed` track with a `primary` indicator.
    *   **Status Badges:** Use `tertiary-container` (#772d0c) for urgent soil/weather alerts—the terracotta color mimics the warning of dry earth.

---

### 6. Do's and Don'ts

#### Do:
*   **Embrace Whitespace:** If you think there’s enough space, add 20% more. Use `spacing-16` (5.5rem) between major content sections.
*   **Use High-End Imagery:** Only use photography with natural lighting. Avoid "stocky" photos; prioritize macro shots of soil texture or golden-hour field views.
*   **Asymmetric Layouts:** Place text on the left and allow an image to "bleed" off the right edge of the screen to break the "boxed-in" feel.

#### Don't:
*   **Don't use Dividers:** Never use a horizontal line to separate list items. Use `spacing-4` (1.4rem) or a subtle shift to `surface-variant`.
*   **Don't use Pure Black:** `#000000` does not exist in nature. Always use `on-surface` (#1c1c17).
*   **Don't use Sharp Corners:** Nothing in the field is perfectly sharp. Maintain a minimum of `sm` (0.25rem) even for the smallest UI elements.

---

### 7. Spacing & Rhythm
Rhythm is dictated by the **1.4rem (spacing-4)** base unit.
*   **Container Padding:** `spacing-6` (2rem) or `spacing-8` (2.75rem).
*   **Component Gap:** `spacing-3` (1rem).
*   **Hero Margin:** `spacing-12` (4rem).

By sticking to these wider intervals, the app maintains its "Modern Agrarian" calm, even when displaying complex data.