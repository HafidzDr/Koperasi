import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { BrandLogo } from "@/components/common/BrandLogo";
import { DemoRoleSwitcher } from "@/components/common/DemoRoleSwitcher";
import { AccessDeniedView } from "@/components/common/AccessDeniedView";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { isPublicContext, canAccessRoute } from "@/lib/rbac";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Receipt,
  PieChart,
  ShoppingBag,
  Vote,
  User,
  HelpCircle,
  Menu,
  Bell,
  LogOut,
} from "lucide-react";

export const MemberLayout: React.FC = () => {
  const { currentUser, setRole } = useAuthStore();
  const { config } = useConfigStore();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Layout Guard: Only 'member' role is allowed into MemberLayout
  if (currentUser.role !== "member") {
    return (
      <div className="min-h-screen bg-ink-50">
        <DemoRoleSwitcher />
        <AccessDeniedView
          reason={
            isPublicContext(currentUser.role)
              ? "Portal Anggota memerlukan akun Anggota aktif terautentikasi. Anda sedang dalam konteks Publik."
              : `Peran Anda (${currentUser.roleName}) adalah akun internal manajemen/administrasi, bukan akun Anggota Koperasi.`
          }
          currentPath={location.pathname}
        />
      </div>
    );
  }

  const menuItems = [
    { label: "Ringkasan", href: "/portal", icon: LayoutDashboard },
    ...(config.activeModules.savings
      ? [{ label: "Simpanan Saya", href: "/portal/simpanan", icon: Wallet }]
      : []),
    ...(config.activeModules.loans
      ? [{ label: "Pinjaman & Angsuran", href: "/portal/pinjaman", icon: CreditCard }]
      : []),
    { label: "Pusat Pembayaran", href: "/portal/pembayaran", icon: Receipt },
    ...(config.activeModules.shu
      ? [{ label: "SHU Saya", href: "/portal/shu", icon: PieChart }]
      : []),
    ...(config.activeModules.business_units
      ? [{ label: "Unit Usaha", href: "/portal/unit-usaha", icon: ShoppingBag }]
      : []),
    ...(config.activeModules.meetings
      ? [{ label: "Rapat Anggota (RAT)", href: "/portal/rapat", icon: Vote }]
      : []),
    { label: "Profil Anggota", href: "/portal/profil", icon: User },
    { label: "Bantuan & Kontak", href: "/portal/bantuan", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-800">
      {/* 1. Global Demo Switcher */}
      <DemoRoleSwitcher />

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Desktop Persistent Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-ink-200 shrink-0">
          <div className="p-4 border-b border-ink-100 flex items-center justify-between">
            <BrandLogo size="sm" to="/portal" />
            <Badge variant="forest" size="sm">PORTAL</Badge>
          </div>

          {/* Member Profile Teaser Card */}
          <div className="p-3.5 m-3 bg-forest-50/70 border border-forest-200/60 rounded-xl text-left">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} size="md" className="border-2 border-forest-300" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink-900 truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-forest-800 bg-white px-1.5 py-0.5 rounded border border-forest-200">
                    {currentUser.memberId || "DEMO-ID-0001"}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-success-600 inline-block shrink-0" title="Status Aktif" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto text-left">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/portal"
                  ? location.pathname === "/portal"
                  : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-forest-100 text-forest-900 font-semibold shadow-xs"
                      : "text-ink-600 hover:text-ink-900 hover:bg-ink-100/70"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-forest-800" : "text-ink-500"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info */}
          <div className="p-3 border-t border-ink-100 bg-ink-50/60">
            <button
              onClick={() => setRole("public_visitor")}
              className="w-full flex items-center justify-between text-xs font-medium text-ink-600 hover:text-danger-700 transition-colors py-2 px-3 rounded-lg hover:bg-white border border-transparent hover:border-ink-200"
            >
              <span>Keluar ke Mode Publik</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

        {/* 3. Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Topbar Header */}
          <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-none border-b border-ink-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2 rounded-md text-ink-600 hover:bg-ink-100 transition-colors"
                aria-label="Buka menu navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-ink-600">
                <span className="font-semibold text-ink-900">Portal Anggota</span>
                <span className="text-ink-300">/</span>
                <span className="text-forest-800 font-medium capitalize">
                  {location.pathname.replace(/^\/portal\/?/, "").replace(/-/g, " ") || "Ringkasan"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <button
                className="p-2 text-ink-600 hover:bg-ink-100 rounded-lg relative transition-colors"
                aria-label="Notifikasi Anggota"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-forest-700 ring-2 ring-white" />
              </button>

              <div className="flex items-center gap-2.5 pl-3 border-l border-ink-200">
                <Avatar name={currentUser.name} size="sm" />
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold text-ink-900 block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-ink-500 font-mono">
                    {currentUser.memberId || "DEMO-ID-0001"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Viewport Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {(() => {
              const accessCheck = canAccessRoute(
                currentUser.role,
                location.pathname,
                config.activeModules
              );
              if (!accessCheck.allowed) {
                return (
                  <AccessDeniedView
                    isModuleInactive={accessCheck.isModuleInactive}
                    reason={accessCheck.reason}
                    currentPath={location.pathname}
                  />
                );
              }
              return <Outlet />;
            })()}
          </main>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Menu Portal Anggota"
        side="left"
      >
        <div className="space-y-4 py-2 text-left">
          <div className="p-3 bg-forest-50 rounded-lg border border-forest-100 flex items-center gap-2.5">
            <Avatar name={currentUser.name} size="sm" />
            <div>
              <div className="text-xs font-bold text-ink-900">{currentUser.name}</div>
              <div className="text-[10px] font-mono text-forest-800">{currentUser.memberId || "DEMO-ID-0001"}</div>
            </div>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/portal"
                  ? location.pathname === "/portal"
                  : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium ${
                    isActive
                      ? "bg-forest-100 text-forest-900 font-semibold"
                      : "text-ink-700 hover:bg-ink-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-ink-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-ink-100">
            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                setRole("public_visitor");
              }}
              className="w-full flex items-center justify-between text-xs text-danger-700 py-2 px-3 rounded hover:bg-danger-50"
            >
              <span>Keluar ke Mode Publik</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
