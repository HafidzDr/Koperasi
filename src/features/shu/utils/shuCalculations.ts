import {
  FinancialPerformanceInput,
  ShuAllocationCategoryKey,
  AllocationCategoryConfig,
  ShuPolicyConfig,
  MemberShuDistributionItem,
} from "../types";

export interface CalculationResult {
  allocationBreakdown: Record<
    ShuAllocationCategoryKey,
    { percentage: number; allocatedAmount: number }
  >;
  totalDistributableShu: number;
  totalMemberDistribution: number;
  roundingCorrection: {
    modalResidual: number;
    usahaResidual: number;
    totalResidual: number;
    appliedToMemberId?: string;
  };
  isBalanced: boolean;
  memberDistributions: MemberShuDistributionItem[];
}

export interface MemberSavingsData {
  saldoPokok: number;
  saldoWajib: number;
  saldoSukarela: number;
}

export interface MemberParticipationData {
  spending: number;
  commoditySupply: number;
}

export interface MemberCandidate {
  id: string; // Member Demo ID
  name: string;
  memberNumber: string;
  isActive: boolean;
}

export function validateFinancialInput(input: FinancialPerformanceInput): {
  isValid: boolean;
  error?: string;
} {
  if (input.totalRevenue < 0) {
    return { isValid: false, error: "Total pendapatan kotor tidak boleh bernilai negatif." };
  }
  if (input.totalExpense < 0) {
    return { isValid: false, error: "Total beban operasional tidak boleh bernilai negatif." };
  }
  const calcOperating = input.totalRevenue - input.totalExpense;
  if (input.operatingIncome !== calcOperating) {
    return {
      isValid: false,
      error: `Hasil usaha sebelum penyesuaian (${input.operatingIncome}) tidak cocok dengan pendapatan dikurangi beban (${calcOperating}).`,
    };
  }
  const calcNet = calcOperating + (input.adjustmentAmount || 0);
  if (input.netIncome !== calcNet) {
    return {
      isValid: false,
      error: `Hasil usaha bersih (${input.netIncome}) tidak cocok dengan perhitungan pendapatan dikurangi beban ditambah koreksi (${calcNet}).`,
    };
  }
  if (input.adjustmentAmount !== 0 && (!input.adjustmentReason || input.adjustmentReason.trim().length < 3)) {
    return {
      isValid: false,
      error: "Alasan koreksi/penyesuaian wajib diisi minimal 3 karakter bila ada penyesuaian.",
    };
  }
  return { isValid: true };
}

