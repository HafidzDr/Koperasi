/**
 * Konfigurasi Simpanan Keanggotaan (Demonstrasi / Ilustrasi)
 *
 * Sesuai temuan audit Phase 3.2:
 * Besaran simpanan pokok dan simpanan wajib belum merupakan keputusan legal/final koperasi.
 * File konfigurasi ini memisahkan parameter simulasi dari business logic inti.
 */

export interface SavingsConfig {
  simpananPokokNominal: number;
  simpananWajibBulanan: number;
  label: string;
  badgeLabel: string;
  disclaimer: string;
}

export const DEFAULT_SAVINGS_CONFIG: SavingsConfig = {
  simpananPokokNominal: 100000,
  simpananWajibBulanan: 50000,
  label: "Nominal Ilustrasi — Dapat Diubah",
  badgeLabel: "Nominal Ilustrasi",
  disclaimer:
    "Nominal simpanan pokok dan wajib di bawah ini merupakan nilai ilustrasi demonstrasi sistem dan bukan ketentuan final/resmi AD/ART koperasi. Besaran resmi akan diputuskan dalam Rapat Anggota.",
};

