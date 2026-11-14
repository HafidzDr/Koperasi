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
  if (!categories || typeof categories !== "object") {
    return { isValid: false, totalPercentage: 0, error: "Objek kategori kebijakan tidak valid atau null." };
  }
  const requiredKeys: ShuAllocationCategoryKey[] = [
    "cadangan",
    "jasa_modal",
    "jasa_usaha",
    "dana_pengurus",
    "dana_pendidikan",
    "dana_sosial",
  ];
  let sumInCents = 0;
  for (const k of requiredKeys) {
    const item = categories[k];
    if (!item || typeof item.percentage !== "number") {
      return { isValid: false, totalPercentage: 0, error: `Kategori alokasi "${k}" wajib ada dan memiliki persentase valid.` };
    }
    const pct = item.percentage;
    if (!Number.isFinite(pct)) {
      return { isValid: false, totalPercentage: 0, error: `Persentase alokasi "${item.label || k}" harus berupa angka terhingga.` };
    }
    if (pct < 0) {
      return { isValid: false, totalPercentage: 0, error: `Persentase alokasi "${item.label || k}" tidak boleh negatif.` };
    }
    if (pct > 100) {
      return { isValid: false, totalPercentage: 0, error: `Persentase alokasi "${item.label || k}" tidak boleh melebihi 100%.` };
    }
    const decStr = pct.toString().split(".")[1] || "";
    if (decStr.length > 2) {
      return {
        isValid: false,
        totalPercentage: pct,
        error: `Persentase alokasi "${item.label || k}" memiliki presisi lebih dari 2 desimal (${pct}%). Maksimal 2 angka desimal diperbolehkan.`,
      };
    }
    sumInCents += Math.round(pct * 100);
  }

  const exactTotal = sumInCents / 100;
  if (sumInCents !== 10000) {
    return {
      isValid: false,
      totalPercentage: exactTotal,
      error: `Total alokasi persentase SHU harus tepat 100% (100.00%). Saat ini berjumlah ${exactTotal}%.`,
    };
  }
  return { isValid: true, totalPercentage: 100 };
}

