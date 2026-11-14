import React, { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useShuStore } from "../stores/shuStore";
import { formatIDR, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  PieChart,
  Wallet,
  ShoppingBag,
  Info,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const MemberShuPortalView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { periods } = useShuStore();

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  const actor = useMemo(() => {
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

  // Published periods
  const publishedPeriods = useMemo(() => {
    return periods.filter((p) => p.status === "published" || p.status === "closed");
  }, [periods]);

  // Current active period selection
  const activePeriod = useMemo(() => {
    if (publishedPeriods.length === 0) return null;
    if (selectedPeriodId) {
      const found = publishedPeriods.find((p) => p.id === selectedPeriodId);
      if (found) return found;
    }
    return publishedPeriods[0];
  }, [publishedPeriods, selectedPeriodId]);

  // Active snapshot & member distribution
  const memberDistributionData = useMemo(() => {
    if (!activePeriod || !memberId) return null;
    const snapshot =
      activePeriod.snapshots.find((s) => s.id === activePeriod.activeSnapshotId) ||
      activePeriod.snapshots.find((s) => s.status === "published");
    if (!snapshot) return null;

    const dist = snapshot.memberDistributions.find((d) => d.memberId === memberId);
    if (!dist) return null;

    return { snapshot, dist };
  }, [activePeriod, memberId]);

  if (!memberId || !actor) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sisa Hasil Usaha (SHU) Saya"
          subtitle="Transparansi alokasi dan riwayat penerimaan SHU anggota KMB."
        />
        <EmptyState
          icon={<PieChart className="w-6 h-6 text-ink-600" />}
          title="Identitas Anggota Tidak Ditemukan"
          description="Sesi Anda saat ini tidak memiliki identitas anggota resmi (memberId). Silakan beralih ke akun Anggota Koperasi pada Demo Role Switcher."
        />
      </div>
    );
  }

  if (publishedPeriods.length === 0 || !memberDistributionData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sisa Hasil Usaha (SHU) Saya"
          subtitle="Transparansi alokasi dan riwayat penerimaan SHU anggota KMB."
        />

        <div className="p-4 bg-forest-50/70 border border-forest-200/60 rounded-xl text-left flex items-start gap-3">
          <Info className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
          <div className="text-xs text-ink-700 leading-relaxed">
            <span className="font-bold text-forest-900 uppercase tracking-wider block mb-0.5">
              Simulasi Transparansi SHU Demonstrasi
            </span>
            Informasi hak alokasi SHU anggota dihitung dari akumulasi Simpanan Wajib dan partisipasi transaksi pada unit usaha koperasi yang telah diverifikasi.
          </div>
        </div>

        <EmptyState
          icon={<PieChart className="w-6 h-6 text-ink-600" />}
          title="Belum Ada SHU yang Dipublikasikan"
          description="Perhitungan SHU untuk tahun buku berjalan saat ini sedang dalam proses penutupan buku dan pemeriksaan pengurus. Hasil resmi akan tampil di sini segera setelah disahkan dalam Rapat Anggota."
        />
      </div>
    );
  }
  const { snapshot, dist } = memberDistributionData;
  const policy = snapshot.policyConfigSnapshot;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sisa Hasil Usaha (SHU) Saya"
        subtitle="Transparansi perolehan Jasa Modal dan Jasa Usaha anggota KMB."
      />

      {/* 1. Header Banner & Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-ink-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center text-forest-800">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink-900">{activePeriod?.name}</h2>
              <Badge variant="success" size="sm">
                Dipublikasikan Resmi
              </Badge>
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
              Nomor Anggota: <span className="font-medium text-ink-800">{dist.memberNumber}</span> • Disahkan: {snapshot.publishedAt ? formatDate(snapshot.publishedAt) : "RAT KMB"}
            </p>
          </div>
        </div>

        {publishedPeriods.length > 1 && (
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <span className="text-xs text-ink-600 font-medium whitespace-nowrap">Pilih Periode:</span>
            <select
              value={activePeriod?.id}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="text-xs border border-ink-200 rounded-lg px-2.5 py-1.5 bg-white text-ink-800 focus:outline-none focus:ring-1 focus:ring-forest-600"
            >
              {publishedPeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Headline StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total SHU Diterima"
          value={formatIDR(dist.totalShu)}
          description="Akumulasi hak Jasa Modal + Jasa Usaha"
          icon={<Sparkles className="w-5 h-5 text-forest-700" />}
          className="border-forest-300/80 bg-forest-50/30"
        />
        <StatCard
          title="Bagian Jasa Modal"
          value={formatIDR(dist.jasaModalFinal)}
          description={`Dari modal simpanan terverifikasi: ${formatIDR(dist.qualifyingCapital)}`}
          icon={<Wallet className="w-5 h-5 text-ink-600" />}
        />
        <StatCard
          title="Bagian Jasa Usaha"
          value={formatIDR(dist.jasaUsahaFinal)}
          description={`Dari partisipasi transaksi: ${formatIDR(dist.verifiedParticipation)}`}
          icon={<ShoppingBag className="w-5 h-5 text-ink-600" />}
        />
      </div>
      {/* 3. Transparent Calculation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-ink-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-forest-700" />
            Rincian Komponen Pembagian SHU
          </CardTitle>
          <CardDescription className="text-xs text-ink-500">
            Dasar perhitungan proporsional hak anggota sesuai ketetapan formula kebijakan koperasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-ink-150 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-ink-50/70">
                  <TableHead className="text-xs font-bold text-ink-700">Komponen Jasa</TableHead>
                  <TableHead className="text-xs font-bold text-ink-700">Dasar Kontribusi Anggota</TableHead>
                  <TableHead className="text-xs font-bold text-ink-700 text-right">Porsi Kebijakan</TableHead>
                  <TableHead className="text-xs font-bold text-ink-700 text-right">Nominal SHU Diterima</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="py-3">
                    <p className="text-xs font-bold text-ink-900">Jasa Modal</p>
                    <p className="text-[11px] text-ink-500">Imbalan atas kontribusi modal simpanan anggota</p>
                  </TableCell>
                  <TableCell className="text-xs text-ink-700 font-mono">
                    {formatIDR(dist.qualifyingCapital)}
                    <span className="text-[10px] text-ink-500 block">
                      {policy.capitalSources.includeSimpananPokok ? "Simpanan Pokok + Wajib" : "Simpanan Wajib (Pokok dikecualikan)"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-ink-700 text-right">
                    {policy.categories.jasa_modal.percentage}%
                  </TableCell>
                  <TableCell className="text-xs font-bold text-forest-800 text-right font-mono">
                    {formatIDR(dist.jasaModalFinal)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3">
                    <p className="text-xs font-bold text-ink-900">Jasa Usaha / Transaksi</p>
                    <p className="text-[11px] text-ink-500">Imbalan atas partisipasi transaksi di unit usaha koperasi</p>
                  </TableCell>
                  <TableCell className="text-xs text-ink-700 font-mono">
                    {formatIDR(dist.verifiedParticipation)}
                    <span className="text-[10px] text-ink-500 block">Transaksi unit usaha terverifikasi</span>
                  </TableCell>
                  <TableCell className="text-xs text-ink-700 text-right">
                    {policy.categories.jasa_usaha.percentage}%
                  </TableCell>
                  <TableCell className="text-xs font-bold text-forest-800 text-right font-mono">
                    {formatIDR(dist.jasaUsahaFinal)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-forest-50/50 font-bold border-t border-forest-200">
                  <TableCell className="py-2.5 text-xs text-forest-900" colSpan={3}>
                    TOTAL SHU HAK ANGGOTA (DIBULATKAN KE RUPIAH)
                  </TableCell>
                  <TableCell className="text-sm font-bold text-forest-900 text-right font-mono">
                    {formatIDR(dist.totalShu)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* 4. Institutional Allocation Transparency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-ink-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-ink-600" />
            Transparansi Alokasi Kelembagaan Koperasi
          </CardTitle>
          <CardDescription className="text-xs text-ink-500">
            Keterbukaan alokasi laba bersih koperasi untuk kepentingan cadangan, sosial, pendidikan, dan pengurus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(snapshot.allocationBreakdown).map(([key, item]) => {
              const meta = policy.categories[key as keyof typeof policy.categories];
              return (
                <div key={key} className="p-3 bg-ink-50/80 border border-ink-150 rounded-lg text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-ink-600 uppercase tracking-wider">{item.percentage}%</span>
                  </div>
                  <p className="text-xs font-bold text-ink-800 mt-1 truncate">{meta?.label || key}</p>
                  <p className="text-xs font-mono font-semibold text-forest-800 mt-1">
                    {formatIDR(item.allocatedAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 5. Banner Safety Disclaimer */}
      <div className="p-4 bg-forest-50/60 border border-forest-200/80 rounded-xl text-left flex items-start gap-3">
        <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <p className="text-xs text-ink-700 leading-relaxed">
          <strong className="text-forest-900">Catatan Simulasi:</strong> Data perhitungan SHU ini merupakan simulasi frontend interaktif bersumber dari pencatatan transaksi verified unit usaha dan saldo simpanan aktif. Dalam koperasi operasional riil, penetapan definitif alokasi persentase disahkan melalui Rapat Anggota Tahunan (RAT).
        </p>
      </div>
    </div>
  );
};



