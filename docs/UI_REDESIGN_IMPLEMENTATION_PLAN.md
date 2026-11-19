# UI/UX Redesign Staged Implementation Plan — Nusantara Maju

**Project:** Nusantara Maju  
**Audit Phase:** PHASE UI-REDESIGN-00 — Task 12  
**Implementation Direction:** Warm Modern Cooperative — Nusantara Maju  
**Prerequisite:** Full audit completion and explicit user approval  
**Status:** DRAFT PLAN — AWAITING EXPLICIT USER APPROVAL TO BEGIN STAGE 1

---

## 1. Implementation Phasing Strategy

The complete application redesign is structured into **7 sequential, test-gated stages**. This dependency-ordered pipeline ensures that foundational tokens and shared primitives are perfected first, navigation and controls are streamlined second, and portal views are redesigned systematically without breaking existing business logic or failing regression tests.

```
+-----------------------------------------------------------------------------------------+
|                              7-STAGE REDESIGN PIPELINE                                  |
+-----------------------------------------------------------------------------------------+
| Stage 1: Design Tokens & Foundational UI Components                                     |
|    |                                                                                    |
|    v                                                                                    |
| Stage 2: Navigation Systems & Floating Settings Controller (Task H Implementation)      |
|    |                                                                                    |
|    v                                                                                    |
| Stage 3: Public Website Redesign & Asset Integration (6 active pages)                   |
|    |                                                                                    |
|    v                                                                                    |
| Stage 4: Member Portal Redesign & Asset Integration (6 active pages)                    |
|    |                                                                                    |
|    v                                                                                    |
| Stage 5: Administration Portal Redesign & Asset Integration (8 active pages / 6 sub-tabs)|
|    |                                                                                    |
|    v                                                                                    |
| Stage 6: Motion, Code-Splitting & Frontend Performance Optimization                     |
|    |                                                                                    |
|    v                                                                                    |
| Stage 7: Comprehensive Responsive, Accessibility & Regression Verification              |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Stage Breakdown & Specifications

### Stage 1: Design Tokens & Foundational UI Components

- **Objective:** Establish the unified "Warm Modern Cooperative" design system tokens and upgrade shared UI primitives (`Card`, `Button`, `Input`, `Select`, `Table`, `Badge`, `Modal`, `StatCard`, `Drawer`, `EmptyState`, `PageHeader`).
- **Scope:**
  - Standardize `tailwind.config.js` color tokens (`forest-*`, `ink-*`, semantic scales), border radii, and soft shadows.
  - Refactor `Card` to support clean sub-components with optional warm header tints and subtle borders.
  - Standardize `StatCard` to support visual hierarchy (primary/featured metrics vs secondary metrics).
  - Modernize `Table` headers with soft warm backgrounds (`bg-ink-100/70`) and crisp typography.
  - Enhance `Button` with refined hover transitions, active states, and focus rings.
- **Affected Files:**
  - `tailwind.config.js`
  - `src/styles/globals.css`
  - `src/components/ui/Button.tsx`
  - `src/components/ui/Card.tsx`
  - `src/components/ui/StatCard.tsx`
  - `src/components/ui/Table.tsx`
  - `src/components/ui/Input.tsx`
  - `src/components/ui/Select.tsx`
  - `src/components/ui/Badge.tsx`
  - `src/components/ui/StatusBadge.tsx`
  - `src/components/ui/Modal.tsx`
  - `src/components/ui/PageHeader.tsx`
- **Dependencies:** None (Foundation stage).
- **Potential Regression Risks:**
  - CSS class collisions or broken layout widths if input/button heights change unexpectedly.
- **Required Tests & Verification:**
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test` (All 330 tests must pass).
- **Acceptance Criteria:**
  - All shared UI primitives render cleanly with tokenized warm colors and consistent borders.
  - Zero TypeScript or linting errors.

---

### Stage 2: Navigation Systems & Floating Settings Controller (Task H)

