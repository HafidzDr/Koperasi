# Implementation Roadmap — Platform Digital Koperasi Indonesia
**Version:** 0.2 (Phase 0 Refined)
**Status:** PROPOSED — Under Review
**Date:** 2026-11-02

---

## 1. Prinsip Tata Kelola Roadmap

1. **Satu fase dalam satu waktu.** Fase berikutnya tidak dimulai sebelum fase berjalan lulus semua Quality Gate dan mendapat persetujuan eksplisit pengguna.
2. **Dokumentasi mendahului kode.** Setiap perubahan keputusan produk diperbarui ke dokumen yang relevan sebelum implementasi dimulai.
3. **Tanpa backend apapun.** Jika sebuah fitur tampak memerlukan server, implementasikan menggunakan simulation service di DEMO_SIMULATION_SPEC.md.
4. **Aturan visual tidak dapat dikompromikan.** Cek `.agent/rules/visual.md` untuk setiap komponen baru yang dibuat.
5. **Stop and report.** Setiap fase diakhiri dengan laporan dan instruksi berhenti. Tidak ada otomasi pelanjutan ke fase berikutnya.

---

## 2. Gambaran Urutan Fase

```
Phase 0: Dokumentasi & Fondasi Produk      [SELESAI]
   ↓
Phase 1: Product & Brand Discovery         [SELESAI]
   ↓
Phase 2: Fondasi Frontend & Design System  [SELESAI]
   ↓
Phase 3: Membership Management             [SELESAI]
   ↓
Phase 4: Savings Management (Simpanan)     [SELESAI]
   ↓
Phase 5: Loan & Installment Management     [SELESAI]
   ↓  (persetujuan pengguna wajib)
Phase 6: Pusat Pembayaran & Rekonsiliasi   [MENUNGGU]
   ↓  (persetujuan pengguna wajib)
Phase 7: Laporan Keuangan & Audit Simulasi [MENUNGGU]
   ↓  (persetujuan pengguna wajib)
Phase 8: QA, Aksesibilitas & Penguatan Responsif [MENUNGGU]
```

---

## 3. Detail Setiap Fase

---

### Phase 0: Dokumentasi & Fondasi Produk (DALAM PENINJAUAN)

**Objective:** Membangun landasan dokumentasi produk, aturan pengerjaan, dan quality gates sebelum satu baris kode ditulis.

**Scope:** Dokumentasi only. Nol implementasi UI, nol pemasangan paket.

**Deliverables:**
- [x] Pemeriksaan kondisi repository (direktori kosong dikonfirmasi)
- [x] Struktur direktori dokumentasi (`docs/`, `.agent/rules/`, `.agent/workflows/`)
- [x] `PRD.md` — platform modular, tujuan produk, cakupan, peran, persyaratan
- [x] `INFORMATION_ARCHITECTURE.md` — IA adaptif berbasis modul untuk 3 lingkungan
- [x] `USER_FLOWS.md` — 18 alur pengguna dengan keamanan data demo
- [x] `BUSINESS_RULES.md` — aturan dikategorikan Platform Rule / Configurable / Illustrative
- [x] `DESIGN_SYSTEM.md` — token warna, tipografi, komponen, aksesibilitas
- [x] `RESPONSIVE_SPECIFICATION.md` — 8 viewport uji, pola adaptasi, penanganan overflow
- [x] `DEMO_SIMULATION_SPEC.md` — keamanan data simulasi, katalog seed, layanan
- [x] `IMPLEMENTATION_ROADMAP.md` — 9 fase dengan quality gates
- [x] `.agent/rules/global.md` — aturan teknis dan keamanan proyek
- [x] `.agent/rules/visual.md` — larangan visual dan aturan desain
- [x] `.agent/workflows/phase.md` — siklus hidup fase eksekusi
- [x] Laporan audit dan koreksi dokumentasi Phase 0

