/**
 * Seed Data Pinjaman Demonstrasi (30 Rekord Lengkap)
 * Koperasi Konsumen Makmur Bersama Nusantara (KMB)
 *
 * Mengacu pada DEMO_SIMULATION_SPEC.md Seksi 3.2:
 * - Format ID: PJ-2026-0001 hingga PJ-2026-0030
 * - Distribusi:
 *   - 12 Aktif (Lancar)
 *   - 5 Dalam Perhatian Khusus (DPK)
 *   - 2 Kurang Lancar
 *   - 1 Macet
 *   - 5 Lunas
 *   - 3 Menunggu Persetujuan (1 submitted, 1 under_review, 1 recommended)
 *   - 2 Ditolak
 * - Jenis: 15 Konsumtif, 10 Produktif, 5 Darurat
 * - Tenor: 3, 6, 12, 18, 24, 36 bulan
 * - Nominal: Rp 1.000.000 s.d. Rp 50.000.000
 */

import {
  LoanProductConfig,
  LoanSystemConfig,
  Loan,
  LoanApplication,
  InstallmentPaymentRecord,
} from "../types";
import {
  calculateFlatSchedule,
  determineCollectibility,
  calculateLateFee,
} from "../utils/loanCalculations";

export const DEFAULT_LOAN_SYSTEM_CONFIG: LoanSystemConfig = {
  gracePeriodDays: 3,
  lateFeeDailyPct: 0.5,
  approvalThresholdFoMax: 10_000_000,
  approvalThresholdManagerMax: 50_000_000,
  maxActiveLoansPerMember: 2,
  minMembershipMonths: 3,
  label: "Konfigurasi Kebijakan Pinjaman & Denda",
  disclaimer:
    "Parameter kebijakan pinjaman (grace period 3 hari, denda 0,5%/hari, threshold persetujuan FO s.d. Rp 10.000.000) merupakan simulasi demonstrasi frontend dan bukan ketentuan perbankan komersial atau hukum mengikat.",
};

export const defaultLoanProducts: LoanProductConfig[] = [
  {
    id: "PROD-LN-KONSUMTIF",
    type: "konsumtif",
    name: "Pinjaman Konsumtif Anggota",
    description:
      "Fasilitas pembiayaan kebutuhan konsumtif personal keluarga anggota seperti renovasi rumah, biaya pendidikan, atau perlengkapan rumah tangga.",
    interestRatePct: 12.0,
    calculationMethod: "flat",
    minAmount: 1_000_000,
    maxAmount: 50_000_000,
    minTenorMonths: 3,
    maxTenorMonths: 36,
    adminFeePct: 1.0,
    isCollateralRequired: false,
    status: "active",
    badgeLabel: "Kebutuhan Personal",
    notes: "Suku bunga 12% p.a. flat simulatif. Biaya administrasi 1% dipotong langsung saat pencairan.",
    disclaimer:
      "Seluruh suku bunga dan biaya administrasi adalah nilai ilustrasi demonstrasi sistem koperasi.",
  },
  {
    id: "PROD-LN-PRODUKTIF",
    type: "produktif",
    name: "Pinjaman Modal Usaha Produktif",
    description:
      "Pembiayaan modal kerja atau investasi barang produktif untuk usaha mikro, kecil, dan menengah (UMKM) milik anggota.",
    interestRatePct: 10.0,
    calculationMethod: "flat",
    minAmount: 5_000_000,
    maxAmount: 100_000_000,
    minTenorMonths: 6,
    maxTenorMonths: 36,
    adminFeePct: 1.0,
    isCollateralRequired: true,
    status: "active",
    badgeLabel: "Pengembangan Usaha",
    notes: "Memerlukan konfirmasi profil usaha atau agunan barang modal usaha mikro.",
    disclaimer: "Plafon di atas Rp 50.000.000 memerlukan persetujuan rapat pengurus (simulasi).",
  },
  {
    id: "PROD-LN-DARURAT",
    type: "darurat",
    name: "Pinjaman Siaga Darurat",
    description:
      "Dana talangan cepat untuk kebutuhan mendesak kesehatan, musibah keluarga, atau perbaikan darurat dengan proses verifikasi prioritas.",
    interestRatePct: 8.0,
    calculationMethod: "flat",
    minAmount: 500_000,
    maxAmount: 10_000_000,
    minTenorMonths: 1,
    maxTenorMonths: 12,
    adminFeePct: 0.5,
    isCollateralRequired: false,
    status: "active",
    badgeLabel: "Dana Cepat Siaga",
    notes: "Proses verifikasi kilat 1x24 jam simulasi dengan suku bunga bersahabat 8% p.a. flat.",
    disclaimer: "Maksimal plafon Rp 10.000.000 dan maksimal tenor 12 bulan.",
  },
];

