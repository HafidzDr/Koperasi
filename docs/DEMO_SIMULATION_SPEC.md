# Demo Simulation Specification — Platform Digital Koperasi Indonesia
**Version:** 0.2 (Phase 0 Refined)
**Status:** PROPOSED — Under Review
**Date:** 2026-11-02

---

## 1. Filosofi dan Prinsip Simulasi

Prototype ini adalah **alat demonstrasi berbasis peramban (frontend-only prototype)**. Seluruh data disemai (seeded), seluruh pemanggilan proses disimulasikan dengan controlled delay, seluruh mutasi data tersimpan di memori dan `localStorage`.

### 1.1 Prinsip Kejelasan Status Simulasi (Non-Negotiable)

Tujuan demonstrasi adalah **memperagakan alur penggunaan yang realistis** agar pengambil keputusan dapat mengevaluasi kapabilitas platform. Tujuan ini berbeda dari membuat kesan palsu bahwa aplikasi terhubung ke sistem perbankan nyata.

Dilarang menimbulkan kesan bahwa:
- Transaksi benar-benar terjadi atau melibatkan pemindahan dana riil.
- Saldo yang ditampilkan merupakan uang sungguhan milik pengguna.
- Bukti transaksi adalah dokumen hukum atau perbankan yang sah.
- Data anggota yang ditampilkan merupakan data warga negara yang asli.
- Pembayaran gateway (Virtual Account, QRIS) terhubung ke penyedia layanan sungguhan.
- Sistem autentikasi telah memenuhi standar keamanan produksi.

### 1.2 Format Identifikasi Demonstrasi

Semua nomor identitas dalam data demonstrasi menggunakan satu format identitas demonstrasi:
```
DEMO-ID-0001
DEMO-ID-0042
DEMO-ID-0050
```
**Dilarang mutlak menggunakan format NIK 16-digit**, baik NIK asli maupun format sintetis yang menyerupai struktur NIK nasional (`[6 digit kode wilayah][6 digit tgl lahir][4 digit urut]`).
- Semua formulir pendaftaran dan antarmuka profil wajib menggunakan label "ID Demonstrasi", bukan "Nomor KTP / NIK".
- Tidak ada validasi NIK nasional atau instruksi pembuatan identitas sintetis berstruktur NIK.
- Seluruh seed data menggunakan format `DEMO-ID-0001` secara seragam.

### 1.3 Penanda Visual Wajib

| Konteks | Penanda yang Harus Tampil |
|---------|--------------------------|
| Semua halaman (setiap lingkungan) | Banner permanen: `MODE DEMO — Data dan transaksi adalah simulasi` |
| Formulir pendaftaran (awal) | Pesan pembuka: `Demonstrasi. Jangan gunakan data pribadi asli.` |
| Setiap kartu saldo/metrik | Label kecil: `Nilai Simulasi` |
| Pratinjau dokumen | Watermark: `CONTOH DEMONSTRASI — BUKAN DOKUMEN SAH` |
| Bukti transaksi dan cetak | Watermark diagonal: `SIMULASI — BUKAN DOKUMEN SAH` |
| Laporan keuangan | Header: `LAPORAN KEUANGAN SIMULASI (DEMONSTRASI)` |
| Layar pembayaran gateway | Label kanal: `[Contoh Simulasi]` di bawah nama bank/kanal |

---

## 2. Batasan Penyimpanan Demonstrasi (localStorage)

Penyimpanan `localStorage` hanya digunakan untuk menyimpan state demonstrasi agar presentasi tidak ter-reset saat berpindah halaman atau merefresh peramban.

### 2.1 Yang Boleh Disimpan di localStorage
- State filter dan preferensi tampilan.
- Data mutasi demonstrasi yang dihasilkan dari interaksi presenter (misal: pengajuan baru yang disimulasikan).
- Riwayat transaksi simulasi.
- Konfigurasi koperasi dan status modul yang diaktifkan untuk demo.

