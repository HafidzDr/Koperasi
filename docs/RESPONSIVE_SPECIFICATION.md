# Responsive Specification — Platform Digital Koperasi Indonesia
**Version:** 0.2 (Phase 0 Refined)
**Status:** PROPOSED — Under Review
**Date:** 2026-11-02

---

## 1. Prinsip Dasar Responsivitas

### 1.1 Kontrak No-Overflow (Wajib)
Tidak boleh ada `overflow-x` pada level halaman (page-level horizontal overflow) di manapun dan pada breakpoint apapun yang ditentukan dalam dokumen ini.

**Prinsip penegakan yang benar:**
Jika terjadi horizontal overflow:
1. Identifikasi elemen spesifik penyebab overflow.
2. Perbaiki ukuran, batasan lebar, atau perilaku elemen tersebut.
3. Uji ulang di seluruh breakpoint.
4. Pastikan konten tetap dapat diakses setelah perbaikan.

**Dilarang keras:** Menggunakan `overflow-x: hidden` pada elemen `<body>` atau container root sebagai cara menyembunyikan kesalahan layout. Pendekatan ini menyembunyikan konten tanpa memperbaiki masalah.

### 1.2 Desain Mobile-First
Semua implementasi dimulai dari tampilan mobile (320px), kemudian disesuaikan secara progresif ke atas menggunakan breakpoint Tailwind CSS yang tepat.

---

## 2. Sistem Breakpoint

Menggunakan sistem breakpoint bawaan Tailwind CSS. Tidak ada breakpoint kustom kecuali ada alasan yang didokumentasikan dan disetujui.

| Nama | Lebar Min | Prefix Tailwind | Konteks Perangkat |
|------|-----------|-----------------|-------------------|
| xs / Default | 320px | (tanpa prefix) | Smartphone kecil (iPhone SE, Galaxy A-series) |
| sm | 375px | `sm:` | Smartphone standar (iPhone 14/15, Pixel) |
| md | 768px | `md:` | Tablet portrait, phablet besar |
| lg | 1024px | `lg:` | Laptop kecil, iPad Pro landscape |
| xl | 1280px | `xl:` | Laptop standar |
| 2xl | 1440px | `2xl:` | Laptop lebar, monitor standar |
| — | 1920px | `2xl:` (dengan max-width) | Monitor Full HD — konten di-cap dengan max-width |

---

## 3. Viewport Uji Wajib

Seluruh halaman dan komponen baru wajib diuji pada delapan lebar berikut:

| Lebar | Perangkat Referensi | Catatan |
|-------|---------------------|---------|
| 320px | iPhone SE, viewport minimum | Ukuran terkecil yang didukung |
| 375px | iPhone 14 / standar mobile | Referensi utama mobile |
| 390px | iPhone 15 Pro | Referensi mobile sekunder |
| 768px | iPad Mini portrait | Titik pivot tablet |
| 1024px | iPad Pro landscape, laptop kecil | Titik transisi sidebar |
| 1280px | Laptop standar | Referensi utama desktop |
| 1440px | MacBook Pro 14", laptop lebar | Desktop lebar |
| 1920px | Monitor Full HD | Konten di-cap oleh max-width |

---

## 4. Layout Global

- **Root container:** `min-h-screen bg-ink-50`
- **Penanganan overflow halaman:** Identifikasi dan perbaiki elemen penyebab. Jangan sembunyikan dengan `overflow-x: hidden` pada `body`.
- **Cap lebar konten:**
  - Public marketing: `max-w-6xl mx-auto` (1152px)
  - Portal & Admin: full-width dengan `px-4 md:px-6 lg:px-8`
  - Formulir & Modal: `max-w-lg` atau `max-w-2xl`
- **Ukuran teks minimum:** 12px (Small/Micro). Tidak boleh ada teks di bawah 12px.

---

## 5. Layout Public Website

### 5.1 Navigasi Header

| Viewport | Perilaku |
|----------|----------|
| < 768px | Top bar sticky: Logo + tombol hamburger → Slide-over drawer kiri (full-height) |
| ≥ 768px | Horizontal nav sticky dengan semua link + 2 CTA tombol |

- Tinggi navbar: 56px mobile, 64px desktop.
- Saat scroll melebihi 10px: tambahkan `border-b border-ink-200 bg-white` (solid, tidak ada blur).
- Mobile: setiap item menu memiliki tap target minimal 48px tingginya.
- Dropdown "Layanan" tidak muncul di mobile; digantikan oleh daftar tautan langsung dalam drawer.

### 5.2 Layout Seksi Beranda

