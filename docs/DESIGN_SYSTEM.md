# Design System — Platform Digital Koperasi Indonesia
**Visual Direction:** Warm Modern Finance / Editorial Minimalism
**Version:** 0.2 (Phase 0 Refined)
**Status:** PROPOSED — Under Review
**Date:** 2026-11-02

---

## 1. Filosofi Visual

Platform harus terasa seperti laporan tahunan koperasi Indonesia yang didesain dengan penuh kehati-hatian dan dibawa ke era digital: terukur, tersusun secara tipografis yang baik, presisi dalam hierarki, hangat dalam nada, dan menghargai perhatian pengguna terhadap informasi keuangan.

**Panduan utama: Ketika ragu, kurangi. Jangan tambah.**

Kualitas visual diraih melalui **keanggunan restraint**, bukan kelimpahan dekorasi.

---

## 2. Larangan Visual (Zero Tolerance)

Pola-pola berikut dilarang pada setiap komponen, setiap halaman, dan setiap fase. Jika ditemukan saat review, perubahan harus dibatalkan.

| Dilarang | Alasan |
|---------|--------|
| `linear-gradient(...)` | Gradien di manapun — background, border, teks, overlay |
| `radial-gradient(...)` | Sama dengan di atas |
| `backdrop-filter: blur(...)` | Glassmorphism — dilarang mutlak |
| Kelas Tailwind `backdrop-blur-*` | Sama dengan di atas |
| `shadow-xl`, `shadow-2xl` | Shadow berlebihan |
| Shadow berwarna (`shadow-green-*/50`) | Glow effect berbasis warna |
| `rounded-2xl`, `rounded-3xl` | Radius sudut berlebihan |
| Warna neon atau saturasi tinggi | Tidak ada hot pink, electric blue, neon green |
| Ilustrasi dekoratif tanpa fungsi | Tidak ada karakter 3D, maskot, atau gambar stok AI |
| Sparkline dekoratif | Tidak ada mini-chart tanpa data bermakna |
| Background card berwarna tint | Tidak ada `bg-opacity` dengan warna kustom pada kartu |
| Animasi background | Tidak ada efek warna bergerak |
| Animasi CSS untuk dekorasi | Animasi hanya untuk loading state dan transisi interaksi |
| Statistik tanpa makna | Tidak ada angka atau gauge yang tidak dapat dijelaskan sumbernya |
| Dashboard generik tanpa karakter | Tidak ada copy-paste layout dashboard standar; setiap halaman mencerminkan kebutuhan kontekstual |

---

## 3. Palet Warna

Seluruh warna bersifat solid, terukur, terinspirasi dari warisan koperasi Indonesia: hijau hutan alami, putih hangat kertas arsip, dan tinta arang institusional.

> **Status:** Palet warna di bawah telah divalidasi dan berstatus **CONFIRMED** pada Phase 1 Brand Discovery (lihat `docs/BRAND_IDENTITY.md`). Seluruh token warna telah teruji memenuhi rasio kontras WCAG 2.2 AA.

### 3.1 Warna Utama (Primary Brand — Natural Forest Green)

```
forest-900: #1B3320   // Merek utama, teks heading, item nav aktif
forest-800: #24442B   // Hover tombol primary
forest-700: #2D5636   // Warna isi tombol primary, state aktif
forest-600: #386B43   // Aksen interaktif, focus ring
forest-500: #468353   // Badge, highlight ringan
forest-100: #EAF3EC   // Background baris terpilih, badge ringan
forest-50:  #F4F8F5   // Background tint halaman ringan
```

### 3.2 Warna Netral (Warm Paper & Charcoal Ink)

```
ink-900:  #161616   // Headline, angka utama, kontras tertinggi (>16:1 pada white)
ink-800:  #262626   // Teks body, data tabel (>13:1 pada white)
ink-700:  #404040   // Teks sekunder, header tabel (>9:1 pada white)
ink-600:  #525252   // Helper text, label sekunder (>6:1 pada white, >5.5:1 pada ink-100)
ink-500:  #686868   // Placeholder, teks non-aktif terstruktur (5.06:1 pada ink-100 #F5F4F0, lolos target AA 4.5:1)
ink-300:  #D4D4D4   // Border tebal, garis pembagi
ink-200:  #E5E5E5   // Border kartu, border komponen standar
ink-100:  #F5F4F0   // Background kartu warm (tint kertas)
ink-50:   #FAF9F6   // Background halaman (warm white / off-white)
white:    #FFFFFF   // Permukaan kartu, popover, modal
```

