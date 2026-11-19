# Complete Application Page Inventory — Nusantara Maju

**Project:** Nusantara Maju  
**Audit Phase:** PHASE UI-REDESIGN-00 — Task B (Remediated)  
**Router Source:** `src/app/routes.tsx`  
**Total Route Paths:** 34 Registered Paths (+1 Wildcard Fallback `*`)  
**Active Unique Page Components Scheduled for Visual Redesign:** 20 Page Components  
**Placeholder Module Endpoints:** 9 Endpoints  
**Dedicated Sub-Tab Endpoints:** 6 Endpoints  
**Status:** RECONCILED & COMPLETE — AWAITING STAGE 1 APPROVAL

---

## 1. Reconciled Route & Component Summary Table

| Category | Registered Route Paths | Unique Active Page Components | Dedicated Sub-Tab Endpoints | Placeholder Module Endpoints | Primary Layout Wrapper |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **A. Public Website** | 8 | 6 | 0 | 2 | `PublicLayout` |
| **B. Member Portal** | 9 | 6 | 0 | 3 | `MemberLayout` (`RouteGuard`) |
| **C. Admin Portal** | 17 | 8 | 6 (under `/admin/shu/*`) | 4 | `AdminLayout` (`RouteGuard`) |
| **Total Platform** | **34** | **20** | **6** | **9** | **3 Core Layouts** |

*Note: In addition to the 34 registered paths, `routes.tsx` specifies a catch-all wildcard `*` routing to `<Navigate to="/" replace />`.*

---

## 2. A. Public Website Routes (`PublicLayout`)

### 2.1 Beranda (Landing Page)
- **Path:** `/`
- **Component:** `HomeView.tsx` (`src/features/public/HomeView.tsx`)
- **Layout:** `PublicLayout` (Floating Fill navbar + Public footer)
- **Navigation Entry:** Navbar "Beranda" (Active root link), Brand logo click
- **Permitted Roles:** All (`public_visitor`, `applicant`, `member`, `staff`, `finance`, `manager`, `super_admin`, `auditor`)
- **Main UI Components:**
  - Hero section with background photography and high-contrast typography.
  - Interactive Benefit Row (3 feature pillars).
  - Stat Highlights (4 metrics with DEMO synthetic badges).
  - Interactive Savings Product Cards & Tabbed View.
  - Interactive Loan Simulation Calculator with dynamic flat interest estimation.
  - 7 Prinsip Koperasi Showcase.
  - Member Testimonials Carousel / Grid.
  - Accordion FAQ Section.
  - Final Membership CTA Banner.
- **Visual Redesign Focus:**
  - Replace uncompressed 1.25MB JPG (`/images/landing/hero-kmb.jpg`) with optimized 63.8KB WebP (`01-beranda-hero.webp`).
  - Seamless floating navbar clearance without top bar gap displacement.
- **Relevant Image Assets:**
  - `public/images/public/01-beranda-hero.webp` (Hero)
  - `public/images/public/08-nilai-bersama.webp` (7 Prinsip)
  - `public/images/public/09-kolaborasi-anggota.webp` (Testimonials)
  - `public/images/public/10-tumbuh-bersama.webp` (Final CTA)
- **Functional Interactions (Preserved Without Logic Changes):**
  - Live loan simulation slider/input recalculating monthly installment, total interest, admin fee, and net disbursement.
  - Accordion FAQ toggle state.

---

### 2.2 Tentang Nusantara Maju (Institutional Profile)
- **Path:** `/tentang`
- **Component:** `AboutView.tsx` (`src/features/public/AboutView.tsx`)
- **Layout:** `PublicLayout`
- **Navigation Entry:** Navbar "Tentang Koperasi"
- **Permitted Roles:** All roles
- **Main UI Components:**
  - Institutional Header & Mission statement.
  - Legal & Governance Card (AHU, NIKOP, establishment date, registered domicile).
  - Strategic Vision & Mission 3 Pillars.
  - Organizational Structure Cards (Pengurus, Pengawas, Pengelola).
  - Operational Principles Grid.
