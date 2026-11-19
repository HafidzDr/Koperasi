import { z } from "zod";
import { Role } from "@/types";

/**
 * PHASE 7 — SHU Management Domain Types
 * Nusantara Maju
 */

export type ShuPeriodStatus =
  | "draft"
  | "data_collection"
  | "calculation_ready"
  | "calculated"
  | "under_review"
  | "approved"
  | "published"
  | "closed"
  | "rejected";

export type ShuSnapshotStatus =
  | "calculated"
  | "under_review"
  | "approved"
  | "rejected"
  | "published"
  | "superseded";

export type ShuAllocationCategoryKey =
  | "cadangan"
  | "jasa_modal"
  | "jasa_usaha"
  | "dana_pengurus"
  | "dana_pendidikan"
  | "dana_sosial";

export interface AllocationCategoryConfig {
  key: ShuAllocationCategoryKey;
  label: string;
  percentage: number; // 0 - 100
  description: string;
  isConfigurable: boolean;
  status: "illustrative" | "determined";
  policyNote: string;
}

export interface ShuCapitalSourcesConfig {
  includeSimpananPokok: boolean; // U-07: Unresolved policy, defaults to false
  includeSimpananWajib: boolean; // Platform standard, defaults to true
  includeSimpananSukarela: boolean; // Configurable, defaults to false
  status: "illustrative" | "determined";
  policyNote: string;
}

export interface ShuBusinessParticipationWeights {
  weightSpending: number; // Waserda & retail purchases
  weightCommoditySupply: number; // Harvest / agricultural commodity supply
  minVerifiedAmount: number; // Minimum verified amount required (IDR)
  status: "illustrative" | "determined";
  policyNote: string;
}

export interface ShuPolicyConfigHistoryEntry {
  id: string;
  timestamp: string; // ISO 8601
  actorId: string;
  actorName: string;
  actorRole: Role;
  changeSummary: string;
  notes?: string;
}

export interface ShuPolicyConfig {
  version: number;
  updatedAt: string;
  updatedById: string;
  updatedByName: string;
  updatedByRole: Role;
  categories: Record<ShuAllocationCategoryKey, AllocationCategoryConfig>;
  capitalSources: ShuCapitalSourcesConfig;
  businessParticipationWeights: ShuBusinessParticipationWeights;
  history: ShuPolicyConfigHistoryEntry[];
}

export interface FinancialPerformanceInput {
  totalRevenue: number; // Gross income (Pendapatan Kotor) >= 0
  totalExpense: number; // Total operating expenditures (Beban Operasional) >= 0
  operatingIncome: number; // totalRevenue - totalExpense
  adjustmentAmount: number; // Formal audited adjustment (+ or -)
  adjustmentReason?: string; // Required if adjustmentAmount !== 0
  adjustmentActorId?: string;
  adjustmentActorName?: string;
  adjustmentActorRole?: Role;
  netIncome: number; // Operating income + adjustmentAmount
  distributableShu: number; // Max netIncome, or 0 if netIncome <= 0
  isSimulation: true;
}

export interface MemberShuDistributionItem {
  memberId: string; // Canonical DEMO ID (e.g. DEMO-ID-0001)
  memberName: string;
  memberNumber: string;
  qualifyingCapital: number; // Eligible savings balance according to policy
  jasaModalRaw: number;
  jasaModalFinal: number; // Integer Rupiah
  verifiedParticipation: number; // Weighted economic participation from verified activities
  jasaUsahaRaw: number;
  jasaUsahaFinal: number; // Integer Rupiah
  totalShu: number; // jasaModalFinal + jasaUsahaFinal (Integer Rupiah)
  status: "eligible" | "excluded";
  exclusionReason?: string;
}

export interface ShuCalculationSnapshot {
  id: string; // SNAP-{year}-v{version}
  periodId: string;
  version: number;
  calculatedAt: string;
  calculatedById: string;
  calculatedByName: string;
  calculatedByRole: Role;
  financialInput: FinancialPerformanceInput;
  policyConfigSnapshot: ShuPolicyConfig;
  allocationBreakdown: Record<
    ShuAllocationCategoryKey,
    {
      percentage: number;
      allocatedAmount: number; // Integer Rupiah
    }
  >;
  totalDistributableShu: number;
  totalMemberDistribution: number; // sum of totalShu of all members
  roundingCorrection: {
    modalResidual: number;
    usahaResidual: number;
    totalResidual: number;
    appliedToMemberId?: string;
  };
  isBalanced: boolean;
  unbalancedReason?: string;
  undistributedAmount?: number;
  memberDistributions: MemberShuDistributionItem[];
  status: ShuSnapshotStatus;
  statusHistory: {
    id: string;
    timestamp: string;
    actorId: string;
    actorName: string;
    actorRole: Role;
    fromStatus: ShuSnapshotStatus;
    toStatus: ShuSnapshotStatus;
    notes?: string;
    rejectionReason?: string;
  }[];
  reviewNotes?: string;
  rejectionReason?: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedByRole?: Role;
  reviewedAt?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedByRole?: Role;
  approvedAt?: string;
  publishedById?: string;
  publishedByName?: string;
  publishedByRole?: Role;
  publishedAt?: string;
}

