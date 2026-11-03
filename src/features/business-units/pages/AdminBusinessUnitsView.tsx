import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useBusinessUnitStore } from "../stores/businessUnitStore";
import { canPerformAction } from "@/lib/rbac";
import { formatIDR, formatDate } from "@/lib/utils";
import {
  BusinessUnit,
  BusinessUnitCategory,
  UnitActivityRecord,
  UnitActivityType,
  BUSINESS_UNIT_CATEGORIES,
  UNIT_ACTIVITY_TYPES,
  CreateBusinessUnitInput,
  UpdateBusinessUnitInput,
  RecordActivityInput,
} from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
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
  ShoppingBag,
  Plus,
  Edit2,
  PowerOff,
  Power,
  ClipboardList,
  TrendingUp,
  PackageCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Info,
  Clock,
  UserCheck,
} from "lucide-react";

export const AdminBusinessUnitsView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { members } = useMembershipStore();
  const {
    businessUnits,
    activities,
    createBusinessUnit,
    updateBusinessUnit,
    deactivateBusinessUnit,
    activateBusinessUnit,
    recordActivity,
    verifyActivity,
    cancelActivity,
    getPerformanceRecap,
  } = useBusinessUnitStore();

  const [activeTab, setActiveTab] = useState<"portfolio" | "activities" | "recap">("portfolio");

  // Actor wrapper for store calls
  const actor = useMemo(
    () => ({
      id: currentUser.id || "demo_actor",
      name: currentUser.name,
      role: currentUser.role,
      memberId: currentUser.memberId,
    }),
    [currentUser]
  );

  // Permission checks
  const canCreateUnit = canPerformAction(currentUser.role, "business_units", "create");
  const canUpdateUnit = canPerformAction(currentUser.role, "business_units", "update");
  const canDeactivateUnit = canPerformAction(currentUser.role, "business_units", "deactivate");
  const canRecordActivity = canPerformAction(currentUser.role, "business_units", "record");
  const canVerifyActivity = canPerformAction(currentUser.role, "business_units", "verify");
  const canExport = canPerformAction(currentUser.role, "business_units", "export");

  // Recap metrics
  const recap = useMemo(() => getPerformanceRecap(), [getPerformanceRecap]);

  // Active members for linkage
  const activeMembers = useMemo(
    () => members.filter((m) => m.status === "active"),
    [members]
  );

  // Filters for Portfolio
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<string>("all");
  const [portfolioStatusFilter, setPortfolioStatusFilter] = useState<string>("all");
  const [portfolioSearch, setPortfolioSearch] = useState<string>("");

  const filteredUnits = useMemo(() => {
    return businessUnits.filter((u) => {
      const matchCat =
        portfolioCategoryFilter === "all" || u.category === portfolioCategoryFilter;
      const matchStatus =
        portfolioStatusFilter === "all" || u.status === portfolioStatusFilter;
      const matchSearch =
        portfolioSearch === "" ||
        u.name.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
        u.code.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
        u.picName.toLowerCase().includes(portfolioSearch.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [businessUnits, portfolioCategoryFilter, portfolioStatusFilter, portfolioSearch]);

  // Filters for Activities
  const [activityUnitFilter, setActivityUnitFilter] = useState<string>("all");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [activityStatusFilter, setActivityStatusFilter] = useState<string>("all");
  const [activitySearch, setActivitySearch] = useState<string>("");

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchUnit = activityUnitFilter === "all" || a.unitId === activityUnitFilter;
      const matchType = activityTypeFilter === "all" || a.activityType === activityTypeFilter;
      const matchStatus =
        activityStatusFilter === "all" || a.status === activityStatusFilter;
      const matchSearch =
        activitySearch === "" ||
        a.id.toLowerCase().includes(activitySearch.toLowerCase()) ||
        a.description.toLowerCase().includes(activitySearch.toLowerCase()) ||
        (a.memberName && a.memberName.toLowerCase().includes(activitySearch.toLowerCase()));
      return matchUnit && matchType && matchStatus && matchSearch;
    });
  }, [activities, activityUnitFilter, activityTypeFilter, activityStatusFilter, activitySearch]);

  // Modals state
  const [isCreateUnitModalOpen, setIsCreateUnitModalOpen] = useState(false);
  const [createUnitForm, setCreateUnitForm] = useState<CreateBusinessUnitInput>({
    code: "",
    name: "",
    category: "retail_waserda",
    description: "",
    picName: "",
    picPhone: "",
    operationalLocation: "",
  });

  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<BusinessUnit | null>(null);

  const [editingUnit, setEditingUnit] = useState<BusinessUnit | null>(null);
  const [editUnitForm, setEditUnitForm] = useState<UpdateBusinessUnitInput>({});

  const [deactivatingUnit, setDeactivatingUnit] = useState<BusinessUnit | null>(null);
  const [deactivationReason, setDeactivationReason] = useState("");

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState<RecordActivityInput>({
    unitId: "",
    activityDate: new Date().toISOString().split("T")[0],
    activityType: "sales",
    description: "",
    quantity: undefined,
    unitOfMeasure: "",
    amount: 0,
    memberDemoId: "",
    notes: "",
  });

  const [selectedActivityDetail, setSelectedActivityDetail] =
    useState<UnitActivityRecord | null>(null);
  const [cancellingActivity, setCancellingActivity] =
    useState<UnitActivityRecord | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  // Select Option Arrays
  const portfolioCategoryOptions: SelectOption[] = [
    { value: "all", label: "Semua Kategori Usaha" },
    { value: "retail_waserda", label: "Waserda & Ritel" },
    { value: "agriculture_food", label: "Pertanian & Pangan" },
    { value: "logistics_supply", label: "Logistik & Saprotan" },
    { value: "processing_production", label: "Pengolahan & Produksi" },
    { value: "services", label: "Jasa & Persewaan" },
    { value: "other", label: "Lainnya" },
  ];

  const portfolioStatusOptions: SelectOption[] = [
    { value: "all", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
  ];

  const activityUnitOptions: SelectOption[] = [
    { value: "all", label: "Semua Unit Usaha" },
    ...businessUnits.map((u) => ({
      value: u.id,
      label: `${u.name} (${u.code})`,
    })),
  ];

  const activityTypeOptions: SelectOption[] = [
    { value: "all", label: "Semua Jenis Aktivitas" },
    { value: "sales", label: "Penjualan Retail" },
    { value: "purchase", label: "Pengadaan Stok" },
    { value: "distribution", label: "Distribusi Barang" },
    { value: "member_supply", label: "Pasokan Anggota" },
    { value: "service", label: "Jasa & Persewaan" },
    { value: "operational_expense", label: "Beban Operasional" },
  ];

  const activityStatusOptions: SelectOption[] = [
    { value: "all", label: "Semua Status" },
    { value: "recorded", label: "Tercatat" },
    { value: "verified", label: "Terverifikasi" },
    { value: "cancelled", label: "Dibatalkan" },
  ];

  const createCategoryOptions: SelectOption[] = [
    { value: "retail_waserda", label: "Waserda & Ritel" },
    { value: "agriculture_food", label: "Pertanian & Pangan" },
    { value: "logistics_supply", label: "Logistik & Saprotan" },
    { value: "processing_production", label: "Pengolahan & Produksi" },
    { value: "services", label: "Jasa & Persewaan" },
    { value: "other", label: "Unit Usaha Lainnya" },
  ];

  const activeUnitsForRecording: SelectOption[] = [
    { value: "", label: "-- Pilih Unit Usaha Aktif --" },
    ...businessUnits
      .filter((u) => u.status === "active")
      .map((u) => ({
        value: u.id,
        label: `${u.name} (${u.code})`,
      })),
  ];

  const memberLinkageOptions: SelectOption[] = [
    { value: "none", label: "-- Bukan Transaksi Anggota (Umum) --" },
    ...activeMembers.map((m) => ({
      value: m.demoId || m.id,
      label: `${m.fullName} (${m.demoId || m.memberNumber})`,
    })),
  ];

  // Handlers
  const handleCreateUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = createBusinessUnit(createUnitForm, actor);
      addToast({
        title: "Unit Usaha Berhasil Dibuat",
        message: `Unit usaha ${created.name} (${created.code}) telah didaftarkan ke sistem.`,
        type: "success",
      });
      setIsCreateUnitModalOpen(false);
      setCreateUnitForm({
        code: "",
        name: "",
        category: "retail_waserda",
        description: "",
        picName: "",
        picPhone: "",
        operationalLocation: "",
      });
    } catch (err) {
      addToast({
        title: "Gagal Menambah Unit Usaha",
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
        type: "danger",
      });
    }
  };

  const handleEditUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    try {
      const updated = updateBusinessUnit(editingUnit.id, editUnitForm, actor);
      addToast({
        title: "Data Unit Usaha Diperbarui",
        message: `Informasi unit usaha ${updated.name} berhasil diperbarui.`,
        type: "success",
      });
      setEditingUnit(null);
    } catch (err) {
      addToast({
        title: "Gagal Memperbarui Unit",
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
        type: "danger",
      });
    }
  };

  const handleDeactivateUnit = () => {
    if (!deactivatingUnit) return;
    try {
      deactivateBusinessUnit(deactivatingUnit.id, deactivationReason, actor);
      addToast({
        title: "Unit Usaha Dinonaktifkan",
        message: `Unit usaha ${deactivatingUnit.name} kini berstatus nonaktif. Riwayat data tetap aman.`,
        type: "warning",
      });
      setDeactivatingUnit(null);
      setDeactivationReason("");
    } catch (err) {
      addToast({
        title: "Gagal Menonaktifkan Unit",
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
        type: "danger",
      });
    }
  };

  const handleActivateUnit = (unit: BusinessUnit) => {
    try {
      activateBusinessUnit(unit.id, actor);
      addToast({
        title: "Unit Usaha Diaktifkan Kembali",
        message: `Unit usaha ${unit.name} kini aktif dan siap menerima pencatatan operasional.`,
        type: "success",
      });
    } catch (err) {
      addToast({
        title: "Gagal Mengaktifkan Unit",
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
        type: "danger",
      });
    }
  };

  const handleRecordActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const recorded = recordActivity(
        {
          ...recordForm,
          quantity: recordForm.quantity ? Number(recordForm.quantity) : undefined,
          amount: Number(recordForm.amount),
          memberDemoId: recordForm.memberDemoId === "none" ? undefined : recordForm.memberDemoId,
        },
        actor
      );
      addToast({
        title: "Aktivitas Operasional Berhasil Dicatat",
        message: `Nomor referensi ${recorded.id} telah disimpan dengan status tercatat.`,
        type: "success",
      });
      setIsRecordModalOpen(false);
      setRecordForm({
        unitId: "",
        activityDate: new Date().toISOString().split("T")[0],
        activityType: "sales",
        description: "",
        quantity: undefined,
        unitOfMeasure: "",
        amount: 0,
        memberDemoId: "",
        notes: "",
      });
    } catch (err) {
      addToast({
        title: "Gagal Mencatat Aktivitas",
        message: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "danger",
      });
    }
  };

  const handleVerifyActivity = (activity: UnitActivityRecord) => {
    try {
      verifyActivity(activity.id, actor);
      addToast({
        title: "Aktivitas Terverifikasi",
        message: `Transaksi nomor ${activity.id} berhasil diverifikasi.`,
        type: "success",
      });
    } catch (err) {
      addToast({
        title: "Gagal Memverifikasi Aktivitas",
        message: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "danger",
      });
    }
  };

  const handleCancelActivitySubmit = () => {
    if (!cancellingActivity) return;
    try {
      cancelActivity(cancellingActivity.id, cancellationReason, actor);
      addToast({
        title: "Aktivitas Dibatalkan",
        message: `Transaksi nomor ${cancellingActivity.id} telah dibatalkan.`,
        type: "info",
      });
      setCancellingActivity(null);
      setCancellationReason("");
    } catch (err) {
      addToast({
        title: "Gagal Membatalkan Aktivitas",
        message: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "danger",
      });
    }
  };

  const handleExportCSV = () => {
    if (!canExport) {
      addToast({
        title: "Akses Ditolak",
        message: "Peran Anda tidak memiliki izin ekspor data unit usaha.",
        type: "danger",
      });
      return;
    }

    const headers = [
      "Nomor Referensi",
      "Tanggal",
      "Kode Unit",
      "Nama Unit",
      "Jenis Aktivitas",
      "Deskripsi",
      "Kuantitas",
      "Satuan",
      "Nominal (Rp)",
      "ID Anggota",
      "Nama Anggota",
      "Petugas Pencatat",
      "Status",
    ];

    const rows = activities.map((a) => [
      a.id,
      a.activityDate,
      a.unitCode,
      `"${a.unitName.replace(/"/g, '""')}"`,
      a.activityType,
      `"${a.description.replace(/"/g, '""')}"`,
      a.quantity ?? "",
      a.unitOfMeasure ?? "",
      a.amount,
      a.memberDemoId ?? "",
      a.memberName ? `"${a.memberName.replace(/"/g, '""')}"` : "",
      `"${a.recordedByName.replace(/"/g, '""')}"`,
      a.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rekapitulasi_Aktivitas_Unit_Usaha_KMB_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: "Ekspor Berhasil",
      message: "Data rekapitulasi aktivitas unit usaha berhasil diunduh.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portofolio Unit Usaha"
        subtitle="Pengelolaan unit bisnis riil, pencatatan transaksi operasional, dan rekapitulasi kinerja omzet koperasi."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Unit Usaha" }]}
        badge={{ text: "Phase 6", variant: "neutral" }}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Ekspor Data
              </Button>
            )}
            {canRecordActivity && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const activeUnitList = businessUnits.filter((u) => u.status === "active");
                  setRecordForm({
                    unitId: activeUnitList[0]?.id || "",
                    activityDate: new Date().toISOString().split("T")[0],
                    activityType: "sales",
                    description: "",
                    quantity: undefined,
                    unitOfMeasure: "",
                    amount: 0,
                    memberDemoId: "",
                    notes: "",
                  });
                  setIsRecordModalOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Catat Aktivitas
              </Button>
            )}
            {canCreateUnit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateUnitModalOpen(true)}
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                Tambah Unit Usaha
              </Button>
            )}
          </div>
        }
      />

      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unit Usaha Aktif"
          value={`${recap.unitSummaries.filter((u) => u.status === "active").length} / ${businessUnits.length}`}
          description="Unit operasional berjalan"
          icon={<ShoppingBag className="w-5 h-5 text-forest-700" />}
        />
        <StatCard
          title="Aktivitas Operasional"
          value={`${recap.verifiedActivities} / ${recap.totalActivities}`}
          description="Terverifikasi dari total transaksi"
          icon={<ClipboardList className="w-5 h-5 text-forest-700" />}
        />
        <StatCard
          title="Penerimaan Bruto (Omzet)"
          value={formatIDR(recap.grossRevenue)}
          description="Penjualan & pendapatan jasa riil"
          icon={<TrendingUp className="w-5 h-5 text-forest-700" />}
        />
        <StatCard
          title="Pengeluaran Pengadaan"
          value={formatIDR(recap.totalExpenditure)}
          description="Stok komoditas & biaya unit"
          icon={<PackageCheck className="w-5 h-5 text-forest-700" />}
        />
      </div>

      {/* 2. Transparency Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-forest-50 border border-forest-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
        <div className="text-xs text-forest-900 leading-relaxed">
          <span className="font-semibold block mb-0.5">
            Prinsip Transparansi & Integritas Finansial Koperasi Digital KMB:
          </span>
          Penerimaan Bruto mencerminkan akumulasi perputaran omzet kotor unit usaha riil non-simpan-pinjam dan{" "}
          <strong className="underline">BUKAN Laba Bersih (Net Profit)</strong> maupun Sisa Hasil Usaha (SHU).
          Perhitungan laba rugi dan alokasi SHU secara akuntansi terintegrasi pada modul akuntansi dan SHU Phase 7.
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-ink-200 space-x-1 sm:space-x-4">
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "portfolio"
              ? "border-forest-700 text-forest-900 bg-forest-50/50 rounded-t-md"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Portofolio Unit Usaha ({businessUnits.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("activities")}
          className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "activities"
              ? "border-forest-700 text-forest-900 bg-forest-50/50 rounded-t-md"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Pencatatan Aktivitas ({activities.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("recap")}
          className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "recap"
              ? "border-forest-700 text-forest-900 bg-forest-50/50 rounded-t-md"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Rekapitulasi Kinerja</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: PORTOFOLIO UNIT USAHA                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-1 lg:col-span-2 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-ink-400" />
                <Input
                  value={portfolioSearch}
                  onChange={(e) => setPortfolioSearch(e.target.value)}
                  placeholder="Cari unit usaha, kode, atau PIC..."
                  className="pl-9 text-xs"
                />
              </div>
              <div>
                <Select
                  value={portfolioCategoryFilter}
                  onChange={(e) => setPortfolioCategoryFilter(e.target.value)}
                  options={portfolioCategoryOptions}
                  className="text-xs"
                />
              </div>
              <div>
                <Select
                  value={portfolioStatusFilter}
                  onChange={(e) => setPortfolioStatusFilter(e.target.value)}
                  options={portfolioStatusOptions}
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Table of Units */}
          <Card>
            <CardHeader className="border-b border-ink-100 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Daftar Portofolio Unit Usaha</CardTitle>
                  <CardDescription className="text-xs">
                    Unit usaha riil koperasi yang aktif beroperasi melayani kebutuhan anggota.
                  </CardDescription>
                </div>
                <Badge variant="neutral" className="text-xs">
                  {filteredUnits.length} Unit Ditampilkan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {filteredUnits.length === 0 ? (
                <EmptyState
                  title="Tidak Ada Unit Usaha"
                  description="Tidak ditemukan unit usaha yang sesuai dengan kriteria filter Anda."
                  className="py-12"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode & Nama Unit</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Lokasi Operasional</TableHead>
                      <TableHead>Penanggung Jawab (PIC)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnits.map((unit) => {
                      const catMeta = BUSINESS_UNIT_CATEGORIES[unit.category];
                      const isActive = unit.status === "active";
                      return (
                        <TableRow key={unit.id} className="hover:bg-ink-50/70">
                          <TableCell>
                            <div className="font-semibold text-ink-900 text-xs sm:text-sm">
                              {unit.name}
                            </div>
                            <div className="text-[11px] font-mono text-ink-500">
                              {unit.code} • ID: {unit.id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={catMeta?.badgeVariant || "neutral"} className="text-[10px]">
                              {catMeta?.label || unit.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-ink-700 max-w-xs truncate">
                            {unit.operationalLocation}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-medium text-ink-900">{unit.picName}</div>
                            <div className="text-[10px] text-ink-500">{unit.picPhone}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isActive ? "success" : "neutral"}
                              dot
                              className="text-[10px]"
                            >
                              {isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUnitForDetail(unit)}
                                title="Lihat detail dan riwayat perubahan"
                                className="h-7 text-xs px-2"
                              >
                                Detail
                              </Button>
                              {canUpdateUnit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingUnit(unit);
                                    setEditUnitForm({
                                      name: unit.name,
                                      category: unit.category,
                                      description: unit.description,
                                      picName: unit.picName,
                                      picPhone: unit.picPhone,
                                      operationalLocation: unit.operationalLocation,
                                    });
                                  }}
                                  title="Ubah data unit"
                                  className="h-7 text-xs px-2"
                                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                                >
                                  Ubah
                                </Button>
                              )}
                              {canDeactivateUnit && (
                                isActive ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setDeactivatingUnit(unit);
                                      setDeactivationReason("");
                                    }}
                                    title="Nonaktifkan unit usaha"
                                    className="h-7 text-xs px-2 text-danger-700 hover:text-danger-800 hover:border-danger-300"
                                    leftIcon={<PowerOff className="w-3.5 h-3.5" />}
                                  >
                                    Nonaktifkan
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActivateUnit(unit)}
                                    title="Aktifkan kembali unit usaha"
                                    className="h-7 text-xs px-2 text-forest-700 hover:text-forest-800"
                                    leftIcon={<Power className="w-3.5 h-3.5" />}
                                  >
                                    Aktifkan
                                  </Button>
                                )
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PENCATATAN AKTIVITAS OPERASIONAL                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "activities" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-ink-400" />
                <Input
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Cari no. trx, deskripsi, anggota..."
                  className="pl-9 text-xs"
                />
              </div>
              <div>
                <Select
                  value={activityUnitFilter}
                  onChange={(e) => setActivityUnitFilter(e.target.value)}
                  options={activityUnitOptions}
                  className="text-xs"
                />
              </div>
              <div>
                <Select
                  value={activityTypeFilter}
                  onChange={(e) => setActivityTypeFilter(e.target.value)}
                  options={activityTypeOptions}
                  className="text-xs"
                />
              </div>
              <div>
                <Select
                  value={activityStatusFilter}
                  onChange={(e) => setActivityStatusFilter(e.target.value)}
                  options={activityStatusOptions}
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Activities Table */}
          <Card>
            <CardHeader className="border-b border-ink-100 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Riwayat Aktivitas Operasional</CardTitle>
                  <CardDescription className="text-xs">
                    Catatan seluruh transaksi pembelian, penjualan, pasokan, dan distribusi harian unit.
                  </CardDescription>
                </div>
                <Badge variant="neutral" className="text-xs">
                  {filteredActivities.length} Aktivitas
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {filteredActivities.length === 0 ? (
                <EmptyState
                  title="Tidak Ada Aktivitas Ditemukan"
                  description="Belum ada transaksi operasional yang sesuai dengan kriteria filter."
                  className="py-12"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Referensi / Tanggal</TableHead>
                      <TableHead>Unit Usaha</TableHead>
                      <TableHead>Aktivitas & Uraian</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead className="text-right">Nominal (Rp)</TableHead>
                      <TableHead>Anggota Terkait</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((act) => {
                      const typeMeta = UNIT_ACTIVITY_TYPES[act.activityType];
                      const isRecorded = act.status === "recorded";
                      const isVerified = act.status === "verified";
                      const isCancelled = act.status === "cancelled";

                      return (
                        <TableRow key={act.id} className="hover:bg-ink-50/70">
                          <TableCell>
                            <div className="font-mono font-semibold text-ink-900 text-xs">
                              {act.id}
                            </div>
                            <div className="text-[11px] text-ink-500">
                              {formatDate(act.activityDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-medium text-ink-900">{act.unitName}</div>
                            <div className="text-[10px] font-mono text-ink-500">{act.unitCode}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={typeMeta?.badgeVariant || "neutral"} className="text-[10px] mb-1">
                              {typeMeta?.label || act.activityType}
                            </Badge>
                            <div className="text-xs text-ink-800 line-clamp-1 max-w-xs">
                              {act.description}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-ink-700">
                            {act.quantity ? `${act.quantity} ${act.unitOfMeasure || ""}` : "—"}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold text-xs text-ink-900">
                            {formatIDR(act.amount)}
                          </TableCell>
                          <TableCell>
                            {act.memberDemoId ? (
                              <div>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-forest-900">
                                  <UserCheck className="w-3.5 h-3.5 text-forest-700" />
                                  <span>{act.memberName || act.memberDemoId}</span>
                                </span>
                                <div className="text-[10px] font-mono text-ink-500">
                                  {act.memberDemoId}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-ink-400">Umum / Non-anggota</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isVerified && (
                              <Badge variant="success" dot className="text-[10px]">
                                Terverifikasi
                              </Badge>
                            )}
                            {isRecorded && (
                              <Badge variant="info" dot className="text-[10px]">
                                Tercatat
                              </Badge>
                            )}
                            {isCancelled && (
                              <Badge variant="danger" dot className="text-[10px]">
                                Dibatalkan
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedActivityDetail(act)}
                                title="Lihat detail aktivitas"
                                className="h-7 text-xs px-2"
                              >
                                Detail
                              </Button>
                              {canVerifyActivity && isRecorded && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleVerifyActivity(act)}
                                  title="Verifikasi keabsahan transaksi"
                                  className="h-7 text-xs px-2"
                                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                >
                                  Verifikasi
                                </Button>
                              )}
                              {canVerifyActivity && !isCancelled && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCancellingActivity(act);
                                    setCancellationReason("");
                                  }}
                                  title="Batalkan transaksi ini"
                                  className="h-7 text-xs px-2 text-danger-700 hover:text-danger-800 hover:border-danger-300"
                                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                                >
                                  Batal
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: REKAPITULASI KINERJA                                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "recap" && (
        <div className="space-y-6">
          {/* Comparison Matrix Table */}
          <Card>
            <CardHeader className="border-b border-ink-100 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Matriks Rekapitulasi Kinerja per Unit Usaha</CardTitle>
                  <CardDescription className="text-xs">
                    Perbandingan perputaran omzet bruto penerimaan, beban pengadaan, dan volume barang antar unit.
                  </CardDescription>
                </div>
                {canExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    leftIcon={<Download className="w-4 h-4" />}
                    className="text-xs"
                  >
                    Unduh CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Unit</TableHead>
                    <TableHead>Nama Unit Usaha</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Jumlah Trx</TableHead>
                    <TableHead className="text-right">Penerimaan Bruto (Omzet)</TableHead>
                    <TableHead className="text-right">Pengeluaran Pengadaan</TableHead>
                    <TableHead className="text-right">Volume Barang</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recap.unitSummaries.map((u) => {
                    const catMeta = BUSINESS_UNIT_CATEGORIES[u.category];
                    return (
                      <TableRow key={u.unitId} className="hover:bg-ink-50/70">
                        <TableCell className="font-mono text-xs font-semibold text-ink-700">
                          {u.code}
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm text-ink-900">
                          {u.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={catMeta?.badgeVariant || "neutral"} className="text-[10px]">
                            {catMeta?.label || u.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.status === "active" ? "success" : "neutral"}
                            dot
                            className="text-[10px]"
                          >
                            {u.status === "active" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          {u.transactionCount}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-xs text-forest-800">
                          {formatIDR(u.grossRevenue)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-xs text-ink-800">
                          {formatIDR(u.totalExpenditure)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-ink-700">
                          {u.volume > 0 ? u.volume.toLocaleString("id-ID") : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Aggregated Totals Row */}
                  <TableRow className="bg-ink-50 font-bold border-t-2 border-ink-200">
                    <TableCell colSpan={4} className="text-ink-900 text-xs sm:text-sm">
                      Total Akumulasi Seluruh Unit Usaha
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-ink-900">
                      {recap.unitSummaries.reduce((acc, u) => acc + u.transactionCount, 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-forest-800">
                      {formatIDR(recap.grossRevenue)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-ink-900">
                      {formatIDR(recap.totalExpenditure)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-ink-900">
                      {recap.totalVolume.toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Member Economic Participation Aggregation Summary Box (Phase 7 readiness) */}
          <Card className="border-forest-200 bg-forest-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-forest-700" />
                <CardTitle className="text-base text-forest-900">
                  Agregasi Keterlibatan Ekonomi Anggota (Kesiapan SHU Phase 7)
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-forest-800">
                Pencatatan transaksi anggota di unit ritel/waserda dan sentra pasokan komoditas otomatis
                tercatat sebagai dasar perhitungan pembagian Sisa Hasil Usaha (SHU) Jasa Usaha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-lg border border-forest-100 space-y-1">
                  <span className="text-ink-500 font-medium">Anggota Terlibat Aktif</span>
                  <div className="text-lg font-bold font-mono text-forest-900">
                    {recap.memberInvolvementCount} Orang
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-forest-100 space-y-1">
                  <span className="text-ink-500 font-medium">Status Data Partisipasi</span>
                  <div className="text-sm font-semibold text-forest-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-600" />
                    <span>Tervalidasi & Siap Digunakan Phase 7</span>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-forest-100 space-y-1">
                  <span className="text-ink-500 font-medium">Integritas Keuangan</span>
                  <div className="text-sm font-semibold text-ink-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-600" />
                    <span>Nol Mutasi Saldo Simpanan / Pinjaman</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: TAMBAH UNIT USAHA BARU                               */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isCreateUnitModalOpen}
        onClose={() => setIsCreateUnitModalOpen(false)}
        title="Tambah Unit Usaha Baru"
        description="Daftarkan entitas unit bisnis operasional baru di lingkungan Koperasi Digital KMB."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUnitSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">
                Kode Unit <span className="text-danger-600">*</span>
              </label>
              <Input
                value={createUnitForm.code}
                onChange={(e) =>
                  setCreateUnitForm({ ...createUnitForm, code: e.target.value.toUpperCase() })
                }
                placeholder="Misal: WSR-02, LOG-02"
                className="text-xs font-mono uppercase"
                required
              />
              <span className="text-[10px] text-ink-500">Kode unik pengenal unit usaha</span>
            </div>
            <div>
              <Select
                label="Kategori Usaha *"
                value={createUnitForm.category}
                onChange={(e) =>
                  setCreateUnitForm({
                    ...createUnitForm,
                    category: e.target.value as BusinessUnitCategory,
                  })
                }
                options={createCategoryOptions}
                className="text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Nama Unit Usaha <span className="text-danger-600">*</span>
            </label>
            <Input
              value={createUnitForm.name}
              onChange={(e) => setCreateUnitForm({ ...createUnitForm, name: e.target.value })}
              placeholder="Misal: Waserda KMB Mart Cabang Selatan"
              className="text-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Deskripsi & Lingkup Kegiatan <span className="text-danger-600">*</span>
            </label>
            <Textarea
              value={createUnitForm.description}
              onChange={(e) =>
                setCreateUnitForm({ ...createUnitForm, description: e.target.value })
              }
              placeholder="Jelaskan jenis komoditas atau layanan yang disediakan..."
              rows={3}
              className="text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">
                Nama Penanggung Jawab (PIC) <span className="text-danger-600">*</span>
              </label>
              <Input
                value={createUnitForm.picName}
                onChange={(e) => setCreateUnitForm({ ...createUnitForm, picName: e.target.value })}
                placeholder="Nama staf penanggung jawab"
                className="text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">
                Kontak PIC (No. Telp / HP) <span className="text-danger-600">*</span>
              </label>
              <Input
                value={createUnitForm.picPhone}
                onChange={(e) => setCreateUnitForm({ ...createUnitForm, picPhone: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Lokasi Operasional <span className="text-danger-600">*</span>
            </label>
            <Input
              value={createUnitForm.operationalLocation}
              onChange={(e) =>
                setCreateUnitForm({ ...createUnitForm, operationalLocation: e.target.value })
              }
              placeholder="Alamat fisik toko/gudang/workshop..."
              className="text-xs"
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-ink-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateUnitModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Unit Usaha
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: UBAH INFORMASI UNIT USAHA                            */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={Boolean(editingUnit)}
        onClose={() => setEditingUnit(null)}
        title="Ubah Data Unit Usaha"
        description={`Perbarui informasi operasional untuk unit "${editingUnit?.name}".`}
        maxWidth="lg"
      >
        <form onSubmit={handleEditUnitSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">Nama Unit Usaha</label>
            <Input
              value={editUnitForm.name || ""}
              onChange={(e) => setEditUnitForm({ ...editUnitForm, name: e.target.value })}
              className="text-xs"
              required
            />
          </div>

          <div>
            <Select
              label="Kategori Usaha"
              value={editUnitForm.category || "retail_waserda"}
              onChange={(e) =>
                setEditUnitForm({
                  ...editUnitForm,
                  category: e.target.value as BusinessUnitCategory,
                })
              }
              options={createCategoryOptions}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">Deskripsi</label>
            <Textarea
              value={editUnitForm.description || ""}
              onChange={(e) =>
                setEditUnitForm({ ...editUnitForm, description: e.target.value })
              }
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">
                Penanggung Jawab (PIC)
              </label>
              <Input
                value={editUnitForm.picName || ""}
                onChange={(e) => setEditUnitForm({ ...editUnitForm, picName: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">Kontak PIC</label>
              <Input
                value={editUnitForm.picPhone || ""}
                onChange={(e) => setEditUnitForm({ ...editUnitForm, picPhone: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">Lokasi Operasional</label>
            <Input
              value={editUnitForm.operationalLocation || ""}
              onChange={(e) =>
                setEditUnitForm({ ...editUnitForm, operationalLocation: e.target.value })
              }
              className="text-xs"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-ink-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingUnit(null)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: NONAKTIFKAN UNIT USAHA                               */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={Boolean(deactivatingUnit)}
        onClose={() => setDeactivatingUnit(null)}
        title="Konfirmasi Penonaktifan Unit Usaha"
        description="Unit yang dinonaktifkan tidak dapat menerima transaksi operasional baru, namun seluruh data historis dan laporan tetap tersimpan utuh."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              Anda akan menonaktifkan unit usaha:{" "}
              <strong>{deactivatingUnit?.name} ({deactivatingUnit?.code})</strong>.
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Alasan Penonaktifan <span className="text-danger-600">*</span>
            </label>
            <Textarea
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
              placeholder="Misal: Peremajaan peralatan, evaluasi komersial tahunan, atau relokasi..."
              rows={3}
              className="text-xs"
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-ink-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeactivatingUnit(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={deactivationReason.trim().length < 3}
              onClick={handleDeactivateUnit}
            >
              Ya, Nonaktifkan Unit
            </Button>
          </div>
        </div>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: CATAT AKTIVITAS OPERASIONAL                          */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Pencatatan Aktivitas Operasional"
        description="Catat transaksi penjualan ritel, pasokan anggota, pengadaan stok, atau biaya operasional unit."
        maxWidth="lg"
      >
        <form onSubmit={handleRecordActivitySubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Select
                label="Unit Usaha Pelaksana *"
                value={recordForm.unitId}
                onChange={(e) => setRecordForm({ ...recordForm, unitId: e.target.value })}
                options={activeUnitsForRecording}
                className="text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">
                Tanggal Aktivitas <span className="text-danger-600">*</span>
              </label>
              <Input
                type="date"
                value={recordForm.activityDate}
                onChange={(e) => setRecordForm({ ...recordForm, activityDate: e.target.value })}
                className="text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Select
                label="Jenis Aktivitas *"
                value={recordForm.activityType}
                onChange={(e) =>
                  setRecordForm({
                    ...recordForm,
                    activityType: e.target.value as UnitActivityType,
                  })
                }
                options={[
                  { value: "sales", label: "Penjualan Retail / Produk" },
                  { value: "service", label: "Pendapatan Jasa / Persewaan" },
                  { value: "purchase", label: "Pengadaan Stok / Bahan Baku" },
                  { value: "distribution", label: "Distribusi Saprotan" },
                  { value: "member_supply", label: "Pasokan Komoditas dari Anggota" },
                  { value: "operational_expense", label: "Beban Operasional Rutin" },
                ]}
                className="text-xs"
                required
              />
            </div>
            <div>
              <Select
                label="Keterkaitan Anggota (Opsional)"
                value={recordForm.memberDemoId || "none"}
                onChange={(e) => setRecordForm({ ...recordForm, memberDemoId: e.target.value })}
                options={memberLinkageOptions}
                className="text-xs"
                helperText="Pilih anggota jika transaksi berkaitan dengan belanja atau pasokan komoditas anggota."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Uraian Deskripsi Aktivitas <span className="text-danger-600">*</span>
            </label>
            <Input
              value={recordForm.description}
              onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
              placeholder="Misal: Belanja sembako bulanan, pasokan gabah kering giling, beli minyak goreng grosir..."
              className="text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">Kuantitas</label>
              <Input
                type="number"
                min="0.1"
                step="any"
                value={recordForm.quantity ?? ""}
                onChange={(e) =>
                  setRecordForm({
                    ...recordForm,
                    quantity: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Misal: 10, 250"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">Satuan</label>
              <Input
                value={recordForm.unitOfMeasure || ""}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, unitOfMeasure: e.target.value })
                }
                placeholder="kg, liter, sak, paket, pcs"
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-800 block mb-1">
                Nilai Nominal (Rp) <span className="text-danger-600">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={recordForm.amount || ""}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, amount: Number(e.target.value) })
                }
                placeholder="Jumlah rupiah"
                className="text-xs font-mono font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">Catatan / Bukti Transaksi</label>
            <Input
              value={recordForm.notes || ""}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
              placeholder="No. Struk POS / Surat Jalan / Kwitansi"
              className="text-xs"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-ink-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRecordModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Pencatatan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: DETAIL UNIT USAHA & AUDIT TRAIL                      */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={Boolean(selectedUnitForDetail)}
        onClose={() => setSelectedUnitForDetail(null)}
        title="Detail Unit Usaha & Riwayat Perubahan"
        description="Profil operasional dan rekaman audit penanggung jawab unit."
        maxWidth="lg"
      >
        {selectedUnitForDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-ink-50 text-xs">
              <div>
                <span className="text-ink-500 font-medium block">Nama & Kode Unit</span>
                <span className="text-ink-900 font-semibold block text-sm">
                  {selectedUnitForDetail.name} ({selectedUnitForDetail.code})
                </span>
              </div>
              <div>
                <span className="text-ink-500 font-medium block">Status Operasional</span>
                <Badge
                  variant={selectedUnitForDetail.status === "active" ? "success" : "neutral"}
                  dot
                  className="text-[10px] mt-0.5"
                >
                  {selectedUnitForDetail.status === "active" ? "Aktif Beroperasi" : "Nonaktif"}
                </Badge>
              </div>
              <div>
                <span className="text-ink-500 font-medium block">Kategori</span>
                <span className="text-ink-800 font-medium">
                  {BUSINESS_UNIT_CATEGORIES[selectedUnitForDetail.category]?.label}
                </span>
              </div>
              <div>
                <span className="text-ink-500 font-medium block">Lokasi</span>
                <span className="text-ink-800 font-medium">{selectedUnitForDetail.operationalLocation}</span>
              </div>
              <div>
                <span className="text-ink-500 font-medium block">Penanggung Jawab (PIC)</span>
                <span className="text-ink-800 font-medium">{selectedUnitForDetail.picName}</span>
              </div>
              <div>
                <span className="text-ink-500 font-medium block">Kontak PIC</span>
                <span className="text-ink-800 font-medium">{selectedUnitForDetail.picPhone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-ink-500 font-medium block">Deskripsi Kegiatan</span>
                <span className="text-ink-800">{selectedUnitForDetail.description}</span>
              </div>
            </div>

            {/* Change History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ink-500" />
                <span>Riwayat Perubahan & Audit Log ({selectedUnitForDetail.history.length})</span>
              </h4>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {selectedUnitForDetail.history.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg border border-ink-100 bg-white text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-ink-500">
                      <span>{formatDate(log.timestamp, "d MMM yyyy, HH.mm")}</span>
                      <Badge variant="neutral" className="text-[10px]">
                        {log.actorName} ({log.actorRole})
                      </Badge>
                    </div>
                    <div className="text-ink-800 font-medium">{log.details}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-ink-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUnitForDetail(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 6: DETAIL AKTIVITAS                                     */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={Boolean(selectedActivityDetail)}
        onClose={() => setSelectedActivityDetail(null)}
        title="Rincian Aktivitas Operasional"
        description="Detail lengkap pencatatan transaksi unit usaha."
        maxWidth="md"
      >
        {selectedActivityDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-lg bg-ink-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-ink-900">
                  {selectedActivityDetail.id}
                </span>
                <Badge
                  variant={
                    selectedActivityDetail.status === "verified"
                      ? "success"
                      : selectedActivityDetail.status === "cancelled"
                      ? "danger"
                      : "info"
                  }
                  dot
                >
                  {selectedActivityDetail.status}
                </Badge>
              </div>
              <div className="border-t border-ink-200 pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-ink-500 block text-[11px]">Tanggal</span>
                  <span className="font-medium text-ink-900">
                    {formatDate(selectedActivityDetail.activityDate)}
                  </span>
                </div>
                <div>
                  <span className="text-ink-500 block text-[11px]">Unit Usaha</span>
                  <span className="font-medium text-ink-900">
                    {selectedActivityDetail.unitName} ({selectedActivityDetail.unitCode})
                  </span>
                </div>
                <div>
                  <span className="text-ink-500 block text-[11px]">Jenis Aktivitas</span>
                  <span className="font-medium text-ink-900">
                    {UNIT_ACTIVITY_TYPES[selectedActivityDetail.activityType]?.label}
                  </span>
                </div>
                <div>
                  <span className="text-ink-500 block text-[11px]">Nominal Transaksi</span>
                  <span className="font-mono font-bold text-forest-800 text-sm">
                    {formatIDR(selectedActivityDetail.amount)}
                  </span>
                </div>
                {selectedActivityDetail.quantity && (
                  <div>
                    <span className="text-ink-500 block text-[11px]">Volume / Kuantitas</span>
                    <span className="font-medium text-ink-900">
                      {selectedActivityDetail.quantity} {selectedActivityDetail.unitOfMeasure}
                    </span>
                  </div>
                )}
                {selectedActivityDetail.memberDemoId && (
                  <div>
                    <span className="text-ink-500 block text-[11px]">Anggota Terlibat</span>
                    <span className="font-medium text-forest-800">
                      {selectedActivityDetail.memberName} ({selectedActivityDetail.memberDemoId})
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t border-ink-200 pt-2">
                <span className="text-ink-500 block text-[11px]">Uraian Deskripsi</span>
                <p className="text-ink-900 mt-0.5">{selectedActivityDetail.description}</p>
              </div>
              {selectedActivityDetail.notes && (
                <div className="border-t border-ink-200 pt-2">
                  <span className="text-ink-500 block text-[11px]">Catatan / No. Bukti</span>
                  <p className="text-ink-900 mt-0.5">{selectedActivityDetail.notes}</p>
                </div>
              )}
              {selectedActivityDetail.cancellationReason && (
                <div className="border-t border-ink-200 pt-2 bg-danger-50 p-2 rounded">
                  <span className="text-danger-700 font-semibold block text-[11px]">Alasan Pembatalan</span>
                  <p className="text-danger-900 mt-0.5">{selectedActivityDetail.cancellationReason}</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border border-ink-100 rounded-lg space-y-1 text-[11px] text-ink-600">
              <div>
                Petugas Pencatat: <strong>{selectedActivityDetail.recordedByName}</strong> ({selectedActivityDetail.recordedByRole})
              </div>
              {selectedActivityDetail.verifiedByName && (
                <div>
                  Diverifikasi Oleh: <strong>{selectedActivityDetail.verifiedByName}</strong> pada{" "}
                  {formatDate(selectedActivityDetail.verifiedAt || "", "d MMM yyyy, HH.mm")}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedActivityDetail(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 7: KONFIRMASI PEMBATALAN AKTIVITAS                      */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={Boolean(cancellingActivity)}
        onClose={() => setCancellingActivity(null)}
        title="Batalkan Aktivitas Operasional"
        description="Aktivitas yang dibatalkan akan ditandai berstatus cancelled dan tidak lagi diperhitungkan dalam rekapitulasi keuangan."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
            Anda akan membatalkan transaksi:{" "}
            <strong>{cancellingActivity?.id} ({cancellingActivity?.description})</strong>.
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-800 block mb-1">
              Alasan Pembatalan Transaksi <span className="text-danger-600">*</span>
            </label>
            <Textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Misal: Salah input nominal, barang diretur oleh pembeli, transaksi duplikat..."
              rows={3}
              className="text-xs"
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-ink-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancellingActivity(null)}
            >
              Kembali
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={cancellationReason.trim().length < 3}
              onClick={handleCancelActivitySubmit}
            >
              Ya, Batalkan Transaksi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
