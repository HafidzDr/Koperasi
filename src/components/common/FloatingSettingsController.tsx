import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { useToastStore } from "@/stores/toastStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useSavingsStore } from "@/features/savings/stores/savingsStore";
import { useLoanStore } from "@/features/loans/stores/loanStore";
import { useBusinessUnitStore } from "@/features/business-units/stores/businessUnitStore";
import { useShuStore } from "@/features/shu/stores/shuStore";
import { demoRoleCatalog } from "@/mocks/seedData";
import { Role, BusinessModuleKey } from "@/types";
import { AUTHENTICATED_ROLES, PUBLIC_CONTEXTS, canPerformAction } from "@/lib/rbac";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  X,
  RotateCcw,
  ShieldCheck,
  Lock,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Switch } from "@/components/ui/Switch";
import { Alert } from "@/components/ui/Alert";
import { ConfirmationDialog } from "@/components/ui/Modal";

export const FloatingSettingsController: React.FC = () => {
  const { currentRole, currentUser, setRole } = useAuthStore();
  const { config, toggleModule, resetConfig } = useConfigStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"roles" | "modules" | "tools">("roles");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Authority check based on RBAC single source of truth (IA Section 5.4)
  const canUpdatePlatformConfig = canPerformAction(currentRole, "platform_config", "update");
  const canResetDemo = canPerformAction(currentRole, "demo_tools", "reset_demo");

  const authenticatedRoles = demoRoleCatalog.filter((r) =>
    AUTHENTICATED_ROLES.includes(r.id)
  );
  const publicContexts = demoRoleCatalog.filter((r) =>
    PUBLIC_CONTEXTS.includes(r.id)
  );

  // Keyboard accessibility: ESC key dismisses panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSwitchRole = (role: Role, defaultPath: string) => {
    setRole(role);
    const selected = demoRoleCatalog.find((r) => r.id === role);
    addToast({
      type: "info",
      title: "Peran Demonstrasi Diubah",
      message: `Beralih ke peran ${selected?.name} (${selected?.demoUser}).`,
    });
    setIsOpen(false);
    navigate(defaultPath);
  };

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

  const handleConfirmResetDemo = () => {
    if (!canPerformAction(currentRole, "demo_tools", "reset_demo")) {
      addToast({
        type: "danger",
        title: "Akses Ditolak (SoD)",
        message: `Peran "${currentUser.roleName}" tidak memiliki hak akses untuk mereset demonstrasi. Tindakan ini eksklusif untuk Super Administrator.`,
      });
      setIsResetConfirmOpen(false);
      return;
    }

    resetConfig();
    useAuthStore.getState().resetToDefault();
    useMembershipStore.getState().resetToSeed();
    useSavingsStore.getState().resetToSeed();
    useLoanStore.getState().resetToSeed();
    useBusinessUnitStore.getState().resetToSeed();
    useShuStore.getState().resetToSeed();

    addToast({
      type: "success",
      title: "Reset Demonstrasi Berhasil",
      message: "Seluruh data konfigurasi, transaksi, dan sesi demo telah dikembalikan ke kondisi awal seed.",
    });
    setIsResetConfirmOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  const moduleCatalog: { key: BusinessModuleKey; name: string; note?: string }[] = [
    { key: "savings", name: "Savings Management (Simpanan)" },
    { key: "loans", name: "Loan Management (Pinjaman)" },
    { key: "installments", name: "Installment Management (Angsuran)", note: "Terkait Pinjaman" },
    { key: "business_units", name: "Business Unit Management (Unit Usaha)" },
    { key: "shu", name: "SHU Management (Sisa Hasil Usaha)" },
    { key: "meetings", name: "Meeting & Voting (RAT Digital)" },
    { key: "notifications", name: "Notification Management" },
    { key: "reports", name: "Financial Reporting (Laporan Keuangan)" },
    { key: "audit_trail", name: "Audit Trail UI" },
  ];

  return (
    <>
      {/* 1. Floating Settings Trigger Button (Pinned at bottom-right) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Pengaturan Demonstrasi & Peran"
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-40 sm:z-50 flex items-center gap-2 p-3 sm:px-3.5 sm:py-2.5 bg-forest-900 text-white rounded-full sm:rounded-xl border border-forest-700 shadow-md hover:bg-forest-800 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2 transition-all group select-none"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-forest-100" />
        ) : (
          <Settings className="w-5 h-5 text-forest-100 group-hover:rotate-45 transition-transform duration-300" />
        )}
        <span className="hidden sm:inline text-xs font-semibold tracking-wide pr-1">
          Demo Settings
        </span>
        <span className="w-2 h-2 rounded-full bg-forest-400 animate-pulse shrink-0" title="Demo Mode Aktif" />
      </button>

      {/* 2. Backdrop Overlay when Panel is Open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink-900/40 z-40 sm:z-50 transition-opacity animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3. Floating Governance & Demo Settings Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="floating-settings-title"
          className="fixed bottom-0 right-0 sm:bottom-20 sm:right-5 z-50 w-full sm:w-[480px] max-h-[85vh] bg-white rounded-t-2xl sm:rounded-xl border border-ink-200 shadow-xl overflow-hidden flex flex-col text-left animate-in slide-in-from-bottom-4 duration-200"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-ink-100 bg-forest-900 text-white shrink-0">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-forest-300 shrink-0" />
                <h2 id="floating-settings-title" className="text-sm font-bold truncate">
                  Pengaturan Demonstrasi
                </h2>
                <Badge variant="forest" size="sm" className="bg-forest-800 text-white border-forest-700 text-[10px] py-0 px-1.5">
                  DEMO
                </Badge>
              </div>
              <p className="text-[11px] text-forest-200/90 mt-0.5 truncate">
                Peran Aktif: <strong className="text-white">{currentUser.roleName}</strong> ({currentUser.name})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-forest-200 hover:text-white hover:bg-forest-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 shrink-0"
              aria-label="Tutup pengaturan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="px-4 pt-3 pb-1 border-b border-ink-100 bg-ink-50/60 shrink-0">
            <Tabs
              tabs={[
                { id: "roles", label: "Konteks Peran", badge: 10 },
                { id: "modules", label: "Modul Bisnis", badge: 9 },
                { id: "tools", label: "Alat Demo" },
              ]}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as "roles" | "modules" | "tools")}
              variant="underline"
            />
          </div>

          {/* Tab Content Body (Scrollable) */}
          <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
            {/* TAB 1: ROLES & USER CONTEXT */}
            {activeTab === "roles" && (
              <div className="space-y-4 text-left">
                {/* 1.1 Authenticated Roles (8 Roles) */}
                <div>
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-ink-100">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-forest-700" />
                      <span className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                        Akun Terautentikasi
                      </span>
                    </div>
                    <Badge variant="forest" size="sm">
                      8 Peran
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {authenticatedRoles.map((role) => {
                      const isSelected = role.id === currentRole;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleSwitchRole(role.id, role.defaultPath)}
                          className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-forest-50 border-forest-600 ring-1 ring-forest-600 shadow-xs"
                              : "bg-white border-ink-200 hover:border-forest-600/40 hover:bg-ink-50/60"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1 gap-1">
                              <span className="text-xs font-bold text-ink-900 truncate">
                                {role.name}
                              </span>
                              <Badge variant={isSelected ? "forest" : "neutral"} size="sm" className="text-[10px] px-1 py-0">
                                {role.category}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-ink-600 leading-tight line-clamp-2 mb-1.5">
                              {role.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-ink-100 text-ink-500 font-mono">
                            <span className="truncate">{role.demoUser}</span>
                            {isSelected && (
                              <span className="flex items-center gap-0.5 text-forest-700 font-semibold font-sans">
                                <ShieldCheck className="w-3 h-3" /> Aktif
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.2 Public Preview Contexts (2 Contexts) */}
                <div>
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-ink-100">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-forest-700" />
                      <span className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                        Konteks Publik Non-Otentikasi
                      </span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      2 Konteks
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {publicContexts.map((role) => {
                      const isSelected = role.id === currentRole;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleSwitchRole(role.id, role.defaultPath)}
                          className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-forest-50 border-forest-600 ring-1 ring-forest-600 shadow-xs"
                              : "bg-white border-ink-200 hover:border-forest-600/40 hover:bg-ink-50/60"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1 gap-1">
                              <span className="text-xs font-bold text-ink-900 truncate">
                                {role.name}
                              </span>
                              <Badge variant={isSelected ? "forest" : "neutral"} size="sm" className="text-[10px] px-1 py-0">
                                {role.category}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-ink-600 leading-tight line-clamp-2 mb-1.5">
                              {role.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-ink-100 text-ink-500 font-mono">
                            <span className="truncate">{role.demoUser}</span>
                            {isSelected && (
                              <span className="flex items-center gap-0.5 text-forest-700 font-semibold font-sans">
                                <ShieldCheck className="w-3 h-3" /> Aktif
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PLATFORM MODULES */}
            {activeTab === "modules" && (
              <div className="space-y-3 text-left">
                {canUpdatePlatformConfig ? (
                  <Alert variant="forest" title="Hak Akses Terverifikasi">
                    Peran Anda memiliki kewenangan <code>platform_config:update</code>. Anda dapat mengaktifkan atau menonaktifkan modul platform.
                  </Alert>
                ) : (
                  <Alert variant="warning" title="Hak Akses Terbatas (SoD)">
                    Peran saat ini ({currentUser.roleName}) tidak memiliki izin <code>platform_config:update</code>. Pengubahan modul dinonaktifkan.
                  </Alert>
                )}

                <div className="divide-y divide-ink-100 border border-ink-200 rounded-lg overflow-hidden bg-white">
                  {moduleCatalog.map((mod) => {
                    const isEnabled = Boolean(
                      config.activeModules[mod.key as keyof typeof config.activeModules]
                    );

                    return (
                      <div
                        key={mod.key}
                        className="flex items-center justify-between p-3 gap-2 hover:bg-ink-50/50 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-semibold text-ink-900 block truncate">
                            {mod.name}
                          </span>
                          {mod.note && (
                            <span className="text-[10px] text-ink-500 block truncate">
                              {mod.note}
                            </span>
                          )}
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => handleToggleModule(mod.key)}
                          disabled={!canUpdatePlatformConfig}
                          aria-label={`Toggle ${mod.name}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: DEMO TOOLS */}
            {activeTab === "tools" && (
              <div className="space-y-3 text-left">
                {canResetDemo ? (
                  <Alert variant="forest" title="Hak Akses Super Admin">
                    Anda masuk sebagai Super Administrator dengan izin <code>demo_tools:reset_demo</code>.
                  </Alert>
                ) : (
                  <Alert variant="warning" title="Hak Akses Terbatas (SoD)">
                    Reset data prototype dibatasi secara eksklusif untuk peran Super Administrator (<code>demo_tools:reset_demo</code>).
                  </Alert>
                )}

                <div className="p-4 bg-ink-50/70 border border-ink-200 rounded-lg space-y-3 text-left">
                  <div className="flex items-start gap-2.5">
                    <RotateCcw className="w-5 h-5 text-danger-700 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-ink-900">
                        Reset Data Prototype ke Kondisi Awal
                      </h4>
                      <p className="text-xs text-ink-600 leading-relaxed mt-1">
                        Tindakan ini akan mengembalikan seluruh simulasi data anggota, saldo simpanan, mutasi transaksi, pinjaman, unit usaha, dan periode SHU ke kondisi awal data seed.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant={canResetDemo ? "destructive" : "secondary"}
                      size="sm"
                      disabled={!canResetDemo}
                      onClick={() => setIsResetConfirmOpen(true)}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Reset Data Demonstrasi
                    </Button>
                    {!canResetDemo && (
                      <p className="text-[10px] text-ink-500 italic mt-1.5">
                        *Beralihlah ke peran Super Administrator untuk mengaktifkan fungsi ini.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-3 bg-ink-50 border-t border-ink-100 flex items-center justify-between text-xs text-ink-500 shrink-0">
            <span>Platform Prototype v1.0</span>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Tutup Panel
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Demo Reset */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmResetDemo}
        title="Konfirmasi Reset Demonstrasi"
        message="Apakah Anda yakin ingin mengembalikan seluruh data demonstrasi ke kondisi seed awal? Seluruh perubahan sesi ini akan direset."
        confirmLabel="Ya, Reset Demonstrasi"
        variant="destructive"
      />
    </>
  );
};