**Quality Gates Phase 0:**
| # | Kriteria | Status | Bukti |
|---|----------|--------|-------|
| QG0-1 | 11 berkas dokumentasi tersedia dan konsisten | PASS | Daftar berkas dikonfirmasi |
| QG0-2 | Platform dinyatakan modular (bukan single-coop locked) | PASS | PRD Seksi 5 |
| QG0-3 | Aturan global dan visual tersedia dan tidak bertentangan | PASS | `.agent/rules/` |
| QG0-4 | Angka ilustratif diberi label ILLUSTRATIVE, bukan ditetapkan universal | PASS | BUSINESS_RULES.md |
| QG0-5 | Keamanan data demonstrasi ditegaskan secara eksplisit | PASS | DEMO_SIMULATION_SPEC.md Seksi 1 & 2 |
| QG0-6 | Tidak ada kode, UI, atau paket yang diinstal | PASS | Direktori hanya berisi `docs/` dan `.agent/` |
| QG0-7 | Persetujuan eksplisit pengguna diperoleh | **PENDING** | — |

---

### Phase 1: Product & Brand Discovery

**Objective:** Memvalidasi kebutuhan produk modular, memfinalisasi identitas visual koperasi demonstrasi, dan mencapai konsensus keputusan yang masih terbuka sebelum kode apapun ditulis.

**Scope:** Dokumentasi dan keputusan produk saja. Nol implementasi UI.

**Deliverables:**
- `docs/BRAND_IDENTITY.md` — nama koperasi demonstrasi, tagline, palet warna final, konsep logomark, suara merek
- Pembaruan `cooperativeConfig` dengan nama dan identitas resmi demonstrasi
- Resolusi keputusan UNRESOLVED yang kritikal (terutama U01: identitas koperasi)
- Konfirmasi atau penyesuaian daftar modul Core vs Optional
- Rencana pemilihan typeface final (Inter vs. alternatif berbasis alasan keterbacaan)

**Tasks:**
1. Rancang nama koperasi fiktif yang kredibel dan identitas visual awal.
2. Tentukan palet warna final (mengonfirmasi atau merevisi kandidat dalam DESIGN_SYSTEM.md).
3. Buat abstrak logomark (konsep vektor solid, tanpa gradien).
4. Dokumentasikan suara merek (tone komunikasi: hangat, profesional, inklusif).
5. Resolusi keputusan produk terbuka yang mempengaruhi Phase 2.

**Acceptance Criteria:**
- Nama demonstrasi telah dipilih, ditandai sebagai identitas sementara, dan tidak diklaim telah diverifikasi keunikan atau legalitasnya melalui registrasi resmi.
- Palet warna final dikonfirmasi dengan nilai hex dan rasio kontras WCAG 2.2 AA yang terverifikasi.
- Typeface final ditentukan dengan satu alasan yang didokumentasikan.
- `docs/BRAND_IDENTITY.md` tersedia dan disetujui.

**Quality Gates Phase 1:**
| # | Kriteria | Status | Bukti / Catatan |
|---|----------|:------:|-----------------|
| QG1-1 | `docs/BRAND_IDENTITY.md` tersedia dan lengkap | PASS | Dokumen tersedia mendefinisikan identitas resmi KMB, logomark, dan suara merek |
| QG1-2 | Palet warna final dikonfirmasi (bukan PROPOSED) | PASS | `DESIGN_SYSTEM.md` dan `BRAND_IDENTITY.md` terkonfirmasi CONFIRMED dengan rasio WCAG AA |
| QG1-3 | Seluruh keputusan UNRESOLVED yang memblokir Phase 2 diselesaikan | PASS | Identitas koperasi (U-01) berstatus CONFIRMED (Internal Phase 1 Demo); modul mapping, typeface Inter, dan token warna selesai |
| QG1-4 | Nol kode, nol paket diinstal | PASS | Workspace bersih; 100% dokumentasi spesifikasi |
| QG1-5 | Persetujuan eksplisit pengguna diperoleh | **PENDING** | Menunggu evaluasi, review independen, dan sign-off resmi pengguna untuk eksekusi Phase 2 |

---

