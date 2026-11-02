# PRD — Platform Digital Koperasi Indonesia
**Version:** 0.2 (Phase 0 Refined)
**Status:** PROPOSED — Under Review
**Date:** 2026-11-02

---

## 1. Product Vision

Membangun platform digital koperasi modular dan multi-organisasi yang dapat dikonfigurasi sesuai karakteristik operasional berbagai jenis koperasi di Indonesia (simpan pinjam, konsumen, produsen, pemasaran, dan jasa). Platform ini memberdayakan koperasi modern dengan tata kelola profesional, transparansi keuangan bagi anggota, dan alur operasional yang terstruktur tanpa kehilangan nilai kekeluargaan dan gotong royong.

Dalam fase saat ini, produk diwujudkan sebagai **frontend-only interactive prototype berkeandalan tinggi (high-fidelity)** yang mendemonstrasikan kapabilitas modular, pengalaman pengguna tiga lingkungan (public, portal anggota, administrasi), simulasi alur keuangan realistis, serta penegakan batas keamanan data demonstrasi.

---

## 2. Product Objectives

| # | Tujuan Produk | Metrik Keberhasilan Demonstrasi | Status |
|---|---------------|----------------------------------|--------|
| O1 | Mendemonstrasikan arsitektur koperasi modular yang fleksibel | Koperasi dapat menonaktifkan modul pinjaman; antarmuka beradaptasi tanpa broken link/state | CONFIRMED |
| O2 | Menyajikan simulasi multi-peran end-to-end yang realistis | 6 klasifikasi akses (2 konteks public preview + 8 akun demo terautentikasi) dapat mendemonstrasikan alur tugas utama | CONFIRMED |
| O3 | Menerapkan visual direction Warm Modern Finance / Editorial Minimalism | Lolos audit visual: tanpa gradien, tanpa glassmorphism, tanpa chart dekoratif | CONFIRMED |
| O4 | Menjamin responsivitas penuh tanpa overflow | Nol horizontal page-level overflow di 8 target viewport (320px–1920px) | CONFIRMED |
| O5 | Menjamin keamanan demonstrasi dan kepatuhan privasi | 100% data demonstrasi sintetis; penanda DEMO MODE eksplisit di seluruh layar | CONFIRMED |
| O6 | Menyediakan persistensi lokal dan kapabilitas reset bersih | Satu klik "Reset Demo" mengembalikan seluruh data ke kondisi seed awal | CONFIRMED |

---

## 3. Product Scope

### 3.1 Cakupan Dalam Proyek (In-Scope Prototype)
1. **Public Website (`/`)**: Media informasi publik, profil koperasi, katalog layanan adaptif, transparansi kelembagaan, formulir pendaftaran anggota dengan verifikasi format, pelacak status pendaftaran, berita, FAQ, dan gerbang masuk.
2. **Member Portal (`/portal`)**: Dashboard ringkasan portofolio anggota, detail rekening simpanan dan mutasi, pengajuan setoran simpanan, katalog dan pengajuan pinjaman (jika modul aktif), jadwal angsuran, riwayat transaksi lengkap, simulasi pembayaran (manual transfer dan kanal gateway instan), transparansi estimasi/riwayat SHU (jika modul aktif), pengelolaan profil, dokumen bersertifikat demo, dan pusat notifikasi.
3. **Administration Portal (`/admin`)**: Dashboard operasional dengan metrik agregat, verifikasi pendaftaran calon anggota baru, manajemen direktori anggota, manajemen transaksi simpanan, manajemen pengajuan dan persetujuan pinjaman bertingkat (jika modul aktif), pembukuan kas harian dan rekonsiliasi pembayaran, laporan keuangan demonstrasi (neraca, laba rugi, arus kas, kolektibilitas), manajemen konten/pengumuman, manajemen pengguna staf dan matriks kewenangan, audit trail aktivitas, serta panel konfigurasi koperasi dan demo tools.
4. **Simulation Engine**: Simulasi latensi jaringan (500–2500ms), simulated authentication berbasis role-switcher tanpa backend, generator nomor rekening/transaksi sintetis, persistensi demo berbasis browser storage, dan mekanisme reset menyeluruh.

