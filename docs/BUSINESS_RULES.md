# Business Rules — Platform Digital Koperasi Indonesia
**Version:** 0.2 (Phase 0 Refined)
**Status:** PROPOSED — Under Review
**Date:** 2026-11-02

---

## PETUNJUK MEMBACA DOKUMEN INI

Aturan dalam dokumen ini dipisahkan menjadi tiga kategori jelas:

| Kategori | Label | Keterangan |
|----------|-------|------------|
| **Aturan inti platform** | `PLATFORM RULE` | Berlaku secara umum sebagai mekanisme fundamental platform. |
| **Konfigurasi koperasi** | `CONFIGURABLE` | Nilai atau kebijakan yang ditetapkan oleh masing-masing koperasi; tidak boleh dikodekan keras sebagai konstanta universal. |
| **Nilai data demonstrasi** | `ILLUSTRATIVE` | Hanya untuk membuat prototype demo terlihat realistis; bukan standar hukum, bukan kebijakan platform, dan dapat diubah tanpa mengubah mekanisme inti aplikasi. |

Jika suatu aturan belum dapat ditetapkan, gunakan status `UNRESOLVED`.
Jangan mengkaim kesesuaian regulasi (OJK, Kemenkop) tanpa validasi dari pemangku kepentingan.

---

## BR-01: Manajemen Keanggotaan

### BR-01.1 — Identitas Keanggotaan `PLATFORM RULE`
- Setiap anggota memiliki satu identitas keanggotaan dalam sistem.
- Nomor anggota bersifat unik di dalam lingkup satu koperasi.
- Data anggota hanya dapat diakses sesuai hak akses peran yang ditetapkan.
- Perubahan data penting (status, rekening, dokumen) harus tercatat dalam audit trail.

### BR-01.2 — Syarat & Alur Persetujuan Pendaftaran `PLATFORM RULE` + `CONFIGURABLE`
**Platform Rule:**
- Formulir pendaftaran tidak boleh meminta identitas asli dalam mode demonstrasi.
- Nomor identitas yang digunakan dalam demo wajib menggunakan format tunggal identitas demonstrasi: `DEMO-ID-0001` (dilarang menggunakan format NIK 16-digit maupun struktur sintetis yang menyerupai NIK nasional).
- Seluruh formulir pendaftaran wajib menggunakan label "ID Demonstrasi" — dilarang menggunakan label "Nomor KTP / NIK".
- Tidak ada validasi format NIK nasional dalam sistem demonstrasi.
- **Pemisahan 5 Tahapan Penerimaan Anggota:**
  1. *Pemeriksaan Kelengkapan:* Dilakukan oleh Staf Operasional untuk memastikan berkas terisi.
  2. *Verifikasi:* Dilakukan oleh Staf Operasional untuk memeriksa kesesuaian format demo dan data pendukung.
  3. *Rekomendasi:* Staf memberikan rekomendasi persetujuan atau penolakan administratif; Staf dilarang memberikan persetujuan final.
  4. *Persetujuan Final:* Wewenang organisasi mutlak berada pada Pengurus / Board; Administrator sistem dan Staf tidak memiliki kewenangan ini.
  5. *Penerbitan Nomor Anggota:* Diproses otomatis oleh sistem segera setelah persetujuan final organisasi dikonfirmasi.

**Configurable:**
- Pemegang otoritas persetujuan keanggotaan definitif (Ketua Pengurus, Pleno Rapat Pengurus, atau delegasi): `CONFIGURABLE` — `UNRESOLVED`
- Persyaratan kewarganegaraan (WNI, WNA, atau badan usaha): `CONFIGURABLE` — `UNRESOLVED`
- Batas usia minimum: `CONFIGURABLE` — `UNRESOLVED`
- Jenis dokumen yang wajib dilampirkan: `CONFIGURABLE` — `UNRESOLVED`

