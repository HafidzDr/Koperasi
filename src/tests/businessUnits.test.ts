// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  useBusinessUnitStore,
  BUSINESS_UNITS_STORAGE_KEY,
  BusinessUnitActor,
} from "../features/business-units/stores/businessUnitStore";
import { useMembershipStore } from "../features/membership/stores/membershipStore";
import { useLoanStore } from "../features/loans/stores/loanStore";
import { initialSeedBusinessUnits, initialSeedActivities } from "../features/business-units/mocks/businessUnitSeedData";
import { canPerformAction, hasPermission } from "../lib/rbac";

describe("PHASE 6 — Business Unit Management (Pengelolaan Unit Usaha)", () => {
  const managerActor: BusinessUnitActor = {
    id: "usr-manager",
    name: "Ratna Kusumawati",
    role: "manager",
  };

  const staffActor: BusinessUnitActor = {
    id: "usr-staff",
    name: "Dewi Lestari",
    role: "staff",
  };

  const financeOfficerActor: BusinessUnitActor = {
    id: "usr-fo",
    name: "Hendro Wibowo",
    role: "finance_officer",
  };

  const auditorActor: BusinessUnitActor = {
    id: "usr-auditor",
    name: "Bambang Sutrisno",
    role: "auditor",
  };

  const adminActor: BusinessUnitActor = {
    id: "usr-admin",
    name: "Eko Prasetyo",
    role: "admin",
  };

  const superAdminActor: BusinessUnitActor = {
    id: "usr-superadmin",
    name: "System Super Admin",
    role: "super_admin",
  };

  const memberActor1: BusinessUnitActor = {
    id: "usr-member-1",
    name: "Siti Rahma",
    role: "member",
    memberId: "DEMO-ID-0001",
  };

  const memberActor2: BusinessUnitActor = {
    id: "usr-member-2",
    name: "Budi Santoso",
    role: "member",
    memberId: "DEMO-ID-0002",
  };

  beforeEach(() => {
    localStorage.clear();
    useMembershipStore.getState().resetToSeed();
    useLoanStore.getState().resetToSeed();
    useBusinessUnitStore.getState().resetToSeed();
  });

  // 1. Membuat unit usaha valid
  it("1. Membuat unit usaha valid dengan status active dan audit trail awal", () => {
    const store = useBusinessUnitStore.getState();
    const initialCount = store.businessUnits.length;

    const newUnit = store.createBusinessUnit(
      {
        code: "WSR-02",
        name: "Waserda KMB Unit Sentra Timur",
        category: "retail_waserda",
        description: "Toko sembako dan kebutuhan harian anggota di wilayah Jakarta Timur.",
        picName: "Ahmad Fauzi",
        picPhone: "0812-9988-7766",
        operationalLocation: "Jl. Pemuda No. 45, Jakarta Timur",
      },
      managerActor
    );

    expect(newUnit).toBeDefined();
    expect(newUnit.code).toBe("WSR-02");
    expect(newUnit.status).toBe("active");
    expect(newUnit.history).toHaveLength(1);
    expect(newUnit.history[0].action).toBe("created");
    expect(newUnit.history[0].actorRole).toBe("manager");

    const updatedUnits = useBusinessUnitStore.getState().businessUnits;
    expect(updatedUnits.length).toBe(initialCount + 1);
    expect(updatedUnits.some((u) => u.code === "WSR-02")).toBe(true);
  });

  // 2. Menolak kode unit duplikat
  it("2. Menolak kode unit duplikat secara case-insensitive", () => {
    const store = useBusinessUnitStore.getState();
    const initialCount = store.businessUnits.length;

    // "WSR-01" already exists in seed data
    expect(() => {
      store.createBusinessUnit(
        {
          code: "wsr-01", // lowercase duplicate of WSR-01
          name: "Waserda Duplikat",
          category: "retail_waserda",
          description: "Mencoba membuat unit dengan kode sama",
          picName: "Tester",
          picPhone: "0812-0000-0000",
          operationalLocation: "Lokasi Test",
        },
        managerActor
      );
    }).toThrow(/sudah digunakan/i);

    // Verify state unchanged
    expect(useBusinessUnitStore.getState().businessUnits.length).toBe(initialCount);
  });

  // 3. Mengubah informasi unit usaha
  it("3. Mengubah informasi unit usaha dan mencatat riwayat perubahan", () => {
    const store = useBusinessUnitStore.getState();
    const targetUnit = store.businessUnits[0]; // BU-001
    const initialHistoryLength = targetUnit.history.length;

    const updated = store.updateBusinessUnit(
      targetUnit.id,
      {
        name: "Waserda KMB Mart Mandiri (Pusat)",
        picName: "Bambang Haryanto S.E.",
        operationalLocation: "Gedung Kantor Pusat KMB Lt. 1 & 2, Jakarta",
      },
      managerActor
    );

    expect(updated.name).toBe("Waserda KMB Mart Mandiri (Pusat)");
    expect(updated.picName).toBe("Bambang Haryanto S.E.");
    expect(updated.operationalLocation).toBe("Gedung Kantor Pusat KMB Lt. 1 & 2, Jakarta");
    expect(updated.history.length).toBe(initialHistoryLength + 1);
    expect(updated.history[updated.history.length - 1].action).toBe("updated");
  });

  // 4. Menonaktifkan unit usaha
  it("4. Menonaktifkan unit usaha dengan mencatat alasan penonaktifan", () => {
    const store = useBusinessUnitStore.getState();
    const activeUnit = store.businessUnits.find((u) => u.status === "active")!;

    const deactivated = store.deactivateBusinessUnit(
      activeUnit.id,
      "Evaluasi kinerja triwulan dan renovasi gerai",
      managerActor
    );

    expect(deactivated.status).toBe("inactive");
    const lastLog = deactivated.history[deactivated.history.length - 1];
    expect(lastLog.action).toBe("deactivated");
    expect(lastLog.details).toContain("Evaluasi kinerja triwulan dan renovasi gerai");
  });

  // 5. Mempertahankan riwayat unit nonaktif
  it("5. Mempertahankan seluruh data dan riwayat unit nonaktif tanpa ada kehilangan data", () => {
    const store = useBusinessUnitStore.getState();
    // BU-004 is inactive in initial seed
    const inactiveUnit = store.getUnitById("BU-004");
    expect(inactiveUnit).toBeDefined();
    expect(inactiveUnit!.status).toBe("inactive");
    expect(inactiveUnit!.history.length).toBeGreaterThanOrEqual(2);
    expect(inactiveUnit!.history.some((h) => h.action === "deactivated")).toBe(true);

    // Past activities for this unit are preserved
    const unitRecap = store.getPerformanceRecap("BU-004");
    expect(unitRecap).toBeDefined();
  });

  // 6. Menolak pencatatan pada unit nonaktif
  it("6. Menolak pencatatan transaksi operasional baru pada unit yang sedang nonaktif", () => {
    const store = useBusinessUnitStore.getState();
    const initialActivitiesCount = store.activities.length;

    // BU-004 is inactive
    expect(() => {
      store.recordActivity(
        {
          unitId: "BU-004",
          activityDate: "2026-02-25",
          activityType: "service",
          description: "Jasa perbaikan traktor alsintan pada unit nonaktif",
          amount: 500000,
        },
        staffActor
      );
    }).toThrow(/sedang nonaktif dan tidak dapat menerima pencatatan/i);

    // State unchanged
    expect(useBusinessUnitStore.getState().activities.length).toBe(initialActivitiesCount);
  });

  // 7. Mencatat aktivitas operasional valid
  it("7. Mencatat aktivitas operasional valid dengan nomor referensi unik dan status recorded", () => {
    const store = useBusinessUnitStore.getState();
    const initialCount = store.activities.length;

    const record = store.recordActivity(
      {
        unitId: "BU-001",
        activityDate: "2026-02-25",
        activityType: "sales",
        description: "Penjualan gula pasir premium 50 kg ke konsumen",
        quantity: 50,
        unitOfMeasure: "kg",
        amount: 850000,
        notes: "Struk POS #1092",
      },
      staffActor
    );

    expect(record).toBeDefined();
    expect(record.id).toMatch(/^TRX-BU-2026-\d{4}$/);
    expect(record.status).toBe("recorded");
    expect(record.amount).toBe(850000);
    expect(record.recordedById).toBe(staffActor.id);
    expect(record.recordedByRole).toBe("staff");

    expect(useBusinessUnitStore.getState().activities.length).toBe(initialCount + 1);

    // Finance Officer verifies the activity
    const verified = useBusinessUnitStore.getState().verifyActivity(record.id, financeOfficerActor);
    expect(verified.status).toBe("verified");
    expect(verified.verifiedById).toBe(financeOfficerActor.id);
  });

  // 8. Menolak nominal atau kuantitas tidak valid
  it("8. Menolak nominal tidak valid (<= 0) atau kuantitas tidak valid (<= 0)", () => {
    const store = useBusinessUnitStore.getState();

    // Nominal 0
    expect(() => {
      store.recordActivity(
        {
          unitId: "BU-001",
          activityDate: "2026-02-25",
          activityType: "sales",
          description: "Uji coba nominal 0",
          amount: 0,
        },
        staffActor
      );
    }).toThrow();

    // Nominal negatif
    expect(() => {
      store.recordActivity(
        {
          unitId: "BU-001",
          activityDate: "2026-02-25",
          activityType: "sales",
          description: "Uji coba nominal negatif",
          amount: -50000,
        },
        staffActor
      );
    }).toThrow();

    // Kuantitas negatif
    expect(() => {
      store.recordActivity(
        {
          unitId: "BU-001",
          activityDate: "2026-02-25",
          activityType: "sales",
          description: "Uji coba kuantitas negatif",
          quantity: -10,
          amount: 100000,
        },
        staffActor
      );
    }).toThrow();
  });

  // 9. Mencegah duplikasi nomor referensi
  it("9. Mencegah duplikasi nomor referensi transaksi operasional", () => {
    const store = useBusinessUnitStore.getState();

    const act1 = store.recordActivity(
      {
        unitId: "BU-001",
        activityDate: "2026-02-25",
        activityType: "sales",
        description: "Transaksi batch 1",
        amount: 100000,
      },
      staffActor
    );

    const act2 = store.recordActivity(
      {
        unitId: "BU-001",
        activityDate: "2026-02-25",
        activityType: "sales",
        description: "Transaksi batch 2",
        amount: 200000,
      },
      staffActor
    );

    expect(act1.id).not.toBe(act2.id);
    const allIds = useBusinessUnitStore.getState().activities.map((a) => a.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  // 10. Menghubungkan aktivitas dengan anggota yang valid
  it("10. Menghubungkan aktivitas transaksi dengan anggota aktif yang valid", () => {
    const store = useBusinessUnitStore.getState();

    const record = store.recordActivity(
      {
        unitId: "BU-001",
        activityDate: "2026-02-25",
        activityType: "sales",
        description: "Belanja sembako bulanan anggota Siti Rahma",
        amount: 350000,
        memberDemoId: "DEMO-ID-0001",
      },
      staffActor
    );

    expect(record.memberDemoId).toBe("DEMO-ID-0001");
    expect(record.memberName).toBe("Siti Rahma");
  });

  // 11. Menolak anggota yang tidak memenuhi ketentuan
  it("11. Menolak anggota yang tidak terdaftar atau tidak berstatus aktif", () => {
    const store = useBusinessUnitStore.getState();

    // 1. Anggota tidak terdaftar
    expect(() => {
      store.recordActivity(
        {
          unitId: "BU-001",
          activityDate: "2026-02-25",
          activityType: "sales",
          description: "Belanja anggota bodong",
          amount: 100000,
          memberDemoId: "DEMO-ID-9999",
        },
        staffActor
      );
    }).toThrow(/tidak terdaftar/i);

    // 2. Anggota yang tidak aktif
    const memStore = useMembershipStore.getState();
    const targetMember = memStore.members[0];
    const prevStatus = targetMember.status;
    targetMember.status = "inactive";

    try {
      expect(() => {
        store.recordActivity(
          {
            unitId: "BU-001",
            activityDate: "2026-02-25",
            activityType: "sales",
            description: "Belanja anggota nonaktif",
            amount: 100000,
            memberDemoId: targetMember.demoId,
          },
          staffActor
        );
      }).toThrow(/tidak aktif/i);
    } finally {
      targetMember.status = prevStatus;
      useMembershipStore.getState().resetToSeed();
    }
  });

  // 12. Membatasi akses anggota terhadap data anggota lain
  it("12. Membatasi akses anggota: Anggota hanya dapat mengakses data partisipasi miliknya sendiri", () => {
    const store = useBusinessUnitStore.getState();

    // Member 1 accesses own records -> SUCCESS
    const ownActivities = store.getMemberActivities("DEMO-ID-0001", memberActor1);
    expect(Array.isArray(ownActivities)).toBe(true);

    // Member 1 attempts to access Member 2's records -> DENIED with privacy error
    expect(() => {
      store.getMemberActivities("DEMO-ID-0002", memberActor1);
    }).toThrow(/Akses ditolak.*riwayat transaksi dan partisipasi miliknya sendiri/i);

    // Member 2 accesses own records -> SUCCESS
    const member2Own = store.getMemberActivities("DEMO-ID-0002", memberActor2);
    expect(Array.isArray(member2Own)).toBe(true);

    // Internal management (Staff/Finance Officer) can query member activities for service
    const staffQuery = store.getMemberActivities("DEMO-ID-0001", staffActor);
    expect(Array.isArray(staffQuery)).toBe(true);
  });

  // 13. Menolak akses Auditor untuk perubahan data (Read-Only)
  it("13. Menolak akses Auditor untuk tindakan pencatatan, pembaruan, verifikasi, atau penonaktifan unit", () => {
    const store = useBusinessUnitStore.getState();

    // 1. Create unit
    expect(() => {
      store.createBusinessUnit(
        {
          code: "AUD-01",
          name: "Unit Ilegal Auditor",
          category: "services",
          description: "Mencoba membuat unit",
          picName: "Auditor",
          picPhone: "0812-1111-2222",
          operationalLocation: "Lokasi",
        },
        auditorActor
      );
    }).toThrow(/Akses ditolak/i);

    // 2. Record activity
    expect(() => {
      store.recordActivity(
        {
          unitId: "BU-001",
          activityDate: "2026-02-25",
          activityType: "sales",
          description: "Auditor mencoba mencatat transaksi",
          amount: 100000,
        },
        auditorActor
      );
    }).toThrow(/Pemisahan Tugas/i);

    // 3. Deactivate unit
    expect(() => {
      store.deactivateBusinessUnit("BU-001", "Audit penonaktifan", auditorActor);
    }).toThrow(/Akses ditolak/i);

    // 4. Verify activity
    expect(() => {
      store.verifyActivity("TRX-BU-2026-0005", auditorActor);
    }).toThrow(/Akses ditolak|Pemisahan Tugas/i);
  });

  // 14. Menolak akses Admin dan Super Admin untuk tindakan operasional yang tidak diizinkan
  it("14. Menolak akses Admin dan Super Admin untuk tindakan transaksi operasional unit usaha (SoD)", () => {
    const store = useBusinessUnitStore.getState();

    // Admin attempting to record transaction
    expect(() => {
      store.recordActivity(
        {
          unitId: "BU-001",
          activityDate: "2026-02-25",
          activityType: "sales",
          description: "Admin mencoba mencatat transaksi",
          amount: 100000,
        },
        adminActor
      );
    }).toThrow(/Pemisahan Tugas \(SoD\)/i);

    // Super Admin attempting to record transaction
    expect(() => {
      store.recordActivity(
        {
          unitId: "BU-001",
          activityDate: "2026-02-25",
          activityType: "sales",
          description: "Super Admin mencoba mencatat transaksi",
          amount: 100000,
        },
        superAdminActor
      );
    }).toThrow(/Pemisahan Tugas \(SoD\)/i);

    // Admin attempting to create business unit
    expect(() => {
      store.createBusinessUnit(
        {
          code: "ADM-01",
          name: "Unit Admin",
          category: "services",
          description: "Unit admin",
          picName: "Admin",
          picPhone: "0812-3333-4444",
          operationalLocation: "Lokasi",
        },
        adminActor
      );
    }).toThrow(/Pemisahan Tugas/i);
  });

  // 15. Menolak akses tanpa permission
  it("15. Menolak akses tanpa permission (member tidak boleh create/record/deactivate)", () => {
    const store = useBusinessUnitStore.getState();

    expect(() => {
      store.createBusinessUnit(
        {
          code: "MBR-01",
          name: "Unit Anggota",
          category: "services",
          description: "Anggota coba buat unit",
          picName: "Member",
          picPhone: "0812-4444-5555",
          operationalLocation: "Lokasi",
        },
        memberActor1
      );
    }).toThrow(/Akses ditolak/i);

    expect(() => {
      store.recordActivity(
        {
          unitId: "BU-001",
          activityDate: "2026-02-25",
          activityType: "sales",
          description: "Member coba catat aktivitas",
          amount: 100000,
        },
        memberActor1
      );
    }).toThrow(/Akses ditolak/i);
  });

  // 16. Memastikan aksi yang ditolak tidak mengubah state
  it("16. Memastikan aksi yang ditolak tidak mengubah state maupun localStorage", () => {
    const store = useBusinessUnitStore.getState();
    const initialUnitsCount = store.businessUnits.length;
    const initialActsCount = store.activities.length;

    try {
      store.createBusinessUnit(
        {
          code: "FAIL-01",
          name: "Unit Gagal",
          category: "other",
          description: "Deskripsi",
          picName: "Tester",
          picPhone: "0812-0000-0000",
          operationalLocation: "Lokasi",
        },
        staffActor // Staff has no permission to create units
      );
    } catch {
      // Expected rejection
    }

    expect(useBusinessUnitStore.getState().businessUnits.length).toBe(initialUnitsCount);
    expect(useBusinessUnitStore.getState().activities.length).toBe(initialActsCount);
  });

  // 17. Memastikan persistensi localStorage berjalan
  it("17. Memastikan persistensi data ke localStorage berjalan dengan baik", () => {
    const store = useBusinessUnitStore.getState();

    store.createBusinessUnit(
      {
        code: "STR-01",
        name: "Unit Persistensi Test",
        category: "retail_waserda",
        description: "Unit untuk menguji persistensi storage",
        picName: "Storage PIC",
        picPhone: "0812-7777-8888",
        operationalLocation: "Lokasi Storage",
      },
      managerActor
    );

    const rawInStorage = localStorage.getItem(BUSINESS_UNITS_STORAGE_KEY);
    expect(rawInStorage).not.toBeNull();
    const parsed = JSON.parse(rawInStorage!);
    expect(parsed.businessUnits.some((u: { code: string }) => u.code === "STR-01")).toBe(true);
  });

  // 18. Memastikan pemulihan dari data localStorage corrupt
  it("18. Memastikan pemulihan otomatis dari data localStorage yang rusak (corrupt JSON / format invalid)", () => {
    localStorage.setItem(BUSINESS_UNITS_STORAGE_KEY, "{corrupt-invalid-json---");

    // Force re-initialization of store
    useBusinessUnitStore.getState().resetToSeed();
    const units = useBusinessUnitStore.getState().businessUnits;
    expect(units.length).toBe(initialSeedBusinessUnits.length);
    expect(units[0].code).toBe(initialSeedBusinessUnits[0].code);
  });

  // 19. Memastikan reset demo bekerja
  it("19. Memastikan resetToSeed() memulihkan seluruh data portofolio dan aktivitas awal", () => {
    const store = useBusinessUnitStore.getState();

    // Mutate state
    store.createBusinessUnit(
      {
        code: "RST-01",
        name: "Unit Sementara Sebelum Reset",
        category: "retail_waserda",
        description: "Deskripsi sementara",
        picName: "Tester",
        picPhone: "0812-0000-1111",
        operationalLocation: "Lokasi",
      },
      managerActor
    );
    expect(useBusinessUnitStore.getState().businessUnits.length).toBe(
      initialSeedBusinessUnits.length + 1
    );

    // Call resetToSeed
    useBusinessUnitStore.getState().resetToSeed();

    expect(useBusinessUnitStore.getState().businessUnits.length).toBe(
      initialSeedBusinessUnits.length
    );
    expect(useBusinessUnitStore.getState().activities.length).toBe(
      initialSeedActivities.length
    );
  });

  // 20. Memastikan agregasi operasional akurat
  it("20. Memastikan perhitungan agregasi kinerja operasional akurat dan transaksi dibatalkan dikecualikan", () => {
    const store = useBusinessUnitStore.getState();
    const recapInitial = store.getPerformanceRecap();

    expect(recapInitial.grossRevenue).toBeGreaterThan(0);
    expect(recapInitial.totalExpenditure).toBeGreaterThan(0);

    // Add a recorded sales activity
    const newSale = store.recordActivity(
      {
        unitId: "BU-001",
        activityDate: "2026-02-25",
        activityType: "sales",
        description: "Penjualan beras premium 100 kg",
        quantity: 100,
        amount: 1500000,
      },
      staffActor
    );

    const recapAfterSale = useBusinessUnitStore.getState().getPerformanceRecap();
    expect(recapAfterSale.grossRevenue).toBe(recapInitial.grossRevenue + 1500000);

    // Now cancel that sale
    useBusinessUnitStore.getState().cancelActivity(
      newSale.id,
      "Salah input faktur penjualan",
      staffActor
    );

    const recapAfterCancel = useBusinessUnitStore.getState().getPerformanceRecap();
    // Gross revenue should revert back
    expect(recapAfterCancel.grossRevenue).toBe(recapInitial.grossRevenue);
    expect(recapAfterCancel.cancelledActivities).toBe(recapInitial.cancelledActivities + 1);
  });

  // 21. Memastikan data partisipasi anggota dapat dibaca sebagai sumber Phase 7 (SHU Engine)
  it("21. Memastikan data partisipasi ekonomi anggota dapat dibaca dan teragregasi rapi untuk Phase 7", () => {
    const store = useBusinessUnitStore.getState();

    // Query participation for Siti Rahma (DEMO-ID-0001)
    const part1 = store.getMemberEconomicParticipation("DEMO-ID-0001");
    expect(part1.memberDemoId).toBe("DEMO-ID-0001");
    expect(part1.memberName).toBe("Siti Rahma");
    // Seed has 1 belanja sembako (285.000) and 1 pasokan kopi (11.250.000)
    expect(part1.totalSpending).toBe(285000);
    expect(part1.totalCommoditySupply).toBe(11250000);
    expect(part1.totalTransactionCount).toBe(2);
    expect(part1.activities).toHaveLength(2);

    // Query participation for Dian Pratama (DEMO-ID-0007)
    const part2 = store.getMemberEconomicParticipation("DEMO-ID-0007");
    expect(part2.memberDemoId).toBe("DEMO-ID-0007");
    expect(part2.totalSpending).toBe(198000);
  });

  // 22. Memastikan tidak ada perubahan saldo simpanan dan pinjaman
  it("22. Memastikan seluruh aktivitas unit usaha TIDAK mengubah saldo simpanan maupun pinjaman anggota (Integritas Saldo Terjaga)", () => {
    const memStore = useMembershipStore.getState();
    const loanStore = useLoanStore.getState();

    // Snapshot member balances before operations
    const memberSnapshotsBefore = memStore.members.map((m) => ({
      id: m.id,
      demoId: m.demoId,
      saldoPokok: m.saldoPokok,
      saldoWajib: m.saldoWajib,
      saldoSukarela: m.saldoSukarela,
    }));

    const loanSnapshotsBefore = loanStore.loans.map((l) => ({
      id: l.id,
      memberDemoId: l.memberDemoId,
      remainingPrincipal: l.remainingPrincipal,
      status: l.status,
    }));

    const buStore = useBusinessUnitStore.getState();

    // Perform multiple heavy business unit operations
    buStore.recordActivity(
      {
        unitId: "BU-001",
        activityDate: "2026-02-25",
        activityType: "sales",
        description: "Belanja sembako Siti Rahma",
        amount: 500000,
        memberDemoId: "DEMO-ID-0001",
      },
      staffActor
    );

    buStore.recordActivity(
      {
        unitId: "BU-002",
        activityDate: "2026-02-25",
        activityType: "member_supply",
        description: "Pasokan biji kopi Dian Pratama",
        amount: 5000000,
        memberDemoId: "DEMO-ID-0007",
      },
      staffActor
    );

    buStore.recordActivity(
      {
        unitId: "BU-001",
        activityDate: "2026-02-25",
        activityType: "purchase",
        description: "Beli stok grosir Waserda",
        amount: 8000000,
      },
      staffActor
    );

    // Snapshot member balances after operations
    const memStoreAfter = useMembershipStore.getState();
    for (const snap of memberSnapshotsBefore) {
      const current = memStoreAfter.members.find((m) => m.id === snap.id)!;
      expect(current.saldoPokok).toBe(snap.saldoPokok);
      expect(current.saldoWajib).toBe(snap.saldoWajib);
      expect(current.saldoSukarela).toBe(snap.saldoSukarela);
    }

    const loanStoreAfter = useLoanStore.getState();
    for (const snap of loanSnapshotsBefore) {
      const current = loanStoreAfter.loans.find((l) => l.id === snap.id)!;
      expect(current.remainingPrincipal).toBe(snap.remainingPrincipal);
      expect(current.status).toBe(snap.status);
    }
  });

  // RBAC Permission checks regression verification
  describe("RBAC Permissions Verification for Business Units", () => {
    it("Manager has all business_units permissions", () => {
      expect(hasPermission("manager", "business_units:view")).toBe(true);
      expect(hasPermission("manager", "business_units:create")).toBe(true);
      expect(hasPermission("manager", "business_units:update")).toBe(true);
      expect(hasPermission("manager", "business_units:deactivate")).toBe(true);
      expect(hasPermission("manager", "business_units:record")).toBe(true);
      expect(hasPermission("manager", "business_units:verify")).toBe(true);
      expect(hasPermission("manager", "business_units:export")).toBe(true);
    });

    it("Staff has view, record, verify permissions but NOT create or deactivate", () => {
      expect(hasPermission("staff", "business_units:view")).toBe(true);
      expect(hasPermission("staff", "business_units:record")).toBe(true);
      expect(hasPermission("staff", "business_units:verify")).toBe(true);
      expect(hasPermission("staff", "business_units:create")).toBe(false);
      expect(hasPermission("staff", "business_units:deactivate")).toBe(false);
    });

    it("Finance Officer has view, record, verify, export permissions", () => {
      expect(hasPermission("finance_officer", "business_units:view")).toBe(true);
      expect(hasPermission("finance_officer", "business_units:record")).toBe(true);
      expect(hasPermission("finance_officer", "business_units:verify")).toBe(true);
      expect(hasPermission("finance_officer", "business_units:export")).toBe(true);
      expect(hasPermission("finance_officer", "business_units:create")).toBe(false);
      expect(hasPermission("finance_officer", "business_units:deactivate")).toBe(false);
    });

    it("Treasurer has view and export permissions but NOT record, verify, create", () => {
      expect(hasPermission("treasurer", "business_units:view")).toBe(true);
      expect(hasPermission("treasurer", "business_units:export")).toBe(true);
      expect(hasPermission("treasurer", "business_units:record")).toBe(false);
      expect(hasPermission("treasurer", "business_units:verify")).toBe(false);
      expect(hasPermission("treasurer", "business_units:create")).toBe(false);
    });

    it("Auditor has strictly view and export permissions, ZERO mutation permissions", () => {
      expect(hasPermission("auditor", "business_units:view")).toBe(true);
      expect(hasPermission("auditor", "business_units:export")).toBe(true);
      expect(hasPermission("auditor", "business_units:record")).toBe(false);
      expect(hasPermission("auditor", "business_units:verify")).toBe(false);
      expect(hasPermission("auditor", "business_units:create")).toBe(false);
      expect(hasPermission("auditor", "business_units:update")).toBe(false);
      expect(hasPermission("auditor", "business_units:deactivate")).toBe(false);
    });

    it("Admin and Super Admin have ZERO business_units permissions (SoD)", () => {
      expect(canPerformAction("admin", "business_units", "record")).toBe(false);
      expect(canPerformAction("admin", "business_units", "create")).toBe(false);
      expect(canPerformAction("super_admin", "business_units", "record")).toBe(false);
      expect(canPerformAction("super_admin", "business_units", "create")).toBe(false);
    });
  });
});
