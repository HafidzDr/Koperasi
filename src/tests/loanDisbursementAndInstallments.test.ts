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

  describe("2. Installment Payment, Member Isolation & Financial Integrity (BR-04.3)", () => {
    it("2.0. Isolasi Anggota: Member A DITOLAK saat mencoba membayar angsuran milik Member B", () => {
      // Siti Rahma (DEMO-ID-0001) mencoba membayar pinjaman milik Kurniawan Putra (DEMO-ID-0013)
      useAuthStore.setState({ currentUser: demoUsers.member });

      const res = useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        amountPaid: 500_000,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Akses ditolak: Anda hanya dapat melakukan pembayaran angsuran untuk pinjaman Anda sendiri");
    });

    it("2.1. Pembayaran angsuran dialokasikan sesuai urutan: Denda -> Bunga -> Pokok", () => {
      // Ambil pinjaman PJ-2026-0013 (kategori DPK, milik Kurniawan Putra DEMO-ID-0013)
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

      // Login sebagai pemilik pinjaman yang sah (DEMO-ID-0013)
      useAuthStore.setState({
        currentUser: {
          id: "user-member-13",
          name: "Kurniawan Putra",
          role: "member",
          roleName: "Anggota",
          email: "kurniawan.putra@koperasi.id",
          memberId: "DEMO-ID-0013",
        },
      });

      // Bayar angsuran penuh
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

      useAuthStore.setState({
        currentUser: {
          id: "user-member-13",
          name: "Kurniawan Putra",
          role: "member",
          roleName: "Anggota",
          email: "kurniawan.putra@koperasi.id",
          memberId: "DEMO-ID-0013",
        },
      });

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

    it("2.3. Menolak pembayaran melebihi total kewajiban angsuran (overpayment prevention)", () => {
      const loan = useLoanStore.getState().getLoanById("PJ-2026-0013");
      const inst = loan!.installments.find((i) => i.status !== "paid")!;
      const obligation = inst.principalAmount + inst.interestAmount + inst.lateFeeAmount;

      useAuthStore.setState({
        currentUser: {
          id: "user-member-13",
          name: "Kurniawan Putra",
          role: "member",
          roleName: "Anggota",
          email: "kurniawan.putra@koperasi.id",
          memberId: "DEMO-ID-0013",
        },
      });

      const res = useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: inst.installmentNumber,
        amountPaid: obligation + 100_000,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("melebihi total sisa kewajiban");
    });

    it("2.4. Menolak pembayaran dengan nominal non-positif, non-finite, atau bukan integer", () => {
      useAuthStore.setState({
        currentUser: {
          id: "user-member-13",
          name: "Kurniawan Putra",
          role: "member",
          roleName: "Anggota",
          email: "kurniawan.putra@koperasi.id",
          memberId: "DEMO-ID-0013",
        },
      });

      const resNeg = useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        amountPaid: -100_000,
      });
      expect(resNeg.success).toBe(false);
      expect(resNeg.error).toContain("harus berupa bilangan bulat positif");

      const resFloat = useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        amountPaid: 100_000.5,
      });
      expect(resFloat.success).toBe(false);
      expect(resFloat.error).toContain("harus berupa bilangan bulat positif");
    });

    it("2.5. Idempotency Guard: Menolak pengulangan transaksi dengan idempotencyKey yang sama", () => {
      useAuthStore.setState({
        currentUser: {
          id: "user-member-13",
          name: "Kurniawan Putra",
          role: "member",
          roleName: "Anggota",
          email: "kurniawan.putra@koperasi.id",
          memberId: "DEMO-ID-0013",
        },
      });

      const key = "IDEMP-KEY-PAYMENT-001";
      const res1 = useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        amountPaid: 200_000,
        idempotencyKey: key,
      });
      expect(res1.success).toBe(true);

      // Coba kirim ulang dengan idempotencyKey yang sama
      const res2 = useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        amountPaid: 200_000,
        idempotencyKey: key,
      });
      expect(res2.success).toBe(false);
      expect(res2.error).toContain("kunci idempotensi");
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

    it("3.2. Menolak penyesuaian denda tanpa alasan transparan atau nominal negatif", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });

      const resNoReason = useLoanStore.getState().adjustInstallmentLateFee({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        waiveFee: false,
        newLateFeeAmount: 50_000,
        reason: "   ",
      });
      expect(resNoReason.success).toBe(false);
      expect(resNoReason.error).toContain("Alasan penyesuaian/penghapusan denda wajib dicantumkan");

      const resNeg = useLoanStore.getState().adjustInstallmentLateFee({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        waiveFee: false,
        newLateFeeAmount: -10_000,
        reason: "Nominal negatif",
      });
      expect(resNeg.success).toBe(false);
      expect(resNeg.error).toContain("tidak boleh bernilai negatif");
    });

    it("3.3. Menolak penyesuaian denda lebih rendah dari nominal denda yang telah dibayar", () => {
      // Pertama, bayar sebagian denda pada angsuran ke-3 PJ-2026-0013
      useAuthStore.setState({
        currentUser: {
          id: "user-member-13",
          name: "Kurniawan Putra",
          role: "member",
          roleName: "Anggota",
          email: "kurniawan.putra@koperasi.id",
          memberId: "DEMO-ID-0013",
        },
      });

      useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        amountPaid: 30_000,
      });

      const inst = useLoanStore.getState().getLoanById("PJ-2026-0013")?.installments.find((i) => i.installmentNumber === 3);
      expect(inst?.paidLateFee).toBeGreaterThan(0);

      // Bendahara mencoba menyetel denda baru lebih kecil dari yang sudah dibayar
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const res = useLoanStore.getState().adjustInstallmentLateFee({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        waiveFee: false,
        newLateFeeAmount: (inst?.paidLateFee ?? 30_000) - 10_000,
        reason: "Denda diturunkan di bawah yang telah dibayar",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak boleh lebih rendah dari nominal denda yang telah dibayar");
    });
  });

  describe("4. Early Repayment Execution & Financial Consistency", () => {
    it("4.0. Isolasi Anggota: Member A DITOLAK saat mencoba pelunasan dipercepat untuk pinjaman Member B", () => {
      // Siti Rahma (DEMO-ID-0001) mencoba melunasi pinjaman Kurniawan Putra (DEMO-ID-0013)
      useAuthStore.setState({ currentUser: demoUsers.member });

      const res = useLoanStore.getState().executeEarlyRepayment("PJ-2026-0013");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Akses ditolak: Anda hanya dapat melakukan pelunasan dipercepat untuk pinjaman Anda sendiri");
    });

    it("4.1. Pelunasan dipercepat menghapus bunga masa depan (waived) dan konsisten secara matematis", () => {
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

      // Verifikasi bunga masa depan:
      // Angsuran mendatang memiliki interestWaived: true dan paidInterest TIDAK memasukkan bunga masa depan
      const futureInsts = loan!.installments.filter((i) => i.installmentNumber > 4);
      expect(futureInsts.length).toBeGreaterThan(0);
      futureInsts.forEach((inst) => {
        expect(inst.interestWaived).toBe(true);
        expect(inst.waivedInterestAmount).toBe(inst.interestAmount);
        expect(inst.paidInterest).toBe(0); // Bunga masa depan TIDAK dicatat sebagai dibayar
      });

      // Konsistensi matematis: totalPaidInterest loan === sum(paidInterest setiap angsuran)
      const sumInstallmentPaidInterest = loan!.installments.reduce((sum, i) => sum + i.paidInterest, 0);
      expect(loan!.totalPaidInterest).toBe(sumInstallmentPaidInterest);

      // Percobaan pelunasan kedua pada pinjaman yang sudah lunas DITOLAK
      const resSecond = useLoanStore.getState().executeEarlyRepayment("PJ-2026-0001");
      expect(resSecond.success).toBe(false);
      expect(resSecond.error).toContain("sudah berstatus Lunas");
    });
  });
});