### 3.2 Di Luar Cakupan (Out of Scope — Absolute)
- Backend server sungguhan (Node.js, Express, Go, Python, Java, dsb.)
- Database engine (PostgreSQL, MySQL, SQLite, MongoDB, Supabase, Firebase, dsb.)
- API jaringan nyata (REST, GraphQL, gRPC, WebSocket)
- Integrasi payment gateway riil (Midtrans, Xendit, DOKU, Stripe, dsb.)
- Pemrosesan dana, transfer perbankan, atau mutasi uang sungguhan
- Autentikasi produksi, OAuth2/OIDC nyata, integrasi SMS OTP, atau WhatsApp Business API
- Pengumpulan, penyimpanan, atau pemrosesan data identitas pribadi asli (KTP asli dilarang keras)
- Sistem pembukuan akuntansi double-entry otomatis tingkat enterprise (hanya laporan demonstrasi teragregasi)
- Pelaporan kepatuhan regulasi resmi ke OJK/Kemenkop (format hanya representasi ilustratif visual)
- Native mobile application (Android/iOS APK)

---

## 4. Cooperative Identity & Multi-Organization Configuration

Platform tidak mengikat diri pada satu identitas koperasi tertentu. Seluruh identitas organisasi bersifat `CONFIGURABLE` dan dimuat melalui objek `cooperativeConfig`:

| Atribut Konfigurasi | Deskripsi | Status | Nilai Awal Demonstrasi |
|---------------------|-----------|--------|------------------------|
| `name` | Nama resmi koperasi | CONFIGURABLE | Koperasi Konsumen Makmur Bersama Nusantara (KMB - Identitas Demonstrasi Terpilih) |
| `legalType` | Model koperasi demonstrasi | CONFIGURABLE | Koperasi Konsumen & Jasa (Model Demonstrasi KMB) |
| `tagline` | Moto / slogan organisasi | CONFIGURABLE | "Tumbuh Bersama, Menyejahterakan Anggota" |
| `logoMark` | Aset logo visual (SVG/vektor solid) | CONFIGURABLE | Logomark Vektor Solid 2D Daun Bersusun (Warm Modern Finance) |
| `legalNumber` | Nomor Badan Hukum Koperasi | CONFIGURABLE | `DEMO-AHU-0001` (Nomor Demonstrasi Sintetis) |
| `address` | Alamat kantor operasional | CONFIGURABLE | Jl. Demonstrasi No. 01, Kawasan Simulasi, Jakarta (Alamat Demonstrasi / Fiktif) |
| `contactInfo` | Informasi kontak & email pengurus | CONFIGURABLE | Email: `sekretariat@koperasimakmur.invalid` / Telepon & WhatsApp: Kontak tidak tersedia dalam demonstrasi |
| `activeModules` | Array modul yang aktif | CONFIGURABLE | Lihat Seksi 5 |

> **Catatan Tata Kelola Identitas Demonstrasi:**  
> Identitas KMB dipilih sebagai identitas demonstrasi sementara untuk memvalidasi platform. Nama ini belum diverifikasi melalui registrasi resmi Kemenkumham RI (verifikasi legalitas di luar cakupan prototype). Model "Koperasi Konsumen & Jasa" digunakan sebagai model demonstrasi showcase, bukan klaim klasifikasi hukum resmi Kemenkop UKM. Seluruh nomor identitas kelembagaan (`DEMO-AHU-0001`, `DEMO-KOP-0001`), alamat kantor demonstrasi, dan domain email `.invalid` adalah data sintetis aman tanpa keterhubungan nyata. Kontak telepon dan WhatsApp tidak disediakan (keterangan: "Kontak tidak tersedia dalam demonstrasi"). Aplikasi demonstrasi dilarang keras membuat tautan `tel:`, tautan WhatsApp, atau tindakan komunikasi eksternal apapun menggunakan data placeholder.

