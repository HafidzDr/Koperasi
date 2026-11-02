# User Flows — Platform Digital Koperasi Indonesia
**Version:** 0.2 (Phase 0 Refined)
**Status:** PROPOSED — Under Review
**Date:** 2026-11-02

---

## 1. Konvensi Notasi Alur

| Simbol | Arti |
|--------|------|
| `→` | Langkah berikutnya dalam jalur normal (success path) |
| `⚠` | Validasi gagal / kondisi kesalahan (error state) |
| `✓` | Kondisi sukses / penyelesaian (success state) |
| `[Modal]` | Dialog modal interaktif |
| `[Toast]` | Notifikasi melayang sementara |
| `[Redirect]` | Pengalihan rute halaman |
| `[Loading]` | Status pemuatan data simulasi |
| `[Empty]` | Tampilan saat tidak ada data |

---

## 2. Kebijakan Perlindungan Data Demonstrasi (Demo Safety — Wajib Ditegakkan)

**PERINGATAN MENGIKAT:**
Seluruh formulir dalam prototype ini berjalan dalam mode demonstrasi. Kebijakan berikut berlaku mutlak:

### 2.1 Identifikasi Demonstrasi
- **Dilarang keras menggunakan format NIK 16-digit** dalam seed data, formulir, maupun input demonstrasi. Format NIK 16-digit (termasuk format sintetis berstruktur kode wilayah dan tanggal lahir) dilarang mutlak karena menyerupai identitas nasional asli.
- Gunakan format tunggal identifier demonstrasi:
  ```
  DEMO-ID-0001
  DEMO-ID-0042
  DEMO-ID-XXXX
  ```
- Seluruh formulir pendaftaran dan antarmuka profil menggunakan label field **"ID Demonstrasi"** — bukan "Nomor KTP / NIK".
- Tidak ada validasi format NIK nasional dalam platform demonstrasi.

### 2.2 Simulasi Unggah Dokumen & Keamanan Berkas
- Unggah berkas dalam prototype ini bersifat simulasi antarmuka semata (UI simulation only).
- Berkas yang dipilih pada perangkat pengguna **sama sekali tidak disimpan**:
  - Dilarang menyimpan berkas dalam bentuk base64, data biner, blob, maupun metadata dokumen pribadi.
  - Tidak ada persistensi berkas ke `localStorage`, `sessionStorage`, memori aplikasi, maupun backend.
- Komponen formulir menyediakan tombol "Gunakan Dokumen Contoh Demo" (rekomendasi) atau area drop mock yang otomatis mengganti berkas unggahan dengan dokumen sintetis atau kartu placeholder bertanda `SIMULATED DOCUMENT`.
- Pratinjau dokumen menggunakan gambar placeholder bergaya dokumen identitas ber-watermark `CONTOH DEMONSTRASI — BUKAN DOKUMEN SAH`.
- Batasan simulasi ini wajib dijelaskan secara transparan kepada pengguna demonstrasi di UI.

### 2.3 Data yang Wajib Ditolak oleh Sistem Demo
Formulir demonstrasi tidak boleh mengumpulkan, menyimpan, atau mentransmisikan:
- NIK asli maupun format 16-digit sintetis apapun yang menyerupai struktur NIK nasional.
- Foto atau scan KTP asli.
- Foto wajah asli untuk verifikasi identitas.
- Nomor rekening bank asli.
- Slip gaji atau dokumen keuangan pribadi asli.
- Password untuk layanan produksi manapun.
- Token autentikasi produksi.
- Informasi kesehatan, kepercayaan, atau data sensitif kategori khusus.

### 2.4 Transparansi Simulasi kepada Pengguna Demo
- Setiap layar yang menampilkan saldo, transaksi, atau data anggota menampilkan label kecil: `Nilai Simulasi`.
- Setiap bukti transaksi yang dihasilkan memuat teks diagonal: `SIMULASI — BUKAN DOKUMEN SAH`.
- Banner permanen di seluruh halaman menampilkan: `MODE DEMO — Data ini adalah simulasi`.
- Formulir pendaftaran menampilkan pesan pembuka: `Ini adalah demonstrasi. Jangan gunakan data pribadi asli Anda.`

---

## 3. Daftar Alur Pengguna