| Seksi | Mobile (< 768px) | Desktop (≥ 1024px) |
|-------|-------------------|--------------------|
| Hero | Satu kolom: teks + CTA, gambar disembunyikan | Dua kolom: teks kiri, kartu statistik kanan |
| Statistik | Grid 2×2 | Baris 4 kolom |
| Layanan | Daftar kartu satu kolom | Grid 3 kolom |
| CTA Banner | Full-width centered | Full-width, konten max-width |
| Berita | Daftar satu kolom | Grid 3 kolom |
| Footer | Kolom ditumpuk, center-aligned | Grid 4 kolom, left-aligned |

### 5.3 Formulir Publik (Pendaftaran, Kontak, Cek Status)

- Lebar formulir: full-width mobile (dengan `px-4`); `max-w-2xl` centered desktop.
- Stepper multi-langkah:
  - Mobile: indikator langkah kompak horizontal dengan angka + label terpotong
  - Desktop: stepper horizontal penuh dengan label + angka
- Input: `w-full` di semua breakpoint.

---

## 6. Layout Member Portal

### 6.1 Struktur Shell

```
[Top Bar — 52px mobile / 60px desktop — sticky]
[Sidebar 240px — hanya desktop ≥ 1024px] | [Main Content — fluid width]
```

| Viewport | Perilaku Sidebar |
|----------|-----------------|
| < 1024px | Tersembunyi. Akses via hamburger → slide-over drawer kiri dengan overlay |
| ≥ 1024px | Fixed left sidebar, selalu terlihat |

- Lebar sidebar: 240px (`w-60`)
- Offset konten utama saat sidebar terbuka: `lg:pl-60`
- Top bar: sticky, `z-40`, `bg-white border-b border-ink-200`; berisi: breadcrumb, notification bell, avatar + menu cepat, indikator peran demo

### 6.2 Dashboard Anggota

| Viewport | Layout |
|----------|--------|
| 320–767px | Kartu metrik full-width ditumpuk vertikal; daftar transaksi terakhir full-width |
| 768–1023px | Grid 2 kolom kartu metrik; ringkasan rekening di bawahnya |
| ≥ 1024px | Baris 4 kolom kartu metrik; area 2 kolom di bawah (chart aktivitas kiri + daftar aksi kanan) |

### 6.3 Tabel Data di Portal

- Semua tabel dibungkus dalam container `overflow-x-auto`
- Mobile (< 768px): alihkan ke tampilan daftar kartu (card-list) — setiap baris menjadi kartu lipat dengan data kunci terlihat
- Tablet+: tabel horizontal standar dengan semua kolom
- Kolom yang tidak kritis boleh disembunyikan di mobile (`hidden md:table-cell`); kolom **jumlah (Rp) tidak boleh disembunyikan**

### 6.4 Formulir Multi-Langkah (Pengajuan Pinjaman, Setoran)

- Max-width: `max-w-2xl` centered; full-width di mobile dengan `px-4`
- Stepper: terlihat di semua breakpoint
- Tombol navigasi formulir:
  - Mobile: `flex justify-between` (Kembali kiri, Lanjut kanan)
  - Desktop: right-aligned dengan jarak
- Kalkulator simulasi angsuran: tampil di bawah input di mobile; kolom kanan di desktop (jika lebar cukup)

---

## 7. Layout Administration Portal

### 7.1 Struktur Shell

Sama dengan Member Portal tetapi dengan sidebar lebih lebar:
- Lebar sidebar: 256px (`w-64`)
- Sidebar memiliki grup seksi dengan label dan divider
- Item sidebar dengan sub-navigasi menggunakan akordeon (expand on click)

### 7.2 Dashboard Admin

| Viewport | Layout |
|----------|--------|
| < 768px | Satu kolom; kartu KPI ditumpuk; tanpa mini-chart dalam kartu |
| 768–1023px | Grid 2 kolom KPI; feed aktivitas di bawah |
| ≥ 1024px | Baris 4 kolom KPI; area 2 kolom (chart kiri, aktivitas & antrean kanan) |

### 7.3 Tabel Data Admin

- Toolbar filter/cari: `flex-col space-y-2` mobile; `flex-row gap-3` desktop
- Tindakan baris: menu kebab `...` di semua breakpoint (jangan tombol ikon inline yang berjejal di mobile)
- Checkbox seleksi massal: hanya pada desktop; tidak tampil di mobile
- Paginasi: kompak (Prev / 1 / ... / Next) mobile; penuh dengan page-jump di desktop
- Scroll horizontal tabel: `overflow-x-auto` pada container; header tabel sticky secara vertikal

---

## 8. Modal dan Dialog

