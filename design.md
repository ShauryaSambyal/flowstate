# FlowState — Design System

A single-page design contract for the FlowState frontend. Everything visual in
`client/` should resolve from the tokens and rules in this document.

---

## 1. Design Philosophy

FlowState borrows its visual language from **Nothing OS** — engineering exposed,
nothing decorative for its own sake:

- **The grid is the design.** A fixed metric grid is visible on every surface,
  in every mode. Content aligns to it; it is never covered by gradients.
- **Dot-matrix type.** Display text is set in NType82 — glyphs built from a
  matrix of dots. One loud typeface, everything else quiet.
- **Microcopy as instrumentation.** Small mono labels in NType82Mono mark
  sections, status and coordinates — read-out text, not decoration.
- **Restraint.** One orchestrated motion moment per surface (the hero decode).
  No floating blobs of stock-gradient, no card soup, no emoji bullets.

## 2. Modes

Two modes, selected automatically from the OS preference and toggleable from
the header. Selection persists to `localStorage`.

| Mode   | Trigger                                              | Attribute            |
| ------ | ---------------------------------------------------- | -------------------- |
| Light  | Default when system is light or unset                | `data-mode="light"`  |
| Dark   | `prefers-color-scheme: dark` or manual toggle        | `data-mode="dark"`   |

Implementation notes:

- A `<script>` in `index.html` applies `data-mode`/`data-theme` to `<html>`
  before first paint — no flash of the wrong theme.
- `color-scheme` is set to the active mode so scrollbars/form controls match.
- State lives in `client/src/context/ThemeContext.jsx`.

## 3. Themes

Three surface themes, independent of mode (six total combinations). Selectable
from the header theme menu; persisted. **All themes share one minimal,
borderless language — differences are background tint and dot-field flavour
only.**

### 3.1 `glass` (default)
Light wash over the dot field, with a faint accent glow.
- Translucent tint cards (`var(--card-bg)`) with `backdrop-filter` blur
- No borders; one soft drop shadow (`0 1px 2px …`), slightly deeper on hover
- Two faint radial glows (blue/teal) in the background

### 3.2 `neo`
Warm grey page wash; no glows.
- Same borderless cards as glass: flat page-tinted surfaces, soft shadow only
- Neumorphic extrusion/inset shadows were **removed in the v2 pass** — inputs
  and cards are flat tints like everywhere else
- No glows, no blur, no visible borders

### 3.3 `mono`
Flat, terminal-grade monochrome. The pure Nothing look.
- Pure `#000` / near-white palette; accent = foreground itself
- Borderless and shadowless (`--card-shadow: none`; hard offset shadows
  removed in the v2 pass)
- Small radius (6px), dot field at slightly higher contrast

## 4. Color Tokens

Surfaces resolve from CSS custom properties set on `:root` and re-declared per
`[data-mode][data-theme]`. Core values:

### Light mode

| Token               | glass                         | neo                             | mono               |
| ------------------- | ----------------------------- | ------------------------------- | ------------------ |
| `--bg`              | `#EDF3FB`                    | `#E7EBF2`                       | `#F4F4F2`          |
| `--text-primary`    | `#0F172A`                    | `#1E2933`                       | `#0A0A0A`          |
| `--accent`          | `#2563EB`                    | `#2563EB`                       | `#0A0A0A`          |
| `--card-bg`         | `rgba(0,0,0,0.04)`           | `rgba(0,0,0,0.04)`              | `rgba(0,0,0,0.04)`     |
| `--card-shadow`     | `0 1px 2px` soft             | `0 1px 2px` soft                | `none` (flat)          |
| `--dot-color`       | `rgba(15,23,42,0.24)`        | `rgba(30,41,51,0.20)`           | `rgba(10,10,10,0.28)` |

### Dark mode

| Token               | glass                         | neo                             | mono               |
| ------------------- | ----------------------------- | ------------------------------- | ------------------ |
| `--bg`              | `#06080D`                    | `#181B21`                       | `#000000`          |
| `--text-primary`    | `#F1F5F9`                    | `#E7EBF2`                       | `#F5F5F5`          |
| `--accent`          | `#60A5FA`                    | `#60A5FA`                       | `#F5F5F5`          |
| `--card-bg`         | `rgba(255,255,255,0.045)`    | `rgba(255,255,255,0.045)`       | `rgba(255,255,255,0.045)` |
| `--card-shadow`     | `0 1px 2px` soft             | `0 1px 2px` soft                | `none` (flat)          |
| `--dot-color`       | `rgba(255,255,255,0.10)`     | `rgba(148,163,184,0.08)`        | `rgba(255,255,255,0.16)` |