---

## 5. Modular Architecture: Platform Core vs. Business Modules

Platform dipisahkan secara arsitektural menjadi dua lapisan: **Platform Core** (lapisan pondasi yang selalu aktif) dan **Business Modules** (lapisan modul bisnis yang dapat diaktifkan/dinonaktifkan). Pemisahan ini memungkinkan platform melayani berbagai jenis koperasi (simpan pinjam, konsumen, produsen, jasa, dsb.) tanpa mengunci model bisnis tertentu.

### 5.1 Platform Core (Selalu Aktif)

Platform Core hanya mencakup 7 kapabilitas dasar yang mutlak dibutuhkan platform untuk berfungsi:

| Modul Core | Deskripsi |
|------------|-----------|
| Cooperative Identity & Configuration | Profil, identitas visual, parameter organisasi |
| User Management | Akun pengguna internal, autentikasi simulasi |
| Role & Permission | Penetapan peran dan hak akses |
| Membership Foundation | Pendaftaran, status keanggotaan, direktori anggota |
| Basic Administration | Dashboard operasional dasar, manajemen konten |
| System Configuration | Aktivasi/deaktivasi modul, parameter platform |
| Core Audit Logging | Pencatatan jejak setiap operasi tulis — **internal, tidak dapat dinonaktifkan** |

> **Catatan Audit Logging:** Core Audit Logging adalah kapabilitas internal sistem yang berjalan di latar belakang. Ini berbeda dari **Audit Trail UI** (Business Module opsional) yang merupakan antarmuka untuk melihat jejak aktivitas. Core Audit Logging tidak boleh dihilangkan meskipun Audit Trail UI dinonaktifkan.

### 5.2 Business Modules (Dapat Dikonfigurasi On/Off)

Kapabilitas bisnis koperasi bersifat modular dan dapat diaktifkan atau dinonaktifkan sesuai model bisnis koperasi.
- **Penting:** Modul Simpanan (`savings`), Pinjaman (`loans`), dan SHU (`shu`) adalah **Business Modules**, bukan Platform Core.
- Status "Aktif (Default)" pada tabel di bawah merepresentasikan **konfigurasi demonstrasi** untuk kebutuhan showcase, bukan ketentuan arsitektur universal:

| Modul Bisnis | Kode | Deskripsi & Ruang Lingkup | Status Demo |
|--------------|------|---------------------------|-------------|
| Savings Management | `savings` | Rekening simpanan, mutasi, setoran, penarikan sukarela | Aktif (Default Demo) |
| Loan Management | `loans` | Pengajuan, persetujuan bertingkat, pencairan pinjaman | Aktif (Default Demo) |
| Installment Management | `installments` | Jadwal angsuran, penagihan, denda keterlambatan | Bergantung pada `loans` |
| Business Unit Management | `business_units` | Portofolio unit usaha riil non-simpan-pinjam (waserda, logistik, pengolahan hasil usaha), pencatatan omzet unit, dan agregasi kontribusi belanja anggota untuk kalkulasi jasa usaha SHU | Nonaktif (Default Demo) |
| SHU Management | `shu` | Perhitungan alokasi jasa modal, jasa usaha/transaksi, dan distribusi Sisa Hasil Usaha | Aktif (Default Demo) |
| Meeting & Voting | `meetings` | Penyelenggaraan Rapat Anggota Tahunan (RAT/RALB) digital: publikasi agenda, repositori LPJ/RAPBK, pemantauan kuorum kehadiran digital (terpisah dari pemungutan suara), dan simulasi e-voting keputusan/pemilihan (prinsip 1 Member = 1 Vote, anti-double voting per resolusi; simulasi antarmuka non-kriptografis) | Nonaktif (Default Demo) |
| Notification Management | `notifications` | Notifikasi status transaksi, pengingat jatuh tempo, dan pengumuman | Aktif (Default Demo) |
| Financial Reporting | `reports` | Neraca, Laba Rugi, Arus Kas, dan NPL (Akses Administrator: View & Export teknis) | Aktif (Default Demo) |
| Audit Trail UI | `audit_trail` | Antarmuka penelusuran jejak aktivitas operasional | Aktif (Default Demo) |

