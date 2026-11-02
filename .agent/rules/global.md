# Aturan Global Proyek
**Proyek:** Platform Digital Koperasi Indonesia
**Version:** 0.2 (Phase 0 Refined)
**Berlaku untuk:** Seluruh fase implementasi

---

## G-01: Frontend Only — Mutlak

- Tidak ada implementasi backend dalam bentuk apapun.
- Tidak ada Express, Fastify, NestJS, Hono, Bun server, atau framework server manapun.
- Tidak ada REST API, GraphQL, WebSocket server, atau layanan push jaringan nyata.
- Tidak ada database: PostgreSQL, MySQL, SQLite, MongoDB, atau ORM apapun.
- Tidak ada Supabase, Firebase, PocketBase, atau BaaS apapun.
- Tidak ada SDK payment gateway nyata (Midtrans, Xendit, DOKU, Stripe, dll.).
- Semua data adalah mock; semua layanan adalah fungsi simulasi frontend.

---

## G-02: Batasan Teknologi — Terkunci

**Dependency Matrix — Persetujuan Status per Package:**

| Package | Versi | Status | Fase Pertama Dibutuhkan |
|---------|-------|--------|------------------------|
| `react` | 18+ | CONFIRMED | Phase 2 |
| `react-dom` | 18+ | CONFIRMED | Phase 2 |
| `typescript` | 5+ | CONFIRMED | Phase 2 |
| `vite` | 5+ | CONFIRMED | Phase 2 |
| `@vitejs/plugin-react` | latest stable | CONFIRMED | Phase 2 |
| `tailwindcss` | 3+ | CONFIRMED | Phase 2 |
| `postcss` | required by Tailwind | CONFIRMED | Phase 2 |
| `autoprefixer` | required by Tailwind | CONFIRMED | Phase 2 |
| `lucide-react` | latest stable | CONFIRMED | Phase 2 |
| `react-router-dom` | 6+ | CONFIRMED | Phase 2 |
| `zustand` | 4+ | CONFIRMED | Phase 2 |
| `clsx` | latest stable | CONFIRMED | Phase 2 |
| `tailwind-merge` | latest stable | CONFIRMED | Phase 2 |
| `date-fns` | 3+ | CONFIRMED | Phase 2 |
| `react-hook-form` | 7+ | PROPOSED | Phase 3 |
| `zod` | 3+ | PROPOSED | Phase 3 |
| `recharts` | 2+ | PROPOSED | Phase 5 |
| `eslint` | latest stable | CONFIRMED | Phase 2 (dev) |
| `@typescript-eslint/parser` | latest stable | CONFIRMED | Phase 2 (dev) |
| `@typescript-eslint/eslint-plugin` | latest stable | CONFIRMED | Phase 2 (dev) |
| `eslint-plugin-react-hooks` | latest stable | CONFIRMED | Phase 2 (dev) |
| `shadcn/ui` | selected components only | PROPOSED | Phase 2 (selective use) |

> **Catatan versi:** Versi spesifik akan ditentukan saat inisialisasi proyek di Phase 2. "Latest stable" berarti versi stabil terkini yang tersedia pada saat instalasi. Tidak ada downgrade di bawah versi minimum yang tertera.

**Yang Dilarang (tidak boleh ditambahkan dalam kondisi apapun):**
- Library ikon selain Lucide React
- Library chart selain Recharts
- CSS-in-JS (styled-components, emotion)
- Full component library (MUI, Ant Design, Chakra UI, Mantine)
- SDK payment gateway nyata (Midtrans, Xendit, DOKU, Stripe)
- Library autentikasi dengan network calls nyata
- Framer Motion, GSAP, atau animasi library apapun
- Script analitik atau tracking (GA, Mixpanel, dll.)

**Menambah dependency baru:** Ajukan permintaan dengan justifikasi di laporan fase. Tunggu persetujuan eksplisit pengguna sebelum instalasi.

---

## G-03: Kualitas Kode

