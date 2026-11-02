# Information Architecture — Platform Digital Koperasi Indonesia
**Version:** 0.2 (Phase 0 Refined)
**Status:** PROPOSED — Under Review
**Date:** 2026-11-02

---

## 1. Prinsip Arsitektur Navigasi

Platform terdiri dari tiga lingkungan produk yang dilayani dalam satu SPA dengan routing terpadu:

```
[Platform Digital Koperasi]
   |
   +-- 1. Public Website          (/)
   |
   +-- 2. Member Portal           (/portal)
   |
   +-- 3. Administration Portal   (/admin)
```

### 1.1 Prinsip Navigasi Adaptif Modul

**PENTING:** Navigasi, rute, dan komponen dashboard bersifat dinamis mengikuti `activeModules` dari `cooperativeConfig`. Ketentuan wajib:

1. **Modul Simpanan (`savings`) Tidak Aktif:**
   - **Public Website:** Item menu `/layanan/simpanan` disembunyikan dari navbar dan drawer. Akses langsung via URL menampilkan halaman status *Modul Tidak Aktif*.
   - **Member Portal:** Item menu `/portal/simpanan` dan seluruh subrutanya (`/portal/simpanan/:id`, `/portal/simpanan/setor`) disembunyikan. Kartu ringkasan saldo simpanan pada dashboard disembunyikan. Akses langsung via URL menampilkan halaman *Modul Tidak Aktif*.
   - **Administration Portal:** Grup menu `/admin/simpanan` dan seluruh subrutanya (`/admin/simpanan/:id`, `/admin/simpanan/transaksi`) disembunyikan. Sub-halaman konfigurasi `/admin/konfigurasi/simpanan` disembunyikan. Akses langsung via URL menampilkan halaman *Modul Tidak Aktif*.
   - **Dashboard & Laporan:** Metrik dan seksi laporan yang bersumber dari simpanan disembunyikan atau ditandai "Tidak Tersedia — Modul Nonaktif" tanpa merusak kesetimbangan neraca.
   - **Platform Core:** Tetap berfungsi penuh (manajemen anggota dasar, pengguna, audit logging, identitas koperasi, dan konfigurasi platform).
2. **Modul Pinjaman (`loans`) Tidak Aktif:**
   - Seluruh item menu, rute, kartu metrik, dan kalkulator yang berkaitan dengan pinjaman dan angsuran (`installments`) disembunyikan dari seluruh lingkungan.
   - Akses langsung via URL menampilkan halaman status *Modul Tidak Aktif*.
3. **Modul SHU (`shu`) Tidak Aktif:**
   - Seluruh item menu SHU, estimasi, dan riwayat distribusi tidak ditampilkan di Public, Portal, maupun Admin.
   - Akses langsung via URL menampilkan halaman status *Modul Tidak Aktif*.
4. **Prinsip Universal Modul Bisnis Nonaktif:**
   - Rute langsung yang dinonaktifkan **tidak pernah menghasilkan error 404** atau blank page, melainkan komponen status *Modul Tidak Aktif* yang informatif.
   - Dashboard dan laporan tidak boleh menampilkan metrik yang menyesatkan untuk modul yang mati.
   - Navigasi platform minimal tetap berfungsi penuh meskipun hanya Platform Core yang aktif.

### 1.2 Aksesibilitas Halaman

| Kategori Halaman | Deskripsi |
|-----------------|-----------|
| Publik terbuka | Dapat diakses tanpa autentikasi apapun |
| Publik terbatas | Memerlukan kode registrasi (bukan akun) untuk cek status |
| Akses anggota | Memerlukan autentikasi simulasi sebagai anggota aktif |
| Akses staf/admin | Memerlukan autentikasi simulasi dengan peran administratif |

---

## 2. Public Website (`/`)

### 2.1 Peta Rute