### UF-01: Pengunjung Membuka Website dan Memahami Layanan
**Aktor:** Visitor (Pengunjung Publik)
**Kondisi Awal:** Pengunjung membuka URL root (`/`) tanpa login.
**Hak Akses:** Publik terbuka.

```
1. Pengunjung membuka halaman /
   → [Loading] Menampilkan skeleton hero dan ringkasan layanan
   → Halaman selesai dimuat: Hero, Ikhtisar Layanan, Visi Koperasi, Berita Terkini
2. Pengunjung mengklik menu "Layanan" di navbar
   → Dropdown menampilkan opsi produk yang aktif (Simpanan, Pinjaman jika aktif, SHU jika aktif)
3. Pengunjung memilih "Layanan Simpanan" (/layanan/simpanan)
   → Menampilkan tabel perbandingan jenis simpanan (Pokok, Wajib, Sukarela, Berjangka jika aktif)
   → Setiap baris memuat: setoran awal, sifat penarikan, imbal hasil ilustratif
4. Pengunjung mengklik "Cara Menjadi Anggota" (/cara-bergabung)
   → Menampilkan 4 langkah sederhana bergabung + tombol CTA "Daftar Sekarang"
5. Pengunjung mengklik "Daftar Sekarang"
   → [Redirect] /daftar
✓ Pengunjung memahami penawaran koperasi dan melanjutkan ke pendaftaran
```

---

### UF-02: Pendaftaran Anggota Baru (Calon Anggota)
**Aktor:** Applicant (Calon Anggota Baru)
**Kondisi Awal:** Mengakses `/daftar`.
**Hak Akses:** Publik terbuka.

```
1. Calon anggota membuka /daftar
   → Menampilkan Wizard 4 langkah + banner perlindungan privasi demo
2. Langkah 1 — Data Pribadi Demonstrasi
   Field: Nama Lengkap (fiktif), ID Demonstrasi (format: DEMO-ID-0001), Tanggal Lahir, Jenis Kelamin, Alamat Contoh, No. HP Dummy, Email Simulasi
   → Pengguna mengklik "Lanjut"
   ⚠ Format ID tidak sesuai (tidak diawali DEMO-ID-) → inline error: "Gunakan format ID Demonstrasi yang valid: DEMO-ID-XXXX (contoh: DEMO-ID-0001)"
   ⚠ Email format salah → inline error: "Format email tidak valid"
   ⚠ Nama kosong → inline error: "Nama lengkap wajib diisi"
3. Langkah 2 — Dokumen Contoh (Simulasi Unggah)
   Field: Foto Identitas Contoh, Pas Foto Contoh
   → Komponen unggah menyediakan tombol: "Gunakan Dokumen Contoh Demo" (rekomendasi) atau drag-and-drop
   → Berkas yang diunggah otomatis digantikan oleh placeholder: SIMULATED DOCUMENT
   → Pengguna mengklik "Lanjut"
4. Langkah 3 — Rekening Awal & Komitmen Simpanan
   Field: Rekening Simpanan Pokok (nominal otomatis terisi dari konfigurasi), Rekening Bank Pengembalian (simulasi)
   → Menampilkan rincian kewajiban awal
   → Pengguna mengklik "Lanjut"
5. Langkah 4 — Review & Persetujuan
   → Menampilkan ringkasan seluruh data yang dimasukkan
   → Checkbox persetujuan Anggaran Dasar / Ketentuan Koperasi (wajib centang)
   → Pengguna mengklik "Kirim Pendaftaran"
   → [Loading] 1000ms delay simulasi
   → [Success] Data tersimpan di mock store (localStorage)
   → [Toast] "Pendaftaran berhasil dikirim. Kode pelacakan: KOP-2026-XXXX"
   → [Redirect] /cek-status?kode=KOP-2026-XXXX
✓ Calon anggota menerima kode registrasi sintetis dan dapat memantau status
```

---

### UF-03: Pelacakan Status Pendaftaran
**Aktor:** Applicant
**Kondisi Awal:** Mengakses `/cek-status`.
**Hak Akses:** Publik dengan kode pendaftaran.

```
1. Pemohon membuka /cek-status
   Field: Masukkan Kode Pendaftaran
2. Memasukkan kode registrasi (misal: KOP-2026-0042)
3. Mengklik "Cek Status"
   → [Loading] 600ms
   ⚠ Kode tidak ditemukan → [Empty] "Kode pendaftaran tidak ditemukan. Periksa kembali kode Anda."
   ✓ Kode ditemukan → Menampilkan kartu status:
     - Tahap: Menunggu Verifikasi / Disetujui / Menunggu Kelengkapan / Ditolak
     - Tanggal pengajuan
     - Catatan verifikator (jika ada)
     - Jika Disetujui: Nomor Anggota terbit + tombol "Masuk ke Portal"
```

