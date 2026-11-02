import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useMembershipStore } from "../stores/membershipStore";
import { ApplicationStatus } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Send,
  Edit3,
} from "lucide-react";
import { useToastStore } from "@/stores/toastStore";

export const ApplicationTrackingView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [query, setQuery] = useState(initialCode);
  const [searchedKey, setSearchedKey] = useState(initialCode);
  const [isEditingRevision, setIsEditingRevision] = useState(false);

  // Revision edit form fields
  const [revisedAddress, setRevisedAddress] = useState("");
  const [revisedCity, setRevisedCity] = useState("");
  const [revisedOccupation, setRevisedOccupation] = useState("");
  const [revisedPhone, setRevisedPhone] = useState("");

  const {
    applications,
    updateApplicantRevision,
    getApplicationByTrackingCode,
    getApplicationByDemoId,
  } = useMembershipStore();
  const { addToast } = useToastStore();

  const matchedApp =
    searchedKey.trim() !== ""
      ? getApplicationByTrackingCode(searchedKey) || getApplicationByDemoId(searchedKey)
      : undefined;

  useEffect(() => {
    if (initialCode) {
      setQuery(initialCode);
      setSearchedKey(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (matchedApp && matchedApp.status === "revision_required") {
      setRevisedAddress(matchedApp.address || "");
      setRevisedCity(matchedApp.city || "");
      setRevisedOccupation(matchedApp.occupation || "");
      setRevisedPhone(matchedApp.phone || "");
    }
  }, [matchedApp]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedKey(query.trim());
    setIsEditingRevision(false);
  };

  const handleQuickSelect = (code: string) => {
    setQuery(code);
    setSearchedKey(code);
    setIsEditingRevision(false);
  };

  const handleSaveRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedApp) return;

    if (!revisedAddress.trim() || !revisedCity.trim() || !revisedOccupation.trim()) {
      addToast({
        type: "danger",
        title: "Data Belum Lengkap",
        message: "Mohon isi seluruh field perbaikan sebelum mengirimkan ulang.",
      });
      return;
    }

    const res = updateApplicantRevision(matchedApp.trackingCode, {
      address: revisedAddress.trim(),
      city: revisedCity.trim(),
      occupation: revisedOccupation.trim(),
      phone: revisedPhone.trim(),
    });

    if (res.success) {
      setIsEditingRevision(false);
      addToast({
        type: "success",
        title: "Perbaikan Berkas Terkirim",
        message:
          "Data berhasil diperbarui. Status permohonan kini kembali ke antrean verifikasi staf.",
      });
    } else {
      addToast({
        type: "danger",
        title: "Gagal Mengirim Perbaikan",
        message: res.error || "Terjadi kesalahan saat menyimpan perbaikan.",
      });
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "submitted":
        return <Badge variant="neutral">Menunggu Verifikasi Staf</Badge>;
      case "under_review":
        return <Badge variant="warning">Sedang Diperiksa Staf</Badge>;
      case "revision_required":
        return <Badge variant="danger">Perlu Perbaikan Berkas</Badge>;
      case "recommended":
        return <Badge variant="forest">Menunggu Persetujuan Pengurus</Badge>;
      case "approved":
        return <Badge variant="success">Disetujui — Anggota Aktif</Badge>;
      case "rejected":
        return <Badge variant="danger">Ditolak Pengurus</Badge>;
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  const steps = [
    {
      num: 1,
      title: "Pendaftaran Dikirim",
      desc: "Formulir & kesepakatan simpanan",
      activeStates: ["submitted", "under_review", "revision_required", "recommended", "approved", "rejected"],
    },
    {
      num: 2,
      title: "Verifikasi Kelengkapan",
      desc: "Pemeriksaan staf operasional",
      activeStates: ["under_review", "revision_required", "recommended", "approved"],
    },
    {
      num: 3,
      title: "Rekomendasi Staf",
      desc: "Penerbitan rekomendasi ke Pengurus",
      activeStates: ["recommended", "approved"],
    },
    {
      num: 4,
      title: "Keputusan Pengurus",
      desc: "Persetujuan final / Penerbitan nomor",
      activeStates: ["approved", "rejected"],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 text-left">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <Badge variant="forest" size="md">
          Portal Pelacakan Calon Anggota
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          Lacak Status Pengajuan Keanggotaan
        </h1>
        <p className="text-xs sm:text-sm text-ink-600">
          Masukkan Kode Registrasi (contoh: <code>REG-801201</code>) atau ID Demonstrasi (contoh: <code>DEMO-ID-0002</code>) untuk memantau proses verifikasi dan persetujuan Pengurus.
        </p>
      </div>

      {/* Search Bar Card */}
      <Card className="bg-white border-ink-200 shadow-subtle p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masukkan Kode Registrasi (REG-xxxxxx) atau ID Demo (DEMO-ID-xxxx)..."
              className="w-full pl-10 pr-4 py-2.5 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
            />
          </div>
          <Button type="submit" variant="primary" size="md" className="shrink-0">
            Cari Status
          </Button>
        </form>

        {/* Quick Demo Pickers */}
        <div className="mt-4 pt-4 border-t border-ink-100 flex flex-wrap items-center gap-2 text-xs text-ink-600">
          <span className="font-medium text-ink-700">Contoh Data Demo:</span>
          {applications.slice(0, 5).map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => handleQuickSelect(app.trackingCode)}
              className="px-2.5 py-1 bg-ink-100 hover:bg-forest-50 hover:text-forest-800 rounded border border-ink-200 text-xs font-mono transition-colors"
            >
              {app.trackingCode} ({app.status})
            </button>
          ))}
        </div>
      </Card>

      {/* Results View */}
      {searchedKey && !matchedApp && (
        <Card className="p-8 text-center bg-white border-ink-200">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-ink-900 mb-1">
            Permohonan Tidak Ditemukan
          </h3>
          <p className="text-xs text-ink-600 max-w-md mx-auto mb-4">
            Tidak ditemukan berkas pendaftaran dengan kode atau ID &quot;{searchedKey}&quot;.
            Pastikan kode yang dimasukkan sesuai format (REG-xxxxxx atau DEMO-ID-xxxx).
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect("REG-801201")}
          >
            Gunakan Contoh Demo (REG-801201)
          </Button>
        </Card>
      )}

      {matchedApp && (
        <div className="space-y-6">
          {/* Main Status Card */}
          <Card className="bg-white border-ink-200 shadow-subtle overflow-hidden">
            <CardHeader className="bg-forest-50/50 border-b border-ink-200 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded">
                      {matchedApp.trackingCode}
                    </span>
                    <span className="text-xs font-mono text-ink-500">
                      ID Demo: {matchedApp.demoId}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-ink-900">
                    {matchedApp.fullName}
                  </CardTitle>
                  <CardDescription className="text-xs text-ink-600 mt-0.5">
                    Tanggal Pengajuan:{" "}
                    {new Date(matchedApp.submissionDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardDescription>
                </div>
                <div>{getStatusBadge(matchedApp.status)}</div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Stepper Progress */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Tahapan Alur Persetujuan (Separation of Duties BR-01.2)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {steps.map((st) => {
                    const isDone = st.activeStates.includes(matchedApp.status);
                    return (
                      <div
                        key={st.num}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          isDone
                            ? "bg-forest-50/60 border-forest-300 text-forest-900"
                            : "bg-ink-50/50 border-ink-200 text-ink-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone
                                ? "bg-forest-700 text-white"
                                : "bg-ink-200 text-ink-600"
                            }`}
                          >
                            {st.num}
                          </span>
                          <span className="text-xs font-bold leading-tight">
                            {st.title}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-80 pl-8">{st.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Specific Alerts */}
              {matchedApp.status === "approved" && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-emerald-900">
                      Selamat! Pengajuan Keanggotaan Telah Disetujui Pengurus
                    </p>
                    <p className="text-emerald-800">
                      Nomor Anggota resmi Anda:{" "}
                      <strong className="font-mono text-sm underline">
                        {matchedApp.approvedMemberNumber}
                      </strong>
                      . Anda kini terdaftar secara sah dalam Buku Induk Anggota KMB.
                    </p>
                    <div className="pt-2">
                      <Link to="/portal">
                        <Button variant="primary" size="sm">
                          Buka Portal Anggota
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {matchedApp.status === "recommended" && (
                <div className="p-4 bg-forest-50 border border-forest-200 rounded-lg flex items-start gap-3">
                  <Clock className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1 text-forest-900">
                    <p className="font-bold">
                      Berkas Lengkap & Direkomendasikan Staf Operasional
                    </p>
                    <p>
                      Staf telah memverifikasi kelengkapan seluruh berkas Anda. Saat ini menunggu keputusan final dan persetujuan dari Pengurus / Manajer Koperasi.
                    </p>
                    {matchedApp.staffNotes && (
                      <p className="italic text-forest-800 bg-white/60 p-2 rounded border border-forest-200 mt-2">
                        Catatan Staf: &quot;{matchedApp.staffNotes}&quot;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {matchedApp.status === "revision_required" && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1 text-amber-900">
                      <p className="font-bold">
                        Staf Verifikator Meminta Perbaikan Berkas
                      </p>
                      <p>
                        Catatan perbaikan:{" "}
                        <strong className="underline">
                          &quot;{matchedApp.revisionReason || matchedApp.staffNotes}&quot;
                        </strong>
                      </p>
                      <p className="text-ink-600">
                        Silakan perbarui data di bawah ini dan klik tombol &quot;Kirimkan Ulang Perbaikan&quot;.
                      </p>
                    </div>
                  </div>

                  {!isEditingRevision ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsEditingRevision(true)}
                      className="gap-2"
                    >
                      <Edit3 className="w-4 h-4" /> Perbaiki Data Sekarang
                    </Button>
                  ) : (
                    <form
                      onSubmit={handleSaveRevision}
                      className="p-4 bg-white border border-amber-200 rounded-lg space-y-4"
                    >
                      <h4 className="text-xs font-bold text-ink-900 border-b pb-2">
                        Formulir Perbaikan Data Pendaftar
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Kota Domisili"
                          value={revisedCity}
                          onChange={(e) => setRevisedCity(e.target.value)}
                          required
                        />
                        <Input
                          label="Pekerjaan / Bidang Usaha"
                          value={revisedOccupation}
                          onChange={(e) => setRevisedOccupation(e.target.value)}
                          required
                        />
                        <div className="sm:col-span-2">
                          <Input
                            label="Alamat Lengkap Domisili"
                            value={revisedAddress}
                            onChange={(e) => setRevisedAddress(e.target.value)}
                            required
                          />
                        </div>
                        <Input
                          label="Nomor Telepon (Simulasi)"
                          value={revisedPhone}
                          onChange={(e) => setRevisedPhone(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingRevision(false)}
                        >
                          Batal
                        </Button>
                        <Button type="submit" variant="primary" size="sm" className="gap-2">
                          <Send className="w-4 h-4" /> Kirimkan Ulang Perbaikan
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {matchedApp.status === "rejected" && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1 text-red-900">
                    <p className="font-bold">Permohonan Tidak Disetujui</p>
                    <p>
                      Alasan penolakan: &quot;{matchedApp.rejectionReason}&quot;.
                    </p>
                    <p className="text-ink-600">
                      Anda dapat menghubungi sekretariat koperasi atau mengajukan pendaftaran ulang setelah memenuhi kriteria.
                    </p>
                  </div>
                </div>
              )}

              {/* Data Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-ink-100 text-xs">
                <div>
                  <span className="text-ink-500 block mb-0.5">ID Demonstrasi:</span>
                  <span className="font-mono font-medium text-ink-900">
                    {matchedApp.demoId}
                  </span>
                </div>
                <div>
                  <span className="text-ink-500 block mb-0.5">Email Kontak:</span>
                  <span className="text-ink-900">{matchedApp.email}</span>
                </div>
                <div>
                  <span className="text-ink-500 block mb-0.5">Kota Domisili:</span>
                  <span className="text-ink-900">{matchedApp.city}</span>
                </div>
                <div>
                  <span className="text-ink-500 block mb-0.5">Pekerjaan / Usaha:</span>
                  <span className="text-ink-900">{matchedApp.occupation}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-ink-500 block mb-0.5">Alamat Terdaftar:</span>
                  <span className="text-ink-900">{matchedApp.address}</span>
                </div>
              </div>

              {/* Activity / Audit History */}
              <div className="space-y-3 pt-4 border-t border-ink-100">
                <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Riwayat Aktivitas & Jejak Audit (BR-01.1)
                </h4>
                <div className="space-y-2">
                  {matchedApp.history.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-ink-50 border border-ink-200 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink-900">{log.action}</span>
                          <span className="text-[11px] px-2 py-0.5 bg-ink-200 text-ink-700 rounded font-mono">
                            {log.actorName} ({log.actorRole})
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-ink-600 mt-1 italic">&quot;{log.notes}&quot;</p>
                        )}
                      </div>
                      <span className="text-[11px] text-ink-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
