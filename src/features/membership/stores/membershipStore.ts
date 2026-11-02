import { create } from "zustand";
import { Role } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { DEFAULT_SAVINGS_CONFIG, SavingsConfig } from "../config/savingsConfig";
import {
  ApplicationStatus,
  Member,
  MembershipApplication,
  VerificationChecklist,
  ApplicationActivityLog,
} from "../types";

export { DEFAULT_SAVINGS_CONFIG, type SavingsConfig } from "../config/savingsConfig";

export interface CreateApplicationInput {
  fullName: string;
  demoId?: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  occupation: string;
  simpananPokokConfirmed: boolean;
  simpananWajibConfirmed: boolean;
  adArtAgreed: boolean;
}

export interface UpdateRevisionInput {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  occupation?: string;
}

interface MembershipState {
  applications: MembershipApplication[];
  members: Member[];
  savingsConfig: SavingsConfig;

  // Actions - Savings Configuration (Demonstrasi / Ilustrasi)
  updateSavingsConfig: (updates: Partial<SavingsConfig>) => void;
  resetSavingsConfig: () => void;

  // Actions - Public / Applicant
  generateUniqueDemoId: () => string;
  submitApplication: (input: CreateApplicationInput) => MembershipApplication;
  updateApplicantRevision: (
    trackingCode: string,
    updates: UpdateRevisionInput
  ) => { success: boolean; error?: string };
  getApplicationByTrackingCode: (trackingCode: string) => MembershipApplication | undefined;
  getApplicationByDemoId: (demoId: string) => MembershipApplication | undefined;

  // Actions - Staff (Verifikasi & Rekomendasi)
  startStaffReview: (
    applicationId: string,
    _callerOverride?: { role: Role; name: string }
  ) => { success: boolean; error?: string };
  updateChecklist: (
    applicationId: string,
    staffUserOrChecklist: { role: Role; name: string } | Partial<VerificationChecklist>,
    checklistOrNotes?: Partial<VerificationChecklist> | string,
    maybeStaffNotes?: string
  ) => { success: boolean; error?: string };
  requestRevision: (
    applicationId: string,
    staffUserOrReason: { role: Role; name: string } | string,
    maybeRevisionReason?: string
  ) => { success: boolean; error?: string };
  recommendApplication: (
    applicationId: string,
    staffUserOrNotes?: { role: Role; name: string } | string,
    maybeNotes?: string
  ) => { success: boolean; error?: string };

  // Actions - Manager (Persetujuan Final & Penolakan)
  approveApplication: (
    applicationId: string,
    managerUserOrNotes?: { role: Role; name: string } | string,
    maybeManagerNotes?: string
  ) => { success: boolean; memberNumber?: string; error?: string };
  rejectApplication: (
    applicationId: string,
    managerUserOrReason: { role: Role; name: string } | string,
    maybeRejectionReason?: string
  ) => { success: boolean; error?: string };

  // Member Registry Queries
  getMemberByDemoId: (demoId: string) => Member | undefined;
  getMemberById: (id: string) => Member | undefined;

  // Reset to initial seed state
  resetToSeed: () => void;
}

