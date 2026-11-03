import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useLoanStore } from "../stores/loanStore";
import { hasPermission } from "@/lib/rbac";
import {
  Loan,
  LoanApplication,
} from "../types";
import { formatIDR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
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
  FileCheck2,
  DollarSign,
  Search,
  CheckCircle2,
  Eye,
  ShieldAlert,
  Send,
} from "lucide-react";

export const AdminLoanManagementView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const {
    systemConfig,
    configHistory,
    applications,
    loans,
    paymentRecords,
    getPortfolioSummary,
    reviewApplication,
    recommendApplication,
    approveApplication,
    rejectApplication,
    disburseLoan,
    recordInstallmentPayment,
    adjustInstallmentLateFee,
    updateSystemConfig,
  } = useLoanStore();

  const [activeTab, setActiveTab] = useState<
    "queue" | "disbursement" | "portfolio" | "reconciliation" | "waiver" | "config"
  >("queue");

  // Portfolio filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [collectibilityFilter, setCollectibilityFilter] = useState<string>("all");

  // Modal Detail & Review
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);

  // Modal Pencairan
  const [disbursingApp, setDisbursingApp] = useState<LoanApplication | null>(null);
  const [disbursementChannel, setDisbursementChannel] = useState<string>(
    "Transfer Rekening Anggota (Simulasi)"
  );
  const [disbursementNotes, setDisbursementNotes] = useState<string>("");

  // Modal Detail Pinjaman Portofolio
  const [detailLoan, setDetailLoan] = useState<Loan | null>(null);

  // Form Rekonsiliasi / Bayar Angsuran di Admin
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<string>("");
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<number>(1);
  const [adminPaymentAmount, setAdminPaymentAmount] = useState<number>(0);
  const [adminPaymentMethod, setAdminPaymentMethod] = useState<string>(
    "Transfer Bank (Simulasi)"
  );
  const [adminPaymentRef, setAdminPaymentRef] = useState<string>("");
  const [adminPaymentNotes, setAdminPaymentNotes] = useState<string>("");

  // Form Penyesuaian Denda (Bendahara)
  const [waiverLoanId, setWaiverLoanId] = useState<string>("");
  const [waiverInstallmentNumber, setWaiverInstallmentNumber] = useState<number>(1);
  const [waiverIsFull, setWaiverIsFull] = useState<boolean>(true);
  const [waiverCustomAmount, setWaiverCustomAmount] = useState<number>(0);
  const [waiverReason, setWaiverReason] = useState<string>("");

  // Form Konfigurasi Kebijakan
  const [cfgGracePeriod, setCfgGracePeriod] = useState<number>(systemConfig.gracePeriodDays);
  const [cfgLateFeeRate, setCfgLateFeeRate] = useState<number>(systemConfig.lateFeeDailyPct);
  const [cfgFoThreshold, setCfgFoThreshold] = useState<number>(
    systemConfig.approvalThresholdFoMax
  );
  const [cfgMaxLoans, setCfgMaxLoans] = useState<number>(
    systemConfig.maxActiveLoansPerMember
  );
  const [cfgNotes, setCfgNotes] = useState<string>("");

  // RBAC Permission Checks
  const canReview = currentUser ? hasPermission(currentUser.role, "loans:review") : false;
  const canApprove = currentUser ? hasPermission(currentUser.role, "loans:approve") : false;
  const canDisburse = currentUser ? hasPermission(currentUser.role, "loans:disburse") : false;
  const canRecordPayment = currentUser
    ? hasPermission(currentUser.role, "installments:record")
    : false;
  const canAdjustFee = currentUser
    ? hasPermission(currentUser.role, "installments:adjust")
    : false;
  const canUpdateConfig = currentUser
    ? hasPermission(currentUser.role, "product_config:update")
    : false;

  const portfolioSummary = getPortfolioSummary();

  // Antrean Pengajuan (submitted, under_review, recommended)
  const pendingApplications = applications.filter(
    (a) => a.status === "submitted" || a.status === "under_review" || a.status === "recommended"
  );

  // Antrean Pencairan (approved)
  const approvedApplications = applications.filter((a) => a.status === "approved");

  // Portofolio Filtered Loans
  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const matchSearch =
        l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.memberNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchColl =
        collectibilityFilter === "all"
          ? true
          : collectibilityFilter === "paid_off"
          ? l.status === "paid_off"
          : l.collectibility === collectibilityFilter && l.status !== "paid_off";

      return matchSearch && matchColl;
    });
  }, [loans, searchTerm, collectibilityFilter]);

  // Handler: Review/Verifikasi
  const handleReview = (appId: string) => {
    const res = reviewApplication(appId, actionNotes || undefined);
    if (!res.success) {
      addToast({ title: "Gagal Verifikasi", message: res.error || "", type: "danger" });
      return;
    }
    addToast({
      title: "Verifikasi Berhasil",
      message: `Pengajuan ${appId} berhasil diverifikasi staf.`,
      type: "success",
    });
    setSelectedApp(null);
    setActionNotes("");
  };

  // Handler: Rekomendasi
  const handleRecommend = (appId: string) => {
    const res = recommendApplication(appId, actionNotes || undefined);
    if (!res.success) {
      addToast({ title: "Gagal Rekomendasi", message: res.error || "", type: "danger" });
      return;
    }
    addToast({
      title: "Rekomendasi Berhasil Dikirim",
      message: `Pengajuan ${appId} direkomendasikan untuk persetujuan berwenang.`,
      type: "success",
    });
    setSelectedApp(null);
    setActionNotes("");
  };

  // Handler: Setujui
  const handleApprove = (appId: string) => {
    const res = approveApplication(appId, actionNotes || undefined);
    if (!res.success) {
      addToast({ title: "Gagal Menyetujui", message: res.error || "", type: "danger" });
      return;
    }
    addToast({
      title: "Pengajuan Disetujui",
      message: `Pengajuan ${appId} resmi disetujui dan berpindah ke antrean pencairan.`,
      type: "success",
    });
    setSelectedApp(null);
    setActionNotes("");
  };

  // Handler: Tolak
  const handleReject = () => {
    if (!selectedApp) return;
    if (!rejectReason.trim()) {
      addToast({
        title: "Alasan Wajib Diisi",
        message: "Mohon isi alasan penolakan secara transparan.",
        type: "danger",
      });
      return;
    }

    const res = rejectApplication(selectedApp.id, rejectReason);
    if (!res.success) {
      addToast({ title: "Gagal Menolak", message: res.error || "", type: "danger" });
      return;
    }

    addToast({
      title: "Pengajuan Ditolak",
      message: `Pengajuan ${selectedApp.id} telah ditolak. Alasan tercatat di audit trail.`,
      type: "warning",
    });
    setIsRejectModalOpen(false);
    setSelectedApp(null);
    setRejectReason("");
  };

  // Handler: Pencairan Pinjaman
  const handleDisburse = () => {
    if (!disbursingApp) return;
    const res = disburseLoan(disbursingApp.id, disbursementChannel, disbursementNotes);
    if (!res.success) {
      addToast({ title: "Pencairan Gagal", message: res.error || "", type: "danger" });
      return;
    }

    addToast({
      title: "Pencairan Berhasil Dikonfirmasi",
      message: `Pinjaman ${res.loanId} telah aktif. Jadwal angsuran otomatis dibentuk.`,
      type: "success",
    });
    setDisbursingApp(null);
    setDisbursementNotes("");
  };

  // Handler: Admin Pembayaran Angsuran
  const handleAdminRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForPayment) {
      addToast({ title: "Pilih Pinjaman", message: "Silakan pilih pinjaman yang akan dibayar.", type: "danger" });
      return;
    }
    if (adminPaymentAmount <= 0) {
      addToast({ title: "Nominal Tidak Valid", message: "Nominal pembayaran harus lebih dari 0.", type: "danger" });
      return;
    }

    const res = recordInstallmentPayment({
      loanId: selectedLoanForPayment,
      installmentNumber: selectedInstallmentNumber,
      amountPaid: adminPaymentAmount,
      paymentMethod: adminPaymentMethod,
      referenceNumber: adminPaymentRef || undefined,
      notes: adminPaymentNotes || undefined,
    });

    if (!res.success) {
      addToast({ title: "Gagal Mencatat Pembayaran", message: res.error || "", type: "danger" });
      return;
    }

    addToast({
      title: "Pembayaran Angsuran Dibukukan",
      message: `Alokasi pembayaran angsuran ke-${selectedInstallmentNumber} berhasil dicatat.`,
      type: "success",
    });
    setAdminPaymentAmount(0);
    setAdminPaymentRef("");
    setAdminPaymentNotes("");
  };

  // Handler: Penyesuaian / Penghapusan Denda (Bendahara)
  const handleWaiverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverLoanId) {
      addToast({ title: "Pilih Pinjaman", message: "Silakan pilih pinjaman yang mengalami denda.", type: "danger" });
      return;
    }
    if (!waiverReason.trim()) {
      addToast({ title: "Alasan Wajib", message: "Alasan penghapusan/penyesuaian denda wajib diisi.", type: "danger" });
      return;
    }

    const res = adjustInstallmentLateFee({
      loanId: waiverLoanId,
      installmentNumber: waiverInstallmentNumber,
      waiveFee: waiverIsFull,
      newLateFeeAmount: waiverIsFull ? 0 : waiverCustomAmount,
      reason: waiverReason,
    });

    if (!res.success) {
      addToast({ title: "Penyesuaian Ditolak", message: res.error || "", type: "danger" });
      return;
    }

    addToast({
      title: "Otorisasi Denda Berhasil",
      message: waiverIsFull ? "Denda angsuran berhasil dihapuskan (waived)." : "Besaran denda berhasil disesuaikan.",
      type: "success",
    });
    setWaiverReason("");
  };

  // Handler: Update Konfigurasi
  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateSystemConfig(
      {
        gracePeriodDays: cfgGracePeriod,
        lateFeeDailyPct: cfgLateFeeRate,
        approvalThresholdFoMax: cfgFoThreshold,
        maxActiveLoansPerMember: cfgMaxLoans,
      },
      cfgNotes || undefined
    );

    if (!res.success) {
      addToast({ title: "Gagal Mengubah Kebijakan", message: res.error || "", type: "danger" });
      return;
    }

    addToast({
      title: "Kebijakan Berhasil Diperbarui",
      message: "Perubahan parameter kebijakan pinjaman demonstrasi telah disimpan.",
      type: "success",
    });
    setCfgNotes("");
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto py-4">
      {/* 1. Header & Identitas Aktor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
              Manajemen Pinjaman & Angsuran
            </h1>
            <Badge variant="neutral" size="sm">
              Phase 5
            </Badge>
          </div>
          <p className="text-xs text-ink-500 mt-1">
            Pengguna Aktif: <strong className="text-ink-900">{currentUser?.name}</strong> (
            <span className="capitalize font-semibold text-forest-700">{currentUser?.role}</span>
            ) • Otoritas Berjenjang & Tata Kelola BR-03
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canDisburse && (
            <Badge variant="forest" size="md">
              Akses Pencairan Aktif (FO)
            </Badge>
          )}
          {canAdjustFee && (
            <Badge variant="warning" size="md">
              Otoritas Denda Bendahara
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Ringkasan Eksekutif Portofolio Pinjaman */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="border-ink-200 bg-white">
          <CardHeader className="pb-1.5">
            <CardDescription className="text-[11px] text-ink-500 font-medium">
              Total Disalurkan
            </CardDescription>
            <CardTitle className="text-lg sm:text-xl font-bold font-tabular text-ink-900">
              {formatIDR(portfolioSummary.totalDisbursedPrincipal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[10px] text-ink-500">
            {portfolioSummary.totalLoansCount} total rekord pinjaman
          </CardContent>
        </Card>

        <Card className="border-forest-600/30 bg-forest-50/30">
          <CardHeader className="pb-1.5">
            <CardDescription className="text-[11px] text-forest-700 font-medium">
              Sisa Pokok Beredar
            </CardDescription>
            <CardTitle className="text-lg sm:text-xl font-bold font-tabular text-forest-900">
              {formatIDR(portfolioSummary.totalOutstandingPrincipal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[10px] text-forest-700">
            {portfolioSummary.activeLoansCount} pinjaman aktif berjalan
          </CardContent>
        </Card>

        <Card className="border-ink-200 bg-white">
          <CardHeader className="pb-1.5">
            <CardDescription className="text-[11px] text-ink-500 font-medium">
              Pokok Terbayar
            </CardDescription>
            <CardTitle className="text-lg sm:text-xl font-bold font-tabular text-ink-900">
              {formatIDR(portfolioSummary.totalRepaidPrincipal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[10px] text-ink-500">
            {portfolioSummary.paidOffLoansCount} pinjaman telah lunas
          </CardContent>
        </Card>

        <Card className="border-ink-200 bg-white">
          <CardHeader className="pb-1.5">
            <CardDescription className="text-[11px] text-ink-500 font-medium">
              Rasio NPL (Macet & DPK)
            </CardDescription>
            <CardTitle className="text-lg sm:text-xl font-bold font-tabular text-ink-900">
              {portfolioSummary.nplPercentage}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[10px] text-ink-500">
            {portfolioSummary.collectibilityBreakdown.macetCount} Macet •{" "}
            {portfolioSummary.collectibilityBreakdown.kurangLancarCount} Kurang Lancar
          </CardContent>
        </Card>

        <Card className="border-ink-200 bg-white col-span-2 lg:col-span-1">
          <CardHeader className="pb-1.5">
            <CardDescription className="text-[11px] text-ink-500 font-medium">
              Antrean Permohonan
            </CardDescription>
            <CardTitle className="text-lg sm:text-xl font-bold font-tabular text-ink-900">
              {pendingApplications.length} Berkas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[10px] text-ink-500">
            {approvedApplications.length} berkas siap dicairkan
          </CardContent>
        </Card>
      </div>

      {/* 3. Tab Navigasi Admin */}
      <div className="flex border-b border-ink-200 space-x-6 text-xs sm:text-sm overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`pb-3 font-semibold whitespace-nowrap transition-colors relative ${
            activeTab === "queue"
              ? "text-forest-700 border-b-2 border-forest-700"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          Antrean Persetujuan ({pendingApplications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("disbursement")}
          className={`pb-3 font-semibold whitespace-nowrap transition-colors relative ${
            activeTab === "disbursement"
              ? "text-forest-700 border-b-2 border-forest-700"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          Siap Dicairkan ({approvedApplications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("portfolio")}
          className={`pb-3 font-semibold whitespace-nowrap transition-colors relative ${
            activeTab === "portfolio"
              ? "text-forest-700 border-b-2 border-forest-700"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          Portofolio & Kolektibilitas ({loans.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reconciliation")}
          className={`pb-3 font-semibold whitespace-nowrap transition-colors relative ${
            activeTab === "reconciliation"
              ? "text-forest-700 border-b-2 border-forest-700"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          Pencatatan Angsuran & Riwayat
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("waiver")}
          className={`pb-3 font-semibold whitespace-nowrap transition-colors relative ${
            activeTab === "waiver"
              ? "text-forest-700 border-b-2 border-forest-700"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          Keringanan Denda (Bendahara)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`pb-3 font-semibold whitespace-nowrap transition-colors relative ${
            activeTab === "config"
              ? "text-forest-700 border-b-2 border-forest-700"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          Konfigurasi Kebijakan
        </button>
      </div>

      {/* TAB 1: ANTREAN PERSETUJUAN */}
      {activeTab === "queue" && (
        <Card className="border-ink-200 shadow-subtle">
          <CardHeader className="border-b border-ink-100 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-ink-900">
                Antrean Verifikasi & Persetujuan Berjenjang (BR-03.6)
              </CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Alur: Staf memverifikasi dokumen → FO menganalisa kelayakan & menyetujui $\le$ Rp 10.000.000 → Pengurus menyetujui &gt; Rp 10.000.000
              </CardDescription>
            </div>
            <Badge variant="neutral" size="sm">
              {pendingApplications.length} Menunggu Tindakan
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {pendingApplications.length === 0 ? (
              <div className="py-12 text-center">
                <EmptyState
                  title="Tidak Ada Antrean Pengajuan"
                  description="Seluruh permohonan pinjaman anggota telah selesai ditindaklanjuti atau telah disetujui."
                  icon={<FileCheck2 className="w-10 h-10 text-forest-600" />}
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-ink-50/60">
                    <TableHead className="text-xs">No. Berkas</TableHead>
                    <TableHead className="text-xs">Pemohon</TableHead>
                    <TableHead className="text-xs">Produk</TableHead>
                    <TableHead className="text-xs text-right">Nominal Pokok</TableHead>
                    <TableHead className="text-xs">Tenor</TableHead>
                    <TableHead className="text-xs text-center">Status Tahapan</TableHead>
                    <TableHead className="text-xs">Kewenangan Wajib</TableHead>
                    <TableHead className="text-xs text-right">Aksi Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApplications.map((app) => {
                    const isExceedingFoLimit = app.amount > systemConfig.approvalThresholdFoMax;

                    return (
                      <TableRow key={app.id} className="hover:bg-ink-50/50">
                        <TableCell className="text-xs font-bold text-ink-900">
                          {app.id}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-semibold text-ink-900">{app.memberName}</div>
                          <div className="text-[11px] text-ink-500 font-mono">
                            {app.memberNumber}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-ink-700">{app.productName}</TableCell>
                        <TableCell className="text-xs font-tabular text-right font-bold text-ink-900">
                          {formatIDR(app.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-ink-700">
                          {app.tenorMonths} Bulan
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge
                            variant={
                              app.status === "recommended"
                                ? "forest"
                                : app.status === "under_review"
                                ? "warning"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {app.status === "submitted"
                              ? "Menunggu Verifikasi"
                              : app.status === "under_review"
                              ? "Sedang Dianalisa"
                              : "Rekomendasi Pengurus"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-ink-600">
                          {isExceedingFoLimit ? (
                            <span className="font-semibold text-warning-800">
                              Manajer / Pengurus (&gt;10M)
                            </span>
                          ) : (
                            <span className="text-forest-700 font-semibold">
                              Finance Officer / Manajer
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedApp(app)}
                            className="text-[11px] h-7 px-2.5 font-semibold"
                          >
                            Tinjau Berkas
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: ANTREAN PENCAIRAN */}
      {activeTab === "disbursement" && (
        <Card className="border-ink-200 shadow-subtle">
          <CardHeader className="border-b border-ink-100 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-ink-900">
                Antrean Pencairan Dana Pinjaman Disetujui (BR-03.7)
              </CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Pencairan hanya dapat dieksekusi oleh Petugas Keuangan (Finance Officer). Pencairan otomatis membentuk jadwal angsuran.
              </CardDescription>
            </div>
            <Badge variant="forest" size="sm">
              {approvedApplications.length} Siap Cair
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {approvedApplications.length === 0 ? (
              <div className="py-12 text-center">
                <EmptyState
                  title="Tidak Ada Pinjaman Menunggu Pencairan"
                  description="Semua pinjaman yang telah disetujui telah dicairkan ke rekening anggota."
                  icon={<DollarSign className="w-10 h-10 text-ink-400" />}
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-ink-50/60">
                    <TableHead className="text-xs">No. Pinjaman</TableHead>
                    <TableHead className="text-xs">Nama Anggota</TableHead>
                    <TableHead className="text-xs">Produk</TableHead>
                    <TableHead className="text-xs text-right">Pokok Disetujui</TableHead>
                    <TableHead className="text-xs text-right">Potongan Admin</TableHead>
                    <TableHead className="text-xs text-right font-bold">Pencairan Bersih</TableHead>
                    <TableHead className="text-xs">Disetujui Oleh</TableHead>
                    <TableHead className="text-xs text-right">Aksi Eksekusi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-ink-50/50">
                      <TableCell className="text-xs font-bold text-ink-900">{app.id}</TableCell>
                      <TableCell className="text-xs">
                        <div className="font-semibold text-ink-900">{app.memberName}</div>
                        <div className="text-[11px] text-ink-500">{app.memberNumber}</div>
                      </TableCell>
                      <TableCell className="text-xs text-ink-700">{app.productName}</TableCell>
                      <TableCell className="text-xs font-tabular text-right">
                        {formatIDR(app.amount)}
                      </TableCell>
                      <TableCell className="text-xs font-tabular text-right text-ink-500">
                        {formatIDR(app.adminFeeAmount)}
                      </TableCell>
                      <TableCell className="text-xs font-tabular text-right font-bold text-forest-700">
                        {formatIDR(app.netDisbursementAmount)}
                      </TableCell>
                      <TableCell className="text-xs text-ink-600">
                        {app.approvedByName} ({app.approvedByRole})
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {canDisburse ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setDisbursingApp(app)}
                            className="text-[11px] h-7 px-2.5 font-semibold"
                          >
                            Proses Pencairan
                          </Button>
                        ) : (
                          <span className="text-[11px] text-ink-400 italic">
                            Perlu Peran FO
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: PORTOFOLIO & KOLEKTIBILITAS (30 REKORD LENGKAP) */}
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          <Card className="border-ink-200 shadow-subtle">
            <CardHeader className="border-b border-ink-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-ink-900">
                  Portofolio Pinjaman & Kolektibilitas Anggota
                </CardTitle>
                <CardDescription className="text-xs text-ink-500">
                  Memantau status pinjaman aktif, jadwal angsuran, hari keterlambatan (DPD), dan klasifikasi kolektibilitas
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-ink-400" />
                  <Input
                    type="text"
                    placeholder="Cari ID / Nama / No Anggota..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>

                <select
                  className="w-36 h-8 px-2 bg-white border border-ink-300 rounded-md text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                  value={collectibilityFilter}
                  onChange={(e) => setCollectibilityFilter(e.target.value)}
                >
                  <option value="all">Semua Kolektibilitas</option>
                  <option value="Lancar">Lancar</option>
                  <option value="DPK">DPK (1-90 hr)</option>
                  <option value="Kurang Lancar">Kurang Lancar (91-120)</option>
                  <option value="Diragukan">Diragukan (121-180)</option>
                  <option value="Macet">Macet (&gt;180 hr)</option>
                  <option value="paid_off">Lunas</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-ink-50/60">
                    <TableHead className="text-xs">No. Pinjaman</TableHead>
                    <TableHead className="text-xs">Nama Anggota</TableHead>
                    <TableHead className="text-xs">Produk</TableHead>
                    <TableHead className="text-xs text-right">Plafon Pokok</TableHead>
                    <TableHead className="text-xs text-right">Sisa Pokok</TableHead>
                    <TableHead className="text-xs text-center">DPD (Hari)</TableHead>
                    <TableHead className="text-xs text-center">Kolektibilitas</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                    <TableHead className="text-xs text-right">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-xs text-ink-500">
                        Tidak ada rekord pinjaman yang cocok dengan filter pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLoans.map((loan) => (
                      <TableRow key={loan.id} className="hover:bg-ink-50/50">
                        <TableCell className="text-xs font-bold text-ink-900">{loan.id}</TableCell>
                        <TableCell className="text-xs">
                          <div className="font-semibold text-ink-900">{loan.memberName}</div>
                          <div className="text-[11px] text-ink-500">{loan.memberNumber}</div>
                        </TableCell>
                        <TableCell className="text-xs text-ink-700">{loan.productName}</TableCell>
                        <TableCell className="text-xs font-tabular text-right">
                          {formatIDR(loan.principalAmount)}
                        </TableCell>
                        <TableCell className="text-xs font-tabular text-right font-bold text-ink-900">
                          {formatIDR(loan.remainingPrincipal)}
                        </TableCell>
                        <TableCell className="text-xs text-center font-tabular">
                          {loan.daysPastDue > 0 ? (
                            <span className="text-danger-700 font-bold">{loan.daysPastDue} hr</span>
                          ) : (
                            <span className="text-ink-400">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge
                            variant={
                              loan.collectibility === "Lancar"
                                ? "forest"
                                : loan.collectibility === "DPK"
                                ? "warning"
                                : "danger"
                            }
                            size="sm"
                          >
                            {loan.collectibility}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <span
                            className={`text-[11px] font-semibold ${
                              loan.status === "paid_off"
                                ? "text-forest-700"
                                : loan.status === "defaulted"
                                ? "text-danger-700"
                                : "text-ink-700"
                            }`}
                          >
                            {loan.status === "paid_off"
                              ? "Lunas"
                              : loan.status === "defaulted"
                              ? "Macet"
                              : "Aktif"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailLoan(loan)}
                            className="text-[11px] h-7 px-2"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Rincian
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: PENCATATAN ANGSURAN & RIWAYAT PEMBAYARAN */}
      {activeTab === "reconciliation" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Pencatatan Angsuran */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-ink-200 shadow-subtle">
              <CardHeader className="border-b border-ink-100 pb-3">
                <CardTitle className="text-base font-bold text-ink-900">
                  Pencatatan Pembayaran Angsuran
                </CardTitle>
                <CardDescription className="text-xs text-ink-500">
                  Prioritas Alokasi BR-04.3: 1. Denda → 2. Bunga → 3. Pokok
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleAdminRecordPayment} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">Pilih Rekord Pinjaman</label>
                    <select
                      className="w-full min-w-0 h-9 px-3 bg-white border border-ink-300 rounded-md text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                      value={selectedLoanForPayment}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedLoanForPayment(val);
                        const targetLoan = loans.find((l) => l.id === val);
                        if (targetLoan) {
                          const nextInst = targetLoan.installments.find((i) => i.status !== "paid");
                          if (nextInst) {
                            setSelectedInstallmentNumber(nextInst.installmentNumber);
                            const totalDue =
                              nextInst.totalAmount +
                              (nextInst.lateFeeWaived ? 0 : nextInst.lateFeeAmount);
                            setAdminPaymentAmount(totalDue);
                          }
                        }
                      }}
                    >
                      <option value="">-- Pilih Pinjaman Aktif --</option>
                      {loans
                        .filter((l) => l.status === "active" || l.status === "defaulted")
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.id} — {l.memberName} ({formatIDR(l.remainingPrincipal)})
                          </option>
                        ))}
                    </select>
                  </div>

                  {selectedLoanForPayment && (() => {
                    const l = loans.find((x) => x.id === selectedLoanForPayment);
                    if (!l) return null;
                    const inst = l.installments.find(
                      (i) => i.installmentNumber === selectedInstallmentNumber
                    );
                    return (
                      <div className="space-y-3 p-3 bg-ink-50 rounded-lg border border-ink-200">
                        <div className="flex justify-between items-center">
                          <label className="font-semibold text-ink-800">Nomor Angsuran</label>
                          <select
                            className="w-32 h-7 px-2 bg-white border border-ink-300 rounded text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                            value={String(selectedInstallmentNumber)}
                            onChange={(e) => {
                              const num = Number(e.target.value);
                              setSelectedInstallmentNumber(num);
                              const targetInst = l.installments.find(
                                (i) => i.installmentNumber === num
                              );
                              if (targetInst) {
                                const totalDue =
                                  targetInst.totalAmount +
                                  (targetInst.lateFeeWaived ? 0 : targetInst.lateFeeAmount);
                                setAdminPaymentAmount(totalDue);
                              }
                            }}
                          >
                            {l.installments.map((i) => (
                              <option key={i.installmentNumber} value={i.installmentNumber}>
                                Ke-{i.installmentNumber} ({i.status})
                              </option>
                            ))}
                          </select>
                        </div>

                        {inst && (
                          <div className="space-y-1 text-ink-600 border-t border-ink-200 pt-2 text-[11px]">
                            <div className="flex justify-between">
                              <span>Jatuh Tempo:</span>
                              <strong>{inst.dueDate}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Porsi Pokok:</span>
                              <span className="font-tabular">{formatIDR(inst.principalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Porsi Bunga:</span>
                              <span className="font-tabular">{formatIDR(inst.interestAmount)}</span>
                            </div>
                            <div className="flex justify-between text-danger-700">
                              <span>Denda Keterlambatan:</span>
                              <span className="font-tabular font-bold">
                                {inst.lateFeeWaived ? "Rp 0 (Waived)" : formatIDR(inst.lateFeeAmount)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">Nominal Pembayaran (Rp)</label>
                    <Input
                      type="number"
                      min={1000}
                      step={1000}
                      value={adminPaymentAmount}
                      onChange={(e) => setAdminPaymentAmount(Number(e.target.value))}
                      className="font-tabular text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">Kanal Pembayaran</label>
                    <select
                      className="w-full min-w-0 h-9 px-3 bg-white border border-ink-300 rounded-md text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                      value={adminPaymentMethod}
                      onChange={(e) => setAdminPaymentMethod(e.target.value)}
                    >
                      <option value="Transfer Bank (Simulasi)">Transfer Bank (Simulasi)</option>
                      <option value="Kasir Kantor Tunai">Kasir Kantor Tunai</option>
                      <option value="Debit Virtual Account">Debit Virtual Account</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">Nomor Referensi (Opsional)</label>
                    <Input
                      type="text"
                      placeholder="e.g. REF-TRF-2026-001"
                      value={adminPaymentRef}
                      onChange={(e) => setAdminPaymentRef(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!canRecordPayment}
                      className="w-full text-xs font-semibold"
                    >
                      Catat & Bukukan Pembayaran
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Tabel Riwayat Pembayaran Angsuran */}
          <div className="lg:col-span-7">
            <Card className="border-ink-200 shadow-subtle">
              <CardHeader className="border-b border-ink-100 pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-ink-900">
                    Log Rekonsiliasi Pembayaran Angsuran
                  </CardTitle>
                  <CardDescription className="text-xs text-ink-500">
                    Total {paymentRecords.length} transaksi pembayaran tercatat
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-ink-50/60">
                        <TableHead className="text-xs">ID Pembayaran</TableHead>
                        <TableHead className="text-xs">Tanggal</TableHead>
                        <TableHead className="text-xs">Pinjaman</TableHead>
                        <TableHead className="text-xs">Anggota</TableHead>
                        <TableHead className="text-xs text-right">Alokasi Pokok</TableHead>
                        <TableHead className="text-xs text-right">Alokasi Bunga</TableHead>
                        <TableHead className="text-xs text-right font-bold">Total Bayar</TableHead>
                        <TableHead className="text-xs">Petugas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentRecords.map((p) => (
                        <TableRow key={p.id} className="hover:bg-ink-50/50">
                          <TableCell className="text-xs font-mono font-semibold text-ink-900">
                            {p.id}
                          </TableCell>
                          <TableCell className="text-xs text-ink-500">{p.paymentDate}</TableCell>
                          <TableCell className="text-xs font-semibold">{p.loanId}</TableCell>
                          <TableCell className="text-xs text-ink-800">{p.memberName}</TableCell>
                          <TableCell className="text-xs font-tabular text-right text-forest-700">
                            {formatIDR(p.allocatedPrincipal)}
                          </TableCell>
                          <TableCell className="text-xs font-tabular text-right text-ink-600">
                            {formatIDR(p.allocatedInterest)}
                          </TableCell>
                          <TableCell className="text-xs font-tabular text-right font-bold text-ink-900">
                            {formatIDR(p.amountPaid)}
                          </TableCell>
                          <TableCell className="text-xs text-ink-500">{p.recordedByName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 5: KERINGANAN / PENGHAPUSAN DENDA (BENDAHARA) */}
      {activeTab === "waiver" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-ink-200 shadow-subtle">
            <CardHeader className="border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-warning-800" />
                <CardTitle className="text-base font-bold text-ink-900">
                  Otoritas Penyesuaian & Penghapusan Denda (Bendahara)
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-ink-500">
                Sesuai Matriks Tata Kelola IA Seksi 5.4 dan BR-03.8, hak koreksi dan penghapusan denda (late fee waiver) merupakan kewenangan tunggal Bendahara (Treasurer).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!canAdjustFee ? (
                <div className="p-4 bg-warning-100/40 border border-warning-base/40 rounded-lg text-xs text-ink-800 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-warning-900">
                    <ShieldAlert className="w-4 h-4 text-warning-800" />
                    Akses Dibatasi — Khusus Peran Bendahara (Treasurer)
                  </div>
                  <p className="leading-relaxed">
                    Peran Anda saat ini (<strong className="capitalize">{currentUser?.role}</strong>) tidak memiliki izin <code className="bg-ink-100 px-1 py-0.5 rounded">installments:adjust</code>. Silakan gunakan akun demonstrasi <strong>Sri Mulyani (Bendahara)</strong> di Role Switcher untuk menguji fitur restrukturisasi dan penghapusan denda ini.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWaiverSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">
                      Pilih Pinjaman dengan Tunggakan Denda
                    </label>
                    <select
                      className="w-full min-w-0 h-9 px-3 bg-white border border-ink-300 rounded-md text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                      value={waiverLoanId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWaiverLoanId(val);
                        const targetLoan = loans.find((l) => l.id === val);
                        if (targetLoan) {
                          const overdueInst = targetLoan.installments.find(
                            (i) => i.lateFeeAmount > 0 && !i.lateFeeWaived
                          );
                          if (overdueInst) {
                            setWaiverInstallmentNumber(overdueInst.installmentNumber);
                          }
                        }
                      }}
                    >
                      <option value="">-- Pilih Pinjaman Tertunggak --</option>
                      {loans
                        .filter((l) =>
                          l.installments.some((i) => i.lateFeeAmount > 0 && !i.lateFeeWaived)
                        )
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.id} — {l.memberName} (Kolektibilitas: {l.collectibility})
                          </option>
                        ))}
                    </select>
                  </div>

                  {waiverLoanId && (() => {
                    const l = loans.find((x) => x.id === waiverLoanId);
                    if (!l) return null;
                    const inst = l.installments.find(
                      (i) => i.installmentNumber === waiverInstallmentNumber
                    );
                    return (
                      <div className="p-3 bg-ink-50 rounded border border-ink-200 space-y-2">
                        <div className="flex justify-between">
                          <span>Nomor Angsuran:</span>
                          <select
                            className="w-32 h-7 px-2 bg-white border border-ink-300 rounded text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                            value={String(waiverInstallmentNumber)}
                            onChange={(e) => setWaiverInstallmentNumber(Number(e.target.value))}
                          >
                            {l.installments
                              .filter((i) => i.lateFeeAmount > 0)
                              .map((i) => (
                                <option key={i.installmentNumber} value={i.installmentNumber}>
                                  Ke-{i.installmentNumber} ({formatIDR(i.lateFeeAmount)})
                                </option>
                              ))}
                          </select>
                        </div>
                        {inst && (
                          <div className="text-danger-700 font-bold flex justify-between pt-1 border-t border-ink-200">
                            <span>Denda Berjalan Saat Ini:</span>
                            <span className="font-tabular">{formatIDR(inst.lateFeeAmount)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    <label className="font-semibold text-ink-800 block">Jenis Keringanan</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="waiverType"
                          checked={waiverIsFull}
                          onChange={() => setWaiverIsFull(true)}
                          className="accent-forest-700"
                        />
                        <span>Hapus Penuh 100% (Waived)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="waiverType"
                          checked={!waiverIsFull}
                          onChange={() => setWaiverIsFull(false)}
                          className="accent-forest-700"
                        />
                        <span>Sesuaikan Nominal Khusus</span>
                      </label>
                    </div>
                  </div>

                  {!waiverIsFull && (
                    <div className="space-y-1.5">
                      <label className="font-semibold text-ink-800">
                        Nominal Denda Baru Setelah Penyesuaian (Rp)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={waiverCustomAmount}
                        onChange={(e) => setWaiverCustomAmount(Number(e.target.value))}
                        className="font-tabular"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">
                      Alasan Kebijakan & Restrukturisasi (Wajib Tercatat di Audit Log)
                    </label>
                    <Textarea
                      rows={3}
                      placeholder="e.g. Anggota terdampak bencana musibah keluarga, disetujui keringanan denda atas rekomendasi rapat pengurus..."
                      value={waiverReason}
                      onChange={(e) => setWaiverReason(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full text-xs font-semibold"
                    >
                      Simpan & Otorisasi Penyesuaian Denda
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 6: KONFIGURASI KEBIJAKAN PINJAMAN */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-ink-200 shadow-subtle">
              <CardHeader className="border-b border-ink-100 pb-3">
                <CardTitle className="text-base font-bold text-ink-900">
                  Parameter Kebijakan Pinjaman (BR-03 & Configurable)
                </CardTitle>
                <CardDescription className="text-xs text-ink-500">
                  Pengaturan demonstrasi yang memengaruhi denda keterlambatan dan batasan approval FO
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleConfigSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">
                      Masa Tenggang Keterlambatan (Grace Period - Hari)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={cfgGracePeriod}
                      onChange={(e) => setCfgGracePeriod(Number(e.target.value))}
                      disabled={!canUpdateConfig}
                    />
                    <span className="text-[11px] text-ink-500">
                      Denda tidak dikenakan selama hari keterlambatan $\le$ nilai ini (default 3 hari).
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">
                      Tarif Denda Harian (% per hari)
                    </label>
                    <Input
                      type="number"
                      step={0.1}
                      min={0}
                      max={5}
                      value={cfgLateFeeRate}
                      onChange={(e) => setCfgLateFeeRate(Number(e.target.value))}
                      disabled={!canUpdateConfig}
                    />
                    <span className="text-[11px] text-ink-500">
                      Persentase dihitung dari sisa total angsuran yang terlambat (default 0,5%/hari).
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">
                      Batas Maksimal Persetujuan Finance Officer (Rp)
                    </label>
                    <Input
                      type="number"
                      step={1_000_000}
                      min={1_000_000}
                      value={cfgFoThreshold}
                      onChange={(e) => setCfgFoThreshold(Number(e.target.value))}
                      disabled={!canUpdateConfig}
                    />
                    <span className="text-[11px] text-ink-500">
                      Pengajuan di atas nominal ini wajib disetujui Pengurus/Manajer (default Rp 10.000.000).
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">
                      Maksimal Pinjaman Aktif Bersamaan per Anggota
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={cfgMaxLoans}
                      onChange={(e) => setCfgMaxLoans(Number(e.target.value))}
                      disabled={!canUpdateConfig}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink-800">Catatan Perubahan</label>
                    <Input
                      type="text"
                      placeholder="e.g. Penyesuaian batas toleransi likuiditas..."
                      value={cfgNotes}
                      onChange={(e) => setCfgNotes(e.target.value)}
                      disabled={!canUpdateConfig}
                    />
                  </div>

                  {canUpdateConfig && (
                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="w-full text-xs font-semibold"
                      >
                        Simpan Perubahan Kebijakan
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <Card className="border-ink-200 shadow-subtle">
              <CardHeader className="border-b border-ink-100 pb-3">
                <CardTitle className="text-base font-bold text-ink-900">
                  Riwayat Audit Perubahan Kebijakan
                </CardTitle>
                <CardDescription className="text-xs text-ink-500">
                  Rekam jejak transparansi konfigurasi internal
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {configHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-ink-500">
                    Belum ada riwayat perubahan parameter kebijakan.
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-80">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-ink-50/60">
                          <TableHead className="text-xs">Waktu</TableHead>
                          <TableHead className="text-xs">Aktor</TableHead>
                          <TableHead className="text-xs">Catatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {configHistory.map((h) => (
                          <TableRow key={h.id}>
                            <TableCell className="text-xs text-ink-500 font-mono">
                              {h.timestamp.slice(0, 16).replace("T", " ")}
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className="font-semibold text-ink-900">{h.actorName}</span> (
                              {h.actorRole})
                            </TableCell>
                            <TableCell className="text-xs text-ink-600">{h.notes || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL: TINJAU BERKAS & ACTION (Review, Recommend, Approve, Reject) */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedApp(null);
            setActionNotes("");
          }}
          title={`Pemeriksaan Berkas Pengajuan #${selectedApp.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-ink-50 rounded-lg space-y-2 border border-ink-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-ink-500 block">Pemohon:</span>
                  <strong className="text-ink-900 text-sm">{selectedApp.memberName}</strong>
                  <div className="text-[11px] text-ink-500 font-mono">
                    {selectedApp.memberNumber}
                  </div>
                </div>
                <div>
                  <span className="text-ink-500 block">Produk:</span>
                  <strong className="text-ink-900">{selectedApp.productName}</strong>
                  <div className="text-[11px] text-forest-700 font-semibold">
                    {selectedApp.interestRatePct}% p.a. • {selectedApp.calculationMethod}
                  </div>
                </div>
                <div>
                  <span className="text-ink-500 block">Nominal Permohonan:</span>
                  <strong className="text-forest-900 font-tabular text-sm">
                    {formatIDR(selectedApp.amount)}
                  </strong>
                </div>
                <div>
                  <span className="text-ink-500 block">Jangka Waktu:</span>
                  <strong className="text-ink-900">{selectedApp.tenorMonths} Bulan</strong>
                </div>
                <div>
                  <span className="text-ink-500 block">Tujuan & Kategori:</span>
                  <span className="text-ink-900">
                    {selectedApp.purposeCategory} — {selectedApp.purpose}
                  </span>
                </div>
                <div>
                  <span className="text-ink-500 block">Sumber Pembayaran:</span>
                  <span className="text-ink-900">{selectedApp.incomeSource}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-ink-200 flex items-center justify-between">
                <span className="text-ink-500">Lampiran Dokumen:</span>
                <span className="font-mono bg-ink-200 px-2 py-0.5 rounded text-[11px] text-ink-800">
                  {selectedApp.simulatedDocumentUrl}
                </span>
              </div>
            </div>

            {/* Riwayat Catatan Review & Rekomendasi */}
            {selectedApp.history.length > 0 && (
              <div className="space-y-1">
                <div className="font-semibold text-ink-800">Audit Trail Pengajuan:</div>
                <div className="border border-ink-200 rounded p-2 max-h-32 overflow-y-auto space-y-1.5 bg-ink-50/50">
                  {selectedApp.history.map((log) => (
                    <div key={log.id} className="text-[11px] text-ink-600">
                      <span className="font-mono text-ink-400">
                        {log.timestamp.slice(0, 16).replace("T", " ")}
                      </span>{" "}
                      • <strong>{log.actorName}</strong> ({log.actorRole}): {log.action}
                      {log.notes && <span className="italic block pl-2 text-ink-500">"{log.notes}"</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Catatan Tindakan */}
            <div className="space-y-1.5">
              <label className="font-semibold text-ink-800">Catatan Analisa / Keputusan</label>
              <Input
                type="text"
                placeholder="Masukkan catatan analisa atau rekomendasi..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </div>

            {/* Action Buttons sesuai RBAC, SoD & Threshold */}
            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-ink-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedApp(null);
                  setActionNotes("");
                }}
              >
                Tutup
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsRejectModalOpen(true)}
              >
                Tolak Pengajuan
              </Button>

              {/* Action Staf: Verifikasi */}
              {selectedApp.status === "submitted" && canReview && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleReview(selectedApp.id)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Verifikasi Berkas Staf
                </Button>
              )}

              {/* Action FO: Rekomendasikan ke Pengurus */}
              {selectedApp.status === "under_review" &&
                selectedApp.amount > systemConfig.approvalThresholdFoMax &&
                canReview && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRecommend(selectedApp.id)}
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Rekomendasikan ke Pengurus (&gt;10M)
                  </Button>
                )}

              {/* Action Approval: FO (<=10M) atau Manajer (Semua nominal) */}
              {(selectedApp.status === "under_review" ||
                selectedApp.status === "recommended" ||
                selectedApp.status === "submitted") &&
                canApprove && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(selectedApp.id)}
                    disabled={
                      currentUser?.role === "finance_officer" &&
                      selectedApp.amount > systemConfig.approvalThresholdFoMax
                    }
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Setujui Pinjaman
                  </Button>
                )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: ALASAN PENOLAKAN */}
      {isRejectModalOpen && selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setIsRejectModalOpen(false)}
          title={`Penolakan Pengajuan #${selectedApp.id}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-ink-600">
              Mohon berikan alasan penolakan secara jelas. Alasan akan disimpan pada audit trail dan dapat diakses pemohon:
            </p>
            <Textarea
              rows={3}
              placeholder="e.g. Kapasitas penghasilan belum memenuhi rasio beban cicilan, atau dokumen profil usaha belum valid..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
              >
                Konfirmasi Penolakan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: PROSES PENCAIRAN PINJAMAN (FINANCE OFFICER) */}
      {disbursingApp && (
        <Modal
          isOpen={true}
          onClose={() => setDisbursingApp(null)}
          title={`Konfirmasi Pencairan Pinjaman #${disbursingApp.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-forest-50/60 border border-forest-600/30 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-600">Nama Penerima:</span>
                <strong className="text-ink-900">{disbursingApp.memberName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Plafon Pokok Pinjaman:</span>
                <strong className="font-tabular text-ink-900">
                  {formatIDR(disbursingApp.amount)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Potongan Administrasi ({disbursingApp.adminFeePct}%):</span>
                <strong className="font-tabular text-danger-700">
                  -{formatIDR(disbursingApp.adminFeeAmount)}
                </strong>
              </div>
              <div className="border-t border-forest-200 pt-2 flex justify-between text-sm font-bold text-forest-900">
                <span>Total Dana Ditransfer Bersih:</span>
                <span className="font-tabular">{formatIDR(disbursingApp.netDisbursementAmount)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-ink-800">Kanal Penyaluran Dana</label>
              <select
                className="w-full min-w-0 h-9 px-3 bg-white border border-ink-300 rounded-md text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                value={disbursementChannel}
                onChange={(e) => setDisbursementChannel(e.target.value)}
              >
                <option value="Transfer Rekening Anggota (Simulasi)">Transfer Rekening Anggota (Simulasi)</option>
                <option value="Kasir Tunai Kantor Koperasi">Kasir Tunai Kantor Koperasi</option>
                <option value="Virtual Account Pencairan">Virtual Account Pencairan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-ink-800">Catatan / Bukti Referensi</label>
              <Input
                type="text"
                placeholder="e.g. No. Bukti Transfer Bank #98234-KMB"
                value={disbursementNotes}
                onChange={(e) => setDisbursementNotes(e.target.value)}
              />
            </div>

            <div className="p-2.5 bg-ink-50 rounded text-ink-600 border border-ink-200 text-[11px] leading-relaxed">
              <strong>Otomatisasi:</strong> Menyetujui pencairan ini akan langsung mengaktifkan pinjaman, mencatatkan tanggal pencairan hari ini, dan men-generate jadwal angsuran {disbursingApp.tenorMonths} bulan ke depan.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisbursingApp(null)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDisburse}
                className="font-semibold"
              >
                Konfirmasi Pencairan Selesai
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: DETAIL PINJAMAN PORTOFOLIO */}
      {detailLoan && (
        <Modal
          isOpen={true}
          onClose={() => setDetailLoan(null)}
          title={`Rincian Portofolio Pinjaman #${detailLoan.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-ink-50 rounded border border-ink-200 text-ink-700">
              <div>
                <span className="text-ink-500 block">Peminjam:</span>
                <strong className="text-ink-900">{detailLoan.memberName}</strong>
                <div className="text-[11px] text-ink-500">{detailLoan.memberNumber}</div>
              </div>
              <div>
                <span className="text-ink-500 block">Kolektibilitas:</span>
                <Badge
                  variant={
                    detailLoan.collectibility === "Lancar"
                      ? "forest"
                      : detailLoan.collectibility === "DPK"
                      ? "warning"
                      : "danger"
                  }
                  size="sm"
                >
                  {detailLoan.collectibility} ({detailLoan.daysPastDue} hari tunggakan)
                </Badge>
              </div>
              <div>
                <span className="text-ink-500 block">Plafon Awal:</span>
                <strong className="font-tabular">{formatIDR(detailLoan.principalAmount)}</strong>
              </div>
              <div>
                <span className="text-ink-500 block">Sisa Pokok:</span>
                <strong className="font-tabular text-forest-800">
                  {formatIDR(detailLoan.remainingPrincipal)}
                </strong>
              </div>
              <div>
                <span className="text-ink-500 block">Pokok Terbayar:</span>
                <span className="font-tabular">{formatIDR(detailLoan.totalPaidPrincipal)}</span>
              </div>
              <div>
                <span className="text-ink-500 block">Bunga Terbayar:</span>
                <span className="font-tabular">{formatIDR(detailLoan.totalPaidInterest)}</span>
              </div>
            </div>

            <div className="border border-ink-200 rounded overflow-hidden">
              <div className="bg-ink-100/70 px-3 py-1.5 font-bold text-ink-900 text-[11px]">
                Jadwal Angsuran Pinjaman ({detailLoan.installments.length} Periode)
              </div>
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-ink-50/50">
                      <TableHead className="text-xs">No</TableHead>
                      <TableHead className="text-xs">Jatuh Tempo</TableHead>
                      <TableHead className="text-xs text-right">Pokok</TableHead>
                      <TableHead className="text-xs text-right">Bunga</TableHead>
                      <TableHead className="text-xs text-right">Denda</TableHead>
                      <TableHead className="text-xs text-right font-bold">Total</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailLoan.installments.map((i) => (
                      <TableRow key={i.installmentNumber}>
                        <TableCell className="text-xs font-semibold">#{i.installmentNumber}</TableCell>
                        <TableCell className="text-xs text-ink-600">{i.dueDate}</TableCell>
                        <TableCell className="text-xs font-tabular text-right">
                          {formatIDR(i.principalAmount)}
                        </TableCell>
                        <TableCell className="text-xs font-tabular text-right text-ink-600">
                          {formatIDR(i.interestAmount)}
                        </TableCell>
                        <TableCell className="text-xs font-tabular text-right text-danger-700">
                          {i.lateFeeWaived ? (
                            <span className="line-through text-ink-400">Waived</span>
                          ) : i.lateFeeAmount > 0 ? (
                            formatIDR(i.lateFeeAmount)
                          ) : (
                            "Rp 0"
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-tabular text-right font-bold text-ink-900">
                          {formatIDR(i.totalAmount + (i.lateFeeWaived ? 0 : i.lateFeeAmount))}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge
                            variant={
                              i.status === "paid"
                                ? "forest"
                                : i.status === "overdue"
                                ? "danger"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {i.status === "paid"
                              ? "Lunas"
                              : i.status === "overdue"
                              ? "Terlambat"
                              : "Belum Bayar"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailLoan(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
