import { Role, BusinessModuleKey } from "@/types";

export type Domain =
  | "membership"
  | "savings"
  | "loans"
  | "installments"
  | "cash"
  | "business_units"
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
    "loans:create",
    "installments:view",
    "installments:record",
    "business_units:view",
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
    "loans:reject",
    "installments:view",
    "installments:record",
    "installments:verify",
    "business_units:view",
    "business_units:record",
    "business_units:verify",
  ],

  // 3. Finance Officer: Operational financial processing & Level 2 Loan Approval
  finance_officer: [
    "membership:view",
    "savings:view",
    "savings:record",
    "savings:verify",
    "savings:approve",
    "savings:reject",
    "loans:view",
    "loans:review",
    "loans:approve",
    "loans:reject",
    "loans:disburse",
    "installments:view",
    "installments:record",
    "installments:verify",
    "cash:view",
    "cash:record",
    "cash:reconcile",
    "business_units:view",
    "business_units:record",
    "business_units:verify",
    "business_units:export",
    "reports:view",
    "reports:export",
    "product_config:view",
  ],

  // 4. Treasurer: Financial Authority & Liquidity Oversight (Buku Kas, Koreksi Saldo/Denda)
  treasurer: [
    "membership:view",
    "savings:view",
    "savings:approve",
    "savings:reject",
    "savings:adjust",
    "loans:view",
    "installments:view",
    "installments:adjust",
    "cash:view",
    "cash:record",
    "cash:reconcile",
    "cash:approve",
    "business_units:view",
    "business_units:export",
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
    "savings:reject",
    "loans:view",
    "loans:review",
    "loans:approve",
    "loans:reject",
    "cash:view",
    "cash:approve",
    "business_units:view",
    "business_units:create",
    "business_units:update",
    "business_units:deactivate",
    "business_units:record",
    "business_units:verify",
    "business_units:export",
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
    "installments:view",
    "cash:view",
    "business_units:view",
    "business_units:export",
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

// ============================================================================
// CENTRALIZED MENU VISIBILITY ENGINE (P1)
// Shared single source of truth between UI (AdminLayout) and Automated Tests
// ============================================================================

export interface AdminNavItem {
  label: string;
  href: string;
  iconName:
    | "LayoutDashboard"
    | "UserCheck"
    | "Users"
    | "Wallet"
    | "CreditCard"
    | "Landmark"
    | "ShoppingBag"
    | "Vote"
    | "FileSpreadsheet"
    | "History"
    | "Settings";
  badge?: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

/**
 * Builds permitted navigation sections for a given role and active module state.
 * Centralized to guarantee that AdminLayout and unit tests use identical logic.
 */
export function getPermittedAdminNavSections(
  role: Role,
  activeModules: Record<BusinessModuleKey, boolean>
): AdminNavSection[] {
  // If not an authenticated admin role, zero sections
  if (isPublicContext(role) || role === "member") {
    return [];
  }

  const rawSections: AdminNavSection[] = [
    {
      title: "Ringkasan Operasional",
      items: [
        { label: "Dashboard Utama", href: "/admin", iconName: "LayoutDashboard" },
      ],
    },
    {
      title: "Keanggotaan & Verifikasi",
      items: [
        // Verifikasi berkas calon: Staf (verifikasi), Manager (persetujuan), Auditor (inspeksi)
        ...(hasPermission(role, "membership:verify") ||
        hasPermission(role, "membership:approve") ||
        role === "auditor"
          ? [
              {
                label: "Verifikasi Berkas Calon",
                href: "/admin/anggota/verifikasi",
                iconName: "UserCheck" as const,
                badge: "4",
              },
            ]
          : []),
        // Direktori anggota: Semua peran dengan membership:view
        ...(hasPermission(role, "membership:view")
          ? [
              {
                label: "Direktori Anggota",
                href: "/admin/anggota",
                iconName: "Users" as const,
              },
            ]
          : []),
      ],
    },
    {
      title: "Operasional Finansial",
      items: [
        // Simpanan: Aktif, role memiliki savings:view, dan BUKAN admin teknis (SoD Catatan Kaki 2)
        ...(activeModules.savings &&
        hasPermission(role, "savings:view") &&
        role !== "admin" &&
        role !== "super_admin"
          ? [
              {
                label: "Manajemen Simpanan",
                href: "/admin/simpanan",
                iconName: "Wallet" as const,
              },
            ]
          : []),
        // Pinjaman: Aktif, role memiliki loans:view, dan BUKAN admin teknis (SoD Catatan Kaki 2)
        ...(activeModules.loans &&
        hasPermission(role, "loans:view") &&
        role !== "admin" &&
        role !== "super_admin"
          ? [
              {
                label: "Pinjaman & Persetujuan",
                href: "/admin/pinjaman",
                iconName: "CreditCard" as const,
                badge: "2",
              },
            ]
          : []),
        // Buku Kas & Rekonsiliasi: Memiliki cash:view dan BUKAN admin teknis atau staf lapangan
        ...(hasPermission(role, "cash:view") &&
        role !== "admin" &&
        role !== "super_admin" &&
        role !== "staff"
          ? [
              {
                label: "Buku Kas & Rekonsiliasi",
                href: "/admin/keuangan",
                iconName: "Landmark" as const,
              },
            ]
          : []),
      ],
    },
    {
      title: "Tata Kelola & Bisnis",
      items: [
        ...(activeModules.business_units &&
        (role === "manager" ||
          role === "staff" ||
          role === "finance_officer" ||
          role === "treasurer" ||
          role === "auditor")
          ? [
              {
                label: "Portofolio Unit Usaha",
                href: "/admin/unit-usaha",
                iconName: "ShoppingBag" as const,
              },
            ]
          : []),
        ...(activeModules.meetings &&
        (role === "manager" || role === "staff" || role === "auditor")
          ? [
              {
                label: "Rapat Anggota (RAT)",
                href: "/admin/rapat",
                iconName: "Vote" as const,
              },
            ]
          : []),
      ],
    },
    {
      title: "Laporan & Pengawasan",
      items: [
        // Laporan keuangan: Modul reports aktif dan has reports:view (Staff tidak punya hak view laporan di 5.4)
        ...(activeModules.reports && hasPermission(role, "reports:view")
          ? [
              {
                label: "Laporan Keuangan",
                href: "/admin/laporan",
                iconName: "FileSpreadsheet" as const,
              },
            ]
          : []),
        // Audit trail: Modul audit_trail aktif dan has audit:view (Auditor, Manager, Admin, Super Admin)
        ...(activeModules.audit_trail && hasPermission(role, "audit:view")
          ? [
              {
                label: "Audit Trail Operasional",
                href: "/admin/audit",
                iconName: "History" as const,
              },
            ]
          : []),
      ],
    },
    {
      title: "Sistem & Konfigurasi",
      items: [
        // Pengaturan platform: Memiliki platform_config:view (Admin, Super Admin, Treasurer, Manager)
        ...(hasPermission(role, "platform_config:view")
          ? [
              {
                label: "Pengaturan Platform",
                href: "/admin/pengaturan",
                iconName: "Settings" as const,
              },
            ]
          : []),
      ],
    },
  ];

  // Return only sections containing at least one permitted item
  return rawSections.filter((section) => section.items.length > 0);
}

/**
 * Returns a flat array of permitted admin hrefs for quick testing.
 */
export function getPermittedAdminHrefs(
  role: Role,
  activeModules: Record<BusinessModuleKey, boolean>
): string[] {
  const sections = getPermittedAdminNavSections(role, activeModules);
  return sections.flatMap((sec) => sec.items.map((it) => it.href));
}

// ============================================================================
// ROUTE PROTECTION & DENY-BY-DEFAULT ENGINE (P0)
// ============================================================================

export interface RouteAccessResult {
  allowed: boolean;
  reason?: string;
  isModuleInactive?: boolean;
  moduleKey?: BusinessModuleKey;
}

// Explicit canonical registry of all valid known routes in routes.tsx
export const KNOWN_PUBLIC_ROUTES = [
  "/",
  "/tentang",
  "/daftar",
  "/status-pengajuan",
  "/cara-bergabung",
  "/transparansi",
  "/layanan/simpanan",
  "/layanan/pinjaman",
] as const;

export const KNOWN_MEMBER_ROUTES = [
  "/portal",
  "/portal/simpanan",
  "/portal/pinjaman",
  "/portal/pembayaran",
  "/portal/shu",
  "/portal/unit-usaha",
  "/portal/rapat",
  "/portal/profil",
  "/portal/bantuan",
] as const;

export const KNOWN_ADMIN_ROUTES = [
  "/admin",
  "/admin/anggota",
  "/admin/anggota/verifikasi",
  "/admin/simpanan",
  "/admin/pinjaman",
  "/admin/keuangan",
  "/admin/unit-usaha",
  "/admin/rapat",
  "/admin/laporan",
  "/admin/audit",
  "/admin/pengaturan",
] as const;

/**
 * Evaluates route access with strict DENY BY DEFAULT policy.
 * Any route not explicitly recognized or authorized produces allowed: false.
 */
export function canAccessRoute(
  role: Role,
  pathname: string,
  activeModules?: Record<BusinessModuleKey, boolean>
): RouteAccessResult {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // --------------------------------------------------------------------------
  // 1. PUBLIC ENVIRONMENT
  // --------------------------------------------------------------------------
  if (
    cleanPath === "/" ||
    cleanPath === "/tentang" ||
    cleanPath === "/daftar" ||
    cleanPath === "/status-pengajuan" ||
    cleanPath === "/cara-bergabung" ||
    cleanPath === "/transparansi" ||
    cleanPath === "/layanan/simpanan" ||
    cleanPath === "/layanan/pinjaman"
  ) {
    if (activeModules) {
      if (cleanPath === "/layanan/simpanan" && !activeModules.savings) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "savings",
          reason: "Layanan Simpanan saat ini sedang dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
      if (cleanPath === "/layanan/pinjaman" && !activeModules.loans) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "loans",
          reason: "Layanan Pinjaman saat ini sedang dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
    }
    return { allowed: true };
  }

  // --------------------------------------------------------------------------
  // 2. MEMBER PORTAL ENVIRONMENT (/portal and subpaths)
  // --------------------------------------------------------------------------
  if (cleanPath === "/portal" || cleanPath.startsWith("/portal/")) {
    // Only 'member' role is allowed into member portal
    if (role !== "member") {
      return {
        allowed: false,
        reason: isPublicContext(role)
          ? "Member Portal memerlukan autentikasi Anggota aktif. Anda sedang dalam konteks Publik."
          : `Peran Anda (${role}) adalah akun internal administrasi/manajemen koperasi, bukan akun Anggota (Member).`,
      };
    }

    // DENY BY DEFAULT on unknown /portal subroutes
    if (!(KNOWN_MEMBER_ROUTES as readonly string[]).includes(cleanPath)) {
      return {
        allowed: false,
        reason: `Rute portal anggota "${cleanPath}" tidak dikenal atau tidak terdaftar dalam sistem (Deny by Default).`,
      };
    }

    // Check module dependencies for member subroutes
    if (activeModules) {
      if (cleanPath === "/portal/simpanan" && !activeModules.savings) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "savings",
          reason: "Modul Simpanan saat ini dinonaktifkan oleh administrator koperasi.",
        };
      }
      if (cleanPath === "/portal/pinjaman" && !activeModules.loans) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "loans",
          reason: "Modul Pinjaman saat ini dinonaktifkan oleh administrator koperasi.",
        };
      }
      if (cleanPath === "/portal/shu" && !activeModules.shu) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "shu",
          reason: "Modul SHU saat ini dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
      if (cleanPath === "/portal/unit-usaha" && !activeModules.business_units) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "business_units",
          reason: "Modul Unit Usaha saat ini dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
      if (cleanPath === "/portal/rapat" && !activeModules.meetings) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "meetings",
          reason: "Modul Rapat Anggota (RAT) saat ini dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
    }

    return { allowed: true };
  }

  // --------------------------------------------------------------------------
  // 3. ADMINISTRATION SYSTEM ENVIRONMENT (/admin and subpaths)
  // --------------------------------------------------------------------------
  if (cleanPath === "/admin" || cleanPath.startsWith("/admin/")) {
    // Public visitors and applicants are strictly forbidden
    if (isPublicContext(role)) {
      return {
        allowed: false,
        reason:
          "Area Administrasi memerlukan autentikasi akun internal koperasi. Konteks publik tidak memiliki hak akses.",
      };
    }

    // Members cannot enter administration system (Separation of Member & Governance)
    if (role === "member") {
      return {
        allowed: false,
        reason:
          "Anggota Koperasi (Member) tidak memiliki hak akses ke Administration System demi menjaga kerahasiaan data dan tata kelola internal.",
      };
    }

    // DENY BY DEFAULT on unknown /admin subroutes
    if (!(KNOWN_ADMIN_ROUTES as readonly string[]).includes(cleanPath)) {
      return {
        allowed: false,
        reason: `Rute administrasi "${cleanPath}" tidak terdaftar atau tidak dikenal dalam sistem (Deny by Default).`,
      };
    }

    // 3.1 /admin (Dashboard Utama)
    if (cleanPath === "/admin") {
      return { allowed: true };
    }

    // 3.2 /admin/anggota/verifikasi
    if (cleanPath === "/admin/anggota/verifikasi") {
      if (
        hasPermission(role, "membership:verify") ||
        hasPermission(role, "membership:approve") ||
        role === "auditor"
      ) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "Verifikasi pendaftaran calon anggota khusus untuk Staf (verifikasi), Pengurus (persetujuan final), dan Auditor (inspeksi). Peran Anda tidak memiliki otoritas ini.",
      };
    }

    // 3.3 /admin/anggota (Direktori Anggota)
    if (cleanPath === "/admin/anggota") {
      if (hasPermission(role, "membership:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Anda tidak memiliki izin melihat direktori anggota (membership:view).",
      };
    }

    // 3.4 /admin/simpanan (Modul Simpanan)
    if (cleanPath === "/admin/simpanan") {
      if (activeModules && !activeModules.savings) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "savings",
          reason: "Modul Simpanan saat ini sedang dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
      if (role === "admin" || role === "super_admin") {
        return {
          allowed: false,
          reason:
            "Sesuai SoD (IA 5.4 Catatan Kaki 2): Administrator Sistem dan Super Admin tidak memiliki kewenangan transaksi operasional simpanan.",
        };
      }
      if (hasPermission(role, "savings:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Anda tidak memiliki izin mengelola modul simpanan.",
      };
    }

    // 3.5 /admin/pinjaman (Modul Pinjaman)
    if (cleanPath === "/admin/pinjaman") {
      if (activeModules && !activeModules.loans) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "loans",
          reason: "Modul Pinjaman saat ini sedang dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
      if (role === "admin" || role === "super_admin") {
        return {
          allowed: false,
          reason:
            "Sesuai SoD (IA 5.4 Catatan Kaki 2): Administrator Sistem dan Super Admin tidak memiliki kewenangan persetujuan atau operasional pinjaman.",
        };
      }
      if (hasPermission(role, "loans:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Anda tidak memiliki izin mengelola modul pinjaman.",
      };
    }

    // 3.6 /admin/keuangan (Buku Kas & Rekonsiliasi)
    if (cleanPath === "/admin/keuangan") {
      if (role === "staff") {
        return {
          allowed: false,
          reason:
            "Staf operasional lapangan tidak memiliki akses ke buku kas dan rekonsiliasi keuangan (Domain Cash).",
        };
      }
      if (role === "admin" || role === "super_admin") {
        return {
          allowed: false,
          reason:
            "Sesuai SoD (IA 5.4 Catatan Kaki 2): Administrator Sistem tidak memiliki kewenangan transaksi kas maupun rekonsiliasi.",
        };
      }
      if (hasPermission(role, "cash:view")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Anda tidak memiliki izin melihat buku kas dan rekonsiliasi keuangan (cash:view).",
      };
    }

    // 3.7 /admin/unit-usaha
    if (cleanPath === "/admin/unit-usaha") {
      if (activeModules && !activeModules.business_units) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "business_units",
          reason: "Modul Unit Usaha saat ini dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
      if (role === "admin" || role === "super_admin") {
        return {
          allowed: false,
          reason: "Pengelolaan portofolio unit usaha merupakan domain operasional bisnis koperasi.",
        };
      }
      return { allowed: true };
    }

    // 3.8 /admin/rapat
    if (cleanPath === "/admin/rapat") {
      if (activeModules && !activeModules.meetings) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "meetings",
          reason: "Modul Rapat Anggota (RAT) saat ini dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
      if (role === "manager" || role === "staff" || role === "auditor") {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Penyelenggaraan Rapat Anggota khusus untuk Pengurus, Staf pelaksana, dan Pengawas.",
      };
    }

    // 3.9 /admin/laporan
    if (cleanPath === "/admin/laporan") {
      if (activeModules && !activeModules.reports) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "reports",
          reason: "Modul Laporan Keuangan saat ini dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
      if (!hasPermission(role, "reports:view")) {
        return {
          allowed: false,
          reason: "Peran Anda tidak memiliki izin mengakses laporan keuangan institusional (reports:view).",
        };
      }
      return { allowed: true };
    }

    // 3.10 /admin/audit
    if (cleanPath === "/admin/audit") {
      if (activeModules && !activeModules.audit_trail) {
        return {
          allowed: false,
          isModuleInactive: true,
          moduleKey: "audit_trail",
          reason: "Modul Audit Trail saat ini dinonaktifkan dalam konfigurasi koperasi.",
        };
      }
      if (!hasPermission(role, "audit:view")) {
        return {
          allowed: false,
          reason: "Jejak audit hanya dapat diakses oleh Auditor, Pengurus, dan Administrator Sistem.",
        };
      }
      return { allowed: true };
    }

    // 3.11 /admin/pengaturan
    if (cleanPath === "/admin/pengaturan") {
      if (!hasPermission(role, "platform_config:view")) {
        return {
          allowed: false,
          reason: "Anda tidak memiliki izin mengakses konfigurasi platform teknis.",
        };
      }
      return { allowed: true };
    }

    // Fallback within admin: DENY BY DEFAULT
    return {
      allowed: false,
      reason: `Rute administrasi "${cleanPath}" ditolak secara default (Deny by Default).`,
    };
  }

  // --------------------------------------------------------------------------
  // 4. UNKNOWN TOP-LEVEL ROUTE: STRICT DENY BY DEFAULT
  // --------------------------------------------------------------------------
  return {
    allowed: false,
    reason: `Rute "${cleanPath}" tidak terdaftar dalam sistem platform digital KMB (Deny by Default).`,
  };
}