// Initial Seed Data
const initialApplications: MembershipApplication[] = [
  {
    id: "APP-2026-0001",
    trackingCode: "REG-801201",
    demoId: "DEMO-ID-0002",
    fullName: "Budi Santoso",
    email: "budi.santoso@email.invalid",
    phone: "0812-3456-7890 (Simulasi)",
    city: "Jakarta Selatan",
    address: "Jl. Tebet Barat Dalam No. 14, Jakarta Selatan",
    occupation: "Usaha Percetakan Mandiri",
    simpananPokokConfirmed: true,
    simpananWajibConfirmed: true,
    adArtAgreed: true,
    status: "submitted",
    submissionDate: "2026-11-01T09:30:00Z",
    checklist: {
      identityVerified: false,
      biodataVerified: false,
      commitmentVerified: false,
      adArtVerified: false,
    },
    history: [
      {
        id: "LOG-01",
        timestamp: "2026-11-01T09:30:00Z",
        actorRole: "applicant",
        actorName: "Budi Santoso",
        fromStatus: "new",
        toStatus: "submitted",
        action: "Permohonan Pendaftaran Terkirim",
        notes: "Berkas awal dikirim via wizard pendaftaran daring.",
      },
    ],
  },
  {
    id: "APP-2026-0002",
    trackingCode: "REG-801202",
    demoId: "DEMO-ID-0003",
    fullName: "Maya Indah Permata",
    email: "maya.indah@email.invalid",
    phone: "0813-9876-5432 (Simulasi)",
    city: "Tangerang",
    address: "Komp. Poris Indah Blok C3 No. 8, Tangerang",
    occupation: "Pemilik Toko Kelontong Sembako",
    simpananPokokConfirmed: true,
    simpananWajibConfirmed: true,
    adArtAgreed: true,
    status: "under_review",
    submissionDate: "2026-11-01T10:15:00Z",
    checklist: {
      identityVerified: true,
      biodataVerified: true,
      commitmentVerified: false,
      adArtVerified: false,
    },
    staffNotes: "Format identitas demonstrasi valid. Sedang mencocokkan komitmen simpanan awal.",
    history: [
      {
        id: "LOG-02A",
        timestamp: "2026-11-01T10:15:00Z",
        actorRole: "applicant",
        actorName: "Maya Indah Permata",
        fromStatus: "new",
        toStatus: "submitted",
        action: "Permohonan Pendaftaran Terkirim",
      },
      {
        id: "LOG-02B",
        timestamp: "2026-11-01T11:00:00Z",
        actorRole: "staff",
        actorName: "Dewi Lestari",
        fromStatus: "submitted",
        toStatus: "under_review",
        action: "Pemeriksaan Berkas Dimulai",
        notes: "Staf operasional mulai memverifikasi kelengkapan dokumen demo.",
      },
    ],
  },
  {
    id: "APP-2026-0003",
    trackingCode: "REG-801203",
    demoId: "DEMO-ID-0004",
    fullName: "Ahmad Syafi'i",
    email: "ahmad.syafii@email.invalid",
    phone: "0815-1122-3344 (Simulasi)",
    city: "Bekasi",
    address: "Perumahan Harapan Baru (Alamat belum lengkap)",
    occupation: "Karyawan Swasta & Warung Kopi",
    simpananPokokConfirmed: true,
    simpananWajibConfirmed: true,
    adArtAgreed: true,
    status: "revision_required",
    submissionDate: "2026-10-30T14:00:00Z",
    checklist: {
      identityVerified: true,
      biodataVerified: false,
      commitmentVerified: true,
      adArtVerified: true,
    },
    staffNotes: "Alamat domisili belum mencantumkan nama jalan spesifik, nomor rumah, dan RT/RW.",
    revisionReason: "Mohon lengkapi alamat domisili dengan detail jalan, nomor rumah, dan RT/RW yang jelas.",
    history: [
      {
        id: "LOG-03A",
        timestamp: "2026-10-30T14:00:00Z",
        actorRole: "applicant",
        actorName: "Ahmad Syafi'i",
        fromStatus: "new",
        toStatus: "submitted",
        action: "Permohonan Pendaftaran Terkirim",
      },
      {
        id: "LOG-03B",
        timestamp: "2026-10-30T15:30:00Z",
        actorRole: "staff",
        actorName: "Dewi Lestari",
        fromStatus: "submitted",
        toStatus: "revision_required",
        action: "Permintaan Perbaikan Berkas",
        notes: "Mohon lengkapi alamat domisili dengan detail jalan, nomor rumah, dan RT/RW yang jelas.",
      },
    ],
  },
  {
    id: "APP-2026-0004",
    trackingCode: "REG-801204",
    demoId: "DEMO-ID-0005",
    fullName: "Agus Setiawan",
    email: "agus.setiawan@email.invalid",
    phone: "0817-5566-7788 (Simulasi)",
    city: "Depok",
    address: "Jl. Margonda Raya No. 102, Depok",
    occupation: "Bengkel & Servis Sepeda Motor",
    simpananPokokConfirmed: true,
    simpananWajibConfirmed: true,
    adArtAgreed: true,
    status: "recommended",
    submissionDate: "2026-10-31T08:45:00Z",
    checklist: {
      identityVerified: true,
      biodataVerified: true,
      commitmentVerified: true,
      adArtVerified: true,
    },
    staffNotes: "Seluruh berkas, data domisili, dan komitmen simpanan pokok/wajib telah diverifikasi lengkap dan valid. Direkomendasikan untuk disetujui Pengurus.",
    history: [
      {
        id: "LOG-04A",
        timestamp: "2026-10-31T08:45:00Z",
        actorRole: "applicant",
        actorName: "Agus Setiawan",
        fromStatus: "new",
        toStatus: "submitted",
        action: "Permohonan Pendaftaran Terkirim",
      },
      {
        id: "LOG-04B",
        timestamp: "2026-10-31T10:00:00Z",
        actorRole: "staff",
        actorName: "Dewi Lestari",
        fromStatus: "submitted",
        toStatus: "under_review",
        action: "Pemeriksaan Berkas Dimulai",
      },
      {
        id: "LOG-04C",
        timestamp: "2026-10-31T14:20:00Z",
        actorRole: "staff",
        actorName: "Dewi Lestari",
        fromStatus: "under_review",
        toStatus: "recommended",
        action: "Rekomendasi Staf Diterbitkan",
        notes: "Seluruh data valid. Direkomendasikan ke Pengurus untuk persetujuan final.",
      },
    ],
  },
  {
    id: "APP-2026-0005",
    trackingCode: "REG-801205",
    demoId: "DEMO-ID-0006",
    fullName: "Rudi Hartono",
    email: "rudi.hartono@email.invalid",
    phone: "0818-4455-6677 (Simulasi)",
    city: "Surabaya",
    address: "Jl. Basuki Rahmat No. 45, Surabaya",
    occupation: "Distributor Barang Elektronik",
    simpananPokokConfirmed: true,
    simpananWajibConfirmed: true,
    adArtAgreed: true,
    status: "rejected",
    submissionDate: "2026-10-28T11:00:00Z",
    checklist: {
      identityVerified: true,
      biodataVerified: true,
      commitmentVerified: false,
      adArtVerified: false,
    },
    rejectionReason: "Wilayah domisili pendaftar di luar cakupan layanan operasional keanggotaan koperasi saat ini.",
    history: [
      {
        id: "LOG-05A",
        timestamp: "2026-10-28T11:00:00Z",
        actorRole: "applicant",
        actorName: "Rudi Hartono",
        fromStatus: "new",
        toStatus: "submitted",
        action: "Permohonan Pendaftaran Terkirim",
      },
      {
        id: "LOG-05B",
        timestamp: "2026-10-29T16:00:00Z",
        actorRole: "manager",
        actorName: "Hendra Kurniawan",
        fromStatus: "submitted",
        toStatus: "rejected",
        action: "Penolakan oleh Pengurus",
        notes: "Wilayah domisili pendaftar di luar cakupan layanan operasional keanggotaan koperasi saat ini.",
      },
    ],
  },
];