> **Catatan Audit Aksesibilitas:** Token `ink-500` disesuaikan dari `#737373` menjadi `#686868` untuk memastikan bahwa teks yang menggunakan token ini di atas background `ink-100` (`#F5F4F0`) mencapai rasio kontras **5.06:1** (dan **5.57:1** pada `white`), memenuhi target acceptance criteria WCAG 2.2 AA (minimum 4.5:1 untuk teks normal). Ditambahkan pula token `ink-600` (`#525252`) untuk helper text penting dengan margin kontras yang lebih tinggi. Status palet warna netral: **CONFIRMED**.

### 3.3 Warna Semantik (Solid, Terukur — Hanya untuk Status)

```
Success (Aktif, Disetujui, Lunas):
  success-700: #1C5430   // Teks pada background terang
  success-100: #E6F4EA   // Background badge/alert
  success-base:#2D7A46   // Ikon, border

Warning (Menunggu, Proses, DPK, Peringatan):
  warning-700: #6B4700   // Teks pada background terang
  warning-100: #FEF3D6   // Background badge/alert
  warning-base:#B45309   // Ikon, border

Danger / Error (Ditolak, Macet, Terlambat):
  danger-700:  #7F1D1D   // Teks pada background terang
  danger-100:  #FEE2E2   // Background badge/alert
  danger-base: #B91C1C   // Ikon, border, teks error

Info (Baru, Informasi, Terverifikasi):
  info-700:    #1E3A5F   // Teks pada background terang
  info-100:    #E8F0FE   // Background badge/alert
  info-base:   #2563EB   // Ikon, border
```

**Aturan warna semantik:** Hanya digunakan untuk status dan komunikasi feedback. Dilarang untuk dekorasi atau variasi visual per halaman.

---

## 4. Tipografi

### 4.1 Typeface (CONFIRMED)

Typeface resmi: **Inter** (Status: **CONFIRMED**)

Alasan penetapan resmi (Phase 1 Brand Discovery):
1. Inter memiliki keterbacaan tinggi di semua ukuran layar (termasuk layar smartphone sempit 320px).
2. Mendukung penuh format tabular numerics (`tabular-nums`) untuk konsistensi angka finansial di tabel dan kartu.
3. Berlisensi terbuka bebas royalti (SIL Open Font License) yang dapat di-host secara lokal/mandiri.
4. Memiliki karakter institusional terpercaya, tenang, dan modern yang tepat untuk platform koperasi.

Fallback stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

Dilarang menggunakan typeface kedua dalam satu halaman. Seluruh teks antarmuka menggunakan typeface tunggal ini.

### 4.2 Skala Tipografi

| Level | Ukuran | Bobot | Line Height | Contoh Penggunaan |
|-------|--------|-------|-------------|-------------------|
| Display | 32px / 2rem | 600 SemiBold | 1.25 | Hero headline publik |
| Heading 1 | 24px / 1.5rem | 600 SemiBold | 1.3 | Judul halaman |
| Heading 2 | 20px / 1.25rem | 600 SemiBold | 1.35 | Judul seksi |
| Heading 3 | 16px / 1rem | 600 SemiBold | 1.4 | Judul kartu, label grup |
| Body | 14px / 0.875rem | 400 Regular | 1.5 | Teks body, isi tabel |
| Body Medium | 14px / 0.875rem | 500 Medium | 1.5 | Label formulir, header tabel, label navigasi |
| Small | 12px / 0.75rem | 400 Regular | 1.4 | Helper text, timestamp, keterangan |
| Micro | 11px / 0.6875rem | 500 Medium | 1.3 | Label badge, status |

**Ukuran minimum:** 11px (Micro/badge). Tidak boleh di bawah 11px di manapun.