### 2.2 Yang Dilarang Keras Disimpan di localStorage
- KTP asli, foto identitas asli, atau dokumen pribadi riil apapun.
- NIK asli warga negara Indonesia maupun format 16-digit sintetis berstruktur NIK.
- File berkas apapun dalam bentuk base64, biner, atau metadata dokumen asli (unggah dokumen hanya simulasi UI tanpa persistensi file).
- Password asli pengguna.
- Token autentikasi produksi yang sah.
- Informasi rekening bank asli.
- Data identitas pribadi yang dapat dihubungkan ke individu nyata.

Semua data yang tersimpan harus merupakan data sintetis yang dihasilkan oleh seed demonstrasi.

---

## 3. Katalog Data Seed Demonstrasi

> **Catatan:** Seluruh data di bawah ini memiliki status `ILLUSTRATIVE`. Nilai dan nama adalah fiktif dan dapat diubah tanpa mempengaruhi logika aplikasi.

### 3.1 Anggota Demonstrasi (50 Rekord)
- **Format ID Anggota:** `ANG-2026-XXXX` (4 digit angka)
- **Nama:** Nama fiktif yang merepresentasikan keragaman daerah Indonesia (Jawa, Sumatera, Sulawesi, Kalimantan, dsb.).
- **ID Demonstrasi:** Format tunggal `DEMO-ID-0001` hingga `DEMO-ID-0050` (seluruh bentuk NIK 16-digit, baik asli maupun format sintetis yang menyerupai NIK nasional, dilarang mutlak).
- **Distribusi status anggota:**
  - 35 Aktif
  - 5 Dalam Peninjauan (tunggakan simpanan wajib)
  - 5 Dibekukan
  - 3 Calon Anggota (menunggu verifikasi)
  - 2 Keluar / Mundur
- **Saldo Simpanan Pokok:** Rp 100.000 per anggota `ILLUSTRATIVE`
- **Saldo Simpanan Wajib:** Rentang Rp 500.000 – Rp 6.000.000 `ILLUSTRATIVE`
- **Saldo Simpanan Sukarela:** 30 anggota memiliki simpanan sukarela antara Rp 0 – Rp 25.000.000 `ILLUSTRATIVE`
- **Simpanan Berjangka:** 10 anggota memiliki deposito berjangka simulasi `ILLUSTRATIVE`
- **Tanggal bergabung:** Rentang Januari 2022 – Oktober 2026

### 3.2 Pinjaman Demonstrasi (30 Rekord — Jika Modul Loan Aktif)
- **Format ID:** `PJ-2026-XXXX`
- **Distribusi status pinjaman:**
  - 12 Aktif (Lancar)
  - 5 Dalam Perhatian Khusus (DPK)
  - 2 Kurang Lancar
  - 1 Macet
  - 5 Lunas
  - 3 Menunggu Persetujuan
  - 2 Ditolak
- **Jenis pinjaman:** 15 Konsumtif, 10 Produktif, 5 Darurat
- **Nominal pinjaman:** Rp 1.000.000 – Rp 50.000.000 `ILLUSTRATIVE`
- **Tenor:** 3, 6, 12, 18, 24, 36 bulan
- **Jadwal angsuran:** Dihasilkan secara dinamis untuk setiap pinjaman aktif

### 3.3 Transaksi Demonstrasi (200 Rekord)
- **Rentang tanggal:** 12 bulan terakhir (November 2025 – Oktober 2026)
- **Jenis transaksi:** Setor Simpanan, Tarik Simpanan, Angsuran Pinjaman, Pencairan Pinjaman, SHU, Biaya Administrasi
- **Deskripsi:** Menggunakan terminologi transaksi perbankan dan koperasi Indonesia yang realistis

### 3.4 Pengguna Sistem Demonstrasi

Pengguna demonstrasi dibagi menjadi dua kelompok berdasarkan cara aksesnya.

#### Kelompok A: Public Preview Context (Tanpa Akun Internal)

| Konteks | Cara Akses | Akun |
|---------|------------|------|
| Visitor | Akses langsung ke URL publik | Tidak diperlukan |
| Applicant | Mengisi formulir pendaftaran, mendapat kode registrasi | Bukan akun internal |

Konteks publik ini tidak membutuhkan akun terdaftar. Pelacakan menggunakan kode registrasi sintetis (`KOP-2026-XXXX`).

