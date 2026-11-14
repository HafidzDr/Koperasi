import { z } from "zod";
import { Role } from "@/types";

/**
 * PHASE 7 — SHU Management Domain Types
 * Koperasi Konsumen Makmur Bersama Nusantara (KMB)
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
      const sum =
        data.cadangan +
        data.jasa_modal +
        data.jasa_usaha +
        data.dana_pengurus +
        data.dana_pendidikan +
        data.dana_sosial;
      return Math.round(sum * 100) / 100 === 100;
    },
    {
      message: "Total alokasi persentase SHU harus tepat 100%.",
    }
  );

export type CreateShuPeriodInput = z.infer<typeof createShuPeriodSchema>;
export type UpdateFinancialInput = z.infer<typeof updateFinancialInputSchema>;
export type UpdatePolicyCategoriesInput = z.infer<typeof updatePolicyCategoriesSchema>;