### BR-01.3 — Biaya Awal Keanggotaan `CONFIGURABLE`
- Besaran Simpanan Pokok: `CONFIGURABLE` — `UNRESOLVED`
  - Nilai demonstrasi: `Rp 100.000` `ILLUSTRATIVE`
- Besaran Simpanan Wajib Perdana: `CONFIGURABLE` — `UNRESOLVED`
  - Nilai demonstrasi: `Rp 50.000` per bulan `ILLUSTRATIVE`
- Finalitas pendaftaran setelah konfirmasi pembayaran: `PLATFORM RULE`

### BR-01.4 — Siklus Status Keanggotaan `PLATFORM RULE`

```
Calon Anggota (Pengajuan Dikirim)
  → Menunggu Verifikasi Staf (Pemeriksaan Kelengkapan & Format)
      → [Berkas Kurang] Menunggu Kelengkapan
      → [Verifikasi Lolos] Menunggu Persetujuan Pengurus (Rekomendasi Staf)
      → [Ditolak Administratif] Ditolak
  → Keputusan Final Organisasi (Pengurus / Board)
      → Disetujui (Nomor Anggota Diterbitkan Otomatis)
      → Ditolak (Penolakan oleh Pengurus)

Anggota Aktif
  → Aktif
  → Dalam Peninjauan (Melebihi kebijakan tunggakan simpanan wajib)
  → Dibekukan (Tindakan administratif; tidak dapat bertransaksi)
  → Keluar / Mundur (Atas permintaan anggota; prosedur penyelesaian kewajiban diperlukan)
  → Meninggal Dunia (Status khusus; prosedur penanganan UNRESOLVED)
```

- Ambang tunggakan simpanan wajib yang memicu perubahan status: `CONFIGURABLE` — `UNRESOLVED`
  - Nilai demonstrasi: 3 bulan berturut-turut `ILLUSTRATIVE`

### BR-01.5 — Penanganan Anggota Meninggal Dunia `UNRESOLVED`

Status penanganan anggota yang meninggal dunia belum ditetapkan untuk prototype ini. Aspek-aspek yang memerlukan keputusan:

| Aspek | Status |
|-------|--------|
| Prosedur pemberitahuan dan verifikasi status meninggal | UNRESOLVED |
| Pengembalian simpanan pokok kepada ahli waris | UNRESOLVED |
| Pengembalian simpanan wajib setelah dikurangi kewajiban | UNRESOLVED |
| Pelunasan sisa pinjaman (apakah dilunasi dari simpanan atau oleh ahli waris?) | UNRESOLVED |
| Distribusi SHU kepada ahli waris pada periode berjalan | UNRESOLVED |
| Prosedur legal yang diperlukan (dokumentasi kematian, dll.) | UNRESOLVED |

Prototype tidak mengimplementasikan alur ini. Status `Meninggal Dunia` hanya tersedia sebagai label status administratif di demo — tanpa alur fungsional yang aktif.

---

## BR-02: Simpanan (Jika Modul Savings Management Aktif)

> **Klarifikasi Arsitektur:** Modul `Savings Management` (`savings`) adalah **Business Module** yang dapat diaktifkan/dinonaktifkan via konfigurasi, **bukan Platform Core**. Platform Core hanya mencakup Cooperative Identity & Configuration, User Management, Role & Permission, Membership Foundation, Basic Administration, System Configuration, dan Core Audit Logging. Dalam konfigurasi standar demonstrasi, modul Simpanan diaktifkan secara default untuk keperluan showcase, namun bukan ketentuan arsitektur universal. Koperasi yang tidak menyelenggarakan unit simpanan dapat menonaktifkan modul ini.

### BR-02.1 — Jenis Simpanan `CONFIGURABLE`
Platform mendukung empat jenis produk simpanan koperasi dalam modul Savings Management. Masing-masing koperasi dapat memilih produk yang diaktifkan:

