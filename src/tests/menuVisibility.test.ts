import { describe, it, expect } from "vitest";
import {
  getPermittedAdminHrefs,
  getPermittedAdminNavSections,
  AUTHENTICATED_ROLES,
  PUBLIC_CONTEXTS,
} from "../lib/rbac";
import { defaultCooperativeConfig } from "../mocks/seedData";
import { BusinessModuleKey } from "../types";

describe("PHASE 2.2 Centralized Menu Visibility Engine Tests", () => {
  const defaultModules = defaultCooperativeConfig.activeModules;
  const allModulesActive: Record<BusinessModuleKey, boolean> = {
    savings: true,
    loans: true,
    installments: true,
    business_units: true,
    meetings: true,
    shu: true,
    notifications: true,
    reports: true,
    audit_trail: true,
  };

  it("Public contexts and Member role must have ZERO admin navigation sections", () => {
    for (const ctx of PUBLIC_CONTEXTS) {
      const sections = getPermittedAdminNavSections(ctx, allModulesActive);
      expect(sections).toHaveLength(0);
      expect(getPermittedAdminHrefs(ctx, allModulesActive)).toHaveLength(0);
    }

    const memberSections = getPermittedAdminNavSections("member", allModulesActive);
    expect(memberSections).toHaveLength(0);
    expect(getPermittedAdminHrefs("member", allModulesActive)).toHaveLength(0);
  });

  it("Staff menus: must contain operational member & verification items, but exclude financial management & platform settings", () => {
    const staffHrefs = getPermittedAdminHrefs("staff", allModulesActive);

    expect(staffHrefs).toContain("/admin");
    expect(staffHrefs).toContain("/admin/anggota/verifikasi");
    expect(staffHrefs).toContain("/admin/anggota");
    expect(staffHrefs).toContain("/admin/simpanan");
    expect(staffHrefs).toContain("/admin/pinjaman");
    expect(staffHrefs).toContain("/admin/unit-usaha");
    expect(staffHrefs).toContain("/admin/rapat");

    // Strict exclusions for Staff
    expect(staffHrefs).not.toContain("/admin/keuangan");
    expect(staffHrefs).not.toContain("/admin/laporan");
    expect(staffHrefs).not.toContain("/admin/audit");
    expect(staffHrefs).not.toContain("/admin/pengaturan");
  });

  it("Finance Officer menus: must contain financial operations & reports, but exclude membership verification & platform settings", () => {
    const foHrefs = getPermittedAdminHrefs("finance_officer", allModulesActive);

    expect(foHrefs).toContain("/admin");
    expect(foHrefs).toContain("/admin/simpanan");
    expect(foHrefs).toContain("/admin/pinjaman");
    expect(foHrefs).toContain("/admin/keuangan");
    expect(foHrefs).toContain("/admin/laporan");
    expect(foHrefs).toContain("/admin/unit-usaha");
    expect(foHrefs).toContain("/admin/anggota");

    // Strict exclusions for Finance Officer
    expect(foHrefs).not.toContain("/admin/anggota/verifikasi");
    expect(foHrefs).not.toContain("/admin/pengaturan");
    expect(foHrefs).not.toContain("/admin/audit");
    expect(foHrefs).not.toContain("/admin/rapat");
  });

  it("Treasurer menus: must contain cash/finance, liquidity reports, and platform settings (view), but exclude membership verification & audit trail", () => {
    const treasurerHrefs = getPermittedAdminHrefs("treasurer", allModulesActive);

    expect(treasurerHrefs).toContain("/admin");
    expect(treasurerHrefs).toContain("/admin/keuangan");
    expect(treasurerHrefs).toContain("/admin/simpanan");
    expect(treasurerHrefs).toContain("/admin/pinjaman");
    expect(treasurerHrefs).toContain("/admin/laporan");
    expect(treasurerHrefs).toContain("/admin/pengaturan");

    // Strict exclusions for Treasurer
    expect(treasurerHrefs).not.toContain("/admin/anggota/verifikasi");
    expect(treasurerHrefs).not.toContain("/admin/audit");
    expect(treasurerHrefs).not.toContain("/admin/rapat");
  });

  it("Manager menus: must have broad governance access (verification final approval, cash book approval, executive reports, audit, platform)", () => {
    const managerHrefs = getPermittedAdminHrefs("manager", allModulesActive);

    expect(managerHrefs).toContain("/admin");
    expect(managerHrefs).toContain("/admin/anggota/verifikasi");
    expect(managerHrefs).toContain("/admin/anggota");
    expect(managerHrefs).toContain("/admin/simpanan");
    expect(managerHrefs).toContain("/admin/pinjaman");
    expect(managerHrefs).toContain("/admin/keuangan");
    expect(managerHrefs).toContain("/admin/unit-usaha");
    expect(managerHrefs).toContain("/admin/rapat");
    expect(managerHrefs).toContain("/admin/laporan");
    expect(managerHrefs).toContain("/admin/audit");
    expect(managerHrefs).toContain("/admin/pengaturan");
  });

  it("Auditor menus: must have read-only inspection menus (audit, laporan, keuangan, verifikasi, simpanan), but NOT platform settings", () => {
    const auditorHrefs = getPermittedAdminHrefs("auditor", allModulesActive);

    expect(auditorHrefs).toContain("/admin");
    expect(auditorHrefs).toContain("/admin/audit");
    expect(auditorHrefs).toContain("/admin/laporan");
    expect(auditorHrefs).toContain("/admin/keuangan");
    expect(auditorHrefs).toContain("/admin/simpanan");
    expect(auditorHrefs).toContain("/admin/pinjaman");
    expect(auditorHrefs).toContain("/admin/anggota");
    expect(auditorHrefs).toContain("/admin/anggota/verifikasi");

    // Auditor cannot access platform settings
    expect(auditorHrefs).not.toContain("/admin/pengaturan");
  });

  it("Administrator menus: must contain platform settings, audit trail, and member directory, but ZERO financial transaction menus", () => {
    const adminHrefs = getPermittedAdminHrefs("admin", allModulesActive);

    expect(adminHrefs).toContain("/admin");
    expect(adminHrefs).toContain("/admin/pengaturan");
    expect(adminHrefs).toContain("/admin/audit");
    expect(adminHrefs).toContain("/admin/laporan");
    expect(adminHrefs).toContain("/admin/anggota");

    // Strict SoD: Admin has ZERO operational financial menus
    expect(adminHrefs).not.toContain("/admin/keuangan");
    expect(adminHrefs).not.toContain("/admin/simpanan");
    expect(adminHrefs).not.toContain("/admin/pinjaman");
    expect(adminHrefs).not.toContain("/admin/anggota/verifikasi");
  });

  it("Super Administrator menus: focused strictly on system platform, audit, and technical oversight, with ZERO operational financial menus", () => {
    const superAdminHrefs = getPermittedAdminHrefs("super_admin", allModulesActive);

    expect(superAdminHrefs).toContain("/admin");
    expect(superAdminHrefs).toContain("/admin/pengaturan");
    expect(superAdminHrefs).toContain("/admin/audit");
    expect(superAdminHrefs).toContain("/admin/laporan");

    // Zero operational financial or member verification menus
    expect(superAdminHrefs).not.toContain("/admin/keuangan");
    expect(superAdminHrefs).not.toContain("/admin/simpanan");
    expect(superAdminHrefs).not.toContain("/admin/pinjaman");
    expect(superAdminHrefs).not.toContain("/admin/anggota/verifikasi");
  });

  it("All 8 authenticated roles produce valid non-empty navigation sections for Admin Portal (excluding Member)", () => {
    const adminRoles = AUTHENTICATED_ROLES.filter((r) => r !== "member");
    for (const role of adminRoles) {
      const sections = getPermittedAdminNavSections(role, allModulesActive);
      expect(sections.length).toBeGreaterThan(0);
      for (const sec of sections) {
        expect(sec.items.length).toBeGreaterThan(0);
        for (const item of sec.items) {
          expect(item.href).toMatch(/^\/admin/);
        }
      }
    }
  });

  it("Default seed state: inactive modules (business_units & meetings) do NOT appear in the menu", () => {
    expect(defaultModules.business_units).toBe(false);
    expect(defaultModules.meetings).toBe(false);

    const managerDefaultHrefs = getPermittedAdminHrefs("manager", defaultModules);
    expect(managerDefaultHrefs).not.toContain("/admin/unit-usaha");
    expect(managerDefaultHrefs).not.toContain("/admin/rapat");
  });

  it("Dynamic module deactivation: menus for deactivated modules immediately disappear", () => {
    const customModules: Record<BusinessModuleKey, boolean> = {
      ...allModulesActive,
      savings: false,
      loans: false,
      reports: false,
    };

    // Manager normally sees all three, but now should see none of the three deactivated ones
    const managerHrefs = getPermittedAdminHrefs("manager", customModules);
    expect(managerHrefs).not.toContain("/admin/simpanan");
    expect(managerHrefs).not.toContain("/admin/pinjaman");
    expect(managerHrefs).not.toContain("/admin/laporan");

    // Other active modules still appear
    expect(managerHrefs).toContain("/admin");
    expect(managerHrefs).toContain("/admin/keuangan");
    expect(managerHrefs).toContain("/admin/audit");
    expect(managerHrefs).toContain("/admin/pengaturan");
  });
});
