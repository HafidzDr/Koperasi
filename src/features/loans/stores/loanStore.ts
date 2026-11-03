/**
 * Zustand Store untuk Loan & Installment Management
 * Koperasi Konsumen Makmur Bersama Nusantara (KMB)
 *
 * Mengacu pada PRD, Information Architecture Seksi 5.4,
 * Business Rules BR-03 & BR-04, dan DEMO_SIMULATION_SPEC.md.
 */

import { create } from "zustand";
import {
  Loan,
  LoanApplication,
  LoanApplicationStatus,
  LoanProductConfig,
  LoanSystemConfig,
  LoanConfigHistoryEntry,
  InstallmentPaymentRecord,
  LoanPortfolioSummary,
  InterestCalculationMethod,
  LoanProductType,
} from "../types";
import {
  DEFAULT_LOAN_SYSTEM_CONFIG,
  defaultLoanProducts,
  initialLoanApplications,
  buildInitialLoans,
} from "../mocks/loanSeedData";
import { useAuthStore } from "@/stores/authStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { hasPermission } from "@/lib/rbac";
import {
  generateSchedule,
  determineCollectibility,
  allocateInstallmentPayment,
  calculateEarlyRepayment,
} from "../utils/loanCalculations";

const STORAGE_KEY = "kmb_loans_store_v1";

export interface SubmitApplicationPayload {
  memberDemoId: string;
  productType: LoanProductType;
  amount: number;
  tenorMonths: number;
  calculationMethod?: InterestCalculationMethod;
  purpose: string;
  purposeCategory: string;
  incomeSource: string;
  simulatedDocumentUrl?: string;
  notes?: string;
}

export interface RecordInstallmentPaymentPayload {
  loanId: string;
  installmentNumber: number;
  amountPaid: number;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
  idempotencyKey?: string;
}

export interface AdjustLateFeePayload {
  loanId: string;
  installmentNumber: number;
  waiveFee: boolean;
  newLateFeeAmount?: number;
  reason: string;
}

export interface LoanState {
  products: LoanProductConfig[];
  systemConfig: LoanSystemConfig;
  configHistory: LoanConfigHistoryEntry[];
  applications: LoanApplication[];
  loans: Loan[];
  paymentRecords: InstallmentPaymentRecord[];
  processedDisbursements: string[];
  processedPayments: string[];

  // --- ACTIONS ---
  submitApplication: (payload: SubmitApplicationPayload) => {
    success: boolean;
    applicationId?: string;
    error?: string;
  };

  reviewApplication: (
    applicationId: string,
    notes?: string
  ) => { success: boolean; error?: string };

  recommendApplication: (
    applicationId: string,
    notes?: string
  ) => { success: boolean; error?: string };

  approveApplication: (
    applicationId: string,
    notes?: string
  ) => { success: boolean; error?: string };

  rejectApplication: (
    applicationId: string,
    reason: string
  ) => { success: boolean; error?: string };

  disburseLoan: (
    applicationId: string,
    channel?: string,
    notes?: string
  ) => { success: boolean; loanId?: string; error?: string };

  recordInstallmentPayment: (
    payload: RecordInstallmentPaymentPayload
  ) => { success: boolean; paymentRecordId?: string; error?: string };

  adjustInstallmentLateFee: (
    payload: AdjustLateFeePayload
  ) => { success: boolean; error?: string };

  executeEarlyRepayment: (
    loanId: string,
    paymentMethod?: string,
    notes?: string
  ) => { success: boolean; paymentRecordId?: string; error?: string };

  updateSystemConfig: (
    updates: Partial<LoanSystemConfig>,
    notes?: string
  ) => { success: boolean; error?: string };

  resetToSeed: () => void;

  // --- QUERIES ---
  getLoanById: (id: string) => Loan | undefined;
  getApplicationById: (id: string) => LoanApplication | undefined;
  getMemberLoans: (memberDemoId: string) => Loan[];
  getMemberApplications: (memberDemoId: string) => LoanApplication[];
  getPendingApplications: () => LoanApplication[];
  getApprovedPendingDisbursement: () => LoanApplication[];
  getActiveLoans: () => Loan[];
  getPortfolioSummary: () => LoanPortfolioSummary;
}

function loadInitialState(): {
  products: LoanProductConfig[];
  systemConfig: LoanSystemConfig;
  configHistory: LoanConfigHistoryEntry[];
  applications: LoanApplication[];
  loans: Loan[];
  paymentRecords: InstallmentPaymentRecord[];
  processedDisbursements: string[];
  processedPayments: string[];
} {
  const { loans: seedLoans, paymentRecords: seedPayments } = buildInitialLoans();

  const fallback = {
    products: defaultLoanProducts,
    systemConfig: DEFAULT_LOAN_SYSTEM_CONFIG,
    configHistory: [],
    applications: initialLoanApplications,
    loans: seedLoans,
    paymentRecords: seedPayments,
    processedDisbursements: seedLoans.map((l) => l.applicationId),
    processedPayments: seedPayments.map((p) => p.id),
  };

  if (typeof window === "undefined" || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      products: parsed.products || fallback.products,
      systemConfig: parsed.systemConfig || fallback.systemConfig,
      configHistory: parsed.configHistory || fallback.configHistory,
      applications: parsed.applications || fallback.applications,
      loans: parsed.loans || fallback.loans,
      paymentRecords: parsed.paymentRecords || fallback.paymentRecords,
      processedDisbursements: parsed.processedDisbursements || fallback.processedDisbursements,
      processedPayments: parsed.processedPayments || fallback.processedPayments,
    };
  } catch (err) {
    console.warn("Failed to parse loans store from localStorage, using seed:", err);
    return fallback;
  }
}

function saveToStorage(state: {
  products: LoanProductConfig[];
  systemConfig: LoanSystemConfig;
  configHistory: LoanConfigHistoryEntry[];
  applications: LoanApplication[];
  loans: Loan[];
  paymentRecords: InstallmentPaymentRecord[];
  processedDisbursements: string[];
  processedPayments: string[];
}) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("Failed to save loans store to localStorage:", err);
    }
  }
}