- **Objective:** Remove the persistent top green demo bar (`DemoRoleSwitcher`) from page headers and introduce an elegant **Floating Settings Button** in the bottom-right corner that triggers a slide-out Governance & Role Switcher Panel.
- **Scope:**
  - Create `src/components/common/FloatingSettingsController.tsx` (pinned at `fixed bottom-5 right-5 z-50`).
  - Slide-out panel features:
    - DEMO Environment indicator & active role identity.
    - Role Switcher (8 Authenticated Roles + 2 Public Contexts) with full RBAC preservation.
    - Business Module Management (toggle module activation if authorized).
    - Demo Data Reset (if role is Super Admin).
  - **Strict Authorization & Permission Governance Model:**
    - *Role / Context Switching:* Unrestricted public prototype capability allowing reviewers to test different personas.
    - *Module Activation / Deactivation:* Strictly protected; requires `platform_config:update` permission (restricted to `super_admin`). Disabled with tooltip for unauthorized roles.
    - *System Configuration Changes:* Strictly protected; requires `platform_config:update` permission.
    - *Demo Data Reset:* Destructive action; strictly requires `demo_tools:reset_demo` permission (`super_admin` only) and confirmation modal.
    - *Zero Privilege Escalation Invariant:* Simply opening or viewing the Floating Settings panel grants ZERO additional permissions. Active session RBAC rules (`canPerformAction`, `canAccessRoute`) remain in full effect.
  - Remove `<DemoRoleSwitcher />` from `PublicLayout.tsx`, `MemberLayout.tsx`, and `AdminLayout.tsx`.
  - Refine `PublicLayout`'s Floating Fill navbar to seamlessly occupy the top viewport without top-bar gap adjustments.
  - Modernize `MemberLayout` and `AdminLayout` sidebars: clean background, improved mobile drawer transitions, and responsive collapsing.
- **Affected Files:**
  - `src/components/common/FloatingSettingsController.tsx` (New component replacing top bar)
  - `src/components/common/DemoRoleSwitcher.tsx` (Deprecated or repurposed as panel interior)
  - `src/layouts/PublicLayout.tsx`
  - `src/layouts/MemberLayout.tsx`
  - `src/layouts/AdminLayout.tsx`
- **Dependencies:** Stage 1 (Buttons, Badges, Modals/Drawers).
- **Potential Regression Risks:**
  - Role switching not triggering router navigation or toast notifications properly.
  - Clicks blocked by floating button z-index.
- **Required Tests & Verification:**
  - `src/tests/rbac.test.ts`
  - `src/tests/menuVisibility.test.ts`
  - Manual verification of role switching and module toggling.
- **Acceptance Criteria:**
  - Zero top bar clutter across all layouts.
  - Floating settings button accessible on all viewports without obscuring primary page actions.
  - 100% role switching and permission fidelity preserved.

---

### Stage 3: Public Website Redesign & Visual Asset Integration

- **Objective:** Redesign the Public Website pages using editorial layouts and integrated WebP assets from `public/images/public/`.
- **Scope:**
  - **Beranda (`HomeView.tsx`):**
    - Replace heavy 1.25MB JPG with lightweight `01-beranda-hero.webp` (63 KB).
    - Integrate `03-simpanan.webp` into savings preview tab.
    - Integrate `04-pinjaman.webp` into loan simulation calculator card.
    - Integrate `08-nilai-bersama.webp`, `09-kolaborasi-anggota.webp`, and `10-tumbuh-bersama.webp`.
    - Polish benefit row, stat cards, testimonials, and FAQ accordion.
  - **Tentang (`AboutView.tsx`):**
    - Integrate `02-tentang-nusantara-maju.webp`.
    - Redesign institutional profile, legal cards, and organizational hierarchy.
  - **Katalog Simpanan (`PublicSavingsCatalogView.tsx`):**
    - Integrate `03-simpanan.webp`.
    - Enhance deposit product cards, interactive yield calculator, and security badges.
  - **Katalog Pinjaman (`PublicLoanCatalogView.tsx`):**
    - Integrate `04-pinjaman.webp`.
    - Redesign loan comparison table and eligibility criteria checklist.
  - **Pendaftaran Wizard (`RegistrationWizardView.tsx`):**
    - Integrate `05-cara-bergabung.webp` into desktop stepper rail.
    - Smooth 4-step wizard with real-time form validation.
  - **Lacak Status (`ApplicationTrackingView.tsx`):**
    - Integrate `06-lacak-status.webp`.
    - Polish search card and chronological application milestone timeline.