interface SeedLoanBlueprint {
  id: string;
  memberDemoId: string;
  memberNumber: string;
  memberName: string;
  productType: "konsumtif" | "produktif" | "darurat";
  productName: string;
  principalAmount: number;
  tenorMonths: number;
  interestRatePct: number;
  adminFeeAmount: number;
  netDisbursedAmount: number;
  disbursementDate: string;
  category: "lancar" | "dpk" | "kurang_lancar" | "macet" | "lunas";
  paidInstallmentsCount: number;
  daysPastDue: number;
}

const seedBlueprints: SeedLoanBlueprint[] = [
  // 12 AKTIF - LANCAR (PJ-2026-0001 s.d. PJ-2026-0012)
  {
    id: "PJ-2026-0001",
    memberDemoId: "DEMO-ID-0001",
    memberNumber: "ANG-2026-0001",
    memberName: "Siti Rahma",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 10_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    adminFeeAmount: 100_000,
    netDisbursedAmount: 9_900_000,
    disbursementDate: "2026-01-15",
    category: "lancar",
    paidInstallmentsCount: 3,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0002",
    memberDemoId: "DEMO-ID-0002",
    memberNumber: "ANG-2026-0002",
    memberName: "Budi Santoso",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    principalAmount: 25_000_000,
    tenorMonths: 24,
    interestRatePct: 10.0,
    adminFeeAmount: 250_000,
    netDisbursedAmount: 24_750_000,
    disbursementDate: "2025-11-10",
    category: "lancar",
    paidInstallmentsCount: 5,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0003",
    memberDemoId: "DEMO-ID-0003",
    memberNumber: "ANG-2026-0003",
    memberName: "Joko Widodo",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 15_000_000,
    tenorMonths: 18,
    interestRatePct: 12.0,
    adminFeeAmount: 150_000,
    netDisbursedAmount: 14_850_000,
    disbursementDate: "2025-12-05",
    category: "lancar",
    paidInstallmentsCount: 4,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0004",
    memberDemoId: "DEMO-ID-0004",
    memberNumber: "ANG-2026-0004",
    memberName: "Maya Putri",
    productType: "darurat",
    productName: "Pinjaman Siaga Darurat",
    principalAmount: 5_000_000,
    tenorMonths: 6,
    interestRatePct: 8.0,
    adminFeeAmount: 25_000,
    netDisbursedAmount: 4_975_000,
    disbursementDate: "2026-02-01",
    category: "lancar",
    paidInstallmentsCount: 2,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0005",
    memberDemoId: "DEMO-ID-0005",
    memberNumber: "ANG-2026-0005",
    memberName: "Agus Setiawan",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    principalAmount: 30_000_000,
    tenorMonths: 24,
    interestRatePct: 10.0,
    adminFeeAmount: 300_000,
    netDisbursedAmount: 29_700_000,
    disbursementDate: "2025-10-20",
    category: "lancar",
    paidInstallmentsCount: 6,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0006",
    memberDemoId: "DEMO-ID-0006",
    memberNumber: "ANG-2026-0006",
    memberName: "Ratna Sari",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 8_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    adminFeeAmount: 80_000,
    netDisbursedAmount: 7_920_000,
    disbursementDate: "2026-01-20",
    category: "lancar",
    paidInstallmentsCount: 3,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0007",
    memberDemoId: "DEMO-ID-0007",
    memberNumber: "ANG-2026-0007",
    memberName: "Dian Pratama",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 12_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    adminFeeAmount: 120_000,
    netDisbursedAmount: 11_880_000,
    disbursementDate: "2026-02-15",
    category: "lancar",
    paidInstallmentsCount: 2,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0008",
    memberDemoId: "DEMO-ID-0008",
    memberNumber: "ANG-2026-0008",
    memberName: "Eko Prasetyo",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    principalAmount: 40_000_000,
    tenorMonths: 36,
    interestRatePct: 10.0,
    adminFeeAmount: 400_000,
    netDisbursedAmount: 39_600_000,
    disbursementDate: "2025-08-10",
    category: "lancar",
    paidInstallmentsCount: 8,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0009",
    memberDemoId: "DEMO-ID-0009",
    memberNumber: "ANG-2026-0009",
    memberName: "Fajar Nugraha",
    productType: "darurat",
    productName: "Pinjaman Siaga Darurat",
    principalAmount: 3_000_000,
    tenorMonths: 6,
    interestRatePct: 8.0,
    adminFeeAmount: 15_000,
    netDisbursedAmount: 2_985_000,
    disbursementDate: "2026-03-01",
    category: "lancar",
    paidInstallmentsCount: 1,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0010",
    memberDemoId: "DEMO-ID-0010",
    memberNumber: "ANG-2026-0010",
    memberName: "Gita Permata",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 6_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    adminFeeAmount: 60_000,
    netDisbursedAmount: 5_940_000,
    disbursementDate: "2026-01-10",
    category: "lancar",
    paidInstallmentsCount: 3,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0011",
    memberDemoId: "DEMO-ID-0011",
    memberNumber: "ANG-2026-0011",
    memberName: "Hadi Susanto",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    principalAmount: 20_000_000,
    tenorMonths: 18,
    interestRatePct: 10.0,
    adminFeeAmount: 200_000,
    netDisbursedAmount: 19_800_000,
    disbursementDate: "2025-11-25",
    category: "lancar",
    paidInstallmentsCount: 5,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0012",
    memberDemoId: "DEMO-ID-0012",
    memberNumber: "ANG-2026-0012",
    memberName: "Indah Wahyuni",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 10_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    adminFeeAmount: 100_000,
    netDisbursedAmount: 9_900_000,
    disbursementDate: "2026-02-10",
    category: "lancar",
    paidInstallmentsCount: 2,
    daysPastDue: 0,
  },

  // 5 DALAM PERHATIAN KHUSUS / DPK (PJ-2026-0013 s.d. PJ-2026-0017)
  {
    id: "PJ-2026-0013",
    memberDemoId: "DEMO-ID-0013",
    memberNumber: "ANG-2026-0013",
    memberName: "Kurniawan Putra",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 15_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    adminFeeAmount: 150_000,
    netDisbursedAmount: 14_850_000,
    disbursementDate: "2025-12-15",
    category: "dpk",
    paidInstallmentsCount: 2,
    daysPastDue: 24,
  },
  {
    id: "PJ-2026-0014",
    memberDemoId: "DEMO-ID-0014",
    memberNumber: "ANG-2026-0014",
    memberName: "Lukman Hakim",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    principalAmount: 35_000_000,
    tenorMonths: 24,
    interestRatePct: 10.0,
    adminFeeAmount: 350_000,
    netDisbursedAmount: 34_650_000,
    disbursementDate: "2025-09-01",
    category: "dpk",
    paidInstallmentsCount: 4,
    daysPastDue: 45,
  },
  {
    id: "PJ-2026-0015",
    memberDemoId: "DEMO-ID-0015",
    memberNumber: "ANG-2026-0015",
    memberName: "Mega Wulandari",
    productType: "darurat",
    productName: "Pinjaman Siaga Darurat",
    principalAmount: 4_000_000,
    tenorMonths: 6,
    interestRatePct: 8.0,
    adminFeeAmount: 20_000,
    netDisbursedAmount: 3_980_000,
    disbursementDate: "2026-01-05",
    category: "dpk",
    paidInstallmentsCount: 1,
    daysPastDue: 35,
  },
  {
    id: "PJ-2026-0016",
    memberDemoId: "DEMO-ID-0016",
    memberNumber: "ANG-2026-0016",
    memberName: "Nugroho Adi",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 9_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    adminFeeAmount: 90_000,
    netDisbursedAmount: 8_910_000,
    disbursementDate: "2025-11-20",
    category: "dpk",
    paidInstallmentsCount: 2,
    daysPastDue: 55,
  },
  {
    id: "PJ-2026-0017",
    memberDemoId: "DEMO-ID-0017",
    memberNumber: "ANG-2026-0017",
    memberName: "Oki Prasada",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    principalAmount: 20_000_000,
    tenorMonths: 18,
    interestRatePct: 10.0,
    adminFeeAmount: 200_000,
    netDisbursedAmount: 19_800_000,
    disbursementDate: "2025-10-15",
    category: "dpk",
    paidInstallmentsCount: 3,
    daysPastDue: 75,
  },

  // 2 KURANG LANCAR (PJ-2026-0018 s.d. PJ-2026-0019)
  {
    id: "PJ-2026-0018",
    memberDemoId: "DEMO-ID-0018",
    memberNumber: "ANG-2026-0018",
    memberName: "Putri Anggraini",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 12_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    adminFeeAmount: 120_000,
    netDisbursedAmount: 11_880_000,
    disbursementDate: "2025-09-10",
    category: "kurang_lancar",
    paidInstallmentsCount: 2,
    daysPastDue: 105,
  },
  {
    id: "PJ-2026-0019",
    memberDemoId: "DEMO-ID-0019",
    memberNumber: "ANG-2026-0019",
    memberName: "Qori Iskandar",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    principalAmount: 30_000_000,
    tenorMonths: 24,
    interestRatePct: 10.0,
    adminFeeAmount: 300_000,
    netDisbursedAmount: 29_700_000,
    disbursementDate: "2025-07-20",
    category: "kurang_lancar",
    paidInstallmentsCount: 3,
    daysPastDue: 115,
  },

  // 1 MACET (PJ-2026-0020)
  {
    id: "PJ-2026-0020",
    memberDemoId: "DEMO-ID-0020",
    memberNumber: "ANG-2026-0020",
    memberName: "Rian Hidayat",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 10_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    adminFeeAmount: 100_000,
    netDisbursedAmount: 9_900_000,
    disbursementDate: "2025-05-10",
    category: "macet",
    paidInstallmentsCount: 1,
    daysPastDue: 195,
  },

  // 5 LUNAS (PJ-2026-0021 s.d. PJ-2026-0025)
  {
    id: "PJ-2026-0021",
    memberDemoId: "DEMO-ID-0001", // Siti Rahma memiliki 1 riwayat lunas
    memberNumber: "ANG-2026-0001",
    memberName: "Siti Rahma",
    productType: "darurat",
    productName: "Pinjaman Siaga Darurat",
    principalAmount: 3_000_000,
    tenorMonths: 6,
    interestRatePct: 8.0,
    adminFeeAmount: 15_000,
    netDisbursedAmount: 2_985_000,
    disbursementDate: "2025-04-10",
    category: "lunas",
    paidInstallmentsCount: 6,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0022",
    memberDemoId: "DEMO-ID-0022",
    memberNumber: "ANG-2026-0022",
    memberName: "Taufik Rahman",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 10_000_000,
    tenorMonths: 6,
    interestRatePct: 12.0,
    adminFeeAmount: 100_000,
    netDisbursedAmount: 9_900_000,
    disbursementDate: "2025-06-15",
    category: "lunas",
    paidInstallmentsCount: 6,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0023",
    memberDemoId: "DEMO-ID-0023",
    memberNumber: "ANG-2026-0023",
    memberName: "Umar Faruq",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    principalAmount: 20_000_000,
    tenorMonths: 12,
    interestRatePct: 10.0,
    adminFeeAmount: 200_000,
    netDisbursedAmount: 19_800_000,
    disbursementDate: "2025-03-01",
    category: "lunas",
    paidInstallmentsCount: 12,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0024",
    memberDemoId: "DEMO-ID-0024",
    memberNumber: "ANG-2026-0024",
    memberName: "Vina Pandu",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    principalAmount: 5_000_000,
    tenorMonths: 6,
    interestRatePct: 12.0,
    adminFeeAmount: 50_000,
    netDisbursedAmount: 4_950_000,
    disbursementDate: "2025-07-10",
    category: "lunas",
    paidInstallmentsCount: 6,
    daysPastDue: 0,
  },
  {
    id: "PJ-2026-0025",
    memberDemoId: "DEMO-ID-0025",
    memberNumber: "ANG-2026-0025",
    memberName: "Wahyu Setiawan",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    principalAmount: 15_000_000,
    tenorMonths: 12,
    interestRatePct: 10.0,
    adminFeeAmount: 150_000,
    netDisbursedAmount: 14_850_000,
    disbursementDate: "2025-02-15",
    category: "lunas",
    paidInstallmentsCount: 12,
    daysPastDue: 0,
  },
];