| Jenis Produk | Kode | Status Produk (dalam Modul Savings) |
|--------------|------|--------------------------------------|
| Simpanan Pokok | SP | Standar Produk Simpanan |
| Simpanan Wajib | SW | Standar Produk Simpanan |
| Simpanan Sukarela | SS | Standar Produk Simpanan |
| Simpanan Berjangka | SB | Produk Opsional Simpanan |

### BR-02.2 — Simpanan Pokok `PLATFORM RULE`
- Dibayarkan satu kali pada saat pendaftaran.
- Dikembalikan kepada anggota yang keluar setelah dikurangi kewajiban yang belum diselesaikan.
- Apakah Simpanan Pokok diperhitungkan dalam alokasi SHU: `CONFIGURABLE` — `UNRESOLVED`

### BR-02.3 — Simpanan Wajib `PLATFORM RULE` + `CONFIGURABLE`
- Dibayarkan secara periodik sesuai jadwal yang ditetapkan koperasi.
- Tidak dapat ditarik selama keanggotaan aktif.
- Dikembalikan kepada anggota yang keluar setelah dikurangi kewajiban.
- Frekuensi dan tanggal jatuh tempo: `CONFIGURABLE` — `UNRESOLVED`
  - Demonstrasi menggunakan pembayaran bulanan `ILLUSTRATIVE`

### BR-02.4 — Simpanan Sukarela `CONFIGURABLE`
- Dapat disetor dan ditarik sewaktu-waktu oleh anggota aktif.
- Apakah menghasilkan bunga/imbal hasil: `CONFIGURABLE` — `UNRESOLVED`
  - Nilai suku bunga demonstrasi: `2% per tahun` `ILLUSTRATIVE`

### BR-02.5 — Simpanan Berjangka `CONFIGURABLE`
- Tenor, suku bunga, dan syarat pencairan awal sepenuhnya: `CONFIGURABLE`
- Nilai demonstrasi per tenor (tidak mengikat):

  | Tenor | Suku Bunga |
  |-------|-----------|
  | 1 bulan | 4% p.a. |
  | 3 bulan | 5% p.a. |
  | 6 bulan | 5,5% p.a. |
  | 12 bulan | 6% p.a. |

  Label: `ILLUSTRATIVE` — Bukan imbal hasil resmi koperasi manapun.

- Penalti pencairan awal: `CONFIGURABLE` — `UNRESOLVED`
  - Nilai demonstrasi: 50% bunga yang telah timbul hangus `ILLUSTRATIVE`
- Perpanjangan otomatis: `CONFIGURABLE`

---

## BR-03: Pinjaman (Jika Modul Loan Management Aktif)

> Seluruh aturan di seksi ini hanya berlaku ketika modul `Loan Management` dalam konfigurasi koperasi berstatus `enabled`. Koperasi yang tidak menyediakan layanan pinjaman (seperti koperasi konsumen murni atau jasa) tidak menerapkan seksi ini.

### BR-03.1 — Syarat Kelayakan Peminjam `PLATFORM RULE` + `CONFIGURABLE`
**Platform Rule:**
- Peminjam harus merupakan anggota aktif yang terdaftar dalam sistem.
- Anggota dalam status Dibekukan tidak dapat mengajukan pinjaman.
- Anggota dengan angsuran yang telah lewat jatuh tempo tidak dapat mengajukan pinjaman baru (selama tunggakan belum diselesaikan).

**Configurable:**
- Masa keanggotaan minimum sebelum dapat mengajukan pinjaman pertama: `CONFIGURABLE` — `UNRESOLVED`
  - Nilai demonstrasi: 3 bulan `ILLUSTRATIVE`
- Maksimum jumlah pinjaman aktif yang diperbolehkan bersamaan: `CONFIGURABLE` — `UNRESOLVED`
  - Nilai demonstrasi: 2 pinjaman aktif `ILLUSTRATIVE`

### BR-03.2 — Plafon Pinjaman `CONFIGURABLE`
Seluruh nilai di bawah ini adalah `ILLUSTRATIVE`. Koperasi menetapkan nilainya sendiri:

| Parameter | Nilai Demonstrasi | Label |
|-----------|------------------|-------|
| Formula plafon berbasis simpanan | 3× simpanan wajib akumulatif | ILLUSTRATIVE |
| Batas Pinjaman Konsumtif | Rp 50.000.000 | ILLUSTRATIVE |
| Batas Pinjaman Produktif | Rp 100.000.000 | ILLUSTRATIVE |
| Batas Pinjaman Darurat | Rp 10.000.000 | ILLUSTRATIVE |

### BR-03.3 — Spesifikasi Kalkulasi Finansial (Lengkap untuk Simulasi) `CONFIGURABLE`

Platform mendukung tiga metode kalkulasi bunga pinjaman. Masing-masing produk pinjaman menetapkan metode yang aktif.

#### 1. Flat Rate (Bunga Flat)
Bunga dihitung dari pokok pinjaman awal secara konstan setiap bulan:
```
Pokok Per Bulan = Math.floor(Jumlah Pinjaman / Tenor)
Bunga Per Bulan = Math.round((Jumlah Pinjaman * Suku Bunga Tahunan) / (12 * 100))
Total Angsuran = Pokok Per Bulan + Bunga Per Bulan
Sisa Pembulatan Pokok = Jumlah Pinjaman - (Pokok Per Bulan * Tenor)
// Sisa pembulatan pokok ditambahkan pada angsuran bulan terakhir
```

#### 2. Anuitas (Cicilan Setara / Equal Installment)
Total angsuran per bulan bernilai konstan; porsi pokok bertambah dan porsi bunga berkurang:
```
i = (Suku Bunga Tahunan / 100) / 12  // Suku bunga bulanan
Total Angsuran = Math.round(P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1))
Bunga Bulan k = Math.round(Saldo Pokok Tersisa * i)
Pokok Bulan k = Total Angsuran - Bunga Bulan k
Saldo Pokok Tersisa (k) = Saldo Pokok Tersisa (k-1) - Pokok Bulan k
// Pada bulan terakhir n: Pokok = Saldo Pokok Tersisa (k-1); Bunga = disesuaikan; Saldo akhir = Rp 0
```

#### 3. Efektif (Saldo Menurun / Declining Balance)
Pokok konstan setiap bulan; bunga dihitung dari saldo pokok yang tersisa (angsuran mengecil seiring waktu):
```
Pokok Per Bulan = Math.floor(Jumlah Pinjaman / Tenor)
Bunga Bulan k = Math.round((Saldo Pokok Tersisa * Suku Bunga Tahunan) / (12 * 100))
Total Angsuran Bulan k = Pokok Per Bulan + Bunga Bulan k
Saldo Pokok Tersisa (k) = Saldo Pokok Tersisa (k-1) - Pokok Per Bulan
// Sisa pembulatan pokok ditambahkan pada angsuran bulan terakhir
```

#### Aturan Pembulatan & Presisi Finansial `PLATFORM RULE`
- Seluruh nilai nominal dibulatkan ke Rupiah terdekat (`Math.round`) tanpa desimal.
- Selisih pembulatan pokok (rounding residual) tidak boleh hilang; dialokasikan ke **angsuran bulan terakhir** sehingga total pokok yang dikembalikan sama persis dengan pokok pinjaman awal.
- Konversi suku bunga tahunan ke bulanan: dibagi 12 periode.
- Data input kalkulasi bersumber dari form wizard; data jadwal angsuran di-cache di `useLoanStore`.

Metode default demo: **Flat Rate** `ILLUSTRATIVE`

### BR-03.4 — Suku Bunga Pinjaman `CONFIGURABLE`
Semua nilai berikut adalah `ILLUSTRATIVE` dan bukan suku bunga resmi maupun rekomendasi platform:

| Jenis Pinjaman | Suku Bunga Demo | Label |
|----------------|-----------------|-------|
| Konsumtif | 12% p.a. flat | ILLUSTRATIVE |
| Produktif | 10% p.a. flat | ILLUSTRATIVE |
| Darurat | 8% p.a. flat | ILLUSTRATIVE |

### BR-03.5 — Biaya Pinjaman `CONFIGURABLE`
Nilai berikut adalah `ILLUSTRATIVE`:

| Biaya | Nilai Demo | Label |
|-------|-----------|-------|
| Biaya Administrasi | 1% dari pokok pinjaman (dipotong dari pencairan) | ILLUSTRATIVE |
| Biaya Provisi | 0% | ILLUSTRATIVE |
| Biaya Asuransi | Tidak termasuk dalam demo | ILLUSTRATIVE |

### BR-03.6 — Alur Persetujuan Bertingkat (Approval Workflow) `PLATFORM RULE` + `CONFIGURABLE`
**Platform Rule:**
- Pengajuan pinjaman harus melewati proses verifikasi sebelum disetujui.
- Setiap tahap persetujuan harus mencatat identitas pejabat yang berwenang, tanggal, dan catatan keputusan.
- Sistem mencatat status transisi secara kronologis di audit log.
- **Separation of Duties (SoD):** Pejabat yang mengajukan pinjaman tidak dapat bertindak sebagai penyetuju; Staf yang memverifikasi dokumen tidak dapat merangkap sebagai pihak pencair.

**Configurable:**
- Matriks limit kewenangan persetujuan (nilai demonstrasi): `CONFIGURABLE`
  - s.d. `Rp 10.000.000`: Verifikasi Staf + Persetujuan Finance Officer `ILLUSTRATIVE`
  - `Rp 10.000.001` – `Rp 50.000.000`: + Persetujuan Manajer/Pengurus `ILLUSTRATIVE`
  - Di atas `Rp 50.000.000`: + Keputusan Rapat Pengurus (disimulasikan dengan catatan) `ILLUSTRATIVE`

### BR-03.7 — Pencairan `PLATFORM RULE`
- Net pencairan = Pokok pinjaman − Biaya yang berlaku.
- Tanggal pencairan dicatat dan menjadi dasar penghitungan jadwal angsuran.
- Angsuran pertama jatuh tempo satu bulan setelah tanggal pencairan.

### BR-03.8 — Angsuran dan Penagihan `PLATFORM RULE` + `CONFIGURABLE`
**Platform Rule:**
- Tanggal jatuh tempo angsuran konsisten setiap bulan mengacu pada tanggal pencairan.
- Keterlambatan angsuran mengubah status kolektibilitas sesuai konfigurasi koperasi.

**Configurable:**
- Masa tenggang (grace period): `CONFIGURABLE` — `UNRESOLVED`
  - Nilai demonstrasi: 3 hari kalender `ILLUSTRATIVE`
- Denda keterlambatan: `CONFIGURABLE` — `UNRESOLVED`
  - Nilai demonstrasi: 0,5% per hari dari sisa angsuran yang terlambat `ILLUSTRATIVE`

**Klasifikasi kolektibilitas (NPL) demonstrasi `ILLUSTRATIVE`:**
- Lancar: 0 hari keterlambatan
- Dalam Perhatian Khusus (DPK): 1–90 hari
- Kurang Lancar: 91–120 hari
- Diragukan: 121–180 hari
- Macet: >180 hari

*Catatan: Klasifikasi di atas merepresentasikan struktur umum perbankan Indonesia sebagai referensi visual. Koperasi menetapkan kebijakan kolektibilitasnya sendiri.*

---

## BR-04: Pembayaran

