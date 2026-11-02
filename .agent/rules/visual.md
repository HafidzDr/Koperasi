# Aturan Desain Visual — Berlaku di Seluruh Fase
**Proyek:** Platform Digital Koperasi Indonesia
**Arah Visual:** Warm Modern Finance / Editorial Minimalism
**Version:** 0.2 (Phase 0 Refined)

---

## MANDAT VISUAL

Platform ini harus terasa seperti laporan tahunan koperasi Indonesia yang dirancang secara profesional dan dibawa ke era digital. Mengkomunikasikan keandalan, ketenangan institusional, dan kehangatan manusiawi. Setiap keputusan visual memperkuat sikap tersebut.

Ketika ragu: **kurangi, jangan tambah.**

Kualitas desain dicapai melalui keanggunan penahanan diri (restraint), bukan kelimpahan dekorasi.

---

## V-01: Larangan Mutlak (Zero Tolerance)

Pola-pola ini dilarang pada setiap komponen, pada setiap halaman, di setiap fase. Jika terdeteksi dalam review kode, perubahan harus segera dibatalkan:

| Pola yang Dilarang | Mengapa Dilarang |
|--------------------|-------------------|
| `linear-gradient(...)` | Gradien di manapun — background, border, teks, overlay |
| `radial-gradient(...)` | Sama seperti di atas |
| `backdrop-filter: blur(...)` | Glassmorphism — dilarang keras |
| Kelas Tailwind `backdrop-blur-*` | Sama seperti di atas |
| `shadow-xl`, `shadow-2xl` | Shadow berlebihan dan tidak realistis |
| Shadow berwarna (contoh: `shadow-green-500/50`) | Glow effect berbasis warna |
| `rounded-2xl`, `rounded-3xl`, `rounded-[12px+]` | Radius sudut berlebihan; merusak kesan institusional |
| Warna neon atau berenergi tinggi | Tidak ada hot pink, electric blue, neon green |
| Ilustrasi dekoratif tanpa fungsi | Tidak ada vektor acak, karakter 3D, atau maskot AI |
| Sparkline tanpa data bermakna | Tidak ada grafik mini dekoratif yang ditambahkan hanya untuk mengisi ruang |
| `bg-opacity` dengan warna kustom pada kartu | Kartu tembus pandang atau berwarna kustom |
| Animasi background | Tidak ada efek gradien bergerak atau partikel |
| Animasi CSS untuk dekorasi | Animasi hanya untuk status pemuatan (loading) dan transisi interaksi |
| Pie chart untuk distribusi keuangan | Tidak terbaca dengan presisi; gunakan bar atau tabel |
| 3D chart dalam kondisi apapun | Merusak keterbacaan data keuangan |

---

## V-02: Aturan Penggunaan Warna

