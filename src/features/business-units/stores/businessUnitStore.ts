import { create } from "zustand";
import { Role } from "@/types";
import { canPerformAction } from "@/lib/rbac";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import {
  BusinessUnit,
  UnitActivityRecord,
  CreateBusinessUnitInput,
  UpdateBusinessUnitInput,
  RecordActivityInput,
  createBusinessUnitSchema,
  updateBusinessUnitSchema,
  recordActivitySchema,
  BusinessUnitPerformanceRecap,
  MemberEconomicParticipation,
  UNIT_ACTIVITY_TYPES,
} from "../types";
import {
  initialSeedBusinessUnits,
  initialSeedActivities,
} from "../mocks/businessUnitSeedData";

export const BUSINESS_UNITS_STORAGE_KEY = "kmb_business_units_store_v1";

export interface BusinessUnitActor {
  id: string;
  name: string;
  role: Role;
  memberId?: string;
}

interface StoragePayload {
  businessUnits: BusinessUnit[];
  activities: UnitActivityRecord[];
}

interface BusinessUnitStoreState {
  businessUnits: BusinessUnit[];
  activities: UnitActivityRecord[];

  // Mutations
  createBusinessUnit: (input: CreateBusinessUnitInput, actor: BusinessUnitActor) => BusinessUnit;
  updateBusinessUnit: (
    unitId: string,
    input: UpdateBusinessUnitInput,
    actor: BusinessUnitActor
  ) => BusinessUnit;
  deactivateBusinessUnit: (
    unitId: string,
    reason: string,
    actor: BusinessUnitActor
  ) => BusinessUnit;
  activateBusinessUnit: (unitId: string, actor: BusinessUnitActor) => BusinessUnit;

  recordActivity: (input: RecordActivityInput, actor: BusinessUnitActor) => UnitActivityRecord;
  verifyActivity: (activityId: string, actor: BusinessUnitActor) => UnitActivityRecord;
  cancelActivity: (
    activityId: string,
    reason: string,
    actor: BusinessUnitActor
  ) => UnitActivityRecord;

  // Selectors / Aggregations
  getUnitById: (unitId: string) => BusinessUnit | undefined;
  getUnitByCode: (code: string) => BusinessUnit | undefined;
  getActivityById: (activityId: string) => UnitActivityRecord | undefined;
  getPerformanceRecap: (unitId?: string, periodYear?: number) => BusinessUnitPerformanceRecap;
  getMemberEconomicParticipation: (
    memberDemoId: string,
    actor: BusinessUnitActor
  ) => MemberEconomicParticipation;
  getMemberActivities: (
    memberDemoId: string,
    actor: BusinessUnitActor
  ) => UnitActivityRecord[];

  // Maintenance & Recovery
  resetToSeed: () => void;
}

function loadFromStorage(): StoragePayload {
  if (typeof window === "undefined") {
    return {
      businessUnits: initialSeedBusinessUnits,
      activities: initialSeedActivities,
    };
  }

  try {
    const raw = localStorage.getItem(BUSINESS_UNITS_STORAGE_KEY);
    if (!raw) {
      return {
        businessUnits: initialSeedBusinessUnits,
        activities: initialSeedActivities,
      };
    }

    const parsed = JSON.parse(raw) as Partial<StoragePayload>;
    if (
      !parsed ||
      !Array.isArray(parsed.businessUnits) ||
      !Array.isArray(parsed.activities)
    ) {
      // Corrupt payload fallback
      return {
        businessUnits: initialSeedBusinessUnits,
        activities: initialSeedActivities,
      };
    }

    return {
      businessUnits: parsed.businessUnits,
      activities: parsed.activities,
    };
  } catch {
    // Corrupt JSON parse error fallback
    return {
      businessUnits: initialSeedBusinessUnits,
      activities: initialSeedActivities,
    };
  }
}

function saveToStorage(payload: StoragePayload): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BUSINESS_UNITS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // LocalStorage write error fallback
  }
}