### BR-04.1 — Pembayaran Transfer Manual `PLATFORM RULE`
- Unggah bukti transfer bersifat simulasi antarmuka semata (UI simulation only).
- Berkas yang dipilih pengguna **tidak boleh disimpan** dalam bentuk apapun: tidak ada penyimpanan base64, konten biner, maupun metadata dokumen pribadi di localStorage, sessionStorage, memori, atau media penyimpanan manapun.
- Sistem secara otomatis mengganti berkas unggahan dengan dokumen sintetis atau kartu placeholder bertanda `SIMULATED DOCUMENT`.
- Keterbatasan simulasi ini wajib dijelaskan secara transparan kepada pengguna demonstrasi pada antarmuka.
- Staf berwenang (Finance Officer / Petugas Keuangan) mengonfirmasi atau menolak pembayaran yang masuk pada antrean rekonsiliasi.
- Pembayaran yang telah dikonfirmasi memperbarui saldo dan jadwal secara simulasi.
- Koreksi/pembatalan membutuhkan tindakan administratif dengan alasan tercatat.

### BR-04.2 — Simulasi Gateway Pembayaran `PLATFORM RULE`
- Seluruh kanal pembayaran gateway bersifat **simulasi sepenuhnya** dan tidak terhubung ke gateway manapun.
- Penanda DEMO MODE wajib ditampilkan pada setiap layar pembayaran.
- Nama bank atau kanal yang ditampilkan (misal: "Bank X Virtual Account", "QRIS") adalah **konfigurasi ilustratif** untuk keperluan demo, bukan mitra resmi.
- Tombol "Simulasikan Pembayaran Berhasil" hanya muncul dalam mode demo.

### BR-04.3 — Urutan Prioritas Alokasi Pembayaran `CONFIGURABLE`
Urutan alokasi pembayaran ke rekening anggota (nilai demonstrasi):
1. Denda keterlambatan (jika ada)
2. Bunga pinjaman
3. Angsuran pokok pinjaman
4. Simpanan wajib (jika disertakan dalam satu pembayaran)

Label: `CONFIGURABLE` — koperasi dapat menetapkan urutan berbeda.

---

## BR-05: SHU / Sisa Hasil Usaha (Jika Modul SHU Aktif)

### BR-05.1 — Periode Perhitungan `CONFIGURABLE`
- Periode SHU standar: satu tahun buku.
- Apakah menggunakan tahun kalender atau tahun buku berbeda: `CONFIGURABLE` — `UNRESOLVED`

### BR-05.2 — Formula Distribusi `CONFIGURABLE`
Semua persentase berikut adalah `ILLUSTRATIVE` untuk demo — bukan standar wajib:

| Komponen | Porsi Demo | Label |
|----------|-----------|-------|
| Jasa Simpanan (proporsional terhadap rata-rata saldo simpanan anggota) | 40% | ILLUSTRATIVE |
| Jasa Pinjaman (proporsional terhadap bunga yang dibayarkan anggota) | 40% | ILLUSTRATIVE |
| Dana Cadangan Koperasi (tidak dibagikan ke anggota) | 20% | ILLUSTRATIVE |

Formula aktual ditentukan sepenuhnya oleh koperasi dan diatur dalam `productConfig.shuConfig`.

### BR-05.3 — Syarat Penerima SHU `CONFIGURABLE`
- Hanya anggota yang aktif selama periode penuh yang berhak: `PLATFORM RULE` (umum)
- Penanganan anggota baru di tengah periode (pro-rata): `CONFIGURABLE` — `UNRESOLVED`
- Anggota dengan pinjaman NPL: `CONFIGURABLE` — `UNRESOLVED`
  - Asumsi demo: dikecualikan dari distribusi `ILLUSTRATIVE`

---

## BR-06: Pelaporan Keuangan (Demonstrasi)

### BR-06.1 — Karakter Laporan Demonstrasi `PLATFORM RULE`
- Seluruh laporan keuangan demonstrasi adalah **representasi visual dari data teragregasi dan pre-computed balanced dataset**, bukan hasil dari sistem akuntansi double-entry otomatis bersertifikasi.
- Koperasi menggunakan bagan akun yang sesuai kebutuhan dan ketentuan RAT (Rapat Anggota Tahunan). Demonstrasi menggunakan struktur sederhana representatif:
  - 1xx: Aset
  - 2xx: Kewajiban
  - 3xx: Ekuitas / Modal
  - 4xx: Pendapatan
  - 5xx: Beban
