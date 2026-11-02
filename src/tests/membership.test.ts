// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  useMembershipStore,
  generateUniqueDemoId,
  validateSavingsConfig,
  DEFAULT_SAVINGS_CONFIG,
} from "../features/membership/stores/membershipStore";
import { useAuthStore } from "../stores/authStore";
import { Role } from "../types";

describe("PHASE 3 & 3.1 — Membership Management Lifecycle, SoD & Audit Remediation", () => {
  beforeEach(() => {
    // Reset Zustand store to clean initial seed data before each test
    useMembershipStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
  });

  describe("1. Application Submission (Public / Applicant)", () => {
    it("should create application with status 'submitted' and valid tracking code", () => {
      const newApp = useMembershipStore.getState().submitApplication({
        fullName: "Khadijah Al-Zahra",
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
      expect(newApp.demoId).toBe("DEMO-ID-0010");
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
        .getApplicationByDemoId(newApp.demoId);
      expect(foundByDemoId?.id).toBe(newApp.id);
    });

    it("should ignore user-supplied demoId and strictly assign store-generated unique ID (Phase 3.2 P1)", () => {
      // User attempts to supply custom/arbitrary demoId
      const tamperedApp = useMembershipStore.getState().submitApplication({
        fullName: "Calon Upaya Tampering",
        demoId: "CUSTOM-ID-ARBITRARY",
        email: "tamper@email.invalid",
        phone: "0811-9999-0000",
        city: "Jakarta Barat",
        address: "Jl. Daan Mogot",
        occupation: "Pengembang Software",
        simpananPokokConfirmed: true,
        simpananWajibConfirmed: true,
        adArtAgreed: true,
      });

      // Must be store-generated DEMO-ID-XXXX, NOT the user's arbitrary string
      expect(tamperedApp.demoId).not.toBe("CUSTOM-ID-ARBITRARY");
      expect(tamperedApp.demoId).toBe("DEMO-ID-0010");
    });

    it("should assign distinct sequential demo IDs for subsequent registrations without collision", () => {
      const app1 = useMembershipStore.getState().submitApplication({
        fullName: "Pendaftar Pertama",
        email: "pertama@email.invalid",
        phone: "0811-0001",
        city: "Jakarta Selatan",
        address: "Alamat 1",
        occupation: "Wirausaha",
        simpananPokokConfirmed: true,
        simpananWajibConfirmed: true,
        adArtAgreed: true,
      });

      const app2 = useMembershipStore.getState().submitApplication({
        fullName: "Pendaftar Kedua",
        email: "kedua@email.invalid",
        phone: "0811-0002",
        city: "Jakarta Selatan",
        address: "Alamat 2",
        occupation: "Wirausaha",
        simpananPokokConfirmed: true,
        simpananWajibConfirmed: true,
        adArtAgreed: true,
      });

      expect(app1.demoId).toBe("DEMO-ID-0010");
      expect(app2.demoId).toBe("DEMO-ID-0011");
      expect(app1.demoId).not.toBe(app2.demoId);
    });

    it("should auto-generate a unique demoId if duplicate or invalid format is provided", () => {
      // DEMO-ID-0001 is already taken by existing member Siti Rahma
      const duplicateApp = useMembershipStore.getState().submitApplication({
        fullName: "Calon Baru Unik",
        demoId: "DEMO-ID-0001",
        email: "calon.unik@email.invalid",
        phone: "0811-1234-5678",
        city: "Jakarta Selatan",
        address: "Jl. Fatmawati",
        occupation: "Desainer",
        simpananPokokConfirmed: true,
        simpananWajibConfirmed: true,
        adArtAgreed: true,
      });

      expect(duplicateApp.demoId).not.toBe("DEMO-ID-0001");
      expect(duplicateApp.demoId).toMatch(/^DEMO-ID-\d{4}$/);

      // Verify no other application or member shares this generated demoId
      const allDemoIds = [
        ...useMembershipStore.getState().applications.map((a) => a.demoId),
        ...useMembershipStore.getState().members.map((m) => m.demoId),
      ];
      const matches = allDemoIds.filter((id) => id === duplicateApp.demoId);
      expect(matches).toHaveLength(1);
    });
  });

  describe("2. Unique Demo ID Generator (Phase 3.1 P1 Remediation)", () => {
    it("should generate sequentially available demo ID avoiding collisions", () => {
      const mockApps = [{ demoId: "DEMO-ID-0001" }, { demoId: "DEMO-ID-0002" }];
      const mockMembers = [{ demoId: "DEMO-ID-0003" }];

      const generated = generateUniqueDemoId(mockApps, mockMembers);
      expect(generated).toBe("DEMO-ID-0004");
    });

    it("should fill lowest available gaps in demo IDs", () => {
      const mockApps = [{ demoId: "DEMO-ID-0001" }, { demoId: "DEMO-ID-0003" }];
      const mockMembers: { demoId?: string }[] = [];

      const generated = generateUniqueDemoId(mockApps, mockMembers);
      expect(generated).toBe("DEMO-ID-0002");
    });

    it("should throw descriptive error when 4-digit capacity (>9999) is exhausted", () => {
      // Simulate exhausted IDs
      const exhausted = Array.from({ length: 9999 }, (_, i) => ({
        demoId: `DEMO-ID-${String(i + 1).padStart(4, "0")}`,
      }));

      expect(() => generateUniqueDemoId(exhausted, [])).toThrow(
        /Kapasitas ID Demonstrasi 4-digit .* telah penuh/
      );
    });
  });

  describe("3. Separation of Duties (SoD) & Role Anti-Spoofing (Phase 3.1 P1 Remediation)", () => {
    it("should strictly resolve role from useAuthStore, blocking caller parameter spoofing", () => {
      const targetAppId = "APP-2026-0004"; // Agus Setiawan (recommended)

      // Active role is 'staff'
      useAuthStore.getState().setRole("staff");

      // Staff attempts to approve by maliciously passing role: "manager" in parameter
      const spoofApprove = useMembershipStore.getState().approveApplication(
        targetAppId,
        { role: "manager" as Role, name: "Fake Manager" }
      );
      expect(spoofApprove.success).toBe(false);
      expect(spoofApprove.error).toContain("Kewenangan persetujuan final keanggotaan");
      expect(spoofApprove.error).toContain('"staff"');

      // Staff attempts to reject passing role: "manager"
      const spoofReject = useMembershipStore.getState().rejectApplication(
        targetAppId,
        { role: "manager" as Role, name: "Fake Manager" },
        "Ditolak secara sepihak"
      );
      expect(spoofReject.success).toBe(false);
      expect(spoofReject.error).toContain('"staff"');
    });

    it("ADMIN, SUPER ADMIN, FINANCE OFFICER, and TREASURER cannot approve membership", () => {
      const targetAppId = "APP-2026-0004"; // recommended

      const forbiddenRoles: Role[] = ["admin", "super_admin", "finance_officer", "treasurer", "auditor"];

      for (const role of forbiddenRoles) {
        useAuthStore.getState().setRole(role);
        const result = useMembershipStore.getState().approveApplication(targetAppId);
        expect(result.success).toBe(false);
        expect(result.error).toContain("Kewenangan persetujuan final");
      }
    });

    it("MANAGER cannot start review or recommend (Staff only)", () => {
      const targetAppId = "APP-2026-0001"; // submitted
      useAuthStore.getState().setRole("manager");

      const reviewResult = useMembershipStore.getState().startStaffReview(targetAppId);
      expect(reviewResult.success).toBe(false);
      expect(reviewResult.error).toContain("Hanya Staf Operasional");

      const recResult = useMembershipStore.getState().recommendApplication(targetAppId);
      expect(recResult.success).toBe(false);
      expect(recResult.error).toContain("Hanya Staf Operasional");
    });
  });

  describe("4. Staff Verification & Recommendation Workflow", () => {
    it("should allow 'staff' to start review on 'submitted' applications", () => {
      const targetAppId = "APP-2026-0001"; // Budi Santoso (submitted)
      useAuthStore.getState().setRole("staff");

      const staffSuccess = useMembershipStore.getState().startStaffReview(targetAppId);
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
      useAuthStore.getState().setRole("staff");

      // Staff requests revision
      const revResult = useMembershipStore.getState().requestRevision(
        targetAppId,
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

    it("should record checklist update into audit trail without fake status transitions", () => {
      const targetAppId = "APP-2026-0002"; // under_review
      useAuthStore.getState().setRole("staff");

      const prevApp = useMembershipStore.getState().applications.find((a) => a.id === targetAppId);
      const prevHistoryLen = prevApp!.history.length;

      // Update partial checklist
      const updateRes = useMembershipStore.getState().updateChecklist(
        targetAppId,
        { identityVerified: true, biodataVerified: true },
        "Verifikasi KTP dan data pribadi cocok dengan dokumen kependudukan."
      );
      expect(updateRes.success).toBe(true);

      const updatedApp = useMembershipStore.getState().applications.find((a) => a.id === targetAppId);
      expect(updatedApp?.history).toHaveLength(prevHistoryLen + 1);

      const latestLog = updatedApp!.history[updatedApp!.history.length - 1];
      expect(latestLog.action).toBe("Pembaruan Checklist Verifikasi");
      expect(latestLog.actorRole).toBe("staff");
      expect(latestLog.fromStatus).toBe(updatedApp!.status);
      expect(latestLog.toStatus).toBe(updatedApp!.status); // No fake status shift
      expect(latestLog.notes).toContain("Verifikasi KTP");
    });

    it("should prevent staff recommendation if checklist is incomplete, and succeed once all 4 items are checked", () => {
      const targetAppId = "APP-2026-0002"; // under_review
      useAuthStore.getState().setRole("staff");

      // Currently incomplete
      const failRecommend = useMembershipStore.getState().recommendApplication(
        targetAppId,
        "Data lengkap."
      );
      expect(failRecommend.success).toBe(false);
      expect(failRecommend.error).toContain("Seluruh 4 butir checklist verifikasi");

      // Complete all 4 checklist items
      useMembershipStore.getState().updateChecklist(
        targetAppId,
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
        "Berkas lengkap dan direkomendasikan untuk disetujui Pengurus."
      );
      expect(successRecommend.success).toBe(true);

      const app = useMembershipStore
        .getState()
        .applications.find((a) => a.id === targetAppId);
      expect(app?.status).toBe("recommended");
    });
  });

  describe("5. Manager Approval & Balance Separation (Phase 3.1 P1 Remediation)", () => {
    it("should approve application, generate member number, and initialize balances to 0", () => {
      const targetAppId = "APP-2026-0004"; // Agus Setiawan (recommended)
      const prevMemberCount = useMembershipStore.getState().members.length;

      useAuthStore.getState().setRole("manager");

      const approveResult = useMembershipStore.getState().approveApplication(
        targetAppId,
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

      // CRITICAL Phase 3.1: Balances must be 0 until actual financial payment is settled
      expect(newMember?.saldoPokok).toBe(0);
      expect(newMember?.saldoWajib).toBe(0);
      expect(newMember?.saldoSukarela).toBe(0);

      // Commitment obligations remain registered
      expect(newMember?.simpananPokokNominal).toBe(100000);
      expect(newMember?.simpananWajibBulanan).toBe(50000);
    });

    it("should allow MANAGER to reject with mandatory reason, without generating Member Number or registry entry", () => {
      const targetAppId = "APP-2026-0004"; // Agus Setiawan (recommended)
      const prevMemberCount = useMembershipStore.getState().members.length;

      useAuthStore.getState().setRole("manager");

      // Empty rejection reason must fail
      const emptyReason = useMembershipStore.getState().rejectApplication(
        targetAppId,
        "   "
      );
      expect(emptyReason.success).toBe(false);

      // Valid rejection
      const validReject = useMembershipStore.getState().rejectApplication(
        targetAppId,
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

  describe("6. Member Profile Isolation & Privacy (Phase 3.1 P0 Remediation)", () => {
    it("should retrieve member record strictly by matching demoId", () => {
      const member1 = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001");
      expect(member1).toBeDefined();
      expect(member1?.fullName).toBe("Siti Rahma");
      expect(member1?.memberNumber).toBe("KMB-2026-0001");

      const member2 = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0007");
      expect(member2).toBeDefined();
      expect(member2?.fullName).toBe("Dian Pratama");
      expect(member2?.memberNumber).toBe("KMB-2026-0002");
    });

    it("should return undefined for nonexistent member ID without falling back to members[0]", () => {
      const nonexistent = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-9999");
      expect(nonexistent).toBeUndefined();

      // Ensure first member is NOT returned
      const firstMember = useMembershipStore.getState().members[0];
      expect(nonexistent).not.toEqual(firstMember);
    });

    it("should return undefined for empty or invalid member ID", () => {
      expect(useMembershipStore.getState().getMemberByDemoId("")).toBeUndefined();
      expect(useMembershipStore.getState().getMemberByDemoId("   ")).toBeUndefined();
      expect(useMembershipStore.getState().getMemberByDemoId("NON-EXISTENT")).toBeUndefined();
    });

    it("demonstrates member profile isolation between distinct user sessions", () => {
      // User 1: Siti Rahma (DEMO-ID-0001)
      const user1Member = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001");
      expect(user1Member?.fullName).toBe("Siti Rahma");

      // User 2: Dian Pratama (DEMO-ID-0007)
      const user2Member = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0007");
      expect(user2Member?.fullName).toBe("Dian Pratama");

      // Verify strict segregation
      expect(user1Member?.id).not.toBe(user2Member?.id);
      expect(user1Member?.memberNumber).not.toBe(user2Member?.memberNumber);
    });
  });

  describe("7. Configurable Savings Parameters & Persistence (Phase 3.2 & 3.3 Remediation)", () => {
    it("should provide default illustration savings parameters clearly labeled", () => {
      const config = useMembershipStore.getState().savingsConfig;
      expect(config.simpananPokokNominal).toBe(100000);
      expect(config.simpananWajibBulanan).toBe(50000);
      expect(config.label).toBe("Nominal Ilustrasi — Dapat Diubah");
      expect(config.disclaimer).toContain("bukan ketentuan final/resmi AD/ART");
    });

    it("should allow updating savings configuration and reflect in newly approved member commitments", () => {
      const targetAppId = "APP-2026-0004"; // Agus Setiawan (recommended)

      // Update configuration to different illustration values
      useMembershipStore.getState().updateSavingsConfig({
        simpananPokokNominal: 250000,
        simpananWajibBulanan: 100000,
      });

      expect(useMembershipStore.getState().savingsConfig.simpananPokokNominal).toBe(250000);
      expect(useMembershipStore.getState().savingsConfig.simpananWajibBulanan).toBe(100000);

      // Manager approves application
      useAuthStore.getState().setRole("manager");
      const approveResult = useMembershipStore.getState().approveApplication(
        targetAppId,
        "Persetujuan dengan parameter konfigurasi ilustrasi baru."
      );
      expect(approveResult.success).toBe(true);

      const app = useMembershipStore.getState().applications.find((a) => a.id === targetAppId);
      const newMember = useMembershipStore.getState().getMemberByDemoId(app!.demoId);
      expect(newMember).toBeDefined();

      // Member commitment reflects the configured values
      expect(newMember?.simpananPokokNominal).toBe(250000);
      expect(newMember?.simpananWajibBulanan).toBe(100000);

      // CRITICAL: Actual balances must STILL remain 0
      expect(newMember?.saldoPokok).toBe(0);
      expect(newMember?.saldoWajib).toBe(0);
      expect(newMember?.saldoSukarela).toBe(0);
    });

    it("should ensure actual member balances never change when illustration parameters are updated", () => {
      // Existing member Siti Rahma has saldoPokok: 100000, saldoWajib: 600000
      const prevMember = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001");
      const prevSaldoPokok = prevMember?.saldoPokok;
      const prevSaldoWajib = prevMember?.saldoWajib;
      const prevSaldoSukarela = prevMember?.saldoSukarela;

      // Update illustration parameters
      useMembershipStore.getState().updateSavingsConfig({
        simpananPokokNominal: 500000,
        simpananWajibBulanan: 200000,
      });

      // Verify balances remain strictly unchanged
      const currentMember = useMembershipStore.getState().getMemberByDemoId("DEMO-ID-0001");
      expect(currentMember?.saldoPokok).toBe(prevSaldoPokok);
      expect(currentMember?.saldoWajib).toBe(prevSaldoWajib);
      expect(currentMember?.saldoSukarela).toBe(prevSaldoSukarela);
    });

    it("should persist savings configuration to localStorage without wiping existing applications or members", () => {
      const prevAppsCount = useMembershipStore.getState().applications.length;
      const prevMembersCount = useMembershipStore.getState().members.length;

      useMembershipStore.getState().updateSavingsConfig({
        simpananPokokNominal: 350000,
        simpananWajibBulanan: 150000,
      });

      // Applications and members remain intact
      expect(useMembershipStore.getState().applications.length).toBe(prevAppsCount);
      expect(useMembershipStore.getState().members.length).toBe(prevMembersCount);

      // Verify stored JSON structure
      const rawStored = localStorage.getItem("kmb_membership_store_v1");
      expect(rawStored).toBeTruthy();
      const parsed = JSON.parse(rawStored!);
      expect(parsed.savingsConfig).toBeDefined();
      expect(parsed.savingsConfig.simpananPokokNominal).toBe(350000);
      expect(parsed.savingsConfig.simpananWajibBulanan).toBe(150000);
    });

    it("should restore configured savings parameters upon simulated page reload / store re-initialization using vi.resetModules()", async () => {
      // 1. Update config
      useMembershipStore.getState().updateSavingsConfig({
        simpananPokokNominal: 450000,
        simpananWajibBulanan: 180000,
      });

      // Verify written to localStorage
      const rawStored = localStorage.getItem("kmb_membership_store_v1");
      expect(rawStored).toBeTruthy();
      const parsed = JSON.parse(rawStored!);
      expect(parsed.savingsConfig.simpananPokokNominal).toBe(450000);
      expect(parsed.savingsConfig.simpananWajibBulanan).toBe(180000);

      // 2. Simulate browser reload: reset modules and dynamically re-import useMembershipStore
      vi.resetModules();
      const { useMembershipStore: freshStore } = await import(
        "../features/membership/stores/membershipStore"
      );

      // 3. Verify the new store instance properly rehydrated the custom config from localStorage
      const restoredState = freshStore.getState();
      expect(restoredState.savingsConfig.simpananPokokNominal).toBe(450000);
      expect(restoredState.savingsConfig.simpananWajibBulanan).toBe(180000);
      expect(restoredState.savingsConfig.label).toBe("Nominal Ilustrasi — Dapat Diubah");
      expect(restoredState.applications.length).toBeGreaterThan(0);
      expect(restoredState.members.length).toBeGreaterThan(0);
    });

    it("should safely fall back to DEFAULT_SAVINGS_CONFIG upon re-initialization when localStorage has corrupted savings config without wiping applications or members", async () => {
      // 1. Prepare valid applications and members, but corrupt savingsConfig in localStorage
      const testApps = useMembershipStore.getState().applications;
      const testMembers = useMembershipStore.getState().members;
      localStorage.setItem(
        "kmb_membership_store_v1",
        JSON.stringify({
          applications: testApps,
          members: testMembers,
          savingsConfig: { simpananPokokNominal: -99999, simpananWajibBulanan: "corrupted_value" },
        })
      );

      // 2. Simulate browser reload
      vi.resetModules();
      const { useMembershipStore: safeStore, DEFAULT_SAVINGS_CONFIG: defConfig } = await import(
        "../features/membership/stores/membershipStore"
      );

      // 3. Verify corrupted config fell back cleanly to DEFAULT_SAVINGS_CONFIG
      const safeState = safeStore.getState();
      expect(safeState.savingsConfig).toEqual(defConfig);
      expect(safeState.savingsConfig.simpananPokokNominal).toBe(100000);
      expect(safeState.savingsConfig.simpananWajibBulanan).toBe(50000);

      // 4. Crucially verify applications and members data were preserved intact
      expect(safeState.applications.length).toBe(testApps.length);
      expect(safeState.members.length).toBe(testMembers.length);
    });

    it("should safely fall back to DEFAULT_SAVINGS_CONFIG when validating arbitrary corrupted, negative, or invalid data", () => {
      // Non-numeric or negative values
      expect(validateSavingsConfig({ simpananPokokNominal: -500, simpananWajibBulanan: 50000 })).toEqual(
        DEFAULT_SAVINGS_CONFIG
      );
      expect(validateSavingsConfig({ simpananPokokNominal: "invalid", simpananWajibBulanan: 50000 })).toEqual(
        DEFAULT_SAVINGS_CONFIG
      );
      // Beyond reasonable upper bound (> 1 billion)
      expect(
        validateSavingsConfig({ simpananPokokNominal: 2_000_000_000, simpananWajibBulanan: 50000 })
      ).toEqual(DEFAULT_SAVINGS_CONFIG);
      // Corrupted / null / missing
      expect(validateSavingsConfig(null)).toEqual(DEFAULT_SAVINGS_CONFIG);
      expect(validateSavingsConfig(undefined)).toEqual(DEFAULT_SAVINGS_CONFIG);
      expect(validateSavingsConfig("corrupted-string")).toEqual(DEFAULT_SAVINGS_CONFIG);
      expect(validateSavingsConfig({})).toEqual(DEFAULT_SAVINGS_CONFIG);
    });

    it("should reset savings configuration to default and persist to localStorage when resetToSeed is called", () => {
      useMembershipStore.getState().updateSavingsConfig({
        simpananPokokNominal: 999999,
        simpananWajibBulanan: 888888,
      });
      expect(useMembershipStore.getState().savingsConfig.simpananPokokNominal).toBe(999999);

      useMembershipStore.getState().resetToSeed();
      expect(useMembershipStore.getState().savingsConfig.simpananPokokNominal).toBe(100000);
      expect(useMembershipStore.getState().savingsConfig.simpananWajibBulanan).toBe(50000);

      // Verify localStorage was updated with the default configuration
      const rawStored = localStorage.getItem("kmb_membership_store_v1");
      expect(rawStored).toBeTruthy();
      const parsed = JSON.parse(rawStored!);
      expect(parsed.savingsConfig.simpananPokokNominal).toBe(100000);
      expect(parsed.savingsConfig.simpananWajibBulanan).toBe(50000);
    });
  });
});
