import { create } from "zustand";
import {
  SavingsProduct,
  SavingsTransaction,
  SavingsType,
  SavingsTransactionType,
  SukarelaConfig,
  SukarelaConfigHistoryEntry,
  SavingsReportSummary,
  SavingsTransactionStatus,
  PaymentMethod,
} from "../types";
import {
  DEFAULT_SUKARELA_CONFIG,
  defaultSavingsProducts,
  initialSavingsTransactions,
} from "../mocks/savingsSeedData";
import { useAuthStore } from "@/stores/authStore";
import {
  useMembershipStore,
  setSavingsTransactionResolver,
} from "@/features/membership/stores/membershipStore";
import { canPerformAction } from "@/lib/rbac";

export { DEFAULT_SUKARELA_CONFIG } from "../mocks/savingsSeedData";

const STORAGE_KEY = "kmb_savings_store_v1";

export interface SavingsState {
  products: SavingsProduct[];
  sukarelaConfig: SukarelaConfig;
  configHistory: SukarelaConfigHistoryEntry[];
  transactions: SavingsTransaction[];

  // --- ACTIONS (Transaction Lifecycle & SoD) ---
  submitDeposit: (payload: {
    memberDemoId: string;
    savingsType: SavingsType;
    amount: number;
    paymentMethod?: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
  }) => { success: boolean; transactionId?: string; error?: string };

  submitWithdrawal: (payload: {
    memberDemoId: string;
    amount: number;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }) => { success: boolean; transactionId?: string; error?: string };

  recordStaffTransaction: (payload: {
    memberDemoId: string;
    savingsType: SavingsType;
    transactionType: SavingsTransactionType;
    amount: number;
    paymentMethod?: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
  }) => { success: boolean; transactionId?: string; error?: string };

  reviewTransaction: (
    transactionId: string,
    notes?: string
  ) => { success: boolean; error?: string };

  approveTransaction: (
    transactionId: string,
    notes?: string
  ) => { success: boolean; error?: string };

  rejectTransaction: (
    transactionId: string,
    reason: string
  ) => { success: boolean; error?: string };

  cancelTransaction: (
    transactionId: string,
    reason: string
  ) => { success: boolean; error?: string };

  updateSukarelaConfig: (
    config: Partial<SukarelaConfig>
  ) => { success: boolean; error?: string };

  // --- QUERIES ---
  getTransactionById: (id: string) => SavingsTransaction | undefined;
  getMemberTransactions: (memberDemoId: string) => SavingsTransaction[];
  getMemberSavingsAccount: (memberDemoId: string) => {
    memberDemoId: string;
    memberNumber: string;
    memberName: string;
    saldoPokok: number;
    saldoWajib: number;
    saldoSukarela: number;
    totalSaldo: number;
    availableSukarelaWithdrawal: number;
  } | null;
  getPendingTransactions: () => SavingsTransaction[];
  getSavingsReportSummary: () => SavingsReportSummary;

  // Reset to seed
  resetToSeed: () => void;
}

