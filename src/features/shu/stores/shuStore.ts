import { create } from "zustand";
import { Role } from "@/types";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useSavingsStore } from "@/features/savings/stores/savingsStore";
import { useBusinessUnitStore } from "@/features/business-units/stores/businessUnitStore";
import {
  ShuPeriod,
  ShuPolicyConfig,
  ShuCalculationSnapshot,
  ShuActor,
  CreateShuPeriodInput,
  UpdateFinancialInput,
  MemberShuDistributionItem,
  ShuAllocationCategoryKey,
  ShuCapitalSourcesConfig,
  ShuBusinessParticipationWeights,
  ShuPeriodAdjustmentLog,
  createShuPeriodSchema,
  updateFinancialInputSchema,
} from "../types";
import {
  defaultShuPolicyConfig,
  initialSeedShuPeriods,
} from "../mocks/shuSeedData";
import {
  validatePolicyPercentages,
  computeAllocations,
  computeMemberDistributions,
  MemberSavingsData,
  MemberParticipationData,
} from "../utils/shuCalculations";

export const SHU_STORAGE_KEY = "kmb_shu_store_v1";

interface StoragePayload {
  periods: ShuPeriod[];
  policyConfig: ShuPolicyConfig;
}

export interface ShuStoreState {
  periods: ShuPeriod[];
  policyConfig: ShuPolicyConfig;
  activePeriodId: string;

  // Actions
  setActivePeriodId: (id: string) => void;
  createPeriod: (input: CreateShuPeriodInput, actor: ShuActor) => ShuPeriod;
  updatePeriod: (
    periodId: string,
    input: Partial<CreateShuPeriodInput>,
    actor: ShuActor
  ) => ShuPeriod;
  updatePolicyConfig: (
    periodId: string,
    categories: Record<ShuAllocationCategoryKey, { percentage: number }>,
    capitalSources?: Partial<ShuCapitalSourcesConfig>,
    weights?: Partial<ShuBusinessParticipationWeights>,
    actor?: ShuActor
  ) => ShuPolicyConfig;
  updateFinancialInput: (
    periodId: string,
    input: UpdateFinancialInput,
    actor: ShuActor
  ) => ShuPeriod;
  collectPeriodData: (periodId: string, actor: ShuActor) => ShuPeriod;
  runCalculation: (periodId: string, actor: ShuActor) => ShuCalculationSnapshot;
  submitForReview: (
    periodId: string,
    snapshotId: string,
    actor: ShuActor
  ) => ShuCalculationSnapshot;
  approveCalculation: (
    periodId: string,
    snapshotId: string,
    actor: ShuActor,
    notes?: string
  ) => ShuCalculationSnapshot;
  rejectCalculation: (
    periodId: string,
    snapshotId: string,
    reason: string,
    actor: ShuActor
  ) => ShuCalculationSnapshot;
  publishCalculation: (
    periodId: string,
    snapshotId: string,
    actor: ShuActor
  ) => ShuCalculationSnapshot;
  closePeriod: (periodId: string, actor: ShuActor) => ShuPeriod;
  adjustPublishedShu: (
    periodId: string,
    snapshotId: string,
    adjustmentSummary: string,
    reason: string,
    actor: ShuActor
  ) => ShuPeriodAdjustmentLog;

  // Selectors
  getPeriodById: (id: string) => ShuPeriod | undefined;
  getSnapshotById: (
    periodId: string,
    snapshotId: string
  ) => ShuCalculationSnapshot | undefined;
  getMemberPublishedShu: (
    memberId: string,
    actor: ShuActor
  ) => {
    period: ShuPeriod;
    snapshot: ShuCalculationSnapshot;
    distribution: MemberShuDistributionItem;
  }[];

  // Maintenance & Reset
  resetToSeed: () => void;
}

function loadFromStorage(): StoragePayload {
  if (typeof window === "undefined") {
    return {
      periods: initialSeedShuPeriods,
      policyConfig: defaultShuPolicyConfig,
    };
  }
  try {
    const raw = localStorage.getItem(SHU_STORAGE_KEY);
    if (!raw) {
      return {
        periods: initialSeedShuPeriods,
        policyConfig: defaultShuPolicyConfig,
      };
    }
    const parsed = JSON.parse(raw) as Partial<StoragePayload>;
    if (!parsed || !Array.isArray(parsed.periods) || parsed.periods.length === 0) {
      return {
        periods: initialSeedShuPeriods,
        policyConfig: defaultShuPolicyConfig,
      };
    }
    return {
      periods: parsed.periods,
      policyConfig: parsed.policyConfig || defaultShuPolicyConfig,
    };
  } catch {
    return {
      periods: initialSeedShuPeriods,
      policyConfig: defaultShuPolicyConfig,
    };
  }
}