- Ini adalah representasi **ilustrasi visual**, bukan standar akuntansi koperasi yang bersertifikasi.

### BR-06.2 — Standar Tampilan & Keseimbangan Laporan `PLATFORM RULE`
- **Jaminan Keseimbangan Neraca:** Neraca demonstrasi wajib selalu seimbang: `Total Aset = Total Kewajiban + Total Ekuitas` (Selisih = 0).
- **Penanganan Modul Non-Aktif:** Jika suatu modul bisnis dinonaktifkan (misal `Loan Management` atau `Savings Management`), seksi laporan yang bergantung pada modul tersebut disembunyikan atau diberi label jelas "Tidak Tersedia — Modul Nonaktif" tanpa merusak integritas keseimbangan neraca yang telah dirancang.
- Header setiap laporan memuat penanda wajib: `LAPORAN KEUANGAN SIMULASI (DEMONSTRASI) — BUKAN LAPORAN KEUANGAN RESMI KOPERASI`.
- Seluruh angka dalam IDR tanpa desimal.
- Nilai negatif ditampilkan dalam tanda kurung: `(Rp 1.250.000)` — bukan dengan tanda minus.
- Perbandingan periode (periode berjalan vs. periode sebelumnya) tersedia di seluruh laporan.

---

## BR-07: Sistem dan Audit

### BR-07.1 — Jejak Audit `PLATFORM RULE`
- Platform Core menyediakan Core Audit Logging internal yang mencatat setiap operasi tulis secara otomatis di latar belakang.
- Core Audit Logging tetap aktif dan berjalan meskipun Business Module `Audit Trail UI` dinonaktifkan.
- Setiap operasi tulis (buat, ubah, hapus) menambahkan entri ke audit log simulasi.
- Field audit log: timestamp, identitas pengguna (peran + ID), aksi, jenis entitas, ID entitas, perubahan yang dilakukan.
- Audit log bersifat read-only; tidak dapat dihapus atau dimodifikasi oleh peran manapun.

### BR-07.2 — Autentikasi Simulasi `PLATFORM RULE`
- Login adalah simulasi; tidak ada pertukaran token jaringan nyata.
- Peran disimpan di Zustand auth store menggunakan sessionStorage (otomatis terhapus saat tab/browser ditutup).
- Role Switcher demo melewati proses login kredensial; hanya untuk kemudahan demonstrasi 8 peran terautentikasi dan 2 konteks publik.

### BR-07.3 — Validasi Data `PLATFORM RULE`
- Semua input formulir divalidasi melalui Zod sebelum proses simulasi dijalankan.
- Jumlah uang harus berupa bilangan bulat positif (IDR tidak memiliki sub-rupiah).
- Semua tanggal historis tidak boleh berada di masa depan; semua tanggal yang dijadwalkan tidak boleh berada di masa lalu.

### BR-07.4 — Keamanan Data Demonstrasi `PLATFORM RULE`
- Tidak ada data identitas asli atau PII (Personally Identifiable Information) yang boleh disimpan dalam localStorage atau memori.
- Dilarang keras menggunakan format NIK 16-digit nasional maupun format sintetis yang menyerupai struktur NIK nasional.
- Format identitas demonstrasi wajib menggunakan format tunggal: `DEMO-ID-0001` (dan formulir wajib berlabel "ID Demonstrasi").
- Tidak ada penyimpanan file biner atau base64 untuk unggahan dokumen; semua dokumen adalah placeholder `SIMULATED DOCUMENT` atau dokumen contoh sintetis bawaan aplikasi.
- Data anggota dalam seed adalah fiktif sepenuhnya.
- Password demo (`demo1234`) ditampilkan secara terbuka di halaman masuk karena merupakan kredensial simulasi tanpa backend; ini bukan praktik keamanan produksi.

