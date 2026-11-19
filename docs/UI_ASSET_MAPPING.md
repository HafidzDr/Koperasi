# Comprehensive Visual Asset Inventory & Page Mapping — Nusantara Maju

**Project:** Nusantara Maju  
**Audit Phase:** PHASE UI-REDESIGN-00 — Task D  
**Inspected Directories:**
- `public/images/public/`
- `public/images/dashboard/`  
**Total Valid Visual Assets:** 22 WebP image files (10 Public, 12 Dashboard)  
**Status:** COMPLETE & VERIFIED

---

## 1. Public Website Asset Inventory (`public/images/public/`)

All public assets are compressed WebP crops derived from the approved high-resolution Nusantara Maju brand visual reference.

| # | Filename | Format | Dimensions (WxH) | File Size | Recommended Target Page / Section | Recommended Use Type |
| :-: | :--- | :---: | :---: | :---: | :--- | :--- |
| **01** | `01-beranda-hero.webp` | WebP | 765 x 379 px | 63.8 KB | `/` (Beranda / Landing Page) | Hero Section Background / Visual |
| **02** | `02-tentang-nusantara-maju.webp` | WebP | 370 x 379 px | 38.9 KB | `/tentang` (Tentang Koperasi) | Institutional Profile Card / Hero Accent |
| **03** | `03-simpanan.webp` | WebP | 374 x 379 px | 26.8 KB | `/layanan/simpanan` & `/` Simpanan Tab | Product Showcase Card / Header Illustration |
| **04** | `04-pinjaman.webp` | WebP | 375 x 300 px | 21.6 KB | `/layanan/pinjaman` & `/` Pinjaman Tab | Product Showcase Card / Calculator Accent |
| **05** | `05-cara-bergabung.webp` | WebP | 373 x 300 px | 21.5 KB | `/cara-bergabung` & `/daftar` (Wizard) | Stepper Card / Flow Header Illustration |
| **06** | `06-lacak-status.webp` | WebP | 372 x 300 px | 19.2 KB | `/status-pengajuan` | Search Card Header / Status Visual |
| **07** | `07-transparansi.webp` | WebP | 374 x 300 px | 17.8 KB | `/transparansi` | Institutional Governance Showcase |
| **08** | `08-nilai-bersama.webp` | WebP | 375 x 315 px | 29.1 KB | `/` (7 Prinsip Koperasi Section) | Section Feature Header / Decorative Banner |
| **09** | `09-kolaborasi-anggota.webp` | WebP | 373 x 315 px | 26.2 KB | `/` (Testimoni & Gotong Royong) | Community Testimonial Card Visual |
| **10** | `10-tumbuh-bersama.webp` | WebP | 374 x 315 px | 21.9 KB | `/` (Final Membership CTA) | CTA Card Background / Visual Accent |

### Public Package Metadata Files
- `public/images/public/manifest.json` (72 lines, dimensions and source attribution).
- `public/images/public/README.md` (22 lines, usage notes and aspect ratio guidelines).

---

## 2. Dashboard & Portals Asset Inventory (`public/images/dashboard/`)

All dashboard assets are dedicated editorial illustrations optimized for internal portal workflows, member dashboards, and administrative workspaces.

