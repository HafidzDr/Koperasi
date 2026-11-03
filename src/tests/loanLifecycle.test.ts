// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useLoanStore } from "../features/loans/stores/loanStore";
import { useMembershipStore } from "../features/membership/stores/membershipStore";
import { useAuthStore } from "../stores/authStore";
import { demoUsers } from "../mocks/seedData";

describe("Loan Lifecycle & Multi-Tier Approval Tests (BR-03.1, BR-03.6)", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useLoanStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
  });

  describe("1. Application Submission & Eligibility Checks", () => {
    it("1.1. Pengajuan pinjaman baru oleh anggota aktif berhasil dibuat dengan status 'submitted'", () => {
      // Member Siti Rahma (DEMO-ID-0001)
      useAuthStore.setState({ currentUser: demoUsers.member });

      const res = useLoanStore.getState().submitApplication({
        memberDemoId: "DEMO-ID-0001",
        productType: "konsumtif",
        amount: 5_000_000,
        tenorMonths: 12,
        purpose: "Renovasi teras rumah",
        purposeCategory: "Renovasi Rumah",
        incomeSource: "Gaji Bulanan",
      });

      expect(res.success).toBe(true);
      expect(res.applicationId).toMatch(/^PJ-2026-\d{4}$/);

      const app = useLoanStore.getState().getApplicationById(res.applicationId!);
      expect(app).toBeDefined();
      expect(app?.status).toBe("submitted");
      expect(app?.amount).toBe(5_000_000);
      expect(app?.adminFeeAmount).toBe(50_000); // 1%
      expect(app?.netDisbursementAmount).toBe(4_950_000);
      expect(app?.history).toHaveLength(1);
      expect(app?.history[0].action).toBe("Pengajuan Pinjaman");
    });

    it("1.2. Menolak pengajuan jika anggota berstatus dibekukan (suspended)", () => {
      // Ubah status Siti Rahma (DEMO-ID-0001) menjadi suspended
      useAuthStore.setState({ currentUser: demoUsers.staff });
      useMembershipStore.setState((state) => ({
        members: state.members.map((m) =>
          m.demoId === "DEMO-ID-0001" ? { ...m, status: "suspended" as const } : m
        ),
      }));

      useAuthStore.setState({ currentUser: demoUsers.member });

      const res = useLoanStore.getState().submitApplication({
        memberDemoId: "DEMO-ID-0001",
        productType: "konsumtif",
        amount: 5_000_000,
        tenorMonths: 12,
        purpose: "Kebutuhan mendesak",
        purposeCategory: "Lainnya",
        incomeSource: "Gaji",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Dibekukan");
    });

    it("1.3. Menolak pengajuan jika kuota pinjaman aktif anggota telah penuh (max 2 pinjaman)", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });

      // Siti Rahma (DEMO-ID-0001) sudah punya 1 pinjaman aktif di seed
      // Buat pinjaman aktif kedua secara simulasi
      const store = useLoanStore.getState();
      const currentLoans = store.loans;
      const loan2 = {
        ...currentLoans[0],
        id: "PJ-2026-9999",
        memberDemoId: "DEMO-ID-0001",
        status: "active" as const,
      };
      useLoanStore.setState({ loans: [loan2, ...currentLoans] });

      // Sekarang Siti Rahma sudah memiliki 2 pinjaman aktif
      const res = useLoanStore.getState().submitApplication({
        memberDemoId: "DEMO-ID-0001",
        productType: "konsumtif",
        amount: 3_000_000,
        tenorMonths: 6,
        purpose: "Pinjaman ketiga yang melebihi batas",
        purposeCategory: "Lainnya",
        incomeSource: "Gaji",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Maksimum pinjaman aktif tercapai");
    });

    it("1.4. Menolak pengajuan jika nominal atau tenor di luar batas produk", () => {
      useAuthStore.setState({ currentUser: demoUsers.member });

      // Batas Konsumtif: Rp 1.000.000 s.d. Rp 50.000.000
      const resTooLow = useLoanStore.getState().submitApplication({
        memberDemoId: "DEMO-ID-0001",
        productType: "konsumtif",
        amount: 500_000, // di bawah min 1 jt
        tenorMonths: 12,
        purpose: "Nominal terlalu kecil",
        purposeCategory: "Lainnya",
        incomeSource: "Gaji",
      });
      expect(resTooLow.success).toBe(false);
      expect(resTooLow.error).toContain("Nominal pinjaman harus berada di antara");

      const resTooHighTenor = useLoanStore.getState().submitApplication({
        memberDemoId: "DEMO-ID-0001",
        productType: "darurat",
        amount: 5_000_000,
        tenorMonths: 24, // darurat max 12 bulan
        purpose: "Tenor darurat terlalu lama",
        purposeCategory: "Lainnya",
        incomeSource: "Gaji",
      });
      expect(resTooHighTenor.success).toBe(false);
      expect(resTooHighTenor.error).toContain("Tenor pinjaman harus berada di antara");
    });
  });

  describe("2. Review & Recommendation Lifecycle with SoD", () => {
    it("2.1. Staf dapat memverifikasi berkas sehingga status berubah menjadi 'under_review'", () => {
      // Login sebagai Staf Dewi Lestari
      useAuthStore.setState({ currentUser: demoUsers.staff });

      // Target PJ-2026-0026 (status submitted)
      const res = useLoanStore.getState().reviewApplication(
        "PJ-2026-0026",
        "Dokumen slip gaji lengkap dan terverifikasi valid."
      );

      expect(res.success).toBe(true);
      const app = useLoanStore.getState().getApplicationById("PJ-2026-0026");
      expect(app?.status).toBe("under_review");
      expect(app?.reviewedByName).toBe("Dewi Lestari");
      expect(app?.reviewNotes).toBe("Dokumen slip gaji lengkap dan terverifikasi valid.");
    });

    it("2.2. Menolak review jika pengguna berusaha memverifikasi pengajuannya sendiri (SoD)", () => {
      // Misalkan Staf membuat pengajuan sendiri
      useAuthStore.setState({
        currentUser: {
          id: "user-staff-01",
          name: "Dewi Lestari",
          role: "staff",
          roleName: "Staf",
          email: "dewi.staff@koperasi.id",
        },
      });

      // Tandai pengajuan dibuat oleh user-staff-01
      useLoanStore.setState((state) => ({
        applications: state.applications.map((a) =>
          a.id === "PJ-2026-0026" ? { ...a, createdById: "user-staff-01" } : a
        ),
      }));

      const res = useLoanStore.getState().reviewApplication("PJ-2026-0026");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Separation of Duties (SoD)");
    });

    it("2.3. Rekomendasi ke Pengurus mengubah status menjadi 'recommended'", () => {
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });

      // Target PJ-2026-0027 (status under_review)
      const res = useLoanStore.getState().recommendApplication(
        "PJ-2026-0027",
        "Analisa kelayakan menunjukkan kapasitas memadai."
      );

      expect(res.success).toBe(true);
      const app = useLoanStore.getState().getApplicationById("PJ-2026-0027");
      expect(app?.status).toBe("recommended");
      expect(app?.recommendedByName).toBe("Ahmad Fauzi");
    });
  });

  describe("3. Multi-Tier Approval & Threshold Enforcement (BR-03.6)", () => {
    it("3.1. Finance Officer dapat menyetujui pinjaman dengan nominal <= Rp 10.000.000", () => {
      // Login sebagai Finance Officer Ahmad Fauzi
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });

      // PJ-2026-0026 nominal Rp 8.000.000 (<= 10M)
      const res = useLoanStore.getState().approveApplication(
        "PJ-2026-0026",
        "Disetujui FO dalam batas kewenangan Level 2."
      );

      expect(res.success).toBe(true);
      const app = useLoanStore.getState().getApplicationById("PJ-2026-0026");
      expect(app?.status).toBe("approved");
      expect(app?.approvedByName).toBe("Ahmad Fauzi");
      expect(app?.approvedByRole).toBe("finance_officer");
    });

    it("3.2. Finance Officer DITOLAK saat mencoba menyetujui pinjaman > Rp 10.000.000 (Wajib Manajer)", () => {
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });

      // PJ-2026-0027 nominal Rp 25.000.000 (> 10M)
      const res = useLoanStore.getState().approveApplication("PJ-2026-0027");

      expect(res.success).toBe(false);
      expect(res.error).toContain("melebihi batas kewenangan Finance Officer");
      expect(res.error).toContain("Pengurus / Manajer");

      // Verifikasi status pengajuan TIDAK berubah
      const app = useLoanStore.getState().getApplicationById("PJ-2026-0027");
      expect(app?.status).not.toBe("approved");
    });

    it("3.3. Manajer / Pengurus berhasil menyetujui pinjaman bernominal > Rp 10.000.000", () => {
      // Login sebagai Manager Hendra Kurniawan
      useAuthStore.setState({ currentUser: demoUsers.manager });

      // PJ-2026-0028 nominal Rp 35.000.000 (status recommended)
      const res = useLoanStore.getState().approveApplication(
        "PJ-2026-0028",
        "Disetujui Manajer/Pengurus sesuai keputusan evaluasi likuiditas."
      );

      expect(res.success).toBe(true);
      const app = useLoanStore.getState().getApplicationById("PJ-2026-0028");
      expect(app?.status).toBe("approved");
      expect(app?.approvedByName).toBe("Hendra Kurniawan");
      expect(app?.approvedByRole).toBe("manager");
    });

    it("3.4. Menolak persetujuan jika aktor mencoba menyetujui pinjamannya sendiri (SoD)", () => {
      useAuthStore.setState({ currentUser: demoUsers.manager });

      // Tandai pengajuan dibuat oleh Manajer
      useLoanStore.setState((state) => ({
        applications: state.applications.map((a) =>
          a.id === "PJ-2026-0028" ? { ...a, createdById: "user-manager-01" } : a
        ),
      }));

      const res = useLoanStore.getState().approveApplication("PJ-2026-0028");
      expect(res.success).toBe(false);
      expect(res.error).toContain("dilarang menyetujui pinjamannya sendiri");
    });
  });

  describe("4. Rejection with Mandatory Reason", () => {
    it("4.1. Menolak pengajuan memerlukan alasan wajib yang dicatat pada audit log", () => {
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });

      // Coba tolak tanpa alasan -> harus gagal
      const resEmpty = useLoanStore.getState().rejectApplication("PJ-2026-0026", "");
      expect(resEmpty.success).toBe(false);
      expect(resEmpty.error).toContain("Alasan penolakan pengajuan wajib diisi");

      // Tolak dengan alasan sah
      const res = useLoanStore.getState().rejectApplication(
        "PJ-2026-0026",
        "Rasio utang pemohon terhadap penghasilan telah melebihi batas toleransi."
      );
      expect(res.success).toBe(true);

      const app = useLoanStore.getState().getApplicationById("PJ-2026-0026");
      expect(app?.status).toBe("rejected");
      expect(app?.rejectionReason).toContain("Rasio utang");

      const lastLog = app?.history[app.history.length - 1];
      expect(lastLog?.action).toBe("Penolakan Pengajuan");
      expect(lastLog?.notes).toContain("Rasio utang");
    });
  });
});
