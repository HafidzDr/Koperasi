import { describe, it, expect, beforeEach } from "vitest";
import { useMembershipStore } from "../features/membership/stores/membershipStore";
import { Role } from "../types";

describe("PHASE 3 — Membership Management Lifecycle & SoD Verification", () => {
  beforeEach(() => {
    // Reset Zustand store to clean initial seed data before each test
    useMembershipStore.getState().resetToSeed();
  });

  describe("1. Application Submission (Public / Applicant)", () => {
    it("should create application with status 'submitted' and valid tracking code", () => {
      const newApp = useMembershipStore.getState().submitApplication({
        fullName: "Khadijah Al-Zahra",
        demoId: "DEMO-ID-0099",
        email: "khadijah@email.invalid",
        phone: "0812-9988-7766 (Simulasi)",
        city: "Jakarta Timur",
        address: "Jl. Pemuda No. 12, Rawamangun",
        occupation: "Pengrajin Batik Tradisional",
        simpananPokokConfirmed: true,
        simpananWajibConfirmed: true,
        adArtAgreed: true,
      });

      expect(newApp.id).toMatch(/^APP-2026-\d{4}$/);
      expect(newApp.trackingCode).toMatch(/^REG-\d{6}$/);
      expect(newApp.status).toBe("submitted");
      expect(newApp.fullName).toBe("Khadijah Al-Zahra");
      expect(newApp.demoId).toBe("DEMO-ID-0099");
      expect(newApp.history).toHaveLength(1);
      expect(newApp.history[0].action).toBe("Permohonan Pendaftaran Terkirim");
      expect(newApp.history[0].actorRole).toBe("applicant");

      // Verify query by tracking code and demoId
      const foundByCode = useMembershipStore
        .getState()
        .getApplicationByTrackingCode(newApp.trackingCode);
      expect(foundByCode?.id).toBe(newApp.id);

      const foundByDemoId = useMembershipStore
        .getState()
        .getApplicationByDemoId("DEMO-ID-0099");
      expect(foundByDemoId?.id).toBe(newApp.id);
    });
  });

  describe("2. Staff Verification & Recommendation Workflow", () => {
    it("should allow only 'staff' to start review on 'submitted' applications", () => {
      const targetAppId = "APP-2026-0001"; // Budi Santoso (submitted)

      // 1. Non-staff (manager, admin, auditor) must be rejected
      const managerAttempt = useMembershipStore.getState().startStaffReview(targetAppId, {
        role: "manager" as Role,
        name: "Hendra Kurniawan",
      });
      expect(managerAttempt.success).toBe(false);
      expect(managerAttempt.error).toContain("Hanya Staf Operasional");

      const adminAttempt = useMembershipStore.getState().startStaffReview(targetAppId, {
        role: "admin" as Role,
        name: "Rina Wijaya",
      });
      expect(adminAttempt.success).toBe(false);

      // 2. Staff is authorized
      const staffSuccess = useMembershipStore.getState().startStaffReview(targetAppId, {
        role: "staff" as Role,
        name: "Dewi Lestari",
      });
      expect(staffSuccess.success).toBe(true);

      const updated = useMembershipStore
        .getState()
        .applications.find((a) => a.id === targetAppId);
      expect(updated?.status).toBe("under_review");
      expect(updated?.history[updated.history.length - 1].action).toBe(
        "Pemeriksaan Berkas Dimulai"
      );
    });

    it("should allow staff to request revision, and applicant to amend and resubmit", () => {
      const targetAppId = "APP-2026-0002"; // Maya Indah (under_review)

      // Staff requests revision
      const revResult = useMembershipStore.getState().requestRevision(
        targetAppId,
        { role: "staff", name: "Dewi Lestari" },
        "Mohon cantumkan kelurahan dan kode pos pada alamat domisili."
      );
      expect(revResult.success).toBe(true);

      let app = useMembershipStore
        .getState()
        .applications.find((a) => a.id === targetAppId);
      expect(app?.status).toBe("revision_required");
      expect(app?.revisionReason).toBe(
        "Mohon cantumkan kelurahan dan kode pos pada alamat domisili."
      );

      // Applicant resubmits revision from tracking portal
      const resubmit = useMembershipStore
        .getState()
        .updateApplicantRevision(app!.trackingCode, {
          address:
            "Komp. Poris Indah Blok C3 No. 8, RT 02/RW 05, Cipondoh, Tangerang 15148",
        });
      expect(resubmit.success).toBe(true);

      app = useMembershipStore
        .getState()
        .applications.find((a) => a.id === targetAppId);
      expect(app?.status).toBe("submitted");
      expect(app?.address).toContain("15148");
      expect(app?.history[app.history.length - 1].action).toBe(
        "Perbaikan Berkas Dikirimkan Ulang"
      );
    });

    it("should prevent staff recommendation if checklist is incomplete, and succeed once all 4 items are checked", () => {
      const targetAppId = "APP-2026-0002"; // under_review

      // Currently only 2 of 4 items are checked
      const failRecommend = useMembershipStore.getState().recommendApplication(
        targetAppId,
        { role: "staff", name: "Dewi Lestari" },
        "Data lengkap."
      );
      expect(failRecommend.success).toBe(false);
      expect(failRecommend.error).toContain("Seluruh 4 butir checklist verifikasi");

      // Complete the remaining 2 checklist items
      useMembershipStore.getState().updateChecklist(
        targetAppId,
        { role: "staff", name: "Dewi Lestari" },
        {
          identityVerified: true,
          biodataVerified: true,
          commitmentVerified: true,
          adArtVerified: true,
        },
        "Semua syarat identitas demo, biodata, dan komitmen simpanan sah."
      );

      // Now recommendation succeeds
      const successRecommend = useMembershipStore.getState().recommendApplication(
        targetAppId,
        { role: "staff", name: "Dewi Lestari" },
        "Berkas lengkap dan direkomendasikan untuk disetujui Pengurus."
      );
      expect(successRecommend.success).toBe(true);

      const app = useMembershipStore
        .getState()
        .applications.find((a) => a.id === targetAppId);
      expect(app?.status).toBe("recommended");
    });
  });

  describe("3. Separation of Duties (SoD) — Approval Authority", () => {
    it("STAFF is strictly forbidden from approving or rejecting applications", () => {
      const targetAppId = "APP-2026-0004"; // Agus Setiawan (recommended)

      const staffApprove = useMembershipStore.getState().approveApplication(
        targetAppId,
        { role: "staff", name: "Dewi Lestari" }
      );
      expect(staffApprove.success).toBe(false);
      expect(staffApprove.error).toContain("Pengurus/Manajer");

      const staffReject = useMembershipStore.getState().rejectApplication(
        targetAppId,
        { role: "staff", name: "Dewi Lestari" },
        "Ditolak staf."
      );
      expect(staffReject.success).toBe(false);
      expect(staffReject.error).toContain("Pengurus/Manajer");
    });

    it("ADMINISTRATOR and SUPER ADMIN are strictly forbidden from approving applications (SoD Footnote 2)", () => {
      const targetAppId = "APP-2026-0004"; // recommended

      const adminApprove = useMembershipStore.getState().approveApplication(
        targetAppId,
        { role: "admin", name: "Rina Wijaya" }
      );
      expect(adminApprove.success).toBe(false);
      expect(adminApprove.error).toContain("Pengurus/Manajer");

      const superApprove = useMembershipStore.getState().approveApplication(
        targetAppId,
        { role: "super_admin", name: "Super Admin" }
      );
      expect(superApprove.success).toBe(false);
    });

    it("FINANCE OFFICER and TREASURER are forbidden from approving membership applications", () => {
      const targetAppId = "APP-2026-0004"; // recommended

      const foApprove = useMembershipStore.getState().approveApplication(
        targetAppId,
        { role: "finance_officer", name: "Ahmad Fauzi" }
      );
      expect(foApprove.success).toBe(false);

      const trApprove = useMembershipStore.getState().approveApplication(
        targetAppId,
        { role: "treasurer", name: "Sri Mulyani" }
      );
      expect(trApprove.success).toBe(false);
    });
  });

  describe("4. Manager Approval & Automatic Member Number Generation", () => {
    it("should allow MANAGER to approve, generate sequential Member Number, and add to Member Registry", () => {
      const targetAppId = "APP-2026-0004"; // Agus Setiawan (recommended)
      const prevMemberCount = useMembershipStore.getState().members.length;

      const approveResult = useMembershipStore.getState().approveApplication(
        targetAppId,
        { role: "manager", name: "Hendra Kurniawan" },
        "Memenuhi seluruh persyaratan AD/ART."
      );

      expect(approveResult.success).toBe(true);
      expect(approveResult.memberNumber).toMatch(/^KMB-2026-\d{4}$/);

      // Verify application status
      const app = useMembershipStore
        .getState()
        .applications.find((a) => a.id === targetAppId);
      expect(app?.status).toBe("approved");
      expect(app?.approvedMemberNumber).toBe(approveResult.memberNumber);
      expect(app?.assignedMemberId).toBeDefined();

      // Verify new member record in registry
      expect(useMembershipStore.getState().members.length).toBe(
        prevMemberCount + 1
      );
      const newMember = useMembershipStore
        .getState()
        .getMemberByDemoId(app!.demoId);
      expect(newMember).toBeDefined();
      expect(newMember?.memberNumber).toBe(approveResult.memberNumber);
      expect(newMember?.fullName).toBe("Agus Setiawan");
      expect(newMember?.status).toBe("active");
      expect(newMember?.saldoPokok).toBe(100000);
      expect(newMember?.saldoWajib).toBe(50000);
    });

    it("should allow MANAGER to reject with mandatory reason, without generating Member Number", () => {
      const targetAppId = "APP-2026-0004"; // Agus Setiawan (recommended)
      const prevMemberCount = useMembershipStore.getState().members.length;

      // Empty rejection reason must fail
      const emptyReason = useMembershipStore.getState().rejectApplication(
        targetAppId,
        { role: "manager", name: "Hendra Kurniawan" },
        "   "
      );
      expect(emptyReason.success).toBe(false);

      // Valid rejection
      const validReject = useMembershipStore.getState().rejectApplication(
        targetAppId,
        { role: "manager", name: "Hendra Kurniawan" },
        "Cakupan usaha di luar ketentuan wilayah keanggotaan koperasi."
      );
      expect(validReject.success).toBe(true);

      const app = useMembershipStore
        .getState()
        .applications.find((a) => a.id === targetAppId);
      expect(app?.status).toBe("rejected");
      expect(app?.approvedMemberNumber).toBeUndefined();
      expect(app?.rejectionReason).toBe(
        "Cakupan usaha di luar ketentuan wilayah keanggotaan koperasi."
      );

      // Member registry count must not change
      expect(useMembershipStore.getState().members.length).toBe(prevMemberCount);
    });
  });

  describe("5. Member Registry Queries & Portal Boundary", () => {
    it("should retrieve member record by demoId", () => {
      const member = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001");
      expect(member).toBeDefined();
      expect(member?.fullName).toBe("Siti Rahma");
      expect(member?.memberNumber).toBe("KMB-2026-0001");
      expect(member?.status).toBe("active");
      expect(member?.saldoPokok).toBe(100000);
      expect(member?.saldoWajib).toBe(600000);
    });
  });
});
