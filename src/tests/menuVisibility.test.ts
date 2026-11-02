import { describe, it, expect } from "vitest";
import { hasPermission } from "../lib/rbac";
import { defaultCooperativeConfig } from "../mocks/seedData";
import { Role } from "../types";

describe("PHASE 2.1 Role-Based Menu Visibility & Action Isolation", () => {
  const getPermittedAdminMenus = (role: Role) => {
    const config = defaultCooperativeConfig;
    const items: string[] = ["/admin"];

    // Keanggotaan & Verifikasi
    if (
      hasPermission(role, "membership:verify") ||
      hasPermission(role, "membership:approve") ||
      role === "auditor" ||
      role === "admin"
    ) {
      items.push("/admin/anggota/verifikasi");
    }
    if (hasPermission(role, "membership:view")) {
      items.push("/admin/anggota");
    }

    // Operasional Finansial
    if (config.activeModules.savings && hasPermission(role, "savings:view")) {
      items.push("/admin/simpanan");
    }
    if (config.activeModules.loans && hasPermission(role, "loans:view")) {
      items.push("/admin/pinjaman");
    }
    if (hasPermission(role, "cash:view")) {
      items.push("/admin/keuangan");
    }

    // Laporan & Pengawasan
    if (config.activeModules.reports && hasPermission(role, "reports:view")) {
      items.push("/admin/laporan");
    }
    if (config.activeModules.audit_trail && hasPermission(role, "audit:view")) {
      items.push("/admin/audit");
    }

    // Sistem & Konfigurasi
    if (hasPermission(role, "platform_config:view")) {
      items.push("/admin/pengaturan");
    }

    return items;
  };

  it("Staff menus: must NOT include /admin/keuangan, /admin/laporan, or /admin/pengaturan", () => {
    const staffMenus = getPermittedAdminMenus("staff");
    expect(staffMenus).toContain("/admin");
    expect(staffMenus).toContain("/admin/anggota/verifikasi");
    expect(staffMenus).toContain("/admin/anggota");
    expect(staffMenus).toContain("/admin/simpanan");
    expect(staffMenus).toContain("/admin/pinjaman");

    // Strict SoD exclusions for Staff
    expect(staffMenus).not.toContain("/admin/keuangan");
    expect(staffMenus).not.toContain("/admin/laporan");
    expect(staffMenus).not.toContain("/admin/pengaturan");
    expect(staffMenus).not.toContain("/admin/audit");
  });

  it("Finance Officer menus: must include financial paths, but NOT member verification or platform config", () => {
    const foMenus = getPermittedAdminMenus("finance_officer");
    expect(foMenus).toContain("/admin");
    expect(foMenus).toContain("/admin/simpanan");
    expect(foMenus).toContain("/admin/pinjaman");
    expect(foMenus).toContain("/admin/keuangan");
    expect(foMenus).toContain("/admin/laporan");

    // Excluded from membership verification queue and platform config
    expect(foMenus).not.toContain("/admin/anggota/verifikasi");
    expect(foMenus).not.toContain("/admin/pengaturan");
    expect(foMenus).not.toContain("/admin/audit");
  });

  it("Auditor menus: must include audit trail and reports, but NOT platform config", () => {
    const auditorMenus = getPermittedAdminMenus("auditor");
    expect(auditorMenus).toContain("/admin");
    expect(auditorMenus).toContain("/admin/audit");
    expect(auditorMenus).toContain("/admin/laporan");
    expect(auditorMenus).toContain("/admin/keuangan");
    expect(auditorMenus).toContain("/admin/simpanan");

    // Auditor cannot access platform settings
    expect(auditorMenus).not.toContain("/admin/pengaturan");
  });

  it("Administrator menus: must include platform config and audit, but NOT financial operations", () => {
    const adminMenus = getPermittedAdminMenus("admin");
    expect(adminMenus).toContain("/admin");
    expect(adminMenus).toContain("/admin/pengaturan");
    expect(adminMenus).toContain("/admin/audit");
    expect(adminMenus).toContain("/admin/anggota");

    // Admin has NO financial operations (no /admin/keuangan, no /admin/simpanan, no /admin/pinjaman)
    expect(adminMenus).not.toContain("/admin/keuangan");
    expect(adminMenus).not.toContain("/admin/simpanan");
    expect(adminMenus).not.toContain("/admin/pinjaman");
  });

  it("Super Administrator menus: focused on platform config, audit, and system oversight", () => {
    const superAdminMenus = getPermittedAdminMenus("super_admin");
    expect(superAdminMenus).toContain("/admin");
    expect(superAdminMenus).toContain("/admin/pengaturan");
    expect(superAdminMenus).toContain("/admin/audit");

    // Super Admin has NO operational financial or member verification menus
    expect(superAdminMenus).not.toContain("/admin/keuangan");
    expect(superAdminMenus).not.toContain("/admin/simpanan");
    expect(superAdminMenus).not.toContain("/admin/pinjaman");
    expect(superAdminMenus).not.toContain("/admin/anggota/verifikasi");
  });
});
