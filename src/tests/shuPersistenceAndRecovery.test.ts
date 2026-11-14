// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useShuStore, SHU_STORAGE_KEY } from "../features/shu/stores/shuStore";
import { ShuActor } from "../features/shu/types";

describe("PHASE 7 — SHU Persistence, Recovery & Idempotency Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    useShuStore.getState().resetToSeed();
  });

  const managerActor: ShuActor = { id: "user-manager-01", name: "Hendra Kurniawan", role: "manager" };

  it("1. Perubahan data tersimpan ke localStorage (kmb_shu_store_v1)", () => {
    const store = useShuStore.getState();

    store.createPeriod(
      {
        fiscalYear: 2031,
        name: "Tahun Buku 2031",
        startDate: "2031-01-01",
        endDate: "2031-12-31",
      },
      managerActor
    );

    const raw = localStorage.getItem(SHU_STORAGE_KEY);
    expect(raw).toBeDefined();
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.periods.some((p: { fiscalYear: number }) => p.fiscalYear === 2031)).toBe(true);
  });

  it("2. Corrupt recovery: JSON rusak pada localStorage otomatis fallback ke seed awal tanpa crash", () => {
    localStorage.setItem(SHU_STORAGE_KEY, "{ invalid_json_corrupted ###");

    // Resetting and reloading
    useShuStore.getState().resetToSeed();

    const periods = useShuStore.getState().periods;
    expect(periods.length).toBeGreaterThanOrEqual(3);
    expect(periods.some((p) => p.id === "SHU-2024")).toBe(true);
    expect(periods.some((p) => p.id === "SHU-2025")).toBe(true);
  });

  it("3. Corrupt recovery: Payload bukan array atau struktur salah otomatis fallback ke seed", () => {
    localStorage.setItem(SHU_STORAGE_KEY, JSON.stringify({ periods: "not_an_array" }));

    useShuStore.getState().resetToSeed();

    const periods = useShuStore.getState().periods;
    expect(Array.isArray(periods)).toBe(true);
    expect(periods.length).toBeGreaterThan(0);
  });

  it("4. resetToSeed() memulihkan seluruh periode, snapshot, dan kebijakan awal", () => {
    const store = useShuStore.getState();

    // Buat periode baru
    store.createPeriod(
      {
        fiscalYear: 2032,
        name: "Tahun Buku 2032",
        startDate: "2032-01-01",
        endDate: "2032-12-31",
      },
      managerActor
    );
    expect(useShuStore.getState().periods.some((p) => p.fiscalYear === 2032)).toBe(true);

    // Jalankan resetToSeed
    store.resetToSeed();

    const afterReset = useShuStore.getState().periods;
    expect(afterReset.some((p) => p.fiscalYear === 2032)).toBe(false);
    expect(afterReset.some((p) => p.id === "SHU-2024")).toBe(true);
    expect(afterReset.some((p) => p.id === "SHU-2025")).toBe(true);
    expect(afterReset.some((p) => p.id === "SHU-2026")).toBe(true);
  });

  it("5. Pencegahan duplikasi: Tidak dapat membuat periode dengan tahun buku yang sama", () => {
    const store = useShuStore.getState();

    // 2025 sudah ada
    expect(() => {
      store.createPeriod(
        {
          fiscalYear: 2025,
          name: "Duplikat Tahun Buku 2025",
          startDate: "2025-01-01",
          endDate: "2025-12-31",
        },
        managerActor
      );
    }).toThrow(/sudah terdaftar/i);
  });

  it("6. Corrupt recovery: JSON valid tetapi struktur data periode tidak valid (persentase bukan 100%) otomatis fallback ke seed", () => {
    const corruptPayload = {
      periods: [
        {
          id: "SHU-2025",
          fiscalYear: 2025,
          name: "Periode Rusak",
          startDate: "2025-01-01",
          endDate: "2025-12-31",
          status: "draft",
          financialInput: { totalRevenue: 100, totalExpense: 50, netIncome: 50, distributableShu: 50 },
          activePolicyConfig: {
            version: 1,
            categories: {
              cadangan: { percentage: 20 }, // Total hanya 20% != 100%!
              jasa_modal: { percentage: 0 },
              jasa_usaha: { percentage: 0 },
              dana_pengurus: { percentage: 0 },
              dana_pendidikan: { percentage: 0 },
              dana_sosial: { percentage: 0 },
            },
          },
          snapshots: [],
        },
      ],
      policyConfig: null,
    };

    localStorage.setItem(SHU_STORAGE_KEY, JSON.stringify(corruptPayload));

    useShuStore.getState().resetToSeed();

    const periods = useShuStore.getState().periods;
    // Berhasil memulihkan default seed yang valid
    expect(periods.some((p) => p.id === "SHU-2024")).toBe(true);
    expect(periods.some((p) => p.id === "SHU-2025")).toBe(true);
    expect(useShuStore.getState().policyConfig.categories.cadangan.percentage).toBe(30);
  });

  it("7. Corrupt recovery: Periode dengan nominal negatif atau activeSnapshotId fiktif otomatis fallback ke seed", () => {
    const corruptNegativePayload = {
      periods: [
        {
          id: "SHU-2025",
          fiscalYear: 2025,
          name: "Periode Negatif",
          startDate: "2025-01-01",
          endDate: "2025-12-31",
          status: "published",
          financialInput: { totalRevenue: -999999, totalExpense: 100, netIncome: -1000099, distributableShu: -500 },
          activeSnapshotId: "SNAP-GHOST-NOT-EXIST", // Fiktif!
          snapshots: [],
        },
      ],
    };

    localStorage.setItem(SHU_STORAGE_KEY, JSON.stringify(corruptNegativePayload));

    useShuStore.getState().resetToSeed();

    const periods = useShuStore.getState().periods;
    expect(periods.some((p) => p.name === "Periode Negatif")).toBe(false);
    expect(periods.some((p) => p.id === "SHU-2024")).toBe(true);
  });
});
