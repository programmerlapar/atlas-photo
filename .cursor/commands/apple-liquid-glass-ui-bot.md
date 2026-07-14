# Apple “Liquid Glass” UI System (Tailwind) — Strict Guidelines & Global Styles

---

## 0) Principles (Non‑negotiable)

1. **Materials ≠ colors**: Surfaces are _materials_ (translucent, layered, with blur, inner highlights). Colors are applied via tints and content.
2. **Hierarchy by elevation**: Depth is communicated with _blur_, _tint opacity_, _hairline borders_, and _soft inner highlights_—not big drop‑shadows.
3. **8‑pt rhythm**: Spacing uses 4/8 pts with consistent paddings: 12/16/20/24.
4. **Corner geometry**: Large, friendly radii. Avoid mixed radii on a single surface.
5. **Motion serves context**: Sub‑200ms for small UI, 240–320ms for sheets. Respect `prefers-reduced-motion`.
6. **Accessibility first**: Maintain contrast ≥ 4.5:1 in default; auto‑lift contrast in High‑Contrast mode.

---

## 1) Design Tokens (CSS Variables)

Add to `globals.css`:

```css
:root {
  /* Base palette (HSL for Tailwind mapping) */
  --bg: 220 20% 98%;
  --fg: 220 15% 10%;

  /* Tints (use as accents, not solid fills) */
  --tint-blue: 212 100% 52%;
  --tint-indigo: 231 95% 63%;
  --tint-cyan: 187 92% 40%;
  --tint-green: 142 70% 45%;
  --tint-pink: 330 90% 60%;
  --tint-orange: 24 95% 55%;

  /* Elevation glass tints (on light) */
  --glass-1: 0 0% 100% / 0.55; /* top chrome */
  --glass-2: 0 0% 100% / 0.35; /* standard cards */
  --glass-3: 0 0% 100% / 0.25; /* popovers */
  --glass-4: 0 0% 100% / 0.18; /* dialogs/sheets */

  /* Borders & lines */
  --line: 0 0% 100% / 0.65; /* hairline on dark backdrops */
  --line-inverse: 220 14% 10% / 0.12; /* hairline on light backdrops */

  /* Shadows (subtle) */
  --shadow-umbra: 220 10% 10% / 0.06;
  --shadow-penumbra: 220 10% 10% / 0.12;

  /* Inner highlight for glass rim */
  --rim: 0 0% 100% / 0.35;

  /* Radii */
  --radius-xs: 10px; /* small chips */
  --radius-sm: 14px; /* buttons */
  --radius-md: 20px; /* cards */
  --radius-lg: 24px; /* popovers */
  --radius-xl: 28px; /* sheets/modals */
  --radius-2xl: 36px; /* large hero surfs */

  /* Blur levels */
  --blur-1: 12px; /* top bars */
  --blur-2: 20px; /* cards */
  --blur-3: 28px; /* popovers */
  --blur-4: 40px; /* sheets/modals */

  /* Motion */
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-xs: 150ms;
  --dur-sm: 200ms;
  --dur-md: 240ms;
  --dur-lg: 320ms;

  /* Typography (optical sizes approximated) */
  --font-sans:
    ui-sans-serif, -apple-system, BlinkMacSystemFont, 'SF Pro Text',
    'SF Pro Display', Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji',
    'Segoe UI Emoji';
  --size-title-1: clamp(28px, 4vw, 40px);
  --size-title-2: clamp(22px, 3vw, 28px);
  --size-headline: 20px;
  --size-body: 16px;
  --size-sub: 15px;
  --size-foot: 13px;
}

.dark {
  --bg: 220 16% 8%;
  --fg: 0 0% 98%;
  /* dark glass tint flips to dark translucency */
  --glass-1: 0 0% 8% / 0.65;
  --glass-2: 0 0% 8% / 0.55;
  --glass-3: 0 0% 8% / 0.45;
  --glass-4: 0 0% 8% / 0.38;
  --line: 0 0% 100% / 0.08;
  --line-inverse: 0 0% 0% / 0.25;
}

/* Optional: subtle noise overlay for organic look */
@media (min-resolution: 2dppx) {
  .noise::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='2' seed='2' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.025'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
    mix-blend-mode: soft-light;
    opacity: 0.6;
  }
}
```

