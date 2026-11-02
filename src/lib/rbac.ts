import { Role } from "@/types";

export type Domain =
  | "membership"
  | "savings"
  | "loans"
  | "installments"
  | "cash"
  | "reports"
  | "users"
  | "platform_config"
  | "product_config"
  | "audit"
  | "demo_tools";

export type Action =
  | "view"
  | "create"
  | "update"
  | "verify"
  | "recommend"
  | "approve"
  | "reject"
  | "adjust"
  | "disburse"
  | "reconcile"
  | "export"
  | "deactivate"
  | "record"
  | "review"
  | "reset_demo";

export type Permission = `${Domain}:${Action}`;

// 8 Authenticated Roles strictly defined in Information Architecture Section 5.3 & 5.4
export const AUTHENTICATED_ROLES: Role[] = [
  "member",
  "staff",
  "finance_officer",
  "treasurer",
  "manager",
  "auditor",
  "admin",
  "super_admin",
];

// 2 Public Contexts (Unauthenticated Public Preview)
export const PUBLIC_CONTEXTS: Role[] = ["public_visitor", "applicant"];

export function isAuthenticatedRole(role: Role): boolean {
  return AUTHENTICATED_ROLES.includes(role);
}

export function isPublicContext(role: Role): boolean {
  return PUBLIC_CONTEXTS.includes(role);
}

