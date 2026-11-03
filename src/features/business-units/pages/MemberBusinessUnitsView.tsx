import React, { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessUnitStore, BusinessUnitActor } from "../stores/businessUnitStore";
import { formatIDR, formatDate } from "@/lib/utils";
import { BUSINESS_UNIT_CATEGORIES, UNIT_ACTIVITY_TYPES } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectOption } from "@/components/ui/Select";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Info,
  Layers,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

export const MemberBusinessUnitsView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const {
    businessUnits,
    getMemberEconomicParticipation,
    getMemberActivities,
  } = useBusinessUnitStore();

  const [activeUnitCategoryFilter, setActiveUnitCategoryFilter] = useState<string>("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("all");

  // Construct actor strictly from authenticated session
  const actor = useMemo<BusinessUnitActor | null>(() => {
    if (!currentUser || !currentUser.role) return null;
    return {
      id: currentUser.id || "demo_actor",
      name: currentUser.name,
      role: currentUser.role,
      memberId: currentUser.memberId,
    };
  }, [currentUser]);

  // Strict member identity validation: No fallback to DEMO-ID-0001
  const memberId =
    currentUser?.role === "member" && currentUser.memberId && currentUser.memberId.trim() !== ""
      ? currentUser.memberId.trim()
      : undefined;

  // Safe selector: Only query participation if valid memberId and actor exist
  const participation = useMemo(() => {
    if (!memberId || !actor) return null;
    try {
      return getMemberEconomicParticipation(memberId, actor);
    } catch {
      return null;
    }
  }, [getMemberEconomicParticipation, memberId, actor]);

  // Safe selector: Query all personal activities (including pending & cancelled for transparent tracking)
  const personalActivities = useMemo(() => {
    if (!memberId || !actor) return [];
    try {
      return getMemberActivities(memberId, actor);
    } catch {
      return [];
    }
  }, [getMemberActivities, memberId, actor]);

  // Active units catalog
  const activeUnits = useMemo(() => {
    return businessUnits
      .filter((u) => u.status === "active")
      .filter(
        (u) =>
          activeUnitCategoryFilter === "all" || u.category === activeUnitCategoryFilter
      );
  }, [businessUnits, activeUnitCategoryFilter]);

  // Filtered personal activities
  const filteredPersonalActivities = useMemo(() => {
    return personalActivities.filter((a) => {
      if (transactionTypeFilter === "all") return true;
      return a.activityType === transactionTypeFilter;
    });
  }, [personalActivities, transactionTypeFilter]);

  const unitCategoryOptions: SelectOption[] = [
    { value: "all", label: "Semua Jenis Layanan" },
    { value: "retail_waserda", label: "Waserda & Ritel" },
    { value: "agriculture_food", label: "Pertanian & Pangan" },
    { value: "logistics_supply", label: "Logistik & Saprotan" },
    { value: "processing_production", label: "Pengolahan & Produksi" },
    { value: "services", label: "Jasa & Persewaan" },
  ];

  const transactionTypeOptions: SelectOption[] = [
    { value: "all", label: "Semua Transaksi" },
    { value: "sales", label: "Belanja Produk / Sembako" },
    { value: "member_supply", label: "Pasokan Komoditas" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unit Usaha & Belanja Anggota"
        subtitle="Katalog unit bisnis koperasi, transparansi layanan riil, dan catatan riwayat partisipasi ekonomi Anda."
        breadcrumbs={[{ label: "Portal", href: "/portal" }, { label: "Unit Usaha" }]}
        badge={{ text: "Portal Anggota", variant: "success" }}
      />

      {/* 1. Missing Member Identity Guard */}
      {!memberId && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold block mb-0.5">Identitas Keanggotaan Tidak Ditemukan:</span>
            Sesi akun Anda tidak memiliki nomor identitas anggota (memberId) yang sah. Data partisipasi ekonomi dan
            riwayat belanja pribadi hanya dapat diakses melalui akun Anggota Koperasi terdaftar.
          </div>
        </div>
      )}

      {/* 2. Personal Participation Stats (Visible only when authenticated with valid memberId) */}
      {memberId && participation && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Belanja di Waserda"
            value={formatIDR(participation.totalSpending)}
            description="Akumulasi pembelian terverifikasi"
            icon={<ShoppingBag className="w-5 h-5 text-forest-700" />}
          />
          <StatCard
            title="Pasokan Komoditas Hasil Usaha"
            value={formatIDR(participation.totalCommoditySupply)}
            description="Nilai komoditas terverifikasi"
            icon={<TrendingUp className="w-5 h-5 text-forest-700" />}
          />
          <StatCard
            title="Jumlah Transaksi Terverifikasi"
            value={`${participation.totalTransactionCount} Transaksi`}
            description="Partisipasi sah dasar SHU Jasa Usaha"
            icon={<CheckCircle2 className="w-5 h-5 text-forest-700" />}
          />
        </div>
      )}

      {/* 3. Educational & SHU Readiness Alert Banner */}
      <div className="p-4 rounded-xl bg-forest-50 border border-forest-200 flex items-start gap-3.5">
        <Sparkles className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
        <div className="text-xs text-forest-900 leading-relaxed">
          <span className="font-semibold block mb-0.5">
            Kontribusi Belanja Terverifikasi Menjadi Dasar Sisa Hasil Usaha (SHU):
          </span>
          Sesuai prinsip koperasi, transaksi belanja sembako di Waserda KMB dan pasokan komoditas yang telah{" "}
          <strong>terverifikasi</strong> otomatis menjadi dasar perhitungan <strong>Jasa Usaha</strong> Anda pada
          pembagian SHU tahunan. Transaksi berstatus tercatat (menunggu verifikasi) atau dibatalkan tidak
          diperhitungkan ke dalam SHU.
        </div>
      </div>

      {/* 4. Section: Katalog Unit Usaha Koperasi */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest-700" />
              <span>Katalog Unit Usaha Koperasi KMB</span>
            </h2>
            <p className="text-xs text-ink-500">
              Layanan fisik dan sentra produksi riil yang siap melayani anggota dan masyarakat.
            </p>
          </div>
          <div className="w-full sm:w-56">
            <Select
              value={activeUnitCategoryFilter}
              onChange={(e) => setActiveUnitCategoryFilter(e.target.value)}
              options={unitCategoryOptions}
              className="text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeUnits.map((unit) => {
            const catMeta = BUSINESS_UNIT_CATEGORIES[unit.category];
            return (
              <Card
                key={unit.id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow border-ink-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <Badge variant={catMeta?.badgeVariant || "neutral"} className="text-[10px]">
                      {catMeta?.label || unit.category}
                    </Badge>
                    <Badge variant="success" dot className="text-[10px]">
                      Aktif
                    </Badge>
                  </div>
                  <CardTitle className="text-base text-ink-900 leading-snug">
                    {unit.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-ink-600 line-clamp-2 mt-1">
                    {unit.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-2.5 text-xs text-ink-600 border-t border-ink-100 mt-2">
                  <div className="flex items-start gap-2 pt-2.5">
                    <MapPin className="w-4 h-4 text-ink-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{unit.operationalLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-ink-400 shrink-0" />
                    <span>PIC: {unit.picName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-ink-400 shrink-0" />
                    <span>Kontak: {unit.picPhone}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 5. Section: Riwayat Transaksi Partisipasi Pribadi Anggota (Only if memberId exists) */}
      {memberId && (
        <Card>
          <CardHeader className="border-b border-ink-100 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base">Riwayat Partisipasi & Belanja Anda</CardTitle>
                <CardDescription className="text-xs">
                  Daftar transaksi belanja sembako dan penyaluran komoditas Anda di seluruh unit usaha KMB.
                </CardDescription>
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                  options={transactionTypeOptions}
                  className="text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {filteredPersonalActivities.length === 0 ? (
              <EmptyState
                title="Belum Ada Riwayat Belanja"
                description="Anda belum memiliki transaksi belanja atau pasokan komoditas yang tercatat di unit usaha koperasi."
                className="py-12"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Referensi / Tanggal</TableHead>
                    <TableHead>Unit Usaha</TableHead>
                    <TableHead>Aktivitas & Rincian</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead className="text-right">Nominal (Rp)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersonalActivities.map((act) => {
                    const typeMeta = UNIT_ACTIVITY_TYPES[act.activityType];
                    const isVerified = act.status === "verified";
                    const isRecorded = act.status === "recorded";
                    const isCancelled = act.status === "cancelled";

                    return (
                      <TableRow key={act.id} className="hover:bg-ink-50/70">
                        <TableCell>
                          <div className="font-mono font-semibold text-ink-900 text-xs">
                            {act.id}
                          </div>
                          <div className="text-[11px] text-ink-500">
                            {formatDate(act.activityDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-ink-900 text-xs">{act.unitName}</div>
                          <div className="text-[10px] font-mono text-ink-500">{act.unitCode}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={typeMeta?.badgeVariant || "neutral"} className="text-[10px] mb-1">
                            {typeMeta?.label || act.activityType}
                          </Badge>
                          <div className="text-xs text-ink-800 line-clamp-1 max-w-xs">
                            {act.description}
                          </div>
                          {act.notes && (
                            <div className="text-[10px] text-ink-500">{act.notes}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-ink-700">
                          {act.quantity ? `${act.quantity} ${act.unitOfMeasure || ""}` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-xs text-forest-800">
                          {formatIDR(act.amount)}
                        </TableCell>
                        <TableCell>
                          {isVerified && (
                            <Badge variant="success" dot className="text-[10px]">
                              Terverifikasi
                            </Badge>
                          )}
                          {isRecorded && (
                            <Badge variant="info" dot className="text-[10px]">
                              Tercatat (Menunggu Verifikasi)
                            </Badge>
                          )}
                          {isCancelled && (
                            <Badge variant="danger" dot className="text-[10px]">
                              Dibatalkan
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* 6. Privacy Notice */}
      {memberId && participation && (
        <div className="p-3 bg-ink-50 border border-ink-200 rounded-lg flex items-center gap-2 text-ink-600 text-xs">
          <Info className="w-4 h-4 text-ink-400 shrink-0" />
          <span>
            Privasi Terjaga: Halaman ini hanya menampilkan data partisipasi pribadi Anda ({participation.memberName}).
            Kerahasiaan transaksi anggota lain dan catatan buku besar internal koperasi dilindungi oleh sistem keamanan KMB.
          </span>
        </div>
      )}
    </div>
  );
};