---

### UF-04: Verifikasi dan Rekomendasi Pendaftaran oleh Staf
**Aktor:** Staff Operasional (Pemeriksa & Verifikator)
**Kondisi Awal:** Calon anggota telah mengajukan pendaftaran; berkas berstatus "Menunggu Verifikasi".
**Hak Akses:** Staff (Sesuai matriks otorisasi IA Seksi 5.4: hak `Ver` dan `Rec`; Staf dan Administrator tidak memiliki kewenangan persetujuan final organisasi).

```
1. Staf membuka /admin/anggota/pendaftaran
   → [Loading] Menampilkan antrean pendaftaran calon anggota
   → Tab filter: Semua, Menunggu Verifikasi, Menunggu Kelengkapan, Menunggu Persetujuan, Selesai
   [Empty State] Jika tidak ada permohonan: "Tidak ada permohonan pendaftaran baru saat ini."
2. Mengklik baris permohonan → Membuka rincian data calon anggota
3. Memeriksa kelengkapan format identitas (DEMO-ID-0001) dan pratinjau dokumen contoh (SIMULATED DOCUMENT)
4. Memilih tindakan administratif:
   a. "Rekomendasikan Persetujuan" (Dokumen Lengkap & Format Valid)
      → [Modal] Catatan Verifikasi Staf
      → Mengisi catatan kelayakan administratif
      → Mengklik "Kirim Rekomendasi ke Pengurus"
      → [Loading] 600ms
      → Status permohonan berubah menjadi "Menunggu Persetujuan Pengurus"
      → [Toast] "Pendaftaran diverifikasi. Berkas diteruskan ke Pengurus untuk persetujuan final."
   b. "Minta Kelengkapan" (Dokumen Belum Memenuhi Ketentuan)
      → [Modal] Catatan Kekurangan Berkas
      → Mengisi catatan perbaikan untuk calon anggota
      → Mengklik "Kirim Permintaan Kelengkapan"
      → Status permohonan berubah menjadi "Menunggu Kelengkapan"
      → [Toast] "Status diperbarui. Pemohon diminta melengkapi berkas."
   c. "Tolak Administratif" (Data Fiktif Tidak Sesuai Ketentuan Demo)
      → [Modal] Alasan Penolakan Administratif
      → Mengklik "Tolak Permohonan"
      → Status permohonan berubah menjadi "Ditolak"
      → [Toast] "Permohonan ditolak pada tahap verifikasi administratif."
✓ Tahap verifikasi dan rekomendasi selesai; berkas siap ditindaklanjuti oleh otoritas organisasi
```

---

### UF-04B: Persetujuan Final Keanggotaan dan Penerbitan Nomor Anggota
**Aktor:** Manager / Pengurus (Governance & Oversight)
**Kondisi Awal:** Berkas pendaftaran telah berstatus "Menunggu Persetujuan Pengurus" pasca verifikasi staf.
**Hak Akses:** Manager / Board (Sesuai matriks otorisasi IA Seksi 5.4; Administrator sistem dan Staf dilarang menyetujui keanggotaan organisasi).
**Catatan Status Tata Kelola:** Penetapan definitif pemegang otoritas persetujuan keanggotaan (apakah Ketua Pengurus tunggal, Rapat Pleno Pengurus, atau delegasi khusus): `UNRESOLVED`. Dalam simulasi demonstrasi, alur dijalankan oleh peran Manager/Pengurus.

