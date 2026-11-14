import { describe, it, expect, beforeEach } from "vitest";
import { useShuStore } from "../features/shu/stores/shuStore";
import { ShuActor, ShuCalculationSnapshot } from "../features/shu/types";

describe("PHASE 7 — SHU Lifecycle State Machine & Segregation of Duties (SoD) Tests", () => {
  beforeEach(() => {
    useShuStore.getState().resetToSeed();
  });

  const foActor: ShuActor = { id: "user-fo-01", name: "Ahmad Fauzi", role: "finance_officer" };
  const managerActor: ShuActor = { id: "user-manager-01", name: "Hendra Kurniawan", role: "manager" };
  const staffActor: ShuActor = { id: "user-staff-01", name: "Dewi Lestari", role: "staff" };
  const auditorActor: ShuActor = { id: "user-auditor-01", name: "Bambang Irawan", role: "auditor" };
  const adminActor: ShuActor = { id: "user-admin-01", name: "Rina Wijaya", role: "admin" };
  const superAdminActor: ShuActor = { id: "user-super-01", name: "Super Admin Demo", role: "super_admin" };
  const memberActor1: ShuActor = { id: "user-member-01", name: "Siti Rahma", role: "member", memberId: "DEMO-ID-0001" };

  describe("1. Siklus Hidup Periode & Snapshot Immutability", () => {
    it("1.1. Alur siklus hidup normal: Draft -> Pengumpulan Data -> Kalkulasi -> Peninjauan -> Disetujui -> Dipublikasikan -> Ditutup", () => {
      const store = useShuStore.getState();

      // 1. Buat periode
      const newP = store.createPeriod(
        {
          fiscalYear: 2028,
          name: "Tahun Buku 2028",
          startDate: "2028-01-01",
          endDate: "2028-12-31",
        },
        managerActor
      );
      expect(newP.status).toBe("draft");

      // 2. Kumpulkan data
      const collected = store.collectPeriodData(newP.id, staffActor);
      expect(collected.status).toBe("calculation_ready");

      // 3. Set input keuangan
      store.updateFinancialInput(
        newP.id,
        {
          totalRevenue: 200000000,
          totalExpense: 150000000,
          adjustmentAmount: 0,
        },
        foActor
      );

      // 4. Jalankan kalkulasi (versi 1)
      const snap1 = store.runCalculation(newP.id, foActor);
      expect(snap1.version).toBe(1);
      expect(snap1.status).toBe("calculated");
      expect(useShuStore.getState().getPeriodById(newP.id)?.status).toBe("calculated");

      // 5. Ajukan peninjauan
      const reviewSnap = store.submitForReview(newP.id, snap1.id, foActor);
      expect(reviewSnap.status).toBe("under_review");
      expect(useShuStore.getState().getPeriodById(newP.id)?.status).toBe("under_review");

      // 6. Setujui (oleh Manager yang berbeda dari FO pembuat kalkulasi)
      const approvedSnap = store.approveCalculation(newP.id, snap1.id, managerActor, "Disetujui rapat pengurus");
      expect(approvedSnap.status).toBe("approved");
      expect(useShuStore.getState().getPeriodById(newP.id)?.status).toBe("approved");

      // 7. Publikasikan
      const pubSnap = store.publishCalculation(newP.id, snap1.id, managerActor);
      expect(pubSnap.status).toBe("published");
      expect(useShuStore.getState().getPeriodById(newP.id)?.status).toBe("published");

      // 8. Tutup buku
      const closed = store.closePeriod(newP.id, managerActor);
      expect(closed.status).toBe("closed");
      expect(closed.closedAt).toBeDefined();
    });

    it("1.2. Periode closed dilarang keras untuk dikalkulasi ulang", () => {
      const store = useShuStore.getState();
      // SHU-2024 is published; let's close it
      store.closePeriod("SHU-2024", managerActor);

      expect(() => {
        store.runCalculation("SHU-2024", foActor);
      }).toThrow(/ditutup tidak dapat dihitung ulang/i);
    });

    it("1.3. Periode yang telah dipublikasikan dilarang dikalkulasi ulang secara langsung", () => {
      const store = useShuStore.getState();
      // SHU-2024 is published
      expect(() => {
        store.runCalculation("SHU-2024", foActor);
      }).toThrow(/telah dipublikasikan tidak dapat dihitung ulang/i);
    });

    it("1.4. Kalkulasi ulang pada periode terbuka menghasilkan versi baru dan snapshot lama tetap immutable", () => {
      const store = useShuStore.getState();
      // SHU-2025 has snapshot v1 (under_review)
      const periodBefore = store.getPeriodById("SHU-2025")!;
      const snap1Before = periodBefore.snapshots.find((s) => s.id === "SNAP-2025-v1")!;
      const oldDistributionCount = snap1Before.memberDistributions.length;

      // Jalankan kalkulasi ulang
      const snap2 = store.runCalculation("SHU-2025", foActor);
      expect(snap2.version).toBe(2);
      expect(snap2.id).toBe("SNAP-2025-v2");

      const periodAfter = store.getPeriodById("SHU-2025")!;
      expect(periodAfter.currentCalculationVersion).toBe(2);
      expect(periodAfter.activeSnapshotId).toBe("SNAP-2025-v2");

      // Snapshot v1 lama tidak termutasi isinya (immutable)
      const snap1After = periodAfter.snapshots.find((s) => s.id === "SNAP-2025-v1")!;
      expect(snap1After.version).toBe(1);
      expect(snap1After.memberDistributions.length).toBe(oldDistributionCount);
      expect(snap1After.status).toBe("superseded");
    });

    it("1.5. Penolakan kalkulasi wajib menyertakan alasan penolakan minimal 3 karakter", () => {
      const store = useShuStore.getState();
      expect(() => {
        store.rejectCalculation("SHU-2025", "SNAP-2025-v1", "  ", managerActor);
      }).toThrow(/wajib diisi minimal 3 karakter/i);

      const rejected = store.rejectCalculation(
        "SHU-2025",
        "SNAP-2025-v1",
        "Periksa kembali data alokasi dana pendidikan",
        managerActor
      );
      expect(rejected.status).toBe("rejected");
      expect(rejected.rejectionReason).toBe("Periksa kembali data alokasi dana pendidikan");
      expect(store.getPeriodById("SHU-2025")?.status).toBe("rejected");
    });
  });

  describe("2. Penegakan Pemisahan Tugas (SoD) & Pembatasan Peran", () => {
    it("2.1. STRICT SoD: Pembuat kalkulasi dilarang menyetujui kalkulasi buatan sendiri", () => {
      const store = useShuStore.getState();
      // SNAP-2025-v1 dihitung oleh Ahmad Fauzi (user-fo-01)
      const snap = store.getSnapshotById("SHU-2025", "SNAP-2025-v1")!;
      expect(snap.calculatedById).toBe("user-fo-01");

      // Ahmad Fauzi mencoba menyetujui kalkulasi miliknya sendiri
      expect(() => {
        store.approveCalculation("SHU-2025", "SNAP-2025-v1", foActor);
      }).toThrow(/Pembuat kalkulasi dilarang menyetujui/i);
    });

    it("2.2. Manager yang membuat kalkulasi juga dilarang menyetujui kalkulasi miliknya sendiri", () => {
      const store = useShuStore.getState();
      // Create new period and manager runs calculation
      const p = store.createPeriod(
        { fiscalYear: 2029, name: "Tahun Buku 2029", startDate: "2029-01-01", endDate: "2029-12-31" },
        managerActor
      );
      store.collectPeriodData(p.id, staffActor);
      store.updateFinancialInput(p.id, { totalRevenue: 100000000, totalExpense: 80000000, adjustmentAmount: 0 }, managerActor);

      const managerSnap = store.runCalculation(p.id, managerActor);
      expect(managerSnap.calculatedById).toBe("user-manager-01");

      store.submitForReview(p.id, managerSnap.id, managerActor);

      // Manager mencoba menyetujui kalkulasi yang dibuat oleh dirinya sendiri
      expect(() => {
        store.approveCalculation(p.id, managerSnap.id, managerActor);
      }).toThrow(/Pembuat kalkulasi dilarang menyetujui/i);
    });

    it("2.3. Staff dilarang menyetujui atau mempublikasikan SHU", () => {
      const store = useShuStore.getState();
      expect(() => {
        store.approveCalculation("SHU-2025", "SNAP-2025-v1", staffActor);
      }).toThrow(/tidak memiliki otoritas pengesahan/i);

      expect(() => {
        store.publishCalculation("SHU-2025", "SNAP-2025-v1", staffActor);
      }).toThrow(/Hanya pengurus .* yang berwenang mempublikasikan/i);
    });

    it("2.4. Administrator & Super Administrator dilarang mengeksekusi kalkulasi atau menyetujui SHU (SoD)", () => {
      const store = useShuStore.getState();

      // Admin teknis
      expect(() => {
        store.runCalculation("SHU-2025", adminActor);
      }).toThrow(/Administrator teknis tidak berwenang/i);

      expect(() => {
        store.approveCalculation("SHU-2025", "SNAP-2025-v1", adminActor);
      }).toThrow(/Administrator teknis tidak memiliki otoritas/i);

      // Super Admin
      expect(() => {
        store.runCalculation("SHU-2025", superAdminActor);
      }).toThrow(/Administrator teknis tidak berwenang/i);

      expect(() => {
        store.approveCalculation("SHU-2025", "SNAP-2025-v1", superAdminActor);
      }).toThrow(/Administrator teknis tidak memiliki otoritas/i);
    });

    it("2.5. Auditor berstatus murni pengawas (read-only) dan dilarang membuat, menghitung, atau menyetujui", () => {
      const store = useShuStore.getState();

      expect(() => {
        store.createPeriod(
          { fiscalYear: 2030, name: "Tahun Buku 2030", startDate: "2030-01-01", endDate: "2030-12-31" },
          auditorActor
        );
      }).toThrow(/tidak memiliki kewenangan membuat periode SHU/i);

      expect(() => {
        store.runCalculation("SHU-2025", auditorActor);
      }).toThrow(/tidak berwenang menjalankan kalkulasi/i);

      expect(() => {
        store.approveCalculation("SHU-2025", "SNAP-2025-v1", auditorActor);
      }).toThrow(/tidak memiliki otoritas pengesahan/i);
    });
  });

  describe("3. Privasi Anggota & Isolasi Data", () => {
    it("3.1. Anggota hanya dapat melihat data SHU miliknya sendiri pada periode yang telah dipublikasikan", () => {
      const store = useShuStore.getState();

      // Siti Rahma (DEMO-ID-0001) melihat SHU miliknya
      const sitiShu = store.getMemberPublishedShu("DEMO-ID-0001", memberActor1);
      expect(sitiShu.length).toBeGreaterThan(0);
      expect(sitiShu[0].distribution.memberId).toBe("DEMO-ID-0001");
      expect(sitiShu[0].period.status).toBe("published");
    });

    it("3.2. Anggota A dilarang keras mengintip atau membaca SHU milik Anggota B", () => {
      const store = useShuStore.getState();

      // Siti Rahma mencoba mengakses data Dian Pratama (DEMO-ID-0002)
      expect(() => {
        store.getMemberPublishedShu("DEMO-ID-0002", memberActor1);
      }).toThrow(/Anggota hanya dapat melihat rincian SHU miliknya sendiri/i);
    });

    it("3.3. Member tanpa memberId wajib ditolak secara fail-closed", () => {
      const store = useShuStore.getState();
      const invalidActor: ShuActor = { id: "user-anon", name: "Anon", role: "member", memberId: undefined };

      expect(() => {
        store.getMemberPublishedShu("DEMO-ID-0001", invalidActor);
      }).toThrow(/Identitas keanggotaan \(memberId\) tidak ditemukan/i);
    });

    it("3.4. Public visitor dan applicant ditolak dari akses SHU anggota", () => {
      const store = useShuStore.getState();
      const visitorActor: ShuActor = { id: "user-public", name: "Tamu", role: "public_visitor" };
      const applicantActor: ShuActor = { id: "user-applicant", name: "Pelamar", role: "applicant" };

      expect(() => {
        store.getMemberPublishedShu("DEMO-ID-0001", visitorActor);
      }).toThrow(/Pengunjung publik dan calon anggota tidak memiliki hak akses/i);

      expect(() => {
        store.getMemberPublishedShu("DEMO-ID-0001", applicantActor);
      }).toThrow(/Pengunjung publik dan calon anggota tidak memiliki hak akses/i);
    });

    it("3.5. Staff tanpa permission ditolak dari membaca SHU anggota", () => {
      const store = useShuStore.getState();
      expect(() => {
        store.getMemberPublishedShu("DEMO-ID-0001", staffActor);
      }).toThrow(/tidak memiliki izin melihat data SHU anggota/i);
    });

    it("3.6. Admin dan Super Admin ditolak dari hak finansial SHU anggota (SoD)", () => {
      const store = useShuStore.getState();
      expect(() => {
        store.getMemberPublishedShu("DEMO-ID-0001", adminActor);
      }).toThrow(/Administrator teknis dan Super Admin tidak memiliki hak akses/i);

      expect(() => {
        store.getMemberPublishedShu("DEMO-ID-0001", superAdminActor);
      }).toThrow(/Administrator teknis dan Super Admin tidak memiliki hak akses/i);
    });

    it("3.7. Auditor dapat membaca SHU anggota (read-only)", () => {
      const store = useShuStore.getState();
      const res = store.getMemberPublishedShu("DEMO-ID-0001", auditorActor);
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].distribution.memberId).toBe("DEMO-ID-0001");
    });

    it("3.8. Periode draft, calculated, under_review, rejected tidak dapat dikembalikan sebagai SHU final", () => {
      const store = useShuStore.getState();

      const sitiShu = store.getMemberPublishedShu("DEMO-ID-0001", memberActor1);
      const periodIds = sitiShu.map((s) => s.period.id);
      expect(periodIds).toContain("SHU-2024");
      expect(periodIds).not.toContain("SHU-2025");
      expect(periodIds).not.toContain("SHU-2026");
    });
  });

  describe("4. Otorisasi updatePolicyConfig & updateFinancialInput", () => {
    it("4.1. updatePolicyConfig tanpa actor atau actor tidak valid ditolak", () => {
      const store = useShuStore.getState();
      expect(() => {
        store.updatePolicyConfig(
          "SHU-2025",
          {
            cadangan: { percentage: 30 },
            jasa_modal: { percentage: 30 },
            jasa_usaha: { percentage: 25 },
            dana_pengurus: { percentage: 5 },
            dana_pendidikan: { percentage: 5 },
            dana_sosial: { percentage: 5 },
          },
          undefined,
          undefined,
          null as unknown as ShuActor
        );
      }).toThrow(/Identitas aktor \(actor\) wajib disertakan/i);
    });

    it("4.2. updatePolicyConfig ditolak untuk Admin, Super Admin, Member, Staff, dan Auditor", () => {
      const store = useShuStore.getState();
      const unauthorizedRoles = [adminActor, superAdminActor, memberActor1, staffActor, auditorActor];

      for (const unauthorized of unauthorizedRoles) {
        expect(() => {
          store.updatePolicyConfig(
            "SHU-2025",
            {
              cadangan: { percentage: 30 },
              jasa_modal: { percentage: 30 },
              jasa_usaha: { percentage: 25 },
              dana_pengurus: { percentage: 5 },
              dana_pendidikan: { percentage: 5 },
              dana_sosial: { percentage: 5 },
            },
            undefined,
            undefined,
            unauthorized
          );
        }).toThrow();
      }
    });

    it("4.3. Manager dan Treasurer yang sah dapat mengubah kebijakan alokasi", () => {
      const store = useShuStore.getState();

      const updatedByManager = store.updatePolicyConfig(
        "SHU-2025",
        {
          cadangan: { percentage: 35 },
          jasa_modal: { percentage: 25 },
          jasa_usaha: { percentage: 25 },
          dana_pengurus: { percentage: 5 },
          dana_pendidikan: { percentage: 5 },
          dana_sosial: { percentage: 5 },
        },
        undefined,
        undefined,
        managerActor
      );
      expect(updatedByManager.categories.cadangan.percentage).toBe(35);

      const treasurerActor: ShuActor = { id: "user-treasurer-01", name: "Sri Mulyani", role: "treasurer" };
      const updatedByTreasurer = store.updatePolicyConfig(
        "SHU-2025",
        {
          cadangan: { percentage: 30 },
          jasa_modal: { percentage: 30 },
          jasa_usaha: { percentage: 25 },
          dana_pengurus: { percentage: 5 },
          dana_pendidikan: { percentage: 5 },
          dana_sosial: { percentage: 5 },
        },
        undefined,
        undefined,
        treasurerActor
      );
      expect(updatedByTreasurer.categories.cadangan.percentage).toBe(30);
    });

    it("4.4. updateFinancialInput menolak Staff, Member, Auditor, Admin, dan Super Admin", () => {
      const store = useShuStore.getState();
      const unauthorized = [staffActor, memberActor1, auditorActor, adminActor, superAdminActor];

      for (const actor of unauthorized) {
        expect(() => {
          store.updateFinancialInput(
            "SHU-2025",
            { totalRevenue: 100000000, totalExpense: 70000000, adjustmentAmount: 0 },
            actor
          );
        }).toThrow();
      }
    });

    it("4.5. updateFinancialInput diterima untuk Finance Officer, Treasurer, dan Manager", () => {
      const store = useShuStore.getState();
      const treasurerActor: ShuActor = { id: "user-treasurer-01", name: "Sri Mulyani", role: "treasurer" };

      const foRes = store.updateFinancialInput(
        "SHU-2025",
        { totalRevenue: 200000000, totalExpense: 150000000, adjustmentAmount: 0 },
        foActor
      );
      expect(foRes.financialInput.netIncome).toBe(50000000);

      const trRes = store.updateFinancialInput(
        "SHU-2025",
        { totalRevenue: 220000000, totalExpense: 150000000, adjustmentAmount: 0 },
        treasurerActor
      );
      expect(trRes.financialInput.netIncome).toBe(70000000);
    });

  describe("5. Validasi Adjustment Audit & Invariant Lifecycle", () => {
    it("5.1. adjustPublishedShu menolak jika snapshotId tidak ditemukan atau milik periode lain", () => {
      const store = useShuStore.getState();

      expect(() => {
        store.adjustPublishedShu(
          "SHU-2024",
          "SNAP-NON-EXISTENT",
          "Koreksi omzet",
          "Hasil audit",
          managerActor
        );
      }).toThrow(/tidak ditemukan/i);

      expect(() => {
        store.adjustPublishedShu(
          "SHU-2024",
          "SNAP-2025-v1",
          "Koreksi omzet",
          "Hasil audit",
          managerActor
        );
      }).toThrow(/tidak ditemukan/i);
    });

    it("5.2. adjustPublishedShu menolak jika alasan atau ringkasan kosong", () => {
      const store = useShuStore.getState();

      expect(() => {
        store.adjustPublishedShu("SHU-2024", "SNAP-2024-v1", "   ", "Alasan valid", managerActor);
      }).toThrow(/Ringkasan penyesuaian audit wajib diisi/i);

      expect(() => {
        store.adjustPublishedShu("SHU-2024", "SNAP-2024-v1", "Ringkasan valid", "  ", managerActor);
      }).toThrow(/Alasan penyesuaian audit wajib diisi/i);
    });

    it("5.3. adjustPublishedShu menolak role tidak berwenang (Staff, Member, Auditor, Admin, Super Admin)", () => {
      const store = useShuStore.getState();
      const unauthorized = [staffActor, memberActor1, auditorActor, adminActor, superAdminActor];

      for (const u of unauthorized) {
        expect(() => {
          store.adjustPublishedShu("SHU-2024", "SNAP-2024-v1", "Ringkasan valid", "Alasan valid", u);
        }).toThrow(/Hanya pengurus dan bendahara/i);
      }
    });

    it("5.4. adjustPublishedShu berhasil mencatat log tanpa mengubah snapshot historis lama", () => {
      const store = useShuStore.getState();
      const snapBefore = store.getSnapshotById("SHU-2024", "SNAP-2024-v1")!;
      const totalMemberDistBefore = snapBefore.totalMemberDistribution;

      const log = store.adjustPublishedShu(
        "SHU-2024",
        "SNAP-2024-v1",
        "Penyesuaian rekonsiliasi kas Waserda",
        "Berita Acara Pengurus No. 04/BA/2025",
        managerActor
      );

      expect(log.id).toBeDefined();
      expect(log.snapshotId).toBe("SNAP-2024-v1");

      const period = store.getPeriodById("SHU-2024")!;
      expect(period.adjustmentLogs.some((l) => l.id === log.id)).toBe(true);

      const snapAfter = store.getSnapshotById("SHU-2024", "SNAP-2024-v1")!;
      expect(snapAfter.totalMemberDistribution).toBe(totalMemberDistBefore);
    });

    it("5.5. Invariant: Kalkulasi tidak seimbang dilarang diajukan, disetujui, maupun dipublikasikan", () => {
      const store = useShuStore.getState();
      const p = store.createPeriod(
        { fiscalYear: 2033, name: "Tahun Buku 2033", startDate: "2033-01-01", endDate: "2033-12-31" },
        managerActor
      );
      store.collectPeriodData(p.id, staffActor);

      useShuStore.setState({
        periods: useShuStore.getState().periods.map((item) => {
          if (item.id === p.id) {
            const fakeUnbalancedSnap = {
              id: `SNAP-2033-v1`,
              periodId: p.id,
              version: 1,
              calculatedAt: new Date().toISOString(),
              calculatedById: "user-fo-01",
              calculatedByName: "Ahmad Fauzi",
              calculatedByRole: "finance_officer" as const,
              financialInput: item.financialInput,
              policyConfigSnapshot: item.activePolicyConfig,
              allocationBreakdown: {} as ShuCalculationSnapshot["allocationBreakdown"],
              totalDistributableShu: 100000000,
              totalMemberDistribution: 50000000,
              roundingCorrection: { modalResidual: 0, usahaResidual: 0, totalResidual: 0 },
              isBalanced: false,
              unbalancedReason: "Alokasi Jasa Modal tidak dapat didistribusikan",
              memberDistributions: [],
              status: "calculated" as const,
              statusHistory: [],
            };
            return {
              ...item,
              status: "calculated" as const,
              activeSnapshotId: fakeUnbalancedSnap.id,
              snapshots: [fakeUnbalancedSnap],
            };
          }
          return item;
        }),
      });

      expect(() => {
        useShuStore.getState().submitForReview(p.id, "SNAP-2033-v1", foActor);
      }).toThrow(/Kalkulasi tidak seimbang .* dilarang diajukan/i);

      useShuStore.setState({
        periods: useShuStore.getState().periods.map((item) => {
          if (item.id === p.id) {
            return {
              ...item,
              snapshots: item.snapshots.map((s) => ({ ...s, status: "under_review" as const })),
            };
          }
          return item;
        }),
      });

      expect(() => {
        useShuStore.getState().approveCalculation(p.id, "SNAP-2033-v1", managerActor);
      }).toThrow(/Kalkulasi tidak seimbang dilarang disetujui/i);

      useShuStore.setState({
        periods: useShuStore.getState().periods.map((item) => {
          if (item.id === p.id) {
            return {
              ...item,
              snapshots: item.snapshots.map((s) => ({ ...s, status: "approved" as const })),
            };
          }
          return item;
        }),
      });

      expect(() => {
        useShuStore.getState().publishCalculation(p.id, "SNAP-2033-v1", managerActor);
      }).toThrow(/Kalkulasi tidak seimbang dilarang dipublikasikan/i);
    });
  });

  });
});