```
/
├── /                              (Beranda)
├── /tentang-kami                  (Profil Koperasi, Visi-Misi, Struktur Organisasi)
├── /layanan                       (Ikhtisar Layanan)
│   ├── /layanan/simpanan          (Detail Produk Simpanan — tampil jika modul aktif)
│   ├── /layanan/pinjaman          (Detail Produk Pinjaman — tampil jika modul aktif)
│   └── /layanan/shu               (Tentang SHU — tampil jika modul aktif)
├── /cara-bergabung                (Syarat, Prosedur, dan Informasi Biaya Keanggotaan)
├── /transparansi                  (Informasi Publik: Laporan Singkat, Statistik Kelembagaan)
├── /berita                        (Berita & Pengumuman Koperasi)
│   └── /berita/:slug              (Detail Artikel Berita)
├── /faq                           (Pertanyaan yang Sering Diajukan)
├── /kontak                        (Alamat, Jam Operasional, Formulir Kontak)
├── /daftar                        (Wizard Pendaftaran Anggota Baru)
├── /cek-status                    (Pelacak Status Pendaftaran via Kode Registrasi)
└── /masuk                         (Gerbang Masuk — Member Portal & Admin Portal)
```

### 2.2 Struktur Navigasi Header (Desktop ≥ 768px)

```
Logo | Layanan ▾ | Tentang Kami | Cara Bergabung | Berita | Transparansi | Kontak || Cek Status | Daftar | Masuk
```

- Item "Layanan > Simpanan", "Layanan > Pinjaman", dan "Layanan > SHU" disembunyikan jika modul terkait tidak aktif.
- CTA utama: **[Daftar Sekarang]** (Primary Button) dan **[Masuk]** (Secondary Button).

### 2.3 Navigasi Mobile (< 768px)

- Sticky top bar: Logo + tombol hamburger.
- Drawer slide-over dari kiri: daftar link navigasi lengkap vertikal dengan tap target minimal 48px per item.
- CTA tombol Daftar dan Masuk selalu tampil di bawah menu drawer.

### 2.4 Footer

- Identitas koperasi (nama, nomor badan hukum, alamat, jam operasional)
- Navigasi cepat (Quick Links)
- Pernyataan disclaimer demo: *"Data dan informasi pada website ini merupakan bahan demonstrasi platform dan tidak mencerminkan operasional koperasi nyata."*
- Informasi pengurus untuk kontak (simulasi)

---

## 3. Member Portal (`/portal`)

### 3.1 Peta Rute

```
/portal
├── /portal/dashboard              (Dashboard Ringkasan Portofolio Anggota)
├── /portal/simpanan               (Daftar Rekening Simpanan — tampil jika modul aktif)
│   ├── /portal/simpanan/:id       (Detail Rekening & Riwayat Mutasi — tampil jika modul aktif)
│   └── /portal/simpanan/setor     (Pengajuan Setoran Simpanan Baru — tampil jika modul aktif)
├── /portal/pinjaman               (Daftar Pinjaman — jika modul Loan aktif)
│   ├── /portal/pinjaman/:id       (Detail Pinjaman & Jadwal Angsuran)
│   └── /portal/pinjaman/ajukan    (Wizard Pengajuan Pinjaman Baru)
├── /portal/transaksi              (Riwayat Semua Transaksi)
│   └── /portal/transaksi/:id      (Detail Transaksi / Simulasi Bukti)
├── /portal/pembayaran             (Pusat Pembayaran Simulasi)
│   ├── /portal/pembayaran/manual  (Konfirmasi Transfer Manual + Upload Bukti Simulasi)
│   └── /portal/pembayaran/instan  (Kanal Gateway: VA Simulasi + QRIS Mock)
├── /portal/shu                    (Proyeksi & Riwayat SHU — jika modul SHU aktif)
├── /portal/unit-usaha             (Katalog & Transaksi Unit Usaha — jika modul business_units aktif)
├── /portal/rapat                  (Rapat Anggota & E-Voting — jika modul meetings aktif)
├── /portal/profil                 (Profil Anggota & Status Dokumen)
├── /portal/notifikasi             (Pusat Notifikasi)
├── /portal/bantuan                (Bantuan / Kontak Koperasi)
└── /portal/pengaturan             (Pengaturan Akun)
```