```
1. Pengurus membuka /admin/anggota/pendaftaran (Tab: "Menunggu Persetujuan")
   → Menampilkan daftar calon anggota yang telah diverifikasi dan direkomendasikan oleh staf
2. Mengklik baris permohonan untuk meninjau profil dan catatan rekomendasi staf
3. Memilih keputusan organisasi:
   a. "Setujui Keanggotaan"
      → [Modal] Konfirmasi Persetujuan Final Organisasi
      → Sistem secara otomatis menerbitkan Nomor Anggota unik (format: ANG-2026-XXXX)
      → Jika modul Savings Management aktif: rekening simpanan pokok dan wajib disiapkan otomatis
      → Mengklik "Konfirmasi & Terbitkan Anggota"
      → [Loading] 800ms
      → Status permohonan berubah menjadi "Disetujui — Anggota Aktif"
      → [Toast] "Keanggotaan disetujui. Nomor Anggota ANG-2026-XXXX berhasil diterbitkan."
   b. "Tolak"
      → [Modal] Alasan Penolakan Organisasi
      → Mengisi alasan penolakan
      → Status permohonan berubah menjadi "Ditolak"
      → [Toast] "Permohonan keanggotaan ditolak oleh Pengurus."
✓ Persetujuan organisasi final selesai; akun anggota baru aktif dan dapat dilacak di /cek-status
```

---

### UF-05: Anggota Masuk ke Portal
**Aktor:** Member
**Kondisi Awal:** Mengakses `/masuk`.
**Hak Akses:** Anggota terdaftar.

```
1. Anggota membuka /masuk
2. Memilih tab "Portal Anggota"
3. Memasukkan Nomor Anggota atau Email dan Kata Sandi
   (Dalam mode demo: kredensial contoh ditampilkan secara transparan untuk pengujian)
4. Mengklik "Masuk"
   → [Loading] 600ms
   ⚠ Nomor anggota tidak ditemukan → inline error: "Nomor anggota atau kata sandi salah"
   ⚠ Akun berstatus Dibekukan → error banner: "Akun Anda sedang dibekukan. Silakan hubungi pengurus koperasi."
   ✓ Kredensial cocok → Sesi login simulasi disimpan di sessionStorage
   → [Redirect] /portal/dashboard
✓ Anggota diarahkan ke dashboard personalnya
```

---

### UF-06: Anggota Melihat Ringkasan Keuangan
**Aktor:** Member
**Kondisi Awal:** Sudah masuk ke Member Portal.
**Hak Akses:** Member (hanya data miliknya sendiri).

```
1. Anggota membuka /portal/dashboard
   → [Loading] Skeleton kartu saldo dan riwayat aktivitas
   → Halaman selesai dimuat:
     - Kartu 1: Total Saldo Simpanan (akumulasi Pokok + Wajib + Sukarela)
     - Kartu 2: Tagihan Pinjaman Berjalan (jika modul Loan aktif; disembunyikan jika tidak aktif)
     - Kartu 3: Estimasi SHU Periode Berjalan (jika modul SHU aktif; disembunyikan jika tidak aktif)
     - Kartu 4: Notifikasi Penting / Status Keanggotaan
     - Bagian Bawah: 5 transaksi mutasi terakhir + tombol "Lihat Semua Transaksi"
2. Anggota dapat menyembunyikan/menampilkan angka saldo (toggle sensor mata)
✓ Anggota mendapat gambaran lengkap kondisi keuangannya secara aman
```

---

### UF-07: Anggota Melihat dan Mengajukan Setoran Simpanan
**Aktor:** Member
**Kondisi Awal:** Masuk ke Portal.
**Hak Akses:** Member.

```
1. Anggota membuka /portal/simpanan
   → Menampilkan daftar seluruh rekening simpanan miliknya
2. Mengklik salah satu rekening (misal: Simpanan Sukarela) → /portal/simpanan/:id
   → Menampilkan detail saldo, bunga (jika ada), dan tabel riwayat mutasi
3. Mengklik tombol "Setor Simpanan"
   → [Modal] Formulir Pengajuan Setoran
     - Pilih Rekening Tujuan (dropdown)
     - Nominal Setoran (Rp)
     - Metode: Transfer Manual atau Bayar Instan
   → Mengisi nominal (misal: Rp 500.000)
   ⚠ Nominal kurang dari batas minimum → inline error: "Setoran minimum Rp 10.000"
   → Mengklik "Lanjutkan ke Pembayaran"
   → [Redirect] /portal/pembayaran dengan data setoran terisi otomatis
✓ Anggota siap melakukan pembayaran simulasi
```

---

### UF-08: Anggota Mengajukan Pinjaman (Jika Modul Loan Aktif)
**Aktor:** Member
**Kondisi Awal:** Masuk ke Portal, modul `Loan Management` aktif dalam konfigurasi.
**Hak Akses:** Member aktif (tidak dalam status dibekukan atau menunggak).

