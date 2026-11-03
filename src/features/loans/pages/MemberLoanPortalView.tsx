import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useLoanStore } from "../stores/loanStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { Loan, LoanInstallment, LoanProductType } from "../types";
import { calculateLoanSimulation, calculateEarlyRepayment } from "../utils/loanCalculations";
import { formatIDR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
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
  CreditCard,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  AlertTriangle,
  Send,
} from "lucide-react";

export const MemberLoanPortalView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { getMemberByDemoId } = useMembershipStore();
  const {
    products,
    systemConfig,
    getMemberLoans,
    getMemberApplications,
    submitApplication,
    recordInstallmentPayment,
    executeEarlyRepayment,
  } = useLoanStore();

  const [activeTab, setActiveTab] = useState<"active" | "apply" | "history">("active");

  // State Pelunasan Dipercepat
  const [earlyRepayLoan, setEarlyRepayLoan] = useState<Loan | null>(null);

  // State Pembayaran Angsuran
  const [payingInstallment, setPayingInstallment] = useState<{
    loan: Loan;
    installment: LoanInstallment;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Transfer Bank (Simulasi)");

  // State Detail Jadwal Angsuran Pinjaman Terpilih
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<Loan | null>(null);

  // State Formulir Pengajuan Baru (Wizard)
  const [applyStep, setApplyStep] = useState<number>(1);
  const [applyProductType, setApplyProductType] = useState<LoanProductType>("konsumtif");
  const [applyAmount, setApplyAmount] = useState<number>(10_000_000);
  const [applyTenor, setApplyTenor] = useState<number>(12);
  const [applyPurposeCategory, setApplyPurposeCategory] = useState<string>("Pendidikan");
  const [applyPurpose, setApplyPurpose] = useState<string>("");
  const [applyIncomeSource, setApplyIncomeSource] = useState<string>("Gaji Bulanan");
  const [applyAgreed, setApplyAgreed] = useState<boolean>(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Privacy Protection Boundary: Member must have valid memberId and match existing record
  const memberDemoId = currentUser.memberId;
  const member = memberDemoId ? getMemberByDemoId(memberDemoId) : null;

  if (!memberDemoId || !member) {
    return (
      <div className="py-8">
        <EmptyState
          title="Profil Anggota Tidak Ditemukan"
          description="Akun Anda belum memiliki tautan identitas anggota aktif pada buku induk KMB. Silakan hubungi pengurus atau periksa akun demonstrasi Anda."
          actionLabel="Buka Beranda"
          onAction={() => window.location.assign("/")}
          icon={<AlertCircle className="w-10 h-10 text-ink-400" />}
        />
      </div>
    );
  }

  const memberLoans = getMemberLoans(member.demoId);
  const memberApplications = getMemberApplications(member.demoId);

  const activeLoans = memberLoans.filter(
    (l) => l.status === "active" || l.status === "defaulted"
  );
  const pastLoans = memberLoans.filter((l) => l.status === "paid_off");

  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.remainingPrincipal, 0);

  const activeProduct = products.find((p) => p.type === applyProductType) || products[0];
  const applySimulation = calculateLoanSimulation(
    applyAmount,
    applyTenor,
    activeProduct ? activeProduct.interestRatePct : 12,
    "flat",
    activeProduct ? activeProduct.adminFeePct : 1
  );

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);

    if (!applyPurpose.trim()) {
      setApplyError("Mohon sebutkan keperluan pinjaman secara jelas.");
      return;
    }
    if (!applyAgreed) {
      setApplyError("Anda wajib menyetujui komitmen kewajiban pembayaran angsuran.");
      return;
    }

    const res = submitApplication({
      memberDemoId: member.demoId,
      productType: applyProductType,
      amount: applyAmount,
      tenorMonths: applyTenor,
      purpose: applyPurpose,
      purposeCategory: applyPurposeCategory,
      incomeSource: applyIncomeSource,
      simulatedDocumentUrl: `SIMULATED DOCUMENT: bukti-pendapatan-${member.demoId.toLowerCase()}.pdf`,
    });

    if (!res.success) {
      setApplyError(res.error || "Gagal mengirimkan pengajuan pinjaman.");
      return;
    }

    addToast({
      title: "Pengajuan Berhasil Dikirim",
      message: `No. Pengajuan ${res.applicationId} telah masuk ke antrean verifikasi staf.`,
      type: "success",
    });

    // Reset wizard
    setApplyStep(1);
    setApplyPurpose("");
    setApplyAgreed(false);
    setActiveTab("history");
  };

  const handleConfirmInstallmentPayment = () => {
    if (!payingInstallment) return;
    const { loan, installment } = payingInstallment;

    // Hitung total kewajiban angsuran ini
    const unpaidLateFee = installment.lateFeeWaived
      ? 0
      : Math.max(0, installment.lateFeeAmount - installment.paidLateFee);
    const unpaidInterest = Math.max(0, installment.interestAmount - installment.paidInterest);
    const unpaidPrincipal = Math.max(0, installment.principalAmount - installment.paidPrincipal);
    const totalDue = unpaidLateFee + unpaidInterest + unpaidPrincipal;

    const res = recordInstallmentPayment({
      loanId: loan.id,
      installmentNumber: installment.installmentNumber,
      amountPaid: totalDue,
      paymentMethod,
    });

    if (!res.success) {
      addToast({
        title: "Pembayaran Gagal",
        message: res.error || "Terjadi kesalahan saat memproses pembayaran.",
        type: "danger",
      });
      return;
    }

    addToast({
      title: "Pembayaran Angsuran Berhasil",
      message: `Angsuran ke-${installment.installmentNumber} sebesar ${formatIDR(totalDue)} berhasil dibukukan secara simulatif.`,
      type: "success",
    });

    setPayingInstallment(null);
  };

  const handleConfirmEarlyRepayment = () => {
    if (!earlyRepayLoan) return;
    const res = executeEarlyRepayment(earlyRepayLoan.id, "Transfer Bank (Simulasi)");

    if (!res.success) {
      addToast({
        title: "Pelunasan Dipercepat Gagal",
        message: res.error || "Terjadi kesalahan saat memproses pelunasan.",
        type: "danger",
      });
      return;
    }

    addToast({
      title: "Pinjaman Lunas Dipercepat",
      message: `Pinjaman ${earlyRepayLoan.id} telah resmi lunas. Terima kasih atas komitmen Anda!`,
      type: "success",
    });

    setEarlyRepayLoan(null);
  };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto py-4">
      {/* 1. Header Ringkasan Keanggotaan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
              Portal Pinayaan & Angsuran Anggota
            </h1>
            <Badge variant="forest" size="sm">
              {member.memberNumber}
            </Badge>
          </div>
          <p className="text-xs text-ink-500 mt-1">
            Nama Anggota: <strong className="text-ink-900">{member.fullName}</strong> • Status:{" "}
            <span className="capitalize font-semibold text-forest-700">{member.status}</span>
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setActiveTab("apply")}
          className="text-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Ajukan Pinjaman Baru
        </Button>
      </div>

      {/* 2. Ringkasan Portofolio Pinjaman */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-forest-600/30 bg-forest-50/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-ink-600 font-medium">
              Sisa Pokok Pinjaman Berjalan
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-forest-900 font-tabular">
              {formatIDR(totalOutstanding)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-ink-500">
            Dari total {activeLoans.length} pinjaman aktif saat ini
          </CardContent>
        </Card>

        <Card className="border-ink-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-ink-600 font-medium">
              Status Kolektibilitas Anggota
            </CardDescription>
            <div className="flex items-center gap-2 mt-1">
              {activeLoans.some((l) => l.collectibility !== "Lancar") ? (
                <Badge variant="warning" size="md">
                  Perhatian Khusus
                </Badge>
              ) : (
                <Badge variant="forest" size="md">
                  Lancar (Kolektibilitas 1)
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-[11px] text-ink-500">
            Penilaian mengacu pada ketepatan jatuh tempo angsuran
          </CardContent>
        </Card>

        <Card className="border-ink-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-ink-600 font-medium">
              Kuota Pinjaman Aktif Koperasi
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-ink-900 font-tabular">
              {activeLoans.length} / {systemConfig.maxActiveLoansPerMember}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-ink-500">
            Maksimum pinjaman aktif bersamaan sesuai regulasi internal
          </CardContent>
        </Card>
      </div>

      {/* 3. Tab Navigasi */}
      <div className="flex border-b border-ink-200 space-x-6 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`pb-3 font-semibold transition-colors relative ${
            activeTab === "active"
              ? "text-forest-700 border-b-2 border-forest-700"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          Pinjaman Berjalan & Jadwal ({activeLoans.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("apply")}
          className={`pb-3 font-semibold transition-colors relative ${
            activeTab === "apply"
              ? "text-forest-700 border-b-2 border-forest-700"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          Formulir Pengajuan Baru
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`pb-3 font-semibold transition-colors relative ${
            activeTab === "history"
              ? "text-forest-700 border-b-2 border-forest-700"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          Riwayat Pengajuan & Pinjaman Lunas ({memberApplications.length + pastLoans.length})
        </button>
      </div>

      {/* TAB 1: PINJAMAN BERJALAN & JADWAL */}
      {activeTab === "active" && (
        <div className="space-y-6">
          {activeLoans.length === 0 ? (
            <Card className="border-ink-200 py-8">
              <EmptyState
                title="Tidak Ada Pinjaman Berjalan"
                description="Anda saat ini tidak memiliki pinjaman aktif. Anda dapat mengajukan pembiayaan produktif, konsumtif, atau darurat jika memenuhi persyaratan kelayakan."
                actionLabel="Ajukan Pinjaman Sekarang"
                onAction={() => setActiveTab("apply")}
                icon={<CreditCard className="w-10 h-10 text-ink-300" />}
              />
            </Card>
          ) : (
            activeLoans.map((loan) => {
              const nextUnpaid = loan.installments.find((i) => i.status !== "paid");
              const isOverdue = nextUnpaid && nextUnpaid.status === "overdue";

              return (
                <Card key={loan.id} className="border-ink-200 shadow-subtle overflow-hidden">
                  <div className="bg-ink-50 px-6 py-4 border-b border-ink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-900 text-base">{loan.productName}</span>
                        <Badge variant="neutral" size="sm">
                          {loan.id}
                        </Badge>
                        <Badge
                          variant={
                            loan.collectibility === "Lancar"
                              ? "forest"
                              : loan.collectibility === "DPK"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {loan.collectibility}
                        </Badge>
                      </div>
                      <div className="text-xs text-ink-500">
                        Plafon Awal: {formatIDR(loan.principalAmount)} • Tenor: {loan.tenorMonths} Bulan • Bunga: {loan.interestRatePct}% p.a.
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEarlyRepayLoan(loan)}
                        className="text-xs"
                      >
                        Pelunasan Dipercepat
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setSelectedLoanForSchedule(
                            selectedLoanForSchedule?.id === loan.id ? null : loan
                          )
                        }
                        className="text-xs"
                      >
                        {selectedLoanForSchedule?.id === loan.id
                          ? "Sembunyikan Jadwal"
                          : "Lihat Semua Angsuran"}
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-6">
                    {/* Next Installment Due Banner */}
                    {nextUnpaid ? (
                      <div
                        className={`p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                          isOverdue
                            ? "bg-danger-100/40 border-danger-base/40 text-danger-900"
                            : "bg-forest-50/60 border-forest-600/30 text-ink-900"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isOverdue ? (
                            <AlertTriangle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
                          ) : (
                            <Calendar className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1 text-xs">
                            <strong className="block text-sm font-semibold">
                              Tagihan Angsuran Ke-{nextUnpaid.installmentNumber} dari {loan.tenorMonths}
                            </strong>
                            <p className="text-ink-600">
                              Jatuh tempo: <strong>{nextUnpaid.dueDate}</strong>
                              {nextUnpaid.daysLate > 0 && (
                                <span className="text-danger-700 font-semibold ml-2">
                                  (Terlambat {nextUnpaid.daysLate} hari • Denda: {formatIDR(nextUnpaid.lateFeeAmount)})
                                </span>
                              )}
                            </p>
                            <p className="text-ink-500">
                              Rincian: Pokok {formatIDR(nextUnpaid.principalAmount)} + Bunga {formatIDR(nextUnpaid.interestAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[11px] text-ink-500">Total Tagihan:</div>
                            <div className="text-lg font-bold font-tabular text-ink-900">
                              {formatIDR(nextUnpaid.totalAmount + (nextUnpaid.lateFeeWaived ? 0 : nextUnpaid.lateFeeAmount))}
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              setPayingInstallment({ loan, installment: nextUnpaid })
                            }
                            className="text-xs font-semibold"
                          >
                            Bayar Angsuran
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-ink-50 rounded-lg text-xs text-ink-600 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-forest-700" />
                        <span>Seluruh jadwal angsuran untuk pinjaman ini telah diselesaikan.</span>
                      </div>
                    )}

                    {/* Progress Bar Sisa Pokok */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-ink-600">
                        <span>Pokok Terbayar: {formatIDR(loan.totalPaidPrincipal)}</span>
                        <span>Sisa Pokok: {formatIDR(loan.remainingPrincipal)}</span>
                      </div>
                      <div className="w-full bg-ink-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-forest-700 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (loan.totalPaidPrincipal / loan.principalAmount) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Expandable Amortization Schedule Table */}
                    {selectedLoanForSchedule?.id === loan.id && (
                      <div className="border border-ink-200 rounded-lg overflow-hidden">
                        <div className="bg-ink-50 px-4 py-2.5 text-xs font-bold text-ink-800 border-b border-ink-200">
                          Rincian Jadwal Angsuran Pinjaman {loan.id}
                        </div>
                        <div className="overflow-x-auto max-h-72 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-ink-50/50">
                                <TableHead className="text-xs">No</TableHead>
                                <TableHead className="text-xs">Jatuh Tempo</TableHead>
                                <TableHead className="text-xs text-right">Pokok</TableHead>
                                <TableHead className="text-xs text-right">Bunga</TableHead>
                                <TableHead className="text-xs text-right">Denda</TableHead>
                                <TableHead className="text-xs text-right font-bold">Total</TableHead>
                                <TableHead className="text-xs text-center">Status</TableHead>
                                <TableHead className="text-xs text-right">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {loan.installments.map((inst) => (
                                <TableRow key={inst.installmentNumber} className="hover:bg-ink-50/50">
                                  <TableCell className="text-xs font-medium">#{inst.installmentNumber}</TableCell>
                                  <TableCell className="text-xs text-ink-600">{inst.dueDate}</TableCell>
                                  <TableCell className="text-xs font-tabular text-right">
                                    {formatIDR(inst.principalAmount)}
                                  </TableCell>
                                  <TableCell className="text-xs font-tabular text-right text-ink-600">
                                    {formatIDR(inst.interestAmount)}
                                  </TableCell>
                                  <TableCell className="text-xs font-tabular text-right text-danger-700">
                                    {inst.lateFeeWaived ? (
                                      <span className="text-ink-400 line-through">Dihapuskan</span>
                                    ) : inst.lateFeeAmount > 0 ? (
                                      formatIDR(inst.lateFeeAmount)
                                    ) : (
                                      "Rp 0"
                                    )}
                                  </TableCell>
                                  <TableCell className="text-xs font-tabular text-right font-bold text-ink-900">
                                    {formatIDR(
                                      inst.totalAmount + (inst.lateFeeWaived ? 0 : inst.lateFeeAmount)
                                    )}
                                  </TableCell>
                                  <TableCell className="text-xs text-center">
                                    <Badge
                                      variant={
                                        inst.status === "paid"
                                          ? "forest"
                                          : inst.status === "overdue"
                                          ? "danger"
                                          : "neutral"
                                      }
                                      size="sm"
                                    >
                                      {inst.status === "paid"
                                        ? "Lunas"
                                        : inst.status === "overdue"
                                        ? "Terlambat"
                                        : "Belum Bayar"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs text-right">
                                    {inst.status !== "paid" ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setPayingInstallment({ loan, installment: inst })
                                        }
                                        className="text-[11px] h-7 px-2"
                                      >
                                        Bayar
                                      </Button>
                                    ) : (
                                      <span className="text-[11px] text-ink-400">
                                        {inst.paidAt?.slice(0, 10)}
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: FORMULIR PENGAJUAN BARU (WIZARD) */}
      {activeTab === "apply" && (
        <Card className="border-ink-200 shadow-subtle">
          <CardHeader className="border-b border-ink-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-ink-900">
                  Formulir Pengajuan Pembiayaan Pinjaman Baru
                </CardTitle>
                <CardDescription className="text-xs text-ink-500">
                  Langkah {applyStep} dari 4 — Silakan lengkapi informasi pengajuan Anda
                </CardDescription>
              </div>
              <Badge variant="forest" size="sm">
                Langkah {applyStep}/4
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {applyError && (
              <div className="mb-6 p-3 bg-danger-100 border border-danger-base text-danger-900 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-6">
              {/* STEP 1: PRODUK & NOMINAL */}
              {applyStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-ink-800">
                      Pilih Jenis Produk Pinjaman
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setApplyProductType(p.type);
                            if (applyAmount < p.minAmount) setApplyAmount(p.minAmount);
                            if (applyAmount > p.maxAmount) setApplyAmount(p.maxAmount);
                            if (applyTenor < p.minTenorMonths) setApplyTenor(p.minTenorMonths);
                            if (applyTenor > p.maxTenorMonths) setApplyTenor(p.maxTenorMonths);
                          }}
                          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                            applyProductType === p.type
                              ? "border-forest-700 bg-forest-50/50 ring-1 ring-forest-700"
                              : "border-ink-200 hover:border-ink-300"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs text-ink-900">{p.name}</span>
                            <span className="text-[11px] font-semibold text-forest-700">
                              {p.interestRatePct}% p.a.
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-500 line-clamp-2">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-ink-800">
                        Nominal Pengajuan (Rp)
                      </label>
                      <Input
                        type="number"
                        min={activeProduct.minAmount}
                        max={activeProduct.maxAmount}
                        step={500_000}
                        value={applyAmount}
                        onChange={(e) => setApplyAmount(Number(e.target.value))}
                        className="font-tabular text-sm"
                      />
                      <span className="text-[11px] text-ink-500">
                        Rentang: {formatIDR(activeProduct.minAmount)} – {formatIDR(activeProduct.maxAmount)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-ink-800">
                        Jangka Waktu (Tenor Bulan)
                      </label>
                      <select
                        className="w-full min-w-0 h-10 px-3 bg-white border border-ink-300 rounded-md text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                        value={String(applyTenor)}
                        onChange={(e) => setApplyTenor(Number(e.target.value))}
                      >
                        {[3, 6, 12, 18, 24, 36]
                          .filter(
                            (t) =>
                              t >= activeProduct.minTenorMonths &&
                              t <= activeProduct.maxTenorMonths
                          )
                          .map((t) => (
                            <option key={t} value={t}>
                              {t} Bulan
                            </option>
                          ))}
                      </select>
                      <span className="text-[11px] text-ink-500">
                        Batas tenor: {activeProduct.minTenorMonths} – {activeProduct.maxTenorMonths} bulan
                      </span>
                    </div>
                  </div>

                  {/* Ringkasan Estimasi Pinjaman */}
                  <div className="p-4 bg-ink-50 rounded-lg border border-ink-200 space-y-2 text-xs">
                    <div className="font-semibold text-ink-900">
                      Kalkulasi Simulasi Pengajuan:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-ink-700">
                      <div>
                        <span className="text-ink-500 block text-[11px]">Angsuran Bulanan:</span>
                        <strong className="text-ink-900 font-tabular text-sm">
                          {formatIDR(applySimulation.monthlyInstallmentEstimate)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-500 block text-[11px]">Biaya Administrasi:</span>
                        <strong className="text-ink-900 font-tabular text-sm">
                          {formatIDR(applySimulation.adminFeeAmount)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-500 block text-[11px]">Pencairan Bersih:</span>
                        <strong className="text-forest-700 font-tabular text-sm">
                          {formatIDR(applySimulation.netDisbursementAmount)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-500 block text-[11px]">Total Pengembalian:</span>
                        <strong className="text-ink-900 font-tabular text-sm">
                          {formatIDR(applySimulation.totalRepaymentAmount)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setApplyStep(2)}
                      className="text-xs font-semibold"
                    >
                      Lanjut ke Rencana Keperluan
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: TUJUAN PINJAMAN */}
              {applyStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-ink-800">
                      Kategori Keperluan
                    </label>
                    <select
                      className="w-full min-w-0 h-10 px-3 bg-white border border-ink-300 rounded-md text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                      value={applyPurposeCategory}
                      onChange={(e) => setApplyPurposeCategory(e.target.value)}
                    >
                      <option value="Modal Usaha UMKM">Modal Usaha / Kerja UMKM</option>
                      <option value="Pendidikan">Biaya Pendidikan Sekolah/Kuliah</option>
                      <option value="Renovasi Rumah">Renovasi / Perbaikan Rumah</option>
                      <option value="Kesehatan / Darurat">Kebutuhan Medis & Kesehatan</option>
                      <option value="Pembelian Perlengkapan Usaha">Pembelian Alat / Mesin Usaha</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-ink-800">
                      Uraian Rencana Keperluan Pinjaman
                    </label>
                    <Textarea
                      rows={3}
                      placeholder="Jelaskan secara rinci penggunaan dana pinjaman..."
                      value={applyPurpose}
                      onChange={(e) => setApplyPurpose(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-ink-800">
                      Sumber Dana Pembayaran Angsuran
                    </label>
                    <select
                      className="w-full min-w-0 h-10 px-3 bg-white border border-ink-300 rounded-md text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                      value={applyIncomeSource}
                      onChange={(e) => setApplyIncomeSource(e.target.value)}
                    >
                      <option value="Gaji Bulanan">Penghasilan / Gaji Bulanan Tetap</option>
                      <option value="Omzet Usaha / Dagang">Omzet Usaha / Perdagangan</option>
                      <option value="Hasil Tani / Kebun">Hasil Pertanian / Perkebunan</option>
                      <option value="Honor / Proyek Lepas">Honorarium / Pekerjaan Lepas</option>
                    </select>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setApplyStep(1)}
                      className="text-xs"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (!applyPurpose.trim()) {
                          setApplyError("Mohon isi deskripsi keperluan pinjaman.");
                          return;
                        }
                        setApplyError(null);
                        setApplyStep(3);
                      }}
                      className="text-xs font-semibold"
                    >
                      Lanjut ke Dokumen Pendukung
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: DOKUMEN PENDUKUNG (SIMULASI) */}
              {applyStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-ink-50 border border-ink-200 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <strong className="block text-ink-900 font-semibold">
                          Simulasi Unggah Berkas & Privasi (BR-04.1)
                        </strong>
                        <p className="text-ink-600 leading-relaxed">
                          Dalam lingkungan demonstrasi ini, berkas yang Anda pilih tidak disimpan secara biner maupun base64. Sistem otomatis mengaitkan placeholder sintetis bertanda:
                        </p>
                        <code className="block bg-ink-100 p-2 rounded text-[11px] font-mono text-ink-800">
                          SIMULATED DOCUMENT: bukti-pendapatan-{member.demoId.toLowerCase()}.pdf
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-ink-300 rounded-lg p-6 text-center space-y-2">
                    <FileText className="w-8 h-8 text-ink-400 mx-auto" />
                    <div className="text-xs font-medium text-ink-800">
                      Dokumen Pendukung Simulatif Terlampir Otomatis
                    </div>
                    <p className="text-[11px] text-ink-500">
                      Slip gaji atau catatan omzet telah siap ditautkan ke permohonan Anda.
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setApplyStep(2)}
                      className="text-xs"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setApplyStep(4)}
                      className="text-xs font-semibold"
                    >
                      Lanjut ke Konfirmasi Akhir
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: KONFIRMASI AKHIR */}
              {applyStep === 4 && (
                <div className="space-y-6">
                  <div className="border border-ink-200 rounded-lg p-4 space-y-3 text-xs bg-ink-50/50">
                    <h3 className="font-bold text-ink-900 text-sm">
                      Ringkasan Permohonan Pinjaman
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-ink-700">
                      <div>
                        <span className="text-ink-500 block">Produk:</span>
                        <strong>{activeProduct.name}</strong>
                      </div>
                      <div>
                        <span className="text-ink-500 block">Nominal Pokok:</span>
                        <strong className="font-tabular">{formatIDR(applyAmount)}</strong>
                      </div>
                      <div>
                        <span className="text-ink-500 block">Tenor:</span>
                        <strong>{applyTenor} Bulan</strong>
                      </div>
                      <div>
                        <span className="text-ink-500 block">Estimasi Angsuran:</span>
                        <strong className="font-tabular text-forest-700">
                          {formatIDR(applySimulation.monthlyInstallmentEstimate)} / bln
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-500 block">Keperluan:</span>
                        <span>{applyPurpose}</span>
                      </div>
                      <div>
                        <span className="text-ink-500 block">Sumber Pembayaran:</span>
                        <span>{applyIncomeSource}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-warning-100/30 border border-warning-base/30 rounded-lg text-xs space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyAgreed}
                        onChange={(e) => setApplyAgreed(e.target.checked)}
                        className="mt-0.5 accent-forest-700 rounded"
                      />
                      <span className="text-ink-800 leading-relaxed">
                        Saya menyatakan data pengajuan ini dibuat dengan itikad baik dan menyetujui kewajiban pembayaran angsuran tepat waktu sesuai jadwal yang diterbitkan saat pencairan dana disetujui.
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setApplyStep(3)}
                      className="text-xs"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="text-xs font-semibold"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      Kirim Pengajuan Pinjaman
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: RIWAYAT PENGAJUAN & PINJAMAN LUNAS */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Pengajuan Dalam Proses / Historis */}
          <Card className="border-ink-200 shadow-subtle">
            <CardHeader className="border-b border-ink-100 pb-3">
              <CardTitle className="text-base font-bold text-ink-900">
                Daftar Pengajuan Pinjaman
              </CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Status pengajuan pinjaman yang telah Anda kirimkan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {memberApplications.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-500">
                  Belum ada permohonan pengajuan pinjaman baru.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-ink-50/50">
                      <TableHead className="text-xs">No. Pengajuan</TableHead>
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs">Produk</TableHead>
                      <TableHead className="text-xs text-right">Nominal</TableHead>
                      <TableHead className="text-xs">Tenor</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                      <TableHead className="text-xs">Catatan / Alasan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="text-xs font-semibold">{app.id}</TableCell>
                        <TableCell className="text-xs text-ink-500">
                          {app.applicationDate?.slice(0, 10)}
                        </TableCell>
                        <TableCell className="text-xs">{app.productName}</TableCell>
                        <TableCell className="text-xs font-tabular text-right font-medium">
                          {formatIDR(app.amount)}
                        </TableCell>
                        <TableCell className="text-xs">{app.tenorMonths} Bulan</TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge
                            variant={
                              app.status === "approved"
                                ? "forest"
                                : app.status === "rejected"
                                ? "danger"
                                : app.status === "recommended" || app.status === "under_review"
                                ? "warning"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {app.status === "submitted"
                              ? "Menunggu Verifikasi"
                              : app.status === "under_review"
                              ? "Sedang Dianalisa"
                              : app.status === "recommended"
                              ? "Direkomendasikan"
                              : app.status === "approved"
                              ? "Disetujui"
                              : app.status === "rejected"
                              ? "Ditolak"
                              : app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-ink-600 max-w-xs truncate">
                          {app.rejectionReason || app.recommendationNotes || app.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pinjaman Lampau yang Telah Lunas */}
          <Card className="border-ink-200 shadow-subtle">
            <CardHeader className="border-b border-ink-100 pb-3">
              <CardTitle className="text-base font-bold text-ink-900">
                Riwayat Pinjaman Lunas
              </CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Fasilitas pembiayaan yang telah Anda selesaikan secara tertib
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {pastLoans.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-500">
                  Belum ada riwayat pinjaman yang telah berstatus lunas.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-ink-50/50">
                      <TableHead className="text-xs">No. Pinjaman</TableHead>
                      <TableHead className="text-xs">Produk</TableHead>
                      <TableHead className="text-xs text-right">Plafon Pokok</TableHead>
                      <TableHead className="text-xs">Tenor</TableHead>
                      <TableHead className="text-xs">Tanggal Cair</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastLoans.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-xs font-semibold">{l.id}</TableCell>
                        <TableCell className="text-xs">{l.productName}</TableCell>
                        <TableCell className="text-xs font-tabular text-right">
                          {formatIDR(l.principalAmount)}
                        </TableCell>
                        <TableCell className="text-xs">{l.tenorMonths} Bulan</TableCell>
                        <TableCell className="text-xs text-ink-500">{l.disbursementDate}</TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="forest" size="sm">
                            Lunas Sempurna
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: BAYAR ANGSURAN (SIMULASI) */}
      {payingInstallment && (
        <Modal
          isOpen={true}
          onClose={() => setPayingInstallment(null)}
          title={`Pembayaran Angsuran #${payingInstallment.installment.installmentNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-ink-50 rounded-lg space-y-1.5 border border-ink-200">
              <div className="flex justify-between">
                <span className="text-ink-500">Pinjaman:</span>
                <span className="font-semibold text-ink-900">{payingInstallment.loan.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Jatuh Tempo:</span>
                <span className="font-semibold text-ink-900">{payingInstallment.installment.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Pokok:</span>
                <span className="font-tabular">{formatIDR(payingInstallment.installment.principalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Bunga:</span>
                <span className="font-tabular">{formatIDR(payingInstallment.installment.interestAmount)}</span>
              </div>
              {payingInstallment.installment.lateFeeAmount > 0 && (
                <div className="flex justify-between text-danger-700">
                  <span>Denda Keterlambatan:</span>
                  <span className="font-tabular font-bold">
                    {formatIDR(payingInstallment.installment.lateFeeAmount)}
                  </span>
                </div>
              )}
              <div className="border-t border-ink-200 pt-1.5 flex justify-between font-bold text-ink-900 text-sm">
                <span>Total Kewajiban:</span>
                <span className="font-tabular text-forest-700">
                  {formatIDR(
                    payingInstallment.installment.totalAmount +
                      (payingInstallment.installment.lateFeeWaived
                        ? 0
                        : payingInstallment.installment.lateFeeAmount)
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-semibold text-ink-800">
                Pilih Metode Pembayaran Simulasi
              </label>
              <select
                className="w-full min-w-0 h-10 px-3 bg-white border border-ink-300 rounded-md text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Transfer Bank (Simulasi)">Transfer Bank (Simulasi)</option>
                <option value="Virtual Account KMB (Simulasi)">Virtual Account KMB (Simulasi)</option>
                <option value="QRIS Mockup (Simulasi)">QRIS Mockup (Simulasi)</option>
                <option value="Kasir Tunai (Simulasi)">Kasir Kantor Koperasi (Simulasi)</option>
              </select>
            </div>

            <div className="p-2.5 bg-warning-100/30 border border-warning-base/30 rounded text-ink-700 leading-relaxed text-[11px]">
              <strong>Demo Mode:</strong> Pembayaran ini bersifat simulasi langsung memperbarui saldo pokok dan jadwal angsuran Anda.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPayingInstallment(null)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmInstallmentPayment}
                className="font-semibold"
              >
                Konfirmasi Pembayaran
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: SIMULASI PELUNASAN DIPERCEPAT */}
      {earlyRepayLoan && (
        <Modal
          isOpen={true}
          onClose={() => setEarlyRepayLoan(null)}
          title={`Simulasi Pelunasan Dipercepat (${earlyRepayLoan.id})`}
        >
          {(() => {
            const early = calculateEarlyRepayment(earlyRepayLoan.installments);
            return (
              <div className="space-y-4 text-xs">
                <p className="text-ink-600 leading-relaxed">
                  Sesuai asas keadilan koperasi, jika Anda melunasi pinjaman sebelum tenor berakhir, seluruh bunga periode mendatang dihapuskan:
                </p>

                <div className="p-4 bg-forest-50/60 border border-forest-600/30 rounded-lg space-y-2 text-ink-700">
                  <div className="flex justify-between">
                    <span>Sisa Pokok Pinjaman:</span>
                    <strong className="font-tabular text-ink-900">
                      {formatIDR(early.unpaidPrincipalTotal)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Bunga Berjalan Periode Ini:</span>
                    <strong className="font-tabular text-ink-900">
                      {formatIDR(early.unpaidInterestCurrent)}
                    </strong>
                  </div>
                  {early.unpaidLateFeeTotal > 0 && (
                    <div className="flex justify-between text-danger-700">
                      <span>Denda Tertunggak:</span>
                      <strong className="font-tabular">
                        {formatIDR(early.unpaidLateFeeTotal)}
                      </strong>
                    </div>
                  )}
                  <div className="flex justify-between text-forest-700">
                    <span>Bunga Masa Depan Dihapuskan:</span>
                    <strong className="font-tabular font-bold">
                      -{formatIDR(early.waivedFutureInterestAmount)}
                    </strong>
                  </div>
                  <div className="border-t border-forest-200 pt-2 flex justify-between text-sm font-extrabold text-forest-900">
                    <span>Total Pembayaran Pelunasan:</span>
                    <span className="font-tabular">
                      {formatIDR(early.totalEarlySettlementAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEarlyRepayLoan(null)}
                  >
                    Tutup
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConfirmEarlyRepayment}
                    className="font-semibold"
                  >
                    Konfirmasi Pelunasan Penuh
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
