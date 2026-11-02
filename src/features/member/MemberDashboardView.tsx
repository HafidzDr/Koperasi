import React from "react";
import { Link } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";
import { useAuthStore } from "@/stores/authStore";
import { formatIDR, formatDate } from "@/lib/utils";
import { mockMemberSavings, mockMemberLoans } from "@/mocks/seedData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  Wallet,
  CreditCard,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  PlusCircle,
} from "lucide-react";

export const MemberDashboardView: React.FC = () => {
  const { config } = useConfigStore();
  const { currentUser } = useAuthStore();

  const totalSimpanan = mockMemberSavings.reduce((acc, curr) => acc + curr.saldo, 0);
  const activeLoan = mockMemberLoans[0];

  const recentTransactions = [
    {
      id: "TRX-8821",
      tanggal: "2026-11-01",
      keterangan: "Setoran Simpanan Wajib November 2026",
      rekening: "Simpanan Wajib (SW-0001)",
      nominal: 50000,
      jenis: "masuk",
    },
    {
      id: "TRX-8794",
      tanggal: "2026-10-15",
      keterangan: "Pembayaran Angsuran ke-4 Pinjaman Modal Usaha",
      rekening: "PJ-2024-0012",
      nominal: -916667,
      jenis: "keluar",
    },
    {
      id: "TRX-8720",
      tanggal: "2026-10-01",
      keterangan: "Setoran Simpanan Sukarela",
      rekening: "Simpanan Sukarela (SS-0001)",
      nominal: 500000,
      jenis: "masuk",
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Member Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-900">
              Selamat Datang, {currentUser.name}
            </h1>
            <Badge variant="forest" size="sm">
              {currentUser.memberId || "DEMO-ID-0001"}
            </Badge>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Status Keanggotaan: <strong className="text-success-700">Aktif & Tertib</strong> — Terdaftar sejak Januari 2024
          </p>
        </div>

        <div className="flex items-center gap-2">
          {config.activeModules.savings && (
            <Link to="/portal/pembayaran">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Setor Simpanan
              </Button>
            </Link>
          )}
          {config.activeModules.loans && (
            <Link to="/portal/pembayaran">
              <Button variant="outline" size="sm" leftIcon={<ArrowUpRight className="w-4 h-4 text-forest-700" />}>
                Bayar Angsuran
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Simpanan */}
        {config.activeModules.savings ? (
          <Card className="border-forest-600/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-600">Total Akumulasi Simpanan</span>
                <div className="p-1.5 bg-forest-100 rounded text-forest-800">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-forest-900 tabular-nums">
                {formatIDR(totalSimpanan)}
              </CardTitle>
              <CardDescription>
                Terdiri atas Simpanan Pokok, Wajib, Sukarela, & Berjangka
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-[11px] text-ink-500 pt-2 border-t border-ink-100 flex justify-between">
                <span>Imbal hasil berjalan:</span>
                <strong className="text-forest-700 font-semibold font-mono">2.0% - 5.5% p.a.</strong>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-ink-100/40 border-dashed">
            <CardHeader>
              <CardTitle className="text-base text-ink-500">Modul Simpanan Nonaktif</CardTitle>
              <CardDescription>
                Fitur simpanan saat ini sedang dinonaktifkan dalam konfigurasi koperasi.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Card 2: Pinjaman Aktif */}
        {config.activeModules.loans ? (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-600">Tagihan Angsuran Berjalan</span>
                <div className="p-1.5 bg-ink-100 rounded text-ink-700">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-ink-900 tabular-nums">
                {formatIDR(activeLoan.angsuranBulanan)}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ink-500" />
                Jatuh tempo: <strong className="text-ink-800">{formatDate(activeLoan.jatuhTempoBerikutnya)}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-[11px] pt-2 border-t border-ink-100 flex justify-between items-center">
                <span className="text-ink-500">Status Kolektibilitas:</span>
                <Badge variant="success" size="sm" dot>
                  {activeLoan.statusKolektibilitas} (Angsuran {activeLoan.angsuranKe}/{activeLoan.tenorBulan})
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-ink-100/40 border-dashed">
            <CardHeader>
              <CardTitle className="text-base text-ink-500">Modul Pinjaman Nonaktif</CardTitle>
              <CardDescription>
                Fitur pinjaman saat ini sedang dinonaktifkan dalam konfigurasi koperasi.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Card 3: Proyeksi SHU */}
        {config.activeModules.shu ? (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-600">Proyeksi SHU Tahun Berjalan</span>
                <div className="p-1.5 bg-warning-100 rounded text-warning-700">
                  <PieChart className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-ink-900 tabular-nums">
                {formatIDR(480000)}
              </CardTitle>
              <CardDescription>
                Estimasi pembagian SHU Tahun Buku 2026
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-[11px] pt-2 border-t border-ink-100 flex justify-between">
                <span className="text-ink-500">Dasar Alokasi:</span>
                <span className="text-ink-700 font-medium">Jasa Simpanan (40%) + Pinjaman (40%)</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-ink-100/40 border-dashed">
            <CardHeader>
              <CardTitle className="text-base text-ink-500">Modul SHU Nonaktif</CardTitle>
              <CardDescription>
                Fitur kalkulasi SHU saat ini sedang dinonaktifkan dalam konfigurasi koperasi.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* 3. Breakdown Rekening Simpanan */}
      {config.activeModules.savings && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
              Rekening Simpanan Aktif
            </h2>
            <Link to="/portal/simpanan" className="text-xs text-forest-700 font-semibold hover:underline">
              Lihat Detail Rekening →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockMemberSavings.map((item) => (
              <Card key={item.rekeningId} className="p-4 bg-white">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-ink-500 font-mono text-[11px]">{item.rekeningId}</span>
                  <Badge variant={item.jenis === "Pokok" || item.jenis === "Wajib" ? "forest" : "neutral"} size="sm">
                    {item.jenis}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-ink-900 tabular-nums mt-1">
                  {formatIDR(item.saldo)}
                </div>
                <p className="text-[11px] text-ink-500 mt-1">
                  {item.bungaPct > 0 ? `Bunga ${item.bungaPct}% p.a.` : "Simpanan Pokok/Wajib"}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. Riwayat Mutasi Terkini */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
            Mutasi Transaksi Terkini
          </h2>
          <span className="text-xs text-ink-500 font-mono">Mode Simulasi Frontend</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode / Tanggal</TableHead>
              <TableHead>Keterangan Transaksi</TableHead>
              <TableHead>Rekening Terkait</TableHead>
              <TableHead className="text-right">Nominal (IDR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((trx) => (
              <TableRow key={trx.id}>
                <TableCell>
                  <div className="font-mono text-xs font-semibold text-ink-900">{trx.id}</div>
                  <div className="text-[11px] text-ink-500">{formatDate(trx.tanggal)}</div>
                </TableCell>
                <TableCell className="font-medium text-ink-800">
                  <div className="flex items-center gap-2">
                    {trx.jenis === "masuk" ? (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-success-700 shrink-0" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-ink-600 shrink-0" />
                    )}
                    <span>{trx.keterangan}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-ink-600">{trx.rekening}</TableCell>
                <TableCell className={`text-right font-semibold tabular-nums ${
                  trx.nominal > 0 ? "text-success-700" : "text-ink-900"
                }`}>
                  {formatIDR(trx.nominal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