### Phase 2: Fondasi Frontend & Design System

**Objective:** Menginisialisasi project frontend, mengkonfigurasi design system, dan membangun primitif komponen dasar yang mencerminkan aturan visual secara konsisten.

**Scope:** Inisialisasi Vite + React + TypeScript. Konfigurasi Tailwind CSS. Komponen primitif dasar. Belum ada halaman konten.

**Deliverables:**
- Inisialisasi: `npm create vite@latest` + React + TypeScript
- Konfigurasi Tailwind CSS dengan token desain (forest, ink, semantic palette) dari DESIGN_SYSTEM.md
- Komponen primitif: `Button`, `Input`, `Badge`, `Card`, `Modal`, `Table`, `Skeleton`, `Toast`
- Shell layout: `AppShell`, `Sidebar`, `TopBar`, `BottomNav`, `Drawer`
- Utilitas: currency formatter, date formatter (date-fns id locale)
- Pengaturan ESLint + TypeScript strict mode
- Pengaturan React Router — struktur rute dasar dari INFORMATION_ARCHITECTURE.md
- Halaman placeholder untuk semua rute (nol konten, hanya "Halaman [X] — In Progress")
- Verifikasi nol gradien dan nol glassmorphism di seluruh konfigurasi

**Dependencies yang Diizinkan (Phase 2):**
Sesuai G-02 Dependency Matrix di `.agent/rules/global.md`:
- Core: `react`, `react-dom`, `typescript`, `vite`, `@vitejs/plugin-react`
- Styling: `tailwindcss`, `postcss`, `autoprefixer`
- Icons: `lucide-react`
- Routing & State: `react-router-dom`, `zustand`
- Utilities: `clsx`, `tailwind-merge`, `date-fns`
- Dev tooling: `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`
- UI primitives: `shadcn/ui` (selected components only — PROPOSED)

**Dependency yang Ditunda:**
- `react-hook-form` + `zod` → Diperlukan mulai **Phase 3** (Arsitektur Simulasi Demo & Form Validasi)
- `recharts` → Diperlukan mulai **Phase 5** (Member Portal Charts) & **Phase 7** (Financial Reports)

**Tasks:**
1. Inisialisasi project Vite + React + TypeScript.
2. Konfigurasi Tailwind CSS dengan token desain lengkap.
3. Implementasi utilitas formatting IDR dan tanggal Indonesia.
4. Bangun 8 komponen primitif.
5. Bangun 3 layout shell (Public, Portal, Admin).
6. Uji semua komponen di 320px, 768px, 1280px.
7. Pastikan `npm run build` dan `npm run lint` bersih.

**Acceptance Criteria:**
- `npm run build` berjalan tanpa error dan peringatan.
- `npm run lint` bersih.
- `npx tsc --noEmit` bersih.
- Seluruh token warna di Tailwind config sesuai DESIGN_SYSTEM.md.
- Komponen primitif dapat dirender di 3 breakpoint minimum tanpa overflow.
- Nol gradien, nol glassmorphism terdeteksi di seluruh codebase.

**Quality Gates Phase 2:**
| # | Kriteria |
|---|----------|
| QG2-1 | `npm run build` sukses tanpa error |
| QG2-2 | `npm run lint` dan `npx tsc --noEmit` bersih |
| QG2-3 | Token Tailwind sesuai DESIGN_SYSTEM.md |
| QG2-4 | Komponen primitif dirender benar di 320px, 768px, 1280px |
| QG2-5 | Nol gradien, nol glassmorphism dalam source |
| QG2-6 | Persetujuan eksplisit pengguna diperoleh |

---

### Phase 3: Arsitektur Simulasi Demo

**Objective:** Membangun lapisan simulasi, mock data catalog, Zustand stores, dan sistem kontrol demonstrasi.

**Scope:** Nol halaman konten; hanya data layer, services, stores, routing guards, dan demo controls.

