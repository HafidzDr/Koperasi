# Alur Kerja Eksekusi Fase
**Proyek:** Platform Digital Koperasi Indonesia
**Version:** 0.2 (Phase 0 Refined)

---

## 1. Siklus Hidup Setiap Fase

Setiap fase (Phase 1 hingga Phase 8) mengikuti siklus hidup yang ketat berikut ini:

```
[Permintaan Fase dari Pengguna]
        ↓
1. Pra-Fase: Verifikasi Quality Gate fase sebelumnya telah lulus & mendapat persetujuan eksplisit
        ↓
2. Konfirmasi Cakupan: Baca IMPLEMENTATION_ROADMAP.md untuk fase ini
        ↓
3. Eksekusi: Implementasikan hanya apa yang ditentukan oleh fase ini
        ↓
4. Verifikasi: Jalankan lint, build, typecheck, dan pemeriksaan responsif
        ↓
5. Evaluasi Quality Gate: Periksa setiap kriteria gate
        ↓
6. Pembaruan Dokumentasi: Perbarui status di IMPLEMENTATION_ROADMAP.md
        ↓
7. BERHENTI & Laporan: Sajikan laporan fase, tunggu review pengguna
```

---

## 2. Aturan Pelaksanaan Selama Fase Apapun

1. **Jangan lewatkan quality gate.** Jika kriteria gate gagal, perbaiki sebelum melaporkan fase sebagai selesai.
2. **Jangan mulai pekerjaan fase berikutnya.** Jika fase selesai lebih awal, laporkan dan BERHENTI. Jangan lanjut secara otomatis.
3. **Jangan tambah dependency yang tidak terdaftar di G-02.** Dokumentasikan permintaan dalam laporan fase dan tunggu persetujuan pengguna.
4. **Tegakkan aturan visual setiap saat.** Periksa setiap komponen baru terhadap `.agent/rules/visual.md`.
5. **Tegakkan aturan responsif.** Setiap halaman atau layout baru yang dibuat dalam suatu fase harus diverifikasi setidaknya di 320px, 768px, dan 1280px.
6. **Tidak ada backend creep.** Jika sebuah fitur tampak memerlukan server, baca `docs/DEMO_SIMULATION_SPEC.md` dan implementasikan sebagai simulation service.
7. **Dokumentasikan asumsi.** Setiap aturan bisnis yang belum terselesaikan yang digunakan dalam kode harus ditandai dengan komentar `// ponytail:` dan dicantumkan dalam laporan fase.
8. **Arsitektur modular selalu dipatuhi.** Tidak ada komponen yang mengasumsikan modul Pinjaman atau SHU selalu aktif. Gunakan `isModuleActive()` untuk semua pemeriksaan.
9. **Demo safety selalu dijaga.** Tidak ada penanda palsu yang menyiratkan transaksi nyata. Banner DEMO MODE wajib terlihat.

---

## 3. Checklist Pra-Penyelesaian Fase

Sebelum mendeklarasikan sebuah fase selesai, semua item berikut harus dipenuhi:

- [ ] Semua deliverable dalam roadmap untuk fase ini tersedia.
- [ ] `npm run build` berhasil tanpa error (Phase 2 ke atas).
- [ ] `npm run lint` lulus tanpa peringatan atau error (Phase 2 ke atas).
- [ ] `npx tsc --noEmit` lulus tanpa error (Phase 2 ke atas).
- [ ] Tidak ada gradien, tidak ada glassmorphism, tidak ada ikon selain Lucide ditemukan.
- [ ] Nol horizontal overflow pada semua halaman baru di lebar 320px.
- [ ] Setiap kriteria Quality Gate untuk fase ini ditandai [x].
- [ ] Laporan fase disusun: deliverable, hasil verifikasi, keputusan yang dibuat, asumsi yang digunakan.
- [ ] Pernyataan BERHENTI eksplisit termasuk dalam output.

---

## 4. Format Laporan Fase

Setiap laporan fase wajib menyertakan bagian berikut:

```
## Laporan Fase [N]: [Nama Fase]

### A. Deliverable yang Diselesaikan
[Daftar semua deliverable dengan status ✓ / ✗]

### B. Hasil Verifikasi
- npm run build: PASS / FAIL
- npm run lint: PASS / FAIL
- npx tsc --noEmit: PASS / FAIL
- Uji responsif 320px: PASS / FAIL
- Uji responsif 768px: PASS / FAIL
- Uji responsif 1280px: PASS / FAIL

### C. Quality Gates
[Tabel quality gates dengan status PASS/FAIL dan bukti]

### D. Keputusan yang Dibuat
[Pilihan implementasi yang berdampak pada fase selanjutnya]

### E. Asumsi Digunakan (Ponytail Comments)
[Daftar asumsi dengan komentar // ponytail: yang digunakan]

### F. Pertanyaan untuk Pengguna
[Hal-hal yang membutuhkan keputusan manusia sebelum melanjutkan]

---
**BERHENTI. Menunggu persetujuan pengguna untuk melanjutkan ke Fase [N+1].**
```

---

## 5. Protokol Rollback Fase

Jika fase gagal review atau pengguna menolak implementasi:
1. Kembalikan ke commit git terakhir (atau state awal untuk fase tersebut).
2. Baca umpan balik review pengguna secara menyeluruh.
3. Perbarui berkas dokumentasi yang relevan terlebih dahulu jika persyaratan berubah.
4. Eksekusi ulang fase mengikuti alur kerja ini dari Langkah 2.
5. Jangan memodifikasi fase lain selama rollback kecuali perubahan tersebut diperlukan secara langsung.

---

## 6. Referensi Dokumen yang Harus Dibaca Sebelum Implementasi

| Dokumen | Kapan Dibaca |
|---------|--------------|
| `docs/PRD.md` | Sebelum setiap fase — untuk memastikan cakupan implementasi |
| `docs/INFORMATION_ARCHITECTURE.md` | Sebelum mengerjakan rute dan navigasi |
| `docs/BUSINESS_RULES.md` | Sebelum mengimplementasikan logika keuangan atau validasi |
| `docs/DESIGN_SYSTEM.md` | Sebelum membuat komponen baru |
| `.agent/rules/visual.md` | Sebelum setiap perubahan CSS atau Tailwind class |
| `docs/RESPONSIVE_SPECIFICATION.md` | Sebelum mengerjakan layout dan breakpoint |
| `docs/DEMO_SIMULATION_SPEC.md` | Sebelum mengimplementasikan layanan atau data mock |
| `docs/USER_FLOWS.md` | Sebelum mengimplementasikan alur formulir atau workflow |
