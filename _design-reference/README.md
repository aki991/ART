# Handoff: Aero Ring Tech — Login & Registration

## Overview
Modern, minimalist log-in and registration page for the **Aero Ring Tech** (ART) web application — a tracking platform for racing pigeons (Pigeon Class network). Two-pane layout: dark brand panel on the left (1/3), light functional form panel on the right (2/3). Includes language switcher (sr / en / de) at the bottom.

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** — prototypes that show the intended look, feel, and behavior. They are **not production code to copy directly**. Recreate these designs in the target codebase using its existing patterns, libraries, and conventions (React + CSS Modules, Vue + Tailwind, Next.js, etc.). If no codebase exists yet, the recommended stack is **React (Vite or Next.js) + plain CSS / CSS Modules** since the prototype is already React-shaped.

## Fidelity
**High-fidelity (hifi).** All colors, typography, spacing, radii, shadows, and interactions are final. Recreate pixel-for-pixel.

---

## Screens / Views

### 1. Auth Page (single page, two modes)
The same page hosts two modes — `login` (default) and `register` — toggled by links at the bottom of the form. Layout is identical between modes; only the form fields and titles change.

**Overall layout**
- Full viewport height, two-column CSS Grid: `grid-template-columns: 1fr 2fr;` (left = 1/3, right = 2/3)
- Below 900px viewport: stacks to single column, brand on top
- Below 480px: name/surname fields (already stacked) remain stacked, title scales down

---

### Left pane — Brand panel
**Purpose:** Identity / brand reinforcement. Minimal — no decorative effects.

**Layout**
- Full height, centered content (flex column, `align-items: center`, `justify-content: center`), gap 26px
- Padding: 60px 40px

**Background**
- Radial gradient: `radial-gradient(ellipse 90% 70% at 50% 50%, #0F2438 0%, #0A1B2C 50%, #061320 100%)`

**Components (top → bottom)**
1. **Logo** — PNG asset (`assets/art-logo.png`), 260×260px, contained, with cyan glow:
   ```
   filter: drop-shadow(0 0 24px rgba(0,210,255,0.55))
           drop-shadow(0 0 60px rgba(0,210,255,0.30))
           drop-shadow(0 0 100px rgba(0,210,255,0.15));
   ```
2. **Wordmark "AERO ◆ RING ◆ TECH"** — flex row, gap 8px:
   - Font: `Orbitron`, 600, 18px, letter-spacing 0.22em, white-space nowrap
   - "AERO" and "TECH" in `#FFFFFF`
   - "RING" in `--cyan` with `text-shadow: 0 0 14px var(--cyan)`
   - Diamond divider between words: 5×5px square, `--copper` background, rotated 45°, `box-shadow: 0 0 8px var(--copper)`
   - Text shadow on container: `0 0 18px rgba(0,210,255,0.4), 0 0 40px rgba(0,210,255,0.15)`
3. **Tagline "THE ART OF FLIGHT"**
   - Font: `JetBrains Mono`, 11px, letter-spacing 0.45em, color `--copper`, `text-shadow: 0 0 10px rgba(199,159,100,0.3)`, padding-top 6px

---

### Right pane — Form panel
**Purpose:** Login / registration form with language switcher at the bottom.

**Layout**
- Flex column, centered form vertically, language bar pinned at bottom
- Padding: 60px 40px 28px
- Form `max-width: 440px`, centered horizontally

**Background**
```css
background:
  radial-gradient(ellipse 80% 60% at 30% 20%, #EAF4FA 0%, transparent 60%),
  radial-gradient(ellipse 70% 50% at 80% 90%, #F2EBDD 0%, transparent 55%),
  linear-gradient(180deg, #F4F8FB 0%, #ECF2F7 100%);
```

**Header**
- **Title** (`Prijava` / `Registracija` / translated): `Rajdhani` 700, 32px, color `#1A2330`, margin-bottom 4px
- **Subtitle** (`Pristup vašem nalogu` / `Otvorite novi nalog` / translated): `Rajdhani` 14px, color `#64748B`, margin-bottom 28px

**Form layout**
- Flex column, gap 14px
- All fields are full-width and 52px tall — including Ime/Prezime which are stacked one per row in the registration form

**Field component (`.mfield`)**
- Wrapper: white 90% (`rgba(255,255,255,0.9)`), 1.5px border `#D6E0EA`, border-radius 8px, height 52px
- Hover border: `#B5C6D6`
- Focus border: `--cyan`, white background, `box-shadow: 0 0 0 4px rgba(0,210,255,0.12), 0 4px 14px rgba(0,210,255,0.08)`
- **Icon column** on left: 46px wide, 1px right border `#E2EAF2`, icon color `#94A3B8` → `--cyan` on focus
- **Input**: flex 1, transparent, `Rajdhani` 500 15px, color `#1A2330`, placeholder `#94A3B8`
- **Password reveal eye button** on right (only on password fields)
- **Custom Select dropdown** (Klub):
  - Trigger looks identical to other fields
  - When open: bottom-radius removes (joins to menu)
  - Menu: white, 1.5px solid `--cyan`, no top border, bottom-radius 8px, `box-shadow: 0 8px 24px rgba(0,210,255,0.12), 0 4px 12px rgba(15,36,56,0.08)`, max-height 240px, scrollable
  - Options: padding 10px 14px, `Rajdhani` 14.5px; hover bg `rgba(0,210,255,0.08)`, color `--cyan`; active bg `rgba(0,210,255,0.12)`, weight 600
  - Slide-in animation 0.18s
  - Closes on outside-click and Escape