### 5.3 Module Dependency Matrix

| Modul | Bergantung Pada | Perilaku Jika Dependency Dinonaktifkan |
|-------|-----------------|---------------------------------------|
| `savings` | Tidak ada dependency wajib | Business Module opsional; jika dinonaktifkan, seluruh rute, menu, dan kartu simpanan disembunyikan; Platform Core tetap berfungsi penuh |
| `loans` | Tidak ada dependency wajib | Business Module opsional; jika dinonaktifkan, seluruh rute pinjaman disembunyikan dan `installments` otomatis nonaktif |
| `installments` | `loans` | Dinonaktifkan otomatis jika `loans` dinonaktifkan |
| `business_units` | Tidak ada dependency wajib | Independen dari modul pinjaman/simpanan; memberikan input omzet ke laporan keuangan dan jasa usaha ke SHU jika keduanya aktif |
| `meetings` | Tidak ada dependency wajib | Independen dari modul finansial; menggunakan Membership Foundation Core untuk validasi hak kehadiran kuorum dan hak suara (1 Member = 1 Vote; anti-double voting; simulasi frontend mock) |
| `shu` | Tidak ada dependency wajib | Dapat aktif tanpa `savings` atau `loans`; formula alokasi disesuaikan via `productConfig.shuConfig` |
| `reports` | `savings` / `loans` / `business_units` (sebagai sumber data finansial) | Laporan keuangan tetap dapat ditampilkan dengan data modul yang aktif; seksi yang nonaktif ditandai "Tidak Tersedia — Modul Nonaktif" tanpa merusak kesetimbangan neraca |
| `notifications` | Tidak ada dependency wajib | Dapat dinonaktifkan; event pemicu tetap dicatat pada Core Audit Logging |
| `audit_trail` | Bergantung pada Core Audit Logging | UI Audit Trail dapat dinonaktifkan; pencatatan Core Audit Logging internal tetap berjalan |

> **Ketentuan Khusus Akses Laporan Administrator:**  
> Sesuai prinsip *Separation of Duties (SoD)*, peran **Administrator** memiliki hak akses **View dan Export** laporan keuangan untuk keperluan pemeliharaan teknis sistem, verifikasi integritas data, dan pencadangan (backup). Administrator **dilarang keras** memiliki kewenangan membuat jurnal penyesuaian kas, merekonsiliasi pembayaran, menyetujui transaksi keuangan, maupun mengesahkan buku kas/laporan keuangan (wewenang tersebut eksklusif dipegang oleh Finance Officer, Treasurer, dan Manager/Board).

### 5.4 Perilaku Adaptasi Saat Modul Non-Aktif

Ketika modul bisnis (`savings`, `loans`, `shu`, dsb.) dinonaktifkan:
1. **Navigasi:** Seluruh item menu terkait modul (seperti `/layanan/simpanan`, `/portal/simpanan`, `/admin/simpanan`) disembunyikan dari semua lingkungan.
2. **Rute:** Rute terkait menampilkan halaman informasi status "Modul Tidak Aktif" — bukan 404 dan bukan blank page.
3. **Dashboard:** Kartu metrik terkait modul tidak ditampilkan atau ditandai nonaktif tanpa merusak tata letak.
4. **Formulir:** Field dan langkah wizard terkait modul tidak ditampilkan.
5. **API Simulasi:** Service terkait mengembalikan status/error `MODULE_DISABLED` yang ditangani gracefully di UI.
6. **Platform Core:** Seluruh 7 fondasi Core tetap dapat beroperasi normal tanpa dependensi pada modul bisnis manapun.

### 5.5 Catatan Multi-Tenant / Multi-Cooperative

Status: `OUT OF SCOPE (Prototype)`

