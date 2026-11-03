import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useSavingsStore } from "../stores/savingsStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { canPerformAction } from "@/lib/rbac";
import {
  SavingsType,
  SavingsTransactionType,
  SavingsTransactionStatus,
  SavingsTransaction,
  PaymentMethod,
} from "../types";
import { formatIDR, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  PlusCircle,
  Search,
  Users,
  FileSpreadsheet,
  Settings,
  Lock,
} from "lucide-react";

export const AdminSavingsManagementView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { members, savingsConfig } = useMembershipStore();
  const {
    sukarelaConfig,
    configHistory,
    transactions,
    getPendingTransactions,
    getSavingsReportSummary,
    recordStaffTransaction,
    reviewTransaction,
    approveTransaction,
    rejectTransaction,
    cancelTransaction,
    updateSukarelaConfig,
  } = useSavingsStore();

  const [activeTab, setActiveTab] = useState<
    "queue" | "transactions" | "members" | "entry" | "reports" | "config"
  >("queue");

  // Filters for Tab 2 (All Transactions)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [savingsTypeFilter, setSavingsTypeFilter] = useState<string>("all");
  const [trxTypeFilter, setTrxTypeFilter] = useState<string>("all");

  // Filters for Tab 3 (Member Registry)
  const [memberSearch, setMemberSearch] = useState("");

  // Modals
  const [selectedTransaction, setSelectedTransaction] = useState<SavingsTransaction | null>(null);
  const [rejectingTransaction, setRejectingTransaction] = useState<SavingsTransaction | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [cancellingTransaction, setCancellingTransaction] = useState<SavingsTransaction | null>(null);
  const [cancellationReasonInput, setCancellationReasonInput] = useState("");

  // Form State for Tab 4 (Staff Entry)
  const [entryMemberDemoId, setEntryMemberDemoId] = useState("");
  const [entrySavingsType, setEntrySavingsType] = useState<SavingsType>("wajib");
  const [entryTrxType, setEntryTrxType] = useState<SavingsTransactionType>("deposit");
  const [entryAmount, setEntryAmount] = useState<string>("50000");
  const [entryPaymentMethod, setEntryPaymentMethod] = useState<PaymentMethod>("Kasir Tunai (Simulasi)");
  const [entryNotes, setEntryNotes] = useState("");
  const [entryError, setEntryError] = useState<string | null>(null);

  // Form State for Tab 6 (Sukarela Config)
  const [editMinDeposit, setEditMinDeposit] = useState(String(sukarelaConfig.minDeposit));
  const [editMinWithdrawal, setEditMinWithdrawal] = useState(String(sukarelaConfig.minWithdrawal));
  const [editMinBalance, setEditMinBalance] = useState(String(sukarelaConfig.minBalance));
  const [editInterestRate, setEditInterestRate] = useState(String(sukarelaConfig.interestRatePct));
  const [configSuccess, setConfigSuccess] = useState(false);

  // RBAC Permission checks
  const canVerify = canPerformAction(currentUser.role, "savings", "verify");
  const canApprove = canPerformAction(currentUser.role, "savings", "approve");
  const canRecord = canPerformAction(currentUser.role, "savings", "record");
  const canAdjust = canPerformAction(currentUser.role, "savings", "adjust");
  const canUpdateProductConfig = canPerformAction(currentUser.role, "product_config", "update");

  const pendingQueue = getPendingTransactions();
  const reportSummary = getSavingsReportSummary();

  // Handlers for approval/review
  const handleReview = (trxId: string) => {
    const res = reviewTransaction(trxId, `Diverifikasi oleh ${currentUser.name} (${currentUser.roleName})`);
    if (res.success) {
      addToast({
        type: "success",
        title: "Transaksi Diverifikasi",
        message: `Transaksi ${trxId} berstatus Sedang Ditinjau dan diteruskan ke pejabat otorisasi.`,
      });
    } else {
      addToast({
        type: "danger",
        title: "Gagal Verifikasi",
        message: res.error || "Gagal memproses verifikasi.",
      });
    }
  };

  const handleApprove = (trxId: string) => {
    const res = approveTransaction(
      trxId,
      `Disetujui oleh ${currentUser.name} (${currentUser.roleName})`
    );
    if (res.success) {
      addToast({
        type: "success",
        title: "Transaksi Disetujui & Saldo Diperbarui",
        message: `Transaksi ${trxId} telah disetujui. Mutasi saldo telah diterapkan secara otomatis pada buku simpanan anggota.`,
      });
    } else {
      addToast({
        type: "danger",
        title: "Persetujuan Gagal (SoD)",
        message: res.error || "Gagal menyetujui transaksi.",
      });
    }
  };

  const handleOpenRejectModal = (trx: SavingsTransaction) => {
    setRejectingTransaction(trx);
    setRejectionReasonInput("");
  };

  const handleConfirmReject = () => {
    if (!rejectingTransaction) return;
    const res = rejectTransaction(rejectingTransaction.id, rejectionReasonInput);
    if (res.success) {
      addToast({
        type: "info",
        title: "Transaksi Ditolak",
        message: `Transaksi ${rejectingTransaction.id} telah ditolak dengan alasan tercatat.`,
      });
      setRejectingTransaction(null);
    } else {
      addToast({
        type: "danger",
        title: "Gagal Menolak",
        message: res.error || "Gagal menolak transaksi.",
      });
    }
  };

  const handleOpenCancelModal = (trx: SavingsTransaction) => {
    setCancellingTransaction(trx);
    setCancellationReasonInput("");
  };

  const handleConfirmCancel = () => {
    if (!cancellingTransaction) return;
    const res = cancelTransaction(cancellingTransaction.id, cancellationReasonInput);
    if (res.success) {
      addToast({
        type: "success",
        title: "Transaksi Dibatalkan / Dikoreksi",
        message: `Transaksi ${cancellingTransaction.id} berhasil dibatalkan dan mutasi saldo telah dipulihkan secara aman.`,
      });
      setCancellingTransaction(null);
      setSelectedTransaction(null);
    } else {
      addToast({
        type: "danger",
        title: "Gagal Membatalkan",
        message: res.error || "Gagal membatalkan transaksi.",
      });
    }
  };

  const handleStaffEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEntryError(null);

    if (!entryMemberDemoId) {
      setEntryError("Pilih anggota yang bertransaksi.");
      return;
    }

    const amt = Number(entryAmount);
    if (isNaN(amt) || amt <= 0) {
      setEntryError("Nominal transaksi harus berupa angka positif.");
      return;
    }

    const res = recordStaffTransaction({
      memberDemoId: entryMemberDemoId,
      savingsType: entrySavingsType,
      transactionType: entryTrxType,
      amount: amt,
      paymentMethod: entryPaymentMethod,
      notes: entryNotes,
    });

    if (!res.success) {
      setEntryError(res.error || "Gagal mencatat transaksi.");
      return;
    }

    addToast({
      type: "success",
      title: "Transaksi Berhasil Dicatat",
      message: `Pencatatan transaksi simpanan (ID: ${res.transactionId}) berhasil dimasukkan ke antrean verifikasi/persetujuan.`,
    });

    setEntryMemberDemoId("");
    setEntryNotes("");
    setActiveTab("queue");
  };

  const handleSaveSukarelaConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const minDep = Number(editMinDeposit);
    const minWdl = Number(editMinWithdrawal);
    const minBal = Number(editMinBalance);
    const rate = Number(editInterestRate);

    if (isNaN(minDep) || isNaN(minWdl) || isNaN(minBal) || isNaN(rate)) {
      addToast({ type: "danger", title: "Validasi Gagal", message: "Parameter harus berupa angka numerik valid." });
      return;
    }

    const res = updateSukarelaConfig({
      minDeposit: minDep,
      minWithdrawal: minWdl,
      minBalance: minBal,
      interestRatePct: rate,
    });

    if (res.success) {
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
      addToast({
        type: "success",
        title: "Parameter Simpanan Sukarela Diperbarui",
        message: "Perubahan parameter operasional simpanan sukarela berhasil disimpan.",
      });
    } else {
      addToast({ type: "danger", title: "Gagal Mengubah Konfigurasi", message: res.error || "Terjadi kesalahan." });
    }
  };

  // Filtered transactions for Tab 2
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.memberDemoId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.memberNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSavingsType = savingsTypeFilter === "all" || t.savingsType === savingsTypeFilter;
    const matchesTrxType = trxTypeFilter === "all" || t.transactionType === trxTypeFilter;

    return matchesSearch && matchesStatus && matchesSavingsType && matchesTrxType;
  });

  // Filtered members for Tab 3
  const filteredMembers = reportSummary.rekapPerAnggota.filter((m) => {
    return (
      m.memberName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.memberDemoId.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.memberNumber.toLowerCase().includes(memberSearch.toLowerCase())
    );
  });

  const getStatusBadge = (status: SavingsTransactionStatus) => {
    switch (status) {
      case "approved":
        return <Badge variant="forest">Disetujui</Badge>;
      case "submitted":
        return <Badge variant="warning">Menunggu Verifikasi</Badge>;
      case "under_review":
        return <Badge variant="info">Sedang Ditinjau</Badge>;
      case "rejected":
        return <Badge variant="danger">Ditolak</Badge>;
      case "cancelled":
        return <Badge variant="neutral">Dibatalkan</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* 1. Header Banner & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-900">Manajemen Simpanan Anggota</h1>
            <Badge variant="forest" size="sm">
              Business Module Active
            </Badge>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Pengelolaan buku simpanan pokok, wajib, dan sukarela dengan alur verifikasi berjenjang dan pemisahan tugas (Separation of Duties).
          </p>
        </div>

        <div className="text-xs text-right">
          <span className="text-ink-500 block">Kewenangan Anda:</span>
          <strong className="text-ink-900">{currentUser.roleName}</strong>
          <span className="text-[11px] text-ink-500 block">
            {canApprove
              ? "Hak Otorisasi Persetujuan / Penolakan Aktif"
              : canVerify
              ? "Hak Pemeriksaan & Verifikasi Staf Aktif"
              : "Akses Pengawasan / Read-Only"}
          </span>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Akumulasi */}
        <Card className="border-forest-600/40 bg-forest-50/40">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-forest-800">
              <span className="font-semibold">Total Saldo Simpanan</span>
              <Wallet className="w-4 h-4 text-forest-700" />
            </div>
            <div className="text-xl font-bold text-forest-900 font-mono tracking-tight">
              {formatIDR(reportSummary.totalSaldoSimpanan)}
            </div>
            <div className="text-[10px] text-forest-700">Akumulasi seluruh anggota aktif</div>
          </CardContent>
        </Card>

        {/* Simpanan Pokok */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-ink-600">
              <span className="font-semibold">Simpanan Pokok</span>
              <Badge variant="forest" size="sm">SP</Badge>
            </div>
            <div className="text-lg font-bold text-ink-900 font-mono">
              {formatIDR(reportSummary.totalSimpananPokok)}
            </div>
            <div className="text-[10px] text-ink-500">Modal dasar anggota KMB</div>
          </CardContent>
        </Card>

        {/* Simpanan Wajib */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-ink-600">
              <span className="font-semibold">Simpanan Wajib</span>
              <Badge variant="info" size="sm">SW</Badge>
            </div>
            <div className="text-lg font-bold text-ink-900 font-mono">
              {formatIDR(reportSummary.totalSimpananWajib)}
            </div>
            <div className="text-[10px] text-ink-500">Akumulasi iuran rutin bulanan</div>
          </CardContent>
        </Card>

        {/* Simpanan Sukarela */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-ink-600">
              <span className="font-semibold">Simpanan Sukarela</span>
              <Badge variant="warning" size="sm">SS</Badge>
            </div>
            <div className="text-lg font-bold text-ink-900 font-mono">
              {formatIDR(reportSummary.totalSimpananSukarela)}
            </div>
            <div className="text-[10px] text-ink-500">Dana titipan likuid anggota</div>
          </CardContent>
        </Card>

        {/* Antrean Persetujuan */}
        <Card className={pendingQueue.length > 0 ? "border-warning-base/50 bg-warning-100/30" : ""}>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-ink-700">
              <span className="font-semibold">Antrean Transaksi</span>
              <Clock className="w-4 h-4 text-warning-700" />
            </div>
            <div className="text-xl font-bold text-ink-900 font-mono">
              {pendingQueue.length} <span className="text-xs font-normal text-ink-600">berkas</span>
            </div>
            <div className="text-[10px] text-warning-800 font-medium">
              {pendingQueue.length > 0 ? "Memerlukan tindak lanjut" : "Semua transaksi tuntas"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-ink-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "queue"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>1. Antrean Verifikasi & Approval ({pendingQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "transactions"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>2. Daftar Transaksi ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "members"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. Direktori Saldo Anggota ({members.length})</span>
        </button>

        {canRecord && (
          <button
            onClick={() => setActiveTab("entry")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "entry"
                ? "border-forest-700 text-forest-900 bg-white"
                : "border-transparent text-ink-600 hover:text-ink-900"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>4. Entri Transaksi Baru (Loket/Staf)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "reports"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>5. Laporan & Rekapitulasi</span>
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "config"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>6. Konfigurasi Produk Simpanan</span>
        </button>
      </div>

      {/* TAB 1: Antrean Verifikasi & Persetujuan (Workflow / SoD) */}
      {activeTab === "queue" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Antrean Pemeriksaan & Otorisasi Transaksi</CardTitle>
                <CardDescription>
                  Workflow penegakan pemisahan tugas (SoD): Staf memverifikasi berkas, Pejabat Keuangan/Pengurus memberikan persetujuan final. Pembuat transaksi tidak dapat menyetujui transaksinya sendiri.
                </CardDescription>
              </div>
              <Badge variant="warning" size="sm">
                {pendingQueue.length} Transaksi Menunggu
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingQueue.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  title="Antrean Transaksi Kosong"
                  description="Seluruh pengajuan transaksi simpanan telah diverifikasi dan diputuskan. Tidak ada antrean yang tertunda."
                />
              </div>
            ) : (
              <div className="divide-y divide-ink-100">
                {pendingQueue.map((trx) => {
                  const isCreator = trx.createdById === currentUser.id;

                  return (
                    <div
                      key={trx.id}
                      className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-ink-50/50 transition-colors"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-ink-900">
                            {trx.id}
                          </span>
                          {getStatusBadge(trx.status)}
                          <span className="text-xs uppercase font-semibold text-ink-800">
                            {trx.transactionType === "deposit" ? "Setoran" : "Penarikan"} ({trx.savingsType})
                          </span>
                        </div>
                        <div className="text-xs text-ink-700">
                          Anggota: <strong>{trx.memberName}</strong> ({trx.memberNumber} / {trx.memberDemoId})
                        </div>
                        <div className="text-[11px] text-ink-500">
                          Diajukan oleh: <strong>{trx.createdByName}</strong> ({trx.createdByRole}) pada {formatDate(trx.date)} via {trx.paymentMethod}
                        </div>
                        {trx.notes && (
                          <div className="text-[11px] text-ink-600 italic">
                            Catatan: "{trx.notes}"
                          </div>
                        )}
                        {isCreator && (
                          <div className="text-[11px] text-warning-800 font-semibold flex items-center gap-1 mt-1">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Peringatan SoD: Anda tercatat sebagai pembuat transaksi ini (Tidak berwenang memverifikasi atau menyetujui sendiri).</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-ink-500 block">Nominal:</span>
                          <span className="text-base font-mono font-bold text-ink-900">
                            {formatIDR(trx.amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTransaction(trx)}
                          >
                            Detail
                          </Button>

                          {/* 1. Transaksi SUBMITTED: Hanya tombol Verifikasi yang aktif bagi pemeriksa berkas */}
                          {trx.status === "submitted" && (
                            canVerify ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isCreator}
                                onClick={() => handleReview(trx.id)}
                              >
                                Verifikasi Berkas
                              </Button>
                            ) : (
                              <span className="text-[11px] text-ink-500 italic">Menunggu Verifikasi</span>
                            )
                          )}

                          {/* 2. Transaksi UNDER_REVIEW: Hanya tombol Setujui dan Tolak yang aktif bagi pejabat otorisasi */}
                          {trx.status === "under_review" && (
                            canApprove ? (
                              <>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  disabled={isCreator}
                                  onClick={() => handleOpenRejectModal(trx)}
                                >
                                  Tolak
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={isCreator}
                                  onClick={() => handleApprove(trx.id)}
                                >
                                  Setujui
                                </Button>
                              </>
                            ) : (
                              <span className="text-[11px] text-ink-500 italic">Menunggu Otorisasi</span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Seluruh Transaksi */}
      {activeTab === "transactions" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Seluruh Transaksi Simpanan</CardTitle>
                <CardDescription>
                  Pencatatan lengkap seluruh transaksi simpanan anggota terintegrasi jejak audit.
                </CardDescription>
              </div>
              <Badge variant="neutral" size="sm">
                Total: {filteredTransactions.length} Data
              </Badge>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari ID/nama/nomor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-ink-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>

              <Select
                options={[
                  { value: "all", label: "Semua Status" },
                  { value: "submitted", label: "Menunggu Verifikasi" },
                  { value: "under_review", label: "Sedang Ditinjau" },
                  { value: "approved", label: "Disetujui" },
                  { value: "rejected", label: "Ditolak" },
                  { value: "cancelled", label: "Dibatalkan" },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />

              <Select
                options={[
                  { value: "all", label: "Semua Jenis Simpanan" },
                  { value: "pokok", label: "Simpanan Pokok (SP)" },
                  { value: "wajib", label: "Simpanan Wajib (SW)" },
                  { value: "sukarela", label: "Simpanan Sukarela (SS)" },
                ]}
                value={savingsTypeFilter}
                onChange={(e) => setSavingsTypeFilter(e.target.value)}
              />

              <Select
                options={[
                  { value: "all", label: "Semua Jenis Mutasi" },
                  { value: "deposit", label: "Setoran (Deposit)" },
                  { value: "withdrawal", label: "Penarikan (Withdrawal)" },
                ]}
                value={trxTypeFilter}
                onChange={(e) => setTrxTypeFilter(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  title="Tidak Ada Transaksi Sesuai Filter"
                  description="Silakan sesuaikan kata kunci pencarian atau reset filter untuk menampilkan data transaksi."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaksi</TableHead>
                      <TableHead>Anggota</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Mutasi</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((trx) => (
                      <TableRow key={trx.id}>
                        <TableCell className="font-mono text-xs font-semibold text-ink-900">
                          {trx.id}
                        </TableCell>
                        <TableCell className="text-xs">
                          <strong className="block text-ink-900">{trx.memberName}</strong>
                          <span className="text-[11px] text-ink-500 font-mono">
                            {trx.memberNumber}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-ink-600">
                          {formatDate(trx.date)}
                        </TableCell>
                        <TableCell className="text-xs uppercase font-medium text-ink-800">
                          {trx.savingsType}
                        </TableCell>
                        <TableCell className="text-xs">
                          {trx.transactionType === "deposit" ? (
                            <span className="text-forest-700 font-medium inline-flex items-center gap-1">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Setoran
                            </span>
                          ) : (
                            <span className="text-warning-800 font-medium inline-flex items-center gap-1">
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              Penarikan
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-right text-ink-900">
                          {formatIDR(trx.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(trx.status)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTransaction(trx)}
                          >
                            Rincian
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Direktori Saldo Anggota */}
      {activeTab === "members" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Direktori Buku Simpanan Anggota</CardTitle>
                <CardDescription>
                  Daftar saldo simpanan pokok, wajib, dan sukarela per anggota KMB yang disinkronkan secara konsisten dengan transaksi disetujui.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari anggota..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-ink-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Anggota</TableHead>
                    <TableHead>Nama Anggota</TableHead>
                    <TableHead className="text-right">Simpanan Pokok</TableHead>
                    <TableHead className="text-right">Simpanan Wajib</TableHead>
                    <TableHead className="text-right">Simpanan Sukarela</TableHead>
                    <TableHead className="text-right">Total Simpanan</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((m) => (
                    <TableRow key={m.memberDemoId}>
                      <TableCell className="font-mono text-xs font-semibold text-forest-800">
                        {m.memberNumber}
                      </TableCell>
                      <TableCell className="text-xs">
                        <strong className="block text-ink-900">{m.memberName}</strong>
                        <span className="text-[11px] text-ink-500 font-mono">{m.memberDemoId}</span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right text-ink-800">
                        {formatIDR(m.saldoPokok)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right text-ink-800">
                        {formatIDR(m.saldoWajib)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right text-ink-800">
                        {formatIDR(m.saldoSukarela)}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-right text-forest-900">
                        {formatIDR(m.totalSaldo)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchQuery(m.memberDemoId);
                            setActiveTab("transactions");
                          }}
                        >
                          Lihat Transaksi
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: Entri Transaksi Baru (Pencatatan Staf/Loket) */}
      {activeTab === "entry" && canRecord && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-base">Pencatatan Transaksi Loket / Kasir Koperasi</CardTitle>
            <CardDescription>
              Staf operasional mencatat setoran atau permohonan penarikan anggota di kantor fisik KMB. Transaksi akan masuk antrean verifikasi/persetujuan pejabat keuangan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStaffEntrySubmit} className="space-y-4 text-xs">
              {entryError && (
                <div className="p-3 bg-danger-100 border border-danger-base/30 rounded text-danger-700">
                  {entryError}
                </div>
              )}

              <div className="space-y-1">
                <Select
                  label="Pilih Anggota"
                  options={[
                    { value: "", label: "-- Pilih Anggota Terdaftar --" },
                    ...members.map((m) => ({
                      value: m.demoId,
                      label: `${m.fullName} (${m.memberNumber} - ${m.demoId})`,
                    })),
                  ]}
                  value={entryMemberDemoId}
                  onChange={(e) => setEntryMemberDemoId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Select
                    label="Jenis Mutasi"
                    options={[
                      { value: "deposit", label: "Setoran (Deposit)" },
                      { value: "withdrawal", label: "Penarikan (Withdrawal)" },
                    ]}
                    value={entryTrxType}
                    onChange={(e) => {
                      const val = e.target.value as SavingsTransactionType;
                      setEntryTrxType(val);
                      if (val === "withdrawal") setEntrySavingsType("sukarela");
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <Select
                    label="Jenis Produk Simpanan"
                    options={[
                      { value: "wajib", label: "Simpanan Wajib (SW)" },
                      { value: "sukarela", label: "Simpanan Sukarela (SS)" },
                      { value: "pokok", label: "Simpanan Pokok (SP)" },
                    ]}
                    value={entrySavingsType}
                    disabled={entryTrxType === "withdrawal"}
                    onChange={(e) => {
                      const newType = e.target.value as SavingsType;
                      setEntrySavingsType(newType);
                      if (newType === "wajib") setEntryAmount(String(savingsConfig.simpananWajibBulanan));
                      else if (newType === "pokok") setEntryAmount(String(savingsConfig.simpananPokokNominal));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Input
                  label="Nominal Transaksi (Rp)"
                  type="number"
                  min="1"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  helperText={`Nominal format: ${formatIDR(Number(entryAmount) || 0)}`}
                />
              </div>

              <div className="space-y-1">
                <Select
                  label="Metode Pembayaran"
                  options={[
                    { value: "Kasir Tunai (Simulasi)", label: "Kasir Tunai / Teller Kantor" },
                    { value: "Transfer Bank (Simulasi)", label: "Transfer Rekening Bank Koperasi" },
                    { value: "Debit Virtual (Simulasi)", label: "Debit Virtual / EDC Demo" },
                  ]}
                  value={entryPaymentMethod}
                  onChange={(e) => setEntryPaymentMethod(e.target.value as PaymentMethod)}
                />
              </div>

              <div className="space-y-1">
                <Textarea
                  label="Catatan Transaksi / Keterangan"
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  placeholder="Contoh: Setoran tunai loket diserahkan langsung oleh anggota."
                  rows={2}
                />
              </div>

              <div className="p-3 bg-ink-50 rounded border border-ink-200 text-[11px] text-ink-600">
                * Transaksi yang dicatat oleh Staf Operasional akan masuk antrean dengan status <strong>Sedang Ditinjau</strong> dan memerlukan persetujuan Petugas Keuangan/Pengurus sebelum saldo bertambah/berkurang.
              </div>

              <div className="flex justify-end pt-2 border-t border-ink-100">
                <Button type="submit" variant="primary" size="sm">
                  Simpan Transaksi ke Antrean
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: Laporan & Rekapitulasi */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Laporan Rekapitulasi Simpanan Koperasi (Demonstrasi)</CardTitle>
              <CardDescription>
                Data dihitung secara dinamis dari akumulasi seluruh transaksi yang berstatus Disetujui (Approved) dan saldo aktif anggota.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stat breakdown grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-forest-50/50 border border-forest-600/30 rounded-lg space-y-1">
                  <span className="text-xs text-forest-800 font-semibold block">Total Akumulasi Masuk (Setoran)</span>
                  <div className="text-xl font-bold font-mono text-forest-900">
                    {formatIDR(reportSummary.totalSetoranNominal)}
                  </div>
                  <span className="text-[11px] text-forest-700">Seluruh setoran disetujui</span>
                </div>

                <div className="p-4 bg-warning-100/40 border border-warning-base/30 rounded-lg space-y-1">
                  <span className="text-xs text-warning-900 font-semibold block">Total Akumulasi Keluar (Penarikan)</span>
                  <div className="text-xl font-bold font-mono text-warning-900">
                    {formatIDR(reportSummary.totalPenarikanNominal)}
                  </div>
                  <span className="text-[11px] text-warning-800">Penarikan sukarela disetujui</span>
                </div>

                <div className="p-4 bg-ink-50 border border-ink-200 rounded-lg space-y-1">
                  <span className="text-xs text-ink-700 font-semibold block">Net Saldo Terkelola</span>
                  <div className="text-xl font-bold font-mono text-ink-900">
                    {formatIDR(reportSummary.totalSaldoSimpanan)}
                  </div>
                  <span className="text-[11px] text-ink-500">Saldo bersih simpanan anggota</span>
                </div>
              </div>

              {/* Status distribution */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-ink-900 block">Distribusi Status Transaksi</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-3 bg-white border border-forest-600/30 rounded text-center">
                    <span className="text-ink-500 block text-[10px]">Disetujui</span>
                    <strong className="text-forest-800 font-mono text-base">
                      {reportSummary.transaksiByStatus.approved}
                    </strong>
                  </div>
                  <div className="p-3 bg-white border border-warning-base/30 rounded text-center">
                    <span className="text-ink-500 block text-[10px]">Menunggu Verifikasi</span>
                    <strong className="text-warning-800 font-mono text-base">
                      {reportSummary.transaksiByStatus.submitted}
                    </strong>
                  </div>
                  <div className="p-3 bg-white border border-info-base/30 rounded text-center">
                    <span className="text-ink-500 block text-[10px]">Sedang Ditinjau</span>
                    <strong className="text-info-800 font-mono text-base">
                      {reportSummary.transaksiByStatus.under_review}
                    </strong>
                  </div>
                  <div className="p-3 bg-white border border-danger-base/30 rounded text-center">
                    <span className="text-ink-500 block text-[10px]">Ditolak</span>
                    <strong className="text-danger-700 font-mono text-base">
                      {reportSummary.transaksiByStatus.rejected}
                    </strong>
                  </div>
                  <div className="p-3 bg-white border border-ink-200 rounded text-center">
                    <span className="text-ink-500 block text-[10px]">Dibatalkan</span>
                    <strong className="text-ink-700 font-mono text-base">
                      {reportSummary.transaksiByStatus.cancelled}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Komposisi Simpanan */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-ink-900 block">Komposisi Portofolio Simpanan</span>
                <div className="p-4 bg-white border border-ink-200 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-600">Simpanan Pokok:</span>
                    <span className="font-mono font-bold text-ink-900">
                      {formatIDR(reportSummary.totalSimpananPokok)} (
                      {reportSummary.totalSaldoSimpanan > 0
                        ? ((reportSummary.totalSimpananPokok / reportSummary.totalSaldoSimpanan) * 100).toFixed(1)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-600">Simpanan Wajib:</span>
                    <span className="font-mono font-bold text-ink-900">
                      {formatIDR(reportSummary.totalSimpananWajib)} (
                      {reportSummary.totalSaldoSimpanan > 0
                        ? ((reportSummary.totalSimpananWajib / reportSummary.totalSaldoSimpanan) * 100).toFixed(1)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-600">Simpanan Sukarela:</span>
                    <span className="font-mono font-bold text-ink-900">
                      {formatIDR(reportSummary.totalSimpananSukarela)} (
                      {reportSummary.totalSaldoSimpanan > 0
                        ? ((reportSummary.totalSimpananSukarela / reportSummary.totalSaldoSimpanan) * 100).toFixed(1)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 6: Konfigurasi Produk Simpanan */}
      {activeTab === "config" && (
        <div className="space-y-6">
          {/* Synchronized Simpanan Pokok & Wajib Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Parameter Simpanan Pokok & Wajib (Tersinkronisasi)</CardTitle>
                  <CardDescription>
                    Nilai ilustrasi diambil langsung dari konfigurasi keanggotaan (Membership Store) untuk memastikan satu sumber kebenaran.
                  </CardDescription>
                </div>
                <Badge variant="warning" size="sm">
                  Nominal Ilustrasi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-ink-50 rounded border border-ink-200">
                <span className="text-ink-500 block">Simpanan Pokok Ilustrasi:</span>
                <strong className="text-lg font-mono text-ink-900">
                  {formatIDR(savingsConfig.simpananPokokNominal)}
                </strong>
                <span className="text-[11px] text-ink-500 block mt-1">
                  Dikelola pada tab Platform Settings &gt; Cooperative Configuration.
                </span>
              </div>
              <div className="p-3 bg-ink-50 rounded border border-ink-200">
                <span className="text-ink-500 block">Simpanan Wajib Bulanan Ilustrasi:</span>
                <strong className="text-lg font-mono text-ink-900">
                  {formatIDR(savingsConfig.simpananWajibBulanan)} / bln
                </strong>
                <span className="text-[11px] text-ink-500 block mt-1">
                  Komitmen iuran rutin bulanan per anggota.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Konfigurasi Simpanan Sukarela */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Parameter Produk Simpanan Sukarela</CardTitle>
                  <CardDescription>
                    Pengaturan suku bunga ilustrasi dan batas minimum setoran/penarikan likuid.
                  </CardDescription>
                </div>
                {!canUpdateProductConfig && (
                  <Badge variant="neutral" size="sm">
                    View Only
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {configSuccess && (
                <div className="mb-4 p-3 bg-forest-100 border border-forest-600/30 rounded text-forest-800 text-xs">
                  Konfigurasi berhasil disimpan dan diperbarui di penyimpanan lokal (localStorage).
                </div>
              )}

              <form onSubmit={handleSaveSukarelaConfig} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Input
                      label="Setoran Minimum (Rp)"
                      type="number"
                      min="0"
                      disabled={!canUpdateProductConfig}
                      value={editMinDeposit}
                      onChange={(e) => setEditMinDeposit(e.target.value)}
                      helperText={`Aktif: ${formatIDR(Number(editMinDeposit) || 0)}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      label="Penarikan Minimum (Rp)"
                      type="number"
                      min="0"
                      disabled={!canUpdateProductConfig}
                      value={editMinWithdrawal}
                      onChange={(e) => setEditMinWithdrawal(e.target.value)}
                      helperText={`Aktif: ${formatIDR(Number(editMinWithdrawal) || 0)}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      label="Saldo Mengendap Minimum (Rp)"
                      type="number"
                      min="0"
                      disabled={!canUpdateProductConfig}
                      value={editMinBalance}
                      onChange={(e) => setEditMinBalance(e.target.value)}
                      helperText={`Aktif: ${formatIDR(Number(editMinBalance) || 0)}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      label="Suku Bunga Ilustrasi (% per tahun)"
                      type="number"
                      step="0.1"
                      min="0"
                      disabled={!canUpdateProductConfig}
                      value={editInterestRate}
                      onChange={(e) => setEditInterestRate(e.target.value)}
                      helperText="Catatan: Nilai simulasi, bukan imbal hasil komersial."
                    />
                  </div>
                </div>

                <div className="p-3 bg-warning-100/30 border border-warning-base/30 rounded text-[11px] text-ink-600">
                  * <strong>Pemberitahuan Kewenangan (SoD):</strong> Perubahan parameter produk simpanan hanya dapat dilakukan oleh Bendahara atau Pengurus berwenang (product_config:update). Staf dan Administrator teknis hanya memiliki hak melihat.
                </div>

                {canUpdateProductConfig && (
                  <div className="flex justify-end pt-2 border-t border-ink-100">
                    <Button type="submit" variant="primary" size="sm">
                      Simpan Parameter Sukarela
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Riwayat Perubahan Parameter Konfigurasi */}
          {configHistory && configHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Riwayat Perubahan Parameter Produk (Audit Trail)</CardTitle>
                <CardDescription>
                  Catatan historis modifikasi parameter simpanan sukarela oleh pejabat berwenang.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Aktor / Peran</TableHead>
                        <TableHead>Setoran Min. (Sebelum → Sesudah)</TableHead>
                        <TableHead>Tarik Min. (Sebelum → Sesudah)</TableHead>
                        <TableHead>Bunga (% p.a.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configHistory.map((hist) => (
                        <TableRow key={hist.id}>
                          <TableCell className="font-mono text-xs text-ink-600">{formatDate(hist.timestamp)}</TableCell>
                          <TableCell className="text-xs">
                            <strong className="text-ink-900">{hist.actorName}</strong>
                            <span className="block text-[10px] text-ink-500">{hist.actorRole}</span>
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {formatIDR(hist.previousConfig.minDeposit || 0)} → {formatIDR(hist.newConfig.minDeposit || 0)}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {formatIDR(hist.previousConfig.minWithdrawal || 0)} → {formatIDR(hist.newConfig.minWithdrawal || 0)}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {hist.previousConfig.interestRatePct}% → {hist.newConfig.interestRatePct}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* MODAL 1: Detail Transaksi & Log Aktivitas */}
      {selectedTransaction && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTransaction(null)}
          title={`Detail Transaksi ${selectedTransaction.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-ink-50 rounded border border-ink-200">
              <div>
                <span className="text-ink-500 block text-[11px]">ID Transaksi:</span>
                <strong className="font-mono text-ink-900">{selectedTransaction.id}</strong>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Status:</span>
                <div className="mt-0.5">{getStatusBadge(selectedTransaction.status)}</div>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Anggota:</span>
                <strong className="text-ink-900">{selectedTransaction.memberName}</strong>
                <span className="text-[10px] text-ink-500 block font-mono">
                  {selectedTransaction.memberNumber} ({selectedTransaction.memberDemoId})
                </span>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Nominal:</span>
                <strong className="font-mono text-sm text-ink-900">
                  {formatIDR(selectedTransaction.amount)}
                </strong>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Jenis Mutasi:</span>
                <span className="font-semibold uppercase text-ink-900">
                  {selectedTransaction.transactionType} ({selectedTransaction.savingsType})
                </span>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Metode Pembayaran:</span>
                <span>{selectedTransaction.paymentMethod}</span>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Tanggal Entri:</span>
                <span>{formatDate(selectedTransaction.date)}</span>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Dibuat Oleh:</span>
                <span>
                  {selectedTransaction.createdByName} ({selectedTransaction.createdByRole})
                </span>
              </div>
            </div>

            {selectedTransaction.rejectionReason && (
              <div className="p-3 bg-danger-100 border border-danger-base/30 rounded text-danger-700">
                <strong>Alasan Penolakan:</strong>
                <p className="mt-1">{selectedTransaction.rejectionReason}</p>
              </div>
            )}

            {selectedTransaction.cancellationReason && (
              <div className="p-3 bg-ink-100 border border-ink-200 rounded text-ink-700">
                <strong>Alasan Pembatalan / Koreksi:</strong>
                <p className="mt-1">{selectedTransaction.cancellationReason}</p>
              </div>
            )}

            {/* Audit Trail Timeline */}
            <div className="space-y-2">
              <span className="font-bold text-ink-900 block text-xs">
                Jejak Audit Kronologis ({selectedTransaction.history.length})
              </span>
              <div className="border border-ink-200 rounded-lg p-3 divide-y divide-ink-100 max-h-48 overflow-y-auto bg-white">
                {selectedTransaction.history.map((log) => (
                  <div key={log.id} className="py-2 first:pt-0 last:pb-0 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <strong className="text-ink-900">{log.action}</strong>
                      <span className="text-ink-400 font-mono">{formatDate(log.timestamp)}</span>
                    </div>
                    <div className="text-[11px] text-ink-600">
                      Aktor: <strong>{log.actorName}</strong> ({log.actorRole})
                    </div>
                    {log.notes && (
                      <p className="text-[10px] text-ink-500 italic mt-0.5">"{log.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons in modal */}
            <div className="flex items-center justify-between pt-2 border-t border-ink-100">
              {/* Cancellation option for approved transaction by Treasurer (savings:adjust) */}
              {canAdjust && selectedTransaction.status === "approved" ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleOpenCancelModal(selectedTransaction)}
                >
                  Koreksi / Batalkan Transaksi
                </Button>
              ) : (
                <div />
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTransaction(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: Konfirmasi Penolakan Transaksi */}
      {rejectingTransaction && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingTransaction(null)}
          title={`Penolakan Transaksi ${rejectingTransaction.id}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-ink-700">
              Anda akan menolak transaksi {rejectingTransaction.transactionType} {rejectingTransaction.savingsType} milik <strong>{rejectingTransaction.memberName}</strong> sebesar <strong>{formatIDR(rejectingTransaction.amount)}</strong>.
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-ink-900 block">Alasan Penolakan (Wajib Diisi)</label>
              <Textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Tuliskan alasan penolakan secara jelas untuk kepatuhan jejak audit..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingTransaction(null)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!rejectionReasonInput.trim()}
                onClick={handleConfirmReject}
              >
                Konfirmasi Penolakan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Konfirmasi Pembatalan / Koreksi */}
      {cancellingTransaction && (
        <Modal
          isOpen={true}
          onClose={() => setCancellingTransaction(null)}
          title={`Koreksi Pembatalan Transaksi ${cancellingTransaction.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-danger-100 border border-danger-base/30 rounded text-danger-800">
              <strong>Peringatan Otorisasi Koreksi:</strong>
              <p className="mt-1">
                Tindakan ini akan membalikkan saldo anggota yang telah tercatat sebelumnya sebesar {formatIDR(cancellingTransaction.amount)}. Catatan audit tidak akan dihapus melainkan ditandai sebagai "Dibatalkan" demi kepatuhan pengawasan.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink-900 block">Alasan Pembatalan / Koreksi</label>
              <Textarea
                value={cancellationReasonInput}
                onChange={(e) => setCancellationReasonInput(e.target.value)}
                placeholder="Tuliskan berita acara koreksi saldo atau pembatalan transaksi..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingTransaction(null)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!cancellationReasonInput.trim()}
                onClick={handleConfirmCancel}
              >
                Eksekusi Koreksi Saldo
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