- TypeScript strict mode; nol tipe `any` diizinkan.
- Semua input formulir divalidasi via Zod sebelum proses simulasi dijalankan.
- Semua fungsi asinkron simulasi bertipe dan mengembalikan `Promise<T>`.
- Tidak ada `console.log` dalam kode jalur produksi; gunakan utilitas debug terpisah jika perlu.
- ESLint dan TypeScript harus lulus dengan nol error sebelum setiap fase dinyatakan selesai.
- Gunakan TypeScript `as const` untuk nilai enumerasi; hindari tipe union string tanpa tipe konkret.

---

## G-04: Lokalisasi

- Seluruh teks yang menghadap pengguna dalam Bahasa Indonesia baku.
- Mata uang: IDR diformat dengan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })`.
- Tanggal: diformat dengan `date-fns` dan locale `id` dari `date-fns/locale`.
- Jangan hardcode label UI dalam bahasa Inggris; semua label, toast, error, dan placeholder dalam Bahasa Indonesia.
- Istilah teknis koperasi menggunakan terminologi standar hukum koperasi Indonesia (UU No. 25 Tahun 1992 sebagai referensi umum — bukan klaim kepatuhan).

---

## G-05: Integritas Data Mock

- Semua data mock berada di direktori `/src/mock/`.
- Tidak ada data seed yang di-hardcode di dalam komponen React.
- Semua fungsi layanan simulasi mensimulasikan delay: minimum 500ms, maksimum 1500ms.
- Data mock harus realistis: format ID demonstrasi tunggal (`DEMO-ID-0001` dst.), dilarang keras menggunakan format NIK 16-digit maupun struktur yang menyerupai NIK nasional, nama Indonesia fiktif, jumlah keuangan yang masuk akal.
- Tidak ada lorem ipsum; semua teks copy harus kontekstual dalam Bahasa Indonesia.
- Data identitas dalam seed bersifat sepenuhnya fiktif — seluruh format NIK 16-digit dilarang mutlak, nama asli dari individu nyata dilarang, dan nomor rekening riil dilarang.

---

## G-06: Manajemen State

- Zustand adalah satu-satunya lapisan manajemen state data.
- Tidak ada Redux atau Context API untuk state data (Context diizinkan hanya untuk tema/konfigurasi).
- Penamaan store: pola `useXxxStore`.
- Data transaksional di-persist ke `localStorage` via `zustand/middleware`; auth disimpan di `sessionStorage`.
- Semua store harus memiliki action `reset()` yang dapat dipanggil oleh `demoReset()`.
- Gunakan prefix namespace `koperasi_demo_v1_` untuk semua kunci `localStorage`.

---

## G-07: Organisasi File & Modul

```
src/
  config/         (cooperativeConfig, productConfig, moduleConfig)
  mock/
    seed/         (data seed: anggota, pinjaman, transaksi, dll.)
    services/     (simulation services)
  stores/         (Zustand stores)
  hooks/          (custom React hooks)
  utils/          (utilitas: formatting IDR, tanggal, permission helper)
  types/          (TypeScript types dan interfaces)
  components/
    ui/           (primitif dasar: Button, Input, Badge, Card, dll.)
    layout/       (Shell, Sidebar, TopBar, BottomNav, dll.)
    features/     (komponen fitur yang spesifik, max 3 penggunaan sebelum diextract)
  pages/
    public/       (halaman public website)
    portal/       (halaman member portal)
    admin/        (halaman administration portal)
  routes/         (konfigurasi React Router, guards, role checks)