export interface ShuPeriodAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  details: string;
}

export interface ShuPeriodAdjustmentLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  snapshotId: string;
  reason: string;
  adjustmentSummary: string;
}

export interface ShuPeriod {
  id: string; // e.g. "SHU-2025"
  fiscalYear: number;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: ShuPeriodStatus;
  description: string;
  activePolicyConfig: ShuPolicyConfig;
  financialInput: FinancialPerformanceInput;
  currentCalculationVersion: number;
  activeSnapshotId?: string;
  snapshots: ShuCalculationSnapshot[];
  auditLogs: ShuPeriodAuditLog[];
  adjustmentLogs: ShuPeriodAdjustmentLog[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedById?: string;
  closedByName?: string;
  closedByRole?: Role;
}

export interface ShuActor {
  id: string;
  name: string;
  role: Role;
  memberId?: string;
}

// Zod schemas for input validation
export const createShuPeriodSchema = z.object({
  fiscalYear: z
    .number()
    .int("Tahun buku harus berupa bilangan bulat.")
    .min(2000, "Tahun buku minimal tahun 2000.")
    .max(2100, "Tahun buku maksimal tahun 2100."),
  name: z
    .string()
    .trim()
    .min(3, "Nama periode SHU minimal 3 karakter.")
    .max(80, "Nama periode SHU maksimal 80 karakter."),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal mulai harus YYYY-MM-DD."),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal selesai harus YYYY-MM-DD."),
  description: z.string().trim().max(300, "Deskripsi maksimal 300 karakter.").optional(),
});

export const updateFinancialInputSchema = z
  .object({
    totalRevenue: z
      .number({ invalid_type_error: "Pendapatan harus berupa angka." })
      .int("Pendapatan harus berupa bilangan bulat Rupiah.")
      .min(0, "Pendapatan tidak boleh bernilai negatif."),
    totalExpense: z
      .number({ invalid_type_error: "Beban harus berupa angka." })
      .int("Beban harus berupa bilangan bulat Rupiah.")
      .min(0, "Beban tidak boleh bernilai negatif."),
    adjustmentAmount: z
      .number({ invalid_type_error: "Koreksi harus berupa angka." })
      .int("Koreksi harus berupa bilangan bulat Rupiah.")
      .default(0),
    adjustmentReason: z.string().trim().max(250).optional(),
  })
  .refine(
    (data) => {
      if (data.adjustmentAmount !== 0) {
        return Boolean(data.adjustmentReason && data.adjustmentReason.length >= 3);
      }
      return true;
    },
    {
      message: "Alasan penyesuaian wajib diisi minimal 3 karakter jika nominal penyesuaian tidak nol.",
      path: ["adjustmentReason"],
    }
  );

export const updatePolicyCategoriesSchema = z
  .object({
    cadangan: z.number().min(0).max(100),
    jasa_modal: z.number().min(0).max(100),
    jasa_usaha: z.number().min(0).max(100),
    dana_pengurus: z.number().min(0).max(100),
    dana_pendidikan: z.number().min(0).max(100),
    dana_sosial: z.number().min(0).max(100),
  })
  .refine(
    (data) => {
      const values = [
        data.cadangan,
        data.jasa_modal,
        data.jasa_usaha,
        data.dana_pengurus,
        data.dana_pendidikan,
        data.dana_sosial,
      ];
      for (const v of values) {
        if (!Number.isFinite(v)) return false;
        const decimals = (v.toString().split(".")[1] || "").length;
        if (decimals > 2) return false;
      }
      const sumInCents = values.reduce((acc, v) => acc + Math.round(v * 100), 0);
      return sumInCents === 10000;
    },
    {
      message: "Total alokasi persentase SHU harus tepat 100.00% (maksimal 2 angka desimal).",
    }
  );

export type CreateShuPeriodInput = z.infer<typeof createShuPeriodSchema>;
export type UpdateFinancialInput = z.infer<typeof updateFinancialInputSchema>;
export type UpdatePolicyCategoriesInput = z.infer<typeof updatePolicyCategoriesSchema>;