**Login fields (in order)**
1. Klub (custom select, icon: club)
2. Korisničko ime ili imejl (text, icon: mail)
3. Lozinka (password, icon: lock, eye toggle)

**Login form-row** (under fields)
- Flex row, space-between, flex-wrap
- **Checkbox "Zapamti me"**: 18px box, 1.5px border `#CBD5E0`, 4px radius. Checked: `--cyan` bg + `box-shadow: 0 2px 6px rgba(0,210,255,0.35)`. Label: `Rajdhani` 13.5px, `#475569`
- **"Zaboravljena lozinka?" link**: `--cyan`, 13.5px 600, no underline, hover opacity 0.85 + underline

**Register fields (in order, all stacked, identical dimensions)**
1. Klub (select)
2. Ime
3. Prezime
4. Imejl adresa
5. Lozinka

**Primary button (`.mbtn`)**
- Height 52px, full width, border-radius 10px
- Background: `linear-gradient(135deg, var(--cyan) 0%, #0099C8 100%)`
- Hover background swap (animated): `linear-gradient(135deg, #2EE0FF 0%, var(--cyan) 50%, #0099C8 100%)`
- Box-shadow rest: `0 4px 14px rgba(0,210,255,0.35), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.25)`
- Hover: `translateY(-2px)`, shadow grows to `0 8px 24px rgba(0,210,255,0.5)`
- Font: `Rajdhani` 600, 15px, uppercase, letter-spacing 0.06em, white
- **Right arrow icon** that translates +4px on hover
- **Shine sweep**: a 40%-wide white-gradient bar, skewed -20deg, animates from `left:-60%` to `left:120%` over 0.7s on hover
- Loading state: spinner replaces text, button stays disabled

**Form bottom (under button)**
- Centered, 18px margin-top, 13.5px `#64748B`
- "Nemaš nalog? **Registruj se**" / "Već imaš nalog? **Prijavi se**" — text-button switches `mode` state

**Language bar (footer)**
- Pinned at bottom, centered flex row, gap 6px, padding 16px 0 4px
- Each flag is a `<button>` with emoji (🇷🇸 🇬🇧 🇩🇪): 18px font, opacity 0.75 → 1 on hover
- Active: `--cyan` border + `box-shadow: 0 0 0 2px rgba(0,210,255,0.15)`, opacity 1

---

## Interactions & Behavior

- **Mode toggle**: bottom-of-form text button switches between `login` and `register` modes. Form fields/title/subtitle/CTA update; layout stays identical.
- **Language toggle**: clicking a flag updates `lang` state; all form copy re-renders via `T[lang]` dictionary. Only sr/en/de included.
- **Field focus**: border becomes cyan, icon becomes cyan, 4px outer ring + drop shadow appear; chevron on selects rotates 180°.
- **Custom select**: click trigger → dropdown opens below, exact same width/edges; click option → updates value, closes; click outside or press Esc → closes.
- **Password eye**: toggles input type between `password` ↔ `text`.
- **Form submit**: prevents default, sets `loading=true` for 1.4s (placeholder for API call). Replace with real API request.
- **Button shine**: 0.7s sweep on hover via `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Button arrow**: translates +4px on hover, 0.25s ease.
- **Checkbox**: pure CSS checked state with cyan fill + glow shadow.
- **Responsive**:
  - `≤ 900px`: stacks vertically (brand on top, ~280px min-height; form below)
  - `≤ 480px`: title shrinks to 26px

## State Management
```
mode:    'login' | 'register'              // form mode
lang:    'sr' | 'en' | 'de'                // current language; default 'sr'
data:    { klub, [ime, prezime,] email, password }   // controlled inputs per form
remember: boolean                          // login only
loading: boolean                           // submit-in-flight
showPass: boolean                          // password visibility per field
selectOpen: boolean                        // custom-select open state
```

The `T` dictionary in `form-panel.jsx` holds all translatable strings. Add a key, run through it for every supported language.

## Design Tokens

**Colors**
| Token | Hex | Use |
|---|---|---|
| `--cyan` | `#00D2FF` | primary accent, focus, button, links |
| `--cyan-dark` | `#0099C8` | button gradient end |
| `--cyan-bright` | `#2EE0FF` | button hover gradient start |
| `--copper` | `#C79F64` | tagline, brand divider, required asterisk |
| brand-bg-1 | `#0F2438` | left panel center |
| brand-bg-2 | `#0A1B2C` | left panel mid |
| brand-bg-3 | `#061320` | left panel edges |
| right-bg-base | `#F4F8FB → #ECF2F7` | right panel base gradient |
| right-bg-cyan-wash | `#EAF4FA` | top-left radial wash |
| right-bg-copper-wash | `#F2EBDD` | bottom-right radial wash |
| text-strong | `#1A2330` | titles, input text |
| text-muted | `#64748B` | subtitles |
| text-soft | `#475569` | checkbox label |
| text-placeholder | `#94A3B8` | placeholders, icons |
| border-rest | `#D6E0EA` | input border |
| border-hover | `#B5C6D6` | input hover border |
| border-soft | `#E2EAF2` | icon divider |
| white-translucent | `rgba(255,255,255,0.9)` | input background |

