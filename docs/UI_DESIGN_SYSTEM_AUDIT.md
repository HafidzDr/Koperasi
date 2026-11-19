# Design System Audit & Component Token Analysis — Nusantara Maju

**Project:** Nusantara Maju  
**Audit Phase:** PHASE UI-REDESIGN-00 — Task E  
**Source Files Inspected:**
- `tailwind.config.js`
- `src/styles/globals.css`
- `src/components/ui/*.tsx`
- `src/components/common/*.tsx`  
**Status:** COMPLETE & VERIFIED

---

## 1. Design Token Architecture & Findings

### 1.1 Color Palette
The active Tailwind configuration (`tailwind.config.js`) defines two core brand scales and four semantic status scales:

#### A. Forest Palette (Primary Brand Identity)
```javascript
forest: {
  900: '#1B3320', // Deepest institutional pine - top banners, heavy brand headers
  800: '#24442B', // Hover states, solid primary buttons active
  700: '#2D5636', // Primary brand color - CTA buttons, active links, main icons
  600: '#386B43', // Focus rings, border accents, secondary actions
  500: '#468353', // Informational badges, decorative indicators
  100: '#EAF3EC', // Light tint - badge background, active tab pill
  50:  '#F4F8F5', // Ultra-soft tint - card header backgrounds, table row hover
}
```
- **Audit Evaluation:** The Forest palette provides strong contrast and professional warmth, perfectly aligned with the "Warm Modern Cooperative" direction.
- **Inconsistencies Found:** Some inline Tailwind classes in `HomeView.tsx` use arbitrary green values (e.g. `bg-emerald-600` or `lime-400` in user-uploaded media) rather than tokenized `forest-*` classes. All greens must be normalized to the `forest-*` token family.