---

## 2) Tailwind Mapping (must match variables)

Add to `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--bg))',
        foreground: 'hsl(var(--fg))',
        line: 'hsl(var(--line))',
        lineInverse: 'hsl(var(--line-inverse))',
        tint: {
          blue: 'hsl(var(--tint-blue))',
          indigo: 'hsl(var(--tint-indigo))',
          cyan: 'hsl(var(--tint-cyan))',
          green: 'hsl(var(--tint-green))',
          pink: 'hsl(var(--tint-pink))',
          orange: 'hsl(var(--tint-orange))',
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        glass: '0 10px 30px hsl(var(--shadow-penumbra))',
        lift: '0 2px 8px hsl(var(--shadow-umbra))',
      },
      backdropBlur: {
        1: 'var(--blur-1)',
        2: 'var(--blur-2)',
        3: 'var(--blur-3)',
        4: 'var(--blur-4)',
      },
      transitionTimingFunction: {
        ios: 'var(--ease)',
      },
      transitionDuration: {
        xs: 'var(--dur-xs)',
        sm: 'var(--dur-sm)',
        md: 'var(--dur-md)',
        lg: 'var(--dur-lg)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.hairline': {
          border: '1px solid hsl(var(--line-inverse))',
          '@media (prefers-color-scheme: dark)': {
            border: '1px solid hsl(var(--line))',
          },
        },
        '.inner-rim': {
          boxShadow: 'inset 0 1px 0 hsl(var(--rim))',
        },
        '.glass-surface-1': {
          background: 'hsla(var(--bg) / 0)',
          backgroundColor: 'hsla(var(--glass-1))',
          backdropFilter: 'saturate(160%) blur(var(--blur-1))',
        },
        '.glass-surface-2': {
          backgroundColor: 'hsla(var(--glass-2))',
          backdropFilter: 'saturate(160%) blur(var(--blur-2))',
        },
        '.glass-surface-3': {
          backgroundColor: 'hsla(var(--glass-3))',
          backdropFilter: 'saturate(160%) blur(var(--blur-3))',
        },
        '.glass-surface-4': {
          backgroundColor: 'hsla(var(--glass-4))',
          backdropFilter: 'saturate(180%) blur(var(--blur-4))',
        },
      });
    },
  ],
};
export default config;
```

> **CRITICAL RULE:** _All_ elevated surfaces (cards, containers, interactive elements) MUST use `.glass-surface-2` + `.hairline` + `.inner-rim`. Do NOT use `.glass-surface-1`, `.glass-surface-3`, or `.glass-surface-4` unless explicitly specified for special cases (toolbars use `.glass-surface-1`, sheets/modals use `.glass-surface-4`).

---

## 3) Global Base (apply once)

```css
/* Base resets + body theming */
html,
body {
  height: 100%;
}
body {
  background: hsl(var(--bg));
  color: hsl(var(--fg));
  font-family: var(--font-sans);
}

/* Text scale */
.h-title-1 {
  font-size: var(--size-title-1);
  font-weight: 700;
  letter-spacing: -0.02em;
}
.h-title-2 {
  font-size: var(--size-title-2);
  font-weight: 700;
  letter-spacing: -0.02em;
}
.h-headline {
  font-size: var(--size-headline);
  font-weight: 600;
}
.t-body {
  font-size: var(--size-body);
}
.t-sub {
  font-size: var(--size-sub);
  color: hsl(var(--fg) / 0.75);
}
.t-foot {
  font-size: var(--size-foot);
  color: hsl(var(--fg) / 0.65);
}

/***** Motion safety *****/
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```

---

## 4) Component Recipes (strict)

### 4.1 Card (default container) — REQUIRED PATTERN

**Use the centralized Card component** (`app/components/ui/Card.tsx`) instead of inline glass styling:

```tsx
import Card from '@/app/components/ui/Card';

// Custom glass variant (DEFAULT)
<Card padding="p-5" shadow="custom">
  <h3 class="h-headline mb-2">Card title</h3>
  <p class="t-sub">Secondary text lives here.</p>
</Card>

// Liquid glass variant (optional)
<Card variant="liquid-glass" className="md:w-[520px]" padding="p-5" shadow="shadow-glass">
  <h3 class="h-headline mb-2">Card title</h3>
  <p class="t-sub">Secondary text lives here.</p>
</Card>
```

**Legacy HTML pattern** (for reference, but prefer Card component):

```html
<div
  class="relative glass-surface-2 hairline inner-rim rounded-md shadow-glass p-5"
>
  <h3 class="h-headline mb-2">Card title</h3>
  <p class="t-sub">Secondary text lives here.</p>
</div>
```

**Card Component Props:**

- `variant`: `'custom-glass'` (default) or `'liquid-glass'`
- `padding`: `'p-3' | 'p-4' | 'p-5' | 'p-6' | 'p-8' | 'p-12' | 'p-16'` (default: `'p-5'`)
- `shadow`: `'shadow-glass' | 'shadow-lift' | 'custom' | 'none'` (default based on variant)
- `rounded`: `'rounded-sm' | 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-[12px]'` (default based on variant)
- `className`: Additional CSS classes

**Rules (ENFORCED)**

- **MUST use the `Card` component** for all elevated card surfaces.
- Accept either default `custom-glass` (preferred) or `liquid-glass` variant.
- When using `liquid-glass`, include `.glass-surface-2` + `.hairline` + `.inner-rim` (enforced by component).
- Padding: 20px (p-5 = 8-pt rhythm) by default.
- Radius: `rounded-[12px]` for custom-glass, `rounded-md` for liquid-glass.
- Use `.noise` class in `className` prop for organic look (optional).

---

### 4.2 Button — REQUIRED PATTERN

```html
<button
  class="relative inline-flex items-center gap-2 rounded-sm px-4 py-2 glass-surface-2 hairline inner-rim shadow-lift transition-[transform,filter] duration-sm ease-ios hover:scale-[1.01] active:scale-[0.99]"
>
  <span class="relative z-10">Button</span>
</button>
```

**Variants**

- **Secondary/Glass**: Use `.glass-surface-2 hairline inner-rim` (required pattern above).
- **Tinted**: Add `bg-[hsl(var(--tint-blue))]/20 hover:bg-[hsl(var(--tint-blue))]/28` and `text-[hsl(var(--tint-blue))]` (tint ≤ 28% opacity).
- **Primary CTA**: Use gradient `bg-gradient-to-r from-[hsl(var(--tint-cyan))] to-[hsl(var(--tint-blue))] text-white` (gradient allowed for primary only).
- **Ghost**: Remove glass class, keep `hover:bg-foreground/5`.

**Rules (ENFORCED)**

- **MUST use `.glass-surface-2` + `.hairline` + `.inner-rim`** for secondary buttons.
- Radius: `rounded-sm` (14px / `--radius-sm`). Hit target ≥ 44×44.
- Motion: `duration-sm` (200ms) with `ease-ios` (`var(--ease)`).
- No heavy drop shadows; rely on `inner-rim` + subtle `shadow-lift`.
- Tints ≤ 28% opacity except primary CTA (gradient allowed).

---

### 4.3 Text Field / Search

```html
<label class="block t-foot mb-2">Email</label>
<div class="relative rounded-sm glass-surface-2 hairline inner-rim px-4 py-3">
  <input
    type="email"
    class="bg-transparent outline-none w-full placeholder:opacity-60"
    placeholder="name@domain.com"
  />
</div>
```

**Rules**

- Focus: add `ring-2 ring-[hsl(var(--tint-blue))]/40` to container on focus.
- Error: `ring-2 ring-[hsl(var(--tint-pink))]/45` + helper text.

---

### 4.4 Toolbar / Nav Bar (translucent chrome)

