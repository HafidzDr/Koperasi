/**
 * Tipe Data Domain Pinjaman dan Angsuran (Loan & Installment Management)
 * Koperasi Konsumen Makmur Bersama Nusantara (KMB)
 *
 * Mengacu pada PRD, Information Architecture Seksi 5.4,
 * Business Rules BR-03 & BR-04, serta DEMO_SIMULATION_SPEC.md Seksi 3.2.
 */

export type LoanProductType = "konsumtif" | "produktif" | "darurat";

export type InterestCalculationMethod = "flat" | "anuitas" | "efektif";

export type LoanApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "recommended"
  | "approved"
  | "rejected"
  | "cancelled";

export type LoanStatus = "active" | "paid_off" | "defaulted";

export type LoanCollectibility =
  | "Lancar"
  | "DPK"
  | "Kurang Lancar"
  | "Diragukan"
  | "Macet";

export type InstallmentStatus =
  | "upcoming"
  | "due"
  | "partially_paid"
  | "paid"
  | "overdue";

export interface LoanProductConfig {
  id: string;
  type: LoanProductType;
  name: string;
  description: string;
  interestRatePct: number; // e.g. 12% p.a.
  calculationMethod: InterestCalculationMethod; // default 'flat'
  minAmount: number;
  maxAmount: number;
  minTenorMonths: number;
  maxTenorMonths: number;
  adminFeePct: number; // e.g. 1%
  isCollateralRequired: boolean;
  status: "active" | "inactive";
  badgeLabel: string;
  notes: string;
  disclaimer: string;
}

export interface LoanSystemConfig {
  gracePeriodDays: number; // default 3 days
  lateFeeDailyPct: number; // default 0.5% per day
  approvalThresholdFoMax: number; // s.d. Rp 10.000.000 (FO can approve)
  approvalThresholdManagerMax: number; // > Rp 10.000.000 s.d. Rp 50.000.000 (Manager)
  maxActiveLoansPerMember: number; // default 2
  minMembershipMonths: number; // default 3
  label: string;
  disclaimer: string;
}

export interface LoanConfigHistoryEntry {
  id: string;
  timestamp: string;
  actorRole: string;
  actorName: string;
  previousConfig: Partial<LoanSystemConfig>;
  updatedConfig: Partial<LoanSystemConfig>;
  notes?: string;
}

export interface LoanActivityLog {
  id: string;
  timestamp: string;
  actorRole: string;
  actorName: string;
  fromStatus: string;
  toStatus: string;
  action: string;
  notes?: string;
}

export interface LoanInstallment {
  installmentNumber: number; // 1 to tenorMonths
  dueDate: string; // ISO 8601 YYYY-MM-DD
  principalAmount: number; // Integer Rupiah
  interestAmount: number; // Integer Rupiah
  totalAmount: number; // principalAmount + interestAmount
  remainingPrincipalAfter: number; // Saldo pokok tersisa setelah angsuran ini
  paidPrincipal: number;
  paidInterest: number;
  paidLateFee: number;
  lateFeeAmount: number;
  lateFeeWaived?: boolean;
  lateFeeAdjustmentReason?: string;
  interestWaived?: boolean;
  waivedInterestAmount?: number;
  daysLate: number;
  status: InstallmentStatus;
  paidAt?: string;
  paymentMethod?: string;
  referenceNumber?: string;
}

export interface LoanApplication {
  id: string; // PJ-2026-XXXX or PJA-2026-XXXX
  memberDemoId: string;
  memberNumber: string;
  memberName: string;
  productType: LoanProductType;
  productName: string;
  amount: number; // Integer Rupiah
  tenorMonths: number;
  interestRatePct: number;
  calculationMethod: InterestCalculationMethod;
  adminFeePct: number;
  adminFeeAmount: number;
  netDisbursementAmount: number; // amount - adminFeeAmount
  purpose: string;
  purposeCategory: string;
  incomeSource: string;
  status: LoanApplicationStatus;
  applicationDate: string; // ISO 8601
  simulatedDocumentUrl: string; // Synthetic placeholder e.g. "SIMULATED DOCUMENT: slip-gaji.pdf"
  notes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  createdById: string;
  createdByRole: string;
  createdByName: string;
  reviewedById?: string;
  reviewedByRole?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  recommendedById?: string;
  recommendedByRole?: string;
  recommendedByName?: string;
  recommendedAt?: string;
  recommendationNotes?: string;
  approvedById?: string;
  approvedByRole?: string;
  approvedByName?: string;
  approvedAt?: string;
  approvalNotes?: string;
  history: LoanActivityLog[];
}

export interface Loan {
  id: string; // PJ-2026-XXXX
  applicationId: string;
  memberDemoId: string;
  memberNumber: string;
  memberName: string;
  productType: LoanProductType;
  productName: string;
  principalAmount: number; // Pokok pinjaman awal
  interestRatePct: number;
  calculationMethod: InterestCalculationMethod;
  tenorMonths: number;
  adminFeeAmount: number;
  netDisbursedAmount: number;
  disbursementDate: string; // ISO 8601 YYYY-MM-DD
  disbursedById: string;
  disbursedByRole: string;
  disbursedByName: string;
  disbursementChannel: string; // "Transfer Rekening Anggota (Simulasi)"
  status: LoanStatus;
  collectibility: LoanCollectibility;
  daysPastDue: number; // Maximum days late across unpaid installments
  remainingPrincipal: number;
  totalPaidPrincipal: number;
  totalPaidInterest: number;
  totalPaidLateFee: number;
  installments: LoanInstallment[];
  history: LoanActivityLog[];
}

export interface InstallmentPaymentRecord {
  id: string; // BYR-2026-XXXX
  loanId: string;
  installmentNumber: number;
  memberDemoId: string;
  memberNumber: string;
  memberName: string;
  paymentDate: string; // ISO 8601
  amountPaid: number;
  allocatedLateFee: number;
  allocatedInterest: number;
  allocatedPrincipal: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  recordedById: string;
  recordedByRole: string;
  recordedByName: string;
  isReversed?: boolean;
  reversedById?: string;
  reversedByRole?: string;
  reversedByName?: string;
  reversedAt?: string;
  reversalReason?: string;
}

export interface LoanPortfolioSummary {
  totalLoansCount: number;
  activeLoansCount: number;
  paidOffLoansCount: number;
  defaultedLoansCount: number;
  pendingApplicationsCount: number;
  totalDisbursedPrincipal: number;
  totalOutstandingPrincipal: number;
  totalRepaidPrincipal: number;
  totalRepaidInterest: number;
  totalRepaidLateFee: number;
  collectibilityBreakdown: {
    lancarCount: number;
    lancarAmount: number;
    dpkCount: number;
    dpkAmount: number;
    kurangLancarCount: number;
    kurangLancarAmount: number;
    diragukanCount: number;
    diragukanAmount: number;
    macetCount: number;
    macetAmount: number;
  };
  nplPercentage: number; // Ratio of (Kurang Lancar + Diragukan + Macet) / total outstanding
}