// Comprehensive Storage Validation Schemas
export const financialPerformanceInputStorageSchema = z
  .object({
    totalRevenue: z.number().int().min(0),
    totalExpense: z.number().int().min(0),
    operatingIncome: z.number().int(),
    adjustmentAmount: z.number().int(),
    adjustmentReason: z.string().optional(),
    adjustmentActorId: z.string().optional(),
    adjustmentActorName: z.string().optional(),
    adjustmentActorRole: z.string().optional(),
    netIncome: z.number().int(),
    distributableShu: z.number().int().min(0),
    isSimulation: z.literal(true),
  })
  .refine(
    (f) => f.operatingIncome === f.totalRevenue - f.totalExpense,
    { message: "operatingIncome must equal totalRevenue - totalExpense" }
  )
  .refine(
    (f) => f.netIncome === f.operatingIncome + f.adjustmentAmount,
    { message: "netIncome must equal operatingIncome + adjustmentAmount" }
  )
  .refine(
    (f) => f.distributableShu === Math.max(f.netIncome, 0),
    { message: "distributableShu must equal max(netIncome, 0)" }
  )
  .refine(
    (f) => f.adjustmentAmount === 0 || Boolean(f.adjustmentReason && f.adjustmentReason.trim().length >= 3),
    { message: "adjustmentReason must be valid if adjustmentAmount !== 0" }
  );

export const allocationCategoryConfigStorageSchema = z.object({
  key: z.enum(["cadangan", "jasa_modal", "jasa_usaha", "dana_pengurus", "dana_pendidikan", "dana_sosial"]),
  label: z.string().min(1),
  percentage: z
    .number()
    .min(0)
    .max(100)
    .refine((v) => Number.isFinite(v) && (v.toString().split(".")[1] || "").length <= 2),
  description: z.string(),
  isConfigurable: z.boolean(),
  status: z.enum(["illustrative", "determined"]),
  policyNote: z.string(),
});

export const policyConfigStorageSchema = z
  .object({
    version: z.number().int().min(1),
    updatedAt: z.string().min(1),
    updatedById: z.string().min(1),
    updatedByName: z.string().min(1),
    updatedByRole: z.string().min(1),
    categories: z.object({
      cadangan: allocationCategoryConfigStorageSchema,
      jasa_modal: allocationCategoryConfigStorageSchema,
      jasa_usaha: allocationCategoryConfigStorageSchema,
      dana_pengurus: allocationCategoryConfigStorageSchema,
      dana_pendidikan: allocationCategoryConfigStorageSchema,
      dana_sosial: allocationCategoryConfigStorageSchema,
    }),
    capitalSources: z.object({
      includeSimpananPokok: z.boolean(),
      includeSimpananWajib: z.boolean(),
      includeSimpananSukarela: z.boolean(),
      status: z.enum(["illustrative", "determined"]),
      policyNote: z.string(),
    }),
    businessParticipationWeights: z.object({
      weightSpending: z.number().min(0),
      weightCommoditySupply: z.number().min(0),
      minVerifiedAmount: z.number().int().min(0),
      status: z.enum(["illustrative", "determined"]),
      policyNote: z.string(),
    }),
    history: z.array(
      z.object({
        id: z.string().min(1),
        timestamp: z.string().min(1),
        actorId: z.string().min(1),
        actorName: z.string().min(1),
        actorRole: z.string().min(1),
        changeSummary: z.string().min(1),
        notes: z.string().optional(),
      })
    ),
  })
  .refine(
    (p) => {
      const cats = p.categories;
      const sumInCents =
        Math.round(cats.cadangan.percentage * 100) +
        Math.round(cats.jasa_modal.percentage * 100) +
        Math.round(cats.jasa_usaha.percentage * 100) +
        Math.round(cats.dana_pengurus.percentage * 100) +
        Math.round(cats.dana_pendidikan.percentage * 100) +
        Math.round(cats.dana_sosial.percentage * 100);
      return sumInCents === 10000;
    },
    { message: "Total alokasi kategori kebijakan harus tepat 100.00%." }
  );
export const memberShuDistributionItemStorageSchema = z
  .object({
    memberId: z.string().min(1),
    memberName: z.string().min(1),
    memberNumber: z.string().min(1),
    qualifyingCapital: z.number().int().min(0),
    jasaModalRaw: z.number().min(0),
    jasaModalFinal: z.number().int().min(0),
    verifiedParticipation: z.number().int().min(0),
    jasaUsahaRaw: z.number().min(0),
    jasaUsahaFinal: z.number().int().min(0),
    totalShu: z.number().int().min(0),
    status: z.enum(["eligible", "excluded"]),
    exclusionReason: z.string().optional(),
  })
  .refine(
    (item) => item.totalShu === item.jasaModalFinal + item.jasaUsahaFinal,
    { message: "totalShu must equal jasaModalFinal + jasaUsahaFinal" }
  );

