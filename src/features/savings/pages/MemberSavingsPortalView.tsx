import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useSavingsStore } from "../stores/savingsStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { SavingsType, SavingsTransaction, PaymentMethod } from "../types";
import { formatIDR, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
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
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  ShieldCheck,
  PlusCircle,
  Eye,
} from "lucide-react";

export const MemberSavingsPortalView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { savingsConfig } = useMembershipStore();
  const {
    sukarelaConfig,
    getMemberSavingsAccount,
    getMemberTransactions,
    submitDeposit,
    submitWithdrawal,
    cancelTransaction,
  } = useSavingsStore();

  const [activeTab, setActiveTab] = useState<"accounts" | "history" | "active">("accounts");

  // Modal states
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SavingsTransaction | null>(null);

  // Form states for deposit
  const [depositSavingsType, setDepositSavingsType] = useState<SavingsType>("wajib");
  const [depositAmount, setDepositAmount] = useState<string>(() => String(savingsConfig.simpananWajibBulanan));
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<PaymentMethod>("Transfer Bank (Simulasi)");
  const [depositNotes, setDepositNotes] = useState<string>("");
  const [depositError, setDepositError] = useState<string | null>(null);

  // Form states for withdrawal
  const [withdrawAmount, setWithdrawAmount] = useState<string>(() => String(sukarelaConfig.minWithdrawal));
  const [withdrawNotes, setWithdrawNotes] = useState<string>("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Privacy Protection Boundary: Member must have valid memberId
  const memberDemoId = currentUser.memberId;
  const savingsAccount = memberDemoId ? getMemberSavingsAccount(memberDemoId) : null;
  const transactions = memberDemoId ? getMemberTransactions(memberDemoId) : [];

  if (!memberDemoId || !savingsAccount) {
    return (
      <div className="py-8">
        <EmptyState
          title="Rekening Simpanan Tidak Ditemukan"
          description="Akun Anda belum memiliki tautan identitas anggota aktif pada buku induk KMB. Silakan hubungi pengurus atau periksa profil keanggotaan Anda."
          actionLabel="Buka Profil Keanggotaan"
          onAction={() => window.location.assign("/portal/profil")}
          icon={<AlertCircle className="w-10 h-10 text-ink-400" />}
        />
      </div>
    );
  }

  const activeSubmissions = transactions.filter(
    (t) => t.status === "submitted" || t.status === "under_review"
  );

  const handleOpenDepositModal = (type: SavingsType = "wajib") => {
    setDepositSavingsType(type);
    if (type === "wajib") {
      setDepositAmount(String(savingsConfig.simpananWajibBulanan));
    } else if (type === "pokok") {
      setDepositAmount(String(savingsConfig.simpananPokokNominal));
    } else {
      setDepositAmount(String(sukarelaConfig.minDeposit));
    }
    setDepositNotes("");
    setDepositError(null);
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);

    const amt = Number(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setDepositError("Nominal setoran harus berupa angka positif.");
      return;
    }

    if (depositSavingsType === "sukarela" && amt < sukarelaConfig.minDeposit) {
      setDepositError(
        `Setoran Simpanan Sukarela minimum sebesar ${formatIDR(sukarelaConfig.minDeposit)}.`
      );
      return;
    }

    const res = submitDeposit({
      memberDemoId: savingsAccount.memberDemoId,
      savingsType: depositSavingsType,
      amount: amt,
      paymentMethod: depositPaymentMethod,
      notes: depositNotes,
    });

    if (!res.success) {
      setDepositError(res.error || "Gagal mengajukan setoran simpanan.");
      return;
    }

    addToast({
      type: "success",
      title: "Setoran Berhasil Diajukan",
      message: `Pengajuan setoran ${depositSavingsType.toUpperCase()} sebesar ${formatIDR(amt)} berhasil dicatat (ID: ${res.transactionId}). Saldo akan bertambah setelah diverifikasi Staf & disetujui Pengurus.`,
    });

    setIsDepositModalOpen(false);
    setActiveTab("active");
  };

  const handleOpenWithdrawModal = () => {
    setWithdrawAmount(String(sukarelaConfig.minWithdrawal));
    setWithdrawNotes("");
    setWithdrawError(null);
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);

    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError("Nominal penarikan harus berupa angka positif.");
      return;
    }

    if (amt < sukarelaConfig.minWithdrawal) {
      setWithdrawError(
        `Penarikan Simpanan Sukarela minimum sebesar ${formatIDR(sukarelaConfig.minWithdrawal)}.`
      );
      return;
    }

    if (amt > savingsAccount.availableSukarelaWithdrawal) {
      setWithdrawError(
        `Saldo sukarela tidak mencukupi. Maksimum penarikan: ${formatIDR(savingsAccount.availableSukarelaWithdrawal)} (tersisa saldo mengendap ${formatIDR(sukarelaConfig.minBalance)}).`
      );
      return;
    }

    const res = submitWithdrawal({
      memberDemoId: savingsAccount.memberDemoId,
      amount: amt,
      notes: withdrawNotes,
    });

    if (!res.success) {
      setWithdrawError(res.error || "Gagal mengajukan penarikan sukarela.");
      return;
    }

    addToast({
      type: "success",
      title: "Pengajuan Penarikan Terkirim",
      message: `Permohonan penarikan simpanan sukarela sebesar ${formatIDR(amt)} telah dikirim (ID: ${res.transactionId}) dan menunggu persetujuan Bendahara/Pengurus.`,
    });

    setIsWithdrawModalOpen(false);
    setActiveTab("active");
  };

  const handleCancelPending = (trxId: string) => {
    const res = cancelTransaction(trxId, "Dibatalkan mandiri oleh Anggota melalui portal simpanan.");
    if (res.success) {
      addToast({
        type: "info",
        title: "Pengajuan Dibatalkan",
        message: "Pengajuan transaksi berhasil dibatalkan.",
      });
      setSelectedTransaction(null);
    } else {
      addToast({
        type: "danger",
        title: "Gagal Membatalkan",
        message: res.error || "Transaksi tidak dapat dibatalkan.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="forest">Disetujui</Badge>;
      case "submitted":
        return <Badge variant="warning">Menunggu Verifikasi</Badge>;
      case "under_review":
        return <Badge variant="info">Sedang Ditinjau</Badge>;
      case "rejected":
        return <Badge variant="danger">Ditolak</Badge>;
      case "cancelled":
        return <Badge variant="neutral">Dibatalkan</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-900">Buku Simpanan Saya</h1>
            <Badge variant="forest" size="sm">
              {savingsAccount.memberNumber}
            </Badge>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Pemilik Rekening: <strong className="text-ink-900">{savingsAccount.memberName}</strong> ({savingsAccount.memberDemoId}) — Transparansi Penuh Sesuai UU Perkoperasian No. 25/1992
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenWithdrawModal}
            leftIcon={<ArrowDownLeft className="w-4 h-4 text-warning-700" />}
          >
            Tarik Sukarela
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenDepositModal("wajib")}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Setor Simpanan
          </Button>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <Card className="border-forest-600/40 bg-forest-50/40">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-forest-800">
              <span className="font-semibold">Total Saldo Simpanan</span>
              <Wallet className="w-4 h-4 text-forest-700" />
            </div>
            <div className="text-2xl font-bold text-forest-900 font-mono tracking-tight">
              {formatIDR(savingsAccount.totalSaldo)}
            </div>
            <div className="text-[11px] text-forest-700">
              Akumulasi Simpanan Pokok + Wajib + Sukarela
            </div>
          </CardContent>
        </Card>

        {/* Simpanan Pokok */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-ink-600">
              <span className="font-semibold">Simpanan Pokok (SP)</span>
              <Badge variant={savingsAccount.saldoPokok > 0 ? "forest" : "warning"} size="sm">
                {savingsAccount.saldoPokok > 0 ? "Lunas" : "Belum Lunas"}
              </Badge>
            </div>
            <div className="text-xl font-bold text-ink-900 font-mono">
              {formatIDR(savingsAccount.saldoPokok)}
            </div>
            <div className="text-[11px] text-ink-500">
              Disetor sekali (Ilustrasi: {formatIDR(savingsConfig.simpananPokokNominal)})
            </div>
          </CardContent>
        </Card>

        {/* Simpanan Wajib */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-ink-600">
              <span className="font-semibold">Simpanan Wajib (SW)</span>
              <Badge variant="info" size="sm">
                Bulanan
              </Badge>
            </div>
            <div className="text-xl font-bold text-ink-900 font-mono">
              {formatIDR(savingsAccount.saldoWajib)}
            </div>
            <div className="text-[11px] text-ink-500">
              Komitmen: {formatIDR(savingsConfig.simpananWajibBulanan)} / bln
            </div>
          </CardContent>
        </Card>

        {/* Simpanan Sukarela */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-ink-600">
              <span className="font-semibold">Simpanan Sukarela (SS)</span>
              <Badge variant="warning" size="sm">
                Bunga {sukarelaConfig.interestRatePct}% p.a.*
              </Badge>
            </div>
            <div className="text-xl font-bold text-ink-900 font-mono">
              {formatIDR(savingsAccount.saldoSukarela)}
            </div>
            <div className="text-[11px] text-forest-700 font-medium">
              Dapat ditarik: {formatIDR(savingsAccount.availableSukarelaWithdrawal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-ink-200 gap-2">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "accounts"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Rincian Rekening & Ketentuan</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Riwayat Transaksi ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "active"
              ? "border-forest-700 text-forest-900 bg-white"
              : "border-transparent text-ink-600 hover:text-ink-900"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Pengajuan Aktif ({activeSubmissions.length})</span>
        </button>
      </div>

      {/* TAB 1: Rincian Produk & Ketentuan */}
      {activeTab === "accounts" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Kartu Simpanan Pokok */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="forest" size="sm">Kode: SP</Badge>
                  <span className="text-[11px] text-ink-500 font-medium">Permanen</span>
                </div>
                <CardTitle className="text-base mt-2">Simpanan Pokok</CardTitle>
                <CardDescription>
                  Modal dasar keanggotaan koperasi yang disetor satu kali pada awal registrasi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 bg-ink-50 rounded border border-ink-200 space-y-1">
                  <span className="text-ink-500 block">Saldo Tercatat:</span>
                  <strong className="text-base font-mono text-ink-900">
                    {formatIDR(savingsAccount.saldoPokok)}
                  </strong>
                </div>
                <ul className="space-y-1.5 text-ink-600 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                    <span>Hanya disetor satu kali saat resmi bergabung.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-danger-700 shrink-0 mt-0.5" />
                    <span>Tidak dapat ditarik selama keanggotaan aktif.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-ink-500 shrink-0 mt-0.5" />
                    <span>Dikembalikan jika keluar dari keanggotaan koperasi.</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  disabled={savingsAccount.saldoPokok >= savingsConfig.simpananPokokNominal}
                  onClick={() => handleOpenDepositModal("pokok")}
                >
                  {savingsAccount.saldoPokok >= savingsConfig.simpananPokokNominal ? "Sudah Lunas" : "Setor Simpanan Pokok"}
                </Button>
              </CardContent>
            </Card>

            {/* Kartu Simpanan Wajib */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="info" size="sm">Kode: SW</Badge>
                  <span className="text-[11px] text-ink-500 font-medium">Rutin Bulanan</span>
                </div>
                <CardTitle className="text-base mt-2">Simpanan Wajib</CardTitle>
                <CardDescription>
                  Komitmen iuran rutin bulanan untuk penguatan permodalan bersama.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 bg-ink-50 rounded border border-ink-200 space-y-1">
                  <span className="text-ink-500 block">Saldo Akumulasi:</span>
                  <strong className="text-base font-mono text-ink-900">
                    {formatIDR(savingsAccount.saldoWajib)}
                  </strong>
                </div>
                <ul className="space-y-1.5 text-ink-600 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                    <span>Kewajiban setor per bulan: {formatIDR(savingsConfig.simpananWajibBulanan)}.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                    <span>Menjadi dasar perhitungan pembagian Sisa Hasil Usaha (SHU).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-danger-700 shrink-0 mt-0.5" />
                    <span>Tidak dapat ditarik selama keanggotaan aktif.</span>
                  </li>
                </ul>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleOpenDepositModal("wajib")}
                >
                  Setor Simpanan Wajib
                </Button>
              </CardContent>
            </Card>

            {/* Kartu Simpanan Sukarela */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="warning" size="sm">Kode: SS</Badge>
                  <span className="text-[11px] text-forest-700 font-semibold">Tarik Kapan Saja</span>
                </div>
                <CardTitle className="text-base mt-2">Simpanan Sukarela</CardTitle>
                <CardDescription>
                  Tabungan fleksibel likuid yang dapat disetor dan ditarik sewaktu-waktu.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 bg-warning-100/40 rounded border border-warning-base/30 space-y-1">
                  <span className="text-ink-600 block">Saldo Aktif:</span>
                  <strong className="text-base font-mono text-ink-900">
                    {formatIDR(savingsAccount.saldoSukarela)}
                  </strong>
                  <div className="text-[11px] text-ink-500">
                    Tersedia ditarik: <strong className="text-forest-800">{formatIDR(savingsAccount.availableSukarelaWithdrawal)}</strong>
                  </div>
                </div>
                <ul className="space-y-1.5 text-ink-600 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                    <span>Setoran minimum: {formatIDR(sukarelaConfig.minDeposit)}.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                    <span>Penarikan minimum: {formatIDR(sukarelaConfig.minWithdrawal)}.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-ink-500 shrink-0 mt-0.5" />
                    <span>Saldo mengendap minimum: {formatIDR(sukarelaConfig.minBalance)}.</span>
                  </li>
                </ul>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleOpenWithdrawModal}
                    disabled={savingsAccount.availableSukarelaWithdrawal < sukarelaConfig.minWithdrawal}
                  >
                    Tarik Dana
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDepositModal("sukarela")}
                  >
                    Setor Sukarela
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer Banner */}
          <div className="p-4 bg-ink-50 border border-ink-200 rounded-lg text-xs text-ink-600 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-ink-800">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              <span>Prinsip Perlindungan Simpanan Koperasi (UU 25/1992)</span>
            </div>
            <p className="leading-relaxed">
              Seluruh transaksi simpanan anggota dicatat secara akuntabel dalam buku kas demonstrasi KMB. Transaksi setoran maupun penarikan yang diajukan secara daring akan melalui tahapan verifikasi bukti transaksi oleh Staf Operasional dan otorisasi oleh Pengurus/Bendahara sebelum memengaruhi saldo buku simpanan.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Riwayat Transaksi Saya */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Riwayat Transaksi Simpanan</CardTitle>
                <CardDescription>
                  Daftar seluruh mutasi setoran dan penarikan yang pernah diajukan pada akun Anda.
                </CardDescription>
              </div>
              <Badge variant="neutral" size="sm">
                Total: {transactions.length} Catatan
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  title="Belum Ada Riwayat Transaksi"
                  description="Anda belum memiliki riwayat transaksi simpanan pada demonstrasi ini."
                  actionLabel="Ajukan Setoran Pertama"
                  onAction={() => handleOpenDepositModal("wajib")}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaksi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jenis Simpanan</TableHead>
                      <TableHead>Jenis Mutasi</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((trx) => (
                      <TableRow key={trx.id}>
                        <TableCell className="font-mono text-xs font-semibold text-ink-900">
                          {trx.id}
                        </TableCell>
                        <TableCell className="text-xs text-ink-600">
                          {formatDate(trx.date)}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-semibold uppercase text-ink-800">
                            Simpanan {trx.savingsType}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {trx.transactionType === "deposit" ? (
                            <span className="inline-flex items-center gap-1 text-forest-700 font-medium">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Setoran
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-warning-800 font-medium">
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              Penarikan
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-right text-ink-900">
                          {trx.transactionType === "deposit" ? "+" : "-"}
                          {formatIDR(trx.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(trx.status)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTransaction(trx)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Rincian
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Pengajuan Aktif */}
      {activeTab === "active" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengajuan Menunggu Verifikasi & Persetujuan</CardTitle>
            <CardDescription>
              Transaksi di bawah ini telah diajukan dan sedang dalam antrean pemeriksaan tim operasional koperasi. Saldo rekening Anda baru akan bertambah/berkurang setelah disetujui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeSubmissions.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  title="Tidak Ada Pengajuan Aktif"
                  description="Semua pengajuan transaksi Anda telah selesai diproses. Tidak ada antrean yang tertunda."
                />
              </div>
            ) : (
              <div className="space-y-4">
                {activeSubmissions.map((trx) => (
                  <div
                    key={trx.id}
                    className="p-4 border border-ink-200 rounded-lg bg-ink-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-ink-900 font-mono">{trx.id}</strong>
                          {getStatusBadge(trx.status)}
                        </div>
                        <span className="text-xs text-ink-500 block mt-0.5">
                          Diajukan pada: {formatDate(trx.date)} via {trx.paymentMethod}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-ink-500 block">Nominal Pengajuan:</span>
                        <strong className="text-lg font-mono text-ink-900">
                          {formatIDR(trx.amount)}
                        </strong>
                      </div>
                    </div>

                    {/* Stepper info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-white border border-forest-600/30 rounded flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                        <div>
                          <strong className="block text-[11px] text-ink-900">1. Pengajuan Daring</strong>
                          <span className="text-[10px] text-ink-500">Tercatat di sistem</span>
                        </div>
                      </div>
                      <div
                        className={`p-2.5 bg-white border rounded flex items-center gap-2 ${
                          trx.status === "under_review"
                            ? "border-forest-600/30 text-forest-900"
                            : "border-ink-200 text-ink-600"
                        }`}
                      >
                        <Clock className="w-4 h-4 text-forest-700 shrink-0" />
                        <div>
                          <strong className="block text-[11px] text-ink-900">2. Verifikasi Staf</strong>
                          <span className="text-[10px] text-ink-500">
                            {trx.status === "under_review" ? "Sedang diteliti" : "Dalam antrean"}
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-white border border-ink-200 rounded flex items-center gap-2 text-ink-400">
                        <Clock className="w-4 h-4 shrink-0" />
                        <div>
                          <strong className="block text-[11px] text-ink-700">3. Persetujuan Otorisator</strong>
                          <span className="text-[10px] text-ink-400">Pembaruan saldo</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-ink-500 italic">
                        {trx.notes ? `Catatan: "${trx.notes}"` : "Tanpa catatan tambahan."}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransaction(trx)}
                        >
                          Lihat Log
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelPending(trx.id)}
                        >
                          Batalkan Pengajuan
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL 1: Form Setoran Simpanan */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Form Pengajuan Setoran Simpanan"
      >
        <form onSubmit={handleDepositSubmit} noValidate className="space-y-4 text-xs">
          {depositError && (
            <div className="p-3 bg-danger-100 border border-danger-base/30 rounded text-danger-700">
              {depositError}
            </div>
          )}

          <div className="space-y-1">
            <Select
              label="Pilih Jenis Simpanan"
              options={[
                { value: "wajib", label: `Simpanan Wajib (Bulanan — ${formatIDR(savingsConfig.simpananWajibBulanan)})` },
                { value: "sukarela", label: `Simpanan Sukarela (Fleksibel — min. ${formatIDR(sukarelaConfig.minDeposit)})` },
                { value: "pokok", label: `Simpanan Pokok (Sekali Saat Masuk — ${formatIDR(savingsConfig.simpananPokokNominal)})` },
              ]}
              value={depositSavingsType}
              onChange={(e) => {
                const newType = e.target.value as SavingsType;
                setDepositSavingsType(newType);
                if (newType === "wajib") setDepositAmount(String(savingsConfig.simpananWajibBulanan));
                else if (newType === "pokok") setDepositAmount(String(savingsConfig.simpananPokokNominal));
                else setDepositAmount(String(sukarelaConfig.minDeposit));
              }}
            />
          </div>

          <div className="space-y-1">
            <Input
              label="Nominal Setoran (Rp)"
              type="number"
              min="1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              helperText={`Nominal format: ${formatIDR(Number(depositAmount) || 0)}`}
            />
          </div>

          <div className="space-y-1">
            <Select
              label="Metode Pembayaran Simulasi"
              options={[
                { value: "Transfer Bank (Simulasi)", label: "Transfer Bank / Virtual Account (Simulasi)" },
                { value: "Kasir Tunai (Simulasi)", label: "Loket / Teller Kantor Koperasi (Simulasi)" },
                { value: "Debit Virtual (Simulasi)", label: "QRIS / Debit Instan Demo" },
              ]}
              value={depositPaymentMethod}
              onChange={(e) => setDepositPaymentMethod(e.target.value as PaymentMethod)}
            />
          </div>

          <div className="space-y-1">
            <Textarea
              label="Catatan Anggota (Opsional)"
              value={depositNotes}
              onChange={(e) => setDepositNotes(e.target.value)}
              placeholder="Contoh: Setoran Simpanan Wajib bulan berjalan via transfer mandiri."
              rows={2}
            />
          </div>

          <div className="p-3 bg-ink-50 rounded border border-ink-200 text-[11px] text-ink-600">
            * <strong>Catatan Demonstrasi:</strong> Pengajuan setoran tidak langsung menambah saldo. Bukti mutasi akan diverifikasi Staf Operasional dan disetujui Petugas Keuangan/Pengurus sebelum saldo bertambah.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDepositModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Kirim Pengajuan Setoran
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Form Penarikan Simpanan Sukarela */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Form Pengajuan Penarikan Simpanan Sukarela"
      >
        <form onSubmit={handleWithdrawSubmit} noValidate className="space-y-4 text-xs">
          {withdrawError && (
            <div className="p-3 bg-danger-100 border border-danger-base/30 rounded text-danger-700">
              {withdrawError}
            </div>
          )}

          <div className="p-3 bg-warning-100/40 rounded border border-warning-base/30 space-y-1">
            <span className="text-[11px] text-ink-600 block">Kapasitas Penarikan Anda:</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-800">Saldo Sukarela Aktif:</span>
              <strong className="font-mono text-ink-900">{formatIDR(savingsAccount.saldoSukarela)}</strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-ink-500">
              <span>Saldo Mengendap Wajib:</span>
              <span>{formatIDR(sukarelaConfig.minBalance)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-ink-200 pt-1 text-forest-900 font-bold">
              <span>Maksimum Dapat Ditarik:</span>
              <span className="font-mono">{formatIDR(savingsAccount.availableSukarelaWithdrawal)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Input
              label="Nominal Penarikan (Rp)"
              type="number"
              min={sukarelaConfig.minWithdrawal}
              max={savingsAccount.availableSukarelaWithdrawal}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              helperText={`Batas penarikan minimum: ${formatIDR(sukarelaConfig.minWithdrawal)}`}
            />
          </div>

          <div className="space-y-1">
            <Textarea
              label="Tujuan / Keperluan Penarikan"
              value={withdrawNotes}
              onChange={(e) => setWithdrawNotes(e.target.value)}
              placeholder="Contoh: Kebutuhan modal kerja tambahan atau pengeluaran keluarga mendesak."
              rows={2}
            />
          </div>

          <div className="p-3 bg-ink-50 rounded border border-ink-200 text-[11px] text-ink-600">
            * <strong>Aturan Penarikan Simpanan:</strong> Sesuai AD/ART KMB, hanya Simpanan Sukarela yang dapat ditarik selama keanggotaan aktif. Simpanan Pokok dan Simpanan Wajib tidak dapat ditarik.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={savingsAccount.availableSukarelaWithdrawal < sukarelaConfig.minWithdrawal}
            >
              Kirim Pengajuan Penarikan
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Detail Transaksi & Log Aktivitas */}
      {selectedTransaction && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTransaction(null)}
          title={`Detail Transaksi ${selectedTransaction.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-ink-50 rounded border border-ink-200">
              <div>
                <span className="text-ink-500 block text-[11px]">ID Transaksi:</span>
                <strong className="font-mono text-ink-900">{selectedTransaction.id}</strong>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Status:</span>
                <div className="mt-0.5">{getStatusBadge(selectedTransaction.status)}</div>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Jenis Transaksi:</span>
                <span className="font-semibold uppercase text-ink-900">
                  {selectedTransaction.transactionType} ({selectedTransaction.savingsType})
                </span>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Nominal:</span>
                <strong className="font-mono text-sm text-ink-900">
                  {formatIDR(selectedTransaction.amount)}
                </strong>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Tanggal:</span>
                <span>{formatDate(selectedTransaction.date)}</span>
              </div>
              <div>
                <span className="text-ink-500 block text-[11px]">Metode:</span>
                <span>{selectedTransaction.paymentMethod}</span>
              </div>
            </div>

            {selectedTransaction.rejectionReason && (
              <div className="p-3 bg-danger-100 border border-danger-base/30 rounded text-danger-700">
                <strong>Alasan Penolakan:</strong>
                <p className="mt-1">{selectedTransaction.rejectionReason}</p>
              </div>
            )}

            {selectedTransaction.cancellationReason && (
              <div className="p-3 bg-ink-100 border border-ink-200 rounded text-ink-700">
                <strong>Alasan Pembatalan:</strong>
                <p className="mt-1">{selectedTransaction.cancellationReason}</p>
              </div>
            )}

            {/* Audit Trail Timeline */}
            <div className="space-y-2">
              <span className="font-bold text-ink-900 block text-xs">
                Jejak Audit Aktivitas Transaksi ({selectedTransaction.history.length})
              </span>
              <div className="border border-ink-200 rounded-lg p-3 divide-y divide-ink-100 max-h-48 overflow-y-auto bg-white">
                {selectedTransaction.history.map((log) => (
                  <div key={log.id} className="py-2 first:pt-0 last:pb-0 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <strong className="text-ink-900">{log.action}</strong>
                      <span className="text-ink-400 font-mono">{formatDate(log.timestamp)}</span>
                    </div>
                    <div className="text-[11px] text-ink-600">
                      Oleh: <strong>{log.actorName}</strong> ({log.actorRole})
                    </div>
                    {log.notes && (
                      <p className="text-[10px] text-ink-500 italic mt-0.5">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTransaction(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