Prototype ini mendukung konfigurasi **satu koperasi demonstrasi** dalam satu sesi. Platform tidak mengimplementasikan sistem multi-tenant pada fase ini. Dokumentasi merujuk pada "konfigurasi koperasi" untuk menunjukkan bahwa nilai-nilai tersebut dapat berbeda antar koperasi pada deployment nyata — bukan klaim bahwa multi-tenant sudah diimplementasikan.

Roadmap multi-tenant dicatat sebagai potensi masa depan; belum ada keputusan arsitektural yang dibuat.

---

## 6. Target Users & User Personas (Design Hypotheses)

> **Catatan Metodologis:** Personas di bawah ini merupakan hipotesis desain internal untuk memandu perancangan interaksi dan visual, bukan hasil riset empiris pengguna yang telah tervalidasi.

### Persona 1: Pak Joko (52 th) — Anggota Senior Koperasi
- **Profil:** Anggota koperasi simpan pinjam selama 8 tahun, mengakses melalui smartphone Android kelas menengah.
- **Tujuan:** Melihat akumulasi simpanan wajib dan sukarela secara transparan; membayar simpanan tanpa harus antre di kantor.
- **Kebutuhan Desain:** Ukuran font terbaca jelas, kontras tinggi, navigasi sederhana, format Rupiah tidak membingungkan, konfirmasi visual instan setelah pembayaran simulasi.

### Persona 2: Siti Rahma (29 th) — Anggota Produktif / Pelaku UMKM
- **Profil:** Pemilik usaha kuliner rumahan, terbiasa bertransaksi digital via mobile banking dan QRIS.
- **Tujuan:** Mengajukan pinjaman modal usaha dengan simulasi angsuran yang transparan dan memantau status persetujuan secara mandiri.
- **Kebutuhan Desain:** Kalkulator estimasi angsuran real-time, kejelasan persyaratan, upload dokumen simpel, pelacakan proses bertingkat.

### Persona 3: Dewi (34 th) — Staf Operasional Koperasi
- **Profil:** Staf administrasi harian yang memproses puluhan pendaftaran anggota baru dan verifikasi setoran manual.
- **Tujuan:** Memeriksa berkas permohonan dengan cepat, memberikan catatan verifikasi, dan memproses antrean transaksi harian.
- **Kebutuhan Desain:** Filter tabel yang responsif, modal verifikasi ringkas dengan pratinjau dokumen, feedback error jelas saat data tidak lengkap.

### Persona 4: Hendra (46 th) — Manajer / Pengurus Koperasi
- **Profil:** Pimpinan operasional yang memantau kesehatan portofolio keuangan dan menandatangani persetujuan pinjaman berskala menengah-besar.
- **Tujuan:** Melihat performa likuiditas harian, menyetujui/menolak pengajuan berjenjang, dan memantau rasio kolektibilitas.
- **Kebutuhan Desain:** Ringkasan KPI operasional yang padat informasi tanpa clutter, riwayat persetujuan terstruktur, laporan keuangan periodik yang dapat dicetak rapi.

---

## 7. Functional Requirements

### 7.1 Public Website
- **FR-PUB-01:** Menampilkan informasi profil, visi-misi, dan struktur organisasi koperasi.
- **FR-PUB-02:** Menampilkan katalog layanan simpanan dan pinjaman sesuai modul aktif.
- **FR-PUB-03:** Menyediakan wizard pendaftaran anggota baru multi-tahap dengan validasi input (Zod), menggunakan label "ID Demonstrasi" berformat tunggal `DEMO-ID-0001` (dilarang format NIK 16-digit atau validasi NIK nasional).
- **FR-PUB-04:** Menyediakan pelacak status pendaftaran menggunakan kode registrasi sintetis.
- **FR-PUB-05:** Menampilkan artikel berita, transparansi publik, dan FAQ interaktif.
- **FR-PUB-06:** Menyediakan gerbang masuk terpadu dengan pemilih peran untuk kemudahan demo.

