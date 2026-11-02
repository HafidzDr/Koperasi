// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSavingsStore } from "../features/savings/stores/savingsStore";
import { useMembershipStore } from "../features/membership/stores/membershipStore";
import { useAuthStore } from "../stores/authStore";
import { demoUsers } from "../mocks/seedData";

describe("PHASE 4 — Savings Management Business Logic, SoD & Persistence Tests", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useSavingsStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
  });

  describe("1. Deposit Lifecycle & Saldo Immutability", () => {
    it("1.1. Pengajuan setoran baru berstatus 'submitted' dan TIDAK langsung mengubah saldo", () => {
      // Member Siti Rahma (DEMO-ID-0001)
      useAuthStore.setState({ currentUser: demoUsers.member });

      const initialAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      expect(initialAccount).toBeTruthy();
      const initialWajib = initialAccount!.saldoWajib;
      const initialTotal = initialAccount!.totalSaldo;

      // Submit deposit
      const res = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
        notes: "Setoran simpanan wajib via transfer",
      });

      expect(res.success).toBe(true);
      expect(res.transactionId).toMatch(/^SAV-TRX-\d{4}-\d{4}$/);

      // Verify transaction recorded
      const trx = useSavingsStore.getState().getTransactionById(res.transactionId!);
      expect(trx).toBeDefined();
      expect(trx?.status).toBe("submitted");
      expect(trx?.amount).toBe(50000);
      expect(trx?.history).toHaveLength(1);

      // CRUCIAL: Saldo MUST NOT CHANGE yet!
      const afterAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      expect(afterAccount?.saldoWajib).toBe(initialWajib);
      expect(afterAccount?.totalSaldo).toBe(initialTotal);
    });

    it("1.2. Verifikasi oleh Staf mengubah status menjadi 'under_review' dan tetap TIDAK mengubah saldo", () => {
      // Create a submission
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 200000,
      });

      const initialAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      const initialSukarela = initialAccount!.saldoSukarela;

      // Staff (Dewi Lestari) reviews transaction
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const reviewRes = useSavingsStore.getState().reviewTransaction(
        submitRes.transactionId!,
        "Bukti transfer valid dan cocok dengan mutasi kasir."
      );

      expect(reviewRes.success).toBe(true);

      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("under_review");
      expect(trx?.reviewedByRole).toBe("staff");
      expect(trx?.reviewedByName).toBe("Dewi Lestari");
      expect(trx?.history).toHaveLength(2);

      // Saldo still remains strictly unchanged
      const afterAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      expect(afterAccount?.saldoSukarela).toBe(initialSukarela);
    });

    it("1.3. Persetujuan oleh Finance Officer mengubah saldo tepat satu kali", () => {
      // Member creates deposit
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 150000,
      });

      const initialAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      const prevSukarela = initialAccount!.saldoSukarela;

      // Finance Officer (Ahmad Fauzi) approves
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const approveRes = useSavingsStore.getState().approveTransaction(
        submitRes.transactionId!,
        "Setoran disetujui."
      );

      expect(approveRes.success).toBe(true);

      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("approved");
      expect(trx?.approvedByRole).toBe("finance_officer");
      expect(trx?.approvedByName).toBe("Ahmad Fauzi");

      // Saldo MUST increase exactly by 150000
      const updatedAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      expect(updatedAccount?.saldoSukarela).toBe(prevSukarela + 150000);
      expect(updatedAccount?.totalSaldo).toBe(initialAccount!.totalSaldo + 150000);

      // Membership store must also reflect the exact same updated balance
      const member = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001");
      expect(member?.saldoSukarela).toBe(prevSukarela + 150000);
    });

    it("1.4. Transaksi tidak dapat disetujui dua kali (Immutability)", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
      });

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const firstApprove = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);
      expect(firstApprove.success).toBe(true);

      const balanceAfterFirst = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")?.saldoWajib;

      // Second approval attempt must be rejected
      const secondApprove = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);
      expect(secondApprove.success).toBe(false);
      expect(secondApprove.error).toContain("tidak dapat disetujui");

      // Balance must NOT double
      const balanceAfterSecond = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")?.saldoWajib;
      expect(balanceAfterSecond).toBe(balanceAfterFirst);
    });

    it("1.5. Penolakan setoran TIDAK mengubah saldo", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
      });

      const initialAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      const prevWajib = initialAccount!.saldoWajib;

      // Finance Officer rejects with mandatory reason
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const rejectRes = useSavingsStore.getState().rejectTransaction(
        submitRes.transactionId!,
        "Bukti transfer fiktif / tidak ditemukan di rekening koran."
      );

      expect(rejectRes.success).toBe(true);

      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("rejected");
      expect(trx?.rejectionReason).toBe("Bukti transfer fiktif / tidak ditemukan di rekening koran.");

      // Saldo unchanged
      const afterAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      expect(afterAccount?.saldoWajib).toBe(prevWajib);
    });
  });

  describe("2. Withdrawal Lifecycle & Boundary Validation", () => {
    it("2.1. Penarikan yang disetujui mengurangi saldo simpanan sukarela", () => {
      const initialAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      const prevSukarela = initialAccount!.saldoSukarela;
      expect(prevSukarela).toBeGreaterThanOrEqual(100000);

      // Member submits withdrawal request
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitWithdrawal({
        memberDemoId: "DEMO-ID-0001",
        amount: 100000,
        notes: "Kebutuhan mendesak",
      });

      expect(submitRes.success).toBe(true);

      // Treasurer approves withdrawal
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const approveRes = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);
      expect(approveRes.success).toBe(true);

      // Balance reduced
      const updatedAccount = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      expect(updatedAccount?.saldoSukarela).toBe(prevSukarela - 100000);
    });

    it("2.2. Penarikan melebihi saldo sukarela yang tersedia langsung ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const account = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001");
      const available = account!.availableSukarelaWithdrawal;

      // Attempt withdrawal exceeding available balance
      const res = useSavingsStore.getState().submitWithdrawal({
        memberDemoId: "DEMO-ID-0001",
        amount: available + 500000,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Saldo tidak mencukupi");
    });

    it("2.3. Simpanan pokok dan wajib dilarang keras untuk ditarik", () => {
      // Staff attempts to record a withdrawal on Simpanan Wajib or Pokok
      useAuthStore.setState({ currentUser: demoUsers.staff });

      const resWajib = useSavingsStore.getState().recordStaffTransaction({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        transactionType: "withdrawal",
        amount: 50000,
      });
      expect(resWajib.success).toBe(false);
      expect(resWajib.error).toContain("Simpanan Pokok dan Simpanan Wajib tidak dapat ditarik");

      const resPokok = useSavingsStore.getState().recordStaffTransaction({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "pokok",
        transactionType: "withdrawal",
        amount: 100000,
      });
      expect(resPokok.success).toBe(false);
      expect(resPokok.error).toContain("Simpanan Pokok dan Simpanan Wajib tidak dapat ditarik");
    });
  });

  describe("3. Separation of Duties (SoD) & Role Boundaries", () => {
    it("3.1. Pembuat transaksi DILARANG KERAS menyetujui transaksinya sendiri (Creator Cannot Approve)", () => {
      // Finance Officer Ahmad Fauzi creates a deposit transaction for a member
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const createRes = useSavingsStore.getState().recordStaffTransaction({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        transactionType: "deposit",
        amount: 500000,
      });
      expect(createRes.success).toBe(true);

      // Now Ahmad Fauzi attempts to approve his own transaction
      const selfApproveRes = useSavingsStore.getState().approveTransaction(createRes.transactionId!);
      expect(selfApproveRes.success).toBe(false);
      expect(selfApproveRes.error).toContain("Separation of Duties");
      expect(selfApproveRes.error).toContain("dilarang menyetujui transaksi Anda sendiri");

      // But another authorized manager (Hendra Kurniawan) CAN approve it
      useAuthStore.setState({ currentUser: demoUsers.manager });
      const managerApproveRes = useSavingsStore.getState().approveTransaction(createRes.transactionId!);
      expect(managerApproveRes.success).toBe(true);
    });

    it("3.2. Staf operasional DITOLAK saat mencoba memberikan persetujuan final (No Approval Rights)", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
      });

      // Staff Dewi Lestari attempts to approve
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const approveRes = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);
      expect(approveRes.success).toBe(false);
      expect(approveRes.error).toContain("tidak memiliki kewenangan");
    });

    it("3.3. Auditor bersifat MURNI READ-ONLY: dilarang mencatat, memverifikasi, atau menyetujui", () => {
      useAuthStore.setState({ currentUser: demoUsers.auditor });

      const recordRes = useSavingsStore.getState().recordStaffTransaction({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        transactionType: "deposit",
        amount: 100000,
      });
      expect(recordRes.success).toBe(false);

      const reviewRes = useSavingsStore.getState().reviewTransaction("SAV-TRX-2026-0004");
      expect(reviewRes.success).toBe(false);

      const approveRes = useSavingsStore.getState().approveTransaction("SAV-TRX-2026-0004");
      expect(approveRes.success).toBe(false);
    });

    it("3.4. Administrator & Super Admin teknis DITOLAK melakukan transaksi keuangan (IA 5.4 Catatan Kaki 2)", () => {
      useAuthStore.setState({ currentUser: demoUsers.admin });

      const adminRecord = useSavingsStore.getState().recordStaffTransaction({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        transactionType: "deposit",
        amount: 50000,
      });
      expect(adminRecord.success).toBe(false);

      const adminApprove = useSavingsStore.getState().approveTransaction("SAV-TRX-2026-0004");
      expect(adminApprove.success).toBe(false);

      useAuthStore.setState({ currentUser: demoUsers.super_admin });
      const superApprove = useSavingsStore.getState().approveTransaction("SAV-TRX-2026-0004");
      expect(superApprove.success).toBe(false);
    });

    it("3.5. Member hanya dapat mengajukan transaksi atas nama rekening miliknya sendiri", () => {
      // Member Siti Rahma (DEMO-ID-0001) attempts to submit deposit for Dian Pratama (DEMO-ID-0004)
      useAuthStore.setState({ currentUser: demoUsers.member });

      const tamperRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0004", // Tampered ID
        savingsType: "sukarela",
        amount: 100000,
      });

      expect(tamperRes.success).toBe(false);
      expect(tamperRes.error).toContain("Pelanggaran Batas Akses");
    });
  });

  describe("4. Reversal & Audit Correction Flow", () => {
    it("4.1. Pembatalan transaksi yang telah disetujui memulihkan saldo dan mencatat berita acara koreksi", () => {
      // Approve a deposit first
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 300000,
      });

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      const balanceAfterApprove = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")!.saldoSukarela;

      // Staff cannot cancel an approved transaction
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const staffCancel = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Koreksi kesalahan input"
      );
      expect(staffCancel.success).toBe(false);
      expect(staffCancel.error).toContain("savings:adjust");

      // Treasurer / Manager CAN execute reversal correction
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const cancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Berita Acara Koreksi: Pembatalan setoran karena transfer dibatalkan oleh bank pengirim."
      );
      expect(cancelRes.success).toBe(true);

      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("cancelled");
      expect(trx?.cancellationReason).toContain("Berita Acara Koreksi");

      // Balance must be accurately reversed by 300000
      const balanceAfterCancel = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfterCancel).toBe(balanceAfterApprove - 300000);
    });
  });

  describe("5. LocalStorage Persistence, Re-initialization & Corrupted Fallback", () => {
    it("5.1. Transaksi dan konfigurasi sukarela tersimpan ke localStorage", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 75000,
        notes: "Uji persistensi localStorage",
      });

      const raw = localStorage.getItem("kmb_savings_store_v1");
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.transactions.some((t: { id?: string }) => t.id === submitRes.transactionId)).toBe(true);
      expect(parsed.sukarelaConfig).toBeDefined();
    });

    it("5.2. Re-inisialisasi store riil melalui vi.resetModules() memulihkan data transaksi kustom", async () => {
      // 1. Submit custom transaction
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 99000,
      });

      // 2. Simulate fresh browser session / reload
      vi.resetModules();
      const { useSavingsStore: freshStore } = await import(
        "../features/savings/stores/savingsStore"
      );

      // 3. Verify restored instance
      const restoredTrx = freshStore.getState().getTransactionById(submitRes.transactionId!);
      expect(restoredTrx).toBeDefined();
      expect(restoredTrx?.amount).toBe(99000);
      expect(restoredTrx?.savingsType).toBe("sukarela");
    });

    it("5.3. Penanganan data corrupted pada localStorage: fallback aman ke DEFAULT_SUKARELA_CONFIG", async () => {
      // Corrupt sukarela config in localStorage
      localStorage.setItem(
        "kmb_savings_store_v1",
        JSON.stringify({
          products: [],
          sukarelaConfig: { minDeposit: -50000, minWithdrawal: "invalid_string" },
          transactions: [],
        })
      );

      vi.resetModules();
      const { useSavingsStore: safeStore, DEFAULT_SUKARELA_CONFIG: defConfig } = await import(
        "../features/savings/stores/savingsStore"
      );

      expect(safeStore.getState().sukarelaConfig).toEqual(defConfig);
    });

    it("5.4. resetToSeed() memulihkan transaksi dan konfigurasi awal", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 111111,
      });

      useSavingsStore.getState().resetToSeed();

      const raw = localStorage.getItem("kmb_savings_store_v1");
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.transactions.some((t: { amount?: number }) => t.amount === 111111)).toBe(false);
      expect(parsed.transactions.length).toBeGreaterThan(0);
    });
  });

  describe("6. Reporting & Aggregation Integrity", () => {
    it("6.1. Angka laporan simpanan dihitung dinamis dari data aktual", () => {
      const summary = useSavingsStore.getState().getSavingsReportSummary();

      expect(summary.totalSimpananPokok).toBeGreaterThan(0);
      expect(summary.totalSimpananWajib).toBeGreaterThan(0);
      expect(summary.totalSimpananSukarela).toBeGreaterThan(0);
      expect(summary.totalSaldoSimpanan).toBe(
        summary.totalSimpananPokok + summary.totalSimpananWajib + summary.totalSimpananSukarela
      );
      expect(summary.rekapPerAnggota.length).toBe(useMembershipStore.getState().members.length);
      expect(summary.totalTransaksi).toBe(useSavingsStore.getState().transactions.length);
    });
  });
});