| # | Filename | Format | Dimensions (WxH) | File Size | Recommended Target Page / Feature | Recommended Use Type |
| :-: | :--- | :---: | :---: | :---: | :--- | :--- |
| **01** | `01-dashboard-anggota-hero.webp` | WebP | 718 x 526 px | 49.5 KB | `/portal` (Member Dashboard) | Welcome Banner Header Accent |
| **02** | `02-dashboard-admin-hero.webp` | WebP | 720 x 526 px | 46.7 KB | `/admin` (Admin Dashboard) | Executive Overview Header Banner |
| **03** | `03-anggota-profil.webp` | WebP | 720 x 526 px | 40.8 KB | `/portal/profil` (Member Profile) | Digital Membership Card Visual / Identity |
| **04** | `04-simpanan-ilustrasi.webp` | WebP | 714 x 526 px | 41.7 KB | `/portal/simpanan` & `/admin/simpanan` | Savings Portfolio Header / Mutation Modal |
| **05** | `05-pinjaman-ilustrasi.webp` | WebP | 718 x 500 px | 42.1 KB | `/portal/pinjaman` & `/admin/pinjaman` | Loan Application Banner / Underwriting Card |
| **06** | `06-angsuran-ilustrasi.webp` | WebP | 720 x 500 px | 36.9 KB | `/portal/pinjaman` & `/admin/pinjaman` | Installment Repayment Schedule Header |
| **07** | `07-shu-ilustrasi.webp` | WebP | 720 x 500 px | 34.0 KB | `/portal/shu` & `/admin/shu` | SHU Allocation & Member Projection Banner |
| **08** | `08-unit-usaha-ilustrasi.webp` | WebP | 714 x 500 px | 51.4 KB | `/portal/unit-usaha` & `/admin/unit-usaha` | Business Units Directory & Surplus Summary |
| **09** | `09-keanggotaan-ilustrasi.webp` | WebP | 718 x 488 px | 27.8 KB | `/admin/anggota` & `/admin/anggota/verifikasi` | Member Verification Queue & Directory Banner |
| **10** | `10-transaksi-ilustrasi.webp` | WebP | 720 x 488 px | 36.4 KB | `/portal/pembayaran` & `/admin/keuangan` | Payment Center / Cash Ledger Header |
| **11** | `11-laporan-analitik.webp` | WebP | 720 x 488 px | 34.2 KB | `/admin/laporan` & `/portal/bantuan` | Financial Analytics & Reporting Card |
| **12** | `12-pengaturan-rbac.webp` | WebP | 714 x 488 px | 31.8 KB | `/admin/pengaturan` & `/admin/audit` | System Settings & Governance Banner |

### Dashboard Package Metadata Files
- `public/images/dashboard/manifest.json` (86 lines, dimensions and recommended uses).
- `public/images/dashboard/README.md` (26 lines, implementation and accessibility guidance).

---

## 3. Public Website Page-by-Page Mapping Table

| Public Page / Section | Recommended Asset | Placement / Component | Fallback if Missing |
| :--- | :--- | :--- | :--- |
| **Beranda — Hero Section** | `01-beranda-hero.webp` | Replaces heavy 1.25MB JPG behind floating navbar | Existing JPG (uncompressed) |
| **Beranda — Simpanan Preview** | `03-simpanan.webp` | Tabbed product showcase card header | Subtle Forest gradient icon |
| **Beranda — Pinjaman Calculator** | `04-pinjaman.webp` | Calculator sidebar visual card | Clean geometric pattern card |
| **Beranda — 7 Prinsip Koperasi** | `08-nilai-bersama.webp` | Section banner header | Standard PageHeader |
| **Beranda — Kolaborasi & Testimoni** | `09-kolaborasi-anggota.webp` | Community card visual | Monogram avatar |
| **Beranda — Final CTA Banner** | `10-tumbuh-bersama.webp` | Card background / Right-hand visual | Solid Forest-900 fill |
| **Tentang — Profil Lembaga** | `02-tentang-nusantara-maju.webp` | Institutional header visual card | Landmark icon card |
| **Katalog Simpanan (`/layanan/simpanan`)** | `03-simpanan.webp` | Catalog hero banner | Pocket badge grid |
| **Katalog Pinjaman (`/layanan/pinjaman`)** | `04-pinjaman.webp` | Catalog hero banner | Calculator badge |
| **Cara Bergabung (`/cara-bergabung`)** | `05-cara-bergabung.webp` | Stepper illustration header | Numbered list badge |
| **Pendaftaran Wizard (`/daftar`)** | `05-cara-bergabung.webp` | Wizard desktop left-hand visual rail | Step indicator bar |
| **Lacak Status (`/status-pengajuan`)** | `06-lacak-status.webp` | Search card visual accent | Search input icon |
| **Transparansi (`/transparansi`)** | `07-transparansi.webp` | Governance report banner | ShieldCheck icon |

---

## 4. Dashboard & Portal Page-by-Page Mapping Table

