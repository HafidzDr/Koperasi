import React, { useState } from "react";
import { useConfigStore } from "@/stores/configStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ConfirmationDialog } from "@/components/ui/Modal";
import { BusinessModuleKey } from "@/types";
import { canPerformAction } from "@/lib/rbac";
import { formatIDR } from "@/lib/utils";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import {
  RotateCcw,
  Layers,
  ShieldCheck,
  Building,
  Settings,
  Lock,
  Sliders,
  AlertTriangle,
} from "lucide-react";

export const PlatformSettingsView: React.FC = () => {
  const { config, toggleModule, resetConfig } = useConfigStore();
  const { currentUser, resetToDefault } = useAuthStore();
  const { savingsConfig, updateSavingsConfig, resetSavingsConfig } = useMembershipStore();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<"platform" | "cooperative" | "reset">("platform");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const [inputPokok, setInputPokok] = useState<string>(() => String(savingsConfig.simpananPokokNominal));
  const [inputWajib, setInputWajib] = useState<string>(() => String(savingsConfig.simpananWajibBulanan));
  const [savingsFormError, setSavingsFormError] = useState<string | null>(null);

  React.useEffect(() => {
    setInputPokok(String(savingsConfig.simpananPokokNominal));
    setInputWajib(String(savingsConfig.simpananWajibBulanan));
  }, [savingsConfig]);

  const handleSaveSavingsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingsFormError(null);

    const trimmedPokok = inputPokok !== undefined && inputPokok !== null ? String(inputPokok).trim() : "";
    const trimmedWajib = inputWajib !== undefined && inputWajib !== null ? String(inputWajib).trim() : "";

    // 1. Reject empty or whitespace-only strings
    if (trimmedPokok === "") {
      const msg = "Nominal Simpanan Pokok wajib diisi dan tidak boleh kosong.";
      setSavingsFormError(msg);
      addToast({ type: "danger", title: "Validasi Gagal", message: msg });
      return;
    }

    if (trimmedWajib === "") {
      const msg = "Nominal Simpanan Wajib wajib diisi dan tidak boleh kosong.";
      setSavingsFormError(msg);
      addToast({ type: "danger", title: "Validasi Gagal", message: msg });
      return;
    }

    // 2. Reject non-numeric strings
    const numPokok = Number(trimmedPokok);
    if (isNaN(numPokok) || !/^-?\d+$/.test(trimmedPokok)) {
      const msg = "Nominal Simpanan Pokok harus berupa angka yang valid.";
      setSavingsFormError(msg);
      addToast({ type: "danger", title: "Validasi Gagal", message: msg });
      return;
    }

    // 3. Reject negative numbers
    if (numPokok < 0) {
      const msg = "Nominal Simpanan Pokok tidak boleh bernilai negatif.";
      setSavingsFormError(msg);
      addToast({ type: "danger", title: "Validasi Gagal", message: msg });
      return;
    }

    // 4. Reject numbers exceeding 1.000.000.000
    if (numPokok > 1_000_000_000) {
      const msg = "Nominal Simpanan Pokok melebihi batas maksimum wajar (Rp 1.000.000.000).";
      setSavingsFormError(msg);
      addToast({ type: "danger", title: "Validasi Gagal", message: msg });
      return;
    }

    const numWajib = Number(trimmedWajib);
    if (isNaN(numWajib) || !/^-?\d+$/.test(trimmedWajib)) {
      const msg = "Nominal Simpanan Wajib harus berupa angka yang valid.";
      setSavingsFormError(msg);
      addToast({ type: "danger", title: "Validasi Gagal", message: msg });
      return;
    }

    if (numWajib < 0) {
      const msg = "Nominal Simpanan Wajib tidak boleh bernilai negatif.";
      setSavingsFormError(msg);
      addToast({ type: "danger", title: "Validasi Gagal", message: msg });
      return;
    }

    if (numWajib > 1_000_000_000) {
      const msg = "Nominal Simpanan Wajib melebihi batas maksimum wajar (Rp 1.000.000.000).";
      setSavingsFormError(msg);
      addToast({ type: "danger", title: "Validasi Gagal", message: msg });
      return;
    }

    // 5. Valid: update store
    updateSavingsConfig({
      simpananPokokNominal: numPokok,
      simpananWajibBulanan: numWajib,
    });

    addToast({
      type: "success",
      title: "Parameter Demonstrasi Diperbarui",
      message: `Simpanan Pokok diubah ke ${formatIDR(numPokok)}, Simpanan Wajib ke ${formatIDR(numWajib)}/bln.`,
    });
  };

  const handleResetSavingsConfig = () => {
    resetSavingsConfig();
    setSavingsFormError(null);
    addToast({
      type: "info",
      title: "Parameter Demonstrasi Dikembalikan",
      message: "Nominal simpanan demonstrasi dikembalikan ke nilai default ilustrasi.",
    });
  };

  // Authority check based on IA Section 5.4
  const canUpdatePlatformConfig = canPerformAction(currentUser.role, "platform_config", "update");
  const canResetDemo = canPerformAction(currentUser.role, "demo_tools", "reset_demo");

  const businessModulesList: { key: BusinessModuleKey; name: string; desc: string; dep?: string }[] = [
    {
      key: "savings",
      name: "Savings Management (Simpanan)",
      desc: "Rekening simpanan pokok, wajib, sukarela, dan berjangka beserta buku mutasi.",
    },
    {
      key: "loans",
      name: "Loan Management (Pinjaman)",
      desc: "Pengajuan pinjaman, kalkulator bunga, dan workflow persetujuan bertingkat.",
    },
    {
      key: "installments",
      name: "Installment Management (Angsuran)",
      desc: "Jadwal penagihan angsuran dan denda keterlambatan.",
      dep: "Bergantung pada modul Pinjaman",
    },
    {
      key: "business_units",
      name: "Business Unit Management (Unit Usaha)",
      desc: "Portofolio unit usaha riil non-simpan-pinjam (toko/waserda, logistik).",
    },
    {
      key: "shu",
      name: "SHU Management (Sisa Hasil Usaha)",
      desc: "Formula distribusi pembagian keuntungan tahunan (jasa modal + jasa usaha).",
    },
    {
      key: "meetings",
      name: "Meeting & Voting (RAT Digital)",
      desc: "Presensi kuorum digital dan simulasi e-voting 1 Member = 1 Vote.",
    },
    {
      key: "notifications",
      name: "Notification Management",
      desc: "Pusat notifikasi status transaksi dan peringatan operasional.",
    },
    {
      key: "reports",
      name: "Financial Reporting (Laporan Keuangan)",
      desc: "Neraca, Laba Rugi, dan Arus Kas demonstrasi (Akses Admin: View & Export teknis).",
    },
    {
      key: "audit_trail",
      name: "Audit Trail UI",
      desc: "Antarmuka penelusuran audit log operasional.",
    },
  ];

  const handleConfirmReset = () => {
    if (!canResetDemo) {
      addToast({
        type: "danger",
        title: "Akses Ditolak",
        message: "Hanya Super Administrator yang berwenang mereset lingkungan demo.",
      });
      setIsResetDialogOpen(false);
      return;
    }

    resetConfig();
    resetToDefault();
    setIsResetDialogOpen(false);
    addToast({
      type: "success",
      title: "Data Demonstrasi Telah Direset",
      message: "Seluruh konfigurasi modul dan sesi peran dikembalikan ke kondisi seed awal.",
    });
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-900">
              Pengaturan & Tata Kelola Platform
            </h1>
            <Badge variant="forest" size="sm">
              Modular Architecture
            </Badge>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Pemisahan tegas: Konfigurasi Teknis Platform vs Kebijakan Koperasi & Produk vs Kontrol Reset Demo
          </p>
        </div>

        {/* Role Context Pill */}
        <div className="text-xs text-right">
          <span className="text-ink-500 block">Kewenangan Anda:</span>
          <strong className="text-ink-900">{currentUser.roleName}</strong>
        </div>
      </div>

      {/* Navigation Tabs for Separation */}
      <div className="flex border-b border-ink-200 gap-1">
        <button
          onClick={() => setActiveTab("platform")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "platform"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>1. Platform Configuration (Teknis)</span>
        </button>

        <button
          onClick={() => setActiveTab("cooperative")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "cooperative"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>2. Cooperative & Product Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab("reset")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "reset"
              ? "border-danger-700 text-danger-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>3. Demo Environment Reset</span>
        </button>
      </div>

      {/* TAB 1: Platform Configuration (Technical) */}
      {activeTab === "platform" && (
        <div className="space-y-6">
          {/* Platform Core Foundation Banner */}
          <Card className="border-forest-600/40 bg-forest-50/50">
            <CardContent className="p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
              <div className="text-xs text-forest-900">
                <strong className="block text-sm mb-1">7 Fondasi Platform Core (Selalu Aktif)</strong>
                Cooperative Identity, User Management, Role & Permission, Membership Foundation, Basic Administration, System Configuration, dan Core Audit Logging berjalan secara internal dan tidak dapat dinonaktifkan.
              </div>
            </CardContent>
          </Card>

          {/* SoD Notice for Platform Update */}
          {!canUpdatePlatformConfig && (
            <div className="p-3 bg-ink-100 border border-ink-200 rounded-md text-xs text-ink-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-ink-500 shrink-0" />
              <span>
                Peran <strong>{currentUser.roleName}</strong> hanya memiliki izin melihat (View Only). Perubahan status modul teknis memerlukan hak akses <strong>Administrator Sistem</strong> atau <strong>Super Administrator</strong>.
              </span>
            </div>
          )}

          {/* Business Modules Activation Matrix */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest-700" />
                <CardTitle className="text-sm">Matriks Aktivasi Business Modules</CardTitle>
              </div>
              <CardDescription>
                Modul bisnis opsional dapat diaktifkan atau dinonaktifkan sesuai kebutuhan ragam jenis koperasi Indonesia.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-ink-100">
                {businessModulesList.map((mod) => {
                  const isEnabled = config.activeModules[mod.key];
                  return (
                    <div
                      key={mod.key}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ink-50/50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink-900">{mod.name}</span>
                          <Badge variant={isEnabled ? "forest" : "neutral"} size="sm">
                            {isEnabled ? "Aktif" : "Non-Aktif"}
                          </Badge>
                        </div>
                        <p className="text-xs text-ink-600">{mod.desc}</p>
                        {mod.dep && (
                          <span className="text-[11px] text-warning-700 font-medium block">
                            * {mod.dep}
                          </span>
                        )}
                      </div>

                      {canUpdatePlatformConfig ? (
                        <Button
                          variant={isEnabled ? "outline" : "primary"}
                          size="sm"
                          onClick={() => toggleModule(mod.key)}
                          className="shrink-0"
                        >
                          {isEnabled ? "Nonaktifkan Modul" : "Aktifkan Modul"}
                        </Button>
                      ) : (
                        <span className="text-[11px] text-ink-500 font-medium italic shrink-0">
                          Terkunci (View Only)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Cooperative & Product Configuration (Cooperative Policies) */}
      {activeTab === "cooperative" && (
        <div className="space-y-6">
          {/* Policy Authority Notice */}
          <div className="p-4 bg-ink-50 border border-ink-200 rounded-lg text-xs text-ink-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-ink-900 text-sm">
              <Settings className="w-4 h-4 text-forest-700" />
              <span>Kewenangan Konfigurasi Produk Keuangan & Kebijakan Koperasi</span>
            </div>
            <p className="leading-relaxed">
              Sesuai <strong>Information Architecture Seksi 5.4 Catatan Kaki 3</strong>: Parameter produk keuangan (bunga, plafon, formula bagi hasil, simpanan pokok) merupakan kebijakan organisasi koperasi yang diputuskan oleh <strong>Pengurus / Rapat Anggota Tahunan (RAT)</strong>. Administrator teknis tidak berhak mengubah formula keuangan tanpa mandat resmi organisasi.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="warning" size="sm">
                Status Otoritas: PROPOSED / UNRESOLVED
              </Badge>
              <span className="text-[11px] text-ink-500">Mekanisme persetujuan definitif dalam pembahasan tata kelola.</span>
            </div>
          </div>

          {/* Identitas Koperasi Ringkas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-forest-700" />
                <CardTitle className="text-sm">Identitas Koperasi Terkonfigurasi</CardTitle>
              </div>
              <CardDescription>
                Data institusional demonstrasi KMB dimuat secara dinamis melalui objek konfigurasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-ink-50 rounded border border-ink-200">
                <span className="text-ink-500 block">Nama Koperasi:</span>
                <strong className="text-ink-900 text-sm">{config.name}</strong>
              </div>
              <div className="p-3 bg-ink-50 rounded border border-ink-200">
                <span className="text-ink-500 block">Sebutan / Singkatan:</span>
                <strong className="text-ink-900 text-sm">{config.shortName} ({config.acronym})</strong>
              </div>
              <div className="p-3 bg-ink-50 rounded border border-ink-200">
                <span className="text-ink-500 block">Nomor Badan Hukum (Demo):</span>
                <strong className="font-mono text-ink-900">{config.legalNumber}</strong>
              </div>
              <div className="p-3 bg-ink-50 rounded border border-ink-200">
                <span className="text-ink-500 block">Nomor Induk Koperasi / NIKOP (Demo):</span>
                <strong className="font-mono text-ink-900">{config.cooperativeRegistrationNumber}</strong>
              </div>
            </CardContent>
          </Card>

          {/* Parameter Produk Finansial Demonstrasi (Configurable Demo Parameters) */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm">Parameter Simpanan Demonstrasi (Simulasi Frontend)</CardTitle>
                  <CardDescription>
                    Pengaturan nilai simulasi simpanan pokok dan wajib untuk demonstrasi platform KMB.
                  </CardDescription>
                </div>
                <Badge variant="warning" size="sm">
                  Nominal Ilustrasi — Bukan Kebijakan Resmi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Disclaimer Notice */}
              <div className="p-3.5 bg-warning-100/30 border border-warning-base/30 rounded-lg text-ink-700 space-y-1">
                <span className="font-bold text-ink-900 block text-[11px]">
                  * Batasan Simulasi Demonstrasi:
                </span>
                <p className="leading-relaxed text-[11px]">
                  Perubahan pada kontrol di bawah ini murni mengubah nilai parameter ilustrasi pada frontend demonstrasi (tampilan beranda publik, formulir pendaftaran calon, dan buku induk). Tindakan ini <strong>tidak menetapkan keputusan legal AD/ART</strong> dan <strong>tidak mengubah saldo aktual</strong> anggota yang sudah terdaftar. Status kewenangan kebijakan resmi koperasi berstatus <em>PROPOSED / UNRESOLVED</em> (U-11).
                </p>
              </div>

              {savingsFormError && (
                <div className="p-3 bg-danger-100 border border-danger-base/30 rounded-lg text-xs text-danger-700">
                  {savingsFormError}
                </div>
              )}

              <form onSubmit={handleSaveSavingsConfig} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Input
                      label="Simpanan Pokok Ilustrasi (Rp)"
                      type="number"
                      min="0"
                      max="1000000000"
                      value={inputPokok}
                      onChange={(e) => setInputPokok(e.target.value)}
                      helperText={`Nilai aktif: ${formatIDR(Number(inputPokok) || 0)}`}
                    />
                    <span className="text-[11px] text-ink-500 block">
                      Disetor sekali saat pendaftaran pertama kali (ilustrasi).
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Input
                      label="Simpanan Wajib Bulanan Ilustrasi (Rp)"
                      type="number"
                      min="0"
                      max="1000000000"
                      value={inputWajib}
                      onChange={(e) => setInputWajib(e.target.value)}
                      helperText={`Nilai aktif: ${formatIDR(Number(inputWajib) || 0)}/bln`}
                    />
                    <span className="text-[11px] text-ink-500 block">
                      Disetor rutin setiap bulan buku berjalan (ilustrasi).
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-ink-100">
                  <span className="text-[11px] text-ink-500 italic">
                    Tersimpan di penyimpanan lokal peramban (localStorage).
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetSavingsConfig}
                      className="w-full sm:w-auto"
                    >
                      Kembalikan ke Nilai Awal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Simpan Perubahan
                    </Button>
                  </div>
                </div>
              </form>

              <div className="pt-3 border-t border-ink-200">
                <div className="flex justify-between items-center p-3 bg-ink-50 rounded border border-ink-200">
                  <div>
                    <span className="font-semibold text-ink-900 block">Ambang Batas Otorisasi Pinjaman Level 2 (Finance Officer)</span>
                    <span className="text-ink-500 text-[11px]">Pinjaman di atas batas ini wajib dieskalasi ke Level 3 Pengurus</span>
                  </div>
                  <span className="font-mono font-bold text-amber-800">s.d. Rp 10.000.000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Demo Environment Reset (Admin Simulation) */}
      {activeTab === "reset" && (
        <div className="space-y-6">
          <Card className="border-danger-base/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger-700" />
                <CardTitle className="text-sm text-danger-900">
                  Reset Lingkungan Demonstrasi (Demo Environment Reset)
                </CardTitle>
              </div>
              <CardDescription>
                Tindakan khusus untuk pengujian demonstrasi: mengembalikan seluruh konfigurasi modul aktif dan data sesi simulasi ke kondisi awal (*seed*).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-ink-700">
              <div className="p-3.5 bg-danger-100/40 rounded border border-danger-base/20 space-y-2">
                <strong className="block text-danger-900 font-semibold">
                  Aturan Keselamatan Demo & Batasan Otoritas:
                </strong>
                <p>
                  1. Sesuai <strong>Information Architecture Seksi 5.4</strong>, tindakan reset lingkungan demonstrasi merupakan kewenangan teknis eksklusif dari <strong>Super Administrator</strong>.
                </p>
                <p>
                  2. Reset demonstrasi hanya membersihkan state penyimpanan peramban lokal (`localStorage`/`sessionStorage`) dan <strong>tidak boleh mengubah aturan bisnis maupun kebijakan organisasi yang berlaku</strong>.
                </p>
              </div>

              <div className="pt-2">
                {canResetDemo ? (
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => setIsResetDialogOpen(true)}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Reset Seluruh Lingkungan Demonstrasi Sekarang
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="danger"
                      size="md"
                      disabled
                      leftIcon={<Lock className="w-4 h-4" />}
                      className="opacity-50 cursor-not-allowed"
                    >
                      Reset Dinonaktifkan (Memerlukan Super Administrator)
                    </Button>
                    <p className="text-[11px] text-ink-500 italic">
                      *Peran Anda ({currentUser.roleName}) tidak memiliki hak eksekusi reset platform. Beralihlah ke Super Administrator melalui Demo Role Switcher.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog for Reset */}
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Seluruh Data Demonstrasi?"
        message="Seluruh konfigurasi aktivasi modul, sesi peran, dan modifikasi lokal akan dikembalikan ke kondisi seed awal. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Reset Sekarang"
        variant="danger"
      />
    </div>
  );
};
