import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useShuStore } from "../stores/shuStore";
import { formatIDR, formatDate } from "@/lib/utils";
import {
  ShuAllocationCategoryKey,
  ShuActor,
  CreateShuPeriodInput,
} from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  PieChart,
  Layers,
  Calculator,
  ShieldCheck,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Wallet,
  ShoppingBag,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  Send,
  Info,
  RotateCcw,
} from "lucide-react";

export interface AdminShuViewProps {
  initialTab?: "overview" | "periode" | "konfigurasi" | "perhitungan" | "pemeriksaan" | "riwayat";
}

export const AdminShuView: React.FC<AdminShuViewProps> = ({ initialTab = "overview" }) => {
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const {
    periods,
    activePeriodId,
    setActivePeriodId,
    createPeriod,
    updatePolicyConfig,
    updateFinancialInput,
    collectPeriodData,
    runCalculation,
    submitForReview,
    approveCalculation,
    rejectCalculation,
    publishCalculation,
    closePeriod,
    adjustPublishedShu,
  } = useShuStore();

  const [activeTab, setActiveTab] = useState<
    "overview" | "periode" | "konfigurasi" | "perhitungan" | "pemeriksaan" | "riwayat"
  >(initialTab);

  const actor = useMemo<ShuActor>(() => ({
    id: currentUser.id || "demo_actor",
    name: currentUser.name,
    role: currentUser.role,
  }), [currentUser]);

  // Selected period
  const activePeriod = useMemo(() => {
    return periods.find((p) => p.id === activePeriodId) || periods[0];
  }, [periods, activePeriodId]);

  // Active snapshot of selected period
  const activeSnapshot = useMemo(() => {
    if (!activePeriod || activePeriod.snapshots.length === 0) return null;
    if (activePeriod.activeSnapshotId) {
      const found = activePeriod.snapshots.find((s) => s.id === activePeriod.activeSnapshotId);
      if (found) return found;
    }
    return activePeriod.snapshots[0];
  }, [activePeriod]);
  // Modal: Buat Periode
  const [isCreatePeriodModalOpen, setIsCreatePeriodModalOpen] = useState(false);
  const [newPeriodInput, setNewPeriodInput] = useState<CreateShuPeriodInput>({
    fiscalYear: 2027,
    name: "Tahun Buku 2027",
    startDate: "2027-01-01",
    endDate: "2027-12-31",
    description: "",
  });

  // Modal: Penolakan Kalkulasi
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Modal: Koreksi Audit Setelah Publikasi
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustmentSummary, setAdjustmentSummary] = useState("");
  const [adjustmentReasonText, setAdjustmentReasonText] = useState("");

  // Financial Input Form State
  const [revenueInput, setRevenueInput] = useState<string>(
    activePeriod?.financialInput.totalRevenue ? String(activePeriod.financialInput.totalRevenue) : "300000000"
  );
  const [expenseInput, setExpenseInput] = useState<string>(
    activePeriod?.financialInput.totalExpense ? String(activePeriod.financialInput.totalExpense) : "220000000"
  );
  const [adjAmountInput, setAdjAmountInput] = useState<string>(
    activePeriod?.financialInput.adjustmentAmount ? String(activePeriod.financialInput.adjustmentAmount) : "0"
  );
  const [adjReasonInput, setAdjReasonInput] = useState<string>(
    activePeriod?.financialInput.adjustmentReason || ""
  );

  // Policy Form State
  const [policyCategories, setPolicyCategories] = useState({
    cadangan: activePeriod?.activePolicyConfig.categories.cadangan.percentage ?? 30,
    jasa_modal: activePeriod?.activePolicyConfig.categories.jasa_modal.percentage ?? 30,
    jasa_usaha: activePeriod?.activePolicyConfig.categories.jasa_usaha.percentage ?? 25,
    dana_pengurus: activePeriod?.activePolicyConfig.categories.dana_pengurus.percentage ?? 5,
    dana_pendidikan: activePeriod?.activePolicyConfig.categories.dana_pendidikan.percentage ?? 5,
    dana_sosial: activePeriod?.activePolicyConfig.categories.dana_sosial.percentage ?? 5,
  });
  const [includeSimpananPokok, setIncludeSimpananPokok] = useState<boolean>(
    activePeriod?.activePolicyConfig.capitalSources.includeSimpananPokok ?? false
  );

  // Update inputs when activePeriod changes
  React.useEffect(() => {
    if (activePeriod) {
      setRevenueInput(String(activePeriod.financialInput.totalRevenue || 0));
      setExpenseInput(String(activePeriod.financialInput.totalExpense || 0));
      setAdjAmountInput(String(activePeriod.financialInput.adjustmentAmount || 0));
      setAdjReasonInput(activePeriod.financialInput.adjustmentReason || "");
      setPolicyCategories({
        cadangan: activePeriod.activePolicyConfig.categories.cadangan.percentage,
        jasa_modal: activePeriod.activePolicyConfig.categories.jasa_modal.percentage,
        jasa_usaha: activePeriod.activePolicyConfig.categories.jasa_usaha.percentage,
        dana_pengurus: activePeriod.activePolicyConfig.categories.dana_pengurus.percentage,
        dana_pendidikan: activePeriod.activePolicyConfig.categories.dana_pendidikan.percentage,
        dana_sosial: activePeriod.activePolicyConfig.categories.dana_sosial.percentage,
      });
      setIncludeSimpananPokok(activePeriod.activePolicyConfig.capitalSources.includeSimpananPokok);
    }
  }, [activePeriod]);

  // Computed total policy percentage
  const totalPolicyPercentage = useMemo(() => {
    return (
      (policyCategories.cadangan || 0) +
      (policyCategories.jasa_modal || 0) +
      (policyCategories.jasa_usaha || 0) +
      (policyCategories.dana_pengurus || 0) +
      (policyCategories.dana_pendidikan || 0) +
      (policyCategories.dana_sosial || 0)
    );
  }, [policyCategories]);
  // Handlers
  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = createPeriod(newPeriodInput, actor);
      addToast({
        type: "success",
        title: "Periode SHU Berhasil Dibuat",
        message: `${created.name} berhasil ditambahkan ke daftar periode.`,
      });
      setIsCreatePeriodModalOpen(false);
      setActivePeriodId(created.id);
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Gagal Membuat Periode",
        message: (err as Error).message || "Terjadi kesalahan saat membuat periode.",
      });
    }
  };

  const handleSaveFinancial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod) return;
    try {
      const rev = parseInt(revenueInput || "0", 10);
      const exp = parseInt(expenseInput || "0", 10);
      const adj = parseInt(adjAmountInput || "0", 10);

      updateFinancialInput(
        activePeriod.id,
        {
          totalRevenue: rev,
          totalExpense: exp,
          adjustmentAmount: adj,
          adjustmentReason: adjReasonInput.trim(),
        },
        actor
      );

      addToast({
        type: "success",
        title: "Kinerja Finansial Diperbarui",
        message: `Hasil usaha bersih ${activePeriod.name} berhasil disimpan.`,
      });
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Gagal Menyimpan Data Keuangan",
        message: (err as Error).message || "Pastikan format angka valid dan tidak negatif.",
      });
    }
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod) return;
    try {
      updatePolicyConfig(
        activePeriod.id,
        {
          cadangan: { percentage: Number(policyCategories.cadangan) },
          jasa_modal: { percentage: Number(policyCategories.jasa_modal) },
          jasa_usaha: { percentage: Number(policyCategories.jasa_usaha) },
          dana_pengurus: { percentage: Number(policyCategories.dana_pengurus) },
          dana_pendidikan: { percentage: Number(policyCategories.dana_pendidikan) },
          dana_sosial: { percentage: Number(policyCategories.dana_sosial) },
        },
        { includeSimpananPokok },
        undefined,
        actor
      );

      addToast({
        type: "success",
        title: "Kebijakan Alokasi Disimpan",
        message: "Persentase pembagian dan komponen modal SHU berhasil diperbarui.",
      });
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Gagal Menyimpan Kebijakan",
        message: (err as Error).message || "Total persentase harus tepat 100%.",
      });
    }
  };

  const handleRunCalculation = () => {
    if (!activePeriod) return;
    try {
      const snap = runCalculation(activePeriod.id, actor);
      addToast({
        type: "success",
        title: "Kalkulasi Simulasi Berhasil",
        message: `Snapshot ${snap.id} berhasil dihitung. Total distribusi anggota: ${formatIDR(snap.totalMemberDistribution)}.`,
      });
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Kalkulasi Gagal",
        message: (err as Error).message || "Periksa data input dan persentase alokasi.",
      });
    }
  };
  const handleSubmitReview = (snapshotId: string) => {
    if (!activePeriod) return;
    try {
      submitForReview(activePeriod.id, snapshotId, actor);
      addToast({
        type: "success",
        title: "Diajukan untuk Peninjauan",
        message: `Kalkulasi ${snapshotId} kini dalam status under_review.`,
      });
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Gagal Mengajukan",
        message: (err as Error).message,
      });
    }
  };

  const handleApprove = (snapshotId: string) => {
    if (!activePeriod) return;
    try {
      approveCalculation(activePeriod.id, snapshotId, actor);
      addToast({
        type: "success",
        title: "Kalkulasi SHU Disetujui",
        message: `Snapshot ${snapshotId} resmi disetujui untuk pembagian SHU.`,
      });
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Persetujuan Ditolak (SoD)",
        message: (err as Error).message,
      });
    }
  };

  const handleReject = () => {
    if (!activePeriod || !activeSnapshot) return;
    try {
      rejectCalculation(activePeriod.id, activeSnapshot.id, rejectionReason, actor);
      addToast({
        type: "warning",
        title: "Kalkulasi Ditolak",
        message: `Kalkulasi ${activeSnapshot.id} dikembalikan untuk perbaikan.`,
      });
      setIsRejectModalOpen(false);
      setRejectionReason("");
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Gagal Menolak Kalkulasi",
        message: (err as Error).message,
      });
    }
  };

  const handlePublish = (snapshotId: string) => {
    if (!activePeriod) return;
    try {
      publishCalculation(activePeriod.id, snapshotId, actor);
      addToast({
        type: "success",
        title: "SHU Resmi Dipublikasikan",
        message: `Anggota kini dapat melihat rincian SHU pada Portal Anggota.`,
      });
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Gagal Mempublikasikan",
        message: (err as Error).message,
      });
    }
  };

  const handleClose = () => {
    if (!activePeriod) return;
    try {
      closePeriod(activePeriod.id, actor);
      addToast({
        type: "success",
        title: "Periode Buku Ditutup",
        message: `${activePeriod.name} resmi ditutup permanen.`,
      });
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Gagal Menutup Periode",
        message: (err as Error).message,
      });
    }
  };

  const handleAdjust = () => {
    if (!activePeriod || !activeSnapshot) return;
    try {
      adjustPublishedShu(
        activePeriod.id,
        activeSnapshot.id,
        adjustmentSummary,
        adjustmentReasonText,
        actor
      );
      addToast({
        type: "success",
        title: "Koreksi Audit Dicatat",
        message: "Penyesuaian audit historis berhasil disimpan.",
      });
      setIsAdjustModalOpen(false);
      setAdjustmentSummary("");
      setAdjustmentReasonText("");
    } catch (err: unknown) {
      addToast({
        type: "danger",
        title: "Gagal Mencatat Koreksi",
        message: (err as Error).message,
      });
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="success" size="sm">Dipublikasikan</Badge>;
      case "approved":
        return <Badge variant="success" size="sm">Disetujui</Badge>;
      case "under_review":
        return <Badge variant="warning" size="sm">Dalam Pemeriksaan</Badge>;
      case "calculated":
        return <Badge variant="info" size="sm">Dihitung</Badge>;
      case "data_collection":
        return <Badge variant="info" size="sm">Pengumpulan Data</Badge>;
      case "closed":
        return <Badge variant="neutral" size="sm">Ditutup</Badge>;
      case "rejected":
        return <Badge variant="danger" size="sm">Ditolak</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengelolaan Sisa Hasil Usaha (SHU)"
        subtitle="Manajemen periode, alokasi kebijakan, simulasi perhitungan, dan persetujuan bertingkat SHU Nusantara Maju."
        actions={
          <div className="flex items-center gap-2">
            {(actor.role === "manager" || actor.role === "treasurer" || actor.role === "finance_officer") && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreatePeriodModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Buat Periode Baru
              </Button>
            )}
          </div>
        }
      />

      {/* Top Banner: Simulation Notice */}
      <div className="p-3.5 bg-forest-50/70 border border-forest-200/80 rounded-xl text-left flex items-start gap-3">
        <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <div className="text-xs text-ink-700 leading-relaxed">
          <span className="font-bold text-forest-900 uppercase tracking-wider block mb-0.5">
            DEMO MODE — Pengelolaan SHU Terkendali
          </span>
          Alur perhitungan memisahkan pendapatan kotor dari hasil usaha bersih. Alokasi persentase disimulasikan sesuai prinsip tata kelola dan pemisahan tugas (SoD) koperasi modern.
        </div>
      </div>

      {/* Period Selector & Active Status Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-ink-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center text-forest-800">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink-900">{activePeriod?.name}</h2>
              {getStatusBadge(activePeriod?.status || "draft")}
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
              Tahun Buku: {activePeriod?.fiscalYear} • Rentang: {activePeriod?.startDate} s.d {activePeriod?.endDate} • Versi Kalkulasi: {activePeriod?.currentCalculationVersion || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <span className="text-xs text-ink-600 font-medium whitespace-nowrap">Pilih Periode:</span>
          <select
            value={activePeriod?.id}
            onChange={(e) => setActivePeriodId(e.target.value)}
            className="text-xs border border-ink-200 rounded-lg px-2.5 py-1.5 bg-white text-ink-800 focus:outline-none focus:ring-1 focus:ring-forest-600"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-ink-200 flex items-center gap-2 overflow-x-auto pb-px">
        {[
          { key: "overview", label: "Ringkasan Eksekutif", icon: TrendingUp },
          { key: "periode", label: "Daftar Periode", icon: Clock },
          { key: "konfigurasi", label: "Kebijakan Alokasi", icon: Layers },
          { key: "perhitungan", label: "Simulasi Kalkulasi", icon: Calculator },
          { key: "pemeriksaan", label: "Pemeriksaan & Approval", icon: ShieldCheck },
          { key: "riwayat", label: "Snapshot & Log Audit", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-forest-700 text-forest-800 font-bold"
                  : "border-transparent text-ink-600 hover:text-ink-900 hover:border-ink-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Hasil Usaha Bersih"
              value={formatIDR(activePeriod?.financialInput.netIncome || 0)}
              description={`Pendapatan: ${formatIDR(activePeriod?.financialInput.totalRevenue || 0)}`}
              icon={<TrendingUp className="w-5 h-5 text-forest-700" />}
            />
            <StatCard
              title="SHU Dialokasikan"
              value={formatIDR(activePeriod?.financialInput.distributableShu || 0)}
              description="Maksimum alokasi hasil usaha bersih"
              icon={<Sparkles className="w-5 h-5 text-forest-700" />}
            />
            <StatCard
              title="Jasa Modal Anggota"
              value={
                activeSnapshot
                  ? formatIDR(activeSnapshot.allocationBreakdown.jasa_modal.allocatedAmount)
                  : formatIDR(0)
              }
              description={`Porsi kebijakan: ${activePeriod?.activePolicyConfig.categories.jasa_modal.percentage}%`}
              icon={<Wallet className="w-5 h-5 text-ink-600" />}
            />
            <StatCard
              title="Jasa Usaha Anggota"
              value={
                activeSnapshot
                  ? formatIDR(activeSnapshot.allocationBreakdown.jasa_usaha.allocatedAmount)
                  : formatIDR(0)
              }
              description={`Porsi kebijakan: ${activePeriod?.activePolicyConfig.categories.jasa_usaha.percentage}%`}
              icon={<ShoppingBag className="w-5 h-5 text-ink-600" />}
            />
          </div>

          {/* Allocation Breakdown Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-ink-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest-700" />
                Matriks Alokasi Kebijakan SHU ({activePeriod?.name})
              </CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Pembagian berdasarkan formula kebijakan aktif (Total tepat 100%).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(activePeriod?.activePolicyConfig.categories || {}).map(([key, item]) => (
                  <div key={key} className="p-3 bg-ink-50/70 border border-ink-150 rounded-lg text-left">
                    <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wider block">
                      {item.percentage}%
                    </span>
                    <p className="text-xs font-bold text-ink-900 mt-0.5 truncate">{item.label}</p>
                    <p className="text-xs font-mono font-semibold text-forest-800 mt-1">
                      {activeSnapshot
                        ? formatIDR(activeSnapshot.allocationBreakdown[key as ShuAllocationCategoryKey]?.allocatedAmount || 0)
                        : formatIDR(Math.floor(((activePeriod?.financialInput.distributableShu || 0) * item.percentage) / 100))}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* TAB 2: DAFTAR PERIODE */}
      {activeTab === "periode" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-ink-900">Daftar Periode Tutup Buku SHU</CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Kelola siklus hidup pembagian SHU per tahun buku operasional koperasi.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-ink-150 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-ink-50/70">
                    <TableHead className="text-xs font-bold text-ink-700">Tahun Buku</TableHead>
                    <TableHead className="text-xs font-bold text-ink-700">Nama Periode</TableHead>
                    <TableHead className="text-xs font-bold text-ink-700">Rentang Waktu</TableHead>
                    <TableHead className="text-xs font-bold text-ink-700">Status</TableHead>
                    <TableHead className="text-xs font-bold text-ink-700 text-right">Versi Kalkulasi</TableHead>
                    <TableHead className="text-xs font-bold text-ink-700 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((p) => (
                    <TableRow key={p.id} className={p.id === activePeriod?.id ? "bg-forest-50/20" : ""}>
                      <TableCell className="text-xs font-bold text-ink-900 font-mono">{p.fiscalYear}</TableCell>
                      <TableCell className="text-xs font-medium text-ink-800">
                        {p.name}
                        {p.id === activePeriod?.id && (
                          <Badge variant="forest" size="sm" className="ml-2 text-[9px]">
                            Aktif Dipilih
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-ink-600 font-mono">
                        {p.startDate} s.d {p.endDate}
                      </TableCell>
                      <TableCell className="text-xs">{getStatusBadge(p.status)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-medium">
                        v{p.currentCalculationVersion}
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActivePeriodId(p.id);
                              addToast({
                                type: "info",
                                title: "Periode Dipilih",
                                message: `Beralih ke ${p.name}.`,
                              });
                            }}
                            className="text-xs text-forest-700 hover:bg-forest-50"
                          >
                            Pilih
                          </Button>
                          {p.status === "draft" && (actor.role === "finance_officer" || actor.role === "manager") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                collectPeriodData(p.id, actor);
                                addToast({
                                  type: "success",
                                  title: "Pengumpulan Data Siap",
                                  message: `${p.name} siap untuk dikalkulasi.`,
                                });
                              }}
                              className="text-xs text-forest-800"
                            >
                              Kumpulkan Data
                            </Button>
                          )}
                          {p.status === "published" && actor.role === "manager" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleClose}
                              className="text-xs text-ink-700 hover:bg-ink-100"
                            >
                              Tutup Buku
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      {/* TAB 3: KONFIGURASI KEBIJAKAN */}
      {activeTab === "konfigurasi" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-ink-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-forest-700" />
                    Formula Alokasi Pembagian SHU ({activePeriod?.name})
                  </CardTitle>
                  <CardDescription className="text-xs text-ink-500">
                    Atur persentase alokasi masing-masing pos SHU. Total harus tepat 100%.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-600 font-medium">Total Persentase:</span>
                  <Badge variant={totalPolicyPercentage === 100 ? "success" : "danger"} size="md" className="font-mono">
                    {totalPolicyPercentage}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePolicy} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      1. Dana Cadangan (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={policyCategories.cadangan}
                      onChange={(e) => setPolicyCategories({ ...policyCategories, cadangan: Number(e.target.value) })}
                    />
                    <p className="text-[11px] text-ink-500 mt-1">Pemupukan modal dan penutup risiko</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      2. Jasa Modal Anggota (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={policyCategories.jasa_modal}
                      onChange={(e) => setPolicyCategories({ ...policyCategories, jasa_modal: Number(e.target.value) })}
                    />
                    <p className="text-[11px] text-ink-500 mt-1">Dibagikan proporsional simpanan anggota</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      3. Jasa Usaha Anggota (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={policyCategories.jasa_usaha}
                      onChange={(e) => setPolicyCategories({ ...policyCategories, jasa_usaha: Number(e.target.value) })}
                    />
                    <p className="text-[11px] text-ink-500 mt-1">Dibagikan proporsional transaksi verified</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      4. Dana Pengurus & Pengawas (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={policyCategories.dana_pengurus}
                      onChange={(e) => setPolicyCategories({ ...policyCategories, dana_pengurus: Number(e.target.value) })}
                    />
                    <p className="text-[11px] text-ink-500 mt-1">Insentif tata kelola pengurus</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      5. Dana Pendidikan (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={policyCategories.dana_pendidikan}
                      onChange={(e) => setPolicyCategories({ ...policyCategories, dana_pendidikan: Number(e.target.value) })}
                    />
                    <p className="text-[11px] text-ink-500 mt-1">Pelatihan SDM & perkoperasian</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      6. Dana Sosial (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={policyCategories.dana_sosial}
                      onChange={(e) => setPolicyCategories({ ...policyCategories, dana_sosial: Number(e.target.value) })}
                    />
                    <p className="text-[11px] text-ink-500 mt-1">Santunan & kepedulian masyarakat</p>
                  </div>
                </div>
                {/* Kebijakan U-07: Simpanan Pokok Toggle */}
                <div className="p-4 bg-ink-50/70 border border-ink-200 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink-900">Komponen Dasar Modal SHU</span>
                        <Badge variant="warning" size="sm" className="text-[9px]">
                          U-07: Ilustratif — Perlu Penetapan RAT
                        </Badge>
                      </div>
                      <p className="text-[11px] text-ink-600 mt-0.5">
                        Tentukan apakah Simpanan Pokok dihitung ke dalam modal anggota untuk pembagian Jasa Modal.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSimpananPokok}
                        onChange={(e) => setIncludeSimpananPokok(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-ink-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest-700"></div>
                    </label>
                  </div>
                </div>

                {(actor.role === "manager" || actor.role === "treasurer") && (
                  <div className="flex justify-end pt-2 border-t border-ink-150">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={totalPolicyPercentage !== 100}
                    >
                      Simpan Kebijakan Alokasi
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {/* TAB 4: SIMULASI KALKULASI */}
      {activeTab === "perhitungan" && (
        <div className="space-y-6">
          {/* 1. Input Finansial Demonstrasi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-ink-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-forest-700" />
                Input Kinerja Keuangan Demonstrasi ({activePeriod?.name})
              </CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Data simulasi pendapatan kotor dan beban operasional untuk menghasilkan Hasil Usaha Bersih.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveFinancial} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      Total Pendapatan Kotor (IDR)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={revenueInput}
                      onChange={(e) => setRevenueInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      Total Beban Operasional (IDR)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={expenseInput}
                      onChange={(e) => setExpenseInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      Koreksi / Penyesuaian (+/- IDR)
                    </label>
                    <Input
                      type="number"
                      value={adjAmountInput}
                      onChange={(e) => setAdjAmountInput(e.target.value)}
                    />
                  </div>
                </div>

                {parseInt(adjAmountInput || "0", 10) !== 0 && (
                  <div>
                    <label className="text-xs font-semibold text-ink-800 block mb-1">
                      Alasan Penyesuaian / Koreksi Fiskal
                    </label>
                    <Input
                      type="text"
                      placeholder="Contoh: Koreksi audit beban penyusutan alat pertanian"
                      value={adjReasonInput}
                      onChange={(e) => setAdjReasonInput(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-ink-50/70 border border-ink-150 rounded-lg">
                  <div className="text-xs text-ink-700">
                    <span className="font-semibold text-ink-900">Hasil Usaha Bersih Simulasi:</span>{" "}
                    <span className="font-mono font-bold text-forest-800 text-sm">
                      {formatIDR(
                        parseInt(revenueInput || "0", 10) -
                          parseInt(expenseInput || "0", 10) +
                          parseInt(adjAmountInput || "0", 10)
                      )}
                    </span>
                  </div>
                  {(actor.role === "finance_officer" || actor.role === "manager" || actor.role === "treasurer") && (
                    <Button type="submit" variant="outline" size="sm">
                      Simpan Kinerja Keuangan
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 2. Tombol Eksekusi Kalkulasi */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">Jalankan Engine Kalkulasi SHU</h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Engine akan memproses seluruh simpanan anggota dan transaksi unit usaha yang terverifikasi untuk menghasilkan snapshot versi baru.
                  </p>
                </div>
                {(actor.role === "finance_officer" || actor.role === "manager" || actor.role === "treasurer") && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleRunCalculation}
                    leftIcon={<Calculator className="w-4 h-4" />}
                  >
                    Jalankan Kalkulasi Simulasi
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Hasil Snapshot Kalkulasi Aktif */}
          {activeSnapshot && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-ink-900">
                      Hasil Kalkulasi: {activeSnapshot.id}
                    </CardTitle>
                    {getStatusBadge(activeSnapshot.status)}
                  </div>
                  <CardDescription className="text-xs text-ink-500 mt-0.5">
                    Dihitung oleh: {activeSnapshot.calculatedByName} ({activeSnapshot.calculatedByRole}) • {formatDate(activeSnapshot.calculatedAt)}
                  </CardDescription>
                </div>
                {activeSnapshot.status === "calculated" && (actor.role === "finance_officer" || actor.role === "manager") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSubmitReview(activeSnapshot.id)}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Ajukan untuk Pemeriksaan
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-ink-150 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-ink-50/70">
                        <TableHead className="text-xs font-bold text-ink-700">Anggota</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700">No. Anggota</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700 text-right">Modal Kualifikasi</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700 text-right">Jasa Modal</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700 text-right">Partisipasi Usaha</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700 text-right">Jasa Usaha</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700 text-right">Total SHU</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSnapshot.memberDistributions.map((m) => (
                        <TableRow key={m.memberId}>
                          <TableCell className="text-xs font-semibold text-ink-900">{m.memberName}</TableCell>
                          <TableCell className="text-xs font-mono text-ink-600">{m.memberNumber}</TableCell>
                          <TableCell className="text-xs text-right font-mono text-ink-700">{formatIDR(m.qualifyingCapital)}</TableCell>
                          <TableCell className="text-xs text-right font-mono text-forest-700 font-medium">{formatIDR(m.jasaModalFinal)}</TableCell>
                          <TableCell className="text-xs text-right font-mono text-ink-700">{formatIDR(m.verifiedParticipation)}</TableCell>
                          <TableCell className="text-xs text-right font-mono text-forest-700 font-medium">{formatIDR(m.jasaUsahaFinal)}</TableCell>
                          <TableCell className="text-xs text-right font-mono font-bold text-forest-900">{formatIDR(m.totalShu)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-ink-50 font-bold border-t border-ink-200">
                        <TableCell colSpan={6} className="text-xs text-ink-800">
                          TOTAL DISTRIBUSI ANGGOTA (SELISIH PEMBULATAN: Rp0)
                        </TableCell>
                        <TableCell className="text-sm font-bold text-forest-900 text-right font-mono">
                          {formatIDR(activeSnapshot.totalMemberDistribution)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* TAB 5: PEMERIKSAAN & APPROVAL */}
      {activeTab === "pemeriksaan" && (
        <div className="space-y-6">
          {!activeSnapshot ? (
            <EmptyState
              icon={<ShieldCheck className="w-6 h-6 text-ink-600" />}
              title="Belum Ada Snapshot Kalkulasi"
              description="Jalankan simulasi kalkulasi terlebih dahulu pada tab Simulasi Kalkulasi sebelum melakukan pemeriksaan."
            />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-ink-900">
                      Tinjauan Snapshot: {activeSnapshot.id}
                    </CardTitle>
                    {getStatusBadge(activeSnapshot.status)}
                  </div>
                  <CardDescription className="text-xs text-ink-500 mt-0.5">
                    Pembuat Kalkulasi: {activeSnapshot.calculatedByName} ({activeSnapshot.calculatedByRole})
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeSnapshot.calculatedById === actor.id && (
                  <div className="p-3.5 bg-danger-50 border border-danger-200 rounded-lg text-left flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-danger-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-danger-900">
                      <span className="font-bold block mb-0.5">Pemisahan Tugas (SoD) Aktif:</span>
                      Anda adalah aktor yang mengeksekusi kalkulasi ini ({activeSnapshot.calculatedByName}). Sesuai prinsip tata kelola koperasi, Anda dilarang memberikan persetujuan akhir terhadap kalkulasi buatan sendiri.
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-ink-50/70 border border-ink-150 rounded-lg">
                  <div className="text-xs text-ink-700">
                    <span className="font-semibold text-ink-900">Status Saat Ini:</span>{" "}
                    <span className="font-mono uppercase font-bold text-forest-800">{activeSnapshot.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSnapshot.status === "under_review" && (actor.role === "manager" || actor.role === "treasurer") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRejectModalOpen(true)}
                        className="text-danger-700 border-danger-300 hover:bg-danger-50"
                        leftIcon={<XCircle className="w-4 h-4" />}
                      >
                        Tolak dengan Alasan
                      </Button>
                    )}

                    {activeSnapshot.status === "under_review" && (actor.role === "manager" || actor.role === "treasurer") && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(activeSnapshot.id)}
                        disabled={activeSnapshot.calculatedById === actor.id}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Setujui Hasil Kalkulasi
                      </Button>
                    )}

                    {activeSnapshot.status === "approved" && actor.role === "manager" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePublish(activeSnapshot.id)}
                        leftIcon={<Send className="w-4 h-4" />}
                      >
                        Publikasikan ke Portal Anggota
                      </Button>
                    )}

                    {activeSnapshot.status === "published" && (actor.role === "manager" || actor.role === "treasurer") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdjustModalOpen(true)}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                      >
                        Catat Koreksi Audit
                      </Button>
                    )}
                  </div>
                </div>
                {/* Audit trail of status history for this snapshot */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-ink-900">Riwayat Peninjauan & Persetujuan</h4>
                  <div className="space-y-2">
                    {activeSnapshot.statusHistory.map((sh) => (
                      <div key={sh.id} className="p-2.5 bg-white border border-ink-150 rounded-lg text-xs flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-ink-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-ink-800">{sh.actorName} ({sh.actorRole})</span>
                            <span className="text-[10px] text-ink-500 font-mono">{formatDate(sh.timestamp)}</span>
                          </div>
                          <p className="text-ink-600 mt-0.5">{sh.notes || sh.rejectionReason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* TAB 6: RIWAYAT & AUDIT TRAIL */}
      {activeTab === "riwayat" && (
        <div className="space-y-6">
          {/* 1. Riwayat Snapshot Kalkulasi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-ink-900">
                Riwayat Versi Snapshot Kalkulasi ({activePeriod?.name})
              </CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Daftar snapshot kalkulasi yang bersifat kekal (immutable) per versi perhitungan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePeriod?.snapshots.length === 0 ? (
                <EmptyState
                  icon={<History className="w-6 h-6 text-ink-600" />}
                  title="Belum Ada Snapshot"
                  description="Kalkulasi simulasi belum pernah dijalankan untuk periode ini."
                />
              ) : (
                <div className="rounded-lg border border-ink-150 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-ink-50/70">
                        <TableHead className="text-xs font-bold text-ink-700">Snapshot ID</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700">Versi</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700">Dihitung Oleh</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700">Waktu</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700 text-right">SHU Anggota</TableHead>
                        <TableHead className="text-xs font-bold text-ink-700 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePeriod?.snapshots.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-xs font-mono font-bold text-ink-900">{s.id}</TableCell>
                          <TableCell className="text-xs font-mono">v{s.version}</TableCell>
                          <TableCell className="text-xs text-ink-700">{s.calculatedByName} ({s.calculatedByRole})</TableCell>
                          <TableCell className="text-xs font-mono text-ink-600">{formatDate(s.calculatedAt)}</TableCell>
                          <TableCell className="text-xs text-right font-mono font-medium text-forest-800">
                            {formatIDR(s.totalMemberDistribution)}
                          </TableCell>
                          <TableCell className="text-xs text-center">{getStatusBadge(s.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Audit Trail Periode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-ink-900">
                Log Audit Operasional SHU ({activePeriod?.name})
              </CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Rekaman kronologis seluruh perubahan status, kalkulasi, dan pengesahan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activePeriod?.auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-ink-50/60 border border-ink-150 rounded-lg text-xs flex items-start gap-3">
                    <Clock className="w-4 h-4 text-ink-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink-800">
                          {log.actorName} ({log.actorRole})
                        </span>
                        <span className="text-[10px] text-ink-500 font-mono">{formatDate(log.timestamp)}</span>
                      </div>
                      <p className="text-ink-700 mt-0.5">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* MODAL 1: BUAT PERIODE BARU */}
      <Modal
        isOpen={isCreatePeriodModalOpen}
        onClose={() => setIsCreatePeriodModalOpen(false)}
        title="Buat Periode Tutup Buku SHU Baru"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePeriod} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Tahun Buku
            </label>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={newPeriodInput.fiscalYear}
              onChange={(e) => {
                const yr = parseInt(e.target.value, 10);
                setNewPeriodInput({
                  ...newPeriodInput,
                  fiscalYear: yr,
                  name: `Tahun Buku ${yr}`,
                  startDate: `${yr}-01-01`,
                  endDate: `${yr}-12-31`,
                });
              }}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Nama Periode
            </label>
            <Input
              type="text"
              value={newPeriodInput.name}
              onChange={(e) => setNewPeriodInput({ ...newPeriodInput, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                value={newPeriodInput.startDate}
                onChange={(e) => setNewPeriodInput({ ...newPeriodInput, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">
                Tanggal Selesai
              </label>
              <Input
                type="date"
                value={newPeriodInput.endDate}
                onChange={(e) => setNewPeriodInput({ ...newPeriodInput, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <Textarea
              rows={2}
              value={newPeriodInput.description}
              onChange={(e) => setNewPeriodInput({ ...newPeriodInput, description: e.target.value })}
              placeholder="Catatan atau ruang lingkup tutup buku"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-ink-150">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreatePeriodModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Buat Periode
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: TOLAK KALKULASI */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Tolak Hasil Kalkulasi SHU"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-600">
            Kalkulasi akan dikembalikan ke status ditolak (rejected). Wajib mencantumkan alasan penolakan untuk perbaikan petugas keuangan.
          </p>
          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Alasan Penolakan
            </label>
            <Textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Sebutkan temuan audit atau pos keuangan yang perlu disesuaikan..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-ink-150">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleReject}
              disabled={rejectionReason.trim().length < 3}
              className="bg-danger-600 hover:bg-danger-700 text-white"
            >
              Konfirmasi Penolakan
            </Button>
          </div>
        </div>
      </Modal>
      {/* MODAL 3: KOREKSI AUDIT */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Catat Koreksi Audit SHU Pasca-Publikasi"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-600">
            Snapshot yang telah dipublikasikan bersifat kekal (immutable). Koreksi akan dicatat sebagai log penyesuaian audit historis tanpa menimpa data masa lalu.
          </p>
          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Ringkasan Koreksi
            </label>
            <Input
              type="text"
              value={adjustmentSummary}
              onChange={(e) => setAdjustmentSummary(e.target.value)}
              placeholder="Contoh: Rekonsiliasi selisih omzet Waserda sebesar Rp250.000"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Alasan & Dasar Hukum / Berita Acara
            </label>
            <Textarea
              rows={3}
              value={adjustmentReasonText}
              onChange={(e) => setAdjustmentReasonText(e.target.value)}
              placeholder="Catatan berita acara pemeriksaan atau keputusan rapat pengurus..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-ink-150">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdjustModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAdjust}
              disabled={adjustmentReasonText.trim().length < 3}
            >
              Simpan Koreksi Audit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};