- **Visual Redesign Focus:** Card elevation, visual anchors, and editorial typography.
- **Relevant Image Assets:**
  - `public/images/public/02-tentang-nusantara-maju.webp`
- **Functional Interactions:** Static institutional display.

---

### 2.3 Katalog Simpanan
- **Path:** `/layanan/simpanan`
- **Component:** `PublicSavingsCatalogView.tsx` (`src/features/savings/pages/PublicSavingsCatalogView.tsx`)
- **Layout:** `PublicLayout`
- **Navigation Entry:** Navbar "Simpanan" (Conditional on `config.activeModules.savings`)
- **Permitted Roles:** All roles
- **Main UI Components:**
  - Header with statutory disclaimer banner.
  - Product Grid (Simpanan Pokok, Simpanan Wajib, Simpanan Sukarela, Simpanan Berjangka).
  - Interactive Deposit Yield Calculator.
  - FAQ and Security Information (Fail-Closed, SoD).
- **Visual Redesign Focus:** Card contrast, input slider styling, and pocket badge hierarchy.
- **Relevant Image Assets:**
  - `public/images/public/03-simpanan.webp`
- **Functional Interactions (Preserved):** Deposit yield simulation calculation.

---

### 2.4 Katalog Pinjaman
- **Path:** `/layanan/pinjaman`
- **Component:** `PublicLoanCatalogView.tsx` (`src/features/loans/pages/PublicLoanCatalogView.tsx`)
- **Layout:** `PublicLayout`
- **Navigation Entry:** Navbar "Pinjaman" (Conditional on `config.activeModules.loans`)
- **Permitted Roles:** All roles
- **Main UI Components:**
  - Loan Product Catalog (Pinjaman Modal Usaha Produktif, Pinjaman Multiguna Konsumtif).
  - Loan Eligibility Checker & Calculator.
  - Underwriting Criteria & Requirements List.
- **Visual Redesign Focus:** Mobile card stacking for product comparison and modern slider controls.
- **Relevant Image Assets:**
  - `public/images/public/04-pinjaman.webp`
- **Functional Interactions (Preserved):** Live loan simulation slider for principal, tenor, and rates.

---

### 2.5 Tata Cara & Syarat Keanggotaan (Placeholder Module)
- **Path:** `/cara-bergabung`
- **Component:** `ModulePlaceholderView.tsx`
- **Layout:** `PublicLayout`
- **Navigation Entry:** Navbar "Cara Bergabung"
- **Permitted Roles:** All roles
- **Main UI Components:** Standard placeholder card with phase badge and descriptive scope.
- **Visual Redesign Focus:** Consistent warm card wrapper and illustration accent.
- **Relevant Image Assets:**
  - `public/images/public/05-cara-bergabung.webp`
- **Functional Interactions:** Navigation link to registration wizard.

---

### 2.6 Pendaftaran Calon Anggota (Registration Wizard)
- **Path:** `/daftar`
- **Component:** `RegistrationWizardView.tsx` (`src/features/public/RegistrationWizardView.tsx`)
- **Layout:** `PublicLayout`
- **Navigation Entry:** Navbar CTA "Daftar Anggota", Hero CTA
- **Permitted Roles:** `public_visitor`, `applicant`
- **Main UI Components:**
  - Multi-step progress bar (Step 1: Data Diri, Step 2: Kontak & Alamat, Step 3: Pekerjaan & Bank, Step 4: Pernyataan & Setoran Awal).
  - Form validation with Zod schemas.
  - Simulated file upload for KTP and selfie.
  - Application summary review.
  - Success screen displaying simulated Application Reference ID (`REG-YYYY-XXXX`).