### 3.2 Struktur Navigasi — Member Portal

> **Pola navigasi mengikuti tabel acuan kanonik di `RESPONSIVE_SPECIFICATION.md` Seksi 11.1.**

**Desktop (≥ 1024px):**
- Fixed left sidebar (240px / `w-60`) + Top bar (breadcrumb, notifikasi bell, avatar + menu cepat, indikator peran)

**Tablet (768–1023px):**
- Slide-over sidebar on-demand via hamburger button di top bar.

**Mobile (< 768px):**
- Bottom navigation bar + slide-over drawer "Lainnya".

**Sidebar Items (Tampil Sesuai Modul Aktif):**
- Dashboard
- Simpanan *(tampil jika modul `savings` aktif)*
- Pinjaman *(tampil hanya jika `loans` aktif)*
- Riwayat Transaksi
- Pusat Pembayaran
- SHU Saya *(tampil hanya jika `shu` aktif)*
- Unit Usaha *(tampil hanya jika `business_units` aktif)*
- Rapat Anggota *(tampil hanya jika `meetings` aktif)*
- Profil & Dokumen
- Notifikasi *(tampil hanya jika `notifications` aktif)*
- Bantuan

---

## 4. Administration Portal (`/admin`)

### 4.1 Peta Rute

```
/admin
├── /admin/dashboard               (Dashboard Operasional — KPI & Antrean Tugas)
├── /admin/anggota                 (Manajemen Direktori Anggota)
│   ├── /admin/anggota/:id         (Detail Anggota: Profil, Rekening, Dokumen, Riwayat)
│   └── /admin/anggota/pendaftaran (Antrean Verifikasi Calon Anggota Baru)
├── /admin/simpanan                (Manajemen Simpanan — tampil jika modul aktif)
│   ├── /admin/simpanan/:id        (Detail Rekening Simpanan — tampil jika modul aktif)
│   └── /admin/simpanan/transaksi  (Entri Setoran / Penarikan Manual oleh Staf — tampil jika modul aktif)
├── /admin/pinjaman                (Manajemen Pinjaman — tampil jika modul Loan aktif)
│   ├── /admin/pinjaman/pengajuan  (Antrean Pengajuan Masuk)
│   ├── /admin/pinjaman/persetujuan (Antrean Persetujuan Bertingkat)
│   ├── /admin/pinjaman/pencairan  (Antrean Siap Cair)
│   ├── /admin/pinjaman/aktif      (Portofolio Pinjaman Aktif & Monitoring Kolektibilitas)
│   └── /admin/pinjaman/:id        (Detail Pinjaman & Buku Angsuran)
├── /admin/unit-usaha              (Manajemen Unit Usaha — tampil jika modul business_units aktif)
├── /admin/rapat                   (Penyelenggaraan Rapat Anggota & Kuorum Digital — tampil jika modul meetings aktif)
├── /admin/keuangan                (Manajemen Kas & Transaksi)
│   ├── /admin/keuangan/kas        (Buku Kas Harian Simulasi)
│   ├── /admin/keuangan/transaksi  (Log Transaksi Operasional)
│   └── /admin/keuangan/rekonsiliasi (Rekonsiliasi & Konfirmasi Pembayaran Manual)
├── /admin/laporan                 (Laporan Keuangan & Statistik)
│   ├── /admin/laporan/neraca      (Neraca Demonstrasi)
│   ├── /admin/laporan/laba-rugi   (Laporan Laba Rugi Demonstrasi)
│   ├── /admin/laporan/arus-kas    (Laporan Arus Kas Demonstrasi)
│   ├── /admin/laporan/kolektibilitas (Laporan NPL & Kolektibilitas — jika modul Loan aktif)
│   └── /admin/laporan/shu         (Laporan & Distribusi SHU — jika modul SHU aktif)
├── /admin/cms                     (Manajemen Konten — Berita & Pengumuman)
│   ├── /admin/cms/artikel         (Daftar Artikel)
│   └── /admin/cms/artikel/:id     (Editor Artikel)
├── /admin/pengguna                (Manajemen Pengguna & Staf Internal)
│   └── /admin/pengguna/:id        (Detail Pengguna & Konfigurasi Hak Akses)
├── /admin/audit                   (Audit Log Aktivitas — Read Only)
├── /admin/konfigurasi             (Konfigurasi Koperasi & Produk)
│   ├── /admin/konfigurasi/koperasi (Profil, Identitas, Modul Aktif)
│   ├── /admin/konfigurasi/simpanan (Parameter Produk Simpanan — tampil jika modul aktif)
│   └── /admin/konfigurasi/pinjaman (Parameter Produk Pinjaman — jika modul aktif)
└── /admin/pengaturan              (Pengaturan Platform & Demo Tools)
```