#### Kelompok B: Authenticated Demo Accounts (8 Akun Terkonfigurasi)

| No. | Peran | Nama Fiktif | Email Simulasi | Landing Page | Data Relevan |
|-----|-------|-------------|----------------|--------------|-------------|
| 1 | Member | Budi Santoso | budi@demo.koperasi.id | /portal/dashboard | Rekening simpanan, pinjaman aktif, transaksi |
| 2 | Staff | Dewi Lestari | dewi.staff@koperasi.id | /admin/anggota/pendaftaran | Antrean verifikasi pendaftaran |
| 3 | Finance Officer | Ahmad Fauzi | ahmad.fo@koperasi.id | /admin/pinjaman/persetujuan | Antrean analisa pinjaman, rekonsiliasi |
| 4 | Administrator | Rina Wijaya | rina.admin@koperasi.id | /admin/dashboard | Manajemen anggota, pengguna, konfigurasi |
| 5 | Manager / Pengurus | Hendra Kurniawan | hendra.board@koperasi.id | /admin/dashboard | Persetujuan pinjaman Lv.3, laporan strategis |
| 6 | Treasurer | Sri Mulyani | sri.treasurer@koperasi.id | /admin/keuangan/kas | Buku kas, rekonsiliasi, laporan keuangan |
| 7 | Supervisor / Auditor | Bambang Irawan | bambang.audit@koperasi.id | /admin/audit | Audit log read-only, laporan |
| 8 | Super Admin | Admin Demo | admin@koperasi.id | /admin/pengaturan | Konfigurasi platform, demo reset |

**Batasan akses sesuai prinsip SoD:**
- Ahmad Fauzi (Finance Officer): dapat menganalisa dan menyetujui pinjaman s.d. batas Level 2; **tidak dapat menyetujui pinjaman yang dia ajukan sendiri**.
- Hendra Kurniawan (Pengurus): dapat menyetujui pinjaman Level 3; **tidak dapat menyetujui pencairan yang dia rekomendasikan**.
- Rina Wijaya (Admin): mengelola data operasional; **tidak memiliki kewenangan menyetujui transaksi keuangan**.
- Bambang Irawan (Auditor): **murni read-only** di seluruh data; tidak ada tombol aksi tulis tersedia.
- Admin Demo (Super Admin): mengelola konfigurasi teknis; **tidak memiliki izin menyetujui pinjaman atau transaksi keuangan koperasi**.

**Password demonstrasi universal:** `demo1234`
Ditampilkan secara terbuka di halaman `/masuk` untuk efisiensi sesi demonstrasi. Ini adalah desain yang disengaja untuk mode demo tanpa backend; bukan kelemahan keamanan.

### 3.5 Berita & Pengumuman Demonstrasi (6 Artikel)
6 artikel berita koperasi dengan topik relevan: RAT tahunan, penyesuaian suku bunga, literasi keuangan, program simpanan baru, kemitraan, dan pengumuman pembagian SHU.

---

## 4. Layanan Simulasi Frontend (Simulation Services)

Seluruh layanan simulasi mengembalikan `Promise<T>` dan menambahkan latensi terprogram untuk merefleksikan proses riil.

### 4.1 Utilitas Latensi: `simulateAsync`
```typescript
// Fungsi dasar untuk seluruh layanan simulasi
export const simulateAsync = async <T>(data: T, delayMs: number = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
};
```
- Rentang latensi default: 500ms – 1500ms
- Simulasi error opsional: parameter `errorRate` (0–1) untuk mendemonstrasikan penanganan error

### 4.2 Layanan yang Tersedia

