export type Role =
  | "public_visitor"
  | "applicant"
  | "member"
  | "staff"
  | "finance_officer"
  | "treasurer"
  | "manager"
  | "auditor"
  | "admin"
  | "super_admin";

export interface RoleInfo {
  id: Role;
  name: string;
  category: "Public" | "Operational" | "Financial" | "Governance" | "Administration";
  description: string;
  defaultPath: string;
  demoUser: string;
  avatarInitial: string;
}

export type BusinessModuleKey =
  | "savings"
  | "loans"
  | "installments"
  | "business_units"
  | "shu"
  | "meetings"
  | "notifications"
  | "reports"
  | "audit_trail";

export interface ModuleConfig {
  key: BusinessModuleKey;
  name: string;
  description: string;
  enabled: boolean;
  isCore: boolean;
  dependsOn?: BusinessModuleKey;
}

export interface CooperativeConfig {
  id: string;
  name: string;
  shortName: string;
  acronym: string;
  legalNumber: string;
  cooperativeRegistrationNumber: string;
  establishedYear: number;
  tagline: string;
  address: {
    street: string;
    subdistrict: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    operationalHours: string;
  };
  brand: {
    primaryColor: string;
    primaryColorHover: string;
    primaryColorActive: string;
    pageBackground: string;
    cardBackground: string;
    textColor: string;
    fontFamily: string;
  };
  activeModules: Record<BusinessModuleKey, boolean>;
}

export interface DemoUser {
  id: string;
  memberId?: string;
  name: string;
  email: string;
  role: Role;
  roleName: string;
  avatarUrl?: string;
}

export interface SavingsSummary {
  rekeningId: string;
  jenis: "Pokok" | "Wajib" | "Sukarela" | "Berjangka";
  saldo: number;
  bungaPct: number;
}

export interface LoanSummary {
  pinjamanId: string;
  jenis: "Konsumtif" | "Modal Usaha" | "Darurat";
  plafon: number;
  sisaPokok: number;
  angsuranBulanan: number;
  tenorBulan: number;
  angsuranKe: number;
  statusKolektibilitas: "Lancar" | "DPK" | "Kurang Lancar" | "Diragukan" | "Macet";
  jatuhTempoBerikutnya: string;
}