### 4.2 Struktur Navigasi — Administration Portal

> **Pola navigasi mengikuti tabel acuan kanonik di `RESPONSIVE_SPECIFICATION.md` Seksi 11.2.**

**Desktop (≥ 1024px):**
- Fixed left sidebar (256px / `w-64`) dengan grup seksi, divider, dan sub-navigasi akordeon.
- Top bar: Breadcrumb + Indikator Peran Aktif + Notifikasi + Avatar.

**Tablet (768–1023px) & Mobile (< 768px):**
- Hamburger button di top bar → Slide-over sidebar kiri.
- Tidak ada bottom tab bar di Administration Portal.

**Grup Sidebar (Menyesuaikan Modul Aktif):**
- **Operasional:** Dashboard
- **Anggota:** Manajemen Anggota, Verifikasi Pendaftaran
- **Simpanan** *(hanya jika modul `savings` aktif)*: Manajemen Simpanan, Entri Transaksi
- **Pinjaman** *(hanya jika modul `loans` aktif)*: Pengajuan, Persetujuan, Pencairan, Portofolio Aktif
- **Unit Usaha** *(hanya jika modul `business_units` aktif)*: Manajemen Unit Usaha, Rekap Omzet
- **Rapat Anggota** *(hanya jika modul `meetings` aktif)*: Agenda RAT, Kuorum Digital, E-Voting
- **Keuangan:** Kas, Rekonsiliasi
- **Laporan** *(modul `reports`)*: Neraca, Laba Rugi, Arus Kas, NPL *(jika modul `loans` aktif)*, SHU *(jika modul `shu` aktif)*
- **Konten:** Artikel & Pengumuman
- **Administrasi:** Manajemen Pengguna, Audit Log *(modul `audit_trail`)*
- **Konfigurasi:** Platform, Produk

---

## 5. Model Peran, Hak Akses & Kewenangan Finansial

### 5.1 Prinsip Arsitektur Otorisasi

Pembedaan empat konsep fundamental yang tidak boleh dicampur:

| Konsep | Definisi | Contoh |
|--------|----------|--------|
| **Role** | Identitas peran teknis di dalam sistem aplikasi | `member`, `staff`, `finance_officer`, `admin` |
| **Permission** | Izin granular untuk melakukan tindakan tertentu pada domain tertentu | `loans:review`, `savings:record`, `reports:view` |
| **Organizational Position** | Jabatan atau struktur organisasi resmi di koperasi | Ketua, Sekretaris, Bendahara, Pengawas |
| **Approval Authority** | Kewenangan formal untuk menyetujui keputusan (sering kali dibatasi nilai nominal) | Limit persetujuan s.d. Rp 10.000.000 |

> **Prinsip Utama:** Role teknis tidak otomatis mewarisi seluruh Approval Authority. Administrator sistem tidak otomatis menjadi pemegang otoritas keuangan koperasi. Otoritas transaksi diatur secara terpisah melalui matriks kewenangan.

