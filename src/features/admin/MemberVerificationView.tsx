import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import {
  ApplicationStatus,
  MembershipApplication,
  VerificationChecklist,
} from "@/features/membership/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  FileCheck2,
  Send,
  Search,
  ShieldCheck,
  ShieldAlert,
  Info,
} from "lucide-react";

export const MemberVerificationView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const {
    applications,
    startStaffReview,
    updateChecklist,
    requestRevision,
    recommendApplication,
    approveApplication,
    rejectApplication,
  } = useMembershipStore();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(null);

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isApproveConfirmModalOpen, setIsApproveConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Form states inside modals
  const [tempChecklist, setTempChecklist] = useState<VerificationChecklist>({
    identityVerified: false,
    biodataVerified: false,
    commitmentVerified: false,
    adArtVerified: false,
  });
  const [staffNotesInput, setStaffNotesInput] = useState("");
  const [revisionReasonInput, setRevisionReasonInput] = useState("");
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [managerNotesInput, setManagerNotesInput] = useState("");

  // Role authority flags (Separation of Duties - Seksi 5.4)
  const isStaff = currentUser.role === "staff";
  const isManager = currentUser.role === "manager";
  const isAuditor = currentUser.role === "auditor";
  const isAdminOrSuper = currentUser.role === "admin" || currentUser.role === "super_admin";

  const handleOpenDetail = (app: MembershipApplication) => {
    setSelectedApp(app);
    setTempChecklist(app.checklist);
    setStaffNotesInput(app.staffNotes || "");
    setIsDetailModalOpen(true);
  };

  const handleToggleChecklist = (key: keyof VerificationChecklist) => {
    if (!isStaff) return;
    const updated = { ...tempChecklist, [key]: !tempChecklist[key] };
    setTempChecklist(updated);
    if (selectedApp) {
      updateChecklist(selectedApp.id, updated, staffNotesInput);
    }
  };

  const handleStartReview = () => {
    if (!selectedApp) return;
    const res = startStaffReview(selectedApp.id);
    if (res.success) {
      addToast({
        type: "info",
        title: "Pemeriksaan Berkas Dimulai",
        message: "Status berkas kini dalam peninjauan verifikator.",
      });
      // Refresh current selectedApp reference
      const updated = applications.find((a) => a.id === selectedApp.id);
      if (updated) setSelectedApp({ ...updated, status: "under_review" });
    } else {
      addToast({ type: "danger", title: "Gagal", message: res.error || "Operasi gagal." });
    }
  };

  const handleSendRevision = () => {
    if (!selectedApp || !revisionReasonInput.trim()) return;
    const res = requestRevision(
      selectedApp.id,
      revisionReasonInput.trim()
    );
    if (res.success) {
      addToast({
        type: "warning",
        title: "Permintaan Perbaikan Terkirim",
        message: "Pemohon telah menerima notifikasi catatan perbaikan berkas.",
      });
      setIsRevisionModalOpen(false);
      setIsDetailModalOpen(false);
    } else {
      addToast({ type: "danger", title: "Gagal", message: res.error || "Operasi gagal." });
    }
  };

  const handleSendRecommendation = () => {
    if (!selectedApp) return;
    const res = recommendApplication(
      selectedApp.id,
      staffNotesInput.trim()
    );
    if (res.success) {
      addToast({
        type: "success",
        title: "Rekomendasi Staf Diterbitkan",
        message:
          "Berkas telah memenuhi syarat dan berhasil diteruskan ke Pengurus/Manajer untuk persetujuan final.",
      });
      setIsDetailModalOpen(false);
    } else {
      addToast({ type: "danger", title: "Gagal", message: res.error || "Operasi gagal." });
    }
  };

  const handleConfirmApproval = () => {
    if (!selectedApp) return;
    const res = approveApplication(
      selectedApp.id,
      managerNotesInput.trim()
    );
    if (res.success) {
      addToast({
        type: "success",
        title: "Persetujuan Keanggotaan Berhasil",
        message: `Pengurus menyetujui. Nomor Anggota ${res.memberNumber} diterbitkan otomatis dan dicatat di Buku Induk.`,
      });
      setIsApproveConfirmModalOpen(false);
      setIsDetailModalOpen(false);
    } else {
      addToast({ type: "danger", title: "Persetujuan Ditolak", message: res.error || "Gagal menyetujui." });
    }
  };

  const handleConfirmRejection = () => {
    if (!selectedApp || !rejectionReasonInput.trim()) return;
    const res = rejectApplication(
      selectedApp.id,
      rejectionReasonInput.trim()
    );
    if (res.success) {
      addToast({
        type: "info",
        title: "Permohonan Ditolak",
        message: "Status permohonan telah diperbarui menjadi Ditolak oleh Pengurus.",
      });
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
    } else {
      addToast({ type: "danger", title: "Gagal", message: res.error || "Operasi gagal." });
    }
  };

  // Status Filter Logic
  const filteredApps = applications.filter((app) => {
    // Search query matching
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      app.fullName.toLowerCase().includes(q) ||
      app.demoId.toLowerCase().includes(q) ||
      app.trackingCode.toLowerCase().includes(q) ||
      app.city.toLowerCase().includes(q);

    if (!matchQuery) return false;

    if (activeTab === "all") return true;
    if (activeTab === "pending") return app.status === "submitted";
    if (activeTab === "review") return app.status === "under_review";
    if (activeTab === "revision") return app.status === "revision_required";
    if (activeTab === "recommended") return app.status === "recommended";
    if (activeTab === "approved") return app.status === "approved";
    if (activeTab === "rejected") return app.status === "rejected";
    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "submitted":
        return <Badge variant="neutral">Menunggu Verifikasi</Badge>;
      case "under_review":
        return <Badge variant="warning">Sedang Diperiksa</Badge>;
      case "revision_required":
        return <Badge variant="danger">Perlu Revisi</Badge>;
      case "recommended":
        return <Badge variant="forest">Rekomendasi Staf</Badge>;
      case "approved":
        return <Badge variant="success">Disetujui Pengurus</Badge>;
      case "rejected":
        return <Badge variant="neutral">Ditolak Pengurus</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Metrics count
  const countPending = applications.filter((a) => a.status === "submitted").length;
  const countReview = applications.filter((a) => a.status === "under_review").length;
  const countRevision = applications.filter((a) => a.status === "revision_required").length;
  const countRecommended = applications.filter((a) => a.status === "recommended").length;
  const countApproved = applications.filter((a) => a.status === "approved").length;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header with SoD Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-ink-900">
              Verifikasi & Persetujuan Keanggotaan
            </h1>
            <Badge variant="forest" size="sm">Modul Bisnis</Badge>
          </div>
          <p className="text-xs text-ink-600">
            Pemisahan 5 Tahap: Pemeriksaan Kelengkapan → Verifikasi Format Demo → Rekomendasi Staf → Persetujuan Final Pengurus → Penerbitan Nomor Anggota
          </p>
        </div>

        {/* Current Role SoD Status Badge */}
        <div className="shrink-0">
          {isStaff && (
            <Badge variant="forest" size="md" className="gap-1.5 py-1 px-3">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              Kewenangan: Verifikasi & Rekomendasi Staf
            </Badge>
          )}
          {isManager && (
            <Badge variant="success" size="md" className="gap-1.5 py-1 px-3">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Kewenangan: Otoritas Persetujuan Final Pengurus
            </Badge>
          )}
          {isAuditor && (
            <Badge variant="neutral" size="md" className="gap-1.5 py-1 px-3">
              <Eye className="w-4 h-4 text-ink-600" />
              Auditor: Mode Inspeksi Read-Only
            </Badge>
          )}
          {isAdminOrSuper && (
            <Badge variant="warning" size="md" className="gap-1.5 py-1 px-3">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Admin Sistem: Tanpa Otoritas Organisasi (SoD)
            </Badge>
          )}
        </div>
      </div>

      {/* SoD Context Explanation Card */}
      <div className="p-4 bg-forest-50/60 border border-forest-200 rounded-lg flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-forest-900">
          <p className="font-bold">
            Pemisahan Kewenangan (Separation of Duties — BR-01.2 & Catatan Kaki 2):
          </p>
          <p className="text-ink-700 leading-relaxed">
            Staf Operasional berwenang memverifikasi kelengkapan berkas dan memberikan rekomendasi, namun <strong>dilarang menyetujui atau menolak final</strong>.
            Persetujuan final dan penerbitan Nomor Anggota resmi adalah <strong>wewenang mutlak Pengurus / Manajer</strong>.
            Administrator Sistem murni mengelola aspek teknis dan tidak memiliki hak veto keanggotaan.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white border border-ink-200 rounded-lg">
          <span className="text-[11px] text-ink-500 block">Menunggu Staf</span>
          <span className="text-lg font-bold text-ink-900">{countPending}</span>
        </div>
        <div className="p-3 bg-white border border-ink-200 rounded-lg">
          <span className="text-[11px] text-ink-500 block">Sedang Diperiksa</span>
          <span className="text-lg font-bold text-amber-600">{countReview}</span>
        </div>
        <div className="p-3 bg-white border border-ink-200 rounded-lg">
          <span className="text-[11px] text-ink-500 block">Perlu Revisi</span>
          <span className="text-lg font-bold text-rose-600">{countRevision}</span>
        </div>
        <div className="p-3 bg-white border border-forest-300 bg-forest-50/40 rounded-lg">
          <span className="text-[11px] text-forest-800 font-medium block">
            Antrean Pengurus
          </span>
          <span className="text-lg font-bold text-forest-900">{countRecommended}</span>
        </div>
        <div className="p-3 bg-white border border-ink-200 rounded-lg col-span-2 sm:col-span-1">
          <span className="text-[11px] text-ink-500 block">Telah Disetujui</span>
          <span className="text-lg font-bold text-emerald-700">{countApproved}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="bg-white border-ink-200">
        <div className="p-4 border-b border-ink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { key: "all", label: "Semua Permohonan" },
              { key: "pending", label: `Menunggu (${countPending})` },
              { key: "review", label: `Diperiksa (${countReview})` },
              { key: "revision", label: `Perlu Revisi (${countRevision})` },
              { key: "recommended", label: `Antrean Pengurus (${countRecommended})` },
              { key: "approved", label: `Disetujui (${countApproved})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-forest-800 text-white"
                    : "bg-ink-50 hover:bg-ink-100 text-ink-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, ID Demo, kode..."
              className="w-full pl-9 pr-3 py-1.5 bg-ink-50 border border-ink-200 rounded-md text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-forest-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode & ID Demo</TableHead>
              <TableHead>Nama Calon Anggota</TableHead>
              <TableHead>Domisili & Pekerjaan</TableHead>
              <TableHead>Tanggal Masuk</TableHead>
              <TableHead>Status Permohonan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-ink-500">
                  Tidak ada data permohonan yang sesuai filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredApps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-mono text-xs font-bold text-forest-800">
                      {app.trackingCode}
                    </div>
                    <div className="font-mono text-[11px] text-ink-400">
                      {app.demoId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-ink-900">{app.fullName}</div>
                    <div className="text-[11px] text-ink-500">{app.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-ink-800">{app.city}</div>
                    <div className="text-[11px] text-ink-500">{app.occupation}</div>
                  </TableCell>
                  <TableCell className="text-xs text-ink-600">
                    {new Date(app.submissionDate).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={
                        isManager && app.status === "recommended"
                          ? "primary"
                          : isStaff && (app.status === "submitted" || app.status === "under_review")
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleOpenDetail(app)}
                      className="gap-1.5"
                    >
                      {isManager && app.status === "recommended" ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" /> Putuskan
                        </>
                      ) : isStaff && (app.status === "submitted" || app.status === "under_review") ? (
                        <>
                          <FileCheck2 className="w-3.5 h-3.5" /> Periksa
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detailed Review & Decision Modal */}
      {selectedApp && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detail Permohonan: ${selectedApp.fullName}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-left py-2 text-xs">
            {/* Applicant Summary */}
            <div className="p-4 bg-ink-50 border border-ink-200 rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-ink-500 block">Kode Registrasi:</span>
                <span className="font-mono font-bold text-forest-800">
                  {selectedApp.trackingCode}
                </span>
              </div>
              <div>
                <span className="text-ink-500 block">ID Demonstrasi:</span>
                <span className="font-mono font-medium text-ink-900">
                  {selectedApp.demoId}
                </span>
              </div>
              <div>
                <span className="text-ink-500 block">Status Saat Ini:</span>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>
              <div>
                <span className="text-ink-500 block">Nomor Telepon:</span>
                <span className="text-ink-900">{selectedApp.phone}</span>
              </div>
              <div>
                <span className="text-ink-500 block">Kota Domisili:</span>
                <span className="text-ink-900">{selectedApp.city}</span>
              </div>
              <div>
                <span className="text-ink-500 block">Pekerjaan:</span>
                <span className="text-ink-900">{selectedApp.occupation}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-ink-500 block">Alamat Lengkap:</span>
                <span className="text-ink-900">{selectedApp.address}</span>
              </div>
            </div>

            {/* Checklist Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-ink-900 uppercase tracking-wider text-[11px]">
                  Checklist Verifikasi Kelengkapan & Kepatuhan
                </h4>
                {isStaff && (
                  <span className="text-[11px] text-forest-700 italic">
                    Centang checklist saat memeriksa dokumen
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {[
                  {
                    key: "identityVerified" as keyof VerificationChecklist,
                    title: "Identitas Demonstrasi Valid (DEMO-ID-XXXX)",
                    desc: "Format demonstrasi sesuai BR-01.2 (dilarang menggunakan format NIK 16 digit).",
                  },
                  {
                    key: "biodataVerified" as keyof VerificationChecklist,
                    title: "Kelengkapan Biodata & Domisili",
                    desc: "Nama lengkap, alamat jalan, kota wilayah operasional telah terisi.",
                  },
                  {
                    key: "commitmentVerified" as keyof VerificationChecklist,
                    title: "Kesepakatan Simpanan Pokok & Wajib",
                    desc: "Pemohon menyetujui setoran simpanan pokok Rp 100.000 dan wajib Rp 50.000/bln.",
                  },
                  {
                    key: "adArtVerified" as keyof VerificationChecklist,
                    title: "Kesepakatan AD/ART Koperasi KMB",
                    desc: "Pernyataan tunduk pada ketentuan anggaran dasar dan keputusan rapat anggota.",
                  },
                ].map((item) => {
                  const isChecked = tempChecklist[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleChecklist(item.key)}
                      className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                        isChecked
                          ? "bg-forest-50/70 border-forest-300"
                          : "bg-white border-ink-200"
                      } ${isStaff ? "cursor-pointer hover:border-forest-400" : "cursor-default"}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        disabled={!isStaff}
                        className="mt-0.5 rounded text-forest-700 focus:ring-forest-600"
                      />
                      <div className="space-y-0.5">
                        <p className={`font-semibold ${isChecked ? "text-forest-900" : "text-ink-800"}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-ink-500">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Staff Notes Area */}
            <div className="space-y-1">
              <label className="font-semibold text-ink-800 text-[11px]">
                Catatan Verifikasi Staf:
              </label>
              {isStaff ? (
                <Textarea
                  value={staffNotesInput}
                  onChange={(e) => setStaffNotesInput(e.target.value)}
                  placeholder="Tuliskan catatan verifikasi kelengkapan berkas untuk Pengurus..."
                  rows={2}
                />
              ) : (
                <div className="p-3 bg-ink-50 border border-ink-200 rounded text-ink-700 italic">
                  {selectedApp.staffNotes || "Belum ada catatan staf."}
                </div>
              )}
            </div>

            {/* Status-specific banners */}
            {selectedApp.status === "revision_required" && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Status: Menunggu Pemohon Memperbaiki Berkas
                </span>
                <p>Alasan revisi yang disampaikan: &quot;{selectedApp.revisionReason}&quot;</p>
              </div>
            )}

            {selectedApp.status === "approved" && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Status: Permohonan Telah Disetujui Pengurus
                </span>
                <p>
                  Nomor Anggota Resmi:{" "}
                  <strong className="font-mono text-sm underline">
                    {selectedApp.approvedMemberNumber}
                  </strong>
                </p>
              </div>
            )}

            {selectedApp.status === "rejected" && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded text-rose-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Status: Ditolak oleh Pengurus
                </span>
                <p>Alasan penolakan: &quot;{selectedApp.rejectionReason}&quot;</p>
              </div>
            )}

            {/* Audit History Log */}
            <div className="space-y-2 pt-2 border-t border-ink-200">
              <h5 className="font-bold text-ink-700 uppercase tracking-wider text-[10px]">
                Jejak Audit Aktivitas Permohonan (BR-01.1)
              </h5>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedApp.history.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 bg-ink-50 rounded border border-ink-200 text-[11px] flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-ink-900">{log.action}</span>
                      <span className="text-ink-500 ml-1">
                        — {log.actorName} ({log.actorRole})
                      </span>
                      {log.notes && (
                        <p className="text-ink-600 italic mt-0.5">&quot;{log.notes}&quot;</p>
                      )}
                    </div>
                    <span className="text-ink-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar based on Role */}
            <div className="pt-4 border-t border-ink-200 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </Button>

              <div className="flex items-center gap-2">
                {/* STAFF ACTIONS */}
                {isStaff && (
                  <>
                    {selectedApp.status === "submitted" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleStartReview}
                        className="gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" /> Mulai Periksa
                      </Button>
                    )}

                    {(selectedApp.status === "under_review" ||
                      selectedApp.status === "submitted") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRevisionReasonInput("");
                            setIsRevisionModalOpen(true);
                          }}
                          className="text-amber-700 border-amber-300 hover:bg-amber-50"
                        >
                          Minta Perbaikan
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSendRecommendation}
                          className="gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Rekomendasikan ke Pengurus
                        </Button>
                      </>
                    )}
                  </>
                )}

                {/* MANAGER ACTIONS (SoD: Board Authority) */}
                {isManager && (
                  <>
                    {selectedApp.status === "recommended" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectionReasonInput("");
                            setIsRejectModalOpen(true);
                          }}
                          className="text-rose-700 border-rose-300 hover:bg-rose-50"
                        >
                          Tolak Permohonan
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setManagerNotesInput("");
                            setIsApproveConfirmModalOpen(true);
                          }}
                          className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Setujui Keanggotaan
                        </Button>
                      </>
                    ) : (
                      selectedApp.status !== "approved" &&
                      selectedApp.status !== "rejected" && (
                        <span className="text-[11px] text-ink-500 italic">
                          Menunggu rekomendasi staf operasional sebelum persetujuan Pengurus.
                        </span>
                      )
                    )}
                  </>
                )}

                {/* ADMIN / SUPER ADMIN SoD WARNING */}
                {isAdminOrSuper && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    Admin tidak memiliki kewenangan organisasi untuk menyetujui (SoD BR-01.2).
                  </span>
                )}

                {/* AUDITOR READ ONLY NOTE */}
                {isAuditor && (
                  <span className="text-[11px] text-ink-500 italic">
                    Mode Read-Only Auditor (Inspeksi Kepatuhan).
                  </span>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Revision Request Modal */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Kirim Permintaan Perbaikan Berkas"
        maxWidth="md"
      >
        <div className="space-y-4 text-left py-2 text-xs">
          <p className="text-ink-600">
            Tuliskan instruksi perbaikan yang jelas kepada pemohon mengenai data atau dokumen yang belum memenuhi persyaratan:
          </p>
          <Textarea
            label="Alasan & Rincian Perbaikan (Wajib)"
            value={revisionReasonInput}
            onChange={(e) => setRevisionReasonInput(e.target.value)}
            placeholder="Contoh: Mohon lengkapi alamat domisili dengan nomor rumah dan RT/RW..."
            rows={3}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRevisionModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendRevision}
              disabled={!revisionReasonInput.trim()}
            >
              Kirim Permintaan ke Pemohon
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manager Approval Confirmation Modal */}
      <Modal
        isOpen={isApproveConfirmModalOpen}
        onClose={() => setIsApproveConfirmModalOpen(false)}
        title="Konfirmasi Persetujuan Final Keanggotaan"
        maxWidth="md"
      >
        <div className="space-y-4 text-left py-2 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 space-y-1">
            <p className="font-bold">Kewenangan Pengurus / Manajer (BR-01.2)</p>
            <p>
              Dengan menyetujui, sistem secara otomatis akan menerbitkan <strong>Nomor Anggota resmi baru</strong>, mengaktifkan status keanggotaan pemohon, dan mencatatkannya dalam Buku Induk Anggota.
            </p>
          </div>

          <Textarea
            label="Catatan Persetujuan Pengurus (Opsional)"
            value={managerNotesInput}
            onChange={(e) => setManagerNotesInput(e.target.value)}
            placeholder="Contoh: Telah memenuhi kriteria keanggotaan dan diverifikasi sah..."
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsApproveConfirmModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmApproval}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Setujui & Terbitkan Nomor Anggota
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manager Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Penolakan Permohonan Keanggotaan"
        maxWidth="md"
      >
        <div className="space-y-4 text-left py-2 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 space-y-1">
            <p className="font-bold">Keputusan Final Penolakan Organisasi</p>
            <p>
              Penolakan ini bersifat final. Alasan penolakan wajib dicantumkan untuk akuntabilitas koperasi.
            </p>
          </div>

          <Textarea
            label="Alasan Penolakan Organisasi (Wajib)"
            value={rejectionReasonInput}
            onChange={(e) => setRejectionReasonInput(e.target.value)}
            placeholder="Contoh: Domisili di luar wilayah layanan operasional koperasi..."
            rows={3}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmRejection}
              disabled={!rejectionReasonInput.trim()}
              className="bg-rose-700 hover:bg-rose-800 text-white"
            >
              Konfirmasi Tolak Permohonan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