---

## BR-08: Unit Usaha Koperasi (Jika Modul Business Units Aktif)

### BR-08.1 — Cakupan Unit Usaha `CONFIGURABLE`
- Koperasi dapat menyelenggarakan satu atau lebih unit usaha riil (seperti waserda/toko retail, unit logistik, pengolahan hasil panen, dsb.).
- Masing-masing unit usaha mencatat omzet bruto dan biaya operasional unit.
- Laba bersih unit usaha diintegrasikan ke dalam laporan keuangan konsolidasi koperasi.

### BR-08.2 — Integrasi Transaksi Belanja Anggota `PLATFORM RULE` + `CONFIGURABLE`
- Setiap transaksi belanja yang dilakukan anggota di unit usaha dicatat atas ID Anggota yang bersangkutan.
- Akumulasi nilai belanja anggota menjadi dasar perhitungan komponen Jasa Usaha / Jasa Transaksi pada pembagian SHU (jika modul SHU aktif).

---

## BR-09: Rapat Anggota & E-Voting (Jika Modul Meetings Aktif)

### BR-09.1 — Kehadiran & Kuorum Rapat Anggota Digital `PLATFORM RULE` + `CONFIGURABLE`
- **Pemisahan Kehadiran vs Hak Suara:** Kehadiran digital diverifikasi melalui login sesi terautentikasi dan presensi daring untuk memvalidasi pemenuhan syarat kuorum sah rapat. **Presensi kehadiran semata TIDAK otomatis dianggap sebagai suara yang masuk dalam pemungutan suara (e-voting).** Anggota yang hadir berhak untuk memberikan suara, memilih abstain, atau tidak menggunakan hak suaranya pada butir agenda tertentu.
- **Validasi Kuorum:** Kuorum dinyatakan sah jika jumlah kehadiran anggota aktif yang terverifikasi mencapai persentase minimum sesuai ketentuan AD/ART koperasi: `CONFIGURABLE` — `UNRESOLVED` (Nilai demonstrasi: 50% + 1 anggota dari total anggota aktif terdaftar `ILLUSTRATIVE`).
- **Akses Dokumen RAT:** Anggota yang telah presensi dapat membaca materi laporan (LPJ Pengurus, Laporan Pengawas, dan RAPBK) dalam repositori digital.

### BR-09.2 — Mekanisme E-Voting & Batasan Simulasi `PLATFORM RULE`
- **Prinsip Suara:** Setiap anggota aktif yang terdaftar dan hadir berhak atas satu suara per butir keputusan/agenda (`1 Member = 1 Vote`).
- **Pilihan Suara Granular:** Pada setiap butir resolusi atau pemilihan formatur, pemilih disajikan pilihan eksplisit: "Setuju", "Tidak Setuju", atau "Abstain". Jumlah kehadiran rapat **tidak boleh disamakan** dengan jumlah suara yang masuk.
- **Pencegahan Suara Ganda (Anti-Double Voting):** Sistem mencatat status token/pemberian suara per butir agenda. Anggota yang telah memberikan suara divalidasi dan dicegah secara mutlak untuk memilih kembali pada butir yang sama (`anti-double voting per resolusi`).
- **Karakter Simulasi Frontend (Frontend Mock Simulation):** Seluruh fungsionalitas e-voting ini murni merupakan **simulasi antarmuka (frontend mock simulation)** berbasis state lokal, **BUKAN sistem pemungutan suara kriptografis produksi bersertifikasi hukum pemilu**. Penanda visual simulasi ("SIMULASI E-VOTING DEMO — BUKAN SISTEM PEMILU RESMI") wajib tertera pada tampilan bilik suara digital.
- **Rekapitulasi Suara:** Hasil penghitungan kuantitatif diagregasi dan ditampilkan secara real-time/transparan kepada seluruh peserta rapat setelah sesi voting agenda ditutup.