// Canonical Permission Matrix based on INFORMATION_ARCHITECTURE.md Section 5.4
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  // Public Contexts (Preview Only - No Portal or Admin rights)
  public_visitor: ["membership:view"],
  applicant: ["membership:view", "membership:create"],

  // 1. Member: Portal access only, view own data (V~)
  member: [
    "membership:view",
    "membership:update",
    "savings:view",
    "savings:record",
    "loans:view",
    "installments:view",
    "installments:record",
    "reports:view",
    "reports:export",
  ],

  // 2. Staff: Operational administration (Verifikasi & Rekomendasi, Pencatatan Lapangan)
  staff: [
    "membership:view",
    "membership:create",
    "membership:update",
    "membership:verify",
    "membership:recommend",
    "savings:view",
    "savings:record",
    "savings:verify",
    "loans:view",
    "loans:review",
    "installments:view",
    "installments:record",
    "installments:verify",
  ],

  // 3. Finance Officer: Operational financial processing & Level 2 Loan Approval
  finance_officer: [
    "membership:view",
    "savings:view",
    "savings:record",
    "savings:verify",
    "savings:approve",
    "loans:view",
    "loans:review",
    "loans:approve",
    "loans:disburse",
    "installments:view",
    "installments:record",
    "installments:verify",
    "cash:view",
    "cash:record",
    "cash:reconcile",
    "reports:view",
    "reports:export",
    "product_config:view",
  ],

  // 4. Treasurer: Financial Authority & Liquidity Oversight (Buku Kas, Koreksi Saldo/Denda)
  treasurer: [
    "membership:view",
    "savings:view",
    "savings:approve",
    "savings:adjust",
    "loans:view",
    "installments:view",
    "installments:adjust",
    "cash:view",
    "cash:record",
    "cash:reconcile",
    "cash:approve",
    "reports:view",
    "reports:export",
    "platform_config:view",
    "product_config:view",
    "product_config:update",
  ],

  // 5. Manager: Governance & Board Authority (Persetujuan Final Keanggotaan, Level 3 Pinjaman, Otorisasi Kas)
  manager: [
    "membership:view",
    "membership:approve",
    "membership:reject",
    "savings:view",
    "savings:approve",
    "loans:view",
    "loans:review",
    "loans:approve",
    "cash:view",
    "cash:approve",
    "reports:view",
    "reports:export",
    "users:view",
    "platform_config:view",
    "product_config:view",
    "product_config:update",
    "product_config:approve",
    "audit:view",
  ],

  // 6. Auditor: Governance / Oversight (MURNI READ-ONLY & EXPORT, Tanpa Hak Tulis/Ubah/Persetujuan)
  auditor: [
    "membership:view",
    "savings:view",
    "loans:view",
    "loans:review",
    "installments:view",
    "cash:view",
    "reports:view",
    "reports:export",
    "audit:view",
    "audit:export",
  ],

  // 7. Administrator: System Maintenance & Technical Management (TANPA KEWENANGAN TRANSAKSI KEUANGAN)
  admin: [
    "membership:view",
    "membership:create",
    "membership:update",
    "users:view",
    "users:create",
    "users:update",
    "users:deactivate",
    "platform_config:view",
    "platform_config:update",
    "product_config:view",
    "product_config:update",
    "audit:view",
    "audit:export",
    "reports:view",
    "reports:export",
  ],

  // 8. Super Administrator: Platform Configuration & Demo Reset Control (TANPA KEWENANGAN BISNIS/FINANSIAL)
  super_admin: [
    "users:view",
    "users:create",
    "users:update",
    "users:deactivate",
    "platform_config:view",
    "platform_config:update",
    "audit:view",
    "audit:export",
    "reports:view",
    "reports:export",
    "demo_tools:reset_demo",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

export function canPerformAction(role: Role, domain: Domain, action: Action): boolean {
  return hasPermission(role, `${domain}:${action}`);
}

/**
 * Route access evaluator.
 * Checks whether the specified role is permitted to directly access a given pathname.
 */
export function canAccessRoute(
  role: Role,
  pathname: string
): { allowed: boolean; reason?: string } {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // 1. Public Website routes are open to everyone
  if (
    cleanPath === "/" ||
    cleanPath === "/tentang" ||
    cleanPath === "/daftar" ||
    cleanPath === "/cara-bergabung" ||
    cleanPath === "/transparansi" ||
    cleanPath.startsWith("/layanan")
  ) {
    return { allowed: true };
  }

  // 2. Member Portal (/portal and subpaths)
  if (cleanPath === "/portal" || cleanPath.startsWith("/portal/")) {
    if (role === "member") {
      return { allowed: true };
    }
    if (isPublicContext(role)) {
      return {
        allowed: false,
        reason:
          "Member Portal memerlukan akun Anggota terautentikasi. Anda sedang dalam konteks Publik.",
      };
    }
    return {
      allowed: false,
      reason: `Peran Anda (${role}) adalah akun internal administrasi/manajemen. Portal Anggota khusus untuk akun berstatus Anggota Aktif (Member).`,
    };
  }

  // 3. Administration System (/admin and subpaths)
  if (cleanPath === "/admin" || cleanPath.startsWith("/admin/")) {
    // Public visitors and applicants CANNOT enter admin
    if (isPublicContext(role)) {
      return {
        allowed: false,
        reason:
          "Area Administrasi memerlukan autentikasi staf, pejabat keuangan, manajemen, atau administrator. Konteks publik tidak memiliki izin.",
      };
    }

    // Members CANNOT enter admin
    if (role === "member") {
      return {
        allowed: false,
        reason:
          "Anggota Koperasi (Member) tidak memiliki izin mengakses sistem administrasi internal demi menjaga kerahasiaan data dan tata kelola.",
      };
    }

    // Role-specific granular subpaths within /admin
    if (cleanPath === "/admin") {
      return { allowed: true };
    }

    // Verifikasi Keanggotaan: Staff (verify/rec) and Manager (approve) and Auditor (read-only view)
    if (cleanPath.startsWith("/admin/anggota/verifikasi")) {
      if (["staff", "manager", "auditor", "admin"].includes(role)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "Verifikasi dan persetujuan calon anggota hanya dapat diakses oleh Staf Operasional (verifikasi) dan Manajer/Pengurus (persetujuan final).",
      };
    }

    // Direktori Anggota
    if (cleanPath.startsWith("/admin/anggota")) {
      if (hasPermission(role, "membership:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Anda tidak memiliki izin melihat data direktori anggota.",
      };
    }

    // Buku Kas & Keuangan: Finance Officer, Treasurer, Manager, Auditor
    if (cleanPath.startsWith("/admin/keuangan")) {
      if (hasPermission(role, "cash:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "Manajemen kas dan rekonsiliasi keuangan dibatasi untuk Petugas Keuangan, Bendahara, Pengurus, atau Auditor. Administrator teknis dan Staf operasional tidak memiliki akses.",
      };
    }

    // Laporan Keuangan
    if (cleanPath.startsWith("/admin/laporan")) {
      if (hasPermission(role, "reports:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Peran Anda tidak memiliki izin mengakses laporan keuangan institusional.",
      };
    }

    // Audit Log
    if (cleanPath.startsWith("/admin/audit")) {
      if (hasPermission(role, "audit:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "Jejak audit (audit trail) hanya dapat diakses oleh Auditor/Pengawas, Manajer/Pengurus, dan Administrator Sistem.",
      };
    }

    // Pengaturan Platform
    if (cleanPath.startsWith("/admin/pengaturan")) {
      if (hasPermission(role, "platform_config:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "Konfigurasi platform teknis dan arsitektur modular hanya dapat diakses oleh Administrator Sistem, Super Administrator, Bendahara, atau Manajer.",
      };
    }

    // Manajemen Simpanan & Pinjaman Admin
    if (cleanPath.startsWith("/admin/simpanan")) {
      if (hasPermission(role, "savings:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Anda tidak memiliki izin mengelola modul simpanan.",
      };
    }

    if (cleanPath.startsWith("/admin/pinjaman")) {
      if (hasPermission(role, "loans:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Anda tidak memiliki izin mengelola modul pinjaman.",
      };
    }

    // Default admin subpaths
    return { allowed: true };
  }

  return { allowed: true };
}