const initialMembers: Member[] = [
  {
    id: "MBR-0001",
    memberNumber: "KMB-2026-0001",
    demoId: "DEMO-ID-0001",
    fullName: "Siti Rahma",
    email: "siti.rahma@koperasimakmur.invalid",
    phone: "0812-1111-2222 (Simulasi)",
    city: "Jakarta",
    address: "Jl. Tebet Timur Raya No. 45, Jakarta Selatan",
    occupation: "Pengusaha Katering Rumahan",
    status: "active",
    joinDate: "2024-01-15T08:00:00Z",
    approvedBy: "Hendra Kurniawan (Ketua Pengurus)",
    applicationId: "APP-LEGACY-001",
    simpananPokokNominal: 100000,
    simpananWajibBulanan: 50000,
    saldoPokok: 100000,
    saldoWajib: 600000,
    saldoSukarela: 2450000,
  },
  {
    id: "MBR-0002",
    memberNumber: "KMB-2026-0002",
    demoId: "DEMO-ID-0007",
    fullName: "Dian Pratama",
    email: "dian.pratama@email.invalid",
    phone: "0813-2222-3333 (Simulasi)",
    city: "Jakarta Barat",
    address: "Jl. Kemanggisan Utama No. 12, Jakarta Barat",
    occupation: "Desain Grafis Freelance",
    status: "active",
    joinDate: "2024-03-20T10:00:00Z",
    approvedBy: "Hendra Kurniawan (Ketua Pengurus)",
    applicationId: "APP-LEGACY-002",
    simpananPokokNominal: 100000,
    simpananWajibBulanan: 50000,
    saldoPokok: 100000,
    saldoWajib: 400000,
    saldoSukarela: 1200000,
  },
  {
    id: "MBR-0003",
    memberNumber: "KMB-2026-0003",
    demoId: "DEMO-ID-0008",
    fullName: "Eko Prasetyo",
    email: "eko.prasetyo@email.invalid",
    phone: "0814-3333-4444 (Simulasi)",
    city: "Depok",
    address: "Jl. Nusantara Raya No. 88, Depok",
    occupation: "Pemilik Toko ATK",
    status: "under_review",
    joinDate: "2024-06-10T11:30:00Z",
    approvedBy: "Hendra Kurniawan (Ketua Pengurus)",
    applicationId: "APP-LEGACY-003",
    simpananPokokNominal: 100000,
    simpananWajibBulanan: 50000,
    saldoPokok: 100000,
    saldoWajib: 250000,
    saldoSukarela: 500000,
  },
  {
    id: "MBR-0004",
    memberNumber: "KMB-2026-0004",
    demoId: "DEMO-ID-0009",
    fullName: "Ratna Juwita",
    email: "ratna.juwita@email.invalid",
    phone: "0815-4444-5555 (Simulasi)",
    city: "Bekasi",
    address: "Jl. Ahmad Yani No. 23, Bekasi",
    occupation: "Wirausaha Pakaian Anak",
    status: "suspended",
    joinDate: "2024-08-01T09:00:00Z",
    approvedBy: "Hendra Kurniawan (Ketua Pengurus)",
    applicationId: "APP-LEGACY-004",
    simpananPokokNominal: 100000,
    simpananWajibBulanan: 50000,
    saldoPokok: 100000,
    saldoWajib: 150000,
    saldoSukarela: 0,
  },
];