**Deliverables:**
- Seed data generator: 50 anggota, 30 pinjaman, 200 transaksi, 8 pengguna, 6 berita
- Seluruh simulation services dari DEMO_SIMULATION_SPEC.md Seksi 4.2
- Seluruh Zustand stores dari DEMO_SIMULATION_SPEC.md Seksi 6.1
- `demoReset()` function yang dapat dipanggil dari mana saja
- Auth guard dan role-based routing protection
- Demo Banner (non-dismissable)
- Demo Role Switcher UI
- Demo Modul Switcher (untuk mengaktifkan/nonaktifkan modul)
- Konfigurasi React Router — seluruh rute dari INFORMATION_ARCHITECTURE.md (dengan halaman placeholder)

**Dependencies yang Ditambahkan di Phase 3:**
`react-hook-form`, `zod`

**Acceptance Criteria:**
- `demoReset()` mengembalikan seluruh state ke kondisi seed.
- Role Switcher memperbarui peran aktif secara instan tanpa reload.
- Semua simulation services mengembalikan data sesuai tipe dengan delay terprogram.
- Semua rute terdaftar dan menampilkan halaman placeholder tanpa 404.
- Formatting IDR dan tanggal diverifikasi benar.

**Quality Gates Phase 3:**
| # | Kriteria |
|---|----------|
| QG3-1 | `demoReset()` fungsional dan mengembalikan state seed |
| QG3-2 | Role Switcher berfungsi untuk semua 8 peran |
| QG3-3 | Seluruh service mengembalikan data dengan tipe TypeScript yang benar |
| QG3-4 | Semua rute terdaftar tanpa 404 |
| QG3-5 | `npm run build` bersih |
| QG3-6 | Persetujuan eksplisit pengguna diperoleh |

---

### Phase 4: Savings Management (SELESAI)

**Objective:** Mengimplementasikan modul bisnis simpanan koperasi secara menyeluruh, terintegrasi, dan taat azas Separation of Duties (SoD) tanpa backend nyata.

**Scope:**
- Manajemen 3 Produk Simpanan: Simpanan Pokok (SP), Simpanan Wajib (SW), Simpanan Sukarela (SS) dengan parameter ilustrasi yang dapat dikonfigurasi.
- Manajemen Transaksi Simpanan: Setoran (SP, SW, SS), Penarikan (khusus SS dengan saldo mengendap), lifecycle transaksi (`submitted`, `under_review`, `approved`, `rejected`, `cancelled`).
- Portal Simpanan Anggota (`/portal/simpanan`): Saldo komprehensif, riwayat transaksi individual dengan isolasi privasi ketat, pengajuan setoran & penarikan, pembatalan mandiri.
- Administrasi Simpanan Pengurus & Staf (`/admin/simpanan`): Antrean verifikasi/persetujuan dengan penegakan SoD di tingkat store dan UI, pencarian & filter multi-parameter, direktori saldo anggota, pencatatan loket, dynamic reporting, dan konfigurasi produk simpanan.
- Katalog Publik & Edukasi Simpanan (`/layanan/simpanan`): Matriks perbandingan produk simpanan, hak & kewajiban, dan pelabelan ilustrasi transparan.

**Deliverables:**
- [x] `src/features/savings/types.ts`
- [x] `src/features/savings/mocks/savingsSeedData.ts`
- [x] `src/features/savings/stores/savingsStore.ts` (Zustand + `localStorage` persistence `kmb_savings_store_v1`)
- [x] `src/features/savings/pages/MemberSavingsPortalView.tsx`
- [x] `src/features/savings/pages/AdminSavingsManagementView.tsx`
- [x] `src/features/savings/pages/PublicSavingsCatalogView.tsx`
- [x] Integrasi route di `src/app/routes.tsx`
- [x] Integrasi RBAC (`savings:reject`) & sinkronisasi saldo di `membershipStore.ts`
- [x] Reset demonstrasi terintegrasi di `DemoRoleSwitcher.tsx` & `PlatformSettingsView.tsx`
- [x] Unit, Store, & Component DOM Tests (95 tests passing total)
- [x] `docs/PHASE_4_IMPLEMENTATION_REPORT.md`