```
1. Anggota membuka /portal/pinjaman
   [Kondisi Modul Non-Aktif: Halaman tidak dapat diakses; redirect ke dashboard]
   → Menampilkan daftar pinjaman aktif dan riwayat pinjaman
2. Mengklik tombol "Ajukan Pinjaman Baru" → /portal/pinjaman/ajukan
3. Langkah 1 — Produk dan Nominal
   - Pilih Jenis Pinjaman (Konsumtif / Produktif / Darurat)
   - Masukkan Jumlah yang Diajukan (Rp)
   - Pilih Tenor (bulan)
   → Kalkulator menampilkan estimasi angsuran pokok, bunga, total per bulan, biaya administrasi
   ⚠ Jumlah melebihi plafon kelayakan anggota → peringatan: "Pengajuan melebihi plafon kelayakan Anda (Rp XX.XXX.XXX). Harap sesuaikan nominal."
4. Langkah 2 — Tujuan Pinjaman
   - Keperluan pinjaman (kategori + deskripsi singkat)
   - Rencana sumber pembayaran angsuran
5. Langkah 3 — Dokumen Pendukung (Simulasi)
   - Unggah slip gaji / bukti penghasilan contoh (simulated document)
6. Langkah 4 — Review dan Konfirmasi
   - Ringkasan pinjaman lengkap
   - Checkbox persetujuan konsekuensi angsuran
   - Klik "Kirim Pengajuan"
   → [Loading] 1000ms
   → Record pinjaman baru dibuat dengan status: "Menunggu Verifikasi Staf"
   → [Toast] "Pengajuan pinjaman berhasil dikirim. No. Pengajuan: PJ-2026-XXXX"
   → [Redirect] /portal/pinjaman/PJ-2026-XXXX
✓ Pengajuan masuk ke antrean staf admin
```

---

### UF-09: Verifikasi dan Analisa Pinjaman oleh Staf
**Aktor:** Staff (Level 1)
**Kondisi Awal:** Login ke Admin Portal; modul Loan aktif.
**Hak Akses:** Staff.

```
1. Staf membuka /admin/pinjaman/pengajuan
   → Tabel pengajuan masuk dengan status "Menunggu Verifikasi"
2. Mengklik baris pengajuan → Membuka detail pengajuan pinjaman
3. Memeriksa kelengkapan dokumen pendukung contoh dan profil keuangan anggota
4. Mengisi catatan verifikasi staf
5. Memilih tindakan:
   a. "Teruskan ke Analisa Keuangan"
      → Status berubah menjadi "Menunggu Analisa FO"
      → [Toast] "Pengajuan diverifikasi dan diteruskan ke Finance Officer"
   b. "Minta Dokumen Tambahan" → [Modal] Catatan dokumen → Status "Menunggu Kelengkapan"
   c. "Tolak" → [Modal] Alasan penolakan → Status "Ditolak"
✓ Pengajuan berpindah ke tahap otorisasi keuangan
```

---

### UF-10: Persetujuan Otoritas Keuangan dan Pengurus (Workflow Bertingkat)
**Aktor:** Finance Officer (Level 2), Board / Manager (Level 3 jika nominal melampaui limit)
**Kondisi Awal:** Pengajuan telah diverifikasi Staf.
**Hak Akses:** Finance Officer / Manager sesuai matriks limit kewenangan.

```
1. Finance Officer membuka /admin/pinjaman/persetujuan
2. Membuka detail pengajuan pinjaman yang menunggu analisa
3. Memeriksa kapasitas angsuran pemohon, rasio simpanan, dan rekam jejak kolektibilitas
4. Menentukan persetujuan:
   - Jika nominal di bawah limit FO:
     → FO mengklik "Setujui Pinjaman"
     → Status berubah: "Disetujui — Siap Dicairkan"
   - Jika nominal melebihi limit FO (membutuhkan persetujuan Pengurus):
     → FO mengklik "Rekomendasikan ke Pengurus"
     → Status berubah: "Menunggu Persetujuan Pengurus"
     → [Notifikasi] Pengurus menerima tugas baru
5. (Jika ke Pengurus) Pengurus membuka /admin/pinjaman/persetujuan
   → Memeriksa rekomendasi FO dan catatan verifikasi
   → Mengklik "Setujui" atau "Tolak" dengan catatan
   → Status berubah: "Disetujui — Siap Dicairkan" atau "Ditolak"
✓ Pinjaman telah memperoleh persetujuan berwenang dan siap dicairkan
```