### 5.2 Prinsip Pemisahan Tugas (Separation of Duties / SoD)

Untuk menjamin tata kelola yang baik, transparansi institusional, dan mencegah konflik kepentingan:
1. **Pembuat ≠ Penyetuju:** Pengguna yang membuat atau mencatat suatu pengajuan transaksi tidak dapat bertindak sebagai penyetuju pada transaksi yang sama.
2. **Pemeriksa ≠ Pelaksana:** Staf yang memverifikasi berkas pinjaman tidak dapat merangkap sebagai pihak yang mengeksekusi pencairan.
3. **Pencatat ≠ Penghapus Log:** Pengguna yang memiliki hak entri data tidak memiliki izin untuk memodifikasi atau menghapus jejak audit.
4. **Auditor murni Read-Only:** Auditor dan Pengawas hanya memiliki hak akses baca (view/export) terhadap seluruh data; dilarang memiliki hak tulis (create, update, delete, approve).
5. **Pemisahan Alur Keanggotaan:** Pemeriksaan kelengkapan berkas dan verifikasi dilakukan oleh Staf; rekomendasi diteruskan ke Pengurus; persetujuan final keanggotaan adalah hak prerogatif Pengurus / Board (bukan Staf, bukan Administrator).
6. **Administrator Sistem Terbatas:** Administrator mengelola pemeliharaan sistem, akun pengguna, dan konfigurasi teknis; **tidak memiliki kewenangan menyetujui transaksi finansial, mencatat jurnal kas, melakukan rekonsiliasi, mengoreksi saldo, mencairkan pinjaman, menyetujui buku kas, maupun menyetujui keanggotaan organisasi**. Hak akses Administrator terhadap laporan keuangan dibatasi secara tegas hanya untuk **View dan Export** teknis demi audit sistem dan pencadangan (backup data), tanpa izin intervensi data.
7. **Super Admin Terbatas:** Super Admin mengelola konfigurasi infrastruktur dan siklus demo platform; **tidak memiliki kewenangan atas keputusan bisnis koperasi maupun transaksi keuangan apapun**.

### 5.3 Klasifikasi Peran Pengguna

| Klasifikasi | Peran | Lingkungan | Sifat Akses |
|-------------|-------|------------|-------------|
| **Public Journey State** | Visitor | Public Website | Publik anonim |
| **Public Journey State** | Applicant | Public Website | Pelacakan via kode registrasi |
| **Authenticated Member** | Member | Member Portal | Data pribadi & rekening sendiri |
| **Operational Staff** | Staff | Admin Portal | Pemrosesan tugas operasional |
| **Operational Staff** | Finance Officer | Admin Portal | Pencatatan & analisa keuangan |
| **Financial Authority** | Treasurer | Admin Portal | Pengawasan kas, anggaran, likuiditas |
| **Governance / Oversight** | Manager / Board | Admin Portal | Persetujuan strategis & operasional |
| **Governance / Oversight** | Supervisor / Auditor | Admin Portal | Pengawasan kepatuhan (Read-Only) |
| **Platform Administration** | Administrator | Admin Portal | Manajemen operasional sistem |
| **Platform Administration** | Super Admin | Admin Portal | Konfigurasi teknis & platform |

### 5.4 Matriks Kewenangan Granular (Domain × Action)

> **Kode Tindakan:** `V` = View, `C` = Create, `U` = Update, `Ver` = Verify, `Rec` = Recommend / Reconcile, `A` = Approve, `Rj` = Reject, `E` = Execute/Disburse, `Adj` = Adjust, `Exp` = Export, `D` = Deactivate.
> Tanda `~` = Terbatas pada data milik sendiri. Tanda `-` = Tidak memiliki izin.

