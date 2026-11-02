import React, { useState } from "react";
import { useConfigStore } from "@/stores/configStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmationDialog } from "@/components/ui/Modal";
import { BusinessModuleKey } from "@/types";
import {
  RotateCcw,
  Layers,
  ShieldCheck,
  Building,
} from "lucide-react";

export const PlatformSettingsView: React.FC = () => {
  const { config, toggleModule, resetConfig } = useConfigStore();
  const { resetToDefault } = useAuthStore();
  const { addToast } = useToastStore();

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

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
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Pengaturan Platform & Arsitektur Modular
          </h1>
          <p className="text-xs text-ink-600 mt-1">
            Konfigurasi identitas organisasi demonstrasi, aktivasi modul bisnis, dan kontrol reset demo.
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsResetDialogOpen(true)}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Data Demo
        </Button>
      </div>

      {/* Identitas Koperasi Ringkas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-forest-700" />
            <CardTitle className="text-sm">Identitas Koperasi Terkonfigurasi</CardTitle>
          </div>
          <CardDescription>
            Dimuat secara dinamis melalui objek <code>cooperativeConfig</code> (Platform Core).
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

      {/* Business Modules Activation Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-forest-700" />
            <CardTitle className="text-sm">Matriks Aktivasi Business Modules</CardTitle>
          </div>
          <CardDescription>
            Uji responsivitas navigasi dan rute: nonaktifkan modul untuk memastikan seluruh rute terkait tertangani dengan anggun.
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
                  <Button
                    variant={isEnabled ? "outline" : "primary"}
                    size="sm"
                    onClick={() => toggleModule(mod.key)}
                    className="shrink-0"
                  >
                    {isEnabled ? "Nonaktifkan Modul" : "Aktifkan Modul"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