#### B. Ink Palette (Warm Grayscale)
```javascript
ink: {
  900: '#161616', // Primary text, headings (Warm near-black)
  800: '#262626', // Body copy, dark buttons
  700: '#404040', // Secondary copy, table headers, labels
  600: '#525252', // Muted text, descriptions
  500: '#686868', // Helper text, placeholder icons
  300: '#D4D4D4', // Strong borders, divider lines
  200: '#E5E5E5', // Standard card borders, table dividers
  100: '#F5F4F0', // Warm off-white / light cream - table headers, input disabled
  50:  '#FAF9F6', // Page background - warm cream canvas
}
```
- **Audit Evaluation:** Warm white (`ink-50` #FAF9F6) and warm cream (`ink-100` #F5F4F0) give the platform an organic, editorial paper feel.
- **Inconsistencies Found:** Certain components default to pure cold white (`#FFFFFF`) with harsh pure gray borders (`gray-200`) instead of tokenized `ink-200` and `ink-50`.

#### C. Semantic Status Scales
```javascript
success: { 700: '#1C5430', base: '#2D7A46', 100: '#E6F4EA' },
warning: { 700: '#6B4700', base: '#B45309', 100: '#FEF3D6' },
danger:  { 700: '#7F1D1D', base: '#B91C1C', 100: '#FEE2E2' },
info:    { 700: '#1E3A5F', base: '#2563EB', 100: '#E8F0FE' }
```
- **Audit Evaluation:** Clear, accessible contrast with distinct 700 (text), base (border), and 100 (background) tokens.

---

### 1.2 Typography System

```css
fontFamily: {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
}
```
- **Body & Headings:** `Inter` loaded via system font stack with OpenType font-feature-settings: `"cv02", "cv03", "cv04", "cv11"` enabled in `src/styles/globals.css`.
- **Numerical Formatting (`tabular-nums`):** Utility `.tabular-nums` enforces `font-variant-numeric: tabular-nums` for consistent column alignment in financial tables, dates, and ID codes.
- **Typography Inconsistencies:**
  - Headings across views vary: some pages use `text-2xl font-bold tracking-tight`, while others use `text-xl font-semibold`.
  - Subtitle copy alternates between `text-xs text-ink-500` and `text-sm text-ink-600`.
  - The redesign must establish strict typography scales (`PageHeader`: `text-2xl font-bold tracking-tight text-ink-900`, `CardTitle`: `text-base font-semibold text-ink-900`).

---

### 1.3 Elevation & Shadows

```javascript
boxShadow: {
  subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm:     '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  md:     '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
}
```
- **Audit Evaluation:** Subtle and restrained. No excessive heavy dropshadows.
- **Inconsistencies:** The Floating Fill navbar uses `shadow-md shadow-ink-950/5`, whereas standard cards in Member Portal use `shadow-subtle`. Some modals use un-tokenized Tailwind `shadow-lg` or `shadow-xl`.

---

### 1.4 Corner Radii Standards

| Token | Radius Value | Current Usage | Standardized Redesign Target |
| :--- | :---: | :--- | :--- |
| `rounded` / `rounded-sm` | 4px | Small badges, code tags | Inline code, tiny tag indicators |
| `rounded-md` | 6px | Buttons, Inputs, Selects, Table containers | Buttons, form inputs, table corners |
| `rounded-lg` | 8px | Standard Cards, Modals, Empty states | Standard Cards, Modals, StatCards |
| `rounded-xl` | 12px | Profile teaser card, Welcome banners | Hero cards, feature banners, callouts |
| `rounded-2xl` | 16px | Floating Fill Navbar | Floating Navbar, Floating Settings trigger |
| `rounded-full` | 9999px | Avatars, Status dots, Pill badges | Avatars, dot indicators, floating action buttons |

---

## 2. Component-by-Component Audit

### 2.1 Buttons (`Button.tsx`)
- **Implemented Variants:** `primary`, `secondary`, `outline`, `neutral`, `ghost`, `danger`.
- **Sizes:** `sm` (h-8), `md` (h-10), `lg` (h-12).
- **Audit Findings:**
  - Highly robust: includes `leftIcon`, `rightIcon`, `isLoading` with `Loader2` spinner, and disabled states.
  - Consistent focus ring: `focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-1`.
  - Issue: Certain feature pages render inline `<button>` tags with manual classes instead of using `<Button />` (e.g. `DemoRoleSwitcher`, tab triggers in `Tabs.tsx`).

### 2.2 Cards (`Card.tsx`)
- **Implemented Parts:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **Audit Findings:**
  - Clean compound component structure.
  - Issue: Card header borders (`border-b border-ink-100`) and footers (`bg-ink-50/50 rounded-b-lg`) are omitted in some pages where authors applied raw `<div className="bg-white border rounded-lg p-5">` without using `Card` primitives.

### 2.3 Form Controls (`Input.tsx`, `Select.tsx`, `Checkbox.tsx`, `Textarea.tsx`)
- **Audit Findings:**
  - Strict accessibility: `useId` integration for `htmlFor` and `id`, `aria-invalid`, `aria-describedby` linking to error and helper texts.
  - Left and right addon slots for currency labels (`Rp`) and search icons.
  - Issue: Date inputs in savings and loan filter bars sometimes use raw browser styles without `Input` container padding.

### 2.4 Data Tables (`Table.tsx`)
- **Implemented Parts:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.
- **Audit Findings:**
  - Responsive horizontal scrolling wrapper (`overflow-x-auto rounded-lg border border-ink-200`).
  - Table headers use `bg-ink-100 uppercase tracking-wider text-[11px] font-semibold`.
  - Issue: On mobile screens (<640px), dense 6-8 column tables require horizontal scrolling. Mobile views would benefit from responsive stacked card views for transactions and member lists.

### 2.5 Badges & Status Indicators (`Badge.tsx`, `StatusBadge.tsx`)
- **Implemented Variants:** `success`, `warning`, `danger`, `info`, `neutral`, `forest`.
- **Audit Findings:**
  - `StatusBadge` provides extensive mapping for 20+ financial and workflow statuses (`aktif`, `lunas`, `menunggu`, `diajukan`, `ditolak`, `terlambat`, etc.).
  - Dot indicators (`dot={true}`) provide clear visual status at a glance.

### 2.6 Modal & Dialogs (`Modal.tsx`, `Drawer.tsx`)
- **Audit Findings:**
  - Accessible: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`.
  - Escape key listener, backdrop click dismiss, body overflow scroll-lock.
  - Issue: Drawer sliding animation is basic; modal entry animation uses Tailwind `zoom-in-95` which can feel abrupt without fine-tuned ease-out bezier curves.

---

## 3. Inconsistency Catalog & Remediation Strategy

| UI Area | Current Inconsistency | Recommended Unified Standard |
| :--- | :--- | :--- |
| **Top Context Bar** | Dark green full-width bar at top of all layouts | Remove top bar; replace with bottom-right floating gear button |
| **Navbar Styling** | Public uses Floating Fill; Member/Admin use fixed sidebar | Retain sidebar in portals; align sidebar card and border tokens with Public |
| **Table Headers** | Admin tables use dark ink headers; Member tables use white | Unify all tables to clean warm header: `bg-ink-100/70 text-ink-700 font-semibold` |
| **Stat Cards** | Uniform prominence across all 4 metrics | Introduce primary vs secondary StatCard hierarchy (featured metric with forest accent) |
| **Button Instances** | Mixed usage of `<Button>` component and raw HTML `<button>` | Replace all custom buttons with standardized `<Button variant="..." size="...">` |
| **Heading Sizes** | Page titles range from `text-xl` to `text-3xl` | Standardize PageHeader: `text-2xl font-bold tracking-tight text-ink-900` |
| **Asset Usage** | Eager 1.25MB JPG hero on public landing page | Switch to 63KB WebP asset (`01-beranda-hero.webp`) with lazy loading elsewhere |

---

## 4. Floating Settings Controller Design & Authorization Model (Task H)

### 4.1 Component Architecture
- **Trigger Element:** Pinned at `fixed bottom-5 right-5 z-50` with high elevation (`shadow-md shadow-ink-950/10`), circular pill shape (`rounded-full p-3`), and smooth hover rotation feedback (`transition-transform duration-300 hover:rotate-45`).
- **Panel Surface:** Modern slide-out drawer or modal with warm white surface (`bg-white border border-ink-200 rounded-2xl shadow-xl`), styled consistently with the Warm Modern Cooperative aesthetic.

### 4.2 Strict Authorization Invariant
Opening the floating settings panel does **NOT** grant any additional privileges or bypass authorization. All internal actions strictly enforce existing RBAC permissions:
1. **Role / Context Switching:** Available to all users for demo exploration.
2. **Business Module Toggles:** Strictly guarded by `canPerformAction(currentRole, "platform_config", "update")`. Only `super_admin` can toggle modules; unauthorized roles see disabled toggles and receive an SoD rejection notice.
3. **Demo Data Reset:** Strictly guarded by `canPerformAction(currentRole, "demo_tools", "reset_demo")`. Only `super_admin` can trigger reset; unauthorized roles see disabled buttons.

---

## 5. Change Log — Design System Remediation (v1.1)

| Section | Correction Implemented | Rationale |
| :--- | :--- | :--- |
| **Section 1.1** | Re-confirmed brand identity strictly as **Nusantara Maju**; barred "PT" or "Koperasi" from logo and identity tokens. | Brand consistency compliance. |
| **Section 3** | Reconciled inconsistency table to strictly separate visual styling from functional data changes. | Preservation of business logic boundaries. |
| **Section 4** | Added dedicated Floating Settings Controller design specifications and strict authorization model. | Authorization and SoD compliance for Task H. |