const STORAGE_KEY = "kmb_membership_store_v1";

export function validateSavingsConfig(raw: unknown): SavingsConfig {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "simpananPokokNominal" in raw &&
    "simpananWajibBulanan" in raw
  ) {
    const c = raw as Record<string, unknown>;
    const pokok = Number(c.simpananPokokNominal);
    const wajib = Number(c.simpananWajibBulanan);

    if (
      !isNaN(pokok) &&
      isFinite(pokok) &&
      pokok >= 0 &&
      pokok <= 1_000_000_000 &&
      !isNaN(wajib) &&
      isFinite(wajib) &&
      wajib >= 0 &&
      wajib <= 1_000_000_000
    ) {
      return {
        simpananPokokNominal: pokok,
        simpananWajibBulanan: wajib,
        label: typeof c.label === "string" ? c.label : DEFAULT_SAVINGS_CONFIG.label,
        badgeLabel: typeof c.badgeLabel === "string" ? c.badgeLabel : DEFAULT_SAVINGS_CONFIG.badgeLabel,
        disclaimer: typeof c.disclaimer === "string" ? c.disclaimer : DEFAULT_SAVINGS_CONFIG.disclaimer,
      };
    }
  }
  return DEFAULT_SAVINGS_CONFIG;
}

function getInitialState(): {
  applications: MembershipApplication[];
  members: Member[];
  savingsConfig: SavingsConfig;
} {
  if (typeof window === "undefined") {
    return {
      applications: initialApplications,
      members: initialMembers,
      savingsConfig: DEFAULT_SAVINGS_CONFIG,
    };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const applications =
        Array.isArray(parsed.applications) ? parsed.applications : initialApplications;
      const members = Array.isArray(parsed.members) ? parsed.members : initialMembers;
      const savingsConfig = validateSavingsConfig(parsed.savingsConfig);

      return { applications, members, savingsConfig };
    }
  } catch {
    // fallback
  }
  return {
    applications: initialApplications,
    members: initialMembers,
    savingsConfig: DEFAULT_SAVINGS_CONFIG,
  };
}

function saveToStorage(
  applications: MembershipApplication[],
  members: Member[],
  savingsConfig: SavingsConfig
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ applications, members, savingsConfig })
    );
  } catch {
    // ignore
  }
}

export function generateUniqueDemoId(
  existingApplications: { demoId?: string }[] = [],
  existingMembers: { demoId?: string }[] = []
): string {
  const usedNumbers = new Set<number>();
  const idRegex = /^DEMO-ID-(\d{4})$/i;

  for (const item of [...existingApplications, ...existingMembers]) {
    if (!item || !item.demoId) continue;
    const match = item.demoId.match(idRegex);
    if (match) {
      usedNumbers.add(parseInt(match[1], 10));
    }
  }

  let candidate = 1;
  while (usedNumbers.has(candidate) && candidate <= 9999) {
    candidate++;
  }

  if (candidate > 9999) {
    throw new Error(
      "Kapasitas ID Demonstrasi 4-digit (DEMO-ID-9999) telah penuh. Tidak dapat menghasilkan ID unik baru."
    );
  }

  return `DEMO-ID-${String(candidate).padStart(4, "0")}`;
}

function getActiveActor() {
  return useAuthStore.getState().currentUser;
}