export function validateSukarelaConfigUpdate(
  current: SukarelaConfig,
  updates: unknown
): { isValid: boolean; error?: string; validatedConfig?: SukarelaConfig } {
  if (typeof updates !== "object" || updates === null) {
    return { isValid: false, error: "Data pembaruan konfigurasi tidak valid." };
  }

  const u = updates as Record<string, unknown>;
  const result: SukarelaConfig = { ...current };

  // 1. Validate minDeposit if present
  if ("minDeposit" in u) {
    const raw = u.minDeposit;
    if (raw === null || raw === undefined || raw === "" || typeof raw === "boolean") {
      return { isValid: false, error: "Setoran minimum wajib diisi dan berupa angka bulat." };
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || isNaN(num)) {
      return { isValid: false, error: "Setoran minimum harus berupa angka valid (bukan NaN atau Infinity)." };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, error: "Setoran minimum harus berupa bilangan bulat Rupiah (tidak boleh pecahan/desimal)." };
    }
    if (num <= 0) {
      return { isValid: false, error: "Setoran minimum harus berupa nominal positif lebih dari 0." };
    }
    if (num > 1_000_000_000) {
      return { isValid: false, error: "Setoran minimum tidak boleh melebihi batas rasional Rp 1.000.000.000." };
    }
    result.minDeposit = num;
  }

  // 2. Validate minWithdrawal if present
  if ("minWithdrawal" in u) {
    const raw = u.minWithdrawal;
    if (raw === null || raw === undefined || raw === "" || typeof raw === "boolean") {
      return { isValid: false, error: "Penarikan minimum wajib diisi dan berupa angka bulat." };
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || isNaN(num)) {
      return { isValid: false, error: "Penarikan minimum harus berupa angka valid (bukan NaN atau Infinity)." };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, error: "Penarikan minimum harus berupa bilangan bulat Rupiah (tidak boleh pecahan/desimal)." };
    }
    if (num <= 0) {
      return { isValid: false, error: "Penarikan minimum harus berupa nominal positif lebih dari 0." };
    }
    if (num > 1_000_000_000) {
      return { isValid: false, error: "Penarikan minimum tidak boleh melebihi batas rasional Rp 1.000.000.000." };
    }
    result.minWithdrawal = num;
  }

  // 3. Validate minBalance if present
  if ("minBalance" in u) {
    const raw = u.minBalance;
    if (raw === null || raw === undefined || raw === "" || typeof raw === "boolean") {
      return { isValid: false, error: "Saldo mengendap minimum wajib diisi dan berupa angka bulat." };
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || isNaN(num)) {
      return { isValid: false, error: "Saldo mengendap minimum harus berupa angka valid (bukan NaN atau Infinity)." };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, error: "Saldo mengendap minimum harus berupa bilangan bulat Rupiah (tidak boleh pecahan/desimal)." };
    }
    if (num < 0) {
      return { isValid: false, error: "Saldo mengendap minimum tidak boleh bernilai negatif." };
    }
    if (num > 1_000_000_000) {
      return { isValid: false, error: "Saldo mengendap minimum tidak boleh melebihi batas rasional Rp 1.000.000.000." };
    }
    result.minBalance = num;
  }

  // 4. Validate interestRatePct if present
  if ("interestRatePct" in u) {
    const raw = u.interestRatePct;
    if (raw === null || raw === undefined || raw === "" || typeof raw === "boolean") {
      return { isValid: false, error: "Suku bunga simpanan sukarela wajib diisi." };
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || isNaN(num)) {
      return { isValid: false, error: "Suku bunga simpanan sukarela harus berupa angka valid (bukan NaN atau Infinity)." };
    }
    if (num < 0) {
      return { isValid: false, error: "Suku bunga simpanan sukarela tidak boleh bernilai negatif." };
    }
    if (num > 100) {
      return { isValid: false, error: "Suku bunga simpanan sukarela tidak boleh melebihi 100% p.a." };
    }
    result.interestRatePct = num;
  }

  // 5. Status / Labels
  if ("status" in u && (u.status === "active" || u.status === "inactive")) {
    result.status = u.status;
  }
  if ("label" in u && typeof u.label === "string" && u.label.trim()) {
    result.label = u.label.trim();
  }
  if ("badgeLabel" in u && typeof u.badgeLabel === "string" && u.badgeLabel.trim()) {
    result.badgeLabel = u.badgeLabel.trim();
  }
  if ("disclaimer" in u && typeof u.disclaimer === "string" && u.disclaimer.trim()) {
    result.disclaimer = u.disclaimer.trim();
  }

  return { isValid: true, validatedConfig: result };
}

export function validateSukarelaConfig(raw: unknown): SukarelaConfig {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "minDeposit" in raw &&
    "minWithdrawal" in raw &&
    "interestRatePct" in raw
  ) {
    const c = raw as Record<string, unknown>;
    const minDep = Number(c.minDeposit);
    const minWdl = Number(c.minWithdrawal);
    const minBal = Number(c.minBalance);
    const interest = Number(c.interestRatePct);

    if (
      Number.isInteger(minDep) &&
      minDep > 0 &&
      Number.isInteger(minWdl) &&
      minWdl > 0 &&
      Number.isInteger(minBal) &&
      minBal >= 0 &&
      Number.isFinite(interest) &&
      interest >= 0 &&
      interest <= 100
    ) {
      return {
        minDeposit: minDep,
        minWithdrawal: minWdl,
        minBalance: minBal,
        interestRatePct: interest,
        status: c.status === "inactive" ? "inactive" : "active",
        label: typeof c.label === "string" ? c.label : DEFAULT_SUKARELA_CONFIG.label,
        badgeLabel:
          typeof c.badgeLabel === "string" ? c.badgeLabel : DEFAULT_SUKARELA_CONFIG.badgeLabel,
        disclaimer:
          typeof c.disclaimer === "string" ? c.disclaimer : DEFAULT_SUKARELA_CONFIG.disclaimer,
      };
    }
  }
  return DEFAULT_SUKARELA_CONFIG;
}

function getInitialState(): {
  products: SavingsProduct[];
  sukarelaConfig: SukarelaConfig;
  configHistory: SukarelaConfigHistoryEntry[];
  transactions: SavingsTransaction[];
} {
  if (typeof window === "undefined") {
    return {
      products: defaultSavingsProducts,
      sukarelaConfig: DEFAULT_SUKARELA_CONFIG,
      configHistory: [],
      transactions: initialSavingsTransactions,
    };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const sukarelaConfig = validateSukarelaConfig(parsed.sukarelaConfig);
      const configHistory = Array.isArray(parsed.configHistory) ? parsed.configHistory : [];
      const transactions = Array.isArray(parsed.transactions)
        ? parsed.transactions
        : initialSavingsTransactions;
      const products = Array.isArray(parsed.products)
        ? parsed.products
        : defaultSavingsProducts;

      return { products, sukarelaConfig, configHistory, transactions };
    }
  } catch {
    // fallback safe
  }
  return {
    products: defaultSavingsProducts,
    sukarelaConfig: DEFAULT_SUKARELA_CONFIG,
    configHistory: [],
    transactions: initialSavingsTransactions,
  };
}