- **Visual Redesign Focus:** Desktop stepped progress rail, clear input focus rings, and streamlined error placement.
- **Relevant Image Assets:**
  - `public/images/public/05-cara-bergabung.webp`
- **Functional Interactions (Preserved):** React Hook Form validation and state submission to `membershipStore.submitApplication()`.

---

### 2.7 Lacak Status Pengajuan Anggota
- **Path:** `/status-pengajuan`
- **Component:** `ApplicationTrackingView.tsx` (`src/features/membership/pages/ApplicationTrackingView.tsx`)
- **Layout:** `PublicLayout`
- **Navigation Entry:** Navbar "Lacak Status"
- **Permitted Roles:** All roles
- **Main UI Components:**
  - Tracking code search input with sample demo codes (`REG-2026-0001`, `REG-2026-0002`, `REG-2026-0003`).
  - Visual Stepper showing application lifecycle: Diajukan -> Verifikasi Berkas -> Peninjauan Pengurus -> Disetujui/Ditolak.
  - Detailed status badge and reviewer feedback timeline.
- **Visual Redesign Focus:** Compact search card and unified milestone timeline.
- **Relevant Image Assets:**
  - `public/images/public/06-lacak-status.webp`
- **Functional Interactions (Preserved):** Real-time lookup against `membershipStore.applications`.

---

### 2.8 Transparansi & Akuntabilitas (Placeholder Module)
- **Path:** `/transparansi`
- **Component:** `ModulePlaceholderView.tsx`
- **Layout:** `PublicLayout`
- **Navigation Entry:** Navbar "Transparansi"
- **Permitted Roles:** All roles
- **Main UI Components:** Placeholder view with institutional governance description.
- **Visual Redesign Focus:** Consistent warm card wrapper and illustration accent.
- **Relevant Image Assets:**
  - `public/images/public/07-transparansi.webp`
- **Functional Interactions:** Information placeholder.

---

## 3. B. Member Portal Routes (`MemberLayout` under `RouteGuard`)

### 3.1 Ringkasan Dashboard Anggota
- **Path:** `/portal`
- **Component:** `MemberDashboardView.tsx` (`src/features/member/MemberDashboardView.tsx`)
- **Layout:** `MemberLayout` (Sidebar + Top bar + Content area)
- **Navigation Entry:** Sidebar "Ringkasan"
- **Permitted Roles:** `member` (Only authenticated member)
- **Main UI Components:**
  - Member welcome banner with active badge and member ID (`DEMO-ID-0001`).
  - Stat Cards (Total Simpanan, Angsuran Mendatang, Estimasi SHU Berjalan, Partisipasi Unit Usaha).
  - Quick Action Buttons (Setor Simpanan, Ajukan Pinjaman, Bayar Angsuran).
  - Active Loan Overview Card with progress bar and countdown to due date.
  - Recent Transaction History Table.
- **Visual Redesign Focus:**
  - Hierarchical stat cards (primary active installment vs total savings).
  - Clean table typography with monospace tabular numbers.
- **Functional Boundary Note:**
  - The transaction history table currently displays static mock data records. In accordance with the strict scope separation, this data source is retained during the visual redesign. Connecting it to reactive store data is cataloged as a separate functional task.
- **Relevant Image Assets:**
  - `public/images/dashboard/01-dashboard-anggota-hero.webp`
  - `public/images/dashboard/10-transaksi-ilustrasi.webp`
- **Functional Interactions (Preserved):** Navigation triggers to modals and services.

---

### 3.2 Simpanan Anggota
- **Path:** `/portal/simpanan`
- **Component:** `MemberSavingsPortalView.tsx` (`src/features/savings/pages/MemberSavingsPortalView.tsx`)
- **Layout:** `MemberLayout`
- **Navigation Entry:** Sidebar "Simpanan Saya" (Conditional on `config.activeModules.savings`)
- **Permitted Roles:** `member`
- **Main UI Components:**
  - Pocket breakdown cards: Simpanan Pokok, Simpanan Wajib, Simpanan Sukarela, Simpanan Berjangka.
  - "Setor Simpanan Sukarela" Modal dialog.
  - "Tarik Simpanan Sukarela" Modal dialog with balance validation.
  - Historical Mutasi Simpanan Table with pocket and date filters.
