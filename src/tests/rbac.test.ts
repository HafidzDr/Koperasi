import { describe, it, expect } from "vitest";
import {
  AUTHENTICATED_ROLES,
  PUBLIC_CONTEXTS,
  isAuthenticatedRole,
  isPublicContext,
  hasPermission,
  canPerformAction,
  canAccessRoute,
  ROLE_PERMISSIONS,
  Domain,
  Action,
  KNOWN_ADMIN_ROUTES,
  KNOWN_MEMBER_ROUTES,
  KNOWN_PUBLIC_ROUTES,
} from "../lib/rbac";
import { demoRoleCatalog, demoUsers, defaultCooperativeConfig } from "../mocks/seedData";
import { Role, BusinessModuleKey } from "../types";

describe("PHASE 2.2 RBAC Hardening & Test Integrity", () => {
  const activeModules = defaultCooperativeConfig.activeModules;

  describe("P0.1 — Deny By Default Route Guard", () => {
    it("Unrecognized /admin subroutes must be strictly DENIED by default for all roles", () => {
      const unknownAdminPaths = [
        "/admin/unknown-route",
        "/admin/pengguna/hapus",
        "/admin/transaksi/hapus",
        "/admin/hack",
        "/admin/secret-admin-area",
      ];

      const allRoles: Role[] = [...AUTHENTICATED_ROLES, ...PUBLIC_CONTEXTS];

      for (const role of allRoles) {
        for (const unknownPath of unknownAdminPaths) {
          const result = canAccessRoute(role, unknownPath, activeModules);
          expect(result.allowed).toBe(false);
          expect(result.reason).toBeDefined();
        }
      }

      // For authenticated admin roles, the reason must explicitly be Deny by Default
      const adminRoles = AUTHENTICATED_ROLES.filter((r) => r !== "member");
      for (const role of adminRoles) {
        for (const unknownPath of unknownAdminPaths) {
          const result = canAccessRoute(role, unknownPath, activeModules);
          expect(result.allowed).toBe(false);
          expect(result.reason).toContain("Deny by Default");
        }
      }
    });

    it("Unrecognized top-level routes must be strictly DENIED by default", () => {
      const unknownTopPaths = [
        "/secret",
        "/api/users",
        "/portal-admin",
        "/config.json",
        "/debug",
      ];

      const allRoles: Role[] = [...AUTHENTICATED_ROLES, ...PUBLIC_CONTEXTS];

      for (const role of allRoles) {
        for (const p of unknownTopPaths) {
          const result = canAccessRoute(role, p, activeModules);
          expect(result.allowed).toBe(false);
          expect(result.reason).toContain("Deny by Default");
        }
      }
    });

    it("Unrecognized /portal subroutes must be strictly DENIED by default for Member", () => {
      const unknownMemberPaths = [
        "/portal/hack",
        "/portal/transfer-eksternal",
        "/portal/admin-override",
      ];

      for (const p of unknownMemberPaths) {
        const result = canAccessRoute("member", p, activeModules);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("Deny by Default");
      }
    });

    it("Module deactivation enforces denial on direct URL access for both portal and admin", () => {
      const deactivatedModules: Record<BusinessModuleKey, boolean> = {
        ...activeModules,
        savings: false,
        loans: false,
        reports: false,
      };

      // Member attempting to access deactivated savings or loans
      const memberSavings = canAccessRoute("member", "/portal/simpanan", deactivatedModules);
      expect(memberSavings.allowed).toBe(false);
      expect(memberSavings.isModuleInactive).toBe(true);
      expect(memberSavings.moduleKey).toBe("savings");

      const memberLoans = canAccessRoute("member", "/portal/pinjaman", deactivatedModules);
      expect(memberLoans.allowed).toBe(false);
      expect(memberLoans.isModuleInactive).toBe(true);
      expect(memberLoans.moduleKey).toBe("loans");

      // Staff attempting to access deactivated savings in admin
      const staffSavings = canAccessRoute("staff", "/admin/simpanan", deactivatedModules);
      expect(staffSavings.allowed).toBe(false);
      expect(staffSavings.isModuleInactive).toBe(true);

      // Manager attempting to access deactivated reports in admin
      const managerReports = canAccessRoute("manager", "/admin/laporan", deactivatedModules);
      expect(managerReports.allowed).toBe(false);
      expect(managerReports.isModuleInactive).toBe(true);
    });

    it("Comprehensive matrix: every single role tested against every known admin route", () => {
      const allRoles: Role[] = [...AUTHENTICATED_ROLES, ...PUBLIC_CONTEXTS];

      for (const role of allRoles) {
        for (const adminRoute of KNOWN_ADMIN_ROUTES) {
          const res = canAccessRoute(role, adminRoute, activeModules);

          // Public contexts and Member role must ALWAYS be denied on every admin route
          if (isPublicContext(role) || role === "member") {
            expect(res.allowed).toBe(false);
          }

          // Administrator & Super Administrator must ALWAYS be denied on financial transaction routes
          if (role === "admin" || role === "super_admin") {
            if (
              adminRoute === "/admin/keuangan" ||
              adminRoute === "/admin/simpanan" ||
              adminRoute === "/admin/pinjaman"
            ) {
              expect(res.allowed).toBe(false);
            }
          }

          // Staff must be denied on /admin/keuangan, /admin/laporan, and /admin/pengaturan
          if (role === "staff") {
            if (
              adminRoute === "/admin/keuangan" ||
              adminRoute === "/admin/laporan" ||
              adminRoute === "/admin/pengaturan"
            ) {
              expect(res.allowed).toBe(false);
            }
          }

          // Finance Officer must be denied on /admin/anggota/verifikasi and /admin/pengaturan
          if (role === "finance_officer") {
            if (
              adminRoute === "/admin/anggota/verifikasi" ||
              adminRoute === "/admin/pengaturan"
            ) {
              expect(res.allowed).toBe(false);
            }
          }

          // Auditor must be denied on /admin/pengaturan
          if (role === "auditor") {
            if (adminRoute === "/admin/pengaturan") {
              expect(res.allowed).toBe(false);
            }
          }
        }
      }
    });
  });

  describe("P0.2 — Role Switcher & Action Protection", () => {
    it("Available demo roles match exactly 8 authenticated and 2 public contexts", () => {
      expect(AUTHENTICATED_ROLES).toHaveLength(8);
      expect(PUBLIC_CONTEXTS).toHaveLength(2);
      expect(demoRoleCatalog).toHaveLength(10);

      for (const r of AUTHENTICATED_ROLES) {
        expect(isAuthenticatedRole(r)).toBe(true);
        expect(demoUsers[r]).toBeDefined();
      }

      for (const ctx of PUBLIC_CONTEXTS) {
        expect(isAuthenticatedRole(ctx)).toBe(false);
        expect(demoUsers[ctx]).toBeDefined();
      }

      expect(KNOWN_PUBLIC_ROUTES.length).toBeGreaterThan(0);
      expect(KNOWN_MEMBER_ROUTES.length).toBeGreaterThan(0);
    });

    it("Only roles with platform_config:update (Admin & Super Admin) can modify module configuration", () => {
      expect(canPerformAction("admin", "platform_config", "update")).toBe(true);
      expect(canPerformAction("super_admin", "platform_config", "update")).toBe(true);

      const unauthorizedRoles: Role[] = [
        "member",
        "staff",
        "finance_officer",
        "treasurer",
        "manager",
        "auditor",
        "public_visitor",
        "applicant",
      ];

      for (const r of unauthorizedRoles) {
        expect(canPerformAction(r, "platform_config", "update")).toBe(false);
      }
    });

    it("Only Super Administrator has authority to execute demo environment reset", () => {
      expect(canPerformAction("super_admin", "demo_tools", "reset_demo")).toBe(true);

      const nonSuperAdminRoles: Role[] = [
        "member",
        "staff",
        "finance_officer",
        "treasurer",
        "manager",
        "auditor",
        "admin",
        "public_visitor",
        "applicant",
      ];

      for (const r of nonSuperAdminRoles) {
        expect(canPerformAction(r, "demo_tools", "reset_demo")).toBe(false);
      }
    });
  });

  describe("P1.1 — Membership Verification Separation of Duties (SoD)", () => {
    it("Staff has verification and recommendation authority, but ZERO final approval or rejection rights", () => {
      expect(hasPermission("staff", "membership:verify")).toBe(true);
      expect(hasPermission("staff", "membership:recommend")).toBe(true);
      expect(hasPermission("staff", "membership:approve")).toBe(false);
      expect(hasPermission("staff", "membership:reject")).toBe(false);
    });

    it("Manager holds final membership approval and rejection authority", () => {
      expect(hasPermission("manager", "membership:approve")).toBe(true);
      expect(hasPermission("manager", "membership:reject")).toBe(true);
    });

    it("Auditor holds purely read-only inspection access without mutation or approval authority", () => {
      expect(hasPermission("auditor", "membership:view")).toBe(true);
      expect(hasPermission("auditor", "membership:verify")).toBe(false);
      expect(hasPermission("auditor", "membership:recommend")).toBe(false);
      expect(hasPermission("auditor", "membership:approve")).toBe(false);
      expect(hasPermission("auditor", "membership:reject")).toBe(false);
    });

    it("Admin and Super Admin have no membership approval authority", () => {
      expect(hasPermission("admin", "membership:approve")).toBe(false);
      expect(hasPermission("super_admin", "membership:approve")).toBe(false);
    });
  });

  describe("P1.2 — Financial Transaction Separation of Duties (SoD)", () => {
    it("Admin and Super Admin have ZERO financial mutation, approval, or execution permissions", () => {
      const financialTransactions = [
        "savings:record",
        "savings:approve",
        "savings:adjust",
        "loans:disburse",
        "loans:approve",
        "cash:record",
        "cash:reconcile",
        "cash:approve",
        "installments:adjust",
      ] as const;

      for (const action of financialTransactions) {
        const [domain, act] = action.split(":");
        expect(canPerformAction("admin", domain as Domain, act as Action)).toBe(false);
        expect(canPerformAction("super_admin", domain as Domain, act as Action)).toBe(false);
      }
    });

    it("Auditor has ZERO mutation or approval actions across all domains", () => {
      const auditorPermissions = ROLE_PERMISSIONS["auditor"];
      for (const perm of auditorPermissions) {
        const action = perm.split(":")[1];
        expect(["view", "export", "review"]).toContain(action);
      }
    });
  });
});
