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
import {
  canAccessRoute,
  isPublicContext,
  getPermittedAdminNavSections,
} from "@/lib/rbac";
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
  ShoppingBag,
  Vote,
  ExternalLink,
  Eye,
} from "lucide-react";

const ICON_MAP = {
  LayoutDashboard,
  UserCheck,
  Users,
  Wallet,
  CreditCard,
  Landmark,
  ShoppingBag,
  Vote,
  FileSpreadsheet,
  History,
  Settings,
};

export const AdminLayout: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { config } = useConfigStore();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Layout-level Guard: Public context and Member cannot access AdminLayout
  if (isPublicContext(currentUser.role) || currentUser.role === "member") {
    return (
      <div className="min-h-screen bg-ink-50">
        <DemoRoleSwitcher />
        <AccessDeniedView
          reason={
            currentUser.role === "member"
              ? "Anggota Koperasi (Member) tidak memiliki hak akses ke Administration System demi menjaga kerahasiaan data dan tata kelola internal."
              : "Konteks publik tidak memiliki hak akses ke Administration System. Silakan gunakan Demo Role Switcher untuk memilih akun terautentikasi."
          }
          currentPath={location.pathname}
        />
      </div>
    );
  }

  // Centralized single source of truth for permitted navigation sections
  const navSections = getPermittedAdminNavSections(
    currentUser.role,
    config.activeModules
  );

  // Sub-path access check with activeModules evaluation
  const accessCheck = canAccessRoute(
    currentUser.role,
    location.pathname,
    config.activeModules
  );

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

          {/* Active Admin Role Context Badge */}
          <div className="p-3 mx-3 mt-3 bg-forest-50 border border-forest-100 rounded-lg">
            <div className="flex items-center gap-2">
              <Avatar name={currentUser.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink-900 truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant={currentUser.role === "auditor" ? "neutral" : "forest"}
                    size="sm"
                    className="text-[9px] px-1 py-0 uppercase"
                  >
                    {currentUser.role === "auditor" ? "Auditor (Read-Only)" : currentUser.roleName}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto text-left">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = ICON_MAP[item.iconName];
                  const isActive =
                    item.href === "/admin"
                      ? location.pathname === "/admin"
                      : location.pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-forest-800 text-white font-semibold"
                          : "text-ink-700 hover:text-ink-900 hover:bg-ink-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isActive
                              ? "bg-white text-forest-900"
                              : "bg-forest-100 text-forest-800"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom Switcher CTA / Portal preview */}
          <div className="p-3 border-t border-ink-100 bg-ink-50 text-[11px] text-ink-600">
            <Link
              to="/"
              className="flex items-center justify-between hover:text-forest-700 transition-colors"
            >
              <span>Lihat Situs Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
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
                aria-label="Buka menu navigasi administrasi"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-ink-600">
                <span className="font-semibold text-ink-900">Admin Portal</span>
                <span>/</span>
                <span className="text-ink-500 font-mono">
                  {location.pathname.replace(/^\/admin/, "") || "dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentUser.role === "auditor" && (
                <Badge variant="neutral" size="sm" className="hidden sm:inline-flex items-center gap-1">
                  <Eye className="w-3 h-3 text-ink-500" />
                  <span>Read-Only Inspector</span>
                </Badge>
              )}

              <Badge variant="forest" size="sm" className="hidden sm:inline-flex">
                KMB Operational Live
              </Badge>

              <div className="flex items-center gap-2 pl-3 border-l border-ink-200">
                <Avatar name={currentUser.name} size="sm" />
                <span className="text-xs font-medium text-ink-900 hidden md:inline">
                  {currentUser.name}
                </span>
              </div>
            </div>
          </header>

          {/* Main Viewport with Route Protection */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {!accessCheck.allowed ? (
              <AccessDeniedView
                isModuleInactive={accessCheck.isModuleInactive}
                reason={accessCheck.reason}
                currentPath={location.pathname}
              />
            ) : (
              <Outlet />
            )}
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
        <div className="space-y-4 text-left">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <span className="text-[10px] font-bold text-ink-500 uppercase px-2">
                {sec.title}
              </span>
              {sec.items.map((it) => {
                const Icon = ICON_MAP[it.iconName];
                return (
                  <Link
                    key={it.href}
                    to={it.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded text-xs ${
                      location.pathname === it.href
                        ? "bg-forest-800 text-white font-semibold"
                        : "text-ink-700 hover:bg-ink-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{it.label}</span>
                    </div>
                    {it.badge && (
                      <span className="px-1.5 py-0.2 text-[10px] bg-forest-100 text-forest-900 rounded font-bold">
                        {it.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
};