- **Affected Files:**
  - `src/features/public/HomeView.tsx`
  - `src/features/public/AboutView.tsx`
  - `src/features/savings/pages/PublicSavingsCatalogView.tsx`
  - `src/features/loans/pages/PublicLoanCatalogView.tsx`
  - `src/features/public/RegistrationWizardView.tsx`
  - `src/features/membership/pages/ApplicationTrackingView.tsx`
- **Dependencies:** Stage 1 & Stage 2.
- **Potential Regression Risks:**
  - Breaking loan calculator formula or registration submission state machine.
- **Required Tests & Verification:**
  - `src/tests/membership.test.ts`
  - `src/tests/loanCalculations.test.ts`
  - `src/tests/loanComponents.test.tsx`
- **Acceptance Criteria:**
  - All public pages render with high aesthetic polish and consistent typography.
  - Hero image LCP improved significantly via WebP adoption.
  - All interactive calculators and registration workflows function flawlessly.

---

### Stage 4: Member Portal Redesign & Visual Asset Integration

- **Objective:** Redesign the Member Portal to provide an intuitive, high-trust digital banking experience with integrated WebP assets from `public/images/dashboard/`.
- **Scope:**
  - **Member Dashboard (`MemberDashboardView.tsx`):**
    - Integrate `01-dashboard-anggota-hero.webp` in welcome header.
    - Introduce hierarchical stat cards (highlighting next due installment and total savings).
    - Modernize recent transaction history visual layout (Retain existing static presentation; data-source binding is preserved as-is and flagged as a separate functional task).
  - **Member Profile (`MemberProfilePortalView.tsx`):**
    - Integrate `03-anggota-profil.webp`.
    - Design an institutional Digital Member Card with official cooperative seal and QR placeholder.
  - **Member Simpanan (`MemberSavingsPortalView.tsx`):**
    - Integrate `04-simpanan-ilustrasi.webp`.
    - Redesign pocket breakdown cards (Pokok, Wajib, Sukarela, Berjangka).
    - Polish deposit and withdrawal modal dialogs.
  - **Member Pinjaman & Angsuran (`MemberLoanPortalView.tsx`):**
    - Integrate `05-pinjaman-ilustrasi.webp` and `06-angsuran-ilustrasi.webp`.
    - Redesign active loan cards with visual progress rings or bars.
    - Enhance installment payment modal with payment receipt simulation.
  - **Member SHU (`MemberShuPortalView.tsx`):**
    - Integrate `07-shu-ilustrasi.webp`.
    - Clarify personal dividend projection cards (Jasa Modal vs Jasa Usaha breakdown).
  - **Member Unit Usaha (`MemberBusinessUnitsView.tsx`):**
    - Integrate `08-unit-usaha-ilustrasi.webp`.
    - Display personal economic participation records with privacy isolation.
- **Affected Files:**
  - `src/features/member/MemberDashboardView.tsx`
  - `src/features/membership/pages/MemberProfilePortalView.tsx`
  - `src/features/savings/pages/MemberSavingsPortalView.tsx`
  - `src/features/loans/pages/MemberLoanPortalView.tsx`
  - `src/features/shu/pages/MemberShuPortalView.tsx`
  - `src/features/business-units/pages/MemberBusinessUnitsView.tsx`
- **Dependencies:** Stage 1, 2, and 3.
- **Potential Regression Risks:**
  - Violating actor privacy in member economic participation or loan account queries.
- **Required Tests & Verification:**
  - `src/tests/memberProfilePortal.test.tsx`
  - `src/tests/savingsPortal.test.tsx`
  - `src/tests/loanRbacAndPrivacy.test.ts`
  - `src/tests/businessUnitsComponents.test.tsx`
- **Acceptance Criteria:**
  - Member experience feels cohesive, modern, and trustworthy.
  - Zero cross-member data leakage.
  - All member financial actions (deposits, repayments, loan requests) execute cleanly.

---

### Stage 5: Administration Portal Redesign & Visual Asset Integration