```html
<header
  class="sticky top-0 z-50 glass-surface-1 hairline inner-rim backdrop-saturate-150"
>
  <div class="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
    <div
      class="h-1 w-12 rounded-full bg-foreground/20"
      aria-hidden="true"
    ></div>
    <span class="t-sub">App Title</span>
  </div>
</header>
```

**Rules**

- Blur level 1. Keep content area under it with `pt-[var(--toolbar-height)]` if using fixed sizes.

---

### 4.5 Popover / Menu

```html
<div class="glass-surface-3 hairline inner-rim rounded-lg p-2 shadow-glass">
  <button class="w-full text-left rounded-xs px-3 py-2 hover:bg-foreground/5">
    Action
  </button>
</div>
```

**Rules**

- Radius: `rounded-lg` (24px). Item radius 10px.

---

### 4.6 Sheet / Modal

```html
<div class="glass-surface-4 hairline inner-rim rounded-xl shadow-glass p-6">
  <div
    class="mx-auto h-1 w-12 rounded-full bg-foreground/20 mb-4"
    aria-hidden="true"
  ></div>
  <h2 class="h-title-2 mb-2">Title</h2>
  <p class="t-sub">Supporting text.</p>
</div>
```

**Rules**

- Radius: `rounded-xl` (28px). Blur-4. Use grabber bar at top.

---

### 4.7 Segmented Control

```html
<div class="inline-flex glass-surface-2 hairline inner-rim rounded-sm p-1">
  <button class="px-3 py-1.5 rounded-xs hover:bg-foreground/5">All</button>
  <button
    class="px-3 py-1.5 rounded-xs bg-[hsl(var(--tint-blue))]/20 text-[hsl(var(--tint-blue))]"
  >
    Open
  </button>
  <button class="px-3 py-1.5 rounded-xs hover:bg-foreground/5">Closed</button>
</div>
```

---

## 5) Strict Do/Don't Rules (ENFORCED)

**DO**

- **All elevated surfaces MUST use the `Card` component**. Prefer the default `custom-glass` variant; `liquid-glass` is allowed where desired.
- Use radii from tokens ONLY:
  - Buttons: `rounded-sm` (14px / `--radius-sm`)
  - Cards: `rounded-md` (20px / `--radius-md`)
  - Sheets/Modals: `rounded-xl` (28px / `--radius-xl`)
- Use tints at ≤ 28% opacity for backgrounds; 100% for primary CTA only.
- Keep shadows subtle (≤ 30px blur, low opacity). Prefer elevation via blur/tint.
- Enforce 8-pt spacing rhythm: use 4/8/12/16/20/24/32/48/64px (p-1, p-2, p-3, p-4, p-5, p-6, p-8, p-12, p-16).
- Maintain WCAG AA contrast (≥ 4.5:1 for text).
- Motion: Use `duration-sm` (200ms) to `duration-lg` (320ms), timing `ease-ios` (`var(--ease)`).
- **ALWAYS respect `prefers-reduced-motion`** with motion safety CSS.

**DON'T**

- Don't use `.glass-surface-1`, `.glass-surface-3`, or `.glass-surface-4` for general elevated surfaces (toolbars = `.glass-surface-1`, sheets = `.glass-surface-4` only).
- Don't mix multiple different radii on one surface.
- Don't use opaque solid fills for elevated surfaces.
- Don't exceed 320ms transitions. Don't animate blur radius.
- Don't rely on thick borders; keep hairlines at 1 CSS pixel.
- Don't use tints > 28% opacity except for primary CTA buttons.

---

## 6) High‑Contrast Mode (auto‑lift)

Add a class to `<html>` or user setting: `.contrast`

```css
.contrast {
  --glass-2: 0 0% 100% / 0.45; /* more body */
  --line-inverse: 220 14% 10% / 0.22;
}
```

---

## 7) Fallbacks (no backdrop‑filter)

When `backdrop-filter` unsupported, add `.no-bdf` to `<html>`:

```css
.no-bdf .glass-surface-1,
.no-bdf .glass-surface-2,
.no-bdf .glass-surface-3,
.no-bdf .glass-surface-4 {
  background-color: hsl(var(--bg));
}
```

---

## 8) Example Page Skeleton