/**
 * Membangun 25 entitas Loan aktif & historis berdasarkan blueprint di atas
 */
export function buildInitialLoans(): {
  loans: Loan[];
  paymentRecords: InstallmentPaymentRecord[];
} {
  const loans: Loan[] = [];
  const paymentRecords: InstallmentPaymentRecord[] = [];

  for (const bp of seedBlueprints) {
    const rawSchedule = calculateFlatSchedule(
      bp.principalAmount,
      bp.tenorMonths,
      bp.interestRatePct,
      bp.disbursementDate
    );

    let totalPaidPrincipal = 0;
    let totalPaidInterest = 0;
    let totalPaidLateFee = 0;

    const installments = rawSchedule.map((s, idx) => {
      const installmentNum = idx + 1;
      const isPaid = installmentNum <= bp.paidInstallmentsCount;
      const isOverdueTarget = !isPaid && bp.daysPastDue > 0 && installmentNum === bp.paidInstallmentsCount + 1;

      if (isPaid) {
        totalPaidPrincipal += s.principalAmount;
        totalPaidInterest += s.interestAmount;

        const payDate = s.dueDate;
        paymentRecords.push({
          id: `BYR-2026-${bp.id.slice(8)}-${String(installmentNum).padStart(2, "0")}`,
          loanId: bp.id,
          installmentNumber: installmentNum,
          memberDemoId: bp.memberDemoId,
          memberNumber: bp.memberNumber,
          memberName: bp.memberName,
          paymentDate: payDate,
          amountPaid: s.totalAmount,
          allocatedLateFee: 0,
          allocatedInterest: s.interestAmount,
          allocatedPrincipal: s.principalAmount,
          paymentMethod: "Transfer Bank (Simulasi)",
          referenceNumber: `REF-${bp.id}-${installmentNum}`,
          recordedById: "user-fo-01",
          recordedByRole: "finance_officer",
          recordedByName: "Ahmad Fauzi",
        });

        return {
          installmentNumber: installmentNum,
          dueDate: s.dueDate,
          principalAmount: s.principalAmount,
          interestAmount: s.interestAmount,
          totalAmount: s.totalAmount,
          remainingPrincipalAfter: s.remainingPrincipalAfter,
          paidPrincipal: s.principalAmount,
          paidInterest: s.interestAmount,
          paidLateFee: 0,
          lateFeeAmount: 0,
          daysLate: 0,
          status: "paid" as const,
          paidAt: `${payDate}T09:30:00Z`,
          paymentMethod: "Transfer Bank (Simulasi)",
          referenceNumber: `REF-${bp.id}-${installmentNum}`,
        };
      }

      // Belum lunas
      let daysLate = 0;
      let lateFee = 0;
      let instStatus: "upcoming" | "due" | "overdue" = "upcoming";

      if (isOverdueTarget) {
        daysLate = bp.daysPastDue;
        lateFee = calculateLateFee(
          s.totalAmount,
          daysLate,
          DEFAULT_LOAN_SYSTEM_CONFIG.gracePeriodDays,
          DEFAULT_LOAN_SYSTEM_CONFIG.lateFeeDailyPct
        );
        instStatus = "overdue";
      }

      return {
        installmentNumber: installmentNum,
        dueDate: s.dueDate,
        principalAmount: s.principalAmount,
        interestAmount: s.interestAmount,
        totalAmount: s.totalAmount,
        remainingPrincipalAfter: s.remainingPrincipalAfter,
        paidPrincipal: 0,
        paidInterest: 0,
        paidLateFee: 0,
        lateFeeAmount: lateFee,
        daysLate,
        status: instStatus,
      };
    });

    const isFullyPaid = bp.category === "lunas" || bp.paidInstallmentsCount >= bp.tenorMonths;
    const remainingPrincipal = isFullyPaid
      ? 0
      : Math.max(0, bp.principalAmount - totalPaidPrincipal);
    const collectibility = isFullyPaid
      ? "Lancar"
      : determineCollectibility(bp.daysPastDue);

    loans.push({
      id: bp.id,
      applicationId: `PJA-${bp.id.slice(3)}`,
      memberDemoId: bp.memberDemoId,
      memberNumber: bp.memberNumber,
      memberName: bp.memberName,
      productType: bp.productType,
      productName: bp.productName,
      principalAmount: bp.principalAmount,
      interestRatePct: bp.interestRatePct,
      calculationMethod: "flat",
      tenorMonths: bp.tenorMonths,
      adminFeeAmount: bp.adminFeeAmount,
      netDisbursedAmount: bp.netDisbursedAmount,
      disbursementDate: bp.disbursementDate,
      disbursedById: "user-fo-01",
      disbursedByRole: "finance_officer",
      disbursedByName: "Ahmad Fauzi",
      disbursementChannel: "Transfer Rekening Anggota (Simulasi)",
      status: isFullyPaid ? "paid_off" : bp.category === "macet" ? "defaulted" : "active",
      collectibility,
      daysPastDue: bp.daysPastDue,
      remainingPrincipal,
      totalPaidPrincipal,
      totalPaidInterest,
      totalPaidLateFee,
      installments,
      history: [
        {
          id: `LOG-DISB-${bp.id}`,
          timestamp: `${bp.disbursementDate}T08:00:00Z`,
          actorRole: "finance_officer",
          actorName: "Ahmad Fauzi",
          fromStatus: "approved",
          toStatus: "active",
          action: "Pencairan Pinjaman",
          notes: `Pencairan dana pinjaman Rp ${bp.principalAmount.toLocaleString("id-ID")} dipotong biaya admin Rp ${bp.adminFeeAmount.toLocaleString("id-ID")}`,
        },
      ],
    });
  }

  return { loans, paymentRecords };
}