export const useLoanStore = create<LoanState>((set, get) => {
  const initialState = loadInitialState();

  return {
    ...initialState,

    submitApplication: (payload) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid. Silakan masuk terlebih dahulu." };
      }

      // Validasi kewenangan peran (hanya role dengan permission loans:create, yaitu member)
      if (!hasPermission(currentUser.role, "loans:create")) {
        return { success: false, error: "Peran Anda tidak memiliki kewenangan mengajukan pinjaman." };
      }

      // Validasi kepemilikan akun anggota (memberId aktif dan harus sesuai dengan payload)
      if (!currentUser.memberId) {
        return { success: false, error: "Akun Anda tidak terhubung dengan profil anggota yang valid." };
      }

      if (currentUser.memberId !== payload.memberDemoId) {
        return {
          success: false,
          error: "Pengajuan pinjaman hanya dapat dilakukan untuk akun anggota sendiri. Tidak diizinkan mengajukan atas nama anggota lain.",
        };
      }

      // Validasi Anggota
      const membership = useMembershipStore.getState();
      const member = membership.getMemberByDemoId(payload.memberDemoId);
      if (!member) {
        return { success: false, error: `Anggota dengan ID ${payload.memberDemoId} tidak ditemukan.` };
      }

      if (member.status === "suspended") {
        return { success: false, error: "Anggota dalam status Dibekukan tidak dapat mengajukan pinjaman baru." };
      }

      // Validasi kuota pinjaman aktif
      const { loans, applications, systemConfig, products } = get();
      const memberActiveLoans = loans.filter(
        (l) => l.memberDemoId === payload.memberDemoId && (l.status === "active" || l.status === "defaulted")
      );

      if (memberActiveLoans.length >= systemConfig.maxActiveLoansPerMember) {
        return {
          success: false,
          error: `Maksimum pinjaman aktif tercapai (${systemConfig.maxActiveLoansPerMember} pinjaman). Anggota harus melunasi pinjaman berjalan terlebih dahulu.`,
        };
      }

      // Cek apakah anggota memiliki tunggakan/keterlambatan
      const hasOverdue = memberActiveLoans.some(
        (l) => l.daysPastDue > 0 || l.collectibility !== "Lancar"
      );
      if (hasOverdue) {
        return {
          success: false,
          error: "Anggota memiliki angsuran pinjaman yang telah lewat jatuh tempo. Harap selesaikan tunggakan sebelum mengajukan baru.",
        };
      }

      // Validasi Produk Pinjaman
      const product = products.find((p) => p.type === payload.productType && p.status === "active");
      if (!product) {
        return { success: false, error: "Jenis produk pinjaman tidak aktif atau tidak ditemukan." };
      }

      // Validasi integritas numerik nominal: finite, positif, integer
      if (
        typeof payload.amount !== "number" ||
        !Number.isFinite(payload.amount) ||
        payload.amount <= 0 ||
        !Number.isInteger(payload.amount)
      ) {
        return { success: false, error: "Nominal pinjaman harus berupa bilangan bulat positif yang valid." };
      }

      // Validasi integritas numerik tenor: finite, positif, integer
      if (
        typeof payload.tenorMonths !== "number" ||
        !Number.isFinite(payload.tenorMonths) ||
        payload.tenorMonths <= 0 ||
        !Number.isInteger(payload.tenorMonths)
      ) {
        return { success: false, error: "Tenor pinjaman harus berupa bilangan bulat bulan yang valid." };
      }

      const amount = payload.amount;
      if (amount < product.minAmount || amount > product.maxAmount) {
        return {
          success: false,
          error: `Nominal pinjaman harus berada di antara Rp ${product.minAmount.toLocaleString("id-ID")} dan Rp ${product.maxAmount.toLocaleString("id-ID")}.`,
        };
      }

      const tenor = payload.tenorMonths;
      if (tenor < product.minTenorMonths || tenor > product.maxTenorMonths) {
        return {
          success: false,
          error: `Tenor pinjaman harus berada di antara ${product.minTenorMonths} dan ${product.maxTenorMonths} bulan.`,
        };
      }

      const adminFeeAmount = Math.round((amount * product.adminFeePct) / 100);
      const netDisbursementAmount = Math.max(0, amount - adminFeeAmount);

      // Generate ID unik
      const existingIds = new Set([...applications.map((a) => a.id), ...loans.map((l) => l.id)]);
      let nextNum = applications.length + loans.length + 1;
      let newId = `PJ-2026-${String(nextNum).padStart(4, "0")}`;
      while (existingIds.has(newId)) {
        nextNum++;
        newId = `PJ-2026-${String(nextNum).padStart(4, "0")}`;
      }

      const nowIso = new Date().toISOString();
      const newApplication: LoanApplication = {
        id: newId,
        memberDemoId: member.demoId,
        memberNumber: member.memberNumber,
        memberName: member.fullName,
        productType: product.type,
        productName: product.name,
        amount,
        tenorMonths: tenor,
        interestRatePct: product.interestRatePct,
        calculationMethod: payload.calculationMethod || product.calculationMethod || "flat",
        adminFeePct: product.adminFeePct,
        adminFeeAmount,
        netDisbursementAmount,
        purpose: payload.purpose.trim(),
        purposeCategory: payload.purposeCategory.trim(),
        incomeSource: payload.incomeSource.trim(),
        status: "submitted",
        applicationDate: nowIso,
        simulatedDocumentUrl:
          payload.simulatedDocumentUrl || "SIMULATED DOCUMENT: bukti-kelayakan-dokumen.pdf",
        notes: payload.notes?.trim(),
        createdById: currentUser.id,
        createdByRole: currentUser.role,
        createdByName: currentUser.name,
        history: [
          {
            id: `LOG-APP-${newId}-1`,
            timestamp: nowIso,
            actorRole: currentUser.role,
            actorName: currentUser.name,
            fromStatus: "draft",
            toStatus: "submitted",
            action: "Pengajuan Pinjaman",
            notes: `Pengajuan ${product.name} sebesar Rp ${amount.toLocaleString("id-ID")} diajukan.`,
          },
        ],
      };

      const updatedApplications = [newApplication, ...applications];
      set({ applications: updatedApplications });
      saveToStorage({ ...get(), applications: updatedApplications });

      return { success: true, applicationId: newId };
    },

    reviewApplication: (applicationId, notes) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid." };
      }

      // Eksplisit: Hanya peran Staff dengan izin loans:review yang berwenang verifikasi administratif
      if (currentUser.role !== "staff" || !hasPermission(currentUser.role, "loans:review")) {
        return {
          success: false,
          error: "Otoritas Ditolak: Hanya Staf (staff) yang berwenang melakukan verifikasi administratif berkas pengajuan.",
        };
      }

      const { applications } = get();
      const target = applications.find((a) => a.id === applicationId);
      if (!target) {
        return { success: false, error: "Pengajuan pinjaman tidak ditemukan." };
      }

      if (target.status !== "submitted") {
        return {
          success: false,
          error: `Pengajuan berstatus "${target.status}". Hanya status "submitted" yang dapat diverifikasi.`,
        };
      }

      // SoD: Pembuat pengajuan tidak dapat memverifikasi pengajuannya sendiri
      if (target.createdById === currentUser.id) {
        return {
          success: false,
          error: "Prinsip Separation of Duties (SoD): Anda tidak dapat memverifikasi pengajuan pinjaman yang Anda buat sendiri.",
        };
      }

      const nowIso = new Date().toISOString();
      const updatedApplications = applications.map((a) => {
        if (a.id !== applicationId) return a;
        return {
          ...a,
          status: "under_review" as const,
          reviewedById: currentUser.id,
          reviewedByRole: currentUser.role,
          reviewedByName: currentUser.name,
          reviewedAt: nowIso,
          reviewNotes: notes?.trim(),
          history: [
            ...a.history,
            {
              id: `LOG-APP-${a.id}-${a.history.length + 1}`,
              timestamp: nowIso,
              actorRole: currentUser.role,
              actorName: currentUser.name,
              fromStatus: "submitted",
              toStatus: "under_review",
              action: "Verifikasi Administratif",
              notes: notes?.trim() || "Berkas dan dokumen pendukung diverifikasi oleh staf.",
            },
          ],
        };
      });

      set({ applications: updatedApplications });
      saveToStorage({ ...get(), applications: updatedApplications });

      return { success: true };
    },

    recommendApplication: (applicationId, notes) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid." };
      }

      // Eksplisit: Hanya peran Finance Officer dengan izin loans:review yang berwenang memberikan rekomendasi
      if (currentUser.role !== "finance_officer" || !hasPermission(currentUser.role, "loans:review")) {
        return {
          success: false,
          error: "Otoritas Ditolak: Hanya Petugas Keuangan (Finance Officer) yang berwenang memberikan rekomendasi pengajuan pinjaman.",
        };
      }

      const { applications } = get();
      const target = applications.find((a) => a.id === applicationId);
      if (!target) {
        return { success: false, error: "Pengajuan pinjaman tidak ditemukan." };
      }

      if (target.status !== "under_review") {
        return {
          success: false,
          error: `Pengajuan berstatus "${target.status}". Hanya status "under_review" yang dapat direkomendasikan.`,
        };
      }

      // SoD
      if (target.createdById === currentUser.id) {
        return {
          success: false,
          error: "Prinsip Separation of Duties (SoD): Anda tidak dapat merekomendasikan pengajuan yang Anda buat sendiri.",
        };
      }

      const nowIso = new Date().toISOString();
      const updatedApplications = applications.map((a) => {
        if (a.id !== applicationId) return a;
        return {
          ...a,
          status: "recommended" as const,
          recommendedById: currentUser.id,
          recommendedByRole: currentUser.role,
          recommendedByName: currentUser.name,
          recommendedAt: nowIso,
          recommendationNotes: notes?.trim(),
          history: [
            ...a.history,
            {
              id: `LOG-APP-${a.id}-${a.history.length + 1}`,
              timestamp: nowIso,
              actorRole: currentUser.role,
              actorName: currentUser.name,
              fromStatus: "under_review",
              toStatus: "recommended",
              action: "Rekomendasi Persetujuan",
              notes: notes?.trim() || "Pengajuan direkomendasikan untuk persetujuan berwenang.",
            },
          ],
        };
      });

      set({ applications: updatedApplications });
      saveToStorage({ ...get(), applications: updatedApplications });

      return { success: true };
    },

    approveApplication: (applicationId, notes) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid." };
      }

      if (!hasPermission(currentUser.role, "loans:approve")) {
        return { success: false, error: "Peran Anda tidak memiliki kewenangan menyetujui pinjaman." };
      }

      const { applications, systemConfig } = get();
      const target = applications.find((a) => a.id === applicationId);
      if (!target) {
        return { success: false, error: "Pengajuan pinjaman tidak ditemukan." };
      }

      // 1. Persetujuan langsung dari submitted dilarang keras
      if (target.status === "submitted") {
        return {
          success: false,
          error: "Persetujuan langsung dari status diajukan (submitted) tidak diizinkan. Pengajuan harus melalui verifikasi administratif terlebih dahulu.",
        };
      }

      // 2. Separation of Duties: Pembuat dilarang menyetujui pinjamannya sendiri
      if (target.createdById === currentUser.id) {
        return {
          success: false,
          error: "Prinsip Separation of Duties (SoD): Pejabat yang membuat permohonan pinjaman dilarang menyetujui pinjamannya sendiri.",
        };
      }

      // 3. Validasi alur berdasarkan Peran (FO vs Manager)
      if (currentUser.role === "finance_officer") {
        if (target.status !== "under_review") {
          return {
            success: false,
            error: `Finance Officer hanya dapat menyetujui pengajuan berstatus "under_review". Status saat ini: "${target.status}".`,
          };
        }
        if (target.amount > systemConfig.approvalThresholdFoMax) {
          return {
            success: false,
            error: `Nominal pinjaman (Rp ${target.amount.toLocaleString("id-ID")}) melebihi batas kewenangan Finance Officer (maksimal Rp ${systemConfig.approvalThresholdFoMax.toLocaleString("id-ID")}). Pengajuan wajib direkomendasikan dan disetujui oleh Pengurus / Manajer.`,
          };
        }
      } else if (currentUser.role === "manager") {
        if (target.status === "under_review") {
          return {
            success: false,
            error: "Manajer / Pengurus hanya dapat menyetujui pengajuan yang telah direkomendasikan (status recommended). Pemeriksaan dan rekomendasi tidak boleh dilewati.",
          };
        }
        if (target.status !== "recommended") {
          return {
            success: false,
            error: `Status pengajuan "${target.status}" tidak dapat disetujui oleh Manajer. Status harus "recommended".`,
          };
        }
      } else {
        return {
          success: false,
          error: "Peran Anda tidak memiliki kewenangan menyetujui pinjaman.",
        };
      }

      const nowIso = new Date().toISOString();
      const updatedApplications = applications.map((a) => {
        if (a.id !== applicationId) return a;
        return {
          ...a,
          status: "approved" as const,
          approvedById: currentUser.id,
          approvedByRole: currentUser.role,
          approvedByName: currentUser.name,
          approvedAt: nowIso,
          approvalNotes: notes?.trim(),
          history: [
            ...a.history,
            {
              id: `LOG-APP-${a.id}-${a.history.length + 1}`,
              timestamp: nowIso,
              actorRole: currentUser.role,
              actorName: currentUser.name,
              fromStatus: a.status,
              toStatus: "approved",
              action: "Persetujuan Pinjaman",
              notes: notes?.trim() || "Pengajuan pinjaman resmi disetujui dan siap dicairkan.",
            },
          ],
        };
      });

      set({ applications: updatedApplications });
      saveToStorage({ ...get(), applications: updatedApplications });

      return { success: true };
    },

    rejectApplication: (applicationId, reason) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid." };
      }

      const disallowedRoles = ["auditor", "admin", "super_admin", "member", "public_visitor", "applicant"];
      if (
        disallowedRoles.includes(currentUser.role) ||
        (!hasPermission(currentUser.role, "loans:reject") && !hasPermission(currentUser.role, "loans:approve"))
      ) {
        return { success: false, error: "Peran Anda tidak memiliki kewenangan menolak pengajuan pinjaman." };
      }

      if (typeof reason !== "string" || !reason.trim()) {
        return { success: false, error: "Alasan penolakan pengajuan wajib diisi secara transparan." };
      }

      const { applications } = get();
      const target = applications.find((a) => a.id === applicationId);
      if (!target) {
        return { success: false, error: "Pengajuan pinjaman tidak ditemukan." };
      }

      const rejectableStatuses: LoanApplicationStatus[] = ["submitted", "under_review", "recommended"];
      if (!rejectableStatuses.includes(target.status)) {
        return {
          success: false,
          error: `Pengajuan berstatus "${target.status}" tidak dapat ditolak.`,
        };
      }

      // SoD: Pembuat dilarang menolak permohonan sendiri
      if (target.createdById === currentUser.id) {
        return {
          success: false,
          error: "Prinsip Separation of Duties (SoD): Anda tidak dapat menolak pengajuan pinjaman yang Anda buat sendiri.",
        };
      }

      const nowIso = new Date().toISOString();
      const updatedApplications = applications.map((a) => {
        if (a.id !== applicationId) return a;
        return {
          ...a,
          status: "rejected" as const,
          rejectionReason: reason.trim(),
          history: [
            ...a.history,
            {
              id: `LOG-APP-${a.id}-${a.history.length + 1}`,
              timestamp: nowIso,
              actorRole: currentUser.role,
              actorName: currentUser.name,
              fromStatus: a.status,
              toStatus: "rejected",
              action: "Penolakan Pengajuan",
              notes: reason.trim(),
            },
          ],
        };
      });

      set({ applications: updatedApplications });
      saveToStorage({ ...get(), applications: updatedApplications });

      return { success: true };
    },

    disburseLoan: (applicationId, channel = "Transfer Rekening Anggota (Simulasi)", notes) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid." };
      }

      if (!hasPermission(currentUser.role, "loans:disburse")) {
        return { success: false, error: "Hanya Petugas Keuangan (Finance Officer) yang berwenang mencairkan pinjaman." };
      }

      const { applications, loans, processedDisbursements } = get();
      const app = applications.find((a) => a.id === applicationId);
      if (!app) {
        return { success: false, error: "Pengajuan pinjaman tidak ditemukan." };
      }

      if (app.status !== "approved") {
        return {
          success: false,
          error: `Pinjaman berstatus "${app.status}". Hanya pinjaman berstatus "approved" yang dapat dicairkan.`,
        };
      }

      // Idempotency check
      if (processedDisbursements.includes(applicationId)) {
        return {
          success: false,
          error: `Pengajuan ${applicationId} sudah dicairkan sebelumnya (idempotency guard).`,
        };
      }

      // SoD: Staf yang memverifikasi/mereview tidak boleh merangkap pencair
      if (app.reviewedById === currentUser.id || app.createdById === currentUser.id) {
        return {
          success: false,
          error: "Prinsip SoD: Petugas yang mengajukan atau memverifikasi dokumen tidak dapat merangkap sebagai pihak pencair dana.",
        };
      }

      const nowIso = new Date().toISOString();
      const disbursementDate = nowIso.slice(0, 10);

      // Generate jadwal angsuran dinamis
      const rawSchedule = generateSchedule(
        app.calculationMethod,
        app.amount,
        app.tenorMonths,
        app.interestRatePct,
        disbursementDate
      );

      const installments = rawSchedule.map((s, idx) => ({
        installmentNumber: idx + 1,
        dueDate: s.dueDate,
        principalAmount: s.principalAmount,
        interestAmount: s.interestAmount,
        totalAmount: s.totalAmount,
        remainingPrincipalAfter: s.remainingPrincipalAfter,
        paidPrincipal: 0,
        paidInterest: 0,
        paidLateFee: 0,
        lateFeeAmount: 0,
        daysLate: 0,
        status: "upcoming" as const,
      }));

      const newLoanId = app.id;
      const newLoan: Loan = {
        id: newLoanId,
        applicationId: app.id,
        memberDemoId: app.memberDemoId,
        memberNumber: app.memberNumber,
        memberName: app.memberName,
        productType: app.productType,
        productName: app.productName,
        principalAmount: app.amount,
        interestRatePct: app.interestRatePct,
        calculationMethod: app.calculationMethod,
        tenorMonths: app.tenorMonths,
        adminFeeAmount: app.adminFeeAmount,
        netDisbursedAmount: app.netDisbursementAmount,
        disbursementDate,
        disbursedById: currentUser.id,
        disbursedByRole: currentUser.role,
        disbursedByName: currentUser.name,
        disbursementChannel: channel,
        status: "active",
        collectibility: "Lancar",
        daysPastDue: 0,
        remainingPrincipal: app.amount,
        totalPaidPrincipal: 0,
        totalPaidInterest: 0,
        totalPaidLateFee: 0,
        installments,
        history: [
          {
            id: `LOG-DISB-${newLoanId}`,
            timestamp: nowIso,
            actorRole: currentUser.role,
            actorName: currentUser.name,
            fromStatus: "approved",
            toStatus: "active",
            action: "Pencairan Pinjaman",
            notes: notes?.trim() || `Dana bersih Rp ${app.netDisbursementAmount.toLocaleString("id-ID")} disalurkan via ${channel}.`,
          },
        ],
      };

      const updatedLoans = [newLoan, ...loans];
      const updatedProcessed = [...processedDisbursements, applicationId];

      set({
        loans: updatedLoans,
        processedDisbursements: updatedProcessed,
      });

      saveToStorage({
        ...get(),
        loans: updatedLoans,
        processedDisbursements: updatedProcessed,
      });

      return { success: true, loanId: newLoanId };
    },

    recordInstallmentPayment: (payload) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid." };
      }

      const { loans, paymentRecords, processedPayments } = get();
      const loan = loans.find((l) => l.id === payload.loanId);
      if (!loan) {
        return { success: false, error: "Pinjaman tidak ditemukan." };
      }

      // Verifikasi hak akses & isolasi anggota
      if (currentUser.role === "member") {
        if (!currentUser.memberId || currentUser.memberId !== loan.memberDemoId) {
          return {
            success: false,
            error: "Akses ditolak: Anda hanya dapat melakukan pembayaran angsuran untuk pinjaman Anda sendiri.",
          };
        }
      } else if (!hasPermission(currentUser.role, "installments:record")) {
        return { success: false, error: "Peran Anda tidak memiliki kewenangan mencatat pembayaran angsuran." };
      }

      // Idempotency check: jika ada idempotencyKey
      if (payload.idempotencyKey && processedPayments.includes(payload.idempotencyKey)) {
        return {
          success: false,
          error: `Pembayaran dengan kunci idempotensi "${payload.idempotencyKey}" telah diproses sebelumnya.`,
        };
      }

      if (loan.status === "paid_off") {
        return { success: false, error: "Pinjaman ini sudah lunas sepenuhnya." };
      }

      const installment = loan.installments.find(
        (i) => i.installmentNumber === payload.installmentNumber
      );
      if (!installment) {
        return { success: false, error: `Angsuran ke-${payload.installmentNumber} tidak ditemukan.` };
      }

      if (installment.status === "paid") {
        return { success: false, error: `Angsuran ke-${payload.installmentNumber} sudah lunas.` };
      }

      // Validasi nominal pembayaran: integer Rupiah, positif, finite
      if (
        typeof payload.amountPaid !== "number" ||
        !Number.isFinite(payload.amountPaid) ||
        payload.amountPaid <= 0 ||
        !Number.isInteger(payload.amountPaid)
      ) {
        return { success: false, error: "Nominal pembayaran harus berupa bilangan bulat positif yang valid." };
      }

      const paymentAmount = payload.amountPaid;

      // Hitung sisa kewajiban angsuran ini
      const outstandingLateFee = installment.lateFeeWaived
        ? 0
        : Math.max(0, installment.lateFeeAmount - installment.paidLateFee);
      const outstandingInterest = Math.max(0, installment.interestAmount - installment.paidInterest);
      const outstandingPrincipal = Math.max(0, installment.principalAmount - installment.paidPrincipal);
      const totalObligation = outstandingLateFee + outstandingInterest + outstandingPrincipal;

      if (paymentAmount > totalObligation) {
        return {
          success: false,
          error: `Nominal pembayaran (Rp ${paymentAmount.toLocaleString("id-ID")}) melebihi total sisa kewajiban angsuran ke-${payload.installmentNumber} (Rp ${totalObligation.toLocaleString("id-ID")}). Kelebihan bayar tidak diizinkan.`,
        };
      }

      // Prioritas Alokasi: Denda -> Bunga -> Pokok (BR-04.3)
      const {
        allocatedLateFee,
        allocatedInterest,
        allocatedPrincipal,
        remainingUnallocated,
      } = allocateInstallmentPayment(
        paymentAmount,
        outstandingLateFee,
        outstandingInterest,
        outstandingPrincipal
      );

      // Verifikasi integritas alokasi
      if (
        remainingUnallocated !== 0 ||
        (allocatedLateFee + allocatedInterest + allocatedPrincipal !== paymentAmount) ||
        allocatedLateFee > outstandingLateFee ||
        allocatedInterest > outstandingInterest ||
        allocatedPrincipal > outstandingPrincipal
      ) {
        return {
          success: false,
          error: "Integritas alokasi pembayaran gagal: alokasi tidak sesuai dengan nominal pembayaran.",
        };
      }

      const newPaidLateFee = installment.paidLateFee + allocatedLateFee;
      const newPaidInterest = installment.paidInterest + allocatedInterest;
      const newPaidPrincipal = installment.paidPrincipal + allocatedPrincipal;

      const isInstallmentFullyPaid =
        newPaidPrincipal >= installment.principalAmount &&
        newPaidInterest >= installment.interestAmount &&
        (installment.lateFeeWaived || newPaidLateFee >= installment.lateFeeAmount);

      const nowIso = new Date().toISOString();
      const paymentDate = nowIso.slice(0, 10);

      const paymentRecordId = `BYR-2026-${loan.id.slice(8)}-${String(payload.installmentNumber).padStart(2, "0")}-${Date.now().toString().slice(-4)}`;

      // Update angsuran dan pinjaman
      const updatedInstallments = loan.installments.map((inst) => {
        if (inst.installmentNumber !== payload.installmentNumber) return inst;
        return {
          ...inst,
          paidLateFee: newPaidLateFee,
          paidInterest: newPaidInterest,
          paidPrincipal: newPaidPrincipal,
          status: isInstallmentFullyPaid ? ("paid" as const) : ("partially_paid" as const),
          paidAt: isInstallmentFullyPaid ? nowIso : inst.paidAt,
          paymentMethod: payload.paymentMethod || "Transfer Bank (Simulasi)",
          referenceNumber: payload.referenceNumber || `REF-${paymentRecordId}`,
        };
      });

      const totalPaidPrincipal = updatedInstallments.reduce((sum, i) => sum + i.paidPrincipal, 0);
      const totalPaidInterest = updatedInstallments.reduce((sum, i) => sum + i.paidInterest, 0);
      const totalPaidLateFee = updatedInstallments.reduce((sum, i) => sum + i.paidLateFee, 0);
      const remainingPrincipal = Math.max(0, loan.principalAmount - totalPaidPrincipal);

      const allPaid = updatedInstallments.every((i) => i.status === "paid") && remainingPrincipal === 0;

      // Recompute daysPastDue & collectibility
      let maxDaysLate = 0;
      if (!allPaid) {
        for (const inst of updatedInstallments) {
          if (inst.status !== "paid" && inst.daysLate > maxDaysLate) {
            maxDaysLate = inst.daysLate;
          }
        }
      }

      const updatedLoan: Loan = {
        ...loan,
        installments: updatedInstallments,
        totalPaidPrincipal,
        totalPaidInterest,
        totalPaidLateFee,
        remainingPrincipal,
        status: allPaid ? "paid_off" : loan.status,
        collectibility: allPaid ? "Lancar" : determineCollectibility(maxDaysLate),
        daysPastDue: allPaid ? 0 : maxDaysLate,
        history: [
          ...loan.history,
          {
            id: `LOG-PAY-${paymentRecordId}`,
            timestamp: nowIso,
            actorRole: currentUser.role,
            actorName: currentUser.name,
            fromStatus: loan.status,
            toStatus: allPaid ? "paid_off" : loan.status,
            action: "Pencatatan Pembayaran Angsuran",
            notes: `Pembayaran angsuran ke-${payload.installmentNumber} sebesar Rp ${paymentAmount.toLocaleString("id-ID")} (Alokasi: Pokok Rp ${allocatedPrincipal.toLocaleString("id-ID")}, Bunga Rp ${allocatedInterest.toLocaleString("id-ID")}, Denda Rp ${allocatedLateFee.toLocaleString("id-ID")}).`,
          },
        ],
      };

      const newPaymentRecord: InstallmentPaymentRecord = {
        id: paymentRecordId,
        loanId: loan.id,
        installmentNumber: payload.installmentNumber,
        memberDemoId: loan.memberDemoId,
        memberNumber: loan.memberNumber,
        memberName: loan.memberName,
        paymentDate,
        amountPaid: paymentAmount,
        allocatedLateFee,
        allocatedInterest,
        allocatedPrincipal,
        paymentMethod: payload.paymentMethod || "Transfer Bank (Simulasi)",
        referenceNumber: payload.referenceNumber || `REF-${paymentRecordId}`,
        notes: payload.notes?.trim(),
        recordedById: currentUser.id,
        recordedByRole: currentUser.role,
        recordedByName: currentUser.name,
      };

      const updatedLoans = loans.map((l) => (l.id === loan.id ? updatedLoan : l));
      const updatedPaymentRecords = [newPaymentRecord, ...paymentRecords];
      const updatedProcessedPayments = [
        ...processedPayments,
        paymentRecordId,
        ...(payload.idempotencyKey ? [payload.idempotencyKey] : []),
      ];

      set({
        loans: updatedLoans,
        paymentRecords: updatedPaymentRecords,
        processedPayments: updatedProcessedPayments,
      });

      saveToStorage({
        ...get(),
        loans: updatedLoans,
        paymentRecords: updatedPaymentRecords,
        processedPayments: updatedProcessedPayments,
      });

      return { success: true, paymentRecordId };
    },

    adjustInstallmentLateFee: (payload) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid." };
      }

      // Sesuai Matriks IA 5.4 & BR-03.8: Hanya Bendahara (Treasurer) yang memiliki izin penyesuaian/penghapusan denda
      if (!hasPermission(currentUser.role, "installments:adjust")) {
        return {
          success: false,
          error: "Otoritas Ditolak: Hanya Bendahara (Treasurer) yang memiliki kewenangan menyesuaikan atau menghapuskan denda keterlambatan.",
        };
      }

      if (typeof payload.reason !== "string" || !payload.reason.trim()) {
        return { success: false, error: "Alasan penyesuaian/penghapusan denda wajib dicantumkan dalam audit trail." };
      }

      const { loans } = get();
      const loan = loans.find((l) => l.id === payload.loanId);
      if (!loan) {
        return { success: false, error: "Pinjaman tidak ditemukan." };
      }

      const installment = loan.installments.find(
        (i) => i.installmentNumber === payload.installmentNumber
      );
      if (!installment) {
        return { success: false, error: `Angsuran ke-${payload.installmentNumber} tidak ditemukan.` };
      }

      if (!payload.waiveFee) {
        if (
          payload.newLateFeeAmount === undefined ||
          typeof payload.newLateFeeAmount !== "number" ||
          !Number.isFinite(payload.newLateFeeAmount) ||
          payload.newLateFeeAmount < 0
        ) {
          return {
            success: false,
            error: "Nominal penyesuaian denda harus berupa angka valid dan tidak boleh bernilai negatif.",
          };
        }

        if (payload.newLateFeeAmount < installment.paidLateFee) {
          return {
            success: false,
            error: `Nominal penyesuaian denda (Rp ${payload.newLateFeeAmount.toLocaleString("id-ID")}) tidak boleh lebih rendah dari nominal denda yang telah dibayar (Rp ${installment.paidLateFee.toLocaleString("id-ID")}).`,
          };
        }
      }

      const nowIso = new Date().toISOString();
      const updatedInstallments = loan.installments.map((inst) => {
        if (inst.installmentNumber !== payload.installmentNumber) return inst;
        const newLateFee = payload.waiveFee
          ? inst.paidLateFee
          : payload.newLateFeeAmount!;
        return {
          ...inst,
          lateFeeAmount: newLateFee,
          lateFeeWaived: payload.waiveFee,
          lateFeeAdjustmentReason: payload.reason.trim(),
        };
      });

      const updatedLoan: Loan = {
        ...loan,
        installments: updatedInstallments,
        history: [
          ...loan.history,
          {
            id: `LOG-ADJ-${loan.id}-${Date.now().toString().slice(-4)}`,
            timestamp: nowIso,
            actorRole: currentUser.role,
            actorName: currentUser.name,
            fromStatus: loan.status,
            toStatus: loan.status,
            action: payload.waiveFee ? "Penghapusan Denda (Waived)" : "Penyesuaian Nominal Denda",
            notes: `Angsuran ke-${payload.installmentNumber}: ${payload.reason.trim()}`,
          },
        ],
      };

      const updatedLoans = loans.map((l) => (l.id === loan.id ? updatedLoan : l));
      set({ loans: updatedLoans });
      saveToStorage({ ...get(), loans: updatedLoans });

      return { success: true };
    },

    executeEarlyRepayment: (loanId, paymentMethod = "Transfer Bank (Simulasi)", notes) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid." };
      }

      const { loans, paymentRecords, processedPayments } = get();
      const loan = loans.find((l) => l.id === loanId);
      if (!loan) {
        return { success: false, error: "Pinjaman tidak ditemukan." };
      }

      if (currentUser.role === "member") {
        if (!currentUser.memberId || currentUser.memberId !== loan.memberDemoId) {
          return {
            success: false,
            error: "Akses ditolak: Anda hanya dapat melakukan pelunasan dipercepat untuk pinjaman Anda sendiri.",
          };
        }
      } else if (!hasPermission(currentUser.role, "installments:record")) {
        return { success: false, error: "Peran Anda tidak memiliki izin mencatat pelunasan pinjaman." };
      }

      if (loan.status === "paid_off") {
        return { success: false, error: "Pinjaman ini sudah berstatus Lunas." };
      }

      const settlement = calculateEarlyRepayment(loan.installments);
      if (settlement.totalEarlySettlementAmount <= 0) {
        return { success: false, error: "Tidak ada sisa kewajiban yang perlu dilunasi." };
      }

      const nowIso = new Date().toISOString();
      const paymentDate = nowIso.slice(0, 10);
      const paymentRecordId = `BYR-2026-${loan.id.slice(8)}-EARLY-${Date.now().toString().slice(-4)}`;

      // Update status setiap angsuran
      // Sesuai Financial Integrity: Hanya bunga berjalan (current running) yang dibayarkan.
      // Bunga masa depan dihapuskan (waived), TIDAK dicatat sebagai paidInterest.
      let firstUnpaidEncountered = false;
      const updatedInstallments = loan.installments.map((inst) => {
        if (inst.status === "paid") return inst;

        if (!firstUnpaidEncountered) {
          firstUnpaidEncountered = true;
          return {
            ...inst,
            paidPrincipal: inst.principalAmount,
            paidInterest: inst.interestAmount,
            paidLateFee: inst.lateFeeWaived ? inst.paidLateFee : inst.lateFeeAmount,
            status: "paid" as const,
            paidAt: nowIso,
            paymentMethod,
            referenceNumber: `REF-${paymentRecordId}`,
          };
        } else {
          const waivedInterest = Math.max(0, inst.interestAmount - inst.paidInterest);
          return {
            ...inst,
            paidPrincipal: inst.principalAmount,
            paidInterest: inst.paidInterest, // Tidak ditambah bunga masa depan
            interestWaived: true,
            waivedInterestAmount: waivedInterest,
            paidLateFee: inst.lateFeeWaived ? inst.paidLateFee : inst.lateFeeAmount,
            status: "paid" as const,
            paidAt: nowIso,
            paymentMethod,
            referenceNumber: `REF-${paymentRecordId}`,
          };
        }
      });

      const totalPaidPrincipal = loan.principalAmount;
      const totalPaidInterest = updatedInstallments.reduce((sum, i) => sum + i.paidInterest, 0);
      const totalPaidLateFee = updatedInstallments.reduce((sum, i) => sum + i.paidLateFee, 0);

      const updatedLoan: Loan = {
        ...loan,
        installments: updatedInstallments,
        totalPaidPrincipal,
        totalPaidInterest,
        totalPaidLateFee,
        remainingPrincipal: 0,
        status: "paid_off",
        collectibility: "Lancar",
        daysPastDue: 0,
        history: [
          ...loan.history,
          {
            id: `LOG-EARLY-${paymentRecordId}`,
            timestamp: nowIso,
            actorRole: currentUser.role,
            actorName: currentUser.name,
            fromStatus: loan.status,
            toStatus: "paid_off",
            action: "Pelunasan Pinjaman Dipercepat (Early Settlement)",
            notes: `Pelunasan penuh dipercepat senilai Rp ${settlement.totalEarlySettlementAmount.toLocaleString("id-ID")} berhasil dibukukan. Bunga masa depan Rp ${settlement.waivedFutureInterestAmount.toLocaleString("id-ID")} dihapuskan. ${notes ? `Catatan: ${notes}` : ""}`,
          },
        ],
      };

      const newPaymentRecord: InstallmentPaymentRecord = {
        id: paymentRecordId,
        loanId: loan.id,
        installmentNumber: 0, // 0 = Pelunasan penuh dipercepat
        memberDemoId: loan.memberDemoId,
        memberNumber: loan.memberNumber,
        memberName: loan.memberName,
        paymentDate,
        amountPaid: settlement.totalEarlySettlementAmount,
        allocatedLateFee: settlement.unpaidLateFeeTotal,
        allocatedInterest: settlement.unpaidInterestCurrent,
        allocatedPrincipal: settlement.unpaidPrincipalTotal,
        paymentMethod,
        referenceNumber: `REF-${paymentRecordId}`,
        notes: `Pelunasan dipercepat (Bunga dihapuskan: Rp ${settlement.waivedFutureInterestAmount.toLocaleString("id-ID")})${notes ? `. ${notes}` : ""}`,
        recordedById: currentUser.id,
        recordedByRole: currentUser.role,
        recordedByName: currentUser.name,
      };

      const updatedLoans = loans.map((l) => (l.id === loan.id ? updatedLoan : l));
      const updatedPaymentRecords = [newPaymentRecord, ...paymentRecords];
      const updatedProcessedPayments = [...processedPayments, paymentRecordId];

      set({
        loans: updatedLoans,
        paymentRecords: updatedPaymentRecords,
        processedPayments: updatedProcessedPayments,
      });

      saveToStorage({
        ...get(),
        loans: updatedLoans,
        paymentRecords: updatedPaymentRecords,
        processedPayments: updatedProcessedPayments,
      });

      return { success: true, paymentRecordId };
    },

    updateSystemConfig: (updates, notes) => {
      const auth = useAuthStore.getState();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Sesi pengguna tidak valid." };
      }

      if (!hasPermission(currentUser.role, "product_config:update")) {
        return { success: false, error: "Peran Anda tidak memiliki kewenangan mengubah konfigurasi kebijakan pinjaman." };
      }

      // Validasi input konfigurasi
      if (updates.gracePeriodDays !== undefined && updates.gracePeriodDays < 0) {
        return { success: false, error: "Masa tenggang (grace period) tidak boleh bernilai negatif." };
      }
      if (updates.lateFeeDailyPct !== undefined && updates.lateFeeDailyPct < 0) {
        return { success: false, error: "Persentase denda harian tidak boleh bernilai negatif." };
      }
      if (updates.approvalThresholdFoMax !== undefined && updates.approvalThresholdFoMax <= 0) {
        return { success: false, error: "Batas threshold persetujuan FO harus bernilai positif." };
      }

      const { systemConfig, configHistory } = get();
      const newConfig: LoanSystemConfig = {
        ...systemConfig,
        ...updates,
      };

      const nowIso = new Date().toISOString();
      const historyEntry: LoanConfigHistoryEntry = {
        id: `CFG-HIST-${Date.now()}`,
        timestamp: nowIso,
        actorRole: currentUser.role,
        actorName: currentUser.name,
        previousConfig: systemConfig,
        updatedConfig: updates,
        notes: notes?.trim() || "Pembaruan parameter kebijakan pinjaman demonstrasi.",
      };

      const updatedHistory = [historyEntry, ...configHistory];
      set({ systemConfig: newConfig, configHistory: updatedHistory });
      saveToStorage({ ...get(), systemConfig: newConfig, configHistory: updatedHistory });

      return { success: true };
    },

    resetToSeed: () => {
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      const reseeded = loadInitialState();
      set(reseeded);
    },

    // --- QUERIES ---
    getLoanById: (id) => get().loans.find((l) => l.id === id),
    getApplicationById: (id) => get().applications.find((a) => a.id === id),
    getMemberLoans: (memberDemoId) =>
      get().loans.filter((l) => l.memberDemoId === memberDemoId),
    getMemberApplications: (memberDemoId) =>
      get().applications.filter((a) => a.memberDemoId === memberDemoId),
    getPendingApplications: () =>
      get().applications.filter(
        (a) => a.status === "submitted" || a.status === "under_review" || a.status === "recommended"
      ),
    getApprovedPendingDisbursement: () =>
      get().applications.filter((a) => a.status === "approved"),
    getActiveLoans: () =>
      get().loans.filter((l) => l.status === "active" || l.status === "defaulted"),
    getPortfolioSummary: () => {
      const { loans, applications } = get();
      const totalLoansCount = loans.length;
      const activeLoansCount = loans.filter((l) => l.status === "active").length;
      const paidOffLoansCount = loans.filter((l) => l.status === "paid_off").length;
      const defaultedLoansCount = loans.filter((l) => l.status === "defaulted").length;
      const pendingApplicationsCount = applications.filter(
        (a) => a.status === "submitted" || a.status === "under_review" || a.status === "recommended"
      ).length;

      let totalDisbursedPrincipal = 0;
      let totalOutstandingPrincipal = 0;
      let totalRepaidPrincipal = 0;
      let totalRepaidInterest = 0;
      let totalRepaidLateFee = 0;

      const breakdown = {
        lancarCount: 0,
        lancarAmount: 0,
        dpkCount: 0,
        dpkAmount: 0,
        kurangLancarCount: 0,
        kurangLancarAmount: 0,
        diragukanCount: 0,
        diragukanAmount: 0,
        macetCount: 0,
        macetAmount: 0,
      };

      for (const l of loans) {
        totalDisbursedPrincipal += l.principalAmount;
        totalOutstandingPrincipal += l.remainingPrincipal;
        totalRepaidPrincipal += l.totalPaidPrincipal;
        totalRepaidInterest += l.totalPaidInterest;
        totalRepaidLateFee += l.totalPaidLateFee;

        if (l.status !== "paid_off") {
          switch (l.collectibility) {
            case "Lancar":
              breakdown.lancarCount++;
              breakdown.lancarAmount += l.remainingPrincipal;
              break;
            case "DPK":
              breakdown.dpkCount++;
              breakdown.dpkAmount += l.remainingPrincipal;
              break;
            case "Kurang Lancar":
              breakdown.kurangLancarCount++;
              breakdown.kurangLancarAmount += l.remainingPrincipal;
              break;
            case "Diragukan":
              breakdown.diragukanCount++;
              breakdown.diragukanAmount += l.remainingPrincipal;
              break;
            case "Macet":
              breakdown.macetCount++;
              breakdown.macetAmount += l.remainingPrincipal;
              break;
          }
        }
      }

      const nplAmount =
        breakdown.kurangLancarAmount + breakdown.diragukanAmount + breakdown.macetAmount;
      const nplPercentage =
        totalOutstandingPrincipal > 0
          ? Math.round((nplAmount / totalOutstandingPrincipal) * 1000) / 10
          : 0;

      return {
        totalLoansCount,
        activeLoansCount,
        paidOffLoansCount,
        defaultedLoansCount,
        pendingApplicationsCount,
        totalDisbursedPrincipal,
        totalOutstandingPrincipal,
        totalRepaidPrincipal,
        totalRepaidInterest,
        totalRepaidLateFee,
        collectibilityBreakdown: breakdown,
        nplPercentage,
      };
    },
  };
});