---

### UF-11: Pencairan Pinjaman oleh Finance Officer
**Aktor:** Finance Officer
**Kondisi Awal:** Pinjaman berstatus "Disetujui — Siap Dicairkan".
**Hak Akses:** Finance Officer (Sesuai matriks otorisasi IA Seksi 5.4; Administrator dan Staf tidak memiliki izin pencairan).

```
1. Finance Officer membuka /admin/pinjaman/pencairan
   → Tabel pinjaman siap cair
2. Mengklik "Proses Pencairan" pada baris pinjaman
   → [Modal] Konfirmasi Pencairan
     - Rincian pokok: Rp XX.XXX.XXX
     - Potongan biaya administrasi simulasi: Rp X.XXX
     - Total dana yang dicairkan: Rp XX.XXX.XXX
     - Rekening tujuan pencairan (simulasi)
     - Tanggal pencairan (hari ini)
3. Mengklik "Konfirmasi Pencairan Selesai"
   → [Loading] 800ms
   → Status pinjaman berubah menjadi "Aktif"
   → Jadwal angsuran lengkap otomatis di-generate
   → Transaksi pencairan tercatat di Buku Kas Harian simulasi
   → [Toast] "Pinjaman berhasil dicairkan. Jadwal angsuran telah aktif."
✓ Pinjaman aktif; anggota dapat melihat jadwal angsuran di Portal
```

---

### UF-12: Pembayaran Angsuran / Setoran — Transfer Manual (Anggota)
**Aktor:** Member
**Kondisi Awal:** Anggota berada di Pusat Pembayaran.
**Hak Akses:** Member.

```
1. Anggota membuka /portal/pembayaran/manual
2. Memilih pos pembayaran: Angsuran Pinjaman atau Setor Simpanan
3. Jika Angsuran: memilih nomor angsuran dari daftar tagihan aktif
4. Sistem menampilkan rekening tujuan transfer koperasi (data ilustratif)
5. Anggota mengisi: Tanggal Transfer, Bank Pengirim (simulasi), Jumlah Transfer
6. Mengunggah simulasi bukti transfer (berkas contoh berlabel SIMULATED DOCUMENT)
7. Mengklik "Kirim Bukti Pembayaran"
   → [Loading] 800ms
   → Record pembayaran dibuat dengan status: "Menunggu Konfirmasi"
   → [Toast] "Bukti pembayaran berhasil dikirim. Menunggu verifikasi petugas (simulasi 1x24 jam)."
✓ Pembayaran masuk ke antrean rekonsiliasi petugas
```

---

### UF-13: Rekonsiliasi Pembayaran oleh Petugas Keuangan
**Aktor:** Finance Officer
**Kondisi Awal:** Terdapat pembayaran manual berstatus Menunggu Konfirmasi.
**Hak Akses:** Finance Officer (Sesuai matriks otorisasi IA Seksi 5.4; Staf Operasional tidak memiliki izin rekonsiliasi kas).

```
1. Petugas membuka /admin/keuangan/rekonsiliasi
   → Menampilkan daftar konfirmasi pembayaran yang masuk
2. Mengklik baris pembayaran untuk memeriksa bukti transfer simulasi
3. Membandingkan nominal klaim anggota dengan mutasi kas koperasi
4. Memilih tindakan:
   a. "Konfirmasi Valid"
      → [Modal] Konfirmasi
      → Mengklik "Proses Pembukuan"
      → Angsuran yang terkait diubah statusnya menjadi "Lunas"
      → Jika ada denda, dialokasikan sesuai urutan prioritas alokasi pembayaran
      → Saldo rekening atau sisa pokok pinjaman diperbarui
      → [Toast] "Pembayaran dikonfirmasi. Saldo dan jadwal angsuran telah diperbarui."
   b. "Tolak"
      → [Modal] Alasan Penolakan (misal: bukti tidak terbaca, nominal tidak sesuai)
      → Status pembayaran berubah menjadi "Ditolak"
      → Anggota menerima notifikasi penolakan dengan catatan
✓ Transaksi terbukukan secara konsisten di seluruh modul
```

---

### UF-14: Pembayaran Instan — Simulasi Gateway (Anggota)
**Aktor:** Member
**Kondisi Awal:** Anggota berada di /portal/pembayaran/instan.
**Hak Akses:** Member.

