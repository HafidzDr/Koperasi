import { z } from "zod";
import { Role } from "@/types";

export type BusinessUnitCategory =
  | "retail_waserda"
  | "agriculture_food"
  | "logistics_supply"
  | "processing_production"
  | "services"
  | "other";

export interface CategoryMeta {
  label: string;
  badgeVariant: "success" | "warning" | "info" | "neutral" | "danger";
  description: string;
}

export const BUSINESS_UNIT_CATEGORIES: Record<BusinessUnitCategory, CategoryMeta> = {
  retail_waserda: {
    label: "Waserda & Ritel",
    badgeVariant: "success",
    description: "Toko kebutuhan pokok dan produk konsumsi anggota/masyarakat",
  },
  agriculture_food: {
    label: "Pertanian & Pangan",
    badgeVariant: "success",
    description: "Perdagangan dan distribusi hasil tani, bibit, dan produk pangan",
  },
  logistics_supply: {
    label: "Logistik & Saprotan",
    badgeVariant: "info",
    description: "Distribusi sarana produksi pertanian, pupuk, dan logistik angkutan",
  },
  processing_production: {
    label: "Pengolahan & Produksi",
    badgeVariant: "warning",
    description: "Sentra pascapanen, pengeringan komoditas, dan pengemasan produk",
  },
  services: {
    label: "Jasa & Persewaan",
    badgeVariant: "neutral",
    description: "Persewaan alat mesin pertanian (alsintan), bengkel, dan jasa teknis",
  },
  other: {
    label: "Unit Usaha Lainnya",
    badgeVariant: "neutral",
    description: "Kegiatan operasional riil lainnya yang dikelola koperasi",
  },
};

export type BusinessUnitStatus = "active" | "inactive";

export interface BusinessUnitAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: "created" | "updated" | "deactivated" | "activated";
  details: string;
}

export interface BusinessUnit {
  id: string;
  code: string;
  name: string;
  category: BusinessUnitCategory;
  description: string;
  picName: string;
  picPhone: string;
  operationalLocation: string;
  status: BusinessUnitStatus;
  createdAt: string;
  updatedAt: string;
  history: BusinessUnitAuditLog[];
}

export type UnitActivityType =
  | "sales"
  | "purchase"
  | "distribution"
  | "member_supply"
  | "service"
  | "operational_expense";

export interface ActivityTypeMeta {
  label: string;
  classification: "gross_revenue" | "expenditure" | "member_supply";
  badgeVariant: "success" | "warning" | "info" | "neutral" | "danger";
  description: string;
}

export const UNIT_ACTIVITY_TYPES: Record<UnitActivityType, ActivityTypeMeta> = {
  sales: {
    label: "Penjualan Barang / Produk",
    classification: "gross_revenue",
    badgeVariant: "success",
    description: "Penjualan ritel kepada anggota atau konsumen umum",
  },
  service: {
    label: "Pendapatan Jasa / Persewaan",
    classification: "gross_revenue",
    badgeVariant: "success",
    description: "Jasa operasional, sewa alat pertanian, atau jasa teknis",
  },
  purchase: {
    label: "Pengadaan Stok / Bahan Baku",
    classification: "expenditure",
    badgeVariant: "warning",
    description: "Pembelian pasokan barang dagangan atau bahan baku operasional",
  },
  operational_expense: {
    label: "Beban Operasional Unit",
    classification: "expenditure",
    badgeVariant: "danger",
    description: "Biaya operasional harian, listrik, bahan bakar, atau perawatan",
  },
  distribution: {
    label: "Distribusi / Logistik",
    classification: "expenditure",
    badgeVariant: "info",
    description: "Biaya pengangkutan dan penyaluran saprotan ke kelompok tani",
  },
  member_supply: {
    label: "Pasokan Komoditas dari Anggota",
    classification: "member_supply",
    badgeVariant: "info",
    description: "Penerimaan hasil panen atau komoditas anggota untuk dipasarkan",
  },
};

export type UnitActivityStatus = "recorded" | "verified" | "cancelled";