| Layanan | Berkas Target | Tanggung Jawab Utama |
|---------|---------------|----------------------|
| `authService` | `src/mock/services/authService.ts` | Login simulasi, logout, validasi sesi, role switcher |
| `memberService` | `src/mock/services/memberService.ts` | Daftar anggota, detail profil, permohonan baru, update status |
| `savingsService` | `src/mock/services/savingsService.ts` | Rekening simpanan, mutasi, pengajuan setoran, penarikan |
| `loanService` | `src/mock/services/loanService.ts` | Daftar pinjaman, pengajuan, persetujuan bertingkat, pencairan, jadwal |
| `paymentService` | `src/mock/services/paymentService.ts` | Pembayaran manual, konfirmasi staf, simulasi VA, simulasi QRIS |
| `reportService` | `src/mock/services/reportService.ts` | Neraca, laba rugi, arus kas, laporan portofolio/kolektibilitas, SHU |
| `auditService` | `src/mock/services/auditService.ts` | Pencatatan log aktivitas, query log audit read-only |
| `configService` | `src/mock/services/configService.ts` | Pengaturan koperasi, identitas, aktivasi modul |

---

## 5. Simulasi Pembayaran

### 5.1 Alur Transfer Manual & Keamanan Simulasi Unggah
1. Anggota memilih jenis pembayaran dan memasukkan nominal.
2. Sistem menampilkan rekening bank tujuan transfer (data simulasi).
3. **Simulasi Unggah Berkas:** Anggota dapat memilih dokumen contoh sintetis bawaan aplikasi atau melakukan interaksi unggah. Berkas yang dipilih pada perangkat pengguna **sama sekali tidak disimpan**: sistem tidak menyimpan base64, data biner, nama berkas lokal, atau metadata dokumen pribadi ke dalam storage maupun memori. Sistem secara otomatis mereferensikan aset placeholder sintetis bertanda `SIMULATED DOCUMENT`. Keterbatasan ini dijelaskan secara transparan pada antarmuka.
4. Data transaksi masuk ke antrean rekonsiliasi berstatus "Menunggu Konfirmasi".
5. Petugas keuangan (Finance Officer) mengonfirmasi atau menolak bukti tersebut dari Admin Portal.
6. Konfirmasi langsung memperbarui status tagihan atau saldo simpanan secara simulasi.

### 5.2 Alur Gateway Pembayaran Instan
1. **Virtual Account (VA):**
   - Menghasilkan nomor VA sintetis: `[KODE_BANK]70017[NOMOR_ANGGOTA_PADDED]`.
   - Nama bank yang digunakan (misal: "BCA VA", "Mandiri VA") adalah konfigurasi ilustratif.
   - Timer countdown 15 menit berjalan secara visual.
   - Tombol demo: "Simulasikan Pembayaran Berhasil" tersedia.
   - Mengklik tombol menyimulasikan penerimaan webhook setelah delay 1200ms.
2. **QRIS Mockup:**
   - Menampilkan gambar placeholder QRIS statis bertuliskan "SIMULASI QRIS — BUKAN KODE NYATA".
   - Timer countdown yang sama berjalan.
   - Tombol demo yang sama memicu penyelesaian simulasi.

---

## 6. Manajemen State Demonstrasi & Perilaku Sesi

### 6.1 Perbedaan Operasi Sesi

| Operasi | Yang Terjadi | Dampak pada Data Mutasi Demo | Dampak pada Preferensi Browser |
|---------|-------------|------------------------------|-------------------------------|
| **Browser Reload (F5)** | Halaman dimuat ulang; state memori dibaca kembali dari `localStorage` | Tidak ada perubahan; mutasi demo tetap tersimpan | Tidak ada perubahan |
| **Session Expiration / Browser Ditutup** | `sessionStorage` terhapus otomatis | Pengguna harus login kembali; mutasi demo di `localStorage` tetap ada | Tidak ada perubahan |
| **Logout** | `useAuthStore` dan `sessionStorage` dibersihkan; diarahkan ke `/masuk` | Mutasi demo di `localStorage` tetap ada | Tidak ada perubahan |
| **Reset Demo** | Seluruh kunci `koperasi_demo_v1_*` dihapus; semua store di-reseed; diarahkan ke `/` | **Semua perubahan simulasi dihapus** | Preferensi browser lain tidak terpengaruh |

> **Prinsip Penting:** Reset Demo hanya menghapus data demo (prefix `koperasi_demo_v1_`). Dilarang menghapus cookies, riwayat, atau data aplikasi lain di peramban yang tidak terkait.

