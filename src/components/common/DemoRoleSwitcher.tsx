import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { useToastStore } from "@/stores/toastStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useSavingsStore } from "@/features/savings/stores/savingsStore";
import { demoRoleCatalog } from "@/mocks/seedData";
import { Role, BusinessModuleKey } from "@/types";
import { AUTHENTICATED_ROLES, PUBLIC_CONTEXTS, canPerformAction } from "@/lib/rbac";
import { useNavigate } from "react-router-dom";
import {
  Users,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Layers,
  Globe,
  Lock,
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

  // Authority check based on IA Section 5.4
  const canUpdatePlatformConfig = canPerformAction(currentRole, "platform_config", "update");
  const canResetDemo = canPerformAction(currentRole, "demo_tools", "reset_demo");

  const authenticatedRoles = demoRoleCatalog.filter((r) =>
    AUTHENTICATED_ROLES.includes(r.id)
  );
  const publicContexts = demoRoleCatalog.filter((r) =>
    PUBLIC_CONTEXTS.includes(r.id)
  );

  const handleSwitchRole = (role: Role, defaultPath: string) => {
    setRole(role);
    setIsModalOpen(false);
    const selected = demoRoleCatalog.find((r) => r.id === role);
    addToast({
      type: "info",
      title: "Peran Demonstrasi Diubah",
      message: `Beralih ke peran ${selected?.name} (${selected?.demoUser}).`,
    });
    navigate(defaultPath);
  };

  /**
   * Protected handler for Demo Reset.
   * Strictly verifies demo_tools:reset_demo permission before execution.
   */
  const handleResetDemo = () => {
    if (!canPerformAction(currentRole, "demo_tools", "reset_demo")) {
      addToast({
        type: "danger",
        title: "Akses Ditolak (SoD)",
        message: `Peran "${currentUser.roleName}" tidak memiliki hak akses untuk mereset demonstrasi. Tindakan ini eksklusif untuk Super Administrator.`,
      });
      return;
    }

    resetConfig();
    useAuthStore.getState().resetToDefault();
    useMembershipStore.getState().resetToSeed();
    useSavingsStore.getState().resetToSeed();
    addToast({
      type: "success",
      title: "Reset Data Demonstrasi Berhasil",
      message: "Data konfigurasi dan sesi demo dikembalikan ke kondisi awal seed.",
    });
    setIsModalOpen(false);
    navigate("/");
  };

  /**
   * Protected handler for toggling modular business modules.
   * Strictly verifies platform_config:update permission before execution.
   */
  const handleToggleModule = (key: BusinessModuleKey) => {
    if (!canPerformAction(currentRole, "platform_config", "update")) {
      addToast({
        type: "danger",
        title: "Akses Ditolak (SoD)",
        message: `Peran "${currentUser.roleName}" tidak memiliki hak akses (platform_config:update) untuk mengubah konfigurasi modul platform. Tindakan dibatalkan.`,
      });
      return;
    }

    toggleModule(key);
    addToast({
      type: "info",
      title: "Konfigurasi Modul Diperbarui",
      message: `Status modul "${key}" berhasil diubah.`,
    });
  };

  return (
    <>
      {/* Top Demo Bar */}
      <div className="bg-forest-900 text-forest-50 px-3 sm:px-4 py-1.5 text-xs flex items-center justify-between gap-2 border-b border-forest-800 select-none min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <Badge variant="forest" size="sm" className="bg-forest-800 text-white border-forest-700 shrink-0 text-[10px] px-1.5 py-0.5 sm:text-xs sm:px-2 sm:py-0.5">
            DEMO
          </Badge>
          <span className="hidden sm:inline text-forest-100/90 truncate">
            Konteks Aktif: <strong className="text-white">{currentUser.roleName}</strong> ({currentUser.name})
          </span>
          <span className="sm:hidden text-white font-medium truncate text-[11px]">
            {currentUser.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Module config button: only visible & actionable for roles with platform_config:update */}
          {canUpdatePlatformConfig && (
            <button
              onClick={() => setIsModuleModalOpen(true)}
              className="flex items-center gap-1 px-1.5 py-1 sm:px-2 rounded bg-forest-800/80 hover:bg-forest-800 text-forest-100 hover:text-white transition-colors text-[11px]"
              title="Kelola Aktivasi Modul Bisnis (Administrator Teknis)"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Modul Bisnis</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded bg-forest-700 hover:bg-forest-600 text-white font-medium transition-colors text-[11px] sm:text-xs shrink-0"
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Peran:</span>
            <span className="capitalize">{currentRole}</span>
            <ChevronDown className="w-3 h-3 opacity-70 shrink-0" />
          </button>
        </div>
      </div>

      {/* Role Switcher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pilih Peran Demonstrasi (Demo Role Switcher)"
        description="Beralih peran untuk melihat bagaimana seluruh sistem, hak akses rute, navigasi menu, dan tindakan beradaptasi sesuai Matriks Kewenangan (IA Seksi 5.4)."
        maxWidth="xl"
        footer={
          <div className="w-full flex items-center justify-between">
            {canResetDemo ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDemo}
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-danger-700" />}
                className="text-danger-700 border-danger-base/40 hover:bg-danger-100"
              >
                Reset Data Demo (Super Admin)
              </Button>
            ) : (
              <span className="text-[11px] text-ink-500 italic">
                *Reset Demo dibatasi untuk Super Administrator
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Tutup
            </Button>
          </div>
        }
      >
        <div className="space-y-6 text-left max-h-[68vh] overflow-y-auto pr-1">
          {/* Group 1: Authenticated Demo Accounts (8 Roles) */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-ink-100">
              <Lock className="w-4 h-4 text-forest-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                Authenticated Demo Accounts (8 Akun Terautentikasi)
              </h3>
              <Badge variant="forest" size="sm">
                8 Peran
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {authenticatedRoles.map((role) => {
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
          </div>

          {/* Group 2: Public Preview (2 Contexts) */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-ink-100">
              <Globe className="w-4 h-4 text-forest-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                Public Preview (Konteks Publik Non-Otentikasi)
              </h3>
              <Badge variant="neutral" size="sm">
                2 Konteks
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {publicContexts.map((role) => {
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
          </div>
        </div>
      </Modal>

      {/* Business Module Toggle Modal (Protected with permission checks) */}
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
        <div className="space-y-3 text-left">
          {!canUpdatePlatformConfig && (
            <div className="p-3 bg-danger-100/50 border border-danger-base/30 rounded-md text-xs text-danger-800">
              Peran Anda saat ini tidak memiliki kewenangan <code>platform_config:update</code>. Pengubahan status modul dinonaktifkan.
            </div>
          )}

          <div className="p-3 bg-forest-50 rounded-md border border-forest-100 text-xs text-forest-900">
            Platform Core (7 fondasi) selalu aktif di latar belakang. Modul di bawah merupakan modul bisnis opsional.
          </div>

          <div className="divide-y divide-ink-100 border border-ink-200 rounded-md overflow-hidden bg-white max-h-[50vh] overflow-y-auto">
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
                    disabled={!canUpdatePlatformConfig}
                    onClick={() => handleToggleModule(mod.key as BusinessModuleKey)}
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