function saveToStorage(payload: StoragePayload) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SHU_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}
const initialData = loadFromStorage();

export const useShuStore = create<ShuStoreState>((set, get) => ({
  periods: initialData.periods,
  policyConfig: initialData.policyConfig,
  activePeriodId: initialData.periods[0]?.id || "SHU-2025",

  setActivePeriodId: (id) => {
    set({ activePeriodId: id });
  },

  createPeriod: (input, actor) => {
    if (actor.role === "admin" || actor.role === "super_admin") {
      throw new Error("Pemisahan Tugas (SoD): Administrator teknis tidak berwenang mengelola periode operasional SHU.");
    }
    if (actor.role === "member" || actor.role === "auditor" || actor.role === "staff") {
      throw new Error(`Akses ditolak: Peran ${actor.role} tidak memiliki kewenangan membuat periode SHU baru.`);
    }

    const validated = createShuPeriodSchema.parse(input);
    const existing = get().periods;
    if (existing.some((p) => p.fiscalYear === validated.fiscalYear)) {
      throw new Error(`Periode SHU untuk tahun buku ${validated.fiscalYear} sudah terdaftar.`);
    }

    const now = new Date().toISOString();
    const periodId = `SHU-${validated.fiscalYear}`;

    const newPeriod: ShuPeriod = {
      id: periodId,
      fiscalYear: validated.fiscalYear,
      name: validated.name.trim(),
      startDate: validated.startDate,
      endDate: validated.endDate,
      status: "draft",
      description: validated.description?.trim() || `Tahun buku ${validated.fiscalYear}`,
      activePolicyConfig: get().policyConfig,
      financialInput: {
        totalRevenue: 0,
        totalExpense: 0,
        operatingIncome: 0,
        adjustmentAmount: 0,
        netIncome: 0,
        distributableShu: 0,
        isSimulation: true,
      },
      currentCalculationVersion: 0,
      snapshots: [],
      auditLogs: [
        {
          id: `AUD-${periodId}-1`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "created",
          details: `Periode SHU ${validated.name.trim()} dibuat oleh ${actor.name} (${actor.role}).`,
        },
      ],
      adjustmentLogs: [],
      createdAt: now,
      updatedAt: now,
    };

    const updatedPeriods = [newPeriod, ...existing];
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods, activePeriodId: newPeriod.id });
    return newPeriod;
  },

  updatePeriod: (periodId, input, actor) => {
    if (actor.role === "admin" || actor.role === "super_admin") {
      throw new Error("Pemisahan Tugas (SoD): Administrator teknis tidak berwenang mengubah periode SHU.");
    }
    if (actor.role === "member" || actor.role === "auditor" || actor.role === "staff") {
      throw new Error(`Akses ditolak: Peran ${actor.role} tidak berwenang mengubah periode SHU.`);
    }

    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    if (target.status === "closed") {
      throw new Error("Periode yang sudah ditutup tidak dapat diubah.");
    }
    if (target.status === "published") {
      throw new Error("Periode yang telah dipublikasikan tidak dapat diubah langsung.");
    }

    const now = new Date().toISOString();
    const updated: ShuPeriod = {
      ...target,
      name: input.name ? input.name.trim() : target.name,
      startDate: input.startDate || target.startDate,
      endDate: input.endDate || target.endDate,
      description: input.description !== undefined ? input.description.trim() : target.description,
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "updated",
          details: `Informasi periode diperbarui oleh ${actor.name} (${actor.role}).`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updated : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return updated;
  },
  updatePolicyConfig: (periodId, categoriesInput, capitalSources, weights, actor) => {
    if (actor && (actor.role === "admin" || actor.role === "super_admin")) {
      throw new Error("Pemisahan Tugas (SoD): Administrator dilarang menetapkan kebijakan finansial SHU.");
    }
    if (actor && (actor.role === "member" || actor.role === "auditor" || actor.role === "staff")) {
      throw new Error("Akses ditolak: Hanya pengurus dan bendahara yang berwenang menetapkan kebijakan alokasi SHU.");
    }

    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    if (target.status === "closed" || target.status === "published") {
      throw new Error("Kebijakan alokasi pada periode yang telah disahkan/ditutup tidak dapat diubah.");
    }

    const currentConfig = target.activePolicyConfig;
    const newCategories = { ...currentConfig.categories };

    for (const key of Object.keys(categoriesInput) as ShuAllocationCategoryKey[]) {
      if (newCategories[key]) {
        newCategories[key] = {
          ...newCategories[key],
          percentage: categoriesInput[key].percentage,
        };
      }
    }

    const valResult = validatePolicyPercentages(newCategories);
    if (!valResult.isValid) {
      throw new Error(valResult.error || "Total persentase alokasi SHU harus tepat 100%.");
    }

    const now = new Date().toISOString();
    const newCapitalSources = capitalSources
      ? { ...currentConfig.capitalSources, ...capitalSources }
      : currentConfig.capitalSources;
    const newWeights = weights
      ? { ...currentConfig.businessParticipationWeights, ...weights }
      : currentConfig.businessParticipationWeights;

    const historyEntry = {
      id: `POL-HIST-${Date.now()}`,
      timestamp: now,
      actorId: actor?.id || "demo_actor",
      actorName: actor?.name || "Pengurus",
      actorRole: (actor?.role || "manager") as Role,
      changeSummary: `Alokasi diperbarui (Cadangan: ${newCategories.cadangan.percentage}%, Modal: ${newCategories.jasa_modal.percentage}%, Usaha: ${newCategories.jasa_usaha.percentage}%).`,
    };

    const updatedConfig: ShuPolicyConfig = {
      version: currentConfig.version + 1,
      updatedAt: now,
      updatedById: actor?.id || "demo_actor",
      updatedByName: actor?.name || "Pengurus",
      updatedByRole: (actor?.role || "manager") as Role,
      categories: newCategories,
      capitalSources: newCapitalSources,
      businessParticipationWeights: newWeights,
      history: [historyEntry, ...currentConfig.history],
    };

    const updatedPeriod: ShuPeriod = {
      ...target,
      activePolicyConfig: updatedConfig,
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor?.id || "demo_actor",
          actorName: actor?.name || "Pengurus",
          actorRole: (actor?.role || "manager") as Role,
          action: "policy_updated",
          details: `Kebijakan alokasi SHU versi ${updatedConfig.version} disimpan.`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: updatedConfig });
    set({ periods: updatedPeriods, policyConfig: updatedConfig });
    return updatedConfig;
  },
  updateFinancialInput: (periodId, input, actor) => {
    if (actor.role === "admin" || actor.role === "super_admin") {
      throw new Error("Pemisahan Tugas (SoD): Administrator teknis tidak berwenang menginput data finansial koperasi.");
    }
    if (actor.role === "member" || actor.role === "auditor") {
      throw new Error("Akses ditolak: Anda tidak memiliki izin menginput kinerja finansial koperasi.");
    }

    const validated = updateFinancialInputSchema.parse(input);
    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    if (target.status === "closed" || target.status === "published") {
      throw new Error("Kinerja finansial pada periode yang telah disahkan/ditutup tidak dapat diubah.");
    }

    const operatingIncome = validated.totalRevenue - validated.totalExpense;
    const netIncome = operatingIncome + (validated.adjustmentAmount || 0);
    const distributableShu = netIncome > 0 ? netIncome : 0;

    const financialInput = {
      totalRevenue: validated.totalRevenue,
      totalExpense: validated.totalExpense,
      operatingIncome,
      adjustmentAmount: validated.adjustmentAmount || 0,
      adjustmentReason: validated.adjustmentReason,
      adjustmentActorId: actor.id,
      adjustmentActorName: actor.name,
      adjustmentActorRole: actor.role,
      netIncome,
      distributableShu,
      isSimulation: true as const,
    };

    const now = new Date().toISOString();
    const updatedPeriod: ShuPeriod = {
      ...target,
      financialInput,
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "financial_input_updated",
          details: `Kinerja keuangan diperbarui: Pendapatan Rp${validated.totalRevenue.toLocaleString("id-ID")}, Beban Rp${validated.totalExpense.toLocaleString("id-ID")}, Hasil Usaha Bersih Rp${netIncome.toLocaleString("id-ID")}.`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return updatedPeriod;
  },

  collectPeriodData: (periodId, actor) => {
    if (actor.role === "admin" || actor.role === "super_admin" || actor.role === "member") {
      throw new Error("Akses ditolak: Anda tidak memiliki wewenang pengumpulan data operasional SHU.");
    }
    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    if (target.status === "closed" || target.status === "published") {
      throw new Error("Periode telah selesai/disahkan; pengumpulan data ditutup.");
    }

    const now = new Date().toISOString();
    const updatedPeriod: ShuPeriod = {
      ...target,
      status: "calculation_ready",
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "data_collected",
          details: "Data simpanan dan partisipasi unit usaha siap dihitung.",
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return updatedPeriod;
  },

  runCalculation: (periodId, actor) => {
    if (actor.role === "admin" || actor.role === "super_admin") {
      throw new Error("Pemisahan Tugas (SoD): Administrator teknis tidak berwenang menjalankan kalkulasi finansial SHU.");
    }
    if (actor.role === "member" || actor.role === "staff" || actor.role === "auditor") {
      throw new Error(`Akses ditolak: Peran ${actor.role} tidak berwenang menjalankan kalkulasi SHU.`);
    }

    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    if (target.status === "closed") {
      throw new Error("Periode yang sudah ditutup tidak dapat dihitung ulang.");
    }
    if (target.status === "published") {
      throw new Error("Periode yang telah dipublikasikan tidak dapat dihitung ulang secara langsung. Gunakan penyesuaian audit.");
    }

    const policy = target.activePolicyConfig;
    const valResult = validatePolicyPercentages(policy.categories);
    if (!valResult.isValid) {
      throw new Error(valResult.error || "Alokasi persentase kebijakan belum tepat 100%.");
    }

    const distributableShu = target.financialInput.distributableShu || 0;
    const allocationBreakdown = computeAllocations(distributableShu, policy.categories);

    // Data sources gathering
    const memStore = useMembershipStore.getState();
    const savStore = useSavingsStore.getState();
    const buStore = useBusinessUnitStore.getState();

    const candidates = memStore.members.map((m) => ({
      id: m.demoId || m.id,
      name: m.fullName,
      memberNumber: m.memberNumber,
      isActive: m.status === "active",
    }));

    const savingsMap = new Map<string, MemberSavingsData>();
    const participationMap = new Map<string, MemberParticipationData>();

    for (const c of candidates) {
      const savAcc = savStore.getMemberSavingsAccount(c.id);
      savingsMap.set(c.id, {
        saldoPokok: savAcc?.saldoPokok || 0,
        saldoWajib: savAcc?.saldoWajib || 0,
        saldoSukarela: savAcc?.saldoSukarela || 0,
      });

      // Partisipasi ekonomi unit usaha
      try {
        const part = buStore.getMemberEconomicParticipation(c.id, {
          id: actor.id,
          name: actor.name,
          role: actor.role,
          memberId: undefined,
        });
        participationMap.set(c.id, {
          spending: part.totalSpending,
          commoditySupply: part.totalCommoditySupply,
        });
      } catch {
        participationMap.set(c.id, { spending: 0, commoditySupply: 0 });
      }
    }

    const jasaModalPool = allocationBreakdown.jasa_modal.allocatedAmount;
    const jasaUsahaPool = allocationBreakdown.jasa_usaha.allocatedAmount;

    const memberCalc = computeMemberDistributions(
      candidates,
      savingsMap,
      participationMap,
      jasaModalPool,
      jasaUsahaPool,
      policy
    );

    const now = new Date().toISOString();
    const nextVersion = target.currentCalculationVersion + 1;
    const snapshotId = `SNAP-${target.fiscalYear}-v${nextVersion}`;

    const newSnapshot: ShuCalculationSnapshot = {
      id: snapshotId,
      periodId: target.id,
      version: nextVersion,
      calculatedAt: now,
      calculatedById: actor.id,
      calculatedByName: actor.name,
      calculatedByRole: actor.role,
      financialInput: target.financialInput,
      policyConfigSnapshot: policy,
      allocationBreakdown,
      totalDistributableShu: distributableShu,
      totalMemberDistribution: memberCalc.totalDistributed,
      roundingCorrection: memberCalc.roundingCorrection,
      isBalanced: memberCalc.isBalanced,
      memberDistributions: memberCalc.distributions,
      status: "calculated",
      statusHistory: [
        {
          id: `SH-${snapshotId}-1`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          fromStatus: "calculated",
          toStatus: "calculated",
          notes: `Kalkulasi simulasi versi ${nextVersion} berhasil dijalankan. Total distribusi anggota: Rp${memberCalc.totalDistributed.toLocaleString("id-ID")}.`,
        },
      ],
    };

    // Supersede previous non-final snapshots
    const updatedSnapshots = target.snapshots.map((s) =>
      s.status === "calculated" || s.status === "under_review" || s.status === "rejected"
        ? { ...s, status: "superseded" as const }
        : s
    );

    const updatedPeriod: ShuPeriod = {
      ...target,
      status: "calculated",
      currentCalculationVersion: nextVersion,
      activeSnapshotId: newSnapshot.id,
      snapshots: [newSnapshot, ...updatedSnapshots],
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "calculated",
          details: `Kalkulasi SHU versi ${nextVersion} dibuat (${newSnapshot.id}).`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return newSnapshot;
  },
  submitForReview: (periodId, snapshotId, actor) => {
    if (actor.role === "admin" || actor.role === "super_admin" || actor.role === "member" || actor.role === "auditor") {
      throw new Error(`Akses ditolak: Peran ${actor.role} tidak berwenang mengajukan peninjauan SHU.`);
    }

    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    const snap = target.snapshots.find((s) => s.id === snapshotId);
    if (!snap) throw new Error(`Snapshot kalkulasi "${snapshotId}" tidak ditemukan.`);

    if (snap.status !== "calculated" && snap.status !== "rejected") {
      throw new Error(`Snapshot dalam status "${snap.status}" tidak dapat diajukan untuk peninjauan.`);
    }

    const now = new Date().toISOString();
    const updatedSnap: ShuCalculationSnapshot = {
      ...snap,
      status: "under_review",
      statusHistory: [
        ...snap.statusHistory,
        {
          id: `SH-${snapshotId}-${snap.statusHistory.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          fromStatus: snap.status,
          toStatus: "under_review",
          notes: `Diajukan untuk peninjauan oleh ${actor.name} (${actor.role}).`,
        },
      ],
    };

    const updatedPeriod: ShuPeriod = {
      ...target,
      status: "under_review",
      activeSnapshotId: snapshotId,
      snapshots: target.snapshots.map((s) => (s.id === snapshotId ? updatedSnap : s)),
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "submitted_for_review",
          details: `Kalkulasi ${snapshotId} diajukan untuk peninjauan.`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return updatedSnap;
  },

  approveCalculation: (periodId, snapshotId, actor, notes) => {
    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    const snap = target.snapshots.find((s) => s.id === snapshotId);
    if (!snap) throw new Error(`Snapshot kalkulasi "${snapshotId}" tidak ditemukan.`);

    // STRICT SEGREGATION OF DUTIES (SoD): Calculator can NEVER approve own calculation
    if (snap.calculatedById === actor.id) {
      throw new Error(
        "Pemisahan Tugas (SoD): Pembuat kalkulasi dilarang menyetujui kalkulasi yang dibuatnya sendiri. Diperlukan peninjau/penyetuju independen."
      );
    }

    if (actor.role === "admin" || actor.role === "super_admin") {
      throw new Error("Pemisahan Tugas (SoD): Administrator teknis tidak memiliki otoritas menyetujui pembagian finansial SHU.");
    }
    if (actor.role === "member" || actor.role === "staff" || actor.role === "auditor" || actor.role === "finance_officer") {
      throw new Error(`Akses ditolak: Peran ${actor.role} tidak memiliki otoritas pengesahan/persetujuan SHU.`);
    }

    if (snap.status !== "under_review") {
      throw new Error(`Hanya kalkulasi berstatus "under_review" yang dapat disetujui. Status saat ini: "${snap.status}".`);
    }

    const now = new Date().toISOString();
    const updatedSnap: ShuCalculationSnapshot = {
      ...snap,
      status: "approved",
      approvedById: actor.id,
      approvedByName: actor.name,
      approvedByRole: actor.role,
      approvedAt: now,
      reviewNotes: notes?.trim() || "Kalkulasi SHU disetujui tanpa catatan khusus.",
      statusHistory: [
        ...snap.statusHistory,
        {
          id: `SH-${snapshotId}-${snap.statusHistory.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          fromStatus: snap.status,
          toStatus: "approved",
          notes: notes?.trim() || `Disetujui oleh ${actor.name} (${actor.role}).`,
        },
      ],
    };

    const updatedPeriod: ShuPeriod = {
      ...target,
      status: "approved",
      activeSnapshotId: snapshotId,
      snapshots: target.snapshots.map((s) => (s.id === snapshotId ? updatedSnap : s)),
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "approved",
          details: `Kalkulasi ${snapshotId} disetujui resmi oleh ${actor.name} (${actor.role}).`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return updatedSnap;
  },
  rejectCalculation: (periodId, snapshotId, reason, actor) => {
    if (actor.role === "admin" || actor.role === "super_admin") {
      throw new Error("Pemisahan Tugas (SoD): Administrator teknis dilarang melakukan keputusan penolakan finansial SHU.");
    }
    if (actor.role === "member" || actor.role === "staff" || actor.role === "auditor" || actor.role === "finance_officer") {
      throw new Error(`Akses ditolak: Peran ${actor.role} tidak berwenang menolak kalkulasi SHU.`);
    }

    if (!reason || reason.trim().length < 3) {
      throw new Error("Alasan penolakan kalkulasi wajib diisi minimal 3 karakter.");
    }

    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    const snap = target.snapshots.find((s) => s.id === snapshotId);
    if (!snap) throw new Error(`Snapshot kalkulasi "${snapshotId}" tidak ditemukan.`);

    if (snap.status !== "under_review") {
      throw new Error(`Hanya kalkulasi dalam peninjauan yang dapat ditolak. Status saat ini: "${snap.status}".`);
    }

    const now = new Date().toISOString();
    const updatedSnap: ShuCalculationSnapshot = {
      ...snap,
      status: "rejected",
      rejectionReason: reason.trim(),
      reviewedById: actor.id,
      reviewedByName: actor.name,
      reviewedByRole: actor.role,
      reviewedAt: now,
      statusHistory: [
        ...snap.statusHistory,
        {
          id: `SH-${snapshotId}-${snap.statusHistory.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          fromStatus: snap.status,
          toStatus: "rejected",
          rejectionReason: reason.trim(),
          notes: `Ditolak oleh ${actor.name}: ${reason.trim()}`,
        },
      ],
    };

    const updatedPeriod: ShuPeriod = {
      ...target,
      status: "rejected",
      snapshots: target.snapshots.map((s) => (s.id === snapshotId ? updatedSnap : s)),
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "rejected",
          details: `Kalkulasi ${snapshotId} ditolak oleh ${actor.name}: ${reason.trim()}`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return updatedSnap;
  },

  publishCalculation: (periodId, snapshotId, actor) => {
    if (actor.role !== "manager") {
      throw new Error(`Akses ditolak: Hanya pengurus (manager) yang berwenang mempublikasikan pembagian SHU.`);
    }

    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    const snap = target.snapshots.find((s) => s.id === snapshotId);
    if (!snap) throw new Error(`Snapshot kalkulasi "${snapshotId}" tidak ditemukan.`);

    if (snap.status !== "approved") {
      throw new Error(`Hanya kalkulasi yang telah disetujui resmi yang dapat dipublikasikan. Status saat ini: "${snap.status}".`);
    }

    const now = new Date().toISOString();
    const updatedSnap: ShuCalculationSnapshot = {
      ...snap,
      status: "published",
      publishedById: actor.id,
      publishedByName: actor.name,
      publishedByRole: actor.role,
      publishedAt: now,
      statusHistory: [
        ...snap.statusHistory,
        {
          id: `SH-${snapshotId}-${snap.statusHistory.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          fromStatus: snap.status,
          toStatus: "published",
          notes: `Dipublikasikan ke portal anggota oleh ${actor.name}.`,
        },
      ],
    };

    const updatedPeriod: ShuPeriod = {
      ...target,
      status: "published",
      activeSnapshotId: snapshotId,
      snapshots: target.snapshots.map((s) => (s.id === snapshotId ? updatedSnap : s)),
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "published",
          details: `Pembagian SHU ${target.name} (${snapshotId}) resmi dipublikasikan ke seluruh anggota.`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return updatedSnap;
  },
  closePeriod: (periodId, actor) => {
    if (actor.role !== "manager") {
      throw new Error("Akses ditolak: Hanya pengurus (manager) yang berwenang menutup periode buku SHU.");
    }
    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);
    if (target.status !== "published") {
      throw new Error(`Hanya periode yang telah dipublikasikan yang dapat ditutup. Status saat ini: "${target.status}".`);
    }

    const now = new Date().toISOString();
    const updatedPeriod: ShuPeriod = {
      ...target,
      status: "closed",
      closedAt: now,
      closedById: actor.id,
      closedByName: actor.name,
      closedByRole: actor.role,
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "closed",
          details: `Periode buku ${target.name} resmi ditutup permanen oleh ${actor.name} (${actor.role}).`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return updatedPeriod;
  },

  adjustPublishedShu: (periodId, snapshotId, adjustmentSummary, reason, actor) => {
    if (actor.role !== "manager" && actor.role !== "treasurer") {
      throw new Error("Akses ditolak: Hanya pengurus dan bendahara yang berwenang mencatat penyesuaian audit SHU.");
    }
    if (!reason || reason.trim().length < 3) {
      throw new Error("Alasan penyesuaian audit wajib diisi minimal 3 karakter.");
    }
    const target = get().periods.find((p) => p.id === periodId);
    if (!target) throw new Error(`Periode dengan ID "${periodId}" tidak ditemukan.`);

    const now = new Date().toISOString();
    const newAdjustmentLog: ShuPeriodAdjustmentLog = {
      id: `ADJ-${periodId}-${target.adjustmentLogs.length + 1}`,
      timestamp: now,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      snapshotId,
      reason: reason.trim(),
      adjustmentSummary: adjustmentSummary.trim(),
    };

    const updatedPeriod: ShuPeriod = {
      ...target,
      adjustmentLogs: [newAdjustmentLog, ...target.adjustmentLogs],
      updatedAt: now,
      auditLogs: [
        ...target.auditLogs,
        {
          id: `AUD-${periodId}-${target.auditLogs.length + 1}`,
          timestamp: now,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: "audit_adjustment_recorded",
          details: `Koreksi audit dicatat: ${adjustmentSummary.trim()} (${reason.trim()}).`,
        },
      ],
    };

    const updatedPeriods = get().periods.map((p) => (p.id === periodId ? updatedPeriod : p));
    saveToStorage({ periods: updatedPeriods, policyConfig: get().policyConfig });
    set({ periods: updatedPeriods });
    return newAdjustmentLog;
  },

  getPeriodById: (id) => {
    return get().periods.find((p) => p.id === id);
  },

  getSnapshotById: (periodId, snapshotId) => {
    const period = get().periods.find((p) => p.id === periodId);
    return period?.snapshots.find((s) => s.id === snapshotId);
  },

  getMemberPublishedShu: (memberId, actor) => {
    if (!actor || !memberId || memberId.trim() === "") return [];

    // Privacy rule: Member can only view own SHU!
    if (actor.role === "member") {
      if (!actor.memberId || actor.memberId.trim() !== memberId.trim()) {
        throw new Error("Akses ditolak: Anggota hanya dapat melihat rincian SHU miliknya sendiri.");
      }
    }

    // Only published or closed periods can be viewed as final member SHU
    const publishedPeriods = get().periods.filter(
      (p) => p.status === "published" || p.status === "closed"
    );

    const results: {
      period: ShuPeriod;
      snapshot: ShuCalculationSnapshot;
      distribution: MemberShuDistributionItem;
    }[] = [];

    for (const period of publishedPeriods) {
      const activeSnapshot =
        period.snapshots.find((s) => s.id === period.activeSnapshotId) ||
        period.snapshots.find((s) => s.status === "published");
      if (activeSnapshot) {
        const dist = activeSnapshot.memberDistributions.find(
          (d) => d.memberId === memberId.trim()
        );
        if (dist) {
          results.push({
            period,
            snapshot: activeSnapshot,
            distribution: dist,
          });
        }
      }
    }

    return results;
  },

  resetToSeed: () => {
    try {
      localStorage.removeItem(SHU_STORAGE_KEY);
    } catch {
      // ignore
    }
    set({
      periods: initialSeedShuPeriods,
      policyConfig: defaultShuPolicyConfig,
      activePeriodId: initialSeedShuPeriods[0]?.id || "SHU-2025",
    });
  },
}));