/**
 * 5 Pengajuan Tambahan untuk melengkapi total 30 Rekord Pinjaman:
 * - 3 Menunggu Persetujuan:
 *   - PJ-2026-0026 (Submitted - Rp 8.000.000, Konsumtif)
 *   - PJ-2026-0027 (Under Review - Rp 25.000.000, Produktif)
 *   - PJ-2026-0028 (Recommended - Rp 35.000.000, Produktif)
 * - 2 Ditolak:
 *   - PJ-2026-0029 (Rejected FO - Rp 12.000.000, Konsumtif)
 *   - PJ-2026-0030 (Rejected Pengurus - Rp 45.000.000, Produktif)
 */
export const initialLoanApplications: LoanApplication[] = [
  // 1. Submitted (Menunggu Verifikasi Staf)
  {
    id: "PJ-2026-0026",
    memberDemoId: "DEMO-ID-0026",
    memberNumber: "ANG-2026-0026",
    memberName: "Yosef Wijaya",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    amount: 8_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    calculationMethod: "flat",
    adminFeePct: 1.0,
    adminFeeAmount: 80_000,
    netDisbursementAmount: 7_920_000,
    purpose: "Biaya masuk sekolah menengah putra pertama",
    purposeCategory: "Pendidikan",
    incomeSource: "Gaji Bulanan Karyawan Swasta",
    status: "submitted",
    applicationDate: "2026-04-01T10:15:00Z",
    simulatedDocumentUrl: "SIMULATED DOCUMENT: slip-gaji-yosef.pdf",
    createdById: "user-member-26",
    createdByRole: "member",
    createdByName: "Yosef Wijaya",
    history: [
      {
        id: "LOG-APP-0026-1",
        timestamp: "2026-04-01T10:15:00Z",
        actorRole: "member",
        actorName: "Yosef Wijaya",
        fromStatus: "draft",
        toStatus: "submitted",
        action: "Pengajuan Pinjaman",
        notes: "Pengajuan pinjaman baru berhasil dikirim anggota",
      },
    ],
  },
  // 2. Under Review (Sedang Diverifikasi / Dianalisa)
  {
    id: "PJ-2026-0027",
    memberDemoId: "DEMO-ID-0027",
    memberNumber: "ANG-2026-0027",
    memberName: "Zulfa Marwah",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    amount: 25_000_000,
    tenorMonths: 24,
    interestRatePct: 10.0,
    calculationMethod: "flat",
    adminFeePct: 1.0,
    adminFeeAmount: 250_000,
    netDisbursementAmount: 24_750_000,
    purpose: "Pembelian mesin penggiling kopi & etalase kedai",
    purposeCategory: "Modal Usaha UMKM",
    incomeSource: "Omzet Usaha Kedai Kopi",
    status: "under_review",
    applicationDate: "2026-03-28T09:00:00Z",
    simulatedDocumentUrl: "SIMULATED DOCUMENT: buku-penjualan-kedai.pdf",
    createdById: "user-member-27",
    createdByRole: "member",
    createdByName: "Zulfa Marwah",
    reviewedById: "user-staff-01",
    reviewedByRole: "staff",
    reviewedByName: "Dewi Lestari",
    reviewedAt: "2026-03-29T14:20:00Z",
    reviewNotes: "Kelengkapan berkas usaha telah diverifikasi lengkap. Diteruskan untuk analisa keuangan.",
    history: [
      {
        id: "LOG-APP-0027-1",
        timestamp: "2026-03-28T09:00:00Z",
        actorRole: "member",
        actorName: "Zulfa Marwah",
        fromStatus: "draft",
        toStatus: "submitted",
        action: "Pengajuan Pinjaman",
      },
      {
        id: "LOG-APP-0027-2",
        timestamp: "2026-03-29T14:20:00Z",
        actorRole: "staff",
        actorName: "Dewi Lestari",
        fromStatus: "submitted",
        toStatus: "under_review",
        action: "Verifikasi Administratif",
        notes: "Kelengkapan berkas usaha telah diverifikasi lengkap.",
      },
    ],
  },
  // 3. Recommended (Telah Direkomendasikan FO untuk Approval Pengurus > 10M)
  {
    id: "PJ-2026-0028",
    memberDemoId: "DEMO-ID-0028",
    memberNumber: "ANG-2026-0028",
    memberName: "Arif Hidayat",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    amount: 35_000_000,
    tenorMonths: 24,
    interestRatePct: 10.0,
    calculationMethod: "flat",
    adminFeePct: 1.0,
    adminFeeAmount: 350_000,
    netDisbursementAmount: 34_650_000,
    purpose: "Ekspansi bengkel motor dan stok suku cadang",
    purposeCategory: "Modal Usaha UMKM",
    incomeSource: "Omzet Bengkel Motor",
    status: "recommended",
    applicationDate: "2026-03-25T11:00:00Z",
    simulatedDocumentUrl: "SIMULATED DOCUMENT: laporan-keuangan-bengkel.pdf",
    createdById: "user-member-28",
    createdByRole: "member",
    createdByName: "Arif Hidayat",
    reviewedById: "user-staff-01",
    reviewedByRole: "staff",
    reviewedByName: "Dewi Lestari",
    reviewedAt: "2026-03-26T10:00:00Z",
    recommendedById: "user-fo-01",
    recommendedByRole: "finance_officer",
    recommendedByName: "Ahmad Fauzi",
    recommendedAt: "2026-03-27T16:00:00Z",
    recommendationNotes:
      "Kapasitas cash flow pemohon memadai (>3x cicilan). Nominal melampaui limit FO Rp 10.000.000 sehingga direkomendasikan persetujuan Pengurus.",
    history: [
      {
        id: "LOG-APP-0028-1",
        timestamp: "2026-03-25T11:00:00Z",
        actorRole: "member",
        actorName: "Arif Hidayat",
        fromStatus: "draft",
        toStatus: "submitted",
        action: "Pengajuan Pinjaman",
      },
      {
        id: "LOG-APP-0028-2",
        timestamp: "2026-03-26T10:00:00Z",
        actorRole: "staff",
        actorName: "Dewi Lestari",
        fromStatus: "submitted",
        toStatus: "under_review",
        action: "Verifikasi Administratif",
      },
      {
        id: "LOG-APP-0028-3",
        timestamp: "2026-03-27T16:00:00Z",
        actorRole: "finance_officer",
        actorName: "Ahmad Fauzi",
        fromStatus: "under_review",
        toStatus: "recommended",
        action: "Rekomendasi ke Pengurus",
        notes: "Nominal di atas Rp 10.000.000 memerlukan persetujuan Pengurus / Manajer.",
      },
    ],
  },
  // 4. Rejected FO (Ditolak karena Debt Service Ratio melebihi batas)
  {
    id: "PJ-2026-0029",
    memberDemoId: "DEMO-ID-0029",
    memberNumber: "ANG-2026-0029",
    memberName: "Bambang Sudiro",
    productType: "konsumtif",
    productName: "Pinjaman Konsumtif Anggota",
    amount: 12_000_000,
    tenorMonths: 12,
    interestRatePct: 12.0,
    calculationMethod: "flat",
    adminFeePct: 1.0,
    adminFeeAmount: 120_000,
    netDisbursementAmount: 11_880_000,
    purpose: "Kebutuhan renovasi pagar rumah",
    purposeCategory: "Renovasi Rumah",
    incomeSource: "Penghasilan Tidak Tetap",
    status: "rejected",
    applicationDate: "2026-03-10T14:00:00Z",
    simulatedDocumentUrl: "SIMULATED DOCUMENT: keterangan-penghasilan.pdf",
    createdById: "user-member-29",
    createdByRole: "member",
    createdByName: "Bambang Sudiro",
    reviewedById: "user-staff-01",
    reviewedByRole: "staff",
    reviewedByName: "Dewi Lestari",
    reviewedAt: "2026-03-11T09:30:00Z",
    rejectionReason:
      "Rasio beban angsuran melebihi 40% dari estimasi penghasilan bulanan terverifikasi.",
    history: [
      {
        id: "LOG-APP-0029-1",
        timestamp: "2026-03-10T14:00:00Z",
        actorRole: "member",
        actorName: "Bambang Sudiro",
        fromStatus: "draft",
        toStatus: "submitted",
        action: "Pengajuan Pinjaman",
      },
      {
        id: "LOG-APP-0029-2",
        timestamp: "2026-03-12T11:00:00Z",
        actorRole: "finance_officer",
        actorName: "Ahmad Fauzi",
        fromStatus: "under_review",
        toStatus: "rejected",
        action: "Penolakan Pengajuan",
        notes: "Rasio beban angsuran melebihi batas kelayakan.",
      },
    ],
  },
  // 5. Rejected Pengurus (Ditolak Pengurus karena Plafon Terlalu Besar)
  {
    id: "PJ-2026-0030",
    memberDemoId: "DEMO-ID-0030",
    memberNumber: "ANG-2026-0030",
    memberName: "Chandra Gunawan",
    productType: "produktif",
    productName: "Pinjaman Modal Usaha Produktif",
    amount: 45_000_000,
    tenorMonths: 36,
    interestRatePct: 10.0,
    calculationMethod: "flat",
    adminFeePct: 1.0,
    adminFeeAmount: 450_000,
    netDisbursementAmount: 44_550_000,
    purpose: "Pembelian armada truk pick-up bekas",
    purposeCategory: "Modal Usaha UMKM",
    incomeSource: "Jasa Logistik",
    status: "rejected",
    applicationDate: "2026-03-05T08:30:00Z",
    simulatedDocumentUrl: "SIMULATED DOCUMENT: invoice-kendaraan.pdf",
    createdById: "user-member-30",
    createdByRole: "member",
    createdByName: "Chandra Gunawan",
    reviewedById: "user-staff-01",
    reviewedByRole: "staff",
    reviewedByName: "Dewi Lestari",
    reviewedAt: "2026-03-06T10:00:00Z",
    recommendedById: "user-fo-01",
    recommendedByRole: "finance_officer",
    recommendedByName: "Ahmad Fauzi",
    recommendedAt: "2026-03-07T14:00:00Z",
    rejectionReason:
      "Koperasi sedang memprioritaskan alokasi likuiditas pinjaman darurat dan UMKM mikro di bawah Rp 30.000.000.",
    history: [
      {
        id: "LOG-APP-0030-1",
        timestamp: "2026-03-05T08:30:00Z",
        actorRole: "member",
        actorName: "Chandra Gunawan",
        fromStatus: "draft",
        toStatus: "submitted",
        action: "Pengajuan Pinjaman",
      },
      {
        id: "LOG-APP-0030-2",
        timestamp: "2026-03-08T15:00:00Z",
        actorRole: "manager",
        actorName: "Hendra Kurniawan",
        fromStatus: "recommended",
        toStatus: "rejected",
        action: "Penolakan Pengurus",
        notes: "Prioritas likuiditas dialokasikan untuk usaha mikro di bawah Rp 30.000.000.",
      },
    ],
  },
];