```
1. Anggota membuka /portal/pembayaran/instan
   → Banner DEMO MODE tampil jelas di atas layar
2. Memilih tagihan yang akan dibayar (angsuran atau simpanan)
3. Memilih kanal simulasi:
   a. Opsi 1: Virtual Account (simulasi bank)
      → Menampilkan nomor VA sintetis (format: XXXX70017XXXXXXX)
      → Menampilkan instruksi pembayaran simulasi
      → Timer countdown 15 menit berjalan
   b. Opsi 2: QRIS Mockup
      → Menampilkan gambar placeholder QRIS bertuliskan "SIMULASI QRIS — BUKAN KODE NYATA"
      → Timer countdown berjalan
4. Anggota mengklik tombol demo: "Simulasikan Pembayaran Berhasil"
   → [Loading] 1200ms (mensimulasikan proses webhook penerimaan pembayaran)
   → Status berubah menjadi "Berhasil"
   → Saldo simpanan atau status angsuran pinjaman langsung terbarui
   → [Toast] "Simulasi pembayaran berhasil! Bukti transaksi simulasi diterbitkan."
✓ Transaksi lunas secara instan tanpa gateway nyata
```

---

### UF-15: Pengurus Melihat Laporan Keuangan Demonstrasi
**Aktor:** Treasurer / Manager / Pengurus
**Kondisi Awal:** Login ke Admin Portal.
**Hak Akses:** Treasurer / Manager / Admin.

```
1. Pengurus membuka /admin/laporan
   → Menampilkan tab laporan: Neraca, Laba Rugi, Arus Kas, NPL (jika modul aktif), SHU (jika modul aktif)
2. Memilih periode laporan (bulan, kuartal, atau tahun buku)
3. Mengklik "Tampilkan Laporan"
   → [Loading] 600ms
   → Laporan keuangan teragregasi ditampilkan:
     - Neraca: Total Aset = Total Kewajiban + Ekuitas (seimbang)
     - Seluruh angka dalam format Rupiah baku dengan pembanding periode sebelumnya
4. Pengguna mengklik tombol "Cetak Laporan"
   → Memicu browser print dialog dengan layout CSS khusus media print (bebas sidebar dan tombol navigasi)
✓ Pengurus dapat memantau dan mencetak laporan keuangan demonstrasi
```

---

### UF-16: Auditor Memeriksa Riwayat Aktivitas (Audit Trail)
**Aktor:** Supervisor / Auditor
**Kondisi Awal:** Login sebagai Auditor di Admin Portal.
**Hak Akses:** Auditor / Super Admin (Read-Only).

```
1. Auditor membuka /admin/audit
   → Menampilkan log audit seluruh aktivitas operasional platform
2. Auditor dapat memfilter log berdasarkan:
   - Rentang tanggal
   - Peran / Identitas Pengguna
   - Jenis Aksi (Persetujuan, Pencairan, Perubahan Anggota, Rekonsiliasi)
   - Jenis Entitas (Pinjaman, Simpanan, Anggota)
3. Mengklik salah satu baris log → Menampilkan detail perubahan: nilai sebelum vs. nilai sesudah
4. Tidak ada tombol ubah, edit, atau hapus (akses murni read-only)
✓ Pemeriksaan jejak tata kelola operasional selesai tanpa risiko manipulasi data
```

---

### UF-17: Penggantian Peran Demonstrasi (Demo Role Switcher)
**Aktor:** Observer / Presenter Demo
**Kondisi Awal:** Mengakses halaman manapun dalam mode demo.
**Hak Akses:** Terbuka dalam lingkungan demonstrasi.

