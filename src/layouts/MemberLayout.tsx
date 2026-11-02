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
    { label: "Bantuan", href: "/portal/bantuan", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-800">
      {/* 1. Global Demo Switcher */}
      <DemoRoleSwitcher />

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Desktop Persistent Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-ink-200 shrink-0">
          <div className="p-4 border-b border-ink-100">
            <BrandLogo size="sm" to="/portal" />
          </div>

          {/* Member Card Teaser */}
          <div className="p-3 m-3 bg-forest-50 border border-forest-100 rounded-lg text-left">
            <div className="flex items-center gap-2.5">
              <Avatar name={currentUser.name} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink-900 truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-forest-700 bg-white px-1 rounded border border-forest-600/20">
                    {currentUser.memberId || "DEMO-ID-0001"}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-success-base" />
                </div>
              </div>
            </div>
          </div>

          {/* Nav Items */}
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-forest-100 text-forest-900 font-semibold"
                      : "text-ink-700 hover:text-ink-900 hover:bg-ink-100/70"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info */}
          <div className="p-3 border-t border-ink-100 bg-ink-50">
            <button
              onClick={() => setRole("public_visitor")}
              className="w-full flex items-center justify-between text-xs text-ink-600 hover:text-danger-700 transition-colors py-1 px-2 rounded"
            >
              <span>Keluar ke Publik</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

        {/* 3. Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Topbar */}
          <header className="h-14 bg-white border-b border-ink-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-1.5 rounded-md text-ink-600 hover:bg-ink-100"
                aria-label="Buka menu navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-ink-600">
                <span className="font-semibold text-ink-900">Portal Anggota</span>
                <span>/</span>
                <span className="text-ink-500 font-mono">
                  {location.pathname.replace(/^\/portal/, "") || "ringkasan"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-1.5 text-ink-600 hover:bg-ink-100 rounded-full relative"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-forest-700" />
              </button>

              <div className="flex items-center gap-2 pl-3 border-l border-ink-200">
                <Avatar name={currentUser.name} size="sm" />
                <span className="text-xs font-medium text-ink-900 hidden md:inline">
                  {currentUser.name}
                </span>
                <Badge variant="forest" size="sm" className="hidden sm:inline">
                  Anggota
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Viewport */}
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

      {/* 4. Mobile Bottom Navigation Bar (≤ 768px) */}
      <nav className="lg:hidden bg-white border-t border-ink-200 flex items-center justify-around py-1.5 px-2 shrink-0 z-20">
        <Link
          to="/portal"
          className={`flex flex-col items-center gap-0.5 text-[10px] p-1 ${
            location.pathname === "/portal"
              ? "text-forest-800 font-bold"
              : "text-ink-600"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Ringkasan</span>
        </Link>
        {config.activeModules.savings && (
          <Link
            to="/portal/simpanan"
            className={`flex flex-col items-center gap-0.5 text-[10px] p-1 ${
              location.pathname.startsWith("/portal/simpanan")
                ? "text-forest-800 font-bold"
                : "text-ink-600"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Simpanan</span>
          </Link>
        )}
        {config.activeModules.loans && (
          <Link
            to="/portal/pinjaman"
            className={`flex flex-col items-center gap-0.5 text-[10px] p-1 ${
              location.pathname.startsWith("/portal/pinjaman")
                ? "text-forest-800 font-bold"
                : "text-ink-600"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pinjaman</span>
          </Link>
        )}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] p-1 text-ink-600"
        >
          <Menu className="w-4 h-4" />
          <span>Lainnya</span>
        </button>
      </nav>

      {/* 5. Mobile Drawer */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Menu Anggota KMB"
        side="left"
      >
        <div className="space-y-1 text-left">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs ${
                location.pathname === item.href
                  ? "bg-forest-100 text-forest-900 font-bold"
                  : "text-ink-700 hover:bg-ink-100"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </Drawer>
    </div>
  );
};