**Typography**
- `Orbitron` 600 — wordmark only
- `Rajdhani` 400/500/600/700 — UI text, titles, inputs, buttons
- `JetBrains Mono` — tagline only
- All loaded via Google Fonts in `<head>`

**Sizing**
- Title: 32px / 700
- Subtitle: 14px / 400
- Input text: 15px / 500
- Button: 15px / 600 uppercase
- Helper / link / checkbox: 13.5px

**Spacing**
- Form gap: 14px
- Header → form: 28px
- Title → subtitle: 4px
- Form-row → button: included in 14px gap, button has 10px extra `margin-top`
- Button → bottom link: 18px

**Radii**
- Inputs: 8px
- Buttons: 10px
- Checkbox: 4px
- Lang flag: 4px

**Shadows**
- Input focus: `0 0 0 4px rgba(0,210,255,0.12), 0 4px 14px rgba(0,210,255,0.08)`
- Button rest: `0 4px 14px rgba(0,210,255,0.35), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.25)`
- Button hover: `0 8px 24px rgba(0,210,255,0.5), 0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.35)`
- Checkbox checked: `0 2px 6px rgba(0,210,255,0.35)`
- Select dropdown: `0 8px 24px rgba(0,210,255,0.12), 0 4px 12px rgba(15,36,56,0.08)`

## Assets
- `assets/art-logo.png` (1005×944, transparent PNG) — official Aero Ring Tech logo. Use as-is; cyan glow is applied via CSS `filter: drop-shadow(...)`.
- Icons (Klub, Ime, Prezime, Email, Password, Eye, Check, Arrow) are inline SVGs defined in `form-panel.jsx`. Replace with the codebase's icon library if it has one (e.g. `lucide-react`, `heroicons`).

## Files in this bundle
| File | Purpose |
|---|---|
| `Aero Ring Tech Auth.html` | Entry point — fonts, root, script tags |
| `app.jsx` | Root `<App>` — state for `mode` and `lang`, language switcher, layout |
| `branding-panel.jsx` | Left brand panel |
| `form-panel.jsx` | Right form — TextField, SelectField (custom dropdown), Checkbox, Login/Register forms, T (translations) |
| `logo.jsx` | `<ARTLogo>` — wraps the PNG with glow filter |
| `styles.css` | All page styles |
| `tweaks-panel.jsx` | Editor-only tweaks panel — **delete in production** |
| `assets/art-logo.png` | Logo image |

## Implementation tips for Claude Code

1. **Pick the framework**: if the target repo already uses React, port the JSX directly into proper modules. For Next.js, this is a single page (`app/auth/page.tsx`). For Vue/Svelte/etc., translate the JSX one-to-one — logic is straightforward.
2. **Replace the inline `T` dictionary** with the codebase's existing i18n solution (e.g. `next-intl`, `react-i18next`, `vue-i18n`).
3. **Replace `setTimeout(1400)`** in form submit handlers with real API calls.
4. **Form validation**: not implemented in the prototype. Add per the codebase's validation pattern (e.g. `zod` + `react-hook-form`).
5. **Drop `tweaks-panel.jsx`** and the `<TweaksPanel>` block in `app.jsx` — they exist only for the design tool.
6. **Drop the `useTweaks` / TWEAK_DEFAULTS** logic in `app.jsx` and replace the inline `--cyan` etc. CSS-variable wiring with static values in CSS, unless theming is required.
7. **Custom select**: if a select library (e.g. Radix `<Select>`, Headless UI) is in use, use it for accessibility — keep the visual styling shown here.
8. **Accessibility checklist** (not all complete in the prototype):
   - Labels (currently placeholders only) — add proper `<label>` or `aria-label`
   - Error messages with `aria-describedby`
   - Focus trap inside modals (n/a here, but watch for the dropdown)
   - Keyboard nav for the custom select (↑/↓/Enter/Esc) — currently only Esc closes
9. **Real auth flow**: integrate with backend (sessions/JWT). The "Zapamti me" checkbox should drive cookie persistence.