### 7.2 Member Portal
- **FR-POR-01:** Menampilkan ringkasan saldo simpanan, tagihan jatuh tempo (jika modul aktif), dan aktivitas transaksi terkini.
- **FR-POR-02:** Menampilkan rincian buku simpanan per rekening (pokok, wajib, sukarela, berjangka) beserta mutasi.
- **FR-POR-03:** Menyediakan alur pengajuan simpanan/setoran baru dengan simulasi instruksi transfer.
- **FR-POR-04:** Menyediakan kalkulator simulasi dan wizard pengajuan pinjaman (jika modul aktif).
- **FR-POR-05:** Menampilkan jadwal angsuran pinjaman aktif dengan status keterlambatan dan denda (jika modul aktif).
- **FR-POR-06:** Menyediakan pusat pembayaran simulasi dengan opsi transfer manual (simulasi unggah bukti transfer berlabel SIMULATED DOCUMENT tanpa penyimpanan base64/file riil) dan kanal gateway instan (VA sintetis dan QRIS mockup).
- **FR-POR-07:** Menampilkan proyeksi dan riwayat pembagian SHU anggota (jika modul aktif).
- **FR-POR-08:** Menampilkan profil keanggotaan dan placeholder dokumen terverifikasi bertanda demo.

### 7.3 Administration Portal
- **FR-ADM-01:** Menampilkan dashboard operasional dengan metrik anggota, kas, portofolio, dan antrean tugas staf.
- **FR-ADM-02:** Menyediakan alur pemeriksaan kelengkapan, verifikasi, dan rekomendasi berkas pendaftaran calon anggota oleh Staf, serta alur persetujuan final keanggotaan oleh Pengurus.
- **FR-ADM-03:** Manajemen direktori anggota dengan pencarian, pemfilteran status, dan audit detail rekening.
- **FR-ADM-04:** Manajemen transaksi simpanan (pencatatan setoran manual, penarikan, dan koreksi berizin).
- **FR-ADM-05:** Manajemen pengajuan pinjaman dengan workflow persetujuan bertingkat (Staff → Finance Officer → Pengurus) sesuai matriks limit (jika modul aktif).
- **FR-ADM-06:** Pemrosesan antrean pencairan pinjaman siap cair oleh Finance Officer (jika modul aktif).
- **FR-ADM-07:** Rekonsiliasi pembayaran manual: verifikasi bukti transfer simulasi dan pembukuan angsuran.
- **FR-ADM-08:** Penyusunan dan penayangan laporan keuangan demonstrasi (Neraca, Laba Rugi, Arus Kas, NPL). Akses peran Administrator dibatasi pada View dan Export teknis tanpa izin modifikasi jurnal kas, persetujuan buku kas, atau rekonsiliasi.
- **FR-ADM-09:** Manajemen pengguna staf dan konfigurasi peran/kewenangan.
- **FR-ADM-10:** Penelusuran audit log aktivitas operasional berstatus read-only.
- **FR-ADM-11:** Panel konfigurasi platform, aktivasi/deaktivasi modul, dan eksekutor Reset Demo.

---

## 8. Non-Functional Requirements

- **NFR-PERF-01 (Responsiveness):** Seluruh aksi antarmuka lokal bereaksi <100ms; operasi asinkron simulasi menggunakan delay terprogram 500–1500ms untuk merefleksikan proses riil.
- **NFR-RESP-01 (Multi-Device):** Mendukung dan teruji bebas horizontal overflow pada 8 viewport: 320px, 375px, 390px, 768px, 1024px, 1280px, 1440px, 1920px.
- **NFR-A11Y-01 (Accessibility):** Mengacu pada target pedoman WCAG 2.2 Level AA sebagai acceptance criteria desain dan pengujian (kontras rasio teks normal ≥ 4.5:1, keyboard navigasi menyeluruh, indikator fokus terlihat, form labeling eksplisit).
- **NFR-SEC-01 (Privacy & Demo Safety):** 100% data demonstrasi adalah fiktif. Tidak ada data pribadi asli, NIK nasional 16-digit, atau kredensial nyata yang disimpan. Seluruh pengunggahan berkas adalah simulasi visual tanpa penyimpanan base64 atau berkas biner asli. Format identitas demonstrasi wajib `DEMO-ID-0001`.
- **NFR-DES-01 (Visual Consistency):** Mematuhi arah visual Warm Modern Finance / Editorial Minimalism secara mutlak (nol gradien, nol glassmorphism, palet warna solid terkendali).