| Domain | Tindakan | Member | Staff | Finance Officer | Treasurer | Manager / Board | Auditor | Admin | Super Admin |
|--------|----------|:------:|:-----:|:---------------:|:---------:|:---------------:|:-------:|:-----:|:-----------:|
| **Membership** | View | V~ | V | V | V | V | V | V | V |
| | Create (Daftar) | - | C | - | - | - | - | C | - |
| | Update | U~ | U | - | - | - | - | U | - |
| | Verify & Kelengkapan | - | Ver | - | - | - | - | - | - |
| | Recommend | - | Rec | - | - | - | - | - | - |
| | Approve / Reject | - | -¹ | - | - | A/Rj¹ | - | -² | -² |
| **Savings** | View | V~ | V | V | V | V | V | V | V |
| | Record (Setor/Tarik) | C~ (req) | C | C | - | - | - | -² | - |
| | Verify | - | Ver | Ver | - | - | - | - | - |
| | Approve / Reject | - | - | A/Rj | A/Rj | A/Rj | - | -² | -² |
| | Adjust (Koreksi) | - | - | - | Adj | - | - | -² | -² |
| **Loans** | View | V~ | V | V | V | V | V | V | V |
| | Review (Analisa) | - | Ver | Ver | - | V | V | V | - |
| | Approve / Reject | - | Ver (Lv1) | A/Rj (Lv2) | - | A/Rj (Lv3) | - | -² | -² |
| | Disburse (Pencairan) | - | - | E | - | - | - | -² | -² |
| **Installments** | View | V~ | V | V | V | V | V | V | V |
| | Record (Bayar) | C~ (req) | C | C | - | - | - | -² | - |
| | Verify | - | Ver | Ver | - | - | - | - | - |
| | Adjust (Denda dll.) | - | - | - | Adj | - | - | -² | -² |
| **Cash** | View | - | - | V | V | V | V | V | V |
| | Record (Jurnal Kas) | - | - | C | C | - | - | -² | -² |
| | Reconcile | - | - | Rec | Rec | - | - | -² | -² |
| | Approve (Buku Kas) | - | - | - | A | A | - | -² | -² |
| **Reports** | View | V~ | - | V | V | V | V | V | V |
| | Export | Exp~ | - | Exp | Exp | Exp | Exp | Exp | Exp |
| **Users** | View | - | - | - | - | V | - | V | V |
| | Create / Update | - | - | - | - | - | - | C/U | C/U |
| | Deactivate | - | - | - | - | - | - | D | D |
| **Platform Config** | View | - | - | - | V | V | - | V | V |
| | Update | - | - | - | - | - | - | U | U |
| **Product Config** | View | - | - | V | V | V | - | V | - |
| | Update / Putuskan | - | - | - | U³ | A/U³ | - | U (mandat) | - |
| **Audit** | View | - | - | - | - | V | V | V | V |
| | Export | - | - | - | - | - | Exp | Exp | Exp |

*Catatan kaki:*
¹ **Otoritas Persetujuan Keanggotaan:** Staf operasional hanya berwenang memeriksa kelengkapan berkas, melakukan verifikasi administratif, dan memberikan rekomendasi (`Rec`). Hak persetujuan keanggotaan final adalah kewenangan organisasi yang dipegang oleh Pengurus / Board (atau Rapat Pengurus). Penetapan struktur otoritas final definitif (apakah Ketua Pengurus, Rapat Pengurus, atau pendelegasian khusus): `UNRESOLVED`. Sistem otomatis menerbitkan Nomor Anggota setelah persetujuan final dicatat.
² **Pemisahan Peran Administratif vs Kewenangan Finansial/Bisnis:** Administrator sistem dan Super Admin **tidak memiliki izin menyetujui transaksi simpanan/pinjaman, melakukan rekonsiliasi kas, mengoreksi saldo, mencairkan pinjaman, menyetujui buku kas, maupun memberikan persetujuan keanggotaan organisasi**. Tugas Administrator adalah manajemen teknis platform, pengelolaan akun pengguna, dan konfigurasi sistem.
³ **Kewenangan Konfigurasi Produk Keuangan:** Parameter produk keuangan (bunga, plafon, denda, formula bagi hasil) merupakan kebijakan organisasi koperasi yang diputuskan oleh Pengurus / RAT; Administrator hanya melakukan penyesuaian teknis atas dasar mandat tertulis. Mekanisme persetujuan produk keuangan definitif: `UNRESOLVED`.
⁴ **Mekanisme Rapat Anggota & Simulasi E-Voting:** Hak kehadiran anggota aktif digunakan untuk pemenuhan kuorum sah rapat dan terpisah tegas dari hak suara e-voting. Presensi kehadiran tidak otomatis dihitung sebagai suara masuk; anggota berhak memilih Setuju, Tidak Setuju, atau Abstain pada setiap butir agenda. Sistem menjamin prinsip 1 Member = 1 Vote dan anti-double voting per butir agenda. Seluruh alur e-voting merupakan simulasi antarmuka (frontend mock) tanpa sistem kriptografis produksi.