function generateMemberNumber(existingMembers: Member[]): string {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;
  for (const m of existingMembers) {
    const parts = m.memberNumber.split("-");
    if (parts.length === 3 && parts[0] === "KMB") {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `KMB-${currentYear}-${String(nextSeq).padStart(4, "0")}`;
}

export const useMembershipStore = create<MembershipState>((rawSet, get) => {
  const initial = getInitialState();
  const set: typeof rawSet = (updater) => {
    rawSet(updater);
    const updated = get();
    saveToStorage(updated.applications, updated.members, updated.savingsConfig);
  };
  return {
    applications: initial.applications,
    members: initial.members,
    savingsConfig: initial.savingsConfig,

    // ----------------------------------------------------------------------
    // SAVINGS CONFIGURATION ACTIONS (Demonstrasi / Ilustrasi)
    // ----------------------------------------------------------------------
    updateSavingsConfig: (updates: Partial<SavingsConfig>) => {
      const current = get().savingsConfig;
      const merged = { ...current, ...updates };
      const validated = validateSavingsConfig(merged);
      set({ savingsConfig: validated });
    },

    resetSavingsConfig: () => {
      set({ savingsConfig: DEFAULT_SAVINGS_CONFIG });
    },

    // ----------------------------------------------------------------------
    // PUBLIC & APPLICANT ACTIONS
    // ----------------------------------------------------------------------
    generateUniqueDemoId: () => {
      return generateUniqueDemoId(get().applications, get().members);
    },

    submitApplication: (input: CreateApplicationInput) => {
      const timestamp = new Date().toISOString();
      const randNum = Math.floor(100000 + Math.random() * 900000);
      const trackingCode = `REG-${randNum}`;
      const newId = `APP-2026-${String(get().applications.length + 1).padStart(4, "0")}`;

      // Phase 3.2: Store is the single authority for generating Demo IDs.
      // Arbitrary/freeform user input IDs are strictly ignored.
      const assignedDemoId = generateUniqueDemoId(get().applications, get().members);

      const newApp: MembershipApplication = {
        id: newId,
        trackingCode,
        demoId: assignedDemoId,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone || "0812-xxxx-xxxx (Simulasi)",
        city: input.city,
        address: input.address || `Wilayah ${input.city}`,
        occupation: input.occupation,
        simpananPokokConfirmed: input.simpananPokokConfirmed,
        simpananWajibConfirmed: input.simpananWajibConfirmed,
        adArtAgreed: input.adArtAgreed,
        status: "submitted",
        submissionDate: timestamp,
        checklist: {
          identityVerified: false,
          biodataVerified: false,
          commitmentVerified: false,
          adArtVerified: false,
        },
        history: [
          {
            id: `LOG-${Date.now()}`,
            timestamp,
            actorRole: "applicant",
            actorName: input.fullName,
            fromStatus: "new",
            toStatus: "submitted",
            action: "Permohonan Pendaftaran Terkirim",
            notes: "Pendaftaran daring berhasil dikirimkan.",
          },
        ],
      };

      const updatedApps = [newApp, ...get().applications];
      set({ applications: updatedApps });

      return newApp;
    },

    updateApplicantRevision: (trackingCode: string, updates: UpdateRevisionInput) => {
      const app = get().applications.find((a) => a.trackingCode === trackingCode);
      if (!app) {
        return { success: false, error: "Berkas permohonan tidak ditemukan." };
      }
      if (app.status !== "revision_required") {
        return {
          success: false,
          error: "Hanya permohonan dengan status 'Butuh Revisi' yang dapat diperbaiki.",
        };
      }

      const timestamp = new Date().toISOString();
      const logEntry: ApplicationActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: "applicant",
        actorName: app.fullName,
        fromStatus: "revision_required",
        toStatus: "submitted",
        action: "Perbaikan Berkas Dikirimkan Ulang",
        notes: "Pemohon telah memperbarui data yang diminta oleh staf verifikator.",
      };

      const updatedApps = get().applications.map((a) =>
        a.id === app.id
          ? {
              ...a,
              ...updates,
              status: "submitted" as ApplicationStatus,
              revisionReason: undefined,
              history: [...a.history, logEntry],
            }
          : a
      );

      set({ applications: updatedApps });
      return { success: true };
    },

    getApplicationByTrackingCode: (trackingCode: string) => {
      return get().applications.find(
        (a) => a.trackingCode.toLowerCase() === trackingCode.trim().toLowerCase()
      );
    },

    getApplicationByDemoId: (demoId: string) => {
      return get().applications.find(
        (a) => a.demoId.toLowerCase() === demoId.trim().toLowerCase()
      );
    },

    // ----------------------------------------------------------------------
    // STAFF OPERATIONAL ACTIONS (Verifikasi & Rekomendasi)
    // Separation of Duties: Identity is anchored to active authStore user
    // ----------------------------------------------------------------------
    startStaffReview: (
      applicationId: string,
      _callerOverride?: { role: Role; name: string }
    ) => {
      const activeActor = getActiveActor();
      if (activeActor.role !== "staff") {
        return {
          success: false,
          error: `Hanya Staf Operasional yang berwenang memulai verifikasi berkas (Peran aktif: "${activeActor.role}").`,
        };
      }

      const app = get().applications.find((a) => a.id === applicationId);
      if (!app) {
        return { success: false, error: "Permohonan tidak ditemukan." };
      }
      if (app.status !== "submitted") {
        return {
          success: false,
          error: `Tidak dapat memulai verifikasi pada status "${app.status}".`,
        };
      }

      const timestamp = new Date().toISOString();
      const logEntry: ApplicationActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: activeActor.role,
        actorName: activeActor.name,
        fromStatus: app.status,
        toStatus: "under_review",
        action: "Pemeriksaan Berkas Dimulai",
        notes: `Staf ${activeActor.name} mulai memeriksa kelengkapan berkas.`,
      };

      const updatedApps = get().applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "under_review" as ApplicationStatus,
              history: [...a.history, logEntry],
            }
          : a
      );

      set({ applications: updatedApps });
      return { success: true };
    },

    updateChecklist: (
      applicationId: string,
      staffUserOrChecklist: { role: Role; name: string } | Partial<VerificationChecklist>,
      checklistOrNotes?: Partial<VerificationChecklist> | string,
      maybeStaffNotes?: string
    ) => {
      const activeActor = getActiveActor();
      if (activeActor.role !== "staff") {
        return {
          success: false,
          error: `Hanya Staf Operasional yang berwenang memperbarui checklist verifikasi (Peran aktif: "${activeActor.role}").`,
        };
      }

      let checklist: Partial<VerificationChecklist>;
      let staffNotes: string | undefined;

      if (typeof staffUserOrChecklist === "object" && "role" in staffUserOrChecklist) {
        checklist = (checklistOrNotes as Partial<VerificationChecklist>) || {};
        staffNotes = maybeStaffNotes;
      } else {
        checklist = (staffUserOrChecklist as Partial<VerificationChecklist>) || {};
        staffNotes = typeof checklistOrNotes === "string" ? checklistOrNotes : undefined;
      }

      const app = get().applications.find((a) => a.id === applicationId);
      if (!app) {
        return { success: false, error: "Permohonan tidak ditemukan." };
      }

      const updatedChecklist = { ...app.checklist, ...checklist };
      const finalStaffNotes = staffNotes !== undefined ? staffNotes : app.staffNotes;

      const timestamp = new Date().toISOString();
      const updatedKeys = Object.keys(checklist) as (keyof VerificationChecklist)[];
      const checklistSummary = updatedKeys
        .map((k) => `${k}: ${checklist[k] ? "valid" : "belum"}`)
        .join(", ");

      const logEntry: ApplicationActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: activeActor.role,
        actorName: activeActor.name,
        fromStatus: app.status,
        toStatus: app.status, // Catat perubahan tanpa membuat transisi status palsu
        action: "Pembaruan Checklist Verifikasi",
        notes: finalStaffNotes
          ? `${checklistSummary || "Checklist diperbarui"}. Catatan: ${finalStaffNotes}`
          : checklistSummary || "Pembaruan butir checklist kelengkapan.",
      };

      const updatedApps = get().applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              checklist: updatedChecklist,
              staffNotes: finalStaffNotes,
              history: [...a.history, logEntry],
            }
          : a
      );

      set({ applications: updatedApps });
      return { success: true };
    },

    requestRevision: (
      applicationId: string,
      staffUserOrReason: { role: Role; name: string } | string,
      maybeRevisionReason?: string
    ) => {
      const activeActor = getActiveActor();
      if (activeActor.role !== "staff") {
        return {
          success: false,
          error: `Hanya Staf Operasional yang berwenang meminta revisi berkas (Peran aktif: "${activeActor.role}").`,
        };
      }

      let revisionReason = "";
      if (typeof staffUserOrReason === "object" && "role" in staffUserOrReason) {
        revisionReason = maybeRevisionReason || "";
      } else {
        revisionReason = typeof staffUserOrReason === "string" ? staffUserOrReason : "";
      }

      if (!revisionReason.trim()) {
        return {
          success: false,
          error: "Alasan permintaan perbaikan wajib diisi agar pemohon mengetahui data yang perlu diperbaiki.",
        };
      }

      const app = get().applications.find((a) => a.id === applicationId);
      if (!app) {
        return { success: false, error: "Permohonan tidak ditemukan." };
      }
      if (app.status !== "under_review" && app.status !== "submitted") {
        return {
          success: false,
          error: `Permintaan revisi tidak dapat diajukan pada status "${app.status}".`,
        };
      }

      const timestamp = new Date().toISOString();
      const logEntry: ApplicationActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: activeActor.role,
        actorName: activeActor.name,
        fromStatus: app.status,
        toStatus: "revision_required",
        action: "Permintaan Perbaikan Berkas Dikirim",
        notes: revisionReason,
      };

      const updatedApps = get().applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "revision_required" as ApplicationStatus,
              revisionReason,
              history: [...a.history, logEntry],
            }
          : a
      );

      set({ applications: updatedApps });
      return { success: true };
    },

    recommendApplication: (
      applicationId: string,
      staffUserOrNotes?: { role: Role; name: string } | string,
      maybeNotes?: string
    ) => {
      const activeActor = getActiveActor();
      if (activeActor.role !== "staff") {
        return {
          success: false,
          error: `Hanya Staf Operasional yang berwenang menerbitkan rekomendasi ke Pengurus (Peran aktif: "${activeActor.role}").`,
        };
      }

      let notes = "";
      if (typeof staffUserOrNotes === "object" && "role" in staffUserOrNotes) {
        notes = maybeNotes || "";
      } else {
        notes = typeof staffUserOrNotes === "string" ? staffUserOrNotes : "";
      }

      const app = get().applications.find((a) => a.id === applicationId);
      if (!app) {
        return { success: false, error: "Permohonan tidak ditemukan." };
      }
      if (app.status !== "under_review" && app.status !== "submitted") {
        return {
          success: false,
          error: `Rekomendasi hanya dapat diterbitkan untuk permohonan yang sedang diverifikasi (saat ini "${app.status}").`,
        };
      }

      // Validate all 4 checklist items must be verified
      const { checklist } = app;
      if (
        !checklist.identityVerified ||
        !checklist.biodataVerified ||
        !checklist.commitmentVerified ||
        !checklist.adArtVerified
      ) {
        return {
          success: false,
          error:
            "Seluruh 4 butir checklist verifikasi (Identitas Demo, Kelengkapan Biodata, Komitmen Simpanan, Kesepakatan AD/ART) harus diverifikasi sebelum menerbitkan rekomendasi.",
        };
      }

      const timestamp = new Date().toISOString();
      const logEntry: ApplicationActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: activeActor.role,
        actorName: activeActor.name,
        fromStatus: app.status,
        toStatus: "recommended",
        action: "Rekomendasi Staf Diterbitkan ke Pengurus",
        notes: notes || "Berkas telah lengkap dan diverifikasi valid.",
      };

      const updatedApps = get().applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "recommended" as ApplicationStatus,
              staffNotes: notes || a.staffNotes,
              history: [...a.history, logEntry],
            }
          : a
      );

      set({ applications: updatedApps });
      return { success: true };
    },

    // ----------------------------------------------------------------------
    // GOVERNANCE & BOARD ACTIONS (Manager Persetujuan Final & Penolakan)
    // Separation of Duties (SoD Footnote 2):
    // Only 'manager' can approve or reject! Identity is read from authStore.
    // ----------------------------------------------------------------------
    approveApplication: (
      applicationId: string,
      managerUserOrNotes?: { role: Role; name: string } | string,
      maybeManagerNotes?: string
    ) => {
      const activeActor = getActiveActor();
      if (activeActor.role !== "manager") {
        return {
          success: false,
          error: `Kewenangan persetujuan final keanggotaan adalah hak mutlak Pengurus/Manajer (SoD BR-01.2). Peran aktif saat ini "${activeActor.role}" tidak memiliki wewenang organisasi ini.`,
        };
      }

      let managerNotes: string | undefined;
      if (typeof managerUserOrNotes === "object" && "role" in managerUserOrNotes) {
        managerNotes = maybeManagerNotes;
      } else if (typeof managerUserOrNotes === "string") {
        managerNotes = managerUserOrNotes;
      }

      const app = get().applications.find((a) => a.id === applicationId);
      if (!app) {
        return { success: false, error: "Permohonan tidak ditemukan." };
      }
      if (app.status !== "recommended") {
        return {
          success: false,
          error: `Hanya permohonan yang telah direkomendasikan oleh staf ("recommended") yang dapat disetujui Pengurus (status saat ini: "${app.status}").`,
        };
      }

      // Automatic generation of unique Member Number immediately after Manager approval
      const newMemberNumber = generateMemberNumber(get().members);
      const newMemberId = `MBR-${String(get().members.length + 1).padStart(4, "0")}`;
      const timestamp = new Date().toISOString();

      const logEntry: ApplicationActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: activeActor.role,
        actorName: activeActor.name,
        fromStatus: "recommended",
        toStatus: "approved",
        action: "Persetujuan Final Keanggotaan & Penerbitan Nomor Anggota",
        notes: `Disetujui oleh ${activeActor.name}. Nomor Anggota resmi: ${newMemberNumber}.${
          managerNotes ? ` Catatan: ${managerNotes}` : ""
        }`,
      };

      const newMember: Member = {
        id: newMemberId,
        memberNumber: newMemberNumber,
        demoId: app.demoId,
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        city: app.city,
        address: app.address,
        occupation: app.occupation,
        status: "active",
        joinDate: timestamp,
        approvedBy: `${activeActor.name} (Pengurus)`,
        applicationId: app.id,
        simpananPokokNominal: get().savingsConfig.simpananPokokNominal,
        simpananWajibBulanan: get().savingsConfig.simpananWajibBulanan,
        saldoPokok: 0, // Finding P1: Persetujuan tidak mencatat saldo/pembayaran fiktif
        saldoWajib: 0, // Finding P1: Persetujuan tidak mencatat saldo/pembayaran fiktif
        saldoSukarela: 0,
      };

      const updatedApps = get().applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "approved" as ApplicationStatus,
              approvedMemberNumber: newMemberNumber,
              assignedMemberId: newMemberId,
              managerNotes: managerNotes || a.managerNotes,
              history: [...a.history, logEntry],
            }
          : a
      );

      const updatedMembers = [newMember, ...get().members];
      set({ applications: updatedApps, members: updatedMembers });

      return { success: true, memberNumber: newMemberNumber };
    },

    rejectApplication: (
      applicationId: string,
      managerUserOrReason: { role: Role; name: string } | string,
      maybeRejectionReason?: string
    ) => {
      const activeActor = getActiveActor();
      if (activeActor.role !== "manager") {
        return {
          success: false,
          error: `Kewenangan penolakan final keanggotaan adalah hak mutlak Pengurus/Manajer (SoD BR-01.2). Peran aktif saat ini "${activeActor.role}" tidak memiliki wewenang ini.`,
        };
      }

      let rejectionReason = "";
      if (typeof managerUserOrReason === "object" && "role" in managerUserOrReason) {
        rejectionReason = maybeRejectionReason || "";
      } else {
        rejectionReason = typeof managerUserOrReason === "string" ? managerUserOrReason : "";
      }

      if (!rejectionReason.trim()) {
        return {
          success: false,
          error: "Alasan penolakan permohonan keanggotaan wajib diisi.",
        };
      }

      const app = get().applications.find((a) => a.id === applicationId);
      if (!app) {
        return { success: false, error: "Permohonan tidak ditemukan." };
      }
      if (app.status === "approved" || app.status === "rejected") {
        return {
          success: false,
          error: `Permohonan sudah berada pada status final "${app.status}" dan tidak dapat ditolak ulang.`,
        };
      }

      const timestamp = new Date().toISOString();
      const logEntry: ApplicationActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actorRole: activeActor.role,
        actorName: activeActor.name,
        fromStatus: app.status,
        toStatus: "rejected",
        action: "Penolakan Permohonan Keanggotaan",
        notes: rejectionReason,
      };

      const updatedApps = get().applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "rejected" as ApplicationStatus,
              rejectionReason,
              history: [...a.history, logEntry],
            }
          : a
      );

      set({ applications: updatedApps });
      return { success: true };
    },

    // ----------------------------------------------------------------------
    // MEMBER REGISTRY QUERIES
    // ----------------------------------------------------------------------
    getMemberByDemoId: (demoId: string) => {
      return get().members.find(
        (m) => m.demoId.toLowerCase() === demoId.trim().toLowerCase()
      );
    },

    getMemberById: (id: string) => {
      return get().members.find((m) => m.id === id);
    },

    resetToSeed: () => {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      set({
        applications: initialApplications,
        members: initialMembers,
        savingsConfig: DEFAULT_SAVINGS_CONFIG,
      });
      saveToStorage(initialApplications, initialMembers, DEFAULT_SAVINGS_CONFIG);
    },
  };
});