export const useBusinessUnitStore = create<BusinessUnitStoreState>((set, get) => {
  const initialData = loadFromStorage();

  return {
    businessUnits: initialData.businessUnits,
    activities: initialData.activities,

    createBusinessUnit: (input, actor) => {
      // 1. Strict SoD: Admin and Super Admin cannot perform operational business mutations
      if (actor.role === "admin" || actor.role === "super_admin") {
        throw new Error(
          "Pemisahan Tugas (SoD): Akun Administrator sistem tidak memiliki kewenangan mengelola unit usaha operasional."
        );
      }

      // 2. RBAC check: Must have business_units:create (Manager only)
      if (!canPerformAction(actor.role, "business_units", "create")) {
        throw new Error(
          `Akses ditolak: Peran ${actor.role} tidak memiliki kewenangan membuat unit usaha baru (business_units:create).`
        );
      }

      // 3. Validation via Zod
      const validated = createBusinessUnitSchema.parse(input);

      // 4. Unique code check (case-insensitive)
      const existingUnits = get().businessUnits;
      const codeTrimmed = validated.code.trim();
      const duplicate = existingUnits.find(
        (u) => u.code.toLowerCase() === codeTrimmed.toLowerCase()
      );
      if (duplicate) {
        throw new Error(
          `Kode unit usaha "${codeTrimmed}" sudah digunakan oleh unit "${duplicate.name}". Kode unit harus unik.`
        );
      }

      // 5. Generate unique BU ID
      const nextNum = existingUnits.length + 1;
      const unitId = `BU-${String(nextNum).padStart(3, "0")}`;
      const now = new Date().toISOString();

      const newUnit: BusinessUnit = {
        id: unitId,
        code: codeTrimmed,
        name: validated.name.trim(),
        category: validated.category,
        description: validated.description.trim(),
        picName: validated.picName.trim(),
        picPhone: validated.picPhone.trim(),
        operationalLocation: validated.operationalLocation.trim(),
        status: "active",
        createdAt: now,
        updatedAt: now,
        history: [
          {
            id: `LOG-${unitId}-1`,
            timestamp: now,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: "created",
            details: `Unit usaha ${validated.name.trim()} (${codeTrimmed}) berhasil dibuat oleh ${actor.name}.`,
          },
        ],
      };

      const updatedUnits = [newUnit, ...existingUnits];
      saveToStorage({ businessUnits: updatedUnits, activities: get().activities });
      set({ businessUnits: updatedUnits });

      return newUnit;
    },

    updateBusinessUnit: (unitId, input, actor) => {
      // 1. RBAC check
      if (!canPerformAction(actor.role, "business_units", "update")) {
        throw new Error(
          `Akses ditolak: Peran ${actor.role} tidak memiliki izin memperbarui data unit usaha (business_units:update).`
        );
      }

      if (actor.role === "admin" || actor.role === "super_admin") {
        throw new Error(
          "Pemisahan Tugas (SoD): Administrator teknis tidak berwenang memperbarui unit operasional."
        );
      }

      // 2. Validate input
      const validated = updateBusinessUnitSchema.parse(input);

      // 3. Target unit must exist
      const existingUnits = get().businessUnits;
      const targetIndex = existingUnits.findIndex((u) => u.id === unitId);
      if (targetIndex === -1) {
        throw new Error(`Unit usaha dengan ID "${unitId}" tidak ditemukan.`);
      }

      const targetUnit = existingUnits[targetIndex];
      const now = new Date().toISOString();

      // Collect change summary for audit log
      const changesList: string[] = [];
      if (validated.name && validated.name !== targetUnit.name) {
        changesList.push(`nama: "${targetUnit.name}" -> "${validated.name}"`);
      }
      if (validated.category && validated.category !== targetUnit.category) {
        changesList.push(`kategori: "${targetUnit.category}" -> "${validated.category}"`);
      }
      if (validated.picName && validated.picName !== targetUnit.picName) {
        changesList.push(`PIC: "${targetUnit.picName}" -> "${validated.picName}"`);
      }
      if (validated.picPhone && validated.picPhone !== targetUnit.picPhone) {
        changesList.push(`kontak: "${targetUnit.picPhone}" -> "${validated.picPhone}"`);
      }
      if (
        validated.operationalLocation &&
        validated.operationalLocation !== targetUnit.operationalLocation
      ) {
        changesList.push(
          `lokasi: "${targetUnit.operationalLocation}" -> "${validated.operationalLocation}"`
        );
      }
      if (validated.description && validated.description !== targetUnit.description) {
        changesList.push("deskripsi diperbarui");
      }

      const auditLog = {
        id: `LOG-${unitId}-${targetUnit.history.length + 1}`,
        timestamp: now,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "updated" as const,
        details:
          changesList.length > 0
            ? `Pembaruan data unit usaha: ${changesList.join(", ")}.`
            : "Data unit usaha disimpan ulang tanpa perubahan atribut utama.",
      };

      const updatedUnit: BusinessUnit = {
        ...targetUnit,
        name: validated.name?.trim() ?? targetUnit.name,
        category: validated.category ?? targetUnit.category,
        description: validated.description?.trim() ?? targetUnit.description,
        picName: validated.picName?.trim() ?? targetUnit.picName,
        picPhone: validated.picPhone?.trim() ?? targetUnit.picPhone,
        operationalLocation:
          validated.operationalLocation?.trim() ?? targetUnit.operationalLocation,
        updatedAt: now,
        history: [...targetUnit.history, auditLog],
      };

      const newUnits = [...existingUnits];
      newUnits[targetIndex] = updatedUnit;

      saveToStorage({ businessUnits: newUnits, activities: get().activities });
      set({ businessUnits: newUnits });

      return updatedUnit;
    },

    deactivateBusinessUnit: (unitId, reason, actor) => {
      // 1. RBAC check
      if (!canPerformAction(actor.role, "business_units", "deactivate")) {
        throw new Error(
          `Akses ditolak: Peran ${actor.role} tidak berwenang menonaktifkan unit usaha (business_units:deactivate).`
        );
      }

      if (actor.role === "admin" || actor.role === "super_admin") {
        throw new Error(
          "Pemisahan Tugas (SoD): Administrator teknis tidak berwenang menonaktifkan unit operasional."
        );
      }

      if (!reason || reason.trim().length < 3) {
        throw new Error("Alasan penonaktifan unit usaha wajib diisi minimal 3 karakter.");
      }

      const existingUnits = get().businessUnits;
      const targetIndex = existingUnits.findIndex((u) => u.id === unitId);
      if (targetIndex === -1) {
        throw new Error(`Unit usaha dengan ID "${unitId}" tidak ditemukan.`);
      }

      const targetUnit = existingUnits[targetIndex];
      if (targetUnit.status === "inactive") {
        throw new Error(`Unit usaha "${targetUnit.name}" sudah berstatus nonaktif.`);
      }

      const now = new Date().toISOString();
      const auditLog = {
        id: `LOG-${unitId}-${targetUnit.history.length + 1}`,
        timestamp: now,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "deactivated" as const,
        details: `Unit dinonaktifkan: ${reason.trim()}`,
      };

      const updatedUnit: BusinessUnit = {
        ...targetUnit,
        status: "inactive",
        updatedAt: now,
        history: [...targetUnit.history, auditLog],
      };

      const newUnits = [...existingUnits];
      newUnits[targetIndex] = updatedUnit;

      saveToStorage({ businessUnits: newUnits, activities: get().activities });
      set({ businessUnits: newUnits });

      return updatedUnit;
    },

    activateBusinessUnit: (unitId, actor) => {
      if (!canPerformAction(actor.role, "business_units", "update")) {
        throw new Error(
          `Akses ditolak: Peran ${actor.role} tidak berwenang mengaktifkan unit usaha.`
        );
      }

      if (actor.role === "admin" || actor.role === "super_admin") {
        throw new Error(
          "Pemisahan Tugas (SoD): Administrator teknis tidak berwenang mengaktifkan unit operasional."
        );
      }

      const existingUnits = get().businessUnits;
      const targetIndex = existingUnits.findIndex((u) => u.id === unitId);
      if (targetIndex === -1) {
        throw new Error(`Unit usaha dengan ID "${unitId}" tidak ditemukan.`);
      }

      const targetUnit = existingUnits[targetIndex];
      if (targetUnit.status === "active") {
        throw new Error(`Unit usaha "${targetUnit.name}" sudah berstatus aktif.`);
      }

      const now = new Date().toISOString();
      const auditLog = {
        id: `LOG-${unitId}-${targetUnit.history.length + 1}`,
        timestamp: now,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "activated" as const,
        details: `Unit usaha diaktifkan kembali untuk operasional oleh ${actor.name}.`,
      };

      const updatedUnit: BusinessUnit = {
        ...targetUnit,
        status: "active",
        updatedAt: now,
        history: [...targetUnit.history, auditLog],
      };

      const newUnits = [...existingUnits];
      newUnits[targetIndex] = updatedUnit;

      saveToStorage({ businessUnits: newUnits, activities: get().activities });
      set({ businessUnits: newUnits });

      return updatedUnit;
    },

    recordActivity: (input, actor) => {
      // 1. Strict SoD: Auditor and Admin roles are strictly blocked from writing transactions
      if (actor.role === "auditor") {
        throw new Error(
          "Pemisahan Tugas (Audit Integrity): Auditor bersifat murni pengawas (read-only) dan dilarang mencatat transaksi operasional."
        );
      }
      if (actor.role === "admin" || actor.role === "super_admin") {
        throw new Error(
          "Pemisahan Tugas (SoD): Administrator teknis dilarang melakukan transaksi bisnis atau pencatatan operasional."
        );
      }

      // 2. RBAC check: Must have business_units:record
      if (!canPerformAction(actor.role, "business_units", "record")) {
        throw new Error(
          `Akses ditolak: Peran ${actor.role} tidak memiliki izin mencatat aktivitas operasional unit usaha (business_units:record).`
        );
      }

      // 3. Zod schema validation
      const validated = recordActivitySchema.parse(input);

      // 4. Target unit validation
      const unit = get().businessUnits.find((u) => u.id === validated.unitId);
      if (!unit) {
        throw new Error(`Unit usaha dengan ID "${validated.unitId}" tidak ditemukan.`);
      }

      // Target unit must be ACTIVE. Inactive units cannot accept new operational records.
      if (unit.status !== "active") {
        throw new Error(
          `Unit usaha "${unit.name}" sedang nonaktif dan tidak dapat menerima pencatatan transaksi operasional baru.`
        );
      }

      // 5. Member linkage validation (if provided)
      let resolvedMemberName: string | undefined;
      let canonicalMemberId: string | undefined;

      if (validated.memberDemoId && validated.memberDemoId.trim() !== "") {
        const memDemoId = validated.memberDemoId.trim();
        const membershipStore = useMembershipStore.getState();
        const member = membershipStore.members.find(
          (m) => m.demoId === memDemoId || m.id === memDemoId || m.memberNumber === memDemoId
        );

        if (!member) {
          throw new Error(
            `Anggota dengan identitas "${memDemoId}" tidak terdaftar dalam basis data keanggotaan koperasi.`
          );
        }

        // Active membership check
        if (member.status !== "active") {
          throw new Error(
            `Anggota "${member.fullName}" berstatus "${member.status}" (tidak aktif). Hanya anggota berstatus aktif yang dapat dikaitkan dengan transaksi unit usaha.`
          );
        }

        resolvedMemberName = member.fullName;
        canonicalMemberId = member.demoId || member.id;
      }

      // 6. Generate unique reference number (TRX-BU-2026-XXXX)
      const existingActivities = get().activities;
      let trxNum = existingActivities.length + 1;
      let referenceId = `TRX-BU-2026-${String(trxNum).padStart(4, "0")}`;
      while (existingActivities.some((a) => a.id === referenceId)) {
        trxNum += 1;
        referenceId = `TRX-BU-2026-${String(trxNum).padStart(4, "0")}`;
      }

      const now = new Date().toISOString();

      const newRecord: UnitActivityRecord = {
        id: referenceId,
        unitId: unit.id,
        unitCode: unit.code,
        unitName: unit.name,
        activityDate: validated.activityDate,
        activityType: validated.activityType,
        description: validated.description.trim(),
        quantity: validated.quantity,
        unitOfMeasure: validated.unitOfMeasure?.trim(),
        amount: Math.round(validated.amount),
        memberId: canonicalMemberId,
        memberDemoId: canonicalMemberId,
        memberName: resolvedMemberName,
        recordedById: actor.id,
        recordedByName: actor.name,
        recordedByRole: actor.role,
        status: "recorded",
        notes: validated.notes?.trim(),
        createdAt: now,
        updatedAt: now,
      };

      const updatedActivities = [newRecord, ...existingActivities];
      saveToStorage({ businessUnits: get().businessUnits, activities: updatedActivities });
      set({ activities: updatedActivities });

      return newRecord;
    },

    verifyActivity: (activityId, actor) => {
      // 1. Strict SoD
      if (actor.role === "auditor") {
        throw new Error(
          "Pemisahan Tugas: Auditor bersifat murni pengawas (read-only) dan dilarang memverifikasi transaksi operasional."
        );
      }
      if (actor.role === "admin" || actor.role === "super_admin") {
        throw new Error("Pemisahan Tugas: Administrator teknis tidak berwenang memverifikasi transaksi operasional.");
      }

      // 2. RBAC check
      if (!canPerformAction(actor.role, "business_units", "verify")) {
        throw new Error(
          `Akses ditolak: Peran ${actor.role} tidak memiliki kewenangan memverifikasi aktivitas unit usaha (business_units:verify).`
        );
      }

      const existingActivities = get().activities;
      const targetIndex = existingActivities.findIndex((a) => a.id === activityId);
      if (targetIndex === -1) {
        throw new Error(`Catatan aktivitas dengan nomor referensi "${activityId}" tidak ditemukan.`);
      }

      const target = existingActivities[targetIndex];
      if (target.status !== "recorded") {
        throw new Error(
          `Catatan aktivitas "${activityId}" tidak dapat diverifikasi karena berstatus "${target.status}". Hanya status "recorded" yang dapat diverifikasi.`
        );
      }

      const now = new Date().toISOString();
      const verifiedRecord: UnitActivityRecord = {
        ...target,
        status: "verified",
        verifiedById: actor.id,
        verifiedByName: actor.name,
        verifiedAt: now,
        updatedAt: now,
      };

      const updatedActivities = [...existingActivities];
      updatedActivities[targetIndex] = verifiedRecord;

      saveToStorage({ businessUnits: get().businessUnits, activities: updatedActivities });
      set({ activities: updatedActivities });

      return verifiedRecord;
    },

    cancelActivity: (activityId, reason, actor) => {
      // 1. RBAC check: Must have verify or update permission
      if (
        !canPerformAction(actor.role, "business_units", "verify") &&
        !canPerformAction(actor.role, "business_units", "update")
      ) {
        throw new Error(
          `Akses ditolak: Peran ${actor.role} tidak memiliki kewenangan membatalkan aktivitas unit usaha.`
        );
      }

      if (!reason || reason.trim().length < 3) {
        throw new Error("Alasan pembatalan aktivitas operasional wajib diisi minimal 3 karakter.");
      }

      const existingActivities = get().activities;
      const targetIndex = existingActivities.findIndex((a) => a.id === activityId);
      if (targetIndex === -1) {
        throw new Error(`Catatan aktivitas dengan nomor referensi "${activityId}" tidak ditemukan.`);
      }

      const target = existingActivities[targetIndex];
      if (target.status === "cancelled") {
        throw new Error(`Catatan aktivitas "${activityId}" sudah dibatalkan sebelumnya.`);
      }

      const now = new Date().toISOString();
      const cancelledRecord: UnitActivityRecord = {
        ...target,
        status: "cancelled",
        cancellationReason: reason.trim(),
        updatedAt: now,
      };

      const updatedActivities = [...existingActivities];
      updatedActivities[targetIndex] = cancelledRecord;

      saveToStorage({ businessUnits: get().businessUnits, activities: updatedActivities });
      set({ activities: updatedActivities });

      return cancelledRecord;
    },

    getUnitById: (unitId) => {
      return get().businessUnits.find((u) => u.id === unitId);
    },

    getUnitByCode: (code) => {
      return get().businessUnits.find(
        (u) => u.code.toLowerCase() === code.trim().toLowerCase()
      );
    },

    getActivityById: (activityId) => {
      return get().activities.find((a) => a.id === activityId);
    },

    getPerformanceRecap: (unitId, periodYear) => {
      const allActivities = get().activities;
      const allUnits = get().businessUnits;

      // Filter by unit if specified
      let filtered = unitId ? allActivities.filter((a) => a.unitId === unitId) : allActivities;

      // Filter by period year if specified
      if (periodYear) {
        filtered = filtered.filter((a) => a.activityDate.startsWith(String(periodYear)));
      }

      let recordedCount = 0;
      let verifiedCount = 0;
      let cancelledCount = 0;
      let grossRevenue = 0;
      let totalExpenditure = 0;
      let totalVolume = 0;
      const memberSet = new Set<string>();

      for (const act of filtered) {
        if (act.status === "recorded") recordedCount += 1;
        if (act.status === "verified") verifiedCount += 1;
        if (act.status === "cancelled") cancelledCount += 1;

        // P1 Integrity Rule: ONLY VERIFIED transactions contribute to grossRevenue, expenditure, volume, and member involvement
        if (act.status === "verified") {
          const meta = UNIT_ACTIVITY_TYPES[act.activityType];
          if (meta.classification === "gross_revenue") {
            grossRevenue += act.amount;
          } else if (meta.classification === "expenditure") {
            totalExpenditure += act.amount;
          }

          if (act.quantity && act.quantity > 0) {
            totalVolume += act.quantity;
          }

          if (act.memberDemoId) {
            memberSet.add(act.memberDemoId);
          }
        }
      }

      // Build summaries for all units (or selected unit) using the exact same verified-only rules
      const targetUnits = unitId ? allUnits.filter((u) => u.id === unitId) : allUnits;
      const unitSummaries = targetUnits.map((u) => {
        const uActs = allActivities.filter((a) => a.unitId === u.id);
        const uVerified = uActs.filter((a) => a.status === "verified");

        let uRevenue = 0;
        let uExpenditure = 0;
        let uVol = 0;

        for (const a of uVerified) {
          const meta = UNIT_ACTIVITY_TYPES[a.activityType];
          if (meta.classification === "gross_revenue") {
            uRevenue += a.amount;
          } else if (meta.classification === "expenditure") {
            uExpenditure += a.amount;
          }
          if (a.quantity && a.quantity > 0) {
            uVol += a.quantity;
          }
        }

        return {
          unitId: u.id,
          code: u.code,
          name: u.name,
          category: u.category,
          status: u.status,
          transactionCount: uVerified.length,
          grossRevenue: uRevenue,
          totalExpenditure: uExpenditure,
          volume: uVol,
        };
      });

      return {
        totalActivities: filtered.length,
        recordedActivities: recordedCount,
        verifiedActivities: verifiedCount,
        cancelledActivities: cancelledCount,
        grossRevenue,
        totalExpenditure,
        totalVolume,
        memberInvolvementCount: memberSet.size,
        unitSummaries,
      };
    },

    getMemberEconomicParticipation: (memberDemoId, actor) => {
      // P0 Ownership & Privacy Enforcement
      if (!actor) {
        throw new Error("Akses ditolak: Autentikasi sesi pengguna diperlukan.");
      }

      const canonicalId = (memberDemoId || "").trim();
      if (!canonicalId) {
        throw new Error("Akses ditolak: Identitas anggota tidak valid.");
      }

      if (actor.role === "member") {
        if (!actor.memberId || actor.memberId.trim() === "") {
          throw new Error(
            "Akses ditolak: Identitas keanggotaan (memberId) tidak ditemukan pada akun Anda."
          );
        }
        if (actor.memberId.trim() !== canonicalId) {
          throw new Error(
            "Akses ditolak: Anggota hanya memiliki hak untuk membaca data partisipasi ekonomi miliknya sendiri."
          );
        }
      } else {
        if (!canPerformAction(actor.role, "business_units", "view")) {
          throw new Error(
            `Akses ditolak: Peran ${actor.role} tidak memiliki izin melihat data partisipasi ekonomi anggota.`
          );
        }
      }

      const allActivities = get().activities;

      const memberActs = allActivities.filter(
        (a) => a.memberDemoId === canonicalId || a.memberId === canonicalId
      );

      // P1 Aggregation Integrity: ONLY VERIFIED transactions count towards SHU economic participation
      const verifiedMemberActs = memberActs.filter((a) => a.status === "verified");

      let totalSpending = 0;
      let totalCommoditySupply = 0;

      for (const act of verifiedMemberActs) {
        if (act.activityType === "sales") {
          totalSpending += act.amount;
        } else if (act.activityType === "member_supply") {
          totalCommoditySupply += act.amount;
        }
      }

      const memStore = useMembershipStore.getState();
      const member = memStore.members.find(
        (m) => m.demoId === canonicalId || m.id === canonicalId
      );
      const memberName = member?.fullName || memberActs[0]?.memberName || "Anggota Koperasi";

      return {
        memberDemoId: canonicalId,
        memberName,
        totalSpending,
        totalCommoditySupply,
        totalTransactionCount: verifiedMemberActs.length,
        activities: verifiedMemberActs,
        allActivities: memberActs,
      };
    },

    getMemberActivities: (memberDemoId, actor) => {
      // P0 Ownership & Privacy Enforcement
      if (!actor) {
        throw new Error("Akses ditolak: Autentikasi sesi pengguna diperlukan.");
      }

      const canonicalId = (memberDemoId || "").trim();
      if (!canonicalId) {
        throw new Error("Akses ditolak: Identitas anggota tidak valid.");
      }

      if (actor.role === "member") {
        if (!actor.memberId || actor.memberId.trim() === "") {
          throw new Error(
            "Akses ditolak: Identitas keanggotaan (memberId) tidak ditemukan pada akun Anda."
          );
        }
        if (actor.memberId.trim() !== canonicalId) {
          throw new Error(
            "Akses ditolak: Anggota hanya memiliki hak untuk melihat riwayat transaksi dan partisipasi miliknya sendiri."
          );
        }
      } else {
        if (!canPerformAction(actor.role, "business_units", "view")) {
          throw new Error(
            `Akses ditolak: Peran ${actor.role} tidak memiliki izin melihat riwayat aktivitas anggota.`
          );
        }
      }

      return get().activities.filter(
        (a) => a.memberDemoId === canonicalId || a.memberId === canonicalId
      );
    },

    resetToSeed: () => {
      saveToStorage({
        businessUnits: initialSeedBusinessUnits,
        activities: initialSeedActivities,
      });
      set({
        businessUnits: initialSeedBusinessUnits,
        activities: initialSeedActivities,
      });
    },
  };
});
