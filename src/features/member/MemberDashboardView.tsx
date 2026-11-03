import React from "react";
import { Link } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";
import { useAuthStore } from "@/stores/authStore";
import { useSavingsStore } from "@/features/savings/stores/savingsStore";
import { useLoanStore } from "@/features/loans/stores/loanStore";
import { formatIDR, formatDate } from "@/lib/utils";
import { mockMemberSavings, mockMemberLoans } from "@/mocks/seedData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
  PlusCircle,
  FileText,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export const MemberDashboardView: React.FC = () => {
  const { config } = useConfigStore();
  const { currentUser } = useAuthStore();
  const { getMemberSavingsAccount } = useSavingsStore();
  const { getMemberLoans } = useLoanStore();

  const memberSavings = currentUser.memberId ? getMemberSavingsAccount(currentUser.memberId) : null;
  const totalSimpanan = memberSavings
    ? memberSavings.totalSaldo
    : mockMemberSavings.reduce((acc, curr) => acc + curr.saldo, 0);

  // Ambil data pinjaman riil anggota dari loanStore jika ada
  const activeLoans = currentUser.memberId ? getMemberLoans(currentUser.memberId) : [];
  const primaryLoan = activeLoans.length > 0 ? activeLoans[0] : null;
  const fallbackLoan = mockMemberLoans[0];

  const nextInstallment = primaryLoan
    ? primaryLoan.installments.find(
        (i) => i.status === "upcoming" || i.status === "due" || i.status === "overdue"
      )
    : null;
  const paidInstallmentCount = primaryLoan
    ? primaryLoan.installments.filter((i) => i.status === "paid").length
    : 4;

  const installmentAmount = nextInstallment
    ? nextInstallment.totalAmount
    : fallbackLoan.angsuranBulanan;

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
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-8">
      {/* 1. Member Welcome & Operational Header */}
      <div className="bg-white border border-ink-200 rounded-xl p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
              Selamat Datang, {currentUser.name}
            </h1>
            <Badge variant="forest" size="sm" dot>
              Aktif & Tertib
            </Badge>
          </div>
          <div className="flex items-center flex-wrap gap-3 text-xs text-ink-600">
            <span>
              ID Demo: <strong className="font-mono text-ink-900">{currentUser.memberId || "DEMO-ID-0001"}</strong>
            </span>
            <span>•</span>
            <span>
              No. Anggota: <strong className="font-mono text-forest-800">KMB-2026-0001</strong>
            </span>
            <span>•</span>
            <Link to="/portal/profil" className="text-forest-700 hover:text-forest-800 font-medium inline-flex items-center gap-1">
              <span>Profil & Kartu Digital</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {config.activeModules.savings && (
            <Link to="/portal/simpanan">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Setor Simpanan
              </Button>
            </Link>
          )}
          {config.activeModules.loans && (
            <Link to="/portal/pinjaman">
              <Button variant="secondary" size="sm" leftIcon={<FileText className="w-4 h-4 text-forest-700" />}>
                Ajukan Pinjaman
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

      {/* 2. Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Simpanan */}
        {config.activeModules.savings ? (
          <StatCard
            title="Total Akumulasi Simpanan"
            value={formatIDR(totalSimpanan)}
            icon={<Wallet className="w-5 h-5 text-forest-800" />}
            description="Pokok, Wajib, Sukarela & Berjangka"
            trend={{
              value: "2.0% - 5.5% p.a.",
              direction: "up",
              label: "imbal hasil berjalan",
            }}
          />
        ) : (
          <Card className="p-5 bg-ink-50/60 border-dashed">
            <p className="text-xs font-semibold text-ink-500 uppercase">Simpanan</p>
            <p className="text-sm text-ink-600 mt-2">Modul Simpanan saat ini sedang dinonaktifkan.</p>
          </Card>
        )}

        {/* Card 2: Tagihan Angsuran */}
        {config.activeModules.loans ? (
          <StatCard
            title="Tagihan Angsuran Berjalan"
            value={formatIDR(installmentAmount)}
            icon={<CreditCard className="w-5 h-5 text-forest-800" />}
            description={
              primaryLoan
                ? `Pinjaman aktif: ${primaryLoan.id}`
                : `Jatuh tempo: ${formatDate(fallbackLoan.jatuhTempoBerikutnya)}`
            }
            badge={<Badge variant="success" size="sm" dot>Lancar</Badge>}
          />
        ) : (
          <Card className="p-5 bg-ink-50/60 border-dashed">
            <p className="text-xs font-semibold text-ink-500 uppercase">Pinjaman</p>
            <p className="text-sm text-ink-600 mt-2">Modul Pinjaman saat ini sedang dinonaktifkan.</p>
          </Card>
        )}

        {/* Card 3: Proyeksi SHU */}
        {config.activeModules.shu ? (
          <StatCard
            title="Proyeksi SHU Tahun Berjalan"
            value={formatIDR(480_000)}
            icon={<PieChart className="w-5 h-5 text-forest-800" />}
            description="Estimasi pembagian Buku 2026"
            trend={{
              value: "Alokasi",
              direction: "neutral",
              label: "Modal 40% + Jasa 40%",
            }}
          />
        ) : (
          <Card className="p-5 bg-ink-50/60 border-dashed">
            <p className="text-xs font-semibold text-ink-500 uppercase">Sisa Hasil Usaha</p>
            <p className="text-sm text-ink-600 mt-2">Modul SHU saat ini sedang dinonaktifkan.</p>
          </Card>
        )}
      </div>

      {/* 3. Breakdown Rekening Simpanan */}
      {config.activeModules.savings && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
                Rekening Simpanan Aktif
              </h2>
              <p className="text-xs text-ink-500">Rincian saldo modal penyertaan dan tabungan likuid</p>
            </div>
            <Link
              to="/portal/simpanan"
              className="text-xs text-forest-700 font-semibold hover:text-forest-800 inline-flex items-center gap-1"
            >
              <span>Kelola Seluruh Simpanan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {memberSavings ? (
              <>
                <Card className="p-4 bg-white border-ink-200 shadow-subtle hover:border-forest-600/30 transition-all">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink-500 font-mono text-[11px]">SP-0001</span>
                    <Badge variant="forest" size="sm">Pokok</Badge>
                  </div>
                  <div className="text-lg font-bold font-mono text-ink-900 tabular-nums mt-1">
                    {formatIDR(memberSavings.saldoPokok)}
                  </div>
                  <p className="text-[11px] text-ink-500 mt-1">Simpanan Pokok Anggota</p>
                </Card>

                <Card className="p-4 bg-white border-ink-200 shadow-subtle hover:border-forest-600/30 transition-all">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink-500 font-mono text-[11px]">SW-0001</span>
                    <Badge variant="info" size="sm">Wajib</Badge>
                  </div>
                  <div className="text-lg font-bold font-mono text-ink-900 tabular-nums mt-1">
                    {formatIDR(memberSavings.saldoWajib)}
                  </div>
                  <p className="text-[11px] text-ink-500 mt-1">Simpanan Wajib Bulanan</p>
                </Card>

                <Card className="p-4 bg-white border-ink-200 shadow-subtle hover:border-forest-600/30 transition-all">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink-500 font-mono text-[11px]">SS-0001</span>
                    <Badge variant="warning" size="sm">Sukarela</Badge>
                  </div>
                  <div className="text-lg font-bold font-mono text-ink-900 tabular-nums mt-1">
                    {formatIDR(memberSavings.saldoSukarela)}
                  </div>
                  <p className="text-[11px] text-ink-500 mt-1">Tabungan Fleksibel Likuid</p>
                </Card>

                <Card className="p-4 bg-white border-ink-200 shadow-subtle hover:border-forest-600/30 transition-all">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink-500 font-mono text-[11px]">SB-0001</span>
                    <Badge variant="neutral" size="sm">Berjangka</Badge>
                  </div>
                  <div className="text-lg font-bold font-mono text-ink-900 tabular-nums mt-1">
                    {formatIDR(5_000_000)}
                  </div>
                  <p className="text-[11px] text-ink-500 mt-1">Bunga 5.5% p.a. (Simulasi)</p>
                </Card>
              </>
            ) : (
              mockMemberSavings.map((item) => (
                <Card key={item.rekeningId} className="p-4 bg-white border-ink-200 shadow-subtle">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink-500 font-mono text-[11px]">{item.rekeningId}</span>
                    <Badge
                      variant={item.jenis === "Pokok" || item.jenis === "Wajib" ? "forest" : "neutral"}
                      size="sm"
                    >
                      {item.jenis}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold font-mono text-ink-900 tabular-nums mt-1">
                    {formatIDR(item.saldo)}
                  </div>
                  <p className="text-[11px] text-ink-500 mt-1">
                    {item.bungaPct > 0 ? `Bunga ${item.bungaPct}% p.a.` : "Simpanan Pokok/Wajib"}
                  </p>
                </Card>
              ))
            )}
          </div>
        </section>
      )}

      {/* 4. Pinjaman Berjalan & Mutasi Terkini Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Riwayat Mutasi (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
              Mutasi Transaksi Terkini
            </h2>
            <span className="text-xs text-ink-500 font-mono">Simulasi Terpadu</span>
          </div>

          <Card className="overflow-hidden border-ink-200 shadow-subtle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode / Tanggal</TableHead>
                  <TableHead>Keterangan Transaksi</TableHead>
                  <TableHead>Rekening</TableHead>
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
                        <span className="text-xs">{trx.keterangan}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-ink-600 font-mono text-[11px]">{trx.rekening}</TableCell>
                    <TableCell
                      className={`text-right font-semibold font-mono tabular-nums text-xs ${
                        trx.nominal > 0 ? "text-success-700" : "text-ink-900"
                      }`}
                    >
                      {formatIDR(trx.nominal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-3 bg-ink-50/70 border-t border-ink-100 flex items-center justify-between text-xs text-ink-600">
              <span>Menampilkan 3 transaksi terakhir</span>
              <Link to="/portal/simpanan" className="text-forest-700 font-medium hover:underline inline-flex items-center gap-1">
                <span>Semua Riwayat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Status Pinjaman & Pengumuman (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Pinjaman Aktif Summary */}
          {config.activeModules.loans && (
            <Card className="border-ink-200 shadow-subtle p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-forest-700" />
                  <h3 className="text-sm font-bold text-ink-900">Portofolio Pembiayaan</h3>
                </div>
                <StatusBadge status="active" />
              </div>

              <div className="p-3.5 rounded-lg bg-warm-cream border border-ink-200/60 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-500 font-medium">Nomor Kontrak:</span>
                  <span className="font-mono font-semibold text-ink-900">
                    {primaryLoan ? primaryLoan.id : "PJ-2024-0012"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-500 font-medium">Plafon Pokok:</span>
                  <span className="font-mono font-bold text-forest-800">
                    {primaryLoan ? formatIDR(primaryLoan.principalAmount) : formatIDR(10_000_000)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-500 font-medium">Sisa Pokok:</span>
                  <span className="font-mono font-semibold text-ink-900">
                    {primaryLoan ? formatIDR(primaryLoan.remainingPrincipal) : formatIDR(6_666_667)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-500 font-medium">Angsuran Berjalan:</span>
                  <span className="font-semibold text-success-700">
                    {primaryLoan
                      ? `${paidInstallmentCount} dari ${primaryLoan.tenorMonths} Bulan`
                      : "4 dari 12 Bulan (Tertib)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link to="/portal/pinjaman" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    Jadwal Angsuran
                  </Button>
                </Link>
                <Link to="/portal/pembayaran" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">
                    Bayar Tagihan
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Operational Announcement Card */}
          <Card className="border-forest-200 bg-forest-50/40 p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-md bg-forest-100 text-forest-800 shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-ink-900">
                  Agenda Koperasi: Persiapan RAT Tahun Buku 2026
                </h4>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Rapat Anggota Tahunan dijadwalkan pada akhir kuartal. Pastikan kelengkapan Simpanan Wajib telah terpenuhi untuk menjaga hak suara penuh.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-forest-100 flex items-center justify-between text-[11px] text-forest-800">
              <span className="font-mono">Sekretariat KMB</span>
              <span className="text-ink-500">Info Demonstrasi</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