**Quality Gates Phase 4:**
| # | Kriteria | Status | Bukti |
|---|----------|--------|-------|
| QG4-1 | Typecheck (`tsc --noEmit`) lulus tanpa error | PASS | Exit code 0 |
| QG4-2 | Linting (`eslint`) 0 errors, 0 warnings | PASS | Exit code 0 |
| QG4-3 | Vitest unit, store, & DOM tests lulus 100% (95 tests) | PASS | Exit code 0 |
| QG4-4 | Production build (`vite build`) bersih tanpa error | PASS | Exit code 0 |
| QG4-5 | Responsive verification (16 skenario viewport) 0 overflow/clipping | PASS | Exit code 0 |
| QG4-6 | Penegakan Separation of Duties (SoD) tervalidasi pada store & UI | PASS | Exit code 0 |
| QG4-7 | Isolasi privasi profil & saldo anggota tanpa fallback | PASS | Exit code 0 |

---

### Phase 5: Loan & Installment Management (SELESAI)

**Objective:** Mengimplementasikan modul bisnis pinjaman dan angsuran koperasi secara menyeluruh, terintegrasi, dan taat azas Separation of Duties (SoD) serta kewenangan berjenjang tanpa backend nyata.

**Scope:**
- Manajemen 3 Produk Pinjaman: Pinjaman Konsumtif, Pinjaman Modal Usaha Produktif, dan Pinjaman Siaga Darurat.
- Formula Finansial & Amortisasi: Flat Rate (default), Anuitas, Efektif, presisi Integer Rupiah, dan residual rounding ke angsuran bulan terakhir.
- Denda & Kolektibilitas: Grace period 3 hari, denda 0,5%/hari, klasifikasi kolektibilitas (Lancar, DPK, Kurang Lancar, Diragukan, Macet).
- Portal Pinjaman Anggota (`/portal/pinjaman`): Saldo sisa pokok, jadwal angsuran detail, wizard pengajuan pinjaman 4 langkah dengan simulasi unggah bukti pendapatan, dan simulasi pelunasan dipercepat (early repayment).
- Administrasi Pinjaman Pengurus & Staf (`/admin/pinjaman`): Antrean verifikasi Staf (Level 1), analisa FO (Level 2 $\le$ 10M), approval Pengurus (Level 3 $>$ 10M), antrean pencairan dana khusus FO dengan potongan admin fee 1%, portofolio 30 rekord pinjaman lengkap, pencatatan angsuran dengan prioritas alokasi BR-04.3, penyesuaian denda eksklusif Bendahara, dan konfigurasi kebijakan pinjaman.
- Katalog Publik & Edukasi (`/layanan/pinjaman`): Simulasi pinjaman interaktif dan ketentuan kelayakan keanggotaan.

**Deliverables:**
- [x] `src/features/loans/types.ts`
- [x] `src/features/loans/utils/loanCalculations.ts`
- [x] `src/features/loans/mocks/loanSeedData.ts` (30 seed records)
- [x] `src/features/loans/stores/loanStore.ts` (Zustand + `localStorage` persistence `kmb_loans_store_v1`)
- [x] `src/features/loans/pages/PublicLoanCatalogView.tsx`
- [x] `src/features/loans/pages/MemberLoanPortalView.tsx`
- [x] `src/features/loans/pages/AdminLoanManagementView.tsx`
- [x] Integrasi route di `src/app/routes.tsx`
- [x] Unit, Store, & Component DOM Tests (57 loan tests, 206 tests passing total)
- [x] `docs/PHASE_5_IMPLEMENTATION_REPORT.md` (Termasuk laporan remediasi Phase 5.1)

