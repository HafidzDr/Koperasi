import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { useToastStore } from "@/stores/toastStore";
import { demoRoleCatalog } from "@/mocks/seedData";
import { Role } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Users,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export const DemoRoleSwitcher: React.FC = () => {
  const { currentRole, currentUser, setRole } = useAuthStore();
  const { config, toggleModule, resetConfig } = useConfigStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);

  const handleSwitchRole = (role: Role, defaultPath: string) => {
    setRole(role);
    setIsModalOpen(false);
    addToast({
      type: "info",
      title: "Peran Demonstrasi Diubah",
      message: `Beralih ke peran ${demoRoleCatalog.find((r) => r.id === role)?.name} (${demoRoleCatalog.find((r) => r.id === role)?.demoUser}).`,
    });
    navigate(defaultPath);
  };

  const handleResetDemo = () => {
    resetConfig();
    useAuthStore.getState().resetToDefault();
    addToast({
      type: "success",
      title: "Reset Data Demonstrasi Berhasil",
      message: "Data konfigurasi dan sesi demo dikembalikan ke kondisi awal seed.",
    });
    setIsModalOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* Top Demo Bar */}
      <div className="bg-forest-900 text-forest-50 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-forest-800 select-none">
        <div className="flex items-center gap-2">
          <Badge variant="forest" size="sm" className="bg-forest-800 text-white border-forest-700">
            DEMO MODE
          </Badge>
          <span className="hidden sm:inline text-forest-100/90">
            Peran Aktif: <strong className="text-white">{currentUser.roleName}</strong> ({currentUser.name})
          </span>
          <span className="sm:hidden text-white font-medium truncate max-w-[140px]">
            {currentUser.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModuleModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-forest-800/80 hover:bg-forest-800 text-forest-100 hover:text-white transition-colors"
            title="Kelola Aktivasi Modul Bisnis"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Modul Bisnis</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-forest-700 hover:bg-forest-600 text-white font-medium transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Ganti Peran ({currentRole})</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
        </div>
      </div>

      {/* Role Switcher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pilih Peran Demonstrasi (Demo Role Switcher)"
        description="Pilih salah satu dari 8 peran operasional terautentikasi atau 2 konteks publik untuk meninjau sistem."
        maxWidth="lg"
        footer={
          <div className="w-full flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-danger-700" />}
              className="text-danger-700 border-danger-base/40 hover:bg-danger-100"
            >
              Reset Data Demo
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Tutup
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoRoleCatalog.map((role) => {
            const isSelected = role.id === currentRole;
            return (
              <button
                key={role.id}
                onClick={() => handleSwitchRole(role.id, role.defaultPath)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-forest-50 border-forest-600 ring-1 ring-forest-600"
                    : "bg-white border-ink-200 hover:border-ink-300 hover:bg-ink-50/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-ink-900">{role.name}</span>
                    <Badge variant={isSelected ? "forest" : "neutral"} size="sm">
                      {role.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-ink-600 leading-normal line-clamp-2 mb-2">
                    {role.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-ink-100 text-ink-500 font-mono">
                  <span>Nama: {role.demoUser}</span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-forest-700 font-semibold font-sans">
                      <ShieldCheck className="w-3.5 h-3.5" /> Aktif
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Business Module Toggle Modal */}
      <Modal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        title="Konfigurasi Modul Bisnis (Modular Architecture)"
        description="Aktifkan atau nonaktifkan Business Modules untuk melihat bagaimana seluruh rute dan menu beradaptasi."
        maxWidth="md"
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsModuleModalOpen(false)}>
            Selesai
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-forest-50 rounded-md border border-forest-100 text-xs text-forest-900">
            Platform Core (7 fondasi) selalu aktif di latar belakang. Modul di bawah merupakan modul bisnis opsional.
          </div>

          <div className="divide-y divide-ink-100 border border-ink-200 rounded-md overflow-hidden bg-white">
            {[
              { key: "savings", name: "Savings Management (Simpanan)", core: false, note: undefined },
              { key: "loans", name: "Loan Management (Pinjaman)", core: false, note: undefined },
              { key: "installments", name: "Installment Management (Angsuran)", core: false, note: "Bergantung pada Loans" },
              { key: "business_units", name: "Business Unit Management (Unit Usaha)", core: false, note: undefined },
              { key: "shu", name: "SHU Management (Sisa Hasil Usaha)", core: false, note: undefined },
              { key: "meetings", name: "Meeting & Voting (RAT Digital)", core: false, note: undefined },
              { key: "notifications", name: "Notification Management", core: false, note: undefined },
              { key: "reports", name: "Financial Reporting (Laporan Keuangan)", core: false, note: undefined },
              { key: "audit_trail", name: "Audit Trail UI", core: false, note: undefined },
            ].map((mod) => {
              const isEnabled = config.activeModules[mod.key as keyof typeof config.activeModules];
              return (
                <div key={mod.key} className="flex items-center justify-between p-3">
                  <div>
                    <span className="text-xs font-semibold text-ink-900 block">{mod.name}</span>
                    {mod.note && <span className="text-[10px] text-ink-500">{mod.note}</span>}
                  </div>
                  <Button
                    variant={isEnabled ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => toggleModule(mod.key as keyof typeof config.activeModules)}
                  >
                    {isEnabled ? "Aktif" : "Nonaktif"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
};