export function computeAllocations(
  distributableShu: number,
  categories: Record<ShuAllocationCategoryKey, AllocationCategoryConfig>
): Record<ShuAllocationCategoryKey, { percentage: number; allocatedAmount: number }> {
  if (!Number.isFinite(distributableShu) || !Number.isInteger(distributableShu) || distributableShu < 0) {
    throw new Error(`Nominal SHU yang dialokasikan harus berupa bilangan bulat integer non-negatif. Diterima: ${distributableShu}`);
  }

  const valResult = validatePolicyPercentages(categories);
  if (!valResult.isValid) {
    throw new Error(valResult.error || "Persentase kebijakan alokasi tidak valid.");
  }

  const result = {} as Record<
    ShuAllocationCategoryKey,
    { percentage: number; allocatedAmount: number }
  >;

  if (distributableShu === 0) {
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

  // Distribute residual rounding difference using largest remainder method
  let diff = distributableShu - totalFloor;
  residuals.sort((a, b) => b.frac - a.frac);

  while (diff > 0) {
    for (let i = 0; i < residuals.length && diff > 0; i++) {
      result[residuals[i].key].allocatedAmount += 1;
      diff -= 1;
    }
  }

  // Strict invariant verification
  const sumAllocated = (Object.keys(result) as ShuAllocationCategoryKey[]).reduce(
    (acc, k) => acc + result[k].allocatedAmount,
    0
  );
  if (sumAllocated !== distributableShu) {
    throw new Error(
      `Integritas alokasi gagal: total alokasi (Rp${sumAllocated.toLocaleString("id-ID")}) tidak sama dengan SHU yang dialokasikan (Rp${distributableShu.toLocaleString("id-ID")}).`
    );
  }

  return result;
}

export interface MemberDistributionResult {
  distributions: MemberShuDistributionItem[];
  roundingCorrection: {
    modalResidual: number;
    usahaResidual: number;
    totalResidual: number;
    appliedToMemberId?: string;
  };
  totalDistributed: number;
  allocatedJasaModal: number;
  allocatedJasaUsaha: number;
  undistributedModalPool: number;
  undistributedUsahaPool: number;
  totalEligibleCapitalMembers: number;
  totalEligibleParticipationMembers: number;
  isBalanced: boolean;
  unbalancedReason?: string;
}

export function computeMemberDistributions(
  candidates: MemberCandidate[],
  savingsMap: Map<string, MemberSavingsData>,
  participationMap: Map<string, MemberParticipationData>,
  jasaModalPool: number,
  jasaUsahaPool: number,
  policy: ShuPolicyConfig
): MemberDistributionResult {
  const distributions: MemberShuDistributionItem[] = [];
  const eligibleCandidates = candidates.filter((c) => c.isActive);

  const targetModalPool = jasaModalPool > 0 ? jasaModalPool : 0;
  const targetUsahaPool = jasaUsahaPool > 0 ? jasaUsahaPool : 0;
  const totalTargetPool = targetModalPool + targetUsahaPool;

  if (eligibleCandidates.length === 0) {
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
        status: "excluded",
        exclusionReason: "Keanggotaan tidak aktif.",
      });
    }
    const isZeroPool = totalTargetPool === 0;
    return {
      distributions,
      roundingCorrection: { modalResidual: 0, usahaResidual: 0, totalResidual: 0 },
      totalDistributed: 0,
      allocatedJasaModal: targetModalPool,
      allocatedJasaUsaha: targetUsahaPool,
      undistributedModalPool: targetModalPool,
      undistributedUsahaPool: targetUsahaPool,
      totalEligibleCapitalMembers: 0,
      totalEligibleParticipationMembers: 0,
      isBalanced: isZeroPool,
      unbalancedReason: isZeroPool ? undefined : "Tidak ada anggota aktif yang berhak menerima alokasi SHU.",
    };
  }

  if (totalTargetPool === 0) {
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
      allocatedJasaModal: 0,
      allocatedJasaUsaha: 0,
      undistributedModalPool: 0,
      undistributedUsahaPool: 0,
      totalEligibleCapitalMembers: 0,
      totalEligibleParticipationMembers: 0,
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

  const totalEligibleCapitalMembers = intermediate.filter((it) => it.capital > 0).length;
  const totalEligibleParticipationMembers = intermediate.filter((it) => it.participation > 0).length;

  let sumModalFloor = 0;
  let sumUsahaFloor = 0;

  const items = intermediate.map(({ candidate, capital, participation }) => {
    const rawModal =
      totalQualifyingCapital > 0 && targetModalPool > 0
        ? (targetModalPool * capital) / totalQualifyingCapital
        : 0;
    const floorModal = Math.floor(rawModal);
    const fracModal = rawModal - floorModal;

    const rawUsaha =
      totalVerifiedParticipation > 0 && targetUsahaPool > 0
        ? (targetUsahaPool * participation) / totalVerifiedParticipation
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

  // Largest remainder rounding for Jasa Modal
  let modalResidual = targetModalPool - sumModalFloor;
  if (modalResidual > 0 && totalQualifyingCapital > 0) {
    items.sort((a, b) => b.fracModal - a.fracModal || b.capital - a.capital);
    while (modalResidual > 0) {
      for (let i = 0; i < items.length && modalResidual > 0; i++) {
        items[i].finalModal += 1;
        modalResidual -= 1;
      }
    }
  }

  // Largest remainder rounding for Jasa Usaha
  let usahaResidual = targetUsahaPool - sumUsahaFloor;
  if (usahaResidual > 0 && totalVerifiedParticipation > 0) {
    items.sort((a, b) => b.fracUsaha - a.fracUsaha || b.participation - a.participation);
    while (usahaResidual > 0) {
      for (let i = 0; i < items.length && usahaResidual > 0; i++) {
        items[i].finalUsaha += 1;
        usahaResidual -= 1;
      }
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

  // Undistributed pool detection
  let undistributedModalPool = 0;
  let undistributedUsahaPool = 0;
  const unbalancedReasons: string[] = [];

  if (targetModalPool > 0 && totalQualifyingCapital === 0) {
    undistributedModalPool = targetModalPool;
    unbalancedReasons.push(
      `Alokasi Jasa Modal sebesar Rp${targetModalPool.toLocaleString("id-ID")} tidak dapat didistribusikan karena tidak ada simpanan anggota yang memenuhi syarat kualifikasi.`
    );
  }

  if (targetUsahaPool > 0 && totalVerifiedParticipation === 0) {
    undistributedUsahaPool = targetUsahaPool;
    unbalancedReasons.push(
      `Alokasi Jasa Usaha sebesar Rp${targetUsahaPool.toLocaleString("id-ID")} tidak dapat didistribusikan karena tidak ada transaksi partisipasi unit usaha berstatus verified.`
    );
  }

  // Invariant: totalDistributed must exactly equal allocatedJasaModal + allocatedJasaUsaha with 0 undistributed pool
  const isBalanced =
    totalDistributed === totalTargetPool &&
    undistributedModalPool === 0 &&
    undistributedUsahaPool === 0;

  if (!isBalanced && unbalancedReasons.length === 0) {
    unbalancedReasons.push(
      `Total distribusi anggota (Rp${totalDistributed.toLocaleString("id-ID")}) tidak seimbang dengan alokasi pool yang disyaratkan (Rp${totalTargetPool.toLocaleString("id-ID")}).`
    );
  }

  return {
    distributions,
    roundingCorrection: {
      modalResidual: 0,
      usahaResidual: 0,
      totalResidual: 0,
      appliedToMemberId: items[0]?.candidate.id,
    },
    totalDistributed,
    allocatedJasaModal: targetModalPool,
    allocatedJasaUsaha: targetUsahaPool,
    undistributedModalPool,
    undistributedUsahaPool,
    totalEligibleCapitalMembers,
    totalEligibleParticipationMembers,
    isBalanced,
    unbalancedReason: unbalancedReasons.length > 0 ? unbalancedReasons.join(" ") : undefined,
  };
}


