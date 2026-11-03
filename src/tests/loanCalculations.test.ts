// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  calculateFlatSchedule,
  calculateAnnuitySchedule,
  calculateEffectiveSchedule,
  calculateLoanSimulation,
  determineCollectibility,
  calculateLateFee,
  allocateInstallmentPayment,
  calculateEarlyRepayment,
} from "../features/loans/utils/loanCalculations";

describe("Loan Calculations Utility Tests (BR-03.3 & BR-03.8)", () => {
  describe("1. Flat Rate Calculation & Residual Rounding", () => {
    it("1.1. Menghitung jadwal flat rate dengan tepat dan mengalokasikan sisa pembulatan pokok ke angsuran bulan terakhir", () => {
      // Pinjaman Rp 10.000.000, tenor 12 bulan, bunga 12% p.a.
      const schedule = calculateFlatSchedule(10_000_000, 12, 12, "2026-01-01");
      expect(schedule).toHaveLength(12);

      // Pokok dasar: Math.floor(10.000.000 / 12) = 833.333
      // Bunga bulanan: Math.round((10.000.000 * 12) / (12 * 100)) = 100.000
      // Sisa pembulatan: 10.000.000 - (833.333 * 12) = 10.000.000 - 9.999.996 = 4
      expect(schedule[0].principalAmount).toBe(833_333);
      expect(schedule[0].interestAmount).toBe(100_000);
      expect(schedule[0].totalAmount).toBe(933_333);

      // Bulan ke-12 (terakhir) harus menerima sisa pembulatan pokok: 833.333 + 4 = 833.337
      const lastMonth = schedule[11];
      expect(lastMonth.principalAmount).toBe(833_337);
      expect(lastMonth.interestAmount).toBe(100_000);
      expect(lastMonth.totalAmount).toBe(933_337);
      expect(lastMonth.remainingPrincipalAfter).toBe(0);

      // Verifikasi total pokok yang dibayar sama persis dengan pokok awal
      const totalPrincipal = schedule.reduce((sum, s) => sum + s.principalAmount, 0);
      expect(totalPrincipal).toBe(10_000_000);
    });

    it("1.2. Menghitung flat rate untuk tenor pendek tanpa sisa pembulatan", () => {
      const schedule = calculateFlatSchedule(6_000_000, 6, 12, "2026-01-01");
      expect(schedule).toHaveLength(6);
      schedule.forEach((s) => {
        expect(s.principalAmount).toBe(1_000_000);
        expect(s.interestAmount).toBe(60_000);
        expect(s.totalAmount).toBe(1_060_000);
      });
      expect(schedule[5].remainingPrincipalAfter).toBe(0);
    });
  });

  describe("2. Annuity (Equal Installment) Calculation", () => {
    it("2.1. Menghitung anuitas dengan cicilan konstan, porsi bunga menurun, dan saldo akhir 0", () => {
      const schedule = calculateAnnuitySchedule(12_000_000, 12, 12, "2026-01-01");
      expect(schedule).toHaveLength(12);

      // Bunga bulan pertama: 12.000.000 * 1% = 120.000
      expect(schedule[0].interestAmount).toBe(120_000);

      // Porsi bunga bulan kedua harus lebih kecil dari bulan pertama
      expect(schedule[1].interestAmount).toBeLessThan(schedule[0].interestAmount);

      // Porsi pokok bulan kedua harus lebih besar dari bulan pertama
      expect(schedule[1].principalAmount).toBeGreaterThan(schedule[0].principalAmount);

      // Bulan terakhir saldo akhir harus 0
      expect(schedule[11].remainingPrincipalAfter).toBe(0);

      // Total pokok yang dikembalikan harus tepat 12.000.000
      const totalPrincipal = schedule.reduce((sum, s) => sum + s.principalAmount, 0);
      expect(totalPrincipal).toBe(12_000_000);
    });
  });

  describe("3. Declining Balance (Effective) Calculation", () => {
    it("3.1. Menghitung bunga efektif saldo menurun di mana pokok konstan dan angsuran total mengecil", () => {
      const schedule = calculateEffectiveSchedule(12_000_000, 12, 12, "2026-01-01");
      expect(schedule).toHaveLength(12);

      expect(schedule[0].principalAmount).toBe(1_000_000);
      expect(schedule[0].interestAmount).toBe(120_000);
      expect(schedule[0].totalAmount).toBe(1_120_000);

      // Angsuran total bulan berikutnya mengecil
      expect(schedule[1].totalAmount).toBeLessThan(schedule[0].totalAmount);
      expect(schedule[11].totalAmount).toBeLessThan(schedule[10].totalAmount);

      expect(schedule[11].remainingPrincipalAfter).toBe(0);
      const totalPrincipal = schedule.reduce((sum, s) => sum + s.principalAmount, 0);
      expect(totalPrincipal).toBe(12_000_000);
    });
  });

  describe("4. Collectibility Classification (OJK / Koperasi Standards)", () => {
    it("4.1. Mengklasifikasikan kolektibilitas dengan tepat berdasarkan hari keterlambatan (DPD)", () => {
      expect(determineCollectibility(0)).toBe("Lancar");
      expect(determineCollectibility(-5)).toBe("Lancar");
      expect(determineCollectibility(1)).toBe("DPK");
      expect(determineCollectibility(30)).toBe("DPK");
      expect(determineCollectibility(90)).toBe("DPK");
      expect(determineCollectibility(91)).toBe("Kurang Lancar");
      expect(determineCollectibility(120)).toBe("Kurang Lancar");
      expect(determineCollectibility(121)).toBe("Diragukan");
      expect(determineCollectibility(180)).toBe("Diragukan");
      expect(determineCollectibility(181)).toBe("Macet");
      expect(determineCollectibility(360)).toBe("Macet");
    });
  });

  describe("5. Late Fee & Grace Period Calculation", () => {
    it("5.1. Denda keterlambatan 0 jika masih dalam masa tenggang (grace period <= 3 hari)", () => {
      expect(calculateLateFee(1_000_000, 0, 3, 0.5)).toBe(0);
      expect(calculateLateFee(1_000_000, 2, 3, 0.5)).toBe(0);
      expect(calculateLateFee(1_000_000, 3, 3, 0.5)).toBe(0);
    });

    it("5.2. Denda dihitung proporsional dari total hari keterlambatan jika melebihi grace period", () => {
      // Terlambat 10 hari, tagihan 1.000.000, denda 0.5% per hari
      // Denda = 1.000.000 * 0.005 * 10 = 50.000
      const fee = calculateLateFee(1_000_000, 10, 3, 0.5);
      expect(fee).toBe(50_000);
    });
  });

  describe("6. Priority Allocation Order (BR-04.3)", () => {
    it("6.1. Mengalokasikan dana secara ketat sesuai prioritas: 1. Denda -> 2. Bunga -> 3. Pokok", () => {
      // Tagihan: Denda 50.000, Bunga 100.000, Pokok 850.000. Total = 1.000.000
      // Bayar 120.000 -> harus melunasi Denda 50.000, Bunga 70.000, Pokok 0
      const alloc1 = allocateInstallmentPayment(120_000, 50_000, 100_000, 850_000);
      expect(alloc1.allocatedLateFee).toBe(50_000);
      expect(alloc1.allocatedInterest).toBe(70_000);
      expect(alloc1.allocatedPrincipal).toBe(0);
      expect(alloc1.remainingUnallocated).toBe(0);

      // Bayar 500.000 -> Denda 50.000, Bunga 100.000, Pokok 350.000
      const alloc2 = allocateInstallmentPayment(500_000, 50_000, 100_000, 850_000);
      expect(alloc2.allocatedLateFee).toBe(50_000);
      expect(alloc2.allocatedInterest).toBe(100_000);
      expect(alloc2.allocatedPrincipal).toBe(350_000);
      expect(alloc2.remainingUnallocated).toBe(0);

      // Bayar lebih dari total (1.200.000) -> sisa dana 200.000
      const alloc3 = allocateInstallmentPayment(1_200_000, 50_000, 100_000, 850_000);
      expect(alloc3.allocatedLateFee).toBe(50_000);
      expect(alloc3.allocatedInterest).toBe(100_000);
      expect(alloc3.allocatedPrincipal).toBe(850_000);
      expect(alloc3.remainingUnallocated).toBe(200_000);
    });
  });

  describe("7. Early Repayment Calculation", () => {
    it("7.1. Menghitung pelunasan dipercepat dengan menghapuskan bunga masa depan", () => {
      const installments = [
        {
          installmentNumber: 1,
          dueDate: "2026-02-01",
          principalAmount: 1_000_000,
          interestAmount: 100_000,
          totalAmount: 1_100_000,
          remainingPrincipalAfter: 2_000_000,
          paidPrincipal: 1_000_000,
          paidInterest: 100_000,
          paidLateFee: 0,
          lateFeeAmount: 0,
          daysLate: 0,
          status: "paid" as const,
        },
        {
          installmentNumber: 2,
          dueDate: "2026-03-01",
          principalAmount: 1_000_000,
          interestAmount: 100_000,
          totalAmount: 1_100_000,
          remainingPrincipalAfter: 1_000_000,
          paidPrincipal: 0,
          paidInterest: 0,
          paidLateFee: 0,
          lateFeeAmount: 20_000,
          daysLate: 5,
          status: "overdue" as const,
        },
        {
          installmentNumber: 3,
          dueDate: "2026-04-01",
          principalAmount: 1_000_000,
          interestAmount: 100_000,
          totalAmount: 1_100_000,
          remainingPrincipalAfter: 0,
          paidPrincipal: 0,
          paidInterest: 0,
          paidLateFee: 0,
          lateFeeAmount: 0,
          daysLate: 0,
          status: "upcoming" as const,
        },
      ];

      const settlement = calculateEarlyRepayment(installments);
      // Sisa pokok: 1.000.000 (bulan 2) + 1.000.000 (bulan 3) = 2.000.000
      expect(settlement.unpaidPrincipalTotal).toBe(2_000_000);
      // Bunga berjalan bulan 2 = 100.000
      expect(settlement.unpaidInterestCurrent).toBe(100_000);
      // Denda bulan 2 = 20.000
      expect(settlement.unpaidLateFeeTotal).toBe(20_000);
      // Bunga masa depan bulan 3 dihapuskan = 100.000
      expect(settlement.waivedFutureInterestAmount).toBe(100_000);
      // Total yang harus dibayar = 2.000.000 + 100.000 + 20.000 = 2.120.000
      expect(settlement.totalEarlySettlementAmount).toBe(2_120_000);
    });
  });

  describe("8. Full Simulation Package", () => {
    it("8.1. Menghitung simulasi lengkap pembiayaan termasuk biaya administrasi 1%", () => {
      const sim = calculateLoanSimulation(10_000_000, 12, 12, "flat", 1, "2026-01-01");
      expect(sim.principalAmount).toBe(10_000_000);
      expect(sim.tenorMonths).toBe(12);
      expect(sim.adminFeePct).toBe(1);
      expect(sim.adminFeeAmount).toBe(100_000);
      expect(sim.netDisbursementAmount).toBe(9_900_000);
      expect(sim.totalInterestAmount).toBe(1_200_000);
      expect(sim.totalRepaymentAmount).toBe(11_200_000);
      expect(sim.schedule).toHaveLength(12);
    });
  });
});