```html
<body class="min-h-dvh bg-background text-foreground">
  <header class="glass-surface-1 hairline inner-rim sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <span class="h-headline">LiquidGlass</span>
      <button class="rounded-sm px-3 py-2 glass-surface-2 hairline inner-rim">
        Sign in
      </button>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 py-10 grid gap-6 sm:grid-cols-2">
    <div
      class="glass-surface-2 hairline inner-rim rounded-md p-6 shadow-glass noise"
    >
      <h2 class="h-title-2 mb-3">Welcome</h2>
      <p class="t-sub">A translucent design system for Tailwind.</p>
      <div class="mt-6 flex gap-3">
        <button
          class="rounded-sm px-4 py-2 bg-[hsl(var(--tint-blue))] text-white"
        >
          Get Started
        </button>
        <button class="rounded-sm px-4 py-2 glass-surface-2 hairline inner-rim">
          Learn more
        </button>
      </div>
    </div>

    <div class="glass-surface-2 hairline inner-rim rounded-md p-6 shadow-glass">
      <label class="block t-foot mb-2">Search</label>
      <div class="rounded-sm glass-surface-2 hairline inner-rim px-4 py-3">
        <input
          class="bg-transparent outline-none w-full"
          placeholder="Find something"
        />
      </div>
    </div>
  </main>
</body>
```

---

## 9) How to Enforce in Generators/"Models"

1. **Always inject** this Tailwind mapping + tokens into new projects.
2. **Lint policy**: reject components that lack `.glass-surface-2` + `.hairline` + `.inner-rim` (all three required) or use radii outside tokens.
3. **Prompt suffix** to your UI generator (REQUIRED):
   - "Use Liquid Glass system:
     - All elevated surfaces = `.glass-surface-2` + `.hairline` + `.inner-rim` (required).
     - Radii: button 14px (`rounded-sm`), card 20px (`rounded-md`), sheet 28px (`rounded-xl`).
     - Tints ≤ 28% except primary CTA (gradient allowed for primary only).
     - Motion ≤ 200–320ms (`duration-sm` to `duration-lg`), ease `var(--ease)`, respect `prefers-reduced-motion`.
     - Enforce 8-pt spacing and WCAG AA (≥ 4.5:1 contrast)."

4. **Design review gate**: scan DOM for violations (simple regex or ESLint plugin on classnames). Ensure all elevated surfaces have the required three classes.

---

## 10) Notes on Platform Parity

- iOS title bars ↔ `.glass-surface-1` with `--blur-1` and hairline.
- iOS sheets ↔ `.glass-surface-4` + `rounded-xl` + grabber.
- iOS tab bars/segmented controls ↔ tinted `.glass-surface-2` with chip radii (10–14px).

---

## 11) Quick Checklist (copy into PR template) — ENFORCED

- [ ] **ALL elevated surfaces use `.glass-surface-2` + `.hairline` + `.inner-rim`** (required pattern)
- [ ] Radii from tokens: buttons `rounded-sm` (14px), cards `rounded-md` (20px), sheets `rounded-xl` (28px)
- [ ] 8-pt spacing rhythm (4/8/12/16/20/24/32/48/64px)
- [ ] WCAG AA contrast ≥ 4.5:1 (text)
- [ ] Motion respects `prefers-reduced-motion` (motion safety CSS present)
- [ ] Motion durations: 200–320ms (`duration-sm` to `duration-lg`), timing `ease-ios`
- [ ] No opaque backgrounds on elevated surfaces
- [ ] Tints ≤ 28% opacity except primary CTA (gradient allowed for primary only)

---

## 12) Extra: Framer Motion Suggested Defaults

- Small interactions: `transition={{ type: 'spring', stiffness: 500, damping: 40, mass: .6 }}`
- Sheets: `stiffness: 280, damping: 36, mass: 1.1`
- Hover scale: 1.01; Active scale: 0.99.

---

**Integration Tip**: Mirror these tokens in your `UI_UX_doc.md` and **lock** component specs to the recipes above so any generator or teammate produces the same Liquid Glass look by default.
