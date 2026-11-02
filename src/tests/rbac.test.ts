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
} from "../lib/rbac";
import { demoRoleCatalog, demoUsers } from "../mocks/seedData";
import { Role } from "../types";

describe("PHASE 2.1 RBAC & Permission Verification", () => {
  describe("P0.1 — 8 Authenticated Roles & 2 Public Contexts", () => {
    it("should define exactly 8 authenticated roles", () => {
      expect(AUTHENTICATED_ROLES).toHaveLength(8);
      expect(AUTHENTICATED_ROLES).toEqual([
        "member",
        "staff",
        "finance_officer",
        "treasurer",
        "manager",
        "auditor",
        "admin",
        "super_admin",
      ]);
    });

    it("should define exactly 2 public contexts", () => {
      expect(PUBLIC_CONTEXTS).toHaveLength(2);
      expect(PUBLIC_CONTEXTS).toEqual(["public_visitor", "applicant"]);
    });

    it("should correctly identify authenticated roles vs public contexts", () => {
      for (const role of AUTHENTICATED_ROLES) {
        expect(isAuthenticatedRole(role)).toBe(true);
        expect(isPublicContext(role)).toBe(false);
      }

      for (const ctx of PUBLIC_CONTEXTS) {
        expect(isPublicContext(ctx)).toBe(true);
        expect(isAuthenticatedRole(ctx)).toBe(false);
      }
    });

    it("should have seed data for all 8 authenticated roles and 2 public contexts without duplicate or missing IDs", () => {
      const allExpectedRoles: Role[] = [...AUTHENTICATED_ROLES, ...PUBLIC_CONTEXTS];
      expect(demoRoleCatalog).toHaveLength(10);

      const catalogIds = demoRoleCatalog.map((r) => r.id);
      expect(new Set(catalogIds).size).toBe(10); // No duplicates

      for (const roleId of allExpectedRoles) {
        expect(catalogIds).toContain(roleId);
        expect(demoUsers[roleId]).toBeDefined();
        expect(demoUsers[roleId].role).toBe(roleId);
        expect(demoUsers[roleId].name).toBeTruthy();
        expect(demoUsers[roleId].email).toMatch(/\.invalid$/);
      }
    });
  });

  describe("P0.2 — Separation of Duties & Permission Matrix (IA Section 5.4)", () => {
    it("Auditor must be strictly Read-Only with zero mutation or approval permissions", () => {
      const auditorPermissions = ROLE_PERMISSIONS["auditor"];
      expect(auditorPermissions).toBeDefined();

      // Auditor can view
      expect(hasPermission("auditor", "membership:view")).toBe(true);
      expect(hasPermission("auditor", "savings:view")).toBe(true);
      expect(hasPermission("auditor", "loans:view")).toBe(true);
      expect(hasPermission("auditor", "cash:view")).toBe(true);
      expect(hasPermission("auditor", "reports:view")).toBe(true);
      expect(hasPermission("auditor", "audit:view")).toBe(true);

      // Auditor can export
      expect(hasPermission("auditor", "reports:export")).toBe(true);
      expect(hasPermission("auditor", "audit:export")).toBe(true);

      // Auditor CANNOT write, mutate, adjust, or approve
      for (const perm of auditorPermissions) {
        const action = perm.split(":")[1];
        expect(["view", "export", "review"]).toContain(action);
      }

      expect(hasPermission("auditor", "membership:approve")).toBe(false);
      expect(hasPermission("auditor", "membership:verify")).toBe(false);
      expect(hasPermission("auditor", "savings:approve")).toBe(false);
      expect(hasPermission("auditor", "savings:adjust")).toBe(false);
      expect(hasPermission("auditor", "loans:approve")).toBe(false);
      expect(hasPermission("auditor", "loans:disburse")).toBe(false);
      expect(hasPermission("auditor", "cash:record")).toBe(false);
      expect(hasPermission("auditor", "cash:approve")).toBe(false);
      expect(hasPermission("auditor", "platform_config:update")).toBe(false);
    });

    it("Membership: Staff can ONLY verify & recommend; ONLY Manager can approve final", () => {
      // Staff
      expect(hasPermission("staff", "membership:verify")).toBe(true);
      expect(hasPermission("staff", "membership:recommend")).toBe(true);
      expect(hasPermission("staff", "membership:approve")).toBe(false);
      expect(hasPermission("staff", "membership:reject")).toBe(false);

      // Manager
      expect(hasPermission("manager", "membership:approve")).toBe(true);
      expect(hasPermission("manager", "membership:reject")).toBe(true);

      // Admin & Super Admin CANNOT approve or verify membership
      expect(hasPermission("admin", "membership:approve")).toBe(false);
      expect(hasPermission("admin", "membership:verify")).toBe(false);
      expect(hasPermission("super_admin", "membership:approve")).toBe(false);
    });

    it("Financial Transactions: Admin and Super Admin MUST NOT have financial actions", () => {
      const financialActions = [
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

      for (const action of financialActions) {
        const [domain, act] = action.split(":");
        expect(canPerformAction("admin", domain as Domain, act as Action)).toBe(false);
        expect(canPerformAction("super_admin", domain as Domain, act as Action)).toBe(false);
      }
    });

    it("Finance Officer & Treasurer have appropriate financial permissions", () => {
      // Finance Officer: loans level 2 approval & disburse, cash record & reconcile
      expect(hasPermission("finance_officer", "loans:approve")).toBe(true);
      expect(hasPermission("finance_officer", "loans:disburse")).toBe(true);
      expect(hasPermission("finance_officer", "cash:record")).toBe(true);
      expect(hasPermission("finance_officer", "cash:reconcile")).toBe(true);
      expect(hasPermission("finance_officer", "cash:approve")).toBe(false); // Treasurer/Manager approves cash book

      // Treasurer: cash approval, savings adjust, installment adjust
      expect(hasPermission("treasurer", "cash:approve")).toBe(true);
      expect(hasPermission("treasurer", "savings:adjust")).toBe(true);
      expect(hasPermission("treasurer", "installments:adjust")).toBe(true);
      expect(hasPermission("treasurer", "loans:disburse")).toBe(false); // Disburse is Finance Officer execution
    });

    it("Demo Reset is exclusively restricted to Super Administrator", () => {
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

  describe("P0.3 — Route Guard & Direct URL Access Verification", () => {
    it("Public website routes should be accessible to all roles and contexts", () => {
      const publicPaths = ["/", "/tentang", "/daftar", "/cara-bergabung", "/transparansi"];
      const allRoles: Role[] = [...AUTHENTICATED_ROLES, ...PUBLIC_CONTEXTS];

      for (const r of allRoles) {
        for (const p of publicPaths) {
          const res = canAccessRoute(r, p);
          expect(res.allowed).toBe(true);
        }
      }
    });

    it("Member Portal (/portal) must ONLY be accessible to Member role", () => {
      // Member allowed
      expect(canAccessRoute("member", "/portal").allowed).toBe(true);
      expect(canAccessRoute("member", "/portal/simpanan").allowed).toBe(true);

      // Public contexts rejected
      expect(canAccessRoute("public_visitor", "/portal").allowed).toBe(false);
      expect(canAccessRoute("applicant", "/portal").allowed).toBe(false);

      // Internal admin staff rejected from member portal
      expect(canAccessRoute("staff", "/portal").allowed).toBe(false);
      expect(canAccessRoute("finance_officer", "/portal").allowed).toBe(false);
      expect(canAccessRoute("manager", "/portal").allowed).toBe(false);
      expect(canAccessRoute("admin", "/portal").allowed).toBe(false);
      expect(canAccessRoute("super_admin", "/portal").allowed).toBe(false);
    });

    it("Administration System (/admin) must reject Public contexts and Member role", () => {
      expect(canAccessRoute("public_visitor", "/admin").allowed).toBe(false);
      expect(canAccessRoute("applicant", "/admin").allowed).toBe(false);
      expect(canAccessRoute("member", "/admin").allowed).toBe(false);
      expect(canAccessRoute("member", "/admin/keuangan").allowed).toBe(false);
    });

    it("Admin sub-paths must respect granular role restrictions", () => {
      // /admin/keuangan: FO, Treasurer, Manager, Auditor allowed. Staff and Admin denied!
      expect(canAccessRoute("finance_officer", "/admin/keuangan").allowed).toBe(true);
      expect(canAccessRoute("treasurer", "/admin/keuangan").allowed).toBe(true);
      expect(canAccessRoute("auditor", "/admin/keuangan").allowed).toBe(true);
      expect(canAccessRoute("staff", "/admin/keuangan").allowed).toBe(false);
      expect(canAccessRoute("admin", "/admin/keuangan").allowed).toBe(false);

      // /admin/pengaturan: Admin, Super Admin, Treasurer, Manager allowed. Staff, FO, Auditor denied!
      expect(canAccessRoute("admin", "/admin/pengaturan").allowed).toBe(true);
      expect(canAccessRoute("super_admin", "/admin/pengaturan").allowed).toBe(true);
      expect(canAccessRoute("staff", "/admin/pengaturan").allowed).toBe(false);
      expect(canAccessRoute("finance_officer", "/admin/pengaturan").allowed).toBe(false);
      expect(canAccessRoute("auditor", "/admin/pengaturan").allowed).toBe(false);

      // /admin/audit: Auditor, Manager, Admin, Super Admin allowed. Staff and FO denied!
      expect(canAccessRoute("auditor", "/admin/audit").allowed).toBe(true);
      expect(canAccessRoute("manager", "/admin/audit").allowed).toBe(true);
      expect(canAccessRoute("staff", "/admin/audit").allowed).toBe(false);
      expect(canAccessRoute("finance_officer", "/admin/audit").allowed).toBe(false);
    });
  });
});
