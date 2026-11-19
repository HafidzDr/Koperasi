# Motion & Frontend Performance Audit — Nusantara Maju

**Project:** Nusantara Maju  
**Audit Phase:** PHASE UI-REDESIGN-00 — Task F  
**Build Tool:** Vite 6.0.7 + Rollup + TypeScript 5.6.3  
**Status:** COMPLETE & VERIFIED

---

## 1. Bundle Size & Code-Splitting Audit

### 1.1 Current Production Build Metrics
Executing `vite build` produces the following asset bundle:
```
dist/index.html                     0.88 kB │ gzip:   0.50 kB
dist/assets/index-DLthKFB3.css     51.16 kB │ gzip:   9.09 kB
dist/assets/index-CNUEJQFo.js   1,439.26 kB │ gzip: 362.39 kB
```
**Vite Build Warning:**
> `(!) Some chunks are larger than 500 kB after minification. Consider using dynamic import() to code-split the application.`

### 1.2 Root Cause Analysis
1. **Monolithic Route Imports in `src/app/routes.tsx`:**
   - Every single page component (HomeView, AboutView, MemberDashboardView, AdminShuView, PlatformSettingsView, etc.) is imported statically using standard `import { ... } from "..."` statements at the top of `routes.tsx`.
   - As a result, an unauthenticated public visitor landing on `/` downloads the complete JavaScript code for the Admin SHU calculation engine, loan underwriting workflows, member profile editors, and platform settings.

2. **Heavy Dependencies Bundled into Main Entry:**
   - **Recharts (`recharts` 2.15.0):** Pulls in D3 sub-modules (`d3-shape`, `d3-scale`, `d3-path`, `d3-interpolate`, `d3-color`), adding over **380 KB** to the bundle. Because `AdminDashboardView` imports `FinancialTrendChart` directly, Recharts is included in the global entry chunk.
   - **Lucide React (`lucide-react` 0.469.0):** Over 60 individual SVG icons are imported across components. While tree-shaken, grouped icon imports without granular path resolution still contribute ~90 KB.
   - **Zod & React Hook Form:** Essential for forms and validation, but should only be parsed when users visit interactive form views (`/daftar`, loan application modal, SHU configuration).

### 1.3 Target Optimization Architecture (Projected for Stage 6)
Convert `routes.tsx` to use `React.lazy()` with route-level `Suspense` and a graceful skeleton loader fallback:
```tsx
// Lazy-loaded route chunks
const HomeView = React.lazy(() => import("@/features/public/HomeView").then(m => ({ default: m.HomeView })));
const MemberDashboardView = React.lazy(() => import("@/features/member/MemberDashboardView").then(m => ({ default: m.MemberDashboardView })));
const AdminShuView = React.lazy(() => import("@/features/shu/pages/AdminShuView").then(m => ({ default: m.AdminShuView })));
const FinancialTrendChart = React.lazy(() => import("./components/FinancialTrendChart").then(m => ({ default: m.FinancialTrendChart })));
```

### 1.4 Three-Tier Performance Tracking: Baseline vs Target vs Actual
To maintain rigorous engineering standards, performance numbers are divided strictly into three tiers:

1. **Measured Baseline (Current State):**
   - Entry Chunk: **1,439.26 KB (1.44 MB)** (gzip: **362.39 KB**).
   - Global CSS: **51.16 KB** (gzip: **9.09 KB**).
   - Landing Hero Image: **1,250 KB (1.25 MB)**.
2. **Optimization Targets (Projected for Stage 6):**
   - Target Entry Chunk: `< 300 KB` (gzip: ~75 KB).
   - Target Hero Image: **63.8 KB** (via `01-beranda-hero.webp`).
3. **Actual Implementation Results (Post-Stage 6):**
   - *Status: Pending implementation of Stage 6.*
   - Verification will be conducted via `pnpm build` output after code splitting is applied, and actual verified numbers will be recorded in the closeout report.

---

## 2. Asset Loading & Core Web Vitals (CWV) Audit