function saveToStorage(
  products: SavingsProduct[],
  sukarelaConfig: SukarelaConfig,
  transactions: SavingsTransaction[],
  configHistory: SukarelaConfigHistoryEntry[] = []
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ products, sukarelaConfig, transactions, configHistory })
    );
  } catch {
    // ignore
  }
}

export function generateSavingsTransactionId(existing: { id?: string }[] = []): string {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `SAV-TRX-${currentYear}-`;
  let maxSeq = 0;

  for (const item of existing) {
    if (item.id && item.id.startsWith(yearPrefix)) {
      const seqStr = item.id.replace(yearPrefix, "");
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `${yearPrefix}${String(nextSeq).padStart(4, "0")}`;
}

export const useSavingsStore = create<SavingsState>((set, get) => {
  const initial = getInitialState();

  return {
    products: initial.products,
    sukarelaConfig: initial.sukarelaConfig,
    configHistory: initial.configHistory,
    transactions: initial.transactions,

    // ------------------------------------------------------------------------
    // 1. SUBMIT DEPOSIT (Public / Member / Staff)
    // ------------------------------------------------------------------------
    submitDeposit: (payload) => {
      const authUser = useAuthStore.getState().currentUser;
      const normalizedDemoId = payload.memberDemoId.trim();

      // Privacy Boundary: If role is member, must match own memberId
      if (authUser.role === "member") {
        if (!authUser.memberId || authUser.memberId.toLowerCase() !== normalizedDemoId.toLowerCase()) {
          return {
            success: false,
            error: "Pelanggaran Batas Akses: Anda hanya dapat mengajukan setoran untuk rekening Anda sendiri.",
          };
        }
      }

      // Member registry check
      const member = useMembershipStore.getState().getMemberByDemoId(normalizedDemoId);
      if (!member) {
        return {
          success: false,
          error: `Anggota dengan ID "${normalizedDemoId}" tidak ditemukan dalam buku induk keanggotaan.`,
        };
      }

      // Amount validation
      const amt = Math.floor(payload.amount);
      if (isNaN(amt) || !isFinite(amt) || amt <= 0) {
        return {
          success: false,
          error: "Nominal setoran harus berupa angka positif yang sah.",
        };
      }

      // Minimum checks based on product
      const sukarelaConfig = get().sukarelaConfig;
      if (payload.savingsType === "sukarela" && amt < sukarelaConfig.minDeposit) {
        return {
          success: false,
          error: `Setoran Simpanan Sukarela minimum sebesar Rp ${sukarelaConfig.minDeposit.toLocaleString("id-ID")}.`,
        };
      }

      const timestamp = new Date().toISOString();
      const transactionId = generateSavingsTransactionId(get().transactions);

      const logEntry = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: authUser.role,
        actorName: authUser.name,
        fromStatus: "new" as const,
        toStatus: "submitted" as const,
        action: `Pengajuan Setoran Simpanan ${payload.savingsType.toUpperCase()}`,
        notes: payload.notes || "Pengajuan setoran simpanan diajukan via portal.",
      };

      const newTrx: SavingsTransaction = {
        id: transactionId,
        memberDemoId: member.demoId,
        memberNumber: member.memberNumber,
        memberName: member.fullName,
        savingsType: payload.savingsType,
        transactionType: "deposit",
        amount: amt,
        date: timestamp,
        status: "submitted",
        paymentMethod: payload.paymentMethod || "Transfer Bank (Simulasi)",
        referenceNumber: payload.referenceNumber || `REF-${Date.now()}`,
        notes: payload.notes,
        createdById: authUser.id,
        createdByRole: authUser.role,
        createdByName: authUser.name,
        history: [logEntry],
      };

      const updated = [newTrx, ...get().transactions];
      set({ transactions: updated });
      saveToStorage(get().products, get().sukarelaConfig, updated, get().configHistory);

      return { success: true, transactionId };
    },

    // ------------------------------------------------------------------------
    // 2. SUBMIT WITHDRAWAL (Member / Staff)
    // ------------------------------------------------------------------------
    submitWithdrawal: (payload) => {
      const authUser = useAuthStore.getState().currentUser;
      const normalizedDemoId = payload.memberDemoId.trim();

      // Privacy Boundary: If role is member, must match own memberId
      if (authUser.role === "member") {
        if (!authUser.memberId || authUser.memberId.toLowerCase() !== normalizedDemoId.toLowerCase()) {
          return {
            success: false,
            error: "Pelanggaran Batas Akses: Anda hanya dapat mengajukan penarikan dari rekening Anda sendiri.",
          };
        }
      }

      // Member registry check
      const member = useMembershipStore.getState().getMemberByDemoId(normalizedDemoId);
      if (!member) {
        return {
          success: false,
          error: `Anggota dengan ID "${normalizedDemoId}" tidak ditemukan dalam buku induk keanggotaan.`,
        };
      }

      // Withdrawal is strictly limited to SUKARELA
      const amt = Math.floor(payload.amount);
      if (isNaN(amt) || !isFinite(amt) || amt <= 0) {
        return {
          success: false,
          error: "Nominal penarikan harus berupa angka positif yang sah.",
        };
      }

      const sukarelaConfig = get().sukarelaConfig;
      if (amt < sukarelaConfig.minWithdrawal) {
        return {
          success: false,
          error: `Penarikan Simpanan Sukarela minimum sebesar Rp ${sukarelaConfig.minWithdrawal.toLocaleString("id-ID")}.`,
        };
      }

      // Check available Sukarela balance
      const currentSukarela = member.saldoSukarela || 0;
      const minRequiredRemaining = sukarelaConfig.minBalance;
      const availableToWithdraw = Math.max(0, currentSukarela - minRequiredRemaining);

      if (amt > availableToWithdraw) {
        return {
          success: false,
          error: `Saldo tidak mencukupi. Saldo sukarela aktif: Rp ${currentSukarela.toLocaleString("id-ID")}, saldo minimum mengendap: Rp ${minRequiredRemaining.toLocaleString("id-ID")}. Maksimum penarikan: Rp ${availableToWithdraw.toLocaleString("id-ID")}.`,
        };
      }

      const timestamp = new Date().toISOString();
      const transactionId = generateSavingsTransactionId(get().transactions);

      const logEntry = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: authUser.role,
        actorName: authUser.name,
        fromStatus: "new" as const,
        toStatus: "submitted" as const,
        action: "Pengajuan Penarikan Simpanan Sukarela",
        notes: payload.notes || "Pengajuan penarikan dana sukarela diajukan.",
      };

      const newTrx: SavingsTransaction = {
        id: transactionId,
        memberDemoId: member.demoId,
        memberNumber: member.memberNumber,
        memberName: member.fullName,
        savingsType: "sukarela",
        transactionType: "withdrawal",
        amount: amt,
        date: timestamp,
        status: "submitted",
        paymentMethod: payload.paymentMethod || "Transfer Bank (Simulasi)",
        notes: payload.notes,
        createdById: authUser.id,
        createdByRole: authUser.role,
        createdByName: authUser.name,
        history: [logEntry],
      };

      const updated = [newTrx, ...get().transactions];
      set({ transactions: updated });
      saveToStorage(get().products, get().sukarelaConfig, updated, get().configHistory);

      return { success: true, transactionId };
    },

    // ------------------------------------------------------------------------
    // 3. RECORD STAFF OVER-THE-COUNTER TRANSACTION
    // ------------------------------------------------------------------------
    recordStaffTransaction: (payload) => {
      const authUser = useAuthStore.getState().currentUser;

      // Authority Check
      if (!canPerformAction(authUser.role, "savings", "record")) {
        return {
          success: false,
          error: `Peran "${authUser.roleName}" tidak memiliki hak akses mencatat transaksi simpanan (savings:record).`,
        };
      }

      // Check member
      const member = useMembershipStore.getState().getMemberByDemoId(payload.memberDemoId);
      if (!member) {
        return {
          success: false,
          error: "Data anggota tidak ditemukan dalam buku induk.",
        };
      }

      const amt = Math.floor(payload.amount);
      if (isNaN(amt) || !isFinite(amt) || amt <= 0) {
        return {
          success: false,
          error: "Nominal transaksi harus berupa angka positif.",
        };
      }

      // If withdrawal, enforce sukarela only & balance check
      if (payload.transactionType === "withdrawal") {
        if (payload.savingsType !== "sukarela") {
          return {
            success: false,
            error: "Aturan Koperasi: Simpanan Pokok dan Simpanan Wajib tidak dapat ditarik selama masa keanggotaan aktif.",
          };
        }
        const sukarelaConfig = get().sukarelaConfig;
        const available = Math.max(0, (member.saldoSukarela || 0) - sukarelaConfig.minBalance);
        if (amt > available) {
          return {
            success: false,
            error: `Saldo sukarela tidak mencukupi untuk penarikan ini (Maksimum: Rp ${available.toLocaleString("id-ID")}).`,
          };
        }
      }

      const timestamp = new Date().toISOString();
      const transactionId = generateSavingsTransactionId(get().transactions);

      const logEntry = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: authUser.role,
        actorName: authUser.name,
        fromStatus: "new" as const,
        toStatus: "submitted" as const,
        action: `Pencatatan Operasional ${payload.transactionType === "deposit" ? "Setoran" : "Penarikan"} ${payload.savingsType.toUpperCase()}`,
        notes: payload.notes || "Pencatatan transaksi loket/teller oleh staf operasional.",
      };

      const newTrx: SavingsTransaction = {
        id: transactionId,
        memberDemoId: member.demoId,
        memberNumber: member.memberNumber,
        memberName: member.fullName,
        savingsType: payload.savingsType,
        transactionType: payload.transactionType,
        amount: amt,
        date: timestamp,
        status: "submitted",
        paymentMethod: payload.paymentMethod || "Kasir Tunai (Simulasi)",
        referenceNumber: payload.referenceNumber || `KSR-${Date.now()}`,
        notes: payload.notes,
        createdById: authUser.id,
        createdByRole: authUser.role,
        createdByName: authUser.name,
        history: [logEntry],
      };

      const updated = [newTrx, ...get().transactions];
      set({ transactions: updated });
      saveToStorage(get().products, get().sukarelaConfig, updated, get().configHistory);

      return { success: true, transactionId };
    },

    // ------------------------------------------------------------------------
    // 4. REVIEW / VERIFY TRANSACTION (Staff / FO)
    // ------------------------------------------------------------------------
    reviewTransaction: (transactionId, notes) => {
      const authUser = useAuthStore.getState().currentUser;

      if (!canPerformAction(authUser.role, "savings", "verify")) {
        return {
          success: false,
          error: `Peran "${authUser.roleName}" tidak memiliki izin verifikasi berkas simpanan (savings:verify).`,
        };
      }

      const trx = get().transactions.find((t) => t.id === transactionId);
      if (!trx) {
        return { success: false, error: "Transaksi simpanan tidak ditemukan." };
      }

      if (trx.status !== "submitted") {
        return {
          success: false,
          error: `Transaksi berstatus "${trx.status}" tidak dapat diverifikasi ulang. Hanya transaksi berstatus 'submitted' yang dapat diverifikasi.`,
        };
      }

      // SoD on verification: Creator cannot verify their own transaction
      if (trx.createdById === authUser.id) {
        return {
          success: false,
          error: `Prinsip Pemisahan Tugas (SoD): Anda tercatat sebagai pembuat transaksi ini (${trx.createdByName}) dan tidak berwenang memverifikasinya sendiri.`,
        };
      }

      const timestamp = new Date().toISOString();
      const logEntry = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: authUser.role,
        actorName: authUser.name,
        fromStatus: trx.status,
        toStatus: "under_review" as const,
        action: "Verifikasi Berkas Transaksi",
        notes: notes || "Bukti transaksi telah diperiksa dan direkomendasikan.",
      };

      const updatedTrx: SavingsTransaction = {
        ...trx,
        status: "under_review",
        reviewedById: authUser.id,
        reviewedByRole: authUser.role,
        reviewedByName: authUser.name,
        reviewedAt: timestamp,
        history: [...trx.history, logEntry],
      };

      const updated = get().transactions.map((t) => (t.id === transactionId ? updatedTrx : t));
      set({ transactions: updated });
      saveToStorage(get().products, get().sukarelaConfig, updated, get().configHistory);

      return { success: true };
    },

    // ------------------------------------------------------------------------
    // 5. APPROVE TRANSACTION (Finance Officer / Treasurer / Manager with SoD)
    // ------------------------------------------------------------------------
    approveTransaction: (transactionId, notes) => {
      const authUser = useAuthStore.getState().currentUser;

      // Authority Check
      if (!canPerformAction(authUser.role, "savings", "approve")) {
        return {
          success: false,
          error: `Peran "${authUser.roleName}" tidak memiliki kewenangan menyetujui transaksi simpanan (savings:approve).`,
        };
      }

      const trx = get().transactions.find((t) => t.id === transactionId);
      if (!trx) {
        return { success: false, error: "Transaksi simpanan tidak ditemukan." };
      }

      // MANDATORY VERIFICATION: submitted transactions MUST be verified first
      if (trx.status === "submitted") {
        return {
          success: false,
          error: "Persetujuan ditolak: Transaksi berstatus 'submitted' wajib diverifikasi terlebih dahulu oleh petugas pemeriksa (status harus under_review) sebelum dapat disetujui.",
        };
      }

      if (trx.status !== "under_review") {
        return {
          success: false,
          error: `Transaksi berstatus "${trx.status}" tidak dapat disetujui.`,
        };
      }

      // SEPARATION OF DUTIES (SoD): Creator cannot approve their own transaction
      if (trx.createdById === authUser.id) {
        return {
          success: false,
          error: `Prinsip Pemisahan Tugas (Separation of Duties): Anda tercatat sebagai pembuat transaksi ini (${trx.createdByName}) dan dilarang menyetujui transaksi Anda sendiri. Persetujuan harus dilakukan oleh pejabat berwenang lainnya.`,
        };
      }

      // Additional check for withdrawal: ensure member still has balance
      const member = useMembershipStore.getState().getMemberByDemoId(trx.memberDemoId);
      if (!member) {
        return {
          success: false,
          error: "Anggota pemilik rekening tidak ditemukan dalam direktori.",
        };
      }

      if (trx.transactionType === "withdrawal") {
        const sukarelaConfig = get().sukarelaConfig;
        const available = (member.saldoSukarela || 0) - sukarelaConfig.minBalance;
        if (trx.amount > available) {
          return {
            success: false,
            error: `Gagal menyetujui penarikan: Saldo simpanan sukarela anggota saat ini tidak mencukupi (Tersedia: Rp ${available.toLocaleString("id-ID")}).`,
          };
        }
      }

      // MUTATE BALANCE AT APPROVAL TIME (Atomically synchronized)
      const isDeposit = trx.transactionType === "deposit";
      const deltaAmount = isDeposit ? trx.amount : -trx.amount;
      const delta = trx.savingsType === "pokok"
        ? { pokok: deltaAmount }
        : trx.savingsType === "wajib"
        ? { wajib: deltaAmount }
        : { sukarela: deltaAmount };

      const adjustRes = useMembershipStore.getState().adjustMemberBalances(
        trx.memberDemoId,
        delta,
        { transactionId: trx.id, isReversal: false }
      );
      if (!adjustRes.success) {
        return {
          success: false,
          error: adjustRes.error || "Gagal memutasi saldo simpanan anggota.",
        };
      }

      const timestamp = new Date().toISOString();
      const logEntry = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: authUser.role,
        actorName: authUser.name,
        fromStatus: trx.status,
        toStatus: "approved" as const,
        action: `Persetujuan Final ${trx.transactionType === "deposit" ? "Setoran" : "Penarikan"}`,
        notes: notes || "Transaksi simpanan telah disetujui dan saldo anggota diperbarui.",
      };

      const updatedTrx: SavingsTransaction = {
        ...trx,
        status: "approved",
        approvedById: authUser.id,
        approvedByRole: authUser.role,
        approvedByName: authUser.name,
        approvedAt: timestamp,
        history: [...trx.history, logEntry],
      };

      const updated = get().transactions.map((t) => (t.id === transactionId ? updatedTrx : t));
      set({ transactions: updated });
      saveToStorage(get().products, get().sukarelaConfig, updated, get().configHistory);

      return { success: true };
    },

    // ------------------------------------------------------------------------
    // 6. REJECT TRANSACTION (Finance Officer / Treasurer / Manager)
    // ------------------------------------------------------------------------
    rejectTransaction: (transactionId, reason) => {
      const authUser = useAuthStore.getState().currentUser;

      if (!canPerformAction(authUser.role, "savings", "approve") && !canPerformAction(authUser.role, "savings", "reject")) {
        return {
          success: false,
          error: `Peran "${authUser.roleName}" tidak berwenang menolak transaksi simpanan.`,
        };
      }

      const trimmedReason = reason?.trim();
      if (!trimmedReason) {
        return {
          success: false,
          error: "Alasan penolakan transaksi wajib diisi untuk kepatuhan audit.",
        };
      }

      const trx = get().transactions.find((t) => t.id === transactionId);
      if (!trx) {
        return { success: false, error: "Transaksi simpanan tidak ditemukan." };
      }

      // MANDATORY VERIFICATION: submitted transactions MUST be verified first before rejection
      if (trx.status === "submitted") {
        return {
          success: false,
          error: "Penolakan ditolak: Transaksi berstatus 'submitted' wajib melalui pemeriksaan berkas terlebih dahulu (status harus under_review) sebelum dapat diputuskan.",
        };
      }

      if (trx.status !== "under_review") {
        return {
          success: false,
          error: `Transaksi berstatus "${trx.status}" tidak dapat ditolak.`,
        };
      }

      // SoD on rejection
      if (trx.createdById === authUser.id) {
        return {
          success: false,
          error: `Prinsip Pemisahan Tugas (SoD): Anda tercatat sebagai pembuat transaksi ini (${trx.createdByName}) dan dilarang memutuskan penolakannya sendiri.`,
        };
      }

      const timestamp = new Date().toISOString();
      const logEntry = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: authUser.role,
        actorName: authUser.name,
        fromStatus: trx.status,
        toStatus: "rejected" as const,
        action: "Penolakan Transaksi Simpanan",
        notes: trimmedReason,
      };

      const updatedTrx: SavingsTransaction = {
        ...trx,
        status: "rejected",
        rejectionReason: trimmedReason,
        history: [...trx.history, logEntry],
      };

      // DOES NOT MUTATE BALANCE
      const updated = get().transactions.map((t) => (t.id === transactionId ? updatedTrx : t));
      set({ transactions: updated });
      saveToStorage(get().products, get().sukarelaConfig, updated, get().configHistory);

      return { success: true };
    },

    // ------------------------------------------------------------------------
    // 7. CANCEL / CORRECTION FLOW (Demonstration Reversal with Full Audit Log)
    // ------------------------------------------------------------------------
    cancelTransaction: (transactionId, reason) => {
      const authUser = useAuthStore.getState().currentUser;
      const trimmedReason = reason?.trim();
      if (!trimmedReason) {
        return {
          success: false,
          error: "Alasan pembatalan/koreksi transaksi wajib disertakan.",
        };
      }

      const trx = get().transactions.find((t) => t.id === transactionId);
      if (!trx) {
        return { success: false, error: "Transaksi simpanan tidak ditemukan." };
      }

      if (trx.status === "rejected" || trx.status === "cancelled") {
        return {
          success: false,
          error: `Transaksi sudah berstatus "${trx.status}" dan tidak dapat dibatalkan ulang.`,
        };
      }

      // CASE A: SUBMITTED TRANSACTIONS
      if (trx.status === "submitted") {
        if (authUser.role === "member") {
          const isOwner = (authUser.memberId && authUser.memberId.toLowerCase() === trx.memberDemoId.toLowerCase()) || authUser.id === trx.createdById;
          if (!isOwner) {
            return {
              success: false,
              error: "Otorisasi Ditolak: Anda tidak memiliki hak membatalkan transaksi pengajuan anggota lain.",
            };
          }
        } else {
          if (!canPerformAction(authUser.role, "savings", "adjust")) {
            return {
              success: false,
              error: `Peran "${authUser.roleName}" tidak memiliki izin pembatalan administratif simpanan (savings:adjust).`,
            };
          }
        }
      }

      // CASE B: UNDER_REVIEW TRANSACTIONS
      else if (trx.status === "under_review") {
        if (authUser.role === "member") {
          return {
            success: false,
            error: "Pengajuan simpanan yang sudah masuk tahap verifikasi (under_review) tidak dapat dibatalkan mandiri oleh anggota. Silakan hubungi staf/pengurus koperasi.",
          };
        }
        if (!canPerformAction(authUser.role, "savings", "adjust")) {
          return {
            success: false,
            error: `Peran "${authUser.roleName}" tidak memiliki izin pembatalan administratif simpanan (savings:adjust).`,
          };
        }
      }

      // CASE C: APPROVED TRANSACTIONS (REVERSAL WITH LEDGER INTEGRITY)
      else if (trx.status === "approved") {
        if (!canPerformAction(authUser.role, "savings", "adjust")) {
          return {
            success: false,
            error: `Pembatalan transaksi yang telah disetujui memerlukan hak otorisasi koreksi (savings:adjust). Hanya Bendahara (Treasurer) yang berwenang melakukan koreksi/pembalikan saldo simpanan.`,
          };
        }

        if (trx.isReversed) {
          return {
            success: false,
            error: "Pembalikan gagal: Transaksi ini sudah pernah dibalikkan sebelumnya.",
          };
        }

        // Reversal of previously applied balance
        const isDeposit = trx.transactionType === "deposit";
        const reverseDelta = isDeposit ? -trx.amount : trx.amount;

        const member = useMembershipStore.getState().getMemberByDemoId(trx.memberDemoId);
        if (!member) {
          return {
            success: false,
            error: "Anggota pemilik rekening tidak ditemukan dalam direktori.",
          };
        }

        const currentSaldo = trx.savingsType === "pokok"
          ? (member.saldoPokok || 0)
          : trx.savingsType === "wajib"
          ? (member.saldoWajib || 0)
          : (member.saldoSukarela || 0);

        // Pre-check: balance must NOT be negative after reversal
        if (currentSaldo + reverseDelta < 0) {
          return {
            success: false,
            error: `Pembalikan transaksi ditolak: Saldo simpanan ${trx.savingsType} anggota saat ini (Rp ${currentSaldo.toLocaleString("id-ID")}) tidak mencukupi untuk pembalikan penuh sebesar Rp ${trx.amount.toLocaleString("id-ID")} karena dana simpanan telah berkurang/digunakan. Diperlukan penyelesaian/rekonsiliasi saldo terlebih dahulu.`,
          };
        }

        const delta = trx.savingsType === "pokok"
          ? { pokok: reverseDelta }
          : trx.savingsType === "wajib"
          ? { wajib: reverseDelta }
          : { sukarela: reverseDelta };

        const adjustRes = useMembershipStore.getState().adjustMemberBalances(
          trx.memberDemoId,
          delta,
          { transactionId: trx.id, isReversal: true }
        );
        if (!adjustRes.success) {
          return {
            success: false,
            error: adjustRes.error || "Pembalikan saldo simpanan gagal diproses.",
          };
        }
      }

      const timestamp = new Date().toISOString();
      const logEntry = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: authUser.role,
        actorName: authUser.name,
        fromStatus: trx.status,
        toStatus: "cancelled" as const,
        action: trx.status === "approved" ? "Pembalikan Transaksi (Reversal Approved)" : "Pembatalan Transaksi",
        notes: trimmedReason,
      };

      const updatedTrx: SavingsTransaction = {
        ...trx,
        status: "cancelled",
        isReversed: trx.status === "approved" ? true : undefined,
        cancelledById: authUser.id,
        cancelledByRole: authUser.role,
        cancelledByName: authUser.name,
        cancelledAt: timestamp,
        cancellationReason: trimmedReason,
        history: [...trx.history, logEntry],
      };

      const updated = get().transactions.map((t) => (t.id === transactionId ? updatedTrx : t));
      set({ transactions: updated });
      saveToStorage(get().products, get().sukarelaConfig, updated, get().configHistory);

      return { success: true };
    },

    // ------------------------------------------------------------------------
    // 8. UPDATE SUKARELA CONFIG (Treasurer / Manager)
    // ------------------------------------------------------------------------
    updateSukarelaConfig: (newCfg) => {
      const authUser = useAuthStore.getState().currentUser;
      if (!canPerformAction(authUser.role, "product_config", "update")) {
        return {
          success: false,
          error: "Hanya Bendahara atau Pengurus yang berwenang mengubah konfigurasi produk keuangan.",
        };
      }

      // Strictly validate updates at store level
      const validation = validateSukarelaConfigUpdate(get().sukarelaConfig, newCfg);
      if (!validation.isValid || !validation.validatedConfig) {
        return {
          success: false,
          error: validation.error || "Konfigurasi tidak valid.",
        };
      }

      const historyEntry: SukarelaConfigHistoryEntry = {
        id: `CFG-HIST-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: authUser.id,
        actorRole: authUser.role,
        actorName: authUser.name,
        previousConfig: { ...get().sukarelaConfig },
        newConfig: { ...validation.validatedConfig },
      };

      const updatedConfig = validation.validatedConfig;
      const updatedHistory = [historyEntry, ...get().configHistory];

      set({
        sukarelaConfig: updatedConfig,
        configHistory: updatedHistory,
      });
      saveToStorage(get().products, updatedConfig, get().transactions, updatedHistory);

      return { success: true };
    },

    // ------------------------------------------------------------------------
    // 9. QUERIES
    // ------------------------------------------------------------------------
    getTransactionById: (id) => {
      return get().transactions.find((t) => t.id === id);
    },

    getMemberTransactions: (memberDemoId) => {
      const normalized = memberDemoId.trim().toLowerCase();
      return get().transactions.filter(
        (t) => t.memberDemoId.toLowerCase() === normalized
      );
    },

    getMemberSavingsAccount: (memberDemoId) => {
      const normalized = memberDemoId.trim().toLowerCase();
      const member = useMembershipStore.getState().getMemberByDemoId(normalized);
      if (!member) return null;

      const sukarelaConfig = get().sukarelaConfig;
      const saldoPokok = member.saldoPokok || 0;
      const saldoWajib = member.saldoWajib || 0;
      const saldoSukarela = member.saldoSukarela || 0;
      const totalSaldo = saldoPokok + saldoWajib + saldoSukarela;
      const availableSukarelaWithdrawal = Math.max(
        0,
        saldoSukarela - sukarelaConfig.minBalance
      );

      return {
        memberDemoId: member.demoId,
        memberNumber: member.memberNumber,
        memberName: member.fullName,
        saldoPokok,
        saldoWajib,
        saldoSukarela,
        totalSaldo,
        availableSukarelaWithdrawal,
      };
    },

    getPendingTransactions: () => {
      return get().transactions.filter(
        (t) => t.status === "submitted" || t.status === "under_review"
      );
    },

    getSavingsReportSummary: () => {
      const members = useMembershipStore.getState().members;
      const transactions = get().transactions;

      let totalSimpananPokok = 0;
      let totalSimpananWajib = 0;
      let totalSimpananSukarela = 0;

      const rekapPerAnggota = members.map((m) => {
        const pokok = m.saldoPokok || 0;
        const wajib = m.saldoWajib || 0;
        const sukarela = m.saldoSukarela || 0;
        const total = pokok + wajib + sukarela;

        totalSimpananPokok += pokok;
        totalSimpananWajib += wajib;
        totalSimpananSukarela += sukarela;

        return {
          memberDemoId: m.demoId,
          memberNumber: m.memberNumber,
          memberName: m.fullName,
          saldoPokok: pokok,
          saldoWajib: wajib,
          saldoSukarela: sukarela,
          totalSaldo: total,
        };
      });

      const totalSaldoSimpanan = totalSimpananPokok + totalSimpananWajib + totalSimpananSukarela;

      const transaksiByStatus: Record<SavingsTransactionStatus, number> = {
        draft: 0,
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
      };

      let totalSetoranNominal = 0;
      let totalPenarikanNominal = 0;

      for (const t of transactions) {
        transaksiByStatus[t.status] = (transaksiByStatus[t.status] || 0) + 1;
        if (t.status === "approved") {
          if (t.transactionType === "deposit") {
            totalSetoranNominal += t.amount;
          } else if (t.transactionType === "withdrawal") {
            totalPenarikanNominal += t.amount;
          }
        }
      }

      return {
        totalSimpananPokok,
        totalSimpananWajib,
        totalSimpananSukarela,
        totalSaldoSimpanan,
        totalTransaksi: transactions.length,
        transaksiByStatus,
        totalSetoranNominal,
        totalPenarikanNominal,
        rekapPerAnggota,
      };
    },

    // ------------------------------------------------------------------------
    // 10. RESET TO SEED STATE
    // ------------------------------------------------------------------------
    resetToSeed: () => {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      set({
        products: defaultSavingsProducts,
        sukarelaConfig: DEFAULT_SUKARELA_CONFIG,
        configHistory: [],
        transactions: initialSavingsTransactions,
      });
      saveToStorage(
        defaultSavingsProducts,
        DEFAULT_SUKARELA_CONFIG,
        initialSavingsTransactions,
        []
      );
    },
  };
});

// Register transaction resolver to allow membershipStore to validate transaction integrity
// without creating a circular module dependency.
setSavingsTransactionResolver((trxId: string) => {
  return useSavingsStore.getState().transactions.find((t) => t.id === trxId);
});