> **Borders:** removed in the v2 design pass (`--card-border-width: 0` in all
> six combos; `--card-border-color` / `--dropdown-border` / `--alt-card-border`
> / `--input-border` are `transparent`). Hairlines (`--hairline`, 1px) and focus
> rings (`--focus-ring`, `:focus-visible` outline) only.

Support tokens (all re-mapped per mode/theme): `--text-secondary`,
`--accent-contrast`, `--accent-soft`, `--card-border-color`,
`--card-border-width`, `--card-radius`, `--card-blur`, `--card-shadow-hover`,
`--header-bg`, `--header-border`, `--dropdown-bg`, `--dropdown-border`,
`--input-bg`, `--input-border`, `--input-shadow`, `--focus-ring`,
`--hairline`, `--icon-bg`, `--alt-section-bg`, `--alt-card-bg`,
`--alt-card-border`, `--alt-text-secondary`, `--media-bg`, `--media-shadow`.

## 5. Typography

| Role     | Family            | Source                                | Notes                     |
| -------- | ----------------- | ------------------------------------- | ------------------------- |
| Display  | `NType82-Headline` | self-hosted `client/public/fonts/`  | Hero + the one loud voice |
| Mono     | `NType82Mono`     | self-hosted `client/public/fonts/`    | Labels, meta, theme menu  |
| Display fallback | `NType82`   | self-hosted                           | if Headline fails         |
| Body     | `Inter`           | Google Fonts (400/500/600/700)        | everything else           |

Font stack variables: `--font-display`, `--font-mono`, `--font-body`.

Type scale (hero): `clamp(2.75rem, 8vw, 7rem)`, uppercase, tracking `0.02em`,
line-height `0.98`. Body text never exceeds ~80 characters per line.

## 6. The Background Dot Field

Rendered by `body::before` (fixed, `z-index: -2`, `pointer-events: none`):

```css
background-image: radial-gradient(circle at 1px 1px, var(--dot-color) 1px, transparent 0);
background-size: var(--dot-size) var(--dot-size); /* 22px */
-webkit-mask-image: radial-gradient(130% 100% at 50% 0, #000 35%, transparent 95%);
        mask-image: radial-gradient(130% 100% at 50% 0, #000 35%, transparent 95%);
```

- Visible in **both** modes and all three themes — only `--dot-color` changes
  (`mono` slightly higher contrast, `neo` lower so neumorphic shadows stay clean).
- Ambient glows live on `body::after` (`z-index: -3`) and are transparent in
  `neo` and `mono`.
- Mode/theme changes transition over `0.35s` on background, border and color.

## 7. Component Rules

- **Cards** (bento, contact form, dropdowns): always `var(--card-bg)` +
  `var(--card-shadow)` — **no borders**. Theme differences must come from
  tokens, never per-component hex values.
- **Header**: transparent at top; on scroll, `var(--header-bg)` + blur + a
  1px `var(--header-border)` hairline. Contains the mode toggle and theme menu.
- **Buttons**: `.btn-primary` = solid `var(--accent)` pill, no border.
  `.btn-ghost` = quiet text button, no outline, `var(--accent-soft)` on hover.
  No gradients on buttons.
- **Alt sections** (Stats, Gallery): deep-tone sections that read as
  "dark blocks" in light mode and slightly-lifted blocks in dark mode,
  resolving from `--alt-section-bg`.
- **Focus**: visible `var(--focus-ring)` ring on all interactive elements.

## 8. Motion

- **Hero decode**: headline characters scramble through dot glyphs
  (`· • ◦ * +`) before settling — the single orchestrated moment. Runs once
  (~1s), staggered lines, and is skipped entirely under
  `prefers-reduced-motion`.
- Micro-interactions only on answer to user action: hover lifts
  (`translateY(-4px)`), dropdown springs, FAQ accordion.
- No auto-playing ambient animation anywhere else.

## 9. Accessibility

- Contrast ≥ 4.5:1 verified for text tokens in all six mode/theme pairs.
- `aria-label` on icon-only controls (mode toggle, theme menu).
- Mode/theme choice persists; system preference respected on first visit.
- Grid and glows are `pointer-events: none` and decorative-only.

## 10. File Map

| Concern                | Location                                         |
| ---------------------- | ------------------------------------------------ |
| Tokens, grid, fonts    | `client/src/index.css`                           |
| Theme state            | `client/src/context/ThemeContext.jsx`            |
| Mode/theme controls    | `client/src/components/ThemeSwitcher.jsx`        |
| No-flash init          | inline script in `client/index.html`             |
| Nothing font files     | `client/public/fonts/` (NType82-Headline/Regular/Mono) |
| Per-component surfaces | `client/src/components/*.css`, `client/src/pages/*.css` |
