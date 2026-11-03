// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useSavingsStore } from "../features/savings/stores/savingsStore";
import { SukarelaConfig } from "../features/savings/types";
import {
  useMembershipStore,
  setSavingsTransactionResolver,
} from "../features/membership/stores/membershipStore";
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

      // Mandatory verification by staff
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const reviewRes = useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      expect(reviewRes.success).toBe(true);

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

      // Verification by staff
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

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

      // Verification by staff
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

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

      // Staff verifies withdrawal request
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

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

      // Dewi Lestari (staff) verifies the transaction to under_review
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const reviewRes = useSavingsStore.getState().reviewTransaction(createRes.transactionId!);
      expect(reviewRes.success).toBe(true);

      // Now Ahmad Fauzi attempts to approve his own transaction
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
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

      // Review by staff
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

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

  describe("7. Transaction Cancellation Authorization (P0)", () => {
    it("7.1. Member A tidak dapat membatalkan transaksi pengajuan Member B", () => {
      // Member B (Dian Pratama / DEMO-ID-0007) submits a deposit
      useAuthStore.setState({
        currentUser: {
          id: "user-member-02",
          memberId: "DEMO-ID-0007",
          name: "Dian Pratama",
          email: "dian@email.invalid",
          role: "member",
          roleName: "Anggota",
        },
      });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0007",
        savingsType: "sukarela",
        amount: 80000,
      });
      expect(submitRes.success).toBe(true);

      // Member A (Siti Rahma / DEMO-ID-0001) attempts to cancel Member B's transaction
      useAuthStore.setState({ currentUser: demoUsers.member });
      const cancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Percobaan pembatalan transaksi orang lain"
      );

      expect(cancelRes.success).toBe(false);
      expect(cancelRes.error).toContain("Otorisasi Ditolak");

      // Verify transaction remains submitted
      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("submitted");
    });

    it("7.2. Member A dapat membatalkan pengajuannya sendiri saat masih submitted", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 60000,
      });

      const cancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Batal ingin menabung saat ini"
      );

      expect(cancelRes.success).toBe(true);
      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("cancelled");
      expect(trx?.cancellationReason).toBe("Batal ingin menabung saat ini");
    });

    it("7.3. Member tidak dapat membatalkan transaksi yang sudah under_review", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 70000,
      });

      // Staff verifies to under_review
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      // Member attempts to cancel
      useAuthStore.setState({ currentUser: demoUsers.member });
      const cancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Ingin membatalkan saat proses verifikasi"
      );

      expect(cancelRes.success).toBe(false);
      expect(cancelRes.error).toContain("tahap verifikasi (under_review)");
      expect(cancelRes.error).toContain("tidak dapat dibatalkan mandiri");

      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("under_review");
    });

    it("7.4. Staff operasional tanpa izin savings:adjust tidak dapat membatalkan transaksi", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 50000,
      });

      // Staff attempts administrative cancellation
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const cancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Pembatalan sepihak oleh staf"
      );

      expect(cancelRes.success).toBe(false);
      expect(cancelRes.error).toContain("savings:adjust");
    });

    it("7.5. Pengunjung publik tidak dapat membatalkan transaksi", () => {
      useAuthStore.setState({ currentUser: demoUsers.public_visitor });
      const cancelRes = useSavingsStore.getState().cancelTransaction(
        "SAV-TRX-2026-0001",
        "Pembatalan tamu"
      );

      expect(cancelRes.success).toBe(false);
      expect(cancelRes.error).toContain("savings:adjust");
    });

    it("7.6. Approved transaction reversal memerlukan hak savings:adjust (hanya Bendahara / Treasurer)", () => {
      // Setup approved transaction
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 250000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      // Finance officer has approve/reject but NOT adjust
      const foCancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Koreksi FO"
      );
      expect(foCancelRes.success).toBe(false);
      expect(foCancelRes.error).toContain("savings:adjust");

      // Manager has approve/reject but NOT adjust (per BUSINESS_RULES.md)
      useAuthStore.setState({ currentUser: demoUsers.manager });
      const managerCancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Koreksi Manager"
      );
      expect(managerCancelRes.success).toBe(false);
      expect(managerCancelRes.error).toContain("savings:adjust");

      // Treasurer HAS adjust permission
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const treasurerCancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Koreksi resmi Bendahara: mutasi dibatalkan bank."
      );
      expect(treasurerCancelRes.success).toBe(true);

      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("cancelled");
      expect(trx?.isReversed).toBe(true);
    });

    it("7.7. Pembalikan (reversal) transaksi yang sama tidak dapat dilakukan dua kali", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 200000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const firstCancel = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Reversal pertama"
      );
      expect(firstCancel.success).toBe(true);

      // Second attempt must fail
      const secondCancel = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Reversal kedua"
      );
      expect(secondCancel.success).toBe(false);
      expect(secondCancel.error).toContain("tidak dapat dibatalkan ulang");
    });

    it("7.8. Pembatalan transaksi fiktif/tidak ditemukan mengembalikan error informatif", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const res = useSavingsStore.getState().cancelTransaction(
        "NON-EXISTENT-TRX",
        "Alasan pembatalan"
      );
      expect(res.success).toBe(false);
      expect(res.error).toBe("Transaksi simpanan tidak ditemukan.");
    });
  });

  describe("8. Mandatory Verification Before Approval (P1)", () => {
    it("8.1. Approval terhadap transaksi berstatus submitted harus gagal", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
      });

      // Finance officer attempts direct approval without verification
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const approveRes = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      expect(approveRes.success).toBe(false);
      expect(approveRes.error).toContain("wajib diverifikasi terlebih dahulu");
      expect(approveRes.error).toContain("status harus under_review");

      // Balance remains unchanged
      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("submitted");
    });

    it("8.2. Rejection terhadap transaksi berstatus submitted harus gagal", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
      });

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const rejectRes = useSavingsStore.getState().rejectTransaction(
        submitRes.transactionId!,
        "Penolakan langsung"
      );

      expect(rejectRes.success).toBe(false);
      expect(rejectRes.error).toContain("wajib melalui pemeriksaan berkas terlebih dahulu");
      expect(rejectRes.error).toContain("under_review");
    });

    it("8.3. Verifikasi oleh staf terhadap submitted berhasil mengubah status menjadi under_review", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      const reviewRes = useSavingsStore.getState().reviewTransaction(
        submitRes.transactionId!,
        "Bukti slip setoran valid"
      );

      expect(reviewRes.success).toBe(true);

      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("under_review");
      expect(trx?.reviewedByRole).toBe("staff");
      expect(trx?.reviewedByName).toBe("Dewi Lestari");
    });

    it("8.4. Approval terhadap transaksi under_review oleh role berwenang berhasil", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const approveRes = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);
      expect(approveRes.success).toBe(true);

      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("approved");
    });

    it("8.5. Approval oleh role tanpa permission (misal staff) gagal", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      const staffApprove = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);
      expect(staffApprove.success).toBe(false);
      expect(staffApprove.error).toContain("tidak memiliki kewenangan");
    });

    it("8.6. Verifikasi oleh role tanpa permission (misal member atau auditor) gagal", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        amount: 50000,
      });

      const memberVerify = useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      expect(memberVerify.success).toBe(false);
      expect(memberVerify.error).toContain("tidak memiliki izin verifikasi");

      useAuthStore.setState({ currentUser: demoUsers.auditor });
      const auditorVerify = useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      expect(auditorVerify.success).toBe(false);
      expect(auditorVerify.error).toContain("tidak memiliki izin verifikasi");
    });

    it("8.7. Pembuat transaksi tidak dapat memverifikasi atau menyetujui transaksinya sendiri (SoD)", () => {
      // Staff Dewi Lestari records transaction
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const recordRes = useSavingsStore.getState().recordStaffTransaction({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "wajib",
        transactionType: "deposit",
        amount: 50000,
      });
      expect(recordRes.success).toBe(true);

      // Staff Dewi Lestari attempts to verify her own transaction -> MUST FAIL
      const selfVerifyRes = useSavingsStore.getState().reviewTransaction(recordRes.transactionId!);
      expect(selfVerifyRes.success).toBe(false);
      expect(selfVerifyRes.error).toContain("SoD");
      expect(selfVerifyRes.error).toContain("pembuat transaksi");
    });
  });

  describe("9. Store-Level Configuration Validation & Audit History (P1)", () => {
    it("9.1. Nilai konfigurasi valid berhasil disimpan dan tercatat pada configHistory", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const updateRes = useSavingsStore.getState().updateSukarelaConfig({
        minDeposit: 15000,
        minWithdrawal: 25000,
        minBalance: 15000,
        interestRatePct: 2.5,
      });

      expect(updateRes.success).toBe(true);
      const cfg = useSavingsStore.getState().sukarelaConfig;
      expect(cfg.minDeposit).toBe(15000);
      expect(cfg.minWithdrawal).toBe(25000);
      expect(cfg.minBalance).toBe(15000);
      expect(cfg.interestRatePct).toBe(2.5);

      const history = useSavingsStore.getState().configHistory;
      expect(history.length).toBeGreaterThanOrEqual(1);
      expect(history[0].actorRole).toBe("treasurer");
      expect(history[0].actorName).toBe("Sri Mulyani");
      expect(history[0].newConfig.minDeposit).toBe(15000);
    });

    it("9.2. Nilai negatif ditolak dan konfigurasi tidak berubah", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const prevCfg = { ...useSavingsStore.getState().sukarelaConfig };

      const res = useSavingsStore.getState().updateSukarelaConfig({
        minDeposit: -10000,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("positif");
      expect(useSavingsStore.getState().sukarelaConfig).toEqual(prevCfg);
    });

    it("9.3. Nilai pecahan Rupiah (desimal) ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const prevCfg = { ...useSavingsStore.getState().sukarelaConfig };

      const res = useSavingsStore.getState().updateSukarelaConfig({
        minWithdrawal: 25000.75,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("bilangan bulat Rupiah");
      expect(useSavingsStore.getState().sukarelaConfig).toEqual(prevCfg);
    });

    it("9.4. NaN dan Infinity ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const prevCfg = { ...useSavingsStore.getState().sukarelaConfig };

      const nanRes = useSavingsStore.getState().updateSukarelaConfig({
        minDeposit: NaN,
      });
      expect(nanRes.success).toBe(false);

      const infRes = useSavingsStore.getState().updateSukarelaConfig({
        interestRatePct: Infinity,
      });
      expect(infRes.success).toBe(false);
      expect(useSavingsStore.getState().sukarelaConfig).toEqual(prevCfg);
    });

    it("9.5. Nilai kosong, null, atau string kosong ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const prevCfg = { ...useSavingsStore.getState().sukarelaConfig };

      const emptyRes = useSavingsStore.getState().updateSukarelaConfig({
        minDeposit: "",
      } as unknown as Partial<SukarelaConfig>);
      expect(emptyRes.success).toBe(false);
      expect(useSavingsStore.getState().sukarelaConfig).toEqual(prevCfg);
    });

    it("9.6. Pembaruan konfigurasi yang gagal tidak tersimpan ke localStorage", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const rawBefore = localStorage.getItem("kmb_savings_store_v1");

      useSavingsStore.getState().updateSukarelaConfig({
        minDeposit: -999999,
      });

      const rawAfter = localStorage.getItem("kmb_savings_store_v1");
      expect(rawAfter).toBe(rawBefore);
    });

    it("9.7. Perubahan parameter produk tidak secara retroaktif mengubah transaksi historis atau saldo anggota", () => {
      const prevSaldo = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")?.totalSaldo;
      const prevTransactions = [...useSavingsStore.getState().transactions];

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      useSavingsStore.getState().updateSukarelaConfig({
        minDeposit: 50000,
        minWithdrawal: 100000,
      });

      const afterSaldo = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")?.totalSaldo;
      expect(afterSaldo).toBe(prevSaldo);
      expect(useSavingsStore.getState().transactions).toEqual(prevTransactions);
    });
  });

  describe("10. Balance Reversal & Ledger Integrity (P1)", () => {
    it("10.1. Reversal setoran yang dananya masih utuh berhasil mengembalikan saldo", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 200000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      const balanceBeforeReversal = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")!.saldoSukarela;

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const reversalRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Koreksi pembalikan setoran valid"
      );

      expect(reversalRes.success).toBe(true);
      const balanceAfterReversal = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfterReversal).toBe(balanceBeforeReversal - 200000);
    });

    it("10.2. Reversal setoran yang dananya sudah terpakai/ditarik ditolak jika saldo tidak mencukupi", () => {
      // Create new member account with low balance
      const member = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0008");
      expect(member).toBeDefined();

      // Submit and approve deposit of 500.000
      useAuthStore.setState({
        currentUser: {
          id: "user-member-03",
          memberId: "DEMO-ID-0008",
          name: member!.fullName,
          email: member!.email,
          role: "member",
          roleName: "Anggota",
        },
      });
      const depositRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0008",
        savingsType: "sukarela",
        amount: 500000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(depositRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(depositRes.transactionId!);

      // Now member withdraws most of the sukarela funds
      useAuthStore.setState({
        currentUser: {
          id: "user-member-03",
          memberId: "DEMO-ID-0008",
          name: member!.fullName,
          email: member!.email,
          role: "member",
          roleName: "Anggota",
        },
      });
      const account = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0008")!;
      const withdrawAmt = account.availableSukarelaWithdrawal;
      const wdlRes = useSavingsStore.getState().submitWithdrawal({
        memberDemoId: "DEMO-ID-0008",
        amount: withdrawAmt,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(wdlRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      useSavingsStore.getState().approveTransaction(wdlRes.transactionId!);

      // Now saldoSukarela has only minBalance left (e.g. 10.000).
      const currentSukarela = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0008")!.saldoSukarela;
      expect(currentSukarela).toBeLessThan(500000);

      // Attempt reversal of the 500.000 deposit -> MUST BE REJECTED (would yield negative balance)
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const failedReversal = useSavingsStore.getState().cancelTransaction(
        depositRes.transactionId!,
        "Percobaan reversal setoran saat saldo tidak cukup"
      );

      expect(failedReversal.success).toBe(false);
      expect(failedReversal.error).toContain("Pembalikan transaksi ditolak");
      expect(failedReversal.error).toContain("tidak mencukupi");

      // Transaction status must remain approved
      const depositTrx = useSavingsStore.getState().getTransactionById(depositRes.transactionId!);
      expect(depositTrx?.status).toBe("approved");

      // Balance must NOT be negative and must NOT be forced to 0
      const accountAfterFailed = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0008")!;
      expect(accountAfterFailed.saldoSukarela).toBe(currentSukarela);
      expect(accountAfterFailed.saldoSukarela).toBeGreaterThanOrEqual(0);
    });

    it("10.3. Reversal penarikan (withdrawal) mengembalikan saldo simpanan tepat satu kali", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const wdlRes = useSavingsStore.getState().submitWithdrawal({
        memberDemoId: "DEMO-ID-0001",
        amount: 100000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(wdlRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      useSavingsStore.getState().approveTransaction(wdlRes.transactionId!);

      const balanceBeforeWdlCancel = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")!.saldoSukarela;

      // Reversal of withdrawal restores funds to member
      const cancelWdlRes = useSavingsStore.getState().cancelTransaction(
        wdlRes.transactionId!,
        "Koreksi penarikan dibatalkan"
      );
      expect(cancelWdlRes.success).toBe(true);

      const balanceAfterWdlCancel = useSavingsStore.getState().getMemberSavingsAccount("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfterWdlCancel).toBe(balanceBeforeWdlCancel + 100000);

      // Re-cancellation must fail
      const repeatCancel = useSavingsStore.getState().cancelTransaction(
        wdlRes.transactionId!,
        "Percobaan pembatalan berulang"
      );
      expect(repeatCancel.success).toBe(false);
    });
  });

  describe("11. Phase 4.2 — Final Balance Mutation Authorization & Ledger Protection", () => {
    beforeEach(() => {
      useSavingsStore.getState().resetToSeed();
      useMembershipStore.getState().resetToSeed();
    });

    it("11.1. Member tidak dapat memanggil mutasi saldo langsung", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 100000 }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak memiliki kewenangan otorisasi saldo");
    });

    it("11.2. Staff tanpa permission tidak dapat memanggil mutasi saldo langsung", () => {
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 100000 }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak memiliki kewenangan otorisasi saldo");
    });

    it("11.3. Auditor, Admin, dan Super Admin ditolak dari mutasi saldo langsung", () => {
      for (const user of [demoUsers.auditor, demoUsers.admin, demoUsers.super_admin]) {
        useAuthStore.setState({ currentUser: user });
        const res = useMembershipStore.getState().adjustMemberBalances(
          "DEMO-ID-0001",
          { sukarela: 100000 }
        );
        expect(res.success).toBe(false);
        expect(res.error).toContain("tidak memiliki kewenangan otorisasi saldo");
      }
    });

    it("11.4. Aktor berwenang tidak dapat memasukkan delta arbitrer tanpa transaksi sah", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });

      // Call without transaction context
      const noTrxRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 500000 }
      );
      expect(noTrxRes.success).toBe(false);
      expect(noTrxRes.error).toContain("Perubahan saldo wajib dikaitkan dengan transaksi simpanan yang sah");

      // Call with non-existent transactionId
      const fakeTrxRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 500000 },
        { transactionId: "TRX-FAKE-9999" }
      );
      expect(fakeTrxRes.success).toBe(false);
      expect(fakeTrxRes.error).toContain("tidak ditemukan");

      // Setup a real transaction for DEMO-ID-0001 of 100.000 in 'under_review' status
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 100000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      // Call with arbitrary delta (e.g. 999.000 instead of 100.000)
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const mismatchRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 999000 },
        { transactionId: submitRes.transactionId! }
      );
      expect(mismatchRes.success).toBe(false);
      expect(mismatchRes.error).toContain("tidak konsisten dengan transaksi");
    });

    it("11.5. Delta negatif yang menghasilkan saldo negatif ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const currentSukarela = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -(currentSukarela + 50000) }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("menghasilkan nilai negatif");
    });

    it("11.6. Delta pecahan, NaN, dan Infinity ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });

      // NaN
      const nanRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: NaN }
      );
      expect(nanRes.success).toBe(false);
      expect(nanRes.error).toContain("berupa angka berhingga");

      // Infinity
      const infRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: Infinity }
      );
      expect(infRes.success).toBe(false);
      expect(infRes.error).toContain("berupa angka berhingga");

      // Decimal (fractional Rupiah)
      const decimalRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 150000.75 }
      );
      expect(decimalRes.success).toBe(false);
      expect(decimalRes.error).toContain("bilangan bulat Rupiah");

      // All zeroes
      const zeroRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 0, pokok: 0, wajib: 0 }
      );
      expect(zeroRes.success).toBe(false);
      expect(zeroRes.error).toContain("tidak boleh bernilai nol");
    });

    it("11.7. Kegagalan mutasi tidak mengubah state maupun localStorage", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const initialMember = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!;
      const initialSukarela = initialMember.saldoSukarela;
      const initialStorage = localStorage.getItem("kmb_membership_store_v1");

      // Attempt invalid mutation
      const failRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 99999999 }
      );
      expect(failRes.success).toBe(false);

      const afterMember = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!;
      expect(afterMember.saldoSukarela).toBe(initialSukarela);
      expect(localStorage.getItem("kmb_membership_store_v1")).toBe(initialStorage);
    });

    it("11.8. Approval transaksi yang sah tetap memperbarui saldo tepat satu kali", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 300000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      const balanceBefore = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const approveRes = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);
      expect(approveRes.success).toBe(true);

      const balanceAfter = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfter).toBe(balanceBefore + 300000);

      // Repeat approval must fail
      const repeatApprove = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);
      expect(repeatApprove.success).toBe(false);
      expect(useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela).toBe(balanceAfter);
    });

    it("11.9. Reversal oleh Treasurer tetap berhasil jika saldo mencukupi", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 150000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      const balanceBeforeReversal = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const cancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Pembatalan sah oleh Bendahara"
      );
      expect(cancelRes.success).toBe(true);

      const balanceAfterReversal = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfterReversal).toBe(balanceBeforeReversal - 150000);
    });

    it("11.10. Reversal oleh Manager ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 150000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      const balanceBefore = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      useAuthStore.setState({ currentUser: demoUsers.manager });
      const cancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Koreksi oleh Manager"
      );
      expect(cancelRes.success).toBe(false);
      expect(cancelRes.error).toContain("savings:adjust");
      expect(cancelRes.error).toContain("Hanya Bendahara");

      const balanceAfter = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfter).toBe(balanceBefore);
    });

    it("11.11. Reversal oleh Finance Officer ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 150000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.manager });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const cancelRes = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Koreksi oleh FO"
      );
      expect(cancelRes.success).toBe(false);
      expect(cancelRes.error).toContain("savings:adjust");
      expect(cancelRes.error).toContain("Hanya Bendahara");
    });

    it("11.12. Reversal ganda ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 150000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const cancelRes1 = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Koreksi 1"
      );
      expect(cancelRes1.success).toBe(true);

      const cancelRes2 = useSavingsStore.getState().cancelTransaction(
        submitRes.transactionId!,
        "Koreksi 2 (berulang)"
      );
      expect(cancelRes2.success).toBe(false);
      expect(cancelRes2.error).toContain("tidak dapat dibatalkan ulang");
    });
  });

  describe("12. Phase 4.3 — Transaction State Enforcement & Balance Mutation Idempotency", () => {
    beforeEach(() => {
      useSavingsStore.getState().resetToSeed();
      useMembershipStore.getState().resetToSeed();
    });

    it("12.1. Mutasi normal dengan transaksi submitted ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 200000,
      });

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 200000 },
        { transactionId: submitRes.transactionId!, isReversal: false }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("submitted");
      expect(res.error).toContain("under_review");
    });

    it("12.2. Mutasi normal dengan transaksi approved ditolak", () => {
      // SAV-TRX-2026-0001 is already approved in seed
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { pokok: 100000 },
        { transactionId: "SAV-TRX-2026-0001", isReversal: false }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("approved");
    });

    it("12.3. Mutasi normal dengan transaksi rejected ditolak", () => {
      // SAV-TRX-2026-0008 is rejected in seed (member: DEMO-ID-0009, amount: 50000)
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0009",
        { sukarela: 50000 },
        { transactionId: "SAV-TRX-2026-0008", isReversal: false }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("rejected");
    });

    it("12.4. Mutasi normal dengan transaksi cancelled ditolak", () => {
      // Create and cancel a submitted transaction
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 100000,
      });
      useSavingsStore.getState().cancelTransaction(submitRes.transactionId!, "Batal mandiri");

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 100000 },
        { transactionId: submitRes.transactionId!, isReversal: false }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("cancelled");
    });

    it("12.5. Mutasi normal dengan transaksi under_review yang sah berhasil tepat satu kali", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 250000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      const balanceBefore = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 250000 },
        { transactionId: submitRes.transactionId!, isReversal: false }
      );
      expect(res.success).toBe(true);

      const balanceAfter = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfter).toBe(balanceBefore + 250000);
      expect(useMembershipStore.getState().processedSavingsTransactions).toContain(submitRes.transactionId!);
    });

    it("12.6. Pemanggilan ulang mutasi normal dengan ID transaksi yang sama ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 250000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res1 = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 250000 },
        { transactionId: submitRes.transactionId!, isReversal: false }
      );
      expect(res1.success).toBe(true);

      const balanceAfterFirst = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      // Repeat mutation call with same transaction ID
      const res2 = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 250000 },
        { transactionId: submitRes.transactionId!, isReversal: false }
      );
      expect(res2.success).toBe(false);
      expect(res2.error).toContain("telah diproses sebelumnya");

      const balanceAfterSecond = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfterSecond).toBe(balanceAfterFirst);
    });

    it("12.7. Reversal terhadap transaksi submitted ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 100000,
      });

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -100000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("approved");
    });

    it("12.8. Reversal terhadap transaksi under_review ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 100000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -100000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("approved");
    });

    it("12.9. Reversal terhadap transaksi rejected ditolak", () => {
      // Create a transaction, review it, and reject it
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 50000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.manager });
      useSavingsStore.getState().rejectTransaction(submitRes.transactionId!, "Berkas ditolak");

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -50000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("approved");
      expect(res.error).toContain("rejected");
    });

    it("12.10. Reversal terhadap transaksi cancelled ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 100000,
      });
      useSavingsStore.getState().cancelTransaction(submitRes.transactionId!, "Batal mandiri");

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -100000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("approved");
    });

    it("12.11. Reversal terhadap transaksi approved yang sudah memiliki mutasi normal berhasil tepat satu kali oleh Treasurer", () => {
      // Complete normal lifecycle first
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 180000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      const balanceBefore = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -180000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(res.success).toBe(true);

      const balanceAfter = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfter).toBe(balanceBefore - 180000);
      expect(useMembershipStore.getState().reversedSavingsTransactions).toContain(submitRes.transactionId!);
    });

    it("12.12. Pemanggilan ulang reversal dengan ID transaksi yang sama ditolak", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 180000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const res1 = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -180000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(res1.success).toBe(true);

      const balanceAfterFirst = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      const res2 = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -180000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(res2.success).toBe(false);
      expect(res2.error).toContain("telah dibalikkan sebelumnya");

      const balanceAfterSecond = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfterSecond).toBe(balanceAfterFirst);
    });

    it("12.13. Manager dan Finance Officer tetap tidak dapat melakukan reversal", () => {
      // Setup approved transaction
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 100000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      // Finance Officer attempts reversal
      const foRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -100000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(foRes.success).toBe(false);
      expect(foRes.error).toContain("savings:adjust");

      // Manager attempts reversal
      useAuthStore.setState({ currentUser: demoUsers.manager });
      const mgrRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -100000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(mgrRes.success).toBe(false);
      expect(mgrRes.error).toContain("savings:adjust");
    });

    it("12.14. Kegagalan mutasi tidak mengubah saldo, state, maupun localStorage", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const memberBefore = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!;
      const stateBeforeJson = JSON.stringify(useMembershipStore.getState().members);
      const storageBefore = localStorage.getItem("kmb_membership_store_v1");

      // Attempt invalid reversal on submitted transaction
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 100000,
      });

      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const failRes = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: -100000 },
        { transactionId: submitRes.transactionId!, isReversal: true }
      );
      expect(failRes.success).toBe(false);

      const memberAfter = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!;
      expect(memberAfter.saldoSukarela).toBe(memberBefore.saldoSukarela);
      expect(JSON.stringify(useMembershipStore.getState().members)).toBe(stateBeforeJson);
      expect(localStorage.getItem("kmb_membership_store_v1")).toBe(storageBefore);
    });

    it("12.15. Approval yang sah tetap bekerja melalui alur verifikasi dan persetujuan yang sudah ada", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 500000,
      });

      const balanceBefore = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      useAuthStore.setState({ currentUser: demoUsers.staff });
      const revRes = useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      expect(revRes.success).toBe(true);

      useAuthStore.setState({ currentUser: demoUsers.manager });
      const appRes = useSavingsStore.getState().approveTransaction(submitRes.transactionId!);
      expect(appRes.success).toBe(true);

      const balanceAfter = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfter).toBe(balanceBefore + 500000);

      const trx = useSavingsStore.getState().getTransactionById(submitRes.transactionId!);
      expect(trx?.status).toBe("approved");
    });

    it("12.16. Reset demo menghapus catatan pemrosesan transaksi dan memulihkan saldo seed secara konsisten", () => {
      // Apply a transaction
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 200000,
      });
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      useSavingsStore.getState().approveTransaction(submitRes.transactionId!);

      expect(useMembershipStore.getState().processedSavingsTransactions).toContain(submitRes.transactionId!);

      // Reset both stores
      useSavingsStore.getState().resetToSeed();
      useMembershipStore.getState().resetToSeed();

      expect(useMembershipStore.getState().processedSavingsTransactions).toEqual([
        "SAV-TRX-2026-0001",
        "SAV-TRX-2026-0002",
        "SAV-TRX-2026-0003",
        "SAV-TRX-2026-0006",
      ]);
      expect(useMembershipStore.getState().reversedSavingsTransactions).toEqual([]);
      expect(useMembershipStore.getState().processedSavingsTransactions).not.toContain(submitRes.transactionId!);
    });
  });

  describe("13. Phase 4.4 — Fail-Closed Transaction Resolver", () => {
    beforeEach(() => {
      useSavingsStore.getState().resetToSeed();
      useMembershipStore.getState().resetToSeed();
      // Ensure default resolver is active
      setSavingsTransactionResolver((trxId: string) => {
        return useSavingsStore.getState().transactions.find((t) => t.id === trxId);
      });
    });

    afterEach(() => {
      // Restore default resolver
      setSavingsTransactionResolver((trxId: string) => {
        return useSavingsStore.getState().transactions.find((t) => t.id === trxId);
      });
    });

    it("13.1. Resolver terdaftar dan menemukan transaksi: transaksi dapat divalidasi sesuai aturan yang berlaku", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });
      const submitRes = useSavingsStore.getState().submitDeposit({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        amount: 250000,
      });

      useAuthStore.setState({ currentUser: demoUsers.staff });
      useSavingsStore.getState().reviewTransaction(submitRes.transactionId!);

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 250000 },
        { transactionId: submitRes.transactionId!, isReversal: false }
      );
      expect(res.success).toBe(true);
      expect(useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela).toBeGreaterThan(0);
    });

    it("13.2. Resolver terdaftar tetapi mengembalikan undefined, sementara localStorage masih memiliki transaksi dengan ID yang sama: mutasi ditolak (Fail-Closed)", () => {
      // Mock transaction saved in localStorage
      const mockTrxId = "TRX-ORPHAN-001";
      localStorage.setItem(
        "kmb_savings_store_v1",
        JSON.stringify({
          transactions: [
            {
              id: mockTrxId,
              memberDemoId: "DEMO-ID-0001",
              transactionType: "deposit",
              savingsType: "sukarela",
              amount: 100000,
              status: "under_review",
              createdById: "user-member-01",
            },
          ],
        })
      );

      // Resolver is registered, but returns undefined for mockTrxId (e.g. transaction deleted from memory store)
      setSavingsTransactionResolver((_id: string) => undefined);

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 100000 },
        { transactionId: mockTrxId, isReversal: false }
      );

      // Must be FAIL-CLOSED: do not fallback to localStorage when resolver is registered
      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak ditemukan");
    });

    it("13.3. Transaksi yang tidak ditemukan tidak mengubah saldo, state, catatan idempotensi, maupun localStorage", () => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
      const memberBefore = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!;
      const balanceBefore = memberBefore.saldoSukarela;
      const processedBefore = [...useMembershipStore.getState().processedSavingsTransactions];
      const storageBefore = localStorage.getItem("kmb_membership_store_v1");

      // Set mock resolver returning undefined
      setSavingsTransactionResolver((_id: string) => undefined);

      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 100000 },
        { transactionId: "TRX-NONEXISTENT", isReversal: false }
      );
      expect(res.success).toBe(false);

      const memberAfter = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!;
      expect(memberAfter.saldoSukarela).toBe(balanceBefore);
      expect(useMembershipStore.getState().processedSavingsTransactions).toEqual(processedBefore);
      expect(localStorage.getItem("kmb_membership_store_v1")).toBe(storageBefore);
    });

    it("13.4. Resolver belum terdaftar (null): perilaku fallback ke localStorage tetap berjalan", () => {
      // Un-register resolver
      setSavingsTransactionResolver(null);

      const fallbackTrxId = "TRX-FALLBACK-STORAGE-99";
      localStorage.setItem(
        "kmb_savings_store_v1",
        JSON.stringify({
          transactions: [
            {
              id: fallbackTrxId,
              memberDemoId: "DEMO-ID-0001",
              transactionType: "deposit",
              savingsType: "sukarela",
              amount: 150000,
              status: "under_review",
              createdById: "user-member-01",
            },
          ],
        })
      );

      const balanceBefore = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;

      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res = useMembershipStore.getState().adjustMemberBalances(
        "DEMO-ID-0001",
        { sukarela: 150000 },
        { transactionId: fallbackTrxId, isReversal: false }
      );

      // Fallback succeeds because resolver is null
      expect(res.success).toBe(true);
      const balanceAfter = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001")!.saldoSukarela;
      expect(balanceAfter).toBe(balanceBefore + 150000);
      expect(useMembershipStore.getState().processedSavingsTransactions).toContain(fallbackTrxId);
    });
  });
});