### 6.2 Alur Eksekusi Reset Demo

```
1. Operator mengklik "Reset Data Demonstrasi"
2. [Modal] Konfirmasi Wajib:
   "Seluruh perubahan demo akan dihapus dan data dikembalikan ke kondisi awal (seed v1.0)."
   [Batal] (Secondary) | [Ya, Reset Sekarang] (Destructive)
3. Konfirmasi → eksekusi:
   a. Hapus kunci ber-prefix koperasi_demo_v1_ dari localStorage
   b. Re-inisialisasi semua store dari berkas seed/
   c. Set auth ke konteks awal (Visitor / tidak login)
   d. Bersihkan sessionStorage demo
4. [Toast] "Data demonstrasi berhasil dikembalikan ke kondisi awal."
5. [Redirect] → / (Beranda Public)
```

### 6.3 Zustand Stores

| Store | Tanggung Jawab | Persistensi |
|-------|----------------|-------------|
| `useAuthStore` | Pengguna aktif, peran aktif, status autentikasi | `sessionStorage` |
| `useMemberStore` | Direktori anggota, pendaftaran baru, detail | `localStorage` |
| `useSavingsStore` | Rekening simpanan, mutasi transaksi | `localStorage` |
| `useLoanStore` | Pinjaman, persetujuan, jadwal angsuran | `localStorage` |
| `usePaymentStore` | Antrean pembayaran, rekonsiliasi | `localStorage` |
| `useReportStore` | Data laporan keuangan teragregasi | In-Memory / Computed dari seed |
| `useAuditStore` | Log audit aktivitas operasional | `localStorage` |
| `useConfigStore` | Identitas koperasi, modul aktif, parameter | `localStorage` |
| `useUIStore` | Sidebar mobile drawer, modal, notifikasi banner | In-Memory |
| `useDemoStore` | Status demo mode, versi seed, fungsi reset | In-Memory |

### 6.4 Prefix Namespace localStorage
Semua kunci penyimpanan demo menggunakan prefix: `koperasi_demo_v1_`

Data yang disimpan di localStorage (hanya data demo sintetis):
- Mutasi anggota simulasi (pendaftaran baru, perubahan status).
- Transaksi simpanan dan pinjaman yang dibuat selama sesi demo.
- Konfigurasi koperasi aktif untuk demo.

Data yang **dilarang** di localStorage:
- NIK asli atau format 16-digit apapun yang menyerupai NIK nasional.
- Berkas unggahan dalam bentuk base64, data biner, foto identitas pribadi, atau dokumen asli.
- Password produksi atau token autentikasi nyata.
- Informasi keuangan pribadi pengguna demonstrasi.

---

## 7. Sumber Data Laporan Keuangan Demonstrasi

### 7.1 Karakter Laporan Demonstrasi

Laporan keuangan demonstrasi adalah **representasi visual data teragregasi**, bukan hasil engine akuntansi double-entry otomatis bersertifikasi.

| Laporan | Sumber Data Utama | Sifat Data |
|---------|-------------------|------------|
| **Buku Kas Harian** | Transaksi simulasi aktif dari `usePaymentStore` + `useLoanStore` | Dinamis (diperbarui saat transaksi demo) |
| **Neraca** | Pre-computed balanced dataset di `mock/seed/reports/balanceSheet.ts` | Statis per periode; dijamin seimbang |
| **Laba Rugi** | Pre-computed dataset di `mock/seed/reports/incomeStatement.ts` | Statis per periode |
| **Arus Kas** | Pre-computed dataset di `mock/seed/reports/cashFlow.ts` | Statis per periode |
| **Kolektibilitas / NPL** | Dihitung dinamis dari rekord pinjaman aktif di `useLoanStore` | Dinamis |
| **Laporan SHU** | Kalkulator proporsional dari data simpanan & pinjaman aktif | Dinamis |

### 7.2 Jaminan Keseimbangan Neraca