```
1. Presenter mengklik panel mengambang "Role Switcher" di pojok layar
2. Panel menampilkan pengelompokan konteks yang jelas:
   A. Public Preview Context (Non-Auth):
      - Visitor (Public Website: /)
      - Applicant (Pelacakan Pendaftaran: /cek-status)
   B. Authenticated Demo Accounts (8 Akun Terkonfigurasi):
      1. Member — Budi Santoso (/portal/dashboard)
      2. Staff — Dewi Lestari (/admin/anggota/pendaftaran)
      3. Finance Officer — Ahmad Fauzi (/admin/pinjaman/persetujuan)
      4. Administrator — Rina Wijaya (/admin/dashboard)
      5. Manager / Pengurus — Hendra Kurniawan (/admin/dashboard)
      6. Treasurer — Sri Mulyani (/admin/keuangan/kas)
      7. Supervisor / Auditor — Bambang Irawan (/admin/audit — Read-Only)
      8. Super Admin — Admin Demo (/admin/pengaturan)
3. Presenter memilih peran target (misal: "Finance Officer")
   → Sesi peran di Zustand store terbarui seketika (tanpa reload halaman penuh)
   → Navigasi, akses menu, dan kewenangan tombol menyesuaikan peran baru secara ketat
   → Banner peran di top bar berubah menandai peran yang sedang aktif
✓ Presentasi alur multi-peran berjalan mulus dalam satu sesi demonstrasi
```

---

### UF-18: Reset Data Demonstrasi (Demo Reset)
**Aktor:** Operator Demo / Pengembang
**Kondisi Awal:** Pengguna berada di Admin Portal → Pengaturan, atau melalui menu kontrol demo.
**Hak Akses:** Administrator / Super Admin / Pengembang.

```
1. Operator membuka halaman Pengaturan Platform atau panel kontrol demo
2. Mengklik tombol "Reset Data Demonstrasi"
3. [Modal] Dialog Peringatan:
   "Seluruh perubahan, pendaftaran baru, dan transaksi simulasi yang telah dilakukan akan dihapus. Data akan dikembalikan ke kondisi seed awal."
4. Operator mengklik "Ya, Reset Sekarang"
   → localStorage dibersihkan untuk namespace demo
   → Seluruh Zustand store di-reseed dari dataset awal
   → [Toast] "Data demonstrasi berhasil di-reset ke kondisi awal."
   → [Redirect] / (Beranda Public Website)
✓ Platform kembali ke kondisi awal yang bersih dan konsisten
```

---

### UF-19: Presensi Rapat Anggota & Simulasi E-Voting (Jika Modul Meetings Aktif)
**Aktor:** Member (Anggota Aktif Terdaftar)  
**Kondisi Awal:** Modul `meetings` aktif; Rapat Anggota Tahunan (RAT) sedang berlangsung; agenda pemungutan suara dibuka.  
**Hak Akses:** Member terautentikasi dengan status keanggotaan aktif.  

```
1. Anggota membuka menu "Rapat Anggota" (/portal/rapat)
2. Membaca agenda rapat, jadwal sesi, dan status kuorum digital berjalan
3. Melakukan presensi kehadiran digital:
   - Mengklik tombol "Konfirmasi Kehadiran Saya"
   - [Loading] 400ms
   - Sistem mencatat presensi anggota ke dalam penghitung kuorum sah rapat
   - [Penting] Presensi kehadiran ini HANYA memvalidasi ketercapaian kuorum, TIDAK otomatis dihitung sebagai suara masuk dalam e-voting
4. Anggota membuka dokumen materi pertanggungjawaban (LPJ Pengurus / Laporan Pengawas)
5. Anggota masuk ke agenda pemungutan suara (Bilik Suara Simulasi):
   - Sistem menampilkan banner wajib: "SIMULASI E-VOTING — BUKAN SISTEM PEMILU RESMI"
   - Menampilkan butir keputusan (misal: "Persetujuan LPJ Tahun Buku 2024")
6. Anggota menggunakan hak suaranya sesuai prinsip 1 Member = 1 Vote:
   - Memilih salah satu opsi eksplisit: [Setuju] / [Tidak Setuju] / [Abstain]
   - Mengklik tombol "Kirim Suara"
   - [Modal Konfirmasi] "Pastikan pilihan Anda sudah benar. Pilihan tidak dapat diubah setelah dikirim."
   - Mengklik "Konfirmasi Kirim Suara"
7. Sistem memproses pemberian suara secara simulasi:
   - [Loading] 500ms
   - Sistem mencatat bahwa ID Anggota telah memberikan suara pada resolusi ini (Anti-Double Voting aktif)
   - Tombol pilihan dikunci; status berubah menjadi "Suara Anda Telah Tercatat"
   - [Toast] "Suara Anda berhasil tercatat untuk agenda ini."
8. Anggota melihat ringkasan agregat suara simulasi yang transparan setelah pemungutan suara ditutup
✓ Alur presensi kuorum dan hak suara terpisah secara tegas; simulasi e-voting berjalan aman dan transparan
```