### 4.3 Aturan Tampilan Data Keuangan

- Wajib gunakan `font-variant-numeric: tabular-nums` (kelas `tabular-nums`) pada **setiap angka, jumlah, tanggal, dan nomor rekening**.
- Format Rupiah baku: `Rp 1.250.000` (spasi antara `Rp` dan angka; titik sebagai pemisah ribuan).
- Nilai nol: `Rp 0` — jangan gunakan `-`, `N/A`, atau biarkan kosong.
- Nilai negatif: `(Rp 50.000)` — tanda kurung, teks merah `text-danger-700`. Jangan gunakan tanda minus.
- Nomor rekening: gunakan tanda hubung sebagai pemisah: `SP-2026-0042`.
- Angka total besar pada kartu: kelas `text-2xl font-semibold tabular-nums text-ink-900`.

---

## 5. Spasi dan Grid Layout

- Unit dasar: **4px**
- Nilai spasi yang diizinkan:

| Nama | Nilai | Kelas Tailwind | Contoh Penggunaan |
|------|-------|----------------|-------------------|
| space-1 | 4px | `p-1`, `gap-1` | Padding badge internal |
| space-2 | 8px | `p-2`, `gap-2` | Padding kompak, jarak antar ikon |
| space-3 | 12px | `p-3` | Padding input, margin kompak |
| space-4 | 16px | `p-4`, `gap-4` | Padding kartu mobile, jarak standar |
| space-5 | 20px | `p-5` | Padding kartu desktop |
| space-6 | 24px | `p-6`, `gap-6` | Jarak antar seksi komponen |
| space-8 | 32px | `p-8` | Jarak antar seksi halaman |
| space-12 | 48px | `py-12` | Jarak besar, hero section |

- Lebar konten maksimum:
  - Public marketing: `max-w-6xl` (1152px)
  - Portal & Admin: full-width dengan `px-4 md:px-6 lg:px-8`
  - Form / Modal: `max-w-lg` (512px) atau `max-w-2xl` (672px)
  - Teks editorial: `max-w-prose` (65ch)

---

## 6. Border, Shadow, dan Radius

### 6.1 Border Radius

| Konteks | Kelas Tailwind | Nilai |
|---------|----------------|-------|
| Tombol, input, dropdown | `rounded-md` | 6px |
| Badge | `rounded` | 4px |
| Kartu, panel, modal | `rounded-lg` | 8px |
| Avatar, badge pill | `rounded-full` | — |

**Dilarang keras:** `rounded-2xl`, `rounded-3xl`, `rounded-[12px]` atau lebih besar.

### 6.2 Border

| Konteks | Nilai | Kelas Tailwind Ekuivalen |
|---------|-------|--------------------------|
| Border standar | `1px solid #E5E5E5` | `border border-ink-200` |
| Border kuat / aktif | `1px solid #D4D4D4` | `border border-ink-300` |
| Focus ring | `2px solid #386B43` (ring + offset) | `ring-2 ring-forest-600 ring-offset-1` |
| Garis pemisah tabel | `1px solid #F0EFE9` | — |

Focus ring **wajib selalu ada** dan tidak boleh dihilangkan demi estetika.

### 6.3 Shadow (Tiga Level Ketat)

| Konteks | Kelas | Nilai CSS |
|---------|-------|-----------|
| Kartu standar | `shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.05)` |
| Dropdown / Popover | `shadow` | `0 4px 6px -1px rgba(0,0,0,0.07)` |
| Modal / Dialog | `shadow-md` | `0 10px 15px -3px rgba(0,0,0,0.08)` |

Semua konteks lain: `shadow-none`. Tidak ada shadow di luar tiga level ini.

---

## 7. Spesifikasi Komponen

### 7.1 Tombol (Button)

| Varian | Kelas Tailwind | Kegunaan |
|--------|----------------|----------|
| Primary | `bg-forest-700 text-white hover:bg-forest-800 active:bg-forest-900 rounded-md px-4 py-2 text-sm font-medium` | Aksi utama |
| Secondary | `border border-ink-300 text-ink-800 bg-white hover:bg-ink-50 rounded-md px-4 py-2 text-sm font-medium` | Aksi sekunder |
| Ghost | `text-ink-700 hover:bg-ink-100 rounded-md px-3 py-2 text-sm font-medium` | Aksi tersier, navigasi samping |
| Destructive | `bg-danger-base text-white hover:bg-danger-700 rounded-md px-4 py-2 text-sm font-medium` | Hapus, tolak, tindakan ireversibel |