Neraca demonstrasi dijamin seimbang karena menggunakan balanced seed yang telah divalidasi:
```
Total Aset = Total Kewajiban + Ekuitas (Selisih = 0)
```
Mutasi transaksi sesi demo tidak mengubah pre-computed balance sheet; mereka memperbarui ringkasan operasional saja. Jika modul bisnis (seperti `loans` atau `savings`) dinonaktifkan via konfigurasi, seksi laporan terkait disembunyikan atau ditandai "Tidak Tersedia — Modul Nonaktif" tanpa merusak kesetimbangan formula neraca.

### 7.3 Pernyataan Wajib pada Laporan

Header setiap laporan keuangan wajib menampilkan:
```
LAPORAN KEUANGAN SIMULASI (DEMONSTRASI)
BUKAN LAPORAN KEUANGAN RESMI KOPERASI
```

---

## 8. Status Komponen UI & Penanganan State

### 8.1 Loading State
- **Tabel:** Skeleton row (3–5 baris kotak abu-abu berkedip dengan `animate-pulse`), bukan ikon spinner tunggal di tengah halaman.
- **Kartu Metrik:** Skeleton rectangle yang mempertahankan dimensi kartu asli.
- **Tombol aksi:** Ikon `Loader2` dari Lucide dengan `animate-spin` di dalam tombol + status `disabled`.
- **Halaman detail:** Skeleton layout menyeluruh yang mencerminkan struktur halaman.

### 8.2 Empty State
Setiap daftar atau tabel yang tidak memiliki data wajib menampilkan komponen empty state yang informatif:
- Ikon Lucide netral (`h-10 w-10 text-ink-300`).
- Judul kondisi (misal: "Belum Ada Pengajuan Pinjaman").
- Deskripsi penjelasan atau langkah yang dapat diambil pengguna.
- Tombol aksi opsional (misal: "Ajukan Sekarang" atau "Reset Filter").

### 8.3 Error State Simulasi
- Validasi formulir: Pesan error spesifik per-field via React Hook Form + Zod.
- Error simulasi jaringan: Tersedia toggle pengujian untuk mendemonstrasikan error toast + tombol "Coba Lagi".

---

## 9. Kontrol Demonstrasi (Demo Controls UI)

### 9.1 Demo Role Switcher
- Komponen mengambang (floating panel) di pojok kiri bawah desktop; dapat diminimalkan.
- Memungkinkan presenter berganti peran secara instan tanpa melalui alur logout/login.
- Berpindah peran langsung memperbarui state navigasi dan hak akses antarmuka seketika.
- **Daftar Konteks & Akun pada Role Switcher:**
  - **Public Preview Context (Non-Auth):**
    - `Visitor` (Landing page: `/`)
    - `Applicant` (Pelacakan pendaftaran: `/cek-status`)
  - **Authenticated Demo Accounts (8 Peran Terkonfigurasi):**
    1. `Member` — Budi Santoso (`/portal/dashboard`)
    2. `Staff` — Dewi Lestari (`/admin/anggota/pendaftaran`)
    3. `Finance Officer` — Ahmad Fauzi (`/admin/pinjaman/persetujuan`)
    4. `Administrator` — Rina Wijaya (`/admin/dashboard`)
    5. `Manager / Pengurus` — Hendra Kurniawan (`/admin/dashboard`)
    6. `Treasurer` — Sri Mulyani (`/admin/keuangan/kas`)
    7. `Supervisor / Auditor` — Bambang Irawan (`/admin/audit`)
    8. `Super Admin` — Admin Demo (`/admin/pengaturan`)

### 9.2 Indikator Peran Aktif
- Top bar Admin Portal dan Member Portal menampilkan badge peran yang sedang aktif:
  Contoh: `[Peran: Finance Officer]` atau `[Peran: Anggota — Budi Santoso]`.

### 9.3 Modul Switcher (Dalam Panel Pengaturan)
- Memungkinkan penguji mengaktifkan/menonaktifkan modul bisnis (`Savings Management`, `Loan Management`, atau `SHU Management`) secara on-the-fly untuk menguji adaptasi antarmuka modular. Modul nonaktif otomatis menyembunyikan menu, rute, metrik, dan alur terkait (menampilkan status *Modul Tidak Aktif* informatif jika URL dikunjungi langsung).