- **Objective:** Redesign the Administration Portal across all 8 active administration pages into a high-density, high-efficiency workstation for Staff, Finance Officers, Managers, Auditors, and Super Administrators.
- **Scope (8 Active Administration Pages):**
  - **Admin Dashboard (`AdminDashboardView.tsx`):**
    - Integrate `02-dashboard-admin-hero.webp` in executive overview banner.
    - Role-adaptive action queues (Verification tasks for Staff, Approvals for Manager, Reconciliations for Finance).
    - Memoized and responsive `FinancialTrendChart`.
  - **Member Verification (`MemberVerificationView.tsx`):**
    - Integrate `09-keanggotaan-ilustrasi.webp`.
    - Two-column workstation: applicant list on left, document inspection viewer & SoD decision panel on right.
  - **Member Directory (`MemberListView.tsx`):**
    - Dense data table with search, status filters, and member detail sheet.
  - **Admin Simpanan (`AdminSavingsManagementView.tsx`):**
    - Integrate `04-simpanan-ilustrasi.webp`.
    - Tabbed view separating Pending Approvals Queue from Historical Mutation Ledger.
  - **Admin Pinjaman (`AdminLoanManagementView.tsx`):**
    - Integrate `05-pinjaman-ilustrasi.webp` and `06-angsuran-ilustrasi.webp`.
    - 3-stage underwriting review cards with clear role-based action buttons.
  - **Admin Unit Usaha (`AdminBusinessUnitsView.tsx`):**
    - Integrate `08-unit-usaha-ilustrasi.webp`.
    - Tabbed layout: Portofolio Unit, Pencatatan Aktivitas, and Rekapitulasi Kinerja.
  - **Admin SHU Workflow (`AdminShuView.tsx`):**
    - Integrate `07-shu-ilustrasi.webp`.
    - Polish 6-tab navigation (Overview, Periode, Konfigurasi, Perhitungan, Pemeriksaan, Riwayat).
    - Clear visual feedback for 100% allocation invariant enforcement.
  - **Pengaturan Platform (`PlatformSettingsView.tsx`):**
    - Integrate `12-pengaturan-rbac.webp`.
    - Grouped settings cards (Identitas Koperasi, Parameter Keuangan, Modul Bisnis, Zona Bahaya / Reset Demo).
- **Affected Files:**
  - `src/features/admin/AdminDashboardView.tsx`
  - `src/features/admin/MemberVerificationView.tsx`
  - `src/features/membership/pages/MemberListView.tsx`
  - `src/features/savings/pages/AdminSavingsManagementView.tsx`
  - `src/features/loans/pages/AdminLoanManagementView.tsx`
  - `src/features/business-units/pages/AdminBusinessUnitsView.tsx`
  - `src/features/shu/pages/AdminShuView.tsx`
  - `src/features/admin/PlatformSettingsView.tsx`
- **Dependencies:** Stage 1, 2, 3, and 4.
- **Potential Regression Risks:**
  - Breaking multi-stage SoD approval workflows or SHU 100% allocation math.
- **Required Tests & Verification:**
  - `src/tests/savingsAdmin.test.tsx`
  - `src/tests/loanLifecycle.test.ts`
  - `src/tests/loanDisbursementAndInstallments.test.ts`
  - `src/tests/shuComponents.test.tsx`
  - `src/tests/shuLifecycleAndSoD.test.ts`
  - `src/tests/platformSettings.test.tsx`
- **Acceptance Criteria:**
  - Workstation density allows rapid review of queues.
  - All administrative approvals and mutations pass SoD checks.
  - Tables maintain 100% data fidelity with zero horizontal overflow.

---

### Stage 6: Motion, Code-Splitting & Performance Optimization

- **Objective:** Optimize bundle sizes, implement route-level code splitting, configure lazy loading, and fine-tune subtle motion and transitions.
- **Scope:**
  - Refactor `src/app/routes.tsx` to use `React.lazy()` for all 20 unique active page views and the placeholder module view across all 34 route paths, wrapped in `<Suspense fallback={<LoadingState />}>`.
  - Lazy load `FinancialTrendChart` (and Recharts) dynamically so public visitors download zero chart library bytes.
  - Add global `prefers-reduced-motion` styles in `src/styles/globals.css`.
  - Add smooth cross-fade tab transitions on multi-tab views.
  - Ensure all below-the-fold images have `loading="lazy"` and `decoding="async"`.