- **Visual Redesign Focus:** Pocket card styling, modal form layout with balance preview, and table readability.
- **Relevant Image Assets:**
  - `public/images/dashboard/04-simpanan-ilustrasi.webp`
- **Functional Interactions (Preserved):** Deposit and withdrawal submissions via `savingsStore`.

---

### 3.3 Pinjaman & Angsuran Anggota
- **Path:** `/portal/pinjaman`
- **Component:** `MemberLoanPortalView.tsx` (`src/features/loans/pages/MemberLoanPortalView.tsx`)
- **Layout:** `MemberLayout`
- **Navigation Entry:** Sidebar "Pinjaman & Angsuran" (Conditional on `config.activeModules.loans`)
- **Permitted Roles:** `member`
- **Main UI Components:**
  - Active Loans Card List with progress bars, tenor remaining, and interest status.
  - Interactive Loan Application Modal Wizard.
  - Complete Installment Schedule Table with status badges.
  - "Bayar Angsuran" Modal with payment proof simulation.
- **Visual Redesign Focus:** Progress bar contrast, installment table column prioritization, and modal form styling.
- **Relevant Image Assets:**
  - `public/images/dashboard/05-pinjaman-ilustrasi.webp`
  - `public/images/dashboard/06-angsuran-ilustrasi.webp`
- **Functional Interactions (Preserved):** Loan applications, installment payments, and real-time late fee calculation.

---

### 3.4 Pusat Pembayaran (Placeholder Module)
- **Path:** `/portal/pembayaran`
- **Component:** `ModulePlaceholderView.tsx`
- **Layout:** `MemberLayout`
- **Navigation Entry:** Sidebar "Pusat Pembayaran"
- **Permitted Roles:** `member`
- **Main UI Components:** Placeholder view detailing transfer and mock QRIS options.
- **Visual Redesign Focus:** Consistent warm card wrapper and illustration accent.
- **Relevant Image Assets:**
  - `public/images/dashboard/10-transaksi-ilustrasi.webp`
- **Functional Interactions:** Information placeholder.

---

### 3.5 SHU Anggota (Sisa Hasil Usaha)
- **Path:** `/portal/shu`
- **Component:** `MemberShuPortalView.tsx` (`src/features/shu/pages/MemberShuPortalView.tsx`)
- **Layout:** `MemberLayout`
- **Navigation Entry:** Sidebar "SHU Saya" (Conditional on `config.activeModules.shu`)
- **Permitted Roles:** `member`
- **Main UI Components:**
  - Fiscal Year Selector (Active / Historical).
  - Personal SHU Card: Jasa Modal (Simpanan) + Jasa Usaha (Pinjaman & Belanja Unit Usaha).
  - Allocation Breakdown Card: Cadangan, Pendidikan, Sosial, Pengurus.
  - Dividend distribution status indicator.
- **Visual Redesign Focus:** Clean visual hierarchy between Jasa Modal and Jasa Usaha projections.
- **Relevant Image Assets:**
  - `public/images/dashboard/07-shu-ilustrasi.webp`
- **Functional Interactions (Preserved):** Fiscal year selector and dividend estimation lookup from `shuStore`.

---

### 3.6 Unit Usaha Koperasi (Partisipasi Anggota)
- **Path:** `/portal/unit-usaha`
- **Component:** `MemberBusinessUnitsView.tsx` (`src/features/business-units/pages/MemberBusinessUnitsView.tsx`)
- **Layout:** `MemberLayout`
- **Navigation Entry:** Sidebar "Unit Usaha" (Conditional on `config.activeModules.business_units`)
- **Permitted Roles:** `member`
- **Main UI Components:**
  - Business Units Directory (Toko Sembako, Pengolahan Pasca-Panen, Saprotan Pertanian).
  - Personal Economic Participation Summary (Total belanja, volume transaksi, poin kontribusi).
  - Personal Unit Mutation Table.