export function validatePolicyPercentages(
  categories: Record<ShuAllocationCategoryKey, AllocationCategoryConfig>
): {
  isValid: boolean;
  totalPercentage: number;
  error?: string;
} {
  const keys = Object.keys(categories) as ShuAllocationCategoryKey[];
  let total = 0;
  for (const k of keys) {
    const pct = categories[k].percentage;
    if (pct < 0) {
      return { isValid: false, totalPercentage: total, error: `Persentase alokasi "${categories[k].label}" tidak boleh negatif.` };
    }
    total += pct;
  }
  const roundedTotal = Math.round(total * 100) / 100;
  if (roundedTotal !== 100) {
    return {
      isValid: false,
      totalPercentage: roundedTotal,
      error: `Total alokasi persentase SHU harus tepat 100%. Saat ini berjumlah ${roundedTotal}%.`,
    };
  }
  return { isValid: true, totalPercentage: 100 };
}
export function computeAllocations(
  distributableShu: number,
  categories: Record<ShuAllocationCategoryKey, AllocationCategoryConfig>
): Record<ShuAllocationCategoryKey, { percentage: number; allocatedAmount: number }> {
  const result = {} as Record<
    ShuAllocationCategoryKey,
    { percentage: number; allocatedAmount: number }
  >;
  if (distributableShu <= 0) {
    for (const key of Object.keys(categories) as ShuAllocationCategoryKey[]) {
      result[key] = { percentage: categories[key].percentage, allocatedAmount: 0 };
    }
    return result;
  }

  const keys = Object.keys(categories) as ShuAllocationCategoryKey[];
  let totalFloor = 0;
  const residuals: { key: ShuAllocationCategoryKey; frac: number }[] = [];

  for (const k of keys) {
    const pct = categories[k].percentage;
    const exact = (distributableShu * pct) / 100;
    const fl = Math.floor(exact);
    result[k] = { percentage: pct, allocatedAmount: fl };
    totalFloor += fl;
    residuals.push({ key: k, frac: exact - fl });
  }

  // Distribute residual rounding difference
  let diff = distributableShu - totalFloor;
  residuals.sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < residuals.length && diff > 0; i++) {
    result[residuals[i].key].allocatedAmount += 1;
    diff -= 1;
  }

  return result;
}
export function computeMemberDistributions(
  candidates: MemberCandidate[],
  savingsMap: Map<string, MemberSavingsData>,
  participationMap: Map<string, MemberParticipationData>,
  jasaModalPool: number,
  jasaUsahaPool: number,
  policy: ShuPolicyConfig
): {
  distributions: MemberShuDistributionItem[];
  roundingCorrection: {
    modalResidual: number;
    usahaResidual: number;
    totalResidual: number;
    appliedToMemberId?: string;
  };
  totalDistributed: number;
  isBalanced: boolean;
} {
  const distributions: MemberShuDistributionItem[] = [];
  const eligibleCandidates = candidates.filter((c) => c.isActive);

  if (eligibleCandidates.length === 0 || (jasaModalPool <= 0 && jasaUsahaPool <= 0)) {
    for (const c of candidates) {
      distributions.push({
        memberId: c.id,
        memberName: c.name,
        memberNumber: c.memberNumber,
        qualifyingCapital: 0,
        jasaModalRaw: 0,
        jasaModalFinal: 0,
        verifiedParticipation: 0,
        jasaUsahaRaw: 0,
        jasaUsahaFinal: 0,
        totalShu: 0,
        status: c.isActive ? "eligible" : "excluded",
        exclusionReason: c.isActive ? undefined : "Keanggotaan tidak aktif.",
      });
    }
    return {
      distributions,
      roundingCorrection: { modalResidual: 0, usahaResidual: 0, totalResidual: 0 },
      totalDistributed: 0,
      isBalanced: true,
    };
  }

  let totalQualifyingCapital = 0;
  let totalVerifiedParticipation = 0;

  const intermediate = eligibleCandidates.map((c) => {
    const sData = savingsMap.get(c.id) || { saldoPokok: 0, saldoWajib: 0, saldoSukarela: 0 };
    const pData = participationMap.get(c.id) || { spending: 0, commoditySupply: 0 };

    let capital = 0;
    if (policy.capitalSources.includeSimpananWajib) capital += sData.saldoWajib;
    if (policy.capitalSources.includeSimpananPokok) capital += sData.saldoPokok;
    if (policy.capitalSources.includeSimpananSukarela) capital += sData.saldoSukarela;

    const participation =
      pData.spending * policy.businessParticipationWeights.weightSpending +
      pData.commoditySupply * policy.businessParticipationWeights.weightCommoditySupply;

    totalQualifyingCapital += capital;
    totalVerifiedParticipation += participation;

    return { candidate: c, capital, participation };
  });

  let sumModalFloor = 0;
  let sumUsahaFloor = 0;

  const items = intermediate.map(({ candidate, capital, participation }) => {
    const rawModal =
      totalQualifyingCapital > 0 && jasaModalPool > 0
        ? (jasaModalPool * capital) / totalQualifyingCapital
        : 0;
    const floorModal = Math.floor(rawModal);
    const fracModal = rawModal - floorModal;

    const rawUsaha =
      totalVerifiedParticipation > 0 && jasaUsahaPool > 0
        ? (jasaUsahaPool * participation) / totalVerifiedParticipation
        : 0;
    const floorUsaha = Math.floor(rawUsaha);
    const fracUsaha = rawUsaha - floorUsaha;

    sumModalFloor += floorModal;
    sumUsahaFloor += floorUsaha;

    return {
      candidate,
      capital,
      rawModal,
      finalModal: floorModal,
      fracModal,
      participation,
      rawUsaha,
      finalUsaha: floorUsaha,
      fracUsaha,
    };
  });

  let modalResidual = jasaModalPool - sumModalFloor;
  if (modalResidual > 0 && totalQualifyingCapital > 0) {
    items.sort((a, b) => b.fracModal - a.fracModal || b.capital - a.capital);
    for (let i = 0; i < items.length && modalResidual > 0; i++) {
      items[i].finalModal += 1;
      modalResidual -= 1;
    }
  }

  let usahaResidual = jasaUsahaPool - sumUsahaFloor;
  if (usahaResidual > 0 && totalVerifiedParticipation > 0) {
    items.sort((a, b) => b.fracUsaha - a.fracUsaha || b.participation - a.participation);
    for (let i = 0; i < items.length && usahaResidual > 0; i++) {
      items[i].finalUsaha += 1;
      usahaResidual -= 1;
    }
  }

  const orderMap = new Map<string, number>();
  candidates.forEach((c, idx) => orderMap.set(c.id, idx));
  items.sort((a, b) => (orderMap.get(a.candidate.id) ?? 0) - (orderMap.get(b.candidate.id) ?? 0));

  let totalDistributed = 0;
  for (const it of items) {
    const totalShu = it.finalModal + it.finalUsaha;
    totalDistributed += totalShu;
    distributions.push({
      memberId: it.candidate.id,
      memberName: it.candidate.name,
      memberNumber: it.candidate.memberNumber,
      qualifyingCapital: Math.round(it.capital),
      jasaModalRaw: Math.round(it.rawModal * 100) / 100,
      jasaModalFinal: it.finalModal,
      verifiedParticipation: Math.round(it.participation),
      jasaUsahaRaw: Math.round(it.rawUsaha * 100) / 100,
      jasaUsahaFinal: it.finalUsaha,
      totalShu,
      status: "eligible",
    });
  }

  for (const c of candidates) {
    if (!c.isActive) {
      distributions.push({
        memberId: c.id,
        memberName: c.name,
        memberNumber: c.memberNumber,
        qualifyingCapital: 0,
        jasaModalRaw: 0,
        jasaModalFinal: 0,
        verifiedParticipation: 0,
        jasaUsahaRaw: 0,
        jasaUsahaFinal: 0,
        totalShu: 0,
        status: "excluded",
        exclusionReason: "Keanggotaan tidak aktif.",
      });
    }
  }

  const expectedTotal =
    (totalQualifyingCapital > 0 ? jasaModalPool : 0) +
    (totalVerifiedParticipation > 0 ? jasaUsahaPool : 0);
  const isBalanced = totalDistributed === expectedTotal;

  return {
    distributions,
    roundingCorrection: {
      modalResidual: 0,
      usahaResidual: 0,
      totalResidual: 0,
      appliedToMemberId: items[0]?.candidate.id,
    },
    totalDistributed,
    isBalanced,
  };
}