export interface UnitActivityRecord {
  id: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  activityDate: string; // YYYY-MM-DD
  activityType: UnitActivityType;
  description: string;
  quantity?: number;
  unitOfMeasure?: string;
  amount: number; // Integer IDR > 0
  memberId?: string; // Canonical demo ID (e.g. DEMO-ID-0001)
  memberDemoId?: string;
  memberName?: string;
  recordedById: string;
  recordedByName: string;
  recordedByRole: Role;
  verifiedById?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  cancellationReason?: string;
  notes?: string;
  status: UnitActivityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MemberEconomicParticipation {
  memberDemoId: string;
  memberName: string;
  totalSpending: number; // Total purchases from coop units
  totalCommoditySupply: number; // Total commodity value supplied to coop
  totalTransactionCount: number;
  activities: UnitActivityRecord[];
}

export interface BusinessUnitPerformanceRecap {
  totalActivities: number;
  recordedActivities: number;
  verifiedActivities: number;
  cancelledActivities: number;
  grossRevenue: number; // Gross receipts from sales & service
  totalExpenditure: number; // Procurement and operating expenses
  totalVolume: number;
  memberInvolvementCount: number;
  unitSummaries: Array<{
    unitId: string;
    code: string;
    name: string;
    category: BusinessUnitCategory;
    status: BusinessUnitStatus;
    transactionCount: number;
    grossRevenue: number;
    totalExpenditure: number;
    volume: number;
  }>;
}

// Validation schemas
export const createBusinessUnitSchema = z.object({
  code: z
    .string()
    .min(2, "Kode unit minimal 2 karakter")
    .max(20, "Kode unit maksimal 20 karakter")
    .regex(/^[A-Za-z0-9-_]+$/, "Kode unit hanya boleh berisi huruf, angka, tanda hubung (-), dan garis bawah (_)"),
  name: z.string().min(3, "Nama unit usaha minimal 3 karakter").max(100, "Nama unit usaha maksimal 100 karakter"),
  category: z.enum([
    "retail_waserda",
    "agriculture_food",
    "logistics_supply",
    "processing_production",
    "services",
    "other",
  ], {
    errorMap: () => ({ message: "Kategori unit usaha wajib dipilih secara valid" }),
  }),
  description: z.string().min(5, "Deskripsi unit minimal 5 karakter").max(500, "Deskripsi unit maksimal 500 karakter"),
  picName: z.string().min(2, "Nama penanggung jawab minimal 2 karakter").max(100),
  picPhone: z.string().min(8, "Nomor kontak penanggung jawab minimal 8 digit").max(20),
  operationalLocation: z.string().min(3, "Lokasi operasional minimal 3 karakter").max(200),
});

export type CreateBusinessUnitInput = z.infer<typeof createBusinessUnitSchema>;

export const updateBusinessUnitSchema = z.object({
  name: z.string().min(3, "Nama unit usaha minimal 3 karakter").max(100).optional(),
  category: z
    .enum([
      "retail_waserda",
      "agriculture_food",
      "logistics_supply",
      "processing_production",
      "services",
      "other",
    ])
    .optional(),
  description: z.string().min(5, "Deskripsi unit minimal 5 karakter").max(500).optional(),
  picName: z.string().min(2, "Nama penanggung jawab minimal 2 karakter").max(100).optional(),
  picPhone: z.string().min(8, "Nomor kontak penanggung jawab minimal 8 digit").max(20).optional(),
  operationalLocation: z.string().min(3, "Lokasi operasional minimal 3 karakter").max(200).optional(),
});

export type UpdateBusinessUnitInput = z.infer<typeof updateBusinessUnitSchema>;

export const recordActivitySchema = z.object({
  unitId: z.string().min(1, "Unit usaha wajib dipilih"),
  activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  activityType: z.enum([
    "sales",
    "purchase",
    "distribution",
    "member_supply",
    "service",
    "operational_expense",
  ], {
    errorMap: () => ({ message: "Jenis aktivitas operasional wajib dipilih secara valid" }),
  }),
  description: z.string().min(3, "Deskripsi aktivitas minimal 3 karakter").max(300),
  quantity: z
    .number({ invalid_type_error: "Kuantitas harus berupa angka" })
    .positive("Kuantitas harus berupa angka positif lebih dari 0")
    .optional(),
  unitOfMeasure: z.string().max(20).optional(),
  amount: z
    .number({ invalid_type_error: "Nominal harus berupa angka" })
    .int("Nominal harus berupa bilangan bulat rupiah")
    .positive("Nilai nominal harus lebih besar dari Rp 0"),
  memberDemoId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type RecordActivityInput = z.infer<typeof recordActivitySchema>;