- Keluarga hijau `forest` adalah **satu-satunya** warna merek utama.
- Warna semantik (success, warning, danger, info) **hanya** untuk komunikasi status dan feedback — dilarang untuk dekorasi.
- `ink-50` (`#FAF9F6`) adalah background halaman default — warm off-white, bukan putih murni yang menusuk mata.
- Putih murni (`#FFFFFF`) adalah warna permukaan kartu, modal, dan popover.
- Jangan gunakan hitam murni (`#000000`) untuk teks — gunakan `ink-900` (`#161616`).
- Warna background yang diizinkan hanya: `ink-50`, `ink-100`, `white`, `forest-50`, atau semantic-100 untuk badge/alert.
- Tidak ada penambahan warna aksen secara acak per halaman untuk variasi.
- **Token teks yang diizinkan pada background `ink-100` (#F5F4F0):** Minimal `ink-500` (#686868) untuk memenuhi target kontras 4.5:1. Jangan gunakan warna teks yang lebih terang dari `ink-500` pada background `ink-100`.

---

## V-03: Aturan Tipografi

- **Inter** adalah satu-satunya typeface utama untuk platform ini.
- Fallback font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- Kelas `tabular-nums` wajib digunakan pada **setiap angka keuangan, jumlah, tanggal, dan nomor rekening**.
- Ukuran heading mematuhi skala tipografi dalam `docs/DESIGN_SYSTEM.md` secara ketat — tidak ada ukuran heading ad hoc.
- Jangan gunakan `font-black` (bobot 900) di manapun; bobot tertinggi yang diizinkan adalah `font-semibold` (bobot 600).
- Ukuran heading maksimum pada mobile: 24px (`text-2xl`); pada desktop: 32px (`text-3xl`).
- Leading: teks body `leading-relaxed` atau `leading-normal`; heading `leading-tight`.
- Tampilan angka keuangan utama pada kartu: `text-2xl font-semibold tabular-nums text-ink-900`.
- Jumlah negatif: teks merah gelap (`text-danger-700`) + kurung, contoh: `(Rp 50.000)` — jangan gunakan tanda minus saja.

---

## V-04: Aturan Spasi dan Tata Letak

- Unit dasar: 4px; seluruh spasi adalah kelipatan 4.
- Padding dalam kartu: `p-5` (20px) pada desktop; `p-4` (16px) pada mobile.
- Jarak antar seksi dalam halaman: `space-y-6` atau `gap-6` (24px) antar komponen; `space-y-8` (32px) antar seksi besar.
- Input formulir dan baris interaktif: tinggi seragam — `h-9` desktop, `h-11` mobile.
- Jangan mencampur skala spasi secara sembarangan; periksa spasi komponen sekitar sebelum menambahkan elemen baru.

---

## V-05: Aturan Border dan Radius

- Border standar: `1px solid #E5E5E5` (`border-ink-200`) — tidak ada border 2px kecuali focus ring.
- Focus ring: `ring-2 ring-forest-600 ring-offset-1` — selalu wajib ada pada setiap elemen interaktif yang aktif; tidak boleh dihilangkan.
- Radius kartu: `rounded-lg` (8px) maksimum.
- Radius tombol dan input: `rounded-md` (6px) atau `rounded` (4px).
- Radius badge status: `rounded-full` (pill shape).
- Avatar: `rounded-full`.
- Baris tabel: tidak memiliki radius; container pembungkus tabel memiliki `rounded-lg`.

---

## V-06: Tingkat Shadow (Tiga Level Saja)

Tepat tiga tingkat shadow; tidak ada di luar ketiga nilai ini:

| Konteks | Kelas Tailwind | Nilai CSS |
|---------|----------------|-----------|
| Kartu standar | `shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.05)` |
| Dropdown / Popover | `shadow` | `0 4px 6px -1px rgba(0,0,0,0.07)` |
| Modal / Dialog | `shadow-md` | `0 10px 15px -3px rgba(0,0,0,0.08)` |

Semua konteks lainnya: `shadow-none`.

---

## V-07: Aturan Visual Komponen

### Kartu (Cards)
- Background: solid `bg-white`
- Border: `border border-ink-200`
- Shadow: `shadow-sm`
- Radius: `rounded-lg`
- Tidak ada strip aksen warna di header kartu.
- Tidak ada aksen garis warna di sisi kiri kartu.

### Tabel
- Background header: `bg-ink-100`
- Teks header: `text-ink-700 font-medium text-xs uppercase tracking-wide`
- Baris: `hover:bg-forest-50/50 border-b border-ink-200`
- Jangan mewarnai seluruh baris tabel untuk menandai status; gunakan badge status inline.
- Empty state: ikon Lucide muted + pesan deskriptif + tombol aksi opsional, terpusat (centered).
- Selalu dibungkus dalam container: `overflow-x-auto`.

### Tombol (Buttons)
- Hanya 4 varian: Primary (hijau forest), Secondary (outline border), Ghost (tanpa border), Destructive (merah solid).
- Tidak ada tombol hanya ikon tanpa atribut `aria-label`.
- Tidak ada tombol full-width pada desktop kecuali dalam formulir mobile-first satu kolom.
- Tindakan destructive wajib menampilkan dialog konfirmasi modal sebelum dijalankan.

### Badge Status
- Hanya 5 varian: Hijau (sukses/aktif), Kuning (peringatan/proses), Merah (error/ditolak), Abu-abu (netral/arsip), Biru (info/baru).
- Bentuk: `rounded-full px-2.5 py-0.5 text-xs font-medium`.
- Wajib menyertakan teks DAN warna — dilarang warna saja.
- Teks badge maksimal 2 kata; dilarang teks panjang yang menyebabkan text-wrapping.

---

## V-08: Aturan Visual Charts (Recharts)

- Garis solid saja — tanpa fill area, tanpa gradien fill.
- Ketebalan garis: `strokeWidth={2}`; dilarang `strokeDasharray` pada garis data.
- Warna seri data Recharts terikat pada aturan ketat:
  - Seri 1 (primary): `#2D5636` (Forest Green — untuk data primer / realisasi berjalan)
  - Seri 2 (secondary): `#737373` (Charcoal Muted — untuk data historis / pembanding / target; elemen garis grafik non-teks)
  - Seri 3 (aksen): `#B45309` (Muted Ochre — untuk data proyeksi / sorotan khusus)
- **Larangan Warna Semantik pada Grafik:** Dilarang keras menggunakan warna semantik (`danger-base`, `success-base`, `warning-base`, `info-base`) sebagai warna serial grafik hanya untuk variasi estetika atau dekorasi visual. Warna semantik hanya diizinkan jika secara fungsional menandai metrik risiko atau status kolektibilitas pinjaman (seperti proporsi NPL).
- Garis sumbu grafis: `stroke="#737373"`, `tickLine={false}` (elemen grafis non-teks).
- **Teks, Label & Angka Sumbu (Axis Tick Labels, Legends, & Descriptions):** Wajib menggunakan token teks `ink-500` (`#686868`) atau `ink-600` (`#525252`), font size 11px/12px, tabular-nums. Berdasarkan rumus relative luminance WCAG, nilai `#686868` menghasilkan kontras **5.06:1** pada `ink-100` (`#F5F4F0`) dan **5.57:1** pada `white` (memenuhi target acceptance criteria WCAG 2.2 AA ≥ 4.5:1 untuk elemen teks). **Dilarang menggunakan `#737373` sebagai warna teks/label sumbu** karena rasio kontrasnya hanya **4.31:1** pada `ink-100`.
- Grid: `strokeDasharray="3 3"` dengan warna `stroke="#E5E5E5"`.
- Tooltip: background solid putih, `border border-ink-200`, `shadow-sm`, `rounded-md text-sm` — tanpa efek blur.
- Container chart: background `bg-white`, tanpa background berwarna lain.
- Setiap chart yang menyajikan data keuangan wajib dilengkapi dengan tabel ringkasan atau teks deskriptif yang dapat diakses oleh screen reader.
- Dilarang pie chart untuk distribusi keuangan — gunakan bar chart atau composed chart.
- Dilarang 3D chart dalam situasi apapun.

---

## V-09: Aturan Ikon (Lucide React)

- Lucide React adalah **satu-satunya** library ikon yang digunakan.
- Dilarang emoji, dilarang SVG ilustrasi kustom di luar Lucide.
- Ketebalan stroke: `strokeWidth={1.75}` untuk ikon < 24px; `strokeWidth={1.5}` untuk 24px ke atas.
- Dilarang menggunakan ikon sebagai satu-satunya penanda arti tanpa teks pendamping (kecuali simbol yang dipahami secara universal: ✕ tutup, ← kembali).
- Warna ikon mengikuti warna teks di sekitarnya kecuali secara eksplisit diset ke warna netral yang muted.

---

## V-10: Aturan Gerak dan Animasi

- Loading state: `animate-spin` pada ikon `Loader2` dari Lucide SAJA; skeleton pulsing menggunakan `animate-pulse`.
- Transisi hover: `transition-colors duration-150` pada elemen interaktif saja.
- Transisi slide drawer/sidebar: `transition-transform duration-200 ease-in-out`.
- Dilarang transisi atau animasi CSS lain di luar tiga ketentuan di atas.
- Dilarang animasi yang dipicu oleh scroll (scroll-triggered animation).
- Dilarang entrance animation (fade-in, slide-up) saat halaman pertama kali dimuat.
- Dilarang Framer Motion, GSAP, atau keyframe CSS untuk keperluan dekoratif.
