import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { BrandLogo } from "@/components/common/BrandLogo";
import { DemoRoleSwitcher } from "@/components/common/DemoRoleSwitcher";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
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
          <div className="p-3 m-3 bg-forest-50 border border-forest-100 rounded-lg">
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
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
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
                  <Icon className={`w-4 h-4 ${isActive ? "text-forest-700" : "text-ink-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-3 border-t border-ink-100">
            <button
              onClick={() => setRole("public_visitor")}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-ink-600 hover:text-danger-700 hover:bg-danger-100/40 rounded transition-colors"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Keluar Sesi
              </span>
            </button>
          </div>
        </aside>

        {/* 3. Main Work Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 lg:pb-0">
          {/* Portal Top Bar */}
          <header className="sticky top-0 z-30 bg-white/95 border-b border-ink-200 h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-1.5 rounded text-ink-700 hover:bg-ink-100"
                aria-label="Buka menu navigasi portal"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="lg:hidden">
                <BrandLogo variant="icon-only" size="sm" to="/portal" />
              </div>
              <h1 className="text-sm font-semibold text-ink-900 hidden sm:block">
                Portal Anggota KMB
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/portal/notifikasi"
                className="relative p-2 rounded-full text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-colors"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-forest-700" />
              </Link>
              <div className="h-4 w-[1px] bg-ink-200" />
              <div className="flex items-center gap-2">
                <Avatar name={currentUser.name} size="sm" />
                <div className="hidden sm:block text-left leading-none">
                  <span className="text-xs font-semibold text-ink-900 block truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <Badge variant="success" size="sm" className="text-[10px] px-1 py-0 mt-0.5">
                    Anggota Aktif
                  </Badge>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 4. Mobile Drawer */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Menu Anggota"
        side="left"
      >
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium ${
                  isActive
                    ? "bg-forest-100 text-forest-900 font-semibold"
                    : "text-ink-700 hover:bg-ink-50"
                }`}
              >
                <Icon className="w-4 h-4 text-forest-700" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </Drawer>

      {/* 5. Mobile Bottom Navigation Bar (< 768px) */}
      <nav
        aria-label="Navigasi bawah mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink-200 flex items-center justify-around h-14 px-2 safe-bottom"
      >
        <Link
          to="/portal"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] ${
            location.pathname === "/portal"
              ? "text-forest-700 font-semibold"
              : "text-ink-600 hover:text-ink-900"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Ringkasan</span>
        </Link>

        {config.activeModules.savings && (
          <Link
            to="/portal/simpanan"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] ${
              location.pathname.startsWith("/portal/simpanan")
                ? "text-forest-700 font-semibold"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <Wallet className="w-4 h-4 mb-0.5" />
            <span>Simpanan</span>
          </Link>
        )}

        {config.activeModules.loans && (
          <Link
            to="/portal/pinjaman"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] ${
              location.pathname.startsWith("/portal/pinjaman")
                ? "text-forest-700 font-semibold"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <CreditCard className="w-4 h-4 mb-0.5" />
            <span>Pinjaman</span>
          </Link>
        )}

        <Link
          to="/portal/pembayaran"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] ${
            location.pathname.startsWith("/portal/pembayaran")
              ? "text-forest-700 font-semibold"
              : "text-ink-600 hover:text-ink-900"
          }`}
        >
          <Receipt className="w-4 h-4 mb-0.5" />
          <span>Bayar</span>
        </Link>

        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] text-ink-600 hover:text-ink-900"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>Lainnya</span>
        </button>
      </nav>
    </div>
  );
};