### 5.5 Ambang Batas Persetujuan Pinjaman (Approval Thresholds)

Status: `CONFIGURABLE` — Nilai berikut adalah `ILLUSTRATIVE`:

| Level Persetujuan | Pemegang Kewenangan | Batas Nilai Demonstrasi | Catatan |
|-------------------|---------------------|------------------------|---------|
| Level 1 (Verifikasi) | Staff | Semua nilai pengajuan | Pemeriksaan kelengkapan dokumen |
| Level 2 (Analisa Finansial) | Finance Officer | s.d. Rp 10.000.000 | Penilaian kapasitas pengembalian |
| Level 3 (Otorisasi Pengurus) | Manager / Pengurus | Di atas Rp 10.000.000 | Keputusan operasional organisasi |

*Jika nilai pinjaman melebihi batas Level 2, sistem otomatis mensyaratkan eskalasi ke Level 3.*

---

## 6. Aturan Breadcrumb & Hierarki

- Breadcrumb ditampilkan pada semua sub-halaman di Member Portal dan Admin Portal.
- Halaman publik menggunakan judul halaman dan sub-judul; breadcrumb hanya di halaman detail.
- Level 1: Root lingkungan (`Portal`, `Admin`)
- Level 2: Seksi (`Pinjaman`, `Anggota`, `Laporan`)
- Level 3: Item atau Aksi (`Pengajuan Baru`, `ANG-2026-0042`)
- Breadcrumb di mobile dipotong dengan tombol Kembali tunggal saat lebih dari dua level.

---

## 7. Arketipe Layout Halaman

| Arketipe | Nama | Contoh Penggunaan |
|----------|------|-------------------|
| A | Content Page | Beranda, Tentang Kami, Layanan (Editorial, satu/dua kolom, footer) |
| B | Dashboard | Portal Dashboard, Admin Dashboard (KPI cards + area aktivitas utama + area sekunder) |
| C | Data Table View | Admin: Daftar Anggota, Daftar Pinjaman (Header + Filter Toolbar + Tabel + Paginasi) |
| D | Detail View | Portal: Detail Rekening, Admin: Detail Pinjaman (Back + Status Badge + Tabs + Action Bar) |
| E | Multi-Step Form | Pendaftaran, Pengajuan Pinjaman, Pengajuan Setoran (Progress Stepper + Form + Nav Batal/Kembali/Lanjut) |
| F | Report View | Laporan Keuangan (Period Selector + Report Table + Print Action) |

---

## 8. Strategi URL State

- State filter, pengurutan, dan paginasi pada daftar/tabel dicerminkan dalam URL search param: `?status=pending&page=2`.
- Memungkinkan navigasi browser maju/mundur di dalam tabel dan daftar.
- Pemilihan tab di halaman detail dicerminkan dalam search param: `?tab=jadwal-angsuran`.
- Status modal tidak menggunakan URL param; dikelola di component/UI store lokal.