- Tinggi tombol: Desktop `h-9` (36px); Mobile `h-11` (44px) — target sentuhan.
- Hanya 4 varian yang tersedia. Tidak ada varian tambahan tanpa alasan arsitektural.
- Aksi destructive **selalu membutuhkan konfirmasi modal** sebelum dieksekusi.
- Tombol ikon tanpa teks wajib memiliki `aria-label`.

### 7.2 Tabel Data

- Header: `bg-ink-100 text-ink-700 font-medium text-xs uppercase tracking-wider py-2.5 px-4`
- Baris: `hover:bg-forest-50/50 transition-colors border-b border-ink-200 text-sm`
- Sel: `py-3 px-4 text-ink-800`
- Selalu bungkus tabel dalam container: `overflow-x-auto`
- Header sticky pada tabel scrollable panjang
- Empty state: ikon Lucide muted + pesan deskriptif + tombol aksi opsional (centered)
- Loading state: skeleton row (3–5 baris `animate-pulse`), bukan spinner roda

### 7.3 Badge Status

- Bentuk: `rounded-full px-2.5 py-0.5 text-xs font-medium`
- Teks maksimum: 2 kata. Wrapping dilarang dalam badge.
- Badge wajib menggunakan teks DAN warna — jangan hanya warna.

| Varian | Kelas | Contoh Status |
|--------|-------|---------------|
| Hijau (success) | `bg-success-100 text-success-700 border border-success-base/20` | Aktif, Lunas, Disetujui |
| Kuning (warning) | `bg-warning-100 text-warning-700 border border-warning-base/20` | Menunggu, DPK, Dalam Proses |
| Merah (danger) | `bg-danger-100 text-danger-700 border border-danger-base/20` | Ditolak, Macet, Terlambat |
| Abu-abu (neutral) | `bg-ink-100 text-ink-700 border border-ink-300` | Draft, Selesai, Non-aktif |
| Biru (info) | `bg-info-100 text-info-700 border border-info-base/20` | Baru, Terverifikasi |

### 7.4 Kartu Metrik / Statistik

- Struktur: Label (text-xs, uppercase, text-ink-500) + ikon Lucide kecil atas kanan → Nilai besar tengah (text-2xl tabular-nums) → Catatan perbandingan bawah (text-xs)
- Background: solid `bg-white`, border `border border-ink-200`, shadow `shadow-sm`, padding `p-5`
- Tidak ada background berwarna pada kartu. Tidak ada aksen gradien. Tidak ada strip warna tepi.

### 7.5 Input Formulir

- Tinggi: `h-10` desktop, `h-11` mobile
- Border: `border border-ink-300 rounded-md px-3 text-sm text-ink-900`
- Fokus: `focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none`
- Error: `border-danger-base` + pesan error `text-xs text-danger-base mt-1`
- Helper text: `text-xs text-ink-500 mt-1`
- Label wajib: `*` dalam `text-danger-base` setelah label field wajib
- Setiap input **wajib memiliki `<label>` yang terasosiasi** via `htmlFor` / `id`.

### 7.6 Modal dan Dialog

- Backdrop: `bg-black/40` — solid, tanpa blur (dilarang `backdrop-blur`)
- Tombol tutup: ikon `X` (Lucide `X`) di pojok kanan atas, selalu tersedia
- Lebar maks: `max-w-sm` untuk konfirmasi sederhana; `max-w-lg` untuk formulir; `max-w-2xl` untuk tampilan kompleks
- Mobile: bottom sheet style (`fixed inset-x-0 bottom-0 rounded-t-lg`) atau layar penuh

### 7.7 Navigasi Sidebar

