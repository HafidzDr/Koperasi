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
  UserCheck,
  Users,
  Wallet,
  CreditCard,
  Landmark,
  FileSpreadsheet,
  History,
  Settings,
  Menu,
  ShieldAlert,
  ShoppingBag,
  Vote,
  ExternalLink,
} from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { config } = useConfigStore();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Grouped menu matching Information Architecture & Domain permissions
  const navSections = [
    {
      title: "Ringkasan Operasional",
      items: [
        { label: "Dashboard Utama", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Keanggotaan & Verifikasi",
      items: [
        { label: "Verifikasi Berkas Calon", href: "/admin/anggota/verifikasi", icon: UserCheck, badge: "4" },
        { label: "Direktori Anggota", href: "/admin/anggota", icon: Users },
      ],
    },
    {
      title: "Operasional Finansial",
      items: [
        ...(config.activeModules.savings
          ? [{ label: "Manajemen Simpanan", href: "/admin/simpanan", icon: Wallet }]
          : []),
        ...(config.activeModules.loans
          ? [{ label: "Pinjaman & Persetujuan", href: "/admin/pinjaman", icon: CreditCard, badge: "2" }]
          : []),
        { label: "Buku Kas & Rekonsiliasi", href: "/admin/keuangan", icon: Landmark },
      ],
    },
    {
      title: "Tata Kelola & Bisnis",
      items: [
        ...(config.activeModules.business_units
          ? [{ label: "Portofolio Unit Usaha", href: "/admin/unit-usaha", icon: ShoppingBag }]
          : []),
        ...(config.activeModules.meetings
          ? [{ label: "Rapat Anggota (RAT)", href: "/admin/rapat", icon: Vote }]
          : []),
      ],
    },
    {
      title: "Laporan & Pengawasan",
      items: [
        ...(config.activeModules.reports
          ? [{ label: "Laporan Keuangan", href: "/admin/laporan", icon: FileSpreadsheet }]
          : []),
        ...(config.activeModules.audit_trail
          ? [{ label: "Audit Trail Operasional", href: "/admin/audit", icon: History }]
          : []),
      ],
    },
    {
      title: "Sistem & Konfigurasi",
      items: [
        { label: "Pengaturan Platform", href: "/admin/pengaturan", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-800">
      {/* 1. Global Demo Switcher */}
      <DemoRoleSwitcher />

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Admin Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-ink-200 shrink-0">
          <div className="p-4 border-b border-ink-100 flex items-center justify-between">
            <BrandLogo size="sm" to="/admin" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-ink-100 text-ink-700 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </div>

          {/* Current Admin Role Indicator */}
          <div className="p-3 m-3 bg-ink-100/70 border border-ink-200 rounded-lg">
            <div className="flex items-center gap-2.5">
              <Avatar name={currentUser.name} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink-900 truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-forest-800 bg-forest-100 px-1.5 py-0.2 rounded">
                    {currentUser.roleName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sectioned Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
            {navSections.map((section) => {
              if (section.items.length === 0) return null;
              return (
                <div key={section.title} className="space-y-1">
                  <h4 className="px-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">
                    {section.title}
                  </h4>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/admin"
                        ? location.pathname === "/admin"
                        : location.pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-forest-700 text-white font-semibold"
                            : "text-ink-700 hover:text-ink-900 hover:bg-ink-100/70"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-ink-500"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-bold rounded tabular-nums ${
                              isActive ? "bg-white text-forest-900" : "bg-forest-100 text-forest-900"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Public Link */}
          <div className="p-3 border-t border-ink-100 text-xs">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 text-ink-600 hover:text-forest-700 rounded hover:bg-ink-50"
            >
              <span>Lihat Website Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* 3. Admin Main Work Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Admin Topbar */}
          <header className="sticky top-0 z-30 bg-white border-b border-ink-200 h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-1.5 rounded text-ink-700 hover:bg-ink-100"
                aria-label="Buka menu navigasi admin"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-semibold text-ink-900">
                Sistem Administrasi KMB
              </h1>
              <Badge variant="forest" size="sm" className="hidden sm:inline-flex">
                Institusi Koperasi
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-ink-600 font-mono hidden md:flex">
                <ShieldAlert className="w-3.5 h-3.5 text-forest-700" />
                <span>SoD: {currentUser.role}</span>
              </div>
              <div className="h-4 w-[1px] bg-ink-200" />
              <div className="flex items-center gap-2">
                <Avatar name={currentUser.name} size="sm" />
                <div className="hidden sm:block text-left leading-none">
                  <span className="text-xs font-semibold text-ink-900 block truncate max-w-[140px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-ink-500 font-medium">
                    {currentUser.roleName}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 4. Mobile Drawer */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Navigasi Administrasi"
        side="left"
      >
        <div className="space-y-4">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <span className="text-[10px] font-bold text-ink-500 uppercase px-2">
                {sec.title}
              </span>
              {sec.items.map((it) => (
                <Link
                  key={it.href}
                  to={it.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded text-xs ${
                    location.pathname === it.href
                      ? "bg-forest-700 text-white font-semibold"
                      : "text-ink-700 hover:bg-ink-100"
                  }`}
                >
                  <span>{it.label}</span>
                  {it.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] bg-forest-100 text-forest-900 rounded font-bold">
                      {it.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
};