- **Visual Redesign Focus:** Unit catalog card elevation and clean participation metrics.
- **Relevant Image Assets:**
  - `public/images/dashboard/08-unit-usaha-ilustrasi.webp`
- **Functional Interactions (Preserved):** Actor-scoped data lookup (`getMemberEconomicParticipation(actor, memberId)`).

---

### 3.7 Rapat Anggota & Bilik Suara (Placeholder Module)
- **Path:** `/portal/rapat`
- **Component:** `ModulePlaceholderView.tsx`
- **Layout:** `MemberLayout`
- **Navigation Entry:** Sidebar "Rapat Anggota (RAT)" (Conditional on `config.activeModules.meetings`)
- **Permitted Roles:** `member`
- **Main UI Components:** Placeholder detailing e-voting and attendance quorum.
- **Visual Redesign Focus:** Consistent warm card wrapper and illustration accent.
- **Relevant Image Assets:**
  - `public/images/dashboard/09-keanggotaan-ilustrasi.webp`
- **Functional Interactions:** Information placeholder.

---

### 3.8 Profil Anggota
- **Path:** `/portal/profil`
- **Component:** `MemberProfilePortalView.tsx` (`src/features/membership/pages/MemberProfilePortalView.tsx`)
- **Layout:** `MemberLayout`
- **Navigation Entry:** Sidebar "Profil Anggota", User avatar menu
- **Permitted Roles:** `member`
- **Main UI Components:**
  - Member Digital Identity Card (NIK, Nomor Anggota, Tanggal Bergabung, QR Code placeholder).
  - Personal Information Form.
  - Bank Account & Beneficiary Information.
  - Standing Badge & Account Validity.
- **Visual Redesign Focus:** Official institutional card styling with subtle textures.
- **Relevant Image Assets:**
  - `public/images/dashboard/03-anggota-profil.webp`
- **Functional Interactions (Preserved):** Profile view and contact update form.

---

### 3.9 Bantuan & Kontak (Placeholder Module)
- **Path:** `/portal/bantuan`
- **Component:** `ModulePlaceholderView.tsx`
- **Layout:** `MemberLayout`
- **Navigation Entry:** Sidebar "Bantuan & Kontak"
- **Permitted Roles:** `member`
- **Main UI Components:** Placeholder view with operating hours, helpdesk email, and WhatsApp simulation.
- **Visual Redesign Focus:** Consistent warm card wrapper and illustration accent.
- **Relevant Image Assets:**
  - `public/images/dashboard/11-laporan-analitik.webp`
- **Functional Interactions:** Information placeholder.

---

## 4. C. Administration Portal Routes (`AdminLayout` under `RouteGuard`)

The Administration Portal contains **17 route paths**, comprising **8 active page components** (with `AdminShuView` mapped to 6 sub-tab endpoints) and **4 placeholder module endpoints**.

### 4.1 Executive Dashboard Admin
- **Path:** `/admin`
- **Component:** `AdminDashboardView.tsx` (`src/features/admin/AdminDashboardView.tsx`)
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Dashboard"
- **Permitted Roles:** `staff`, `finance`, `manager`, `super_admin`, `auditor`
- **Main UI Components:**
  - Role-adaptive Header Banner (Staff vs Finance vs Manager vs Auditor messaging).
  - SoD Task Pending Indicators (Verification queue, reconciliation queue, approval queue).
  - Key Financial Metrics Cards.
  - `FinancialTrendChart` (Monthly revenue, disbursement, and savings growth).
  - Operational Audit Log Table.