| Portal / Page | Recommended Asset | Placement / Component | Fallback if Missing |
| :--- | :--- | :--- | :--- |
| **Member Dashboard (`/portal`)** | `01-dashboard-anggota-hero.webp` | Welcome banner card right-hand visual | Solid greeting card |
| **Member Profil (`/portal/profil`)** | `03-anggota-profil.webp` | Digital membership card credential background | Forest-800 textured card |
| **Member Simpanan (`/portal/simpanan`)** | `04-simpanan-ilustrasi.webp` | Total balance card accent | Wallet icon badge |
| **Member Pinjaman (`/portal/pinjaman`)** | `05-pinjaman-ilustrasi.webp` | Active loan status card accent | CreditCard icon badge |
| **Member Angsuran Schedule** | `06-angsuran-ilustrasi.webp` | Due installment reminder banner | Calendar alert badge |
| **Member SHU (`/portal/shu`)** | `07-shu-ilustrasi.webp` | Personal SHU projection card accent | PieChart icon |
| **Member Unit Usaha (`/portal/unit-usaha`)** | `08-unit-usaha-ilustrasi.webp` | Personal participation summary card | ShoppingBag icon |
| **Member Pembayaran (`/portal/pembayaran`)** | `10-transaksi-ilustrasi.webp` | Payment methods card visual | Receipt icon |
| **Admin Dashboard (`/admin`)** | `02-dashboard-admin-hero.webp` | Executive overview header banner | Role header badge |
| **Admin Verifikasi (`/admin/anggota/verifikasi`)** | `09-keanggotaan-ilustrasi.webp` | Verification queue header accent | UserCheck icon |
| **Admin Data Anggota (`/admin/anggota`)** | `09-keanggotaan-ilustrasi.webp` | Directory search card accent | Users icon |
| **Admin Simpanan (`/admin/simpanan`)** | `04-simpanan-ilustrasi.webp` | Portfolio overview header | Wallet icon |
| **Admin Pinjaman (`/admin/pinjaman`)** | `05-pinjaman-ilustrasi.webp` | Underwriting queue header | CreditCard icon |
| **Admin Unit Usaha (`/admin/unit-usaha`)** | `08-unit-usaha-ilustrasi.webp` | Business portfolio header | ShoppingBag icon |
| **Admin SHU (`/admin/shu/*`)** | `07-shu-ilustrasi.webp` | SHU calculation & period header | PieChart icon |
| **Admin Buku Kas (`/admin/keuangan`)** | `10-transaksi-ilustrasi.webp` | Cash mutation ledger header | Landmark icon |
| **Admin Laporan (`/admin/laporan`)** | `11-laporan-analitik.webp` | Financial statement export card | FileSpreadsheet icon |
| **Admin Pengaturan (`/admin/pengaturan`)** | `12-pengaturan-rbac.webp` | Platform configuration header | Settings icon |
| **Admin Audit Trail (`/admin/audit`)** | `12-pengaturan-rbac.webp` | Audit trail viewer banner | History icon |

---

## 5. Asset Suitability & Optimization Guidelines

1. **Lightweight WebP Format:**
   - The total payload of all 22 WebP assets combined is **711 KB**, which is **43% smaller than the single existing 1.25 MB hero JPG** (`hero-kmb.jpg`).
   - Replacing the uncompressed hero image with `01-beranda-hero.webp` will dramatically reduce First Contentful Paint (FCP) and Largest Contentful Paint (LCP).

2. **Aspect Ratios and Responsive Scaling:**
   - Public assets have aspect ratios ranging between ~1.2:1 and 2:1. In React components, they must be wrapped with container divs using `aspect-[...]`, `object-cover`, and `rounded-lg` / `rounded-xl`.
   - Dashboard assets have uniform ~1.4:1 aspect ratios (~720x500px), making them ideal for standard card sidebars, banner right-side visuals, and modal headers.

3. **Text Separation Rule:**
   - While the raw source collage contained baked text, the crops in `public/images/` must **never** be used to display functional interface text.
   - All titles, subtitles, numerical metrics, buttons, and badges must remain HTML/React text rendered with Inter and JetBrains Mono for full accessibility and screen reader support.

4. **Lazy Loading Standards:**
   - The primary hero image on `/` should be loaded with `loading="eager"` and `fetchpriority="high"`.
   - All below-the-fold images and modal illustrations must use `loading="lazy"` and `decoding="async"` to preserve initial page load velocity.

---

## 6. Change Log — Asset Mapping Remediation (v1.1)

| Section | Correction Implemented | Rationale |
| :--- | :--- | :--- |
| **Section 1 & 2** | Standardized brand identity strictly as **Nusantara Maju**; removed extraneous company affixes. | Brand consistency compliance. |
| **Section 3 & 4** | Synchronized page mapping targets with the reconciled 34 routes / 20 active page components architecture. | Complete inventory alignment. |
| **Section 5** | Re-emphasized text separation rule: image assets must serve as visual illustrations only, never replacing React/HTML interface text. | Accessibility and internationalization preservation. |