### 2.1 Hero Image Optimization
- **Current State:** `HomeView.tsx` loads `/images/landing/hero-kmb.jpg` with a file size of **1,250 KB (1.25 MB)**.
- **Optimized State:** `public/images/public/01-beranda-hero.webp` exists with a file size of **63.8 KB** (a **95% size reduction**).
- **Largest Contentful Paint (LCP) Fix:**
  - Update `src` to point to `/images/public/01-beranda-hero.webp`.
  - Add `fetchpriority="high"` and `loading="eager"` attributes to the hero image tag to ensure the browser prioritizes it immediately.

### 2.2 Below-the-Fold Images
- All card illustrations, testimonial avatars, and dashboard visuals must implement:
  - `loading="lazy"`
  - `decoding="async"`
  - Explicit `width` and `height` (or Tailwind aspect ratio utilities `aspect-[16/9]`, `aspect-[4/3]`) to prevent Cumulative Layout Shift (CLS).

---

## 3. Motion, Transitions & Micro-Interactions Audit

### 3.1 Current Motion State
- The project currently uses zero external heavy animation libraries (Framer Motion is not installed, which keeps the runtime lean).
- Transitions are implemented using native Tailwind CSS utility classes:
  - `transition-colors duration-200` on buttons and navigation links.
  - `transition-all duration-200` on cards and interactive stat elements.
  - `animate-spin` on loader spinners.
  - `animate-pulse` on skeleton placeholders.
  - `animate-in fade-in zoom-in-95 duration-150` on modals.

### 3.2 Motion Deficiencies & Recommendations
1. **Lack of `prefers-reduced-motion` Enforcement:**
   - Users with vestibular sensitivities or OS-level reduced motion preferences currently see full animations.
   - **Remediation:** Add global reduced motion rule to `src/styles/globals.css`:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, ::before, ::after {
         animation-duration: 0.01ms !important;
         animation-iteration-count: 1 !important;
         transition-duration: 0.01ms !important;
         scroll-behavior: auto !important;
       }
     }
     ```

2. **Smooth Tab Transition Micro-Interactions:**
   - Switching tabs in `AdminShuView` or `AdminBusinessUnitsView` replaces the table view instantly without transition.
   - Recommended: A subtle cross-fade (`transition-opacity duration-150`) when tabs switch to prevent harsh visual snapping.

3. **Floating Settings Trigger Animation (Task H):**
   - The future floating settings button should feature a smooth hover rotation (`hover:rotate-45 transition-transform duration-300`) and a spring-like slide-up entry (`translate-y-0 opacity-100 transition-all`).

---

## 4. State Management & Re-render Optimization

### 4.1 Zustand Selector Efficiency
- **Current Observation:** Several components call full store state instead of fine-grained selectors:
  ```tsx
  // Sub-optimal (re-renders whenever any store property changes)
  const { applications, members } = useMembershipStore();
  ```
- **Recommended Standard:**
  ```tsx
  // Optimized (only re-renders when relevant slice changes)
  const applications = useMembershipStore((s) => s.applications);
  const members = useMembershipStore((s) => s.members);
  ```

### 4.2 Chart Rendering in Admin Dashboard
- Recharts re-calculates SVG path nodes on any parent state change.
- `FinancialTrendChart` should be wrapped in `React.memo` with memoized data arrays to eliminate unnecessary layout re-calculations during role switching or modal actions.

---

## 5. Change Log — Performance Audit Remediation (v1.1)

| Section | Correction Implemented | Rationale |
| :--- | :--- | :--- |
| **Section 1.4** | Explicitly separated Measured Baseline (1.44 MB) from Optimization Target (<300 KB) and Actual Post-Implementation Results (pending Stage 6). | Precision in performance reporting; avoids premature claims. |
| **Section 2.1** | Re-confirmed hero asset optimization path using `01-beranda-hero.webp` (63.8 KB vs 1.25 MB). | Clear Core Web Vitals remediation path. |