- **Visual Redesign Focus:** Workstation layout, queue card contrast, and responsive chart card.
- **Relevant Image Assets:**
  - `public/images/dashboard/02-dashboard-admin-hero.webp`
  - `public/images/dashboard/11-laporan-analitik.webp`
- **Functional Interactions (Preserved):** Role-specific quick navigation to action queues.

---

### 4.2 Verifikasi Calon Anggota (Staff Workstation)
- **Path:** `/admin/anggota/verifikasi`
- **Component:** `MemberVerificationView.tsx` (`src/features/admin/MemberVerificationView.tsx`)
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Verifikasi Anggota"
- **Permitted Roles:** `staff`, `manager`, `super_admin`, `auditor` (Read-only for auditor)
- **Main UI Components:**
  - Application Queue Table with status filters.
  - Applicant Detail Verification Drawer / Modal.
  - Document Inspection Viewer (KTP & Pasfoto synthetic preview).
  - SoD Verification Actions: "Verifikasi Berkas" (Staff) / "Persetujuan Akhir" (Manager).
- **Visual Redesign Focus:** Split-pane inspection workstation with clean document viewer.
- **Relevant Image Assets:**
  - `public/images/dashboard/09-keanggotaan-ilustrasi.webp`
- **Functional Interactions (Preserved):** Multi-stage verification and approval workflows in `membershipStore`.

---

### 4.3 Direktori Anggota Koperasi
- **Path:** `/admin/anggota`
- **Component:** `MemberListView.tsx` (`src/features/membership/pages/MemberListView.tsx`)
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Data Anggota"
- **Permitted Roles:** `staff`, `finance`, `manager`, `super_admin`, `auditor`
- **Main UI Components:**
  - Search by Name, Member ID, or NIK.
  - Status filters (`Semua`, `Aktif`, `Dibekukan`, `Keluar`).
  - Member Master Table (ID, Nama, NIK, Tanggal Bergabung, Total Simpanan, Status).
  - Member Detail Sheet.
- **Visual Redesign Focus:** High-density data grid with clean warm headers and status badges.
- **Relevant Image Assets:**
  - `public/images/dashboard/09-keanggotaan-ilustrasi.webp`
- **Functional Interactions (Preserved):** Filter queries, status filters, and export.

---

### 4.4 Pengelolaan Simpanan (Admin)
- **Path:** `/admin/simpanan`
- **Component:** `AdminSavingsManagementView.tsx` (`src/features/savings/pages/AdminSavingsManagementView.tsx`)
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Simpanan" (Conditional on `config.activeModules.savings`)
- **Permitted Roles:** `finance`, `manager`, `super_admin`, `auditor`
- **Main UI Components:**
  - Portfolio Summary Cards (Pokok, Wajib, Sukarela, Berjangka).
  - Pending Deposit & Withdrawal Approval Queue (Finance Officer SoD check).
  - Master Transaction Ledger Table with search and date range filters.
  - "Catat Setoran Manual" Modal for teller operations.
- **Visual Redesign Focus:** Tabbed separation between pending approval queue and master ledger.
- **Relevant Image Assets:**
  - `public/images/dashboard/04-simpanan-ilustrasi.webp`
- **Functional Interactions (Preserved):** SoD transaction approvals and teller recordings in `savingsStore`.

---

### 4.5 Pengelolaan Pinjaman (Admin Underwriting & Portfolio)
- **Path:** `/admin/pinjaman`
- **Component:** `AdminLoanManagementView.tsx` (`src/features/loans/pages/AdminLoanManagementView.tsx`)
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Pinjaman" (Conditional on `config.activeModules.loans`)
- **Permitted Roles:** `staff`, `finance`, `manager`, `super_admin`, `auditor`
- **Main UI Components:**
  - Underwriting Pipeline Kanban / Queue (Staff verification -> Finance analysis -> Manager approval).
  - Active Loan Portfolio Table with overdue alert badges.
  - "Pencairan Pinjaman" (Disbursement) Modal.