---

## 9. Product Constraints

1. **Frontend-Only Architecture:** Aplikasi berjalan murni pada sisi klien (client-side single page application). Tidak ada komponen backend yang dibangun atau diintegrasikan.
2. **State Ephemerality & Local Persistence:** Seluruh mutasi data demonstrasi disimpan di `localStorage` per peramban dan dapat dipulihkan secara instan melalui fungsi reset demo.
3. **Typography & Assets:** Tipografi utama menggunakan Inter dengan fallback font sistem; seluruh ikonografi menggunakan Lucide React.
4. **Localization:** Seluruh label antarmuka, pesan validasi, dan komunikasi visual menggunakan Bahasa Indonesia dengan konvensi penulisan mata uang Rupiah (`Rp 1.250.000`) dan tanggal Indonesia.

---

## 10. Assumptions & Unresolved Product Decisions

Setiap asumsi ditandai dengan status resmi untuk mencegah klaim sepihak.

| ID | Topik Keputusan | Status | Asumsi Awal Demonstrasi | Tindakan Validasi Lanjutan |
|----|-----------------|--------|-------------------------|----------------------------|
| U01 | Nama resmi & identitas visual koperasi | CONFIRMED (Internal Phase 1 Demo) | Koperasi Konsumen Makmur Bersama Nusantara (KMB), Natural Forest Green, Inter | KMB dipilih sebagai identitas demo; validasi ketersediaan legalitas resmi di luar cakupan prototype |
| U02 | Batas plafon dan rasio simpanan terhadap pinjaman | CONFIGURABLE | Batas ilustratif: 3× simpanan wajib akumulatif | Disimpan dalam `productConfig`, dapat diubah |
| U03 | Metode kalkulasi bunga pinjaman standar | CONFIGURABLE | Mendukung Flat, Anuitas, Efektif. Default demo: Flat | Konfigurasi per produk pinjaman |
| U04 | Formula alokasi persentase SHU | CONFIGURABLE | Formula ilustratif: 40% simpanan, 40% pinjaman, 20% cadangan | Dikelola dalam konfigurasi modul SHU |
| U05 | Struktur biaya administrasi dan provisi pinjaman | CONFIGURABLE | Ilustratif: Administrasi 1%, provisi 0% | Dikelola dalam konfigurasi produk pinjaman |
| U06 | Kanal gateway pembayaran yang disimulasikan | PROPOSED | Simulasi Virtual Account BCA & Mock QRIS | Dikonfirmasi pada Phase 3 |
| U07 | Format standar ekspor laporan keuangan | PROPOSED | Tampilan cetak browser (CSS print media query) | Diuji pada Phase 7 |
| U08 | Kebijakan penanganan anggota non-aktif / terlambat | CONFIGURABLE | Penandaan status setelah 3 bulan tunggakan simpanan wajib | Konfigurasi kebijakan keanggotaan |

---

## 11. Acceptance Criteria (Phase 0)

1. Dokumen PRD disetujui sebagai pedoman platform koperasi modular multi-organisasi.
2. Seluruh modul diklasifikasikan dengan jelas antara Core dan Optional.
3. Identitas koperasi dan seluruh parameter keuangan dinyatakan dapat dikonfigurasi (`CONFIGURABLE`) atau berstatus data demo ilustratif (`ILLUSTRATIVE`).
4. Batasan frontend-only, ketiadaan transaksi riil, dan kewajiban data sintetis ditegaskan tanpa ambiguitas.
5. Kriteria mutu dan pengujian fase berikutnya didefinisikan secara konkret.