```

---

## G-08: Tanpa Over-Engineering

- Tidak ada abstraksi sebelum kasus penggunaan ketiga (Rule of Three).
- Tidak ada factory generik, registry, atau sistem plugin.
- Tidak ada mitigasi prop-drilling menggunakan Context untuk kedalaman satu level.
- Jaga berkas tetap kecil: pisah ketika sebuah berkas melebihi 250 baris.
- Inline konstanta yang tidak pernah berubah; ekstrak hanya konfigurasi yang berbeda antar lingkungan.
- Satu implementasi konkret tidak perlu dibungkus interface; interface hanya ketika ada lebih dari satu implementasi.

---

## G-09: Arsitektur Modular — Wajib

Platform harus mengakomodasi modul yang dapat diaktifkan/dinonaktifkan:

- Navigasi, rute, dashboard, dan formulir harus membaca `activeModules` dari `cooperativeConfig`.
- Kode komponen tidak boleh mengasumsikan bahwa modul Pinjaman atau SHU selalu aktif.
- Gunakan fungsi pembantu `isModuleActive(moduleKey)` untuk semua pemeriksaan kondisi modul.
- Halaman dengan modul non-aktif menampilkan layar "Modul Tidak Aktif" yang informatif — bukan 404 atau blank page.

---

## G-10: Disiplin Gate Fase

- Tidak ada kode dari Fase N+1 yang masuk ke repository sebelum Fase N lulus Quality Gate-nya.
- Dokumentasi diperbarui sebelum perubahan kode yang mempengaruhi perilaku yang terdokumentasi.
- Aturan bisnis berlabel `CONFIGURABLE` atau `ILLUSTRATIVE` tidak boleh diimplementasikan sebagai konstanta universal; gunakan asumsi dengan komentar `// ponytail:` yang menunjukkan batas dan jalur peningkatan.

---

## G-11: Keamanan Data Demonstrasi (Frontend)

- Tidak ada secrets, API key, token, atau kredensial nyata dalam source code.
- Tidak ada data pribadi nyata dalam seed mock (seluruh identitas demonstrasi menggunakan format tunggal `DEMO-ID-0001` hingga `DEMO-ID-XXXX`, nama fiktif, email fiktif, dilarang mutlak menggunakan format 16-digit atau struktur NIK nasional).
- Password demo (`demo1234`) ditampilkan secara terbuka di UI untuk keperluan demo; ini adalah desain yang disengaja untuk mode presentasi, bukan kelemahan keamanan.
- `localStorage` dan `sessionStorage` tidak boleh menyimpan nilai yang dilabeli sebagai PII nyata.
- **Keamanan Unggah Berkas:** Seluruh pengunggahan dokumen bersifat simulasi antarmuka semata (UI simulation only). File yang dipilih oleh pengguna **tidak pernah disimpan** dalam bentuk base64, data biner, blob, maupun metadata dokumen asli ke dalam storage maupun memori. Aplikasi selalu mengganti berkas unggahan dengan placeholder sintetis berlabel `SIMULATED DOCUMENT`.
- Formulir demo tidak boleh menampilkan konfirmasi bahwa "data Anda disimpan dengan aman" — karena tidak ada penyimpanan nyata yang terjadi. Batasan simulasi ini wajib disampaikan secara transparan.

---

## G-12: Aksesibilitas Minimum

- Semua elemen interaktif harus dapat difokuskan via keyboard.
- Semua gambar dan ikon bermakna semantis harus memiliki `aria-label` atau `aria-hidden="true"`.
- Input formulir harus memiliki elemen `<label>` yang terasosiasi via `htmlFor`/`id`.
- Focus ring harus terlihat jelas (aturan `ring-2 ring-forest-600 ring-offset-1` berlaku).
- Warna tidak boleh menjadi satu-satunya pembeda makna (badge status menggunakan teks + warna).
- Target sentuhan mobile minimum 44×44px untuk semua elemen interaktif.
- Gunakan elemen HTML semantik yang tepat: `<main>`, `<nav>`, `<button>`, `<table>`, `<h1–h3>`.

---

## G-13: Komentar Kode

- Tidak ada komentar dalam kode kecuali logika yang tidak jelas atau menandai aturan bisnis yang belum terselesaikan.
- Asumsi yang belum tervalidasi: tandai dengan `// ponytail: <asumsi>; konfirmasi dengan klien`.
- Tidak ada JSDoc pada setiap fungsi; hanya di mana antarmuka fungsi benar-benar ambigu.
- Komentar dalam Bahasa Indonesia atau Bahasa Inggris (pilih satu per berkas, jangan campur).