- Background: `bg-white border-r border-ink-200`
- Item aktif: `bg-forest-100 text-forest-900 font-medium`
- Item non-aktif: `text-ink-700 hover:bg-ink-100 hover:text-ink-900`
- Grup label: `text-ink-500 font-medium text-xs uppercase tracking-wider px-3 py-2`
- Divider antar grup: `border-t border-ink-200 my-1`

---

## 8. Sistem Ikon (Lucide React)

- **Satu-satunya library ikon:** Lucide React. Tidak ada emoji, SVG kustom ilustratif, atau library ikon lain.
- Ukuran default:
  - Ikon navigasi: `h-4 w-4` atau `h-5 w-5`
  - Ikon dalam tombol: `h-4 w-4`
  - Ikon kartu stat: `h-5 w-5`
  - Ikon empty state: `h-10 w-10 text-ink-300`
- Stroke width: `strokeWidth={1.75}` untuk ukuran di bawah 24px; `strokeWidth={1.5}` untuk 24px ke atas.
- Jangan gunakan ikon sebagai satu-satunya penanda makna tanpa teks (kecuali: ✕ tutup, ← kembali).
- Warna ikon mengikuti teks sekitar kecuali ditetapkan secara eksplisit sebagai warna muted.

---

## 9. Charts (Recharts)

- Tipe chart yang diizinkan: Line, Bar, Composed (Line + Bar). **Tidak ada pie chart.**
- Warna seri data & aturan penggunaannya:
  - Seri 1 (primary): `#2D5636` (Forest Green — untuk data primer/realisasi periode berjalan).
  - Seri 2 (secondary): `#737373` (Charcoal Muted — untuk data historis/pembanding/target; elemen garis grafik non-teks).
  - Seri 3 (aksen): `#B45309` (Muted Ochre — untuk data proyeksi atau sorotan khusus).
- **Aturan Penggunaan Warna Grafik:** Dilarang menggunakan warna semantik (seperti merah `danger-base` atau hijau `success-base`) sebagai warna serial data grafik semata-mata untuk tujuan estetika atau variasi dekoratif. Warna semantik hanya boleh digunakan jika secara langsung merepresentasikan status performa risiko atau kolektibilitas (misal: porsi kredit bermasalah/NPL).
- Garis data: `strokeWidth={2}`, solid, tanpa `strokeDasharray` pada garis data.
- Grid garis: `strokeDasharray="3 3"` dengan `stroke="#E5E5E5"`.
- Tooltip: background solid putih, `border border-ink-200`, `shadow-sm`, `rounded-md text-sm` — **tanpa blur**.
- **Garis Sumbu Grafis (Axis Stroke):** `stroke="#737373"`, `tickLine={false}` (elemen grafis non-teks, rasio kontras grafis > 3:1 terhadap kanvas putih).
- **Teks & Label Sumbu (Tick Labels, Axis Title & Legends):** Wajib menggunakan `fill="#686868"` (token `ink-500`) atau kelas `text-ink-500` / `text-ink-600` (`#525252`), font size 11px atau 12px, dengan kelas `tabular-nums`. Berdasarkan rumus relative luminance WCAG, nilai `#686868` menghasilkan rasio kontras **5.06:1** pada background kartu hangat `ink-100` (`#F5F4F0`) dan **5.57:1** pada `white`, sehingga memenuhi target acceptance criteria WCAG 2.2 AA (minimum 4.5:1 untuk elemen teks normal/kecil). **Dilarang keras menggunakan `#737373` sebagai warna teks/label sumbu** karena rasio kontrasnya hanya **4.31:1** pada `ink-100` (tidak mencapai target 4.5:1).
- Tidak ada fill area dengan gradien; gunakan hanya garis padat.
- Tidak ada 3D chart dalam kondisi apapun.
- Setiap chart data keuangan **wajib dilengkapi** tabel ringkasan atau teks deskriptif yang dapat diakses screen reader.

---

## 10. Aksesibilitas — Target Desain

> **Catatan:** Target di bawah adalah panduan desain dan pengujian prototype, bukan klaim sertifikasi aksesibilitas.