export const shuCalculationSnapshotStorageSchema = z
  .object({
    id: z.string().min(1),
    periodId: z.string().min(1),
    version: z.number().int().min(1),
    calculatedAt: z.string().min(1),
    calculatedById: z.string().min(1),
    calculatedByName: z.string().min(1),
    calculatedByRole: z.string().min(1),
    financialInput: financialPerformanceInputStorageSchema,
    policyConfigSnapshot: policyConfigStorageSchema,
    allocationBreakdown: z.record(
      z.string(),
      z.object({
        percentage: z.number().min(0).max(100),
        allocatedAmount: z.number().int().min(0),
      })
    ),
    totalDistributableShu: z.number().int().min(0),
    totalMemberDistribution: z.number().int().min(0),
    roundingCorrection: z.object({
      modalResidual: z.number().int(),
      usahaResidual: z.number().int(),
      totalResidual: z.number().int(),
      appliedToMemberId: z.string().optional(),
    }),
    isBalanced: z.boolean(),
    unbalancedReason: z.string().optional(),
    undistributedAmount: z.number().int().min(0).optional(),
    memberDistributions: z.array(memberShuDistributionItemStorageSchema),
    status: z.enum(["calculated", "under_review", "approved", "rejected", "published", "superseded"]),
    statusHistory: z.array(
      z.object({
        id: z.string().min(1),
        timestamp: z.string().min(1),
        actorId: z.string().min(1),
        actorName: z.string().min(1),
        actorRole: z.string().min(1),
        fromStatus: z.enum(["calculated", "under_review", "approved", "rejected", "published", "superseded"]),
        toStatus: z.enum(["calculated", "under_review", "approved", "rejected", "published", "superseded"]),
        notes: z.string().optional(),
        rejectionReason: z.string().optional(),
      })
    ),
    reviewNotes: z.string().optional(),
    rejectionReason: z.string().optional(),
    reviewedById: z.string().optional(),
    reviewedByName: z.string().optional(),
    reviewedByRole: z.string().optional(),
    reviewedAt: z.string().optional(),
    approvedById: z.string().optional(),
    approvedByName: z.string().optional(),
    approvedByRole: z.string().optional(),
    approvedAt: z.string().optional(),
    publishedById: z.string().optional(),
    publishedByName: z.string().optional(),
    publishedByRole: z.string().optional(),
    publishedAt: z.string().optional(),
  })
  .refine(
    (s) => {
      const sumDist = s.memberDistributions.reduce((acc, curr) => acc + curr.totalShu, 0);
      return sumDist === s.totalMemberDistribution;
    },
    { message: "totalMemberDistribution must equal sum of memberDistributions.totalShu" }
  );

export const shuPeriodStorageSchema = z
  .object({
    id: z.string().regex(/^SHU-\d{4}$/, "ID periode harus berformat SHU-YYYY"),
    fiscalYear: z.number().int().min(2000).max(2100),
    name: z.string().trim().min(3),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(["draft", "data_collection", "calculation_ready", "calculated", "under_review", "approved", "published", "closed", "rejected"]),
    description: z.string(),
    activePolicyConfig: policyConfigStorageSchema,
    financialInput: financialPerformanceInputStorageSchema,
    currentCalculationVersion: z.number().int().min(0),
    activeSnapshotId: z.string().optional(),
    snapshots: z.array(shuCalculationSnapshotStorageSchema),
    auditLogs: z.array(
      z.object({
        id: z.string().min(1),
        timestamp: z.string().min(1),
        actorId: z.string().min(1),
        actorName: z.string().min(1),
        actorRole: z.string().min(1),
        action: z.string().min(1),
        details: z.string().min(1),
      })
    ),
    adjustmentLogs: z.array(
      z.object({
        id: z.string().min(1),
        timestamp: z.string().min(1),
        actorId: z.string().min(1),
        actorName: z.string().min(1),
        actorRole: z.string().min(1),
        snapshotId: z.string().min(1),
        reason: z.string().min(3),
        adjustmentSummary: z.string().min(3),
      })
    ),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    closedAt: z.string().optional(),
    closedById: z.string().optional(),
    closedByName: z.string().optional(),
    closedByRole: z.string().optional(),
  })
  .refine(
    (p) => p.id === `SHU-${p.fiscalYear}`,
    { message: "period.id must match SHU-{fiscalYear}" }
  )
  .refine(
    (p) => {
      if (p.activeSnapshotId) {
        const snap = p.snapshots.find((s) => s.id === p.activeSnapshotId);
        if (!snap) return false;
        if (snap.periodId !== p.id) return false;
      }
      return true;
    },
    { message: "activeSnapshotId must exist in snapshots array with matching periodId" }
  )
  .refine(
    (p) => p.snapshots.every((s) => s.periodId === p.id),
    { message: "all snapshots must reference this period" }
  );

export const shuStoragePayloadSchema = z.object({
  periods: z.array(shuPeriodStorageSchema).min(1),
  policyConfig: policyConfigStorageSchema,
});