- **Visual Redesign Focus:** Underwriting stage cards, clear role-action emphasis, and modal layout.
- **Relevant Image Assets:**
  - `public/images/dashboard/05-pinjaman-ilustrasi.webp`
  - `public/images/dashboard/06-angsuran-ilustrasi.webp`
- **Functional Interactions (Preserved):** 3-stage underwriting actions and loan disbursement in `loanStore`.

---

### 4.6 Buku Kas Harian & Rekonsiliasi (Placeholder Module)
- **Path:** `/admin/keuangan`
- **Component:** `ModulePlaceholderView.tsx`
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Buku Kas & Bank"
- **Permitted Roles:** `finance`, `manager`, `super_admin`, `auditor`
- **Main UI Components:** Placeholder detailing cash mutation and bank reconciliation.
- **Visual Redesign Focus:** Consistent warm card wrapper and illustration accent.
- **Relevant Image Assets:**
  - `public/images/dashboard/10-transaksi-ilustrasi.webp`
- **Functional Interactions:** Information placeholder.

---

### 4.7 Pengelolaan Unit Usaha (Admin)
- **Path:** `/admin/unit-usaha`
- **Component:** `AdminBusinessUnitsView.tsx` (`src/features/business-units/pages/AdminBusinessUnitsView.tsx`)
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Unit Usaha" (Conditional on `config.activeModules.business_units`)
- **Permitted Roles:** `staff`, `finance`, `manager`, `super_admin`, `auditor`
- **Main UI Components:**
  - 3 Tabs: Portofolio Unit, Pencatatan Aktivitas, and Rekapitulasi Kinerja.
  - "Tambah Unit Usaha" Modal.
  - "Catat Transaksi Unit" Modal.
- **Visual Redesign Focus:** Unit performance card grid, tabbed transitions, and modal form styling.
- **Relevant Image Assets:**
  - `public/images/dashboard/08-unit-usaha-ilustrasi.webp`
- **Functional Interactions (Preserved):** Unit creation and transaction recordings in `businessUnitStore`.

---

### 4.8 Penyelenggaraan Rapat Anggota (Placeholder Module)
- **Path:** `/admin/rapat`
- **Component:** `ModulePlaceholderView.tsx`
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Rapat Anggota (RAT)" (Conditional on `config.activeModules.meetings`)
- **Permitted Roles:** `staff`, `manager`, `super_admin`, `auditor`
- **Main UI Components:** Placeholder view for RAT planning and vote counting.
- **Visual Redesign Focus:** Consistent warm card wrapper and illustration accent.
- **Relevant Image Assets:**
  - `public/images/dashboard/09-keanggotaan-ilustrasi.webp`
- **Functional Interactions:** Information placeholder.

---

### 4.9 Pengelolaan SHU Terpadu (Admin 6-Tab Workflow)
- **Paths:**
  - `/admin/shu` (`initialTab="overview"`)
  - `/admin/shu/periode` (`initialTab="periode"`)
  - `/admin/shu/konfigurasi` (`initialTab="konfigurasi"`)
  - `/admin/shu/perhitungan` (`initialTab="perhitungan"`)
  - `/admin/shu/pemeriksaan` (`initialTab="pemeriksaan"`)
  - `/admin/shu/riwayat` (`initialTab="riwayat"`)
- **Component:** `AdminShuView.tsx` (`src/features/shu/pages/AdminShuView.tsx`)
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Pengelolaan SHU" (Conditional on `config.activeModules.shu`)
- **Permitted Roles:** `finance`, `manager`, `super_admin`, `auditor`
- **Main UI Components:**
  - Global Fiscal Year Status Banner (`DRAF`, `DIHITUNG`, `DISETUJUI_RAT`, `DIBAGIKAN`).
  - 6 Sub-Navigation Tabs:
    - Tab 1 Overview: Net cooperative SHU card, revenue vs expenditure.
    - Tab 2 Periode: Fiscal period creation and lock controls.
    - Tab 3 Konfigurasi: Allocation sliders/inputs with 100% strict sum invariant check.
    - Tab 4 Perhitungan: Algorithmic breakdown of Jasa Modal and Jasa Anggota.
    - Tab 5 Pemeriksaan: Auditor/Manager verification and RAT ratification form.
    - Tab 6 Riwayat: Historical distributed SHU archives.
