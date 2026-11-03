// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useLoanStore } from "../features/loans/stores/loanStore";
import { useMembershipStore } from "../features/membership/stores/membershipStore";
import { useAuthStore } from "../stores/authStore";
import { demoUsers } from "../mocks/seedData";

describe("Loan Disbursement, Installment Schedule & Payment Tests (BR-03.7, BR-03.8, BR-04.3)", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useLoanStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
  });

  describe("1. Loan Disbursement & Idempotency", () => {
    it("1.1. Finance Officer berhasil mencairkan pinjaman berstatus 'approved', memotong admin fee 1%, dan membentuk jadwal angsuran", () => {
      // Siapkan aplikasi berstatus approved
      useAuthStore.setState({ currentUser: demoUsers.manager });
      useLoanStore.getState().approveApplication("PJ-2026-0028");

      // Login sebagai Finance Officer untuk pencairan
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });

      const initialLoansCount = useLoanStore.getState().loans.length;

      const res = useLoanStore.getState().disburseLoan(
        "PJ-2026-0028",
        "Transfer Rekening Anggota (Simulasi)",
        "Pencairan dana disetujui kas"
      );

      expect(res.success).toBe(true);
      expect(res.loanId).toBe("PJ-2026-0028");

      // Verifikasi pinjaman aktif baru terbentuk
      const newLoan = useLoanStore.getState().getLoanById("PJ-2026-0028");
      expect(newLoan).toBeDefined();
      expect(newLoan?.status).toBe("active");
      expect(newLoan?.collectibility).toBe("Lancar");
      expect(newLoan?.principalAmount).toBe(35_000_000);
      expect(newLoan?.adminFeeAmount).toBe(350_000); // 1%
      expect(newLoan?.netDisbursedAmount).toBe(34_650_000);
      expect(newLoan?.installments).toHaveLength(24); // Tenor 24 bulan
      expect(newLoan?.installments[0].status).toBe("upcoming");

      // Verifikasi jumlah total loan bertambah 1
      expect(useLoanStore.getState().loans.length).toBe(initialLoansCount + 1);
    });

    it("1.2. Idempotency Guard: Menolak pencairan ulang untuk ID pengajuan yang sudah dicairkan", () => {
      useAuthStore.setState({ currentUser: demoUsers.manager });
      useLoanStore.getState().approveApplication("PJ-2026-0028");

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });

      // Pencairan pertama
      const res1 = useLoanStore.getState().disburseLoan("PJ-2026-0028");
      expect(res1.success).toBe(true);

      // Pencairan kedua dengan ID yang sama -> harus ditolak!
      const res2 = useLoanStore.getState().disburseLoan("PJ-2026-0028");
      expect(res2.success).toBe(false);
      expect(res2.error).toContain("sudah dicairkan sebelumnya (idempotency guard)");
    });

    it("1.3. Menolak pencairan oleh peran selain Finance Officer (e.g. Staf, Admin, Member)", () => {
      useAuthStore.setState({ currentUser: demoUsers.manager });
      useLoanStore.getState().approveApplication("PJ-2026-0028");

      // Coba pencairan oleh Admin
      useAuthStore.setState({ currentUser: demoUsers.admin });
      const resAdmin = useLoanStore.getState().disburseLoan("PJ-2026-0028");
      expect(resAdmin.success).toBe(false);
      expect(resAdmin.error).toContain("Hanya Petugas Keuangan (Finance Officer) yang berwenang");

      // Coba pencairan oleh Staf
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const resStaff = useLoanStore.getState().disburseLoan("PJ-2026-0028");
      expect(resStaff.success).toBe(false);
    });
  });

  describe("2. Installment Payment & Priority Allocation (BR-04.3)", () => {
    it("2.1. Pembayaran angsuran dialokasikan sesuai urutan: Denda -> Bunga -> Pokok", () => {
      // Ambil pinjaman PJ-2026-0013 (kategori DPK, ada denda keterlambatan)
      const loan = useLoanStore.getState().getLoanById("PJ-2026-0013");
      expect(loan).toBeDefined();

      const overdueInst = loan!.installments.find((i) => i.status === "overdue");
      expect(overdueInst).toBeDefined();
      expect(overdueInst!.lateFeeAmount).toBeGreaterThan(0);

      const instNumber = overdueInst!.installmentNumber;
      const lateFee = overdueInst!.lateFeeAmount;
      const interest = overdueInst!.interestAmount;
      const principal = overdueInst!.principalAmount;
      const totalObligation = lateFee + interest + principal;

      // Bayar angsuran penuh
      useAuthStore.setState({ currentUser: demoUsers.member });
      const res = useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: instNumber,
        amountPaid: totalObligation,
      });

      expect(res.success).toBe(true);
      expect(res.paymentRecordId).toBeDefined();

      // Verifikasi status angsuran telah berubah menjadi paid
      const updatedLoan = useLoanStore.getState().getLoanById("PJ-2026-0013");
      const updatedInst = updatedLoan!.installments.find((i) => i.installmentNumber === instNumber);
      expect(updatedInst?.status).toBe("paid");
      expect(updatedInst?.paidLateFee).toBe(lateFee);
      expect(updatedInst?.paidInterest).toBe(interest);
      expect(updatedInst?.paidPrincipal).toBe(principal);
    });

    it("2.2. Pembayaran sebagian (partial payment) mengutamakan denda dan bunga terlebih dahulu", () => {
      const loan = useLoanStore.getState().getLoanById("PJ-2026-0013");
      const overdueInst = loan!.installments.find((i) => i.status === "overdue")!;
      const lateFee = overdueInst.lateFeeAmount;
      const interest = overdueInst.interestAmount;

      // Bayar hanya sebesar denda + separuh bunga
      const partialAmount = lateFee + Math.floor(interest / 2);

      useAuthStore.setState({ currentUser: demoUsers.member });
      const res = useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: overdueInst.installmentNumber,
        amountPaid: partialAmount,
      });

      expect(res.success).toBe(true);

      const updatedLoan = useLoanStore.getState().getLoanById("PJ-2026-0013");
      const updatedInst = updatedLoan!.installments.find(
        (i) => i.installmentNumber === overdueInst.installmentNumber
      );

      expect(updatedInst?.status).toBe("partially_paid");
      expect(updatedInst?.paidLateFee).toBe(lateFee); // Denda lunas penuh
      expect(updatedInst?.paidInterest).toBe(Math.floor(interest / 2)); // Bunga terbayar sebagian
      expect(updatedInst?.paidPrincipal).toBe(0); // Pokok belum terbayar
    });
  });

  describe("3. Late Fee Waiver & Adjustment (Treasurer Authority)", () => {
    it("3.1. Hanya Bendahara (Treasurer) yang dapat menghapuskan/menyesuaikan denda", () => {
      // Coba oleh Finance Officer -> harus ditolak!
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const resFo = useLoanStore.getState().adjustInstallmentLateFee({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        waiveFee: true,
        reason: "Permohonan keringanan musibah",
      });
      expect(resFo.success).toBe(false);
      expect(resFo.error).toContain("Hanya Bendahara (Treasurer)");

      // Eksekusi oleh Bendahara Sri Mulyani -> harus berhasil
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const resTreasurer = useLoanStore.getState().adjustInstallmentLateFee({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        waiveFee: true,
        reason: "Keringanan denda disetujui sesuai rapat pengurus nomor 04/KMB/2026",
      });
      expect(resTreasurer.success).toBe(true);

      // Verifikasi denda di angsuran telah dihapuskan
      const updatedLoan = useLoanStore.getState().getLoanById("PJ-2026-0013");
      const inst = updatedLoan?.installments.find((i) => i.installmentNumber === 3);
      expect(inst?.lateFeeWaived).toBe(true);
      expect(inst?.lateFeeAmount).toBe(0);
      expect(inst?.lateFeeAdjustmentReason).toContain("Keringanan denda disetujui");
    });
  });

  describe("4. Early Repayment Execution", () => {
    it("4.1. Pelunasan pinjaman dipercepat melunasi seluruh pokok dan menandai status 'paid_off'", () => {
      // Pinjaman Siti Rahma PJ-2026-0001 (masih aktif, 3 angsuran terbayar dari 12)
      useAuthStore.setState({ currentUser: demoUsers.member });

      const res = useLoanStore.getState().executeEarlyRepayment(
        "PJ-2026-0001",
        "Transfer Bank (Simulasi)",
        "Pelunasan sebelum jatuh tempo tenor"
      );

      expect(res.success).toBe(true);

      const loan = useLoanStore.getState().getLoanById("PJ-2026-0001");
      expect(loan?.status).toBe("paid_off");
      expect(loan?.collectibility).toBe("Lancar");
      expect(loan?.remainingPrincipal).toBe(0);
      expect(loan?.totalPaidPrincipal).toBe(loan?.principalAmount);

      // Seluruh angsuran harus berstatus paid
      const allPaid = loan?.installments.every((i) => i.status === "paid");
      expect(allPaid).toBe(true);
    });
  });
});