**Quality Gates Phase 5 (Termasuk Remediasi 5.1):**
| # | Kriteria | Status | Bukti |
|---|----------|--------|-------|
| QG5-1 | Typecheck (`tsc --noEmit`) lulus tanpa error | PASS | Exit code 0 |
| QG5-2 | Linting (`eslint`) 0 errors, 0 warnings | PASS | Exit code 0 |
| QG5-3 | Vitest unit, store, & DOM tests lulus 100% (206 tests) | PASS | Exit code 0 |
| QG5-4 | Production build (`vite build`) bersih tanpa error | PASS | Exit code 0 |
| QG5-5 | Responsive verification (16 skenario viewport) 0 overflow/clipping | PASS | Exit code 0 |
| QG5-6 | Penegakan Separation of Duties (SoD) & approval thresholds | PASS | Exit code 0 |
| QG5-7 | Isolasi privasi data anggota tanpa fallback | PASS | Exit code 0 |
| QG5-8 | Financial Integrity: Anti-overpayment, idempotency key, & waived future interest | PASS | Exit code 0 |

---

### Phase 6: Administration Portal

**Objective:** Membangun portal administrasi lengkap dengan alur verifikasi, persetujuan bertingkat, rekonsiliasi, dan manajemen operasional.

**Scope:** Seluruh lingkungan `/admin`.

**Deliverables:**
- Admin Shell: Sidebar multi-level, Top Bar dengan indikator peran
- Dashboard Operasional (`/admin/dashboard`)
- Manajemen Anggota (`/admin/anggota`, `/pendaftaran`, `/:id`)
- Manajemen Simpanan (`/admin/simpanan`, `/:id`, `/transaksi`)
- Manajemen Pinjaman (jika modul aktif): pengajuan, persetujuan bertingkat, pencairan, portofolio
- Kas & Keuangan: buku kas, rekonsiliasi pembayaran
- Manajemen Konten (CMS berita/pengumuman)
- Manajemen Pengguna Staf (`/admin/pengguna`, `/:id`)
- Audit Log (`/admin/audit`)
- Konfigurasi (`/admin/konfigurasi`, sub-halaman)
- Demo Tools (termasuk eksekutor Reset Demo)

**Acceptance Criteria:**
- Alur verifikasi pendaftaran calon anggota selesai end-to-end.
- Workflow persetujuan pinjaman berjalan sesuai matriks kewenangan.
- Rekonsiliasi pembayaran manual memperbarui saldo dan jadwal.
- Hak akses berbasis peran ditegakkan: 7 peran administratif memiliki tampilan dan kemampuan berbeda.
- Semua tabel memiliki scroll horizontal atau card-list fallback di mobile.

**Quality Gates Phase 6:**
| # | Kriteria |
|---|----------|
| QG6-1 | Alur verifikasi anggota baru end-to-end |
| QG6-2 | Workflow persetujuan pinjaman bertingkat berfungsi |
| QG6-3 | Rekonsiliasi pembayaran memperbarui state |
| QG6-4 | Hak akses peran ditegakkan untuk 7 peran admin |
| QG6-5 | Semua tabel responsif tanpa page overflow |
| QG6-6 | Persetujuan eksplisit pengguna diperoleh |

---

### Phase 7: Laporan Keuangan & Audit Simulasi

**Objective:** Membangun modul laporan keuangan demonstrasi dengan visualisasi data, layout cetak, dan tampilan audit trail read-only.

**Scope:** Semua halaman di `/admin/laporan` dan `/admin/audit`.

**Deliverables:**
- Neraca Demonstrasi dengan perbandingan periode
- Laporan Laba Rugi Demonstrasi
- Laporan Arus Kas Demonstrasi
- Laporan Kolektibilitas & NPL dengan chart bar (jika modul Loan aktif)
- Laporan Distribusi SHU (jika modul SHU aktif)
- Audit Trail read-only dengan filter berdasarkan peran, aksi, entitas, dan tanggal
- Layout CSS print-optimized untuk semua laporan

**Acceptance Criteria:**
- Neraca simulasi seimbang: Total Aset = Total Kewajiban + Ekuitas.
- Semua chart mengikuti DESIGN_SYSTEM.md (solid, tanpa gradien).
- Auditor/Pengawas memiliki akses read-only ke semua laporan dan audit log.
- Layout cetak menghasilkan tampilan yang bersih di lebar kertas standar.
- Header laporan memuat penanda: `LAPORAN KEUANGAN SIMULASI (DEMONSTRASI)`.