- **Visual Redesign Focus:** Responsive sub-tab bar, clean allocation tables, and high-contrast formula summaries.
- **Relevant Image Assets:**
  - `public/images/dashboard/07-shu-ilustrasi.webp`
- **Functional Interactions (Preserved):** End-to-end SHU lifecycle state transitions and 100% invariant checks in `shuStore`.

---

### 4.10 Laporan Keuangan Demonstrasi (Placeholder Module)
- **Path:** `/admin/laporan`
- **Component:** `ModulePlaceholderView.tsx`
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Laporan Keuangan" (Conditional on `config.activeModules.reports`)
- **Permitted Roles:** `finance`, `manager`, `super_admin`, `auditor`
- **Main UI Components:** Placeholder view for Balance Sheet, P&L, Cash Flow.
- **Visual Redesign Focus:** Consistent warm card wrapper and illustration accent.
- **Relevant Image Assets:**
  - `public/images/dashboard/11-laporan-analitik.webp`
- **Functional Interactions:** Information placeholder.

---

### 4.11 Audit Trail Operasional (Placeholder Module)
- **Path:** `/admin/audit`
- **Component:** `ModulePlaceholderView.tsx`
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Audit Trail" (Conditional on `config.activeModules.audit_trail`)
- **Permitted Roles:** `super_admin`, `auditor`
- **Main UI Components:** Placeholder view for chronological immutable audit logs.
- **Visual Redesign Focus:** Consistent warm card wrapper and illustration accent.
- **Relevant Image Assets:**
  - `public/images/dashboard/12-pengaturan-rbac.webp`
- **Functional Interactions:** Information placeholder.

---

### 4.12 Pengaturan Platform & Konfigurasi Sistem
- **Path:** `/admin/pengaturan`
- **Component:** `PlatformSettingsView.tsx` (`src/features/admin/PlatformSettingsView.tsx`)
- **Layout:** `AdminLayout`
- **Navigation Entry:** Sidebar "Pengaturan"
- **Permitted Roles:** `super_admin`, `manager`, `auditor` (Read-only for non-super_admin)
- **Main UI Components:**
  - Cooperative Identity Form.
  - Financial Parameters Form (Simpanan Pokok, Simpanan Wajib, grace period).
  - Loan Parameters Form (Interest rates, maximum tenors).
  - Business Module Activation Toggles.
  - Danger Zone: Demo State Reset Action.
- **Visual Redesign Focus:** Sectioned card groupings with clear authorization indicators.
- **Relevant Image Assets:**
  - `public/images/dashboard/12-pengaturan-rbac.webp`
- **Functional Interactions (Preserved):** Strict validation updates in `configStore` and `membershipStore`.

---

## 5. Change Log — Page Inventory Remediation (v1.1)

| Section | Correction Implemented | Rationale |
| :--- | :--- | :--- |
| **Section 1** | Reconciled summary table to explicitly distinguish 34 total paths, 20 unique active pages, 6 sub-tabs, and 9 placeholders. | Accurate alignment with `src/app/routes.tsx`. |
| **Section 2 & 4** | Standardized brand name as **Nusantara Maju**; removed extraneous company acronyms from headers. | Strict brand consistency compliance. |
| **Section 3.1** | Added explicit functional boundary note confirming static mock data in Member Dashboard is retained during visual redesign. | Strict separation of visual styling from functional data changes. |
| **Section 4** | Explicitly enumerated all 8 active admin pages scheduled for visual redesign. | Complete administrative redesign scope clarity. |
