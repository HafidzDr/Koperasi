// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useLoanStore } from "../features/loans/stores/loanStore";
import { useMembershipStore } from "../features/membership/stores/membershipStore";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../lib/rbac";
import { demoUsers } from "../mocks/seedData";

describe("Loan RBAC, Data Privacy & Configuration Tests", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useLoanStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
  });

  describe("1. Canonical RBAC Matrix Compliance (IA Section 5.4)", () => {
    it("1.1. Memverifikasi hak akses domain 'loans' dan 'installments' per peran", () => {
      // Member: hanya melihat dan mencatat permohonan/angsuran miliknya
      expect(hasPermission("member", "loans:view")).toBe(true);
      expect(hasPermission("member", "loans:create")).toBe(true);
      expect(hasPermission("member", "installments:view")).toBe(true);
      expect(hasPermission("member", "installments:record")).toBe(true);
      expect(hasPermission("member", "loans:approve")).toBe(false);
      expect(hasPermission("member", "loans:reject")).toBe(false);
      expect(hasPermission("member", "loans:disburse")).toBe(false);

      // Staff: verifikasi & review & reject operasional
      expect(hasPermission("staff", "loans:review")).toBe(true);
      expect(hasPermission("staff", "loans:reject")).toBe(true);
      expect(hasPermission("staff", "installments:verify")).toBe(true);
      expect(hasPermission("staff", "loans:approve")).toBe(false);
      expect(hasPermission("staff", "loans:disburse")).toBe(false);

      // Finance Officer: analisa, persetujuan Level 2, penolakan, dan pencairan
      expect(hasPermission("finance_officer", "loans:review")).toBe(true);
      expect(hasPermission("finance_officer", "loans:approve")).toBe(true);
      expect(hasPermission("finance_officer", "loans:reject")).toBe(true);
      expect(hasPermission("finance_officer", "loans:disburse")).toBe(true);

      // Treasurer: kewenangan tunggal penyesuaian denda
      expect(hasPermission("treasurer", "installments:adjust")).toBe(true);
      expect(hasPermission("treasurer", "loans:disburse")).toBe(false);

      // Manager: persetujuan Level 3, penolakan, dan pembaruan kebijakan
      expect(hasPermission("manager", "loans:approve")).toBe(true);
      expect(hasPermission("manager", "loans:reject")).toBe(true);
      expect(hasPermission("manager", "product_config:update")).toBe(true);
      expect(hasPermission("manager", "loans:disburse")).toBe(false);

      // Super Admin & Admin: Tidak memiliki izin transaksi/pencairan keuangan
      expect(hasPermission("admin", "loans:create")).toBe(false);
      expect(hasPermission("admin", "loans:disburse")).toBe(false);
      expect(hasPermission("super_admin", "loans:create")).toBe(false);
      expect(hasPermission("super_admin", "loans:disburse")).toBe(false);

      // Auditor: Murni read-only dan export, TANPA kewenangan review, approve, reject, disburse
      expect(hasPermission("auditor", "loans:view")).toBe(true);
      expect(hasPermission("auditor", "installments:view")).toBe(true);
      expect(hasPermission("auditor", "loans:create")).toBe(false);
      expect(hasPermission("auditor", "loans:review")).toBe(false);
      expect(hasPermission("auditor", "loans:approve")).toBe(false);
      expect(hasPermission("auditor", "loans:reject")).toBe(false);
      expect(hasPermission("auditor", "loans:disburse")).toBe(false);
      expect(hasPermission("auditor", "installments:record")).toBe(false);
      expect(hasPermission("auditor", "installments:adjust")).toBe(false);
    });

    it("1.2. Auditor DITOLAK secara ketat pada seluruh aksi mutasi / eksekusi pinjaman", () => {
      useAuthStore.setState({ currentUser: demoUsers.auditor });

      // 1. Submit
      const resSubmit = useLoanStore.getState().submitApplication({
        memberDemoId: "DEMO-ID-0001",
        productType: "konsumtif",
        amount: 5_000_000,
        tenorMonths: 12,
        purpose: "Auditor testing",
        purposeCategory: "Lainnya",
        incomeSource: "Gaji",
      });
      expect(resSubmit.success).toBe(false);

      // 2. Review
      const resReview = useLoanStore.getState().reviewApplication("PJ-2026-0026");
      expect(resReview.success).toBe(false);

      // 3. Recommend
      const resRecommend = useLoanStore.getState().recommendApplication("PJ-2026-0027");
      expect(resRecommend.success).toBe(false);

      // 4. Approve
      const resApprove = useLoanStore.getState().approveApplication("PJ-2026-0028");
      expect(resApprove.success).toBe(false);

      // 5. Reject
      const resReject = useLoanStore.getState().rejectApplication("PJ-2026-0026", "Alasan auditor");
      expect(resReject.success).toBe(false);

      // 6. Disburse
      const resDisburse = useLoanStore.getState().disburseLoan("PJ-2026-0028");
      expect(resDisburse.success).toBe(false);

      // 7. Record payment
      const resPay = useLoanStore.getState().recordInstallmentPayment({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        amountPaid: 100_000,
      });
      expect(resPay.success).toBe(false);

      // 8. Early repayment
      const resEarly = useLoanStore.getState().executeEarlyRepayment("PJ-2026-0001");
      expect(resEarly.success).toBe(false);

      // 9. Adjust late fee
      const resAdj = useLoanStore.getState().adjustInstallmentLateFee({
        loanId: "PJ-2026-0013",
        installmentNumber: 3,
        waiveFee: true,
        reason: "Auditor tidak berwenang",
      });
      expect(resAdj.success).toBe(false);
    });
  });

  describe("2. Member Data Privacy & Isolation", () => {
    it("2.1. getMemberLoans hanya mengembalikan pinjaman milik anggota yang bersangkutan", () => {
      // Siti Rahma (DEMO-ID-0001)
      const sitiLoans = useLoanStore.getState().getMemberLoans("DEMO-ID-0001");
      expect(sitiLoans.length).toBeGreaterThan(0);
      sitiLoans.forEach((l) => {
        expect(l.memberDemoId).toBe("DEMO-ID-0001");
        expect(l.memberName).toBe("Siti Rahma");
      });

      // Budi Santoso (DEMO-ID-0002)
      const budiLoans = useLoanStore.getState().getMemberLoans("DEMO-ID-0002");
      expect(budiLoans.length).toBeGreaterThan(0);
      budiLoans.forEach((l) => {
        expect(l.memberDemoId).toBe("DEMO-ID-0002");
        expect(l.memberName).toBe("Budi Santoso");
      });

      // Anggota tanpa pinjaman tidak menampilkan pinjaman anggota lain
      const unknownLoans = useLoanStore.getState().getMemberLoans("DEMO-ID-UNKNOWN");
      expect(unknownLoans).toHaveLength(0);
    });
  });

  describe("3. System Configuration Management & Audit History", () => {
    it("3.1. Pengurus/Manajer dapat memperbarui konfigurasi kebijakan pinjaman dan mencatatnya di audit history", () => {
      useAuthStore.setState({ currentUser: demoUsers.manager });

      const res = useLoanStore.getState().updateSystemConfig(
        {
          gracePeriodDays: 5,
          lateFeeDailyPct: 0.3,
          approvalThresholdFoMax: 15_000_000,
        },
        "Penyesuaian relaksasi likuiditas triwulan II"
      );

      expect(res.success).toBe(true);

      const updatedConfig = useLoanStore.getState().systemConfig;
      expect(updatedConfig.gracePeriodDays).toBe(5);
      expect(updatedConfig.lateFeeDailyPct).toBe(0.3);
      expect(updatedConfig.approvalThresholdFoMax).toBe(15_000_000);

      const history = useLoanStore.getState().configHistory;
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].actorName).toBe("Hendra Kurniawan");
      expect(history[0].notes).toContain("Penyesuaian relaksasi likuiditas");
    });

    it("3.2. Menolak pembaruan konfigurasi oleh peran yang tidak berwenang (e.g. Staf, Member)", () => {
      useAuthStore.setState({ currentUser: demoUsers.staff });

      const res = useLoanStore.getState().updateSystemConfig({
        gracePeriodDays: 10,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("tidak memiliki kewenangan");
    });
  });
});
