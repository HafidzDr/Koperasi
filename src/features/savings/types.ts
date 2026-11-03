/**
 * Tipe Data Domain Simpanan (Savings Management)
 * Koperasi Konsumen Makmur Bersama Nusantara (KMB)
 *
 * Mengacu pada PRD, Information Architecture Seksi 5.4, dan Business Rules BR-02.
 */

export type SavingsType = "pokok" | "wajib" | "sukarela";
export type SavingsTransactionType = "deposit" | "withdrawal";

export type SavingsTransactionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "cancelled";

export type PaymentMethod =
  | "Transfer Bank (Simulasi)"
  | "Kasir Tunai (Simulasi)"
  | "Debit Virtual (Simulasi)";

export interface SavingsProduct {
  id: string;
  type: SavingsType;
  code: "SP" | "SW" | "SS";
  name: string;
  description: string;
  nominal?: number;
  minDeposit?: number;
  minWithdrawal?: number;
  minBalance?: number;
  interestRatePct?: number;
  withdrawable: boolean;
  status: "active" | "inactive";
  badgeLabel: string;
  notes: string;
}

export interface SavingsTransactionActivityLog {
  id: string;
  timestamp: string;
  actorRole: string;
  actorName: string;
  fromStatus: SavingsTransactionStatus | "new";
  toStatus: SavingsTransactionStatus;
  action: string;
  notes?: string;
}

export interface SavingsTransaction {
  id: string;
  memberDemoId: string;
  memberNumber: string;
  memberName: string;
  savingsType: SavingsType;
  transactionType: SavingsTransactionType;
  amount: number; // Integer Rupiah positif
  date: string; // ISO 8601
  status: SavingsTransactionStatus;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  cancelledById?: string;
  cancelledByRole?: string;
  cancelledByName?: string;
  cancelledAt?: string;
  isReversed?: boolean;
  originalTransactionId?: string;
  createdById: string;
  createdByRole: string;
  createdByName: string;
  reviewedById?: string;
  reviewedByRole?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  approvedById?: string;
  approvedByRole?: string;
  approvedByName?: string;
  approvedAt?: string;
  history: SavingsTransactionActivityLog[];
}

export interface SukarelaConfig {
  minDeposit: number;
  minWithdrawal: number;
  minBalance: number;
  interestRatePct: number;
  status: "active" | "inactive";
  label: string;
  badgeLabel: string;
  disclaimer: string;
}

export interface SukarelaConfigHistoryEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  actorName: string;
  previousConfig: Partial<SukarelaConfig>;
  newConfig: Partial<SukarelaConfig>;
}

export interface SavingsReportSummary {
  totalSimpananPokok: number;
  totalSimpananWajib: number;
  totalSimpananSukarela: number;
  totalSaldoSimpanan: number;
  totalTransaksi: number;
  transaksiByStatus: Record<SavingsTransactionStatus, number>;
  totalSetoranNominal: number;
  totalPenarikanNominal: number;
  rekapPerAnggota: {
    memberDemoId: string;
    memberNumber: string;
    memberName: string;
    saldoPokok: number;
    saldoWajib: number;
    saldoSukarela: number;
    totalSaldo: number;
  }[];
}

