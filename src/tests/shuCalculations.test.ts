import { describe, it, expect } from "vitest";
import {
  validatePolicyPercentages,
  validateFinancialInput,
  computeAllocations,
  computeMemberDistributions,
  MemberSavingsData,
  MemberParticipationData,
  MemberCandidate,
} from "../features/shu/utils/shuCalculations";
import { defaultShuPolicyConfig } from "../features/shu/mocks/shuSeedData";
import {
  ShuAllocationCategoryKey,
  AllocationCategoryConfig,
  ShuPolicyConfig,
  updatePolicyCategoriesSchema,
} from "../features/shu/types";

describe("PHASE 7 — SHU Calculation Engine & Data Source Integrity Tests", () => {
  const policy: ShuPolicyConfig = defaultShuPolicyConfig;

  describe("1. Validasi Alokasi Persentase", () => {
    it("1.1. Alokasi persentase tepat 100% diterima (valid)", () => {
      const result = validatePolicyPercentages(policy.categories);
      expect(result.isValid).toBe(true);
      expect(result.totalPercentage).toBe(100);
      expect(result.error).toBeUndefined();
    });

    it("1.2. Alokasi kurang dari 100% ditolak", () => {
      const modified: Record<ShuAllocationCategoryKey, AllocationCategoryConfig> = {
        ...policy.categories,
        cadangan: { ...policy.categories.cadangan, percentage: 20 }, // Total becomes 90%
      };
      const result = validatePolicyPercentages(modified);
      expect(result.isValid).toBe(false);
      expect(result.totalPercentage).toBe(90);
      expect(result.error).toContain("harus tepat 100%");
    });

    it("1.3. Alokasi lebih dari 100% ditolak", () => {
      const modified: Record<ShuAllocationCategoryKey, AllocationCategoryConfig> = {
        ...policy.categories,
        cadangan: { ...policy.categories.cadangan, percentage: 45 }, // Total becomes 115%
      };
      const result = validatePolicyPercentages(modified);
      expect(result.isValid).toBe(false);
      expect(result.totalPercentage).toBe(115);
      expect(result.error).toContain("harus tepat 100%");
    });

    it("1.4. Alokasi negatif pada salah satu kategori ditolak", () => {
      const modified: Record<ShuAllocationCategoryKey, AllocationCategoryConfig> = {
        ...policy.categories,
        cadangan: { ...policy.categories.cadangan, percentage: -10 },
      };
      const result = validatePolicyPercentages(modified);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("tidak boleh negatif");
    });
    it("1.5. Menolak total 100.004% (presisi lebih dari 2 desimal)", () => {
      const modified: Record<ShuAllocationCategoryKey, AllocationCategoryConfig> = {
        ...policy.categories,
        cadangan: { ...policy.categories.cadangan, percentage: 30.004 },
      };
      const result = validatePolicyPercentages(modified);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("presisi lebih dari 2 desimal");
    });

    it("1.6. Menolak total 99.996% (presisi lebih dari 2 desimal)", () => {
      const modified: Record<ShuAllocationCategoryKey, AllocationCategoryConfig> = {
        ...policy.categories,
        cadangan: { ...policy.categories.cadangan, percentage: 29.996 },
      };
      const result = validatePolicyPercentages(modified);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("presisi lebih dari 2 desimal");
    });

    it("1.7. Menolak total 100.01% dan 99.99%", () => {
      const plusOne: Record<ShuAllocationCategoryKey, AllocationCategoryConfig> = {
        ...policy.categories,
        cadangan: { ...policy.categories.cadangan, percentage: 30.01 },
      };
      const resPlus = validatePolicyPercentages(plusOne);
      expect(resPlus.isValid).toBe(false);
      expect(resPlus.error).toContain("harus tepat 100");

      const minusOne: Record<ShuAllocationCategoryKey, AllocationCategoryConfig> = {
        ...policy.categories,
        cadangan: { ...policy.categories.cadangan, percentage: 29.99 },
      };
      const resMinus = validatePolicyPercentages(minusOne);
      expect(resMinus.isValid).toBe(false);
      expect(resMinus.error).toContain("harus tepat 100");
    });

    it("1.8. Zod schema updatePolicyCategoriesSchema menolak nilai tidak tepat 100.00% atau presisi > 2 desimal", () => {
      // 100.004
      expect(
        updatePolicyCategoriesSchema.safeParse({
          cadangan: 30.004,
          jasa_modal: 30,
          jasa_usaha: 25,
          dana_pengurus: 5,
          dana_pendidikan: 5,
          dana_sosial: 5,
        }).success
      ).toBe(false);

      // 99.996
      expect(
        updatePolicyCategoriesSchema.safeParse({
          cadangan: 29.996,
          jasa_modal: 30,
          jasa_usaha: 25,
          dana_pengurus: 5,
          dana_pendidikan: 5,
          dana_sosial: 5,
        }).success
      ).toBe(false);

      // 100.01
      expect(
        updatePolicyCategoriesSchema.safeParse({
          cadangan: 30.01,
          jasa_modal: 30,
          jasa_usaha: 25,
          dana_pengurus: 5,
          dana_pendidikan: 5,
          dana_sosial: 5,
        }).success
      ).toBe(false);

      // 99.99
      expect(
        updatePolicyCategoriesSchema.safeParse({
          cadangan: 29.99,
          jasa_modal: 30,
          jasa_usaha: 25,
          dana_pengurus: 5,
          dana_pendidikan: 5,
          dana_sosial: 5,
        }).success
      ).toBe(false);

      // Tepat 100.00
      expect(
        updatePolicyCategoriesSchema.safeParse({
          cadangan: 30,
          jasa_modal: 30,
          jasa_usaha: 25,
          dana_pengurus: 5,
          dana_pendidikan: 5,
          dana_sosial: 5,
        }).success
      ).toBe(true);
    });

    it("1.9. computeAllocations: Invariant sum(allocatedAmount) === distributableShu selalu terpenuhi untuk berbagai nominal", () => {
      const testAmounts = [1, 7, 99, 1000, 33333, 70000000, 1000000000, 987654321];

      for (const amount of testAmounts) {
        const alloc = computeAllocations(amount, policy.categories);
        const sum = Object.values(alloc).reduce((acc, curr) => acc + curr.allocatedAmount, 0);
        expect(sum).toBe(amount);
        for (const item of Object.values(alloc)) {
          expect(Number.isInteger(item.allocatedAmount)).toBe(true);
          expect(item.allocatedAmount).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it("1.10. computeAllocations: Gagal secara eksplisit bila input desimal, negatif, atau persentase tidak valid", () => {
      expect(() => {
        computeAllocations(100.5, policy.categories); // Desimal
      }).toThrow(/bilangan bulat integer/i);

      expect(() => {
        computeAllocations(-500, policy.categories); // Negatif
      }).toThrow(/non-negatif/i);

      const invalidCategories = {
        ...policy.categories,
        cadangan: { ...policy.categories.cadangan, percentage: 30.01 },
      };
      expect(() => {
        computeAllocations(1000000, invalidCategories);
      }).toThrow(/tepat 100/i);
    });

  });

  describe("2. Kinerja Keuangan & Hasil Usaha Bersih", () => {
    it("2.1. Pendapatan dan beban tidak tertukar, net income = pendapatan - beban + koreksi", () => {
      const valid = validateFinancialInput({
        totalRevenue: 500000000,
        totalExpense: 350000000,
        operatingIncome: 150000000,
        adjustmentAmount: 10000000,
        adjustmentReason: "Koreksi audit pendapatan jasa",
        netIncome: 160000000,
        distributableShu: 160000000,
        isSimulation: true,
      });
      expect(valid.isValid).toBe(true);
    });

    it("2.2. Menolak bila operating income atau net income dibuat lebih besar dari formula", () => {
      const invalid = validateFinancialInput({
        totalRevenue: 500000000,
        totalExpense: 350000000,
        operatingIncome: 200000000, // Salah! harus 150.000.000
        adjustmentAmount: 0,
        netIncome: 200000000,
        distributableShu: 200000000,
        isSimulation: true,
      });
      expect(invalid.isValid).toBe(false);
      expect(invalid.error).toBeDefined();
    });

    it("2.3. Koreksi penyesuaian non-nol wajib memiliki alasan minimal 3 karakter", () => {
      const missingReason = validateFinancialInput({
        totalRevenue: 500000000,
        totalExpense: 350000000,
        operatingIncome: 150000000,
        adjustmentAmount: 5000000,
        adjustmentReason: "  ", // Kosong!
        netIncome: 155000000,
        distributableShu: 155000000,
        isSimulation: true,
      });
      expect(missingReason.isValid).toBe(false);
      expect(missingReason.error).toContain("Alasan koreksi/penyesuaian wajib diisi");
    });

    it("2.4. Hasil usaha bersih nol menghasilkan distributable SHU = 0 dan alokasi 0", () => {
      const alloc = computeAllocations(0, policy.categories);
      expect(alloc.cadangan.allocatedAmount).toBe(0);
      expect(alloc.jasa_modal.allocatedAmount).toBe(0);
      expect(alloc.jasa_usaha.allocatedAmount).toBe(0);
      expect(alloc.dana_pengurus.allocatedAmount).toBe(0);
      expect(alloc.dana_pendidikan.allocatedAmount).toBe(0);
      expect(alloc.dana_sosial.allocatedAmount).toBe(0);
    });

    it("2.5. Hasil usaha bersih negatif (rugi) menghasilkan distributable SHU = 0 dan tidak ada distribusi positif", () => {
      const netIncome = -50000000;
      const distributableShu = Math.max(netIncome, 0);
      expect(distributableShu).toBe(0);

      const alloc = computeAllocations(distributableShu, policy.categories);
      expect(alloc.cadangan.allocatedAmount).toBe(0);
      expect(alloc.jasa_modal.allocatedAmount).toBe(0);
      expect(alloc.jasa_usaha.allocatedAmount).toBe(0);

      // Memastikan input negatif pada computeAllocations langsung ditolak
      expect(() => {
        computeAllocations(-50000000, policy.categories);
      }).toThrow(/non-negatif/i);
    });
  });

  describe("3. Distribusi Anggota, Pembulatan Rupiah & Sumber Partisipasi", () => {
    const mockCandidates: MemberCandidate[] = [
      { id: "DEMO-ID-0001", name: "Siti Rahma", memberNumber: "KMB-2026-0001", isActive: true },
      { id: "DEMO-ID-0002", name: "Dian Pratama", memberNumber: "KMB-2026-0002", isActive: true },
      { id: "DEMO-ID-0003", name: "Eko Prasetyo", memberNumber: "KMB-2026-0003", isActive: true },
      { id: "DEMO-ID-0004", name: "Non-Aktif Member", memberNumber: "KMB-2026-0004", isActive: false },
    ];

    const mockSavingsMap = new Map<string, MemberSavingsData>([
      ["DEMO-ID-0001", { saldoPokok: 100000, saldoWajib: 1000000, saldoSukarela: 500000 }],
      ["DEMO-ID-0002", { saldoPokok: 100000, saldoWajib: 600000, saldoSukarela: 200000 }],
      ["DEMO-ID-0003", { saldoPokok: 100000, saldoWajib: 400000, saldoSukarela: 100000 }],
      ["DEMO-ID-0004", { saldoPokok: 100000, saldoWajib: 500000, saldoSukarela: 0 }],
    ]);

    const mockParticipationMap = new Map<string, MemberParticipationData>([
      ["DEMO-ID-0001", { spending: 3000000, commoditySupply: 2000000 }], // 5.000.000
      ["DEMO-ID-0002", { spending: 2000000, commoditySupply: 1000000 }], // 3.000.000
      ["DEMO-ID-0003", { spending: 1500000, commoditySupply: 500000 }],  // 2.000.000
      ["DEMO-ID-0004", { spending: 1000000, commoditySupply: 0 }],
    ]);

    it("3.1. Pembulatan menghasilkan integer Rupiah dan total distribusi sama persis dengan total alokasi anggota", () => {
      const jasaModalPool = 10000000; // Rp 10.000.000
      const jasaUsahaPool = 10000000; // Rp 10.000.000

      const result = computeMemberDistributions(
        mockCandidates,
        mockSavingsMap,
        mockParticipationMap,
        jasaModalPool,
        jasaUsahaPool,
        policy
      );

      expect(result.isBalanced).toBe(true);
      expect(result.totalDistributed).toBe(jasaModalPool + jasaUsahaPool);

      let sumModal = 0;
      let sumUsaha = 0;
      for (const d of result.distributions) {
        expect(Number.isInteger(d.jasaModalFinal)).toBe(true);
        expect(Number.isInteger(d.jasaUsahaFinal)).toBe(true);
        expect(Number.isInteger(d.totalShu)).toBe(true);
        expect(d.totalShu).toBeGreaterThanOrEqual(0); // Nol negatif
        sumModal += d.jasaModalFinal;
        sumUsaha += d.jasaUsahaFinal;
      }

      expect(sumModal).toBe(jasaModalPool);
      expect(sumUsaha).toBe(jasaUsahaPool);
    });

    it("3.2. Anggota tidak aktif (isActive = false) dikecualikan dari distribusi SHU", () => {
      const result = computeMemberDistributions(
        mockCandidates,
        mockSavingsMap,
        mockParticipationMap,
        10000000,
        10000000,
        policy
      );

      const nonActive = result.distributions.find((d) => d.memberId === "DEMO-ID-0004");
      expect(nonActive).toBeDefined();
      expect(nonActive?.status).toBe("excluded");
      expect(nonActive?.totalShu).toBe(0);
      expect(nonActive?.exclusionReason).toBeDefined();
    });

    it("3.3. Simpanan pokok TIDAK dihitung sebagai modal bila kebijakan includeSimpananPokok = false (U-07)", () => {
      const policyWithoutPokok: ShuPolicyConfig = {
        ...policy,
        capitalSources: { ...policy.capitalSources, includeSimpananPokok: false },
      };

      const result = computeMemberDistributions(
        mockCandidates,
        mockSavingsMap,
        mockParticipationMap,
        10000000,
        10000000,
        policyWithoutPokok
      );

      // Siti Rahma saldoWajib = 1.000.000, saldoPokok = 100.000. Should be 1.000.000
      const siti = result.distributions.find((d) => d.memberId === "DEMO-ID-0001");
      expect(siti?.qualifyingCapital).toBe(1000000);
    });

    it("3.4. Simpanan pokok DIHITUNG sebagai modal bila kebijakan includeSimpananPokok diaktifkan", () => {
      const policyWithPokok: ShuPolicyConfig = {
        ...policy,
        capitalSources: { ...policy.capitalSources, includeSimpananPokok: true },
      };

      const result = computeMemberDistributions(
        mockCandidates,
        mockSavingsMap,
        mockParticipationMap,
        10000000,
        10000000,
        policyWithPokok
      );

      // Siti Rahma saldoWajib = 1.000.000, saldoPokok = 100.000. Total = 1.100.000
      const siti = result.distributions.find((d) => d.memberId === "DEMO-ID-0001");
      expect(siti?.qualifyingCapital).toBe(1100000);
    });

    it("3.5. Saldo pinjaman atau pokok pinjaman tidak boleh menjadi komponen modal maupun pendapatan", () => {
      // Perhitungan hanya membaca savingsMap dan participationMap. Data pinjaman (Loan Management) tidak pernah diinput.
      const result = computeMemberDistributions(
        mockCandidates,
        mockSavingsMap,
        mockParticipationMap,
        10000000,
        10000000,
        policy
      );

      for (const d of result.distributions) {
        // Modal murni berasal dari simpanan wajib (+ pokok jika dikonfigurasi)
        expect(d.qualifyingCapital).toBeLessThanOrEqual(1000000);
      }
    });

    it("3.6. Pool jasa usaha positif tanpa partisipasi verified menghasilkan isBalanced = false dan dana tidak hilang", () => {
      const zeroPartMap = new Map<string, MemberParticipationData>([
        ["DEMO-ID-0001", { spending: 0, commoditySupply: 0 }],
        ["DEMO-ID-0002", { spending: 0, commoditySupply: 0 }],
        ["DEMO-ID-0003", { spending: 0, commoditySupply: 0 }],
      ]);

      const result = computeMemberDistributions(
        mockCandidates,
        mockSavingsMap,
        zeroPartMap,
        10000000,
        10000000,
        policy
      );

      for (const d of result.distributions) {
        expect(d.jasaUsahaFinal).toBe(0);
        expect(d.verifiedParticipation).toBe(0);
      }
      expect(result.isBalanced).toBe(false);
      expect(result.undistributedUsahaPool).toBe(10000000);
      expect(result.unbalancedReason).toContain("Jasa Usaha");
    });

    it("3.7. Pool jasa modal positif tanpa modal yang memenuhi syarat menghasilkan isBalanced = false", () => {
      const zeroSavingsMap = new Map<string, MemberSavingsData>([
        ["DEMO-ID-0001", { saldoPokok: 0, saldoWajib: 0, saldoSukarela: 0 }],
        ["DEMO-ID-0002", { saldoPokok: 0, saldoWajib: 0, saldoSukarela: 0 }],
        ["DEMO-ID-0003", { saldoPokok: 0, saldoWajib: 0, saldoSukarela: 0 }],
      ]);

      const result = computeMemberDistributions(
        mockCandidates,
        zeroSavingsMap,
        mockParticipationMap,
        10000000,
        10000000,
        policy
      );

      for (const d of result.distributions) {
        expect(d.jasaModalFinal).toBe(0);
        expect(d.qualifyingCapital).toBe(0);
      }
      expect(result.isBalanced).toBe(false);
      expect(result.undistributedModalPool).toBe(10000000);
      expect(result.unbalancedReason).toContain("Jasa Modal");
    });

    it("3.8. Kedua pool positif tanpa penerima aktif yang memenuhi syarat menghasilkan isBalanced = false", () => {
      const allInactiveCandidates: MemberCandidate[] = [
        { id: "DEMO-ID-0001", name: "Siti Rahma", memberNumber: "KMB-2026-0001", isActive: false },
        { id: "DEMO-ID-0002", name: "Dian Pratama", memberNumber: "KMB-2026-0002", isActive: false },
      ];

      const result = computeMemberDistributions(
        allInactiveCandidates,
        mockSavingsMap,
        mockParticipationMap,
        10000000,
        10000000,
        policy
      );

      expect(result.isBalanced).toBe(false);
      expect(result.totalDistributed).toBe(0);
      expect(result.undistributedModalPool).toBe(10000000);
      expect(result.undistributedUsahaPool).toBe(10000000);
      expect(result.unbalancedReason).toContain("Tidak ada anggota aktif");
    });

    it("3.9. Salah satu pool bernilai 0 dan pool lain valid menghasilkan isBalanced = true", () => {
      // Jasa modal 0, Jasa usaha 10.000.000
      const result = computeMemberDistributions(
        mockCandidates,
        mockSavingsMap,
        mockParticipationMap,
        0,
        10000000,
        policy
      );

      expect(result.isBalanced).toBe(true);
      expect(result.totalDistributed).toBe(10000000);
      expect(result.undistributedModalPool).toBe(0);
      expect(result.undistributedUsahaPool).toBe(0);
    });
  });
});