**Quality Gates Phase 7:**
| # | Kriteria |
|---|----------|
| QG7-1 | Neraca simulasi seimbang |
| QG7-2 | Semua chart sesuai aturan visual (nol gradien) |
| QG7-3 | Auditor hanya memiliki akses read-only |
| QG7-4 | Layout cetak bersih |
| QG7-5 | `npm run build` bersih |
| QG7-6 | Persetujuan eksplisit pengguna diperoleh |

---

### Phase 8: QA, Aksesibilitas & Penguatan Responsif

**Objective:** Melakukan pengujian menyeluruh, audit aksesibilitas, konfirmasi responsif di semua breakpoint, verifikasi konsistensi data simulasi, dan menyiapkan bahan presentasi klien.

**Scope:** Seluruh platform. Nol fitur baru; hanya perbaikan, penguatan, dan verifikasi.

**Deliverables:**
- Audit responsif menyeluruh di 320, 375, 390, 768, 1024, 1280, 1440, 1920px — semua halaman
- Konfirmasi nol horizontal page overflow di semua rute
- Pengujian keyboard navigation dan focus trap
- Verifikasi kontras warna pada pasangan warna yang digunakan (target WCAG 2.2 AA)
- Verifikasi konsistensi data seed (saldo = jumlah transaksi, neraca seimbang, dsb.)
- Pengujian `demoReset()` — dikonfirmasi mengembalikan state seed secara bersih
- `docs/DEMO_WALKTHROUGH_SCRIPT.md` — skrip presentasi klien

**Acceptance Criteria (Final):**
- Semua 8 peran dapat mendemonstrasikan alur tugas utama.
- 18 user flow dari USER_FLOWS.md dapat diselesaikan tanpa error.
- 8 viewport uji: nol horizontal overflow.
- `npm run build` bersih.
- `demoReset()` berfungsi secara andal.
- Nol gradien, nol glassmorphism, nol library tidak diizinkan.

**Quality Gates Phase 8 (Final Acceptance):**
| # | Kriteria |
|---|----------|
| QG8-1 | 8 peran + 18 alur fungsional dan selesai |
| QG8-2 | 8 viewport: nol horizontal overflow |
| QG8-3 | Keyboard navigation berfungsi di semua interaksi |
| QG8-4 | Kontras warna terverifikasi ≥ 4.5:1 untuk body text |
| QG8-5 | `npm run build` dan `npm run lint` bersih |
| QG8-6 | `demoReset()` andal |
| QG8-7 | `DEMO_WALKTHROUGH_SCRIPT.md` tersedia |
| QG8-8 | Final sign-off pengguna diterima |

---

## 4. Risk Register

| Risiko | Dampak | Probabilitas | Mitigasi |
|--------|--------|--------------|----------|
| Overflow tabel di mobile | Tinggi | Tinggi | Card-list fallback wajib di mobile; `overflow-x-auto` pada semua container tabel |
| Hak akses peran tidak konsisten | Tinggi | Sedang | Fungsi sentral `hasPermission(role, resource, action)` sebagai satu-satunya source of truth |
| Angka ilustratif disalahartikan sebagai standar regulasi | Tinggi | Rendah | Label `ILLUSTRATIVE` eksplisit dan peringatan di BUSINESS_RULES.md |
| Kesan gateway sungguhan terhadap penonton | Tinggi | Rendah | Demo banner permanen, label SIMULASI pada semua bukti transaksi dan QRIS |
| Keseragaman terminologi keuangan Indonesia | Sedang | Sedang | Glosarium terpusat di BUSINESS_RULES.md; diaudit per fase |
| Polusi state demonstrasi antar sesi | Tinggi | Rendah | Prefix namespace `koperasi_demo_v1_` dan `demoReset()` yang andal |