- **Affected Files:**
  - `src/app/routes.tsx`
  - `src/styles/globals.css`
  - `src/features/admin/AdminDashboardView.tsx`
  - `src/features/admin/components/FinancialTrendChart.tsx`
- **Dependencies:** Stages 1 through 5.
- **Potential Regression Risks:**
  - Flash of unstyled content (FOUC) or route loading flickers if Suspense fallbacks are poorly styled.
- **Required Tests & Verification:**
  - `pnpm build` (Measure production build chunks against optimization target).
  - Vitest test suite (All 330 tests pass).
- **Performance Targets & Baseline:**
  - **Measured Baseline:** Total JS 1,439.26 KB (monolithic entry bundle), CSS 51.16 KB.
  - **Optimization Target:** Primary entry chunk < 300 KB (via `React.lazy()` route splitting and dynamic chart imports).
  - **Actual Results:** To be measured and recorded only after Stage 6 production build execution.
- **Acceptance Criteria:**
  - Primary entry bundle meets target of <300 KB upon Stage 6 build verification.
  - Zero build warnings for large chunks.
  - Respects OS-level reduced-motion settings.

---

### Stage 7: Comprehensive Responsive, Accessibility & Regression Verification

- **Objective:** Final verification pass across all 16 responsive viewports (320px to 1920px), automated test execution, accessibility contrast validation, and final screenshot updates.
- **Scope:**
  - Run full test suite (`pnpm test` -> 330 tests).
  - Run TypeScript typecheck (`pnpm typecheck` -> 0 errors).
  - Run ESLint (`pnpm lint` -> 0 warnings).
  - Run `node scripts/verify_responsive.js` across all 16 breakpoints (320x640, 375x667, 390x844, 768x1024, 1024x768, 1280x800, 1440x900, 1920x1080) for Public and Portal pages.
  - Regenerate proposal deck and marketing screenshots in `docs/screenshots/` and `public/screenshots/`.
- **Affected Files:**
  - `docs/screenshots/*`
  - `public/screenshots/*`
- **Dependencies:** All previous stages complete.
- **Potential Regression Risks:** None (Verification stage).
- **Required Tests & Verification:**
  - Complete automated test suite.
  - `node scripts/verify_responsive.js` report outputting 16/16 PASS.
- **Acceptance Criteria:**
  - 100% test pass rate (330/330).
  - 0 horizontal overflow and 0 element clipping on any viewport from 320px to 1920px.
  - Zero TypeScript or lint errors.
  - Fully cohesive visual language across Public Website, Member Portal, and Admin Portal.

---

## 3. Governance & Approval Gate

> [!IMPORTANT]
> **NO REDESIGN CODE WILL BE WRITTEN UNTIL THIS AUDIT AND IMPLEMENTATION PLAN ARE EXPLICITLY APPROVED BY THE USER.**  
> Upon approval, work will proceed strictly one stage at a time, running quality gates and verification after each stage before advancing to the next.

---

## 4. Change Log — Implementation Plan Remediation (v1.1)

| Stage / Section | Correction Implemented | Rationale |
| :--- | :--- | :--- |
| **Pipeline Diagram & Stage 5** | Explicitly enumerated all 8 active administration pages and reconciled 6 SHU sub-tabs. | Eliminates page count ambiguity; aligns with actual route inventory. |
| **Stage 2** | Added strict authorization model for Floating Settings Controller: public demo role switching vs protected module toggling (`platform_config:update`) and demo reset (`demo_tools:reset_demo`). | Preserves RBAC and SoD security invariants; opening the panel grants zero elevated permissions. |
| **Stage 4** | Clarified Member Dashboard transaction history boundary: visual redesign only, preserving existing mock/static data without unapproved store-binding refactors. | Enforces strict separation of visual vs functional scope. |
| **Stage 6** | Reconciled route splitting for 20 unique active pages + 1 placeholder component (34 total routes) and distinguished measured baseline from optimization target (<300 KB). | Accurate code-splitting plan and realistic performance tracking. |
| **Global** | Re-confirmed brand identity as "Nusantara Maju" throughout plan. | Enforces strict brand consistency. |