- Ukuran maks: `max-w-sm` (konfirmasi sederhana); `max-w-lg` (formulir); `max-w-2xl` (tampilan kompleks)
- Mobile (< 768px): Bottom sheet (`fixed inset-x-0 bottom-0 rounded-t-lg`) atau full screen (`fixed inset-0`)
- Tombol tutup (`X`) selalu tersedia di pojok kanan atas modal
- Backdrop: `bg-black/40` — solid, tanpa blur (dilarang `backdrop-blur`)
- Modal tidak boleh menyebabkan scroll horizontal halaman
- Focus harus terkunci dalam modal saat aktif (focus trap)

---

## 9. Aturan Sentuh (Touch Interaction)

- Tap target minimum: **44px × 44px** untuk semua elemen interaktif di mobile
- Jarak minimum antar tap target berdekatan: 8px
- Tinggi tombol: `h-11` (44px) di mobile, `h-9` (36px) di desktop
- Tinggi baris daftar kartu mode mobile: `min-h-11` (44px)
- Semua state hover harus memiliki state active yang setara (untuk touch yang tidak memiliki hover)

---

## 10. Responsivitas Tipografi

| Konteks | Ukuran Mobile | Ukuran Desktop |
|---------|---------------|----------------|
| Display Headline | 24px | 32px |
| Heading 1 | 20px | 24px |
| Heading 2 | 16px | 20px |
| Body | 14px | 14px |
| Small / Caption | 12px | 12px |

- Judul kartu dalam daftar: `line-clamp-2` untuk mencegah overflow
- Nomor rekening dan ID demonstrasi: gunakan `break-all` atau `font-mono` dengan pembungkusan, bukan overflow
- Format DEMO-ID tidak menggunakan angka panjang; tidak perlu perlakuan khusus overflow

---

## 11. Pola Navigasi — Tabel Acuan Kanonik

> **Ini adalah sumber acuan tunggal untuk pola navigasi di seluruh lingkungan.** Jika ada pola berbeda di dokumen lain, dokumen lain harus diselaraskan ke tabel ini.

### 11.1 Member Portal Navigation

| Viewport | Pola | Detail |
|----------|------|--------|
| 320–767px | **Bottom Tab Bar** + Slide-over drawer | 4–5 item di tab bar; item lain di drawer "Lainnya" |
| 768–1023px | **Slide-over Sidebar** on-demand | Via hamburger; sidebar melayang di atas konten |
| ≥ 1024px | **Persistent Sidebar** fixed kiri | Lebar 240px (`w-60`); konten offset ke kanan |

### 11.2 Administration Portal Navigation

| Viewport | Pola | Detail |
|----------|------|--------|
| 320–767px | **Slide-over Sidebar** via hamburger top bar | Tidak ada bottom tab bar di Admin Portal |
| 768–1023px | **Slide-over Sidebar** via hamburger top bar | Sama dengan mobile |
| ≥ 1024px | **Persistent Sidebar** fixed kiri | Lebar 256px (`w-64`); grup seksi + akordeon |

### 11.3 Public Website Navigation

| Viewport | Pola | Detail |
|----------|------|--------|
| < 768px | **Slide-over Drawer** dari hamburger | Full-height; CTA Daftar + Masuk di bawah |
| ≥ 768px | **Horizontal Navbar** sticky | Logo + links + CTA buttons |

### 11.4 Elemen Navigasi Universal

| Elemen | < 768px | 768–1023px | ≥ 1024px |
|--------|---------|-----------|---------|
| Breadcrumb | Tombol Kembali saja | 2 level terakhir | Breadcrumb penuh |
| Sub-tab | Horizontally scrollable | Tab bar standar | Tab bar standar |
| Overlay backdrop | Ya | Ya | Tidak |

---

## 12. Penanganan Kasus Overflow Spesifik

Elemen-elemen berikut berpotensi menyebabkan overflow dan wajib ditangani dengan cara yang tepat:

| Elemen | Pendekatan Penanganan |
|--------|----------------------|
| Nama anggota panjang dalam tabel | `truncate` + tooltip pada hover |
| Nomor rekening | `break-all` atau `font-mono` dengan pembungkusan |
| ID Demonstrasi (DEMO-ID-XXXX) | Lebar cukup; tidak perlu truncate |
| Jumlah uang besar | `tabular-nums` dalam kolom lebar tetap; jangan truncate |
| URL path di interface admin | Tidak ditampilkan langsung; gunakan label dan ID |
| Chart Recharts | Bungkus dalam `ResponsiveContainer width="100%"` |
| Formulir input | `w-full` selalu; jangan set lebar tetap tanpa max-w |
| Label navigasi | `truncate` dengan ellipsis jika sidebar dikecilkan |