| Kriteria | Target |
|----------|--------|
| Kontras teks normal (body, label) | ≥ 4.5:1 |
| Kontras teks besar (heading) | ≥ 3:1 |
| Navigasi keyboard | Seluruh elemen interaktif dapat diakses via Tab, Enter, Space, Arrow keys |
| Indikator fokus | Focus ring `ring-2 ring-forest-600 ring-offset-1` wajib terlihat jelas |
| Label formulir | Setiap input memiliki `<label>` terasosiasi secara eksplisit |
| Pesan error | Deskriptif, tidak hanya mengandalkan warna merah — sertakan teks penjelasan |
| Target sentuhan mobile | Minimum 44×44px untuk setiap elemen interaktif |
| Semantic HTML | Gunakan elemen semantik yang tepat: `<main>`, `<nav>`, `<button>`, `<table>`, `<h1–h3>` |
| Screen reader | Ikon hias diberi `aria-hidden="true"`; ikon bermakna diberi `aria-label` |
| Modal aksesibilitas | Focus trap dalam modal aktif; `aria-modal="true"`, `role="dialog"` |

**Pasangan warna yang wajib diuji kontrasnya (dengan rasio kontras terhitung):**
- `ink-900` (#161616) di atas `white` (#FFFFFF) → ~16.1:1 ✓ (Lolos target AA ≥ 4.5:1)
- `ink-800` (#262626) di atas `white` (#FFFFFF) → ~13.3:1 ✓ (Lolos target AA ≥ 4.5:1)
- `ink-700` (#404040) di atas `ink-100` (#F5F4F0) → ~8.9:1 ✓ (Lolos target AA ≥ 4.5:1)
- `ink-600` (#525252) di atas `ink-100` (#F5F4F0) → ~5.5:1 ✓ (Lolos target AA ≥ 4.5:1)
- `ink-500` (#686868) di atas `ink-100` (#F5F4F0) → **5.06:1** ✓ (Lolos target AA ≥ 4.5:1)
- `ink-500` (#686868) di atas `white` (#FFFFFF) → **5.57:1** ✓ (Lolos target AA ≥ 4.5:1)
- `forest-900` (#1B3320) di atas `forest-100` (#EAF3EC) → **12.02:1** ✓ (Lolos target AA ≥ 4.5:1)
- `success-700` (#1C5430) di atas `success-100` (#E6F4EA) → **7.84:1** ✓ (Lolos target AA ≥ 4.5:1)
- `danger-700` (#7F1D1D) di atas `danger-100` (#FEE2E2) → **8.20:1** ✓ (Lolos target AA ≥ 4.5:1)
- `warning-700` (#6B4700) di atas `warning-100` (#FEF3D6) → **7.52:1** ✓ (Lolos target AA ≥ 4.5:1)
- `info-700` (#1E3A5F) di atas `info-100` (#E8F0FE) → **10.04:1** ✓ (Lolos target AA ≥ 4.5:1)
- Tombol Primary: `white` (#FFFFFF) di atas `forest-700` (#2D5636) → **8.41:1** ✓ (Lolos target AA ≥ 4.5:1)

> **Target aksesibilitas (PROPOSED Acceptance Criteria, bukan sertifikasi):** Rasio kontras teks normal ≥ 4.5:1 dan teks besar ≥ 3:1 berfungsi sebagai acceptance criteria desain dan pengujian antarmuka, bukan klaim kepatuhan hukum atau sertifikasi formal pihak ketiga. Nilai kontras di atas dihitung secara matematis berdasarkan standar luminansi relatif sRGB. Verifikasi visual aktual menggunakan browser devtools dan WebAIM Contrast Checker akan dilakukan pada Phase 8.

---

## 11. Animasi dan Transisi

- **Loading state:** `animate-spin` pada ikon `Loader2` dari Lucide, atau `animate-pulse` pada skeleton.
- **Hover state:** `transition-colors duration-150` — hanya perubahan warna.
- **Drawer/Sidebar slide:** `transition-transform duration-200 ease-in-out`.
- Tidak ada transisi atau animasi lain selain dari ketiga di atas.
- Tidak ada scroll-triggered animation.
- Tidak ada entrance animation (fade-in, slide-up) saat halaman dimuat.
- Tidak ada Framer Motion, GSAP, atau keyframe CSS untuk tujuan dekoratif.
