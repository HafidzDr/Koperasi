import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLoanStore } from "../stores/loanStore";
import { LoanProductType, InterestCalculationMethod } from "../types";
import { calculateLoanSimulation } from "../utils/loanCalculations";
import { formatIDR } from "@/lib/utils";
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
  Briefcase,
  AlertCircle,
  ArrowRight,
  Calculator,
  ShieldCheck,
  FileText,
} from "lucide-react";

export const PublicLoanCatalogView: React.FC = () => {
  const { products, systemConfig } = useLoanStore();

  // State Simulasi
  const [selectedProductType, setSelectedProductType] = useState<LoanProductType>("konsumtif");
  const [selectedMethod, setSelectedMethod] = useState<InterestCalculationMethod>("flat");
  const [amountInput, setAmountInput] = useState<number>(10_000_000);
  const [tenorInput, setTenorInput] = useState<number>(12);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  const activeProduct =
    products.find((p) => p.type === selectedProductType) || products[0];

  // Hitung simulasi dinamis
  const simulation = calculateLoanSimulation(
    amountInput,
    tenorInput,
    activeProduct ? activeProduct.interestRatePct : 12,
    selectedMethod,
    activeProduct ? activeProduct.adminFeePct : 1
  );

  const handleProductSelect = (type: LoanProductType) => {
    setSelectedProductType(type);
    const prod = products.find((p) => p.type === type);
    if (prod) {
      if (amountInput < prod.minAmount) setAmountInput(prod.minAmount);
      if (amountInput > prod.maxAmount) setAmountInput(prod.maxAmount);
      if (tenorInput < prod.minTenorMonths) setTenorInput(prod.minTenorMonths);
      if (tenorInput > prod.maxTenorMonths) setTenorInput(prod.maxTenorMonths);
    }
  };

  return (
    <div className="space-y-12 text-left max-w-6xl mx-auto py-6">
      {/* 1. Header Hero */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="forest" size="md">
          Layanan Pembiayaan Koperasi KMB
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
          Pembiayaan Adil, Transparan, dan Menumbuhkan Usaha Anggota
        </h1>
        <p className="text-sm text-ink-600 leading-relaxed">
          Koperasi Konsumen Makmur Bersama Nusantara menghadirkan fasilitas pembiayaan dengan prinsip gotong royong dan kesetaraan. Seluruh perhitungan di bawah ini adalah simulasi demonstrasi frontend yang transparan dan dapat disesuaikan.
        </p>
      </div>

      {/* 2. Notice Disclaimer */}
      <div className="p-4 bg-warning-100/40 border border-warning-base/40 rounded-lg text-xs text-ink-700 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-ink-900 font-semibold">
            {systemConfig.label}
          </strong>
          <p className="leading-relaxed">
            {systemConfig.disclaimer} Pembiayaan hanya dapat diajukan oleh Anggota Koperasi yang telah terdaftar resmi dan berstatus aktif.
          </p>
        </div>
      </div>

      {/* 3. Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((prod) => {
          const isSelected = prod.type === selectedProductType;
          return (
            <Card
              key={prod.id}
              className={`flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? "border-forest-600 ring-2 ring-forest-600/20 shadow-elevation"
                  : "border-ink-200 hover:border-forest-600/40 shadow-subtle"
              }`}
              onClick={() => handleProductSelect(prod.type)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={isSelected ? "forest" : "neutral"}
                    size="sm"
                  >
                    {prod.badgeLabel}
                  </Badge>
                  <span className="text-xs font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    {prod.interestRatePct}% p.a. {prod.calculationMethod}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-ink-900">
                  {prod.name}
                </CardTitle>
                <CardDescription className="text-xs text-ink-600 leading-relaxed">
                  {prod.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="space-y-2 border-t border-ink-100 pt-3 text-xs text-ink-700">
                  <div className="flex justify-between">
                    <span className="text-ink-500">Plafon Pinjaman:</span>
                    <span className="font-semibold text-ink-900">
                      {formatIDR(prod.minAmount)} – {formatIDR(prod.maxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Pilihan Tenor:</span>
                    <span className="font-semibold text-ink-900">
                      {prod.minTenorMonths} – {prod.maxTenorMonths} Bulan
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Biaya Administrasi:</span>
                    <span className="font-semibold text-ink-900">
                      {prod.adminFeePct}% (Potong Pencairan)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Persyaratan Agunan:</span>
                    <span className="font-semibold text-ink-900">
                      {prod.isCollateralRequired ? "Konfirmasi Profil UMKM" : "Tanpa Agunan"}
                    </span>
                  </div>
                </div>

                <Button
                  variant={isSelected ? "primary" : "outline"}
                  size="sm"
                  className="w-full text-xs font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductSelect(prod.type);
                  }}
                >
                  {isSelected ? "Sedang Disimulasikan" : "Simulasikan Produk Ini"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 4. Interactive Simulator */}
      <div className="bg-white border border-ink-200 rounded-xl p-6 sm:p-8 shadow-subtle space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-forest-700" />
              <h2 className="text-xl font-bold text-ink-900">
                Kalkulator Simulasi Pembiayaan
              </h2>
            </div>
            <p className="text-xs text-ink-500">
              Uji perkiraan angsuran dan biaya sebelum mengajukan pinjaman resmi melalui Portal Anggota.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-ink-500 font-medium">Metode Bunga:</span>
            <div className="inline-flex rounded-lg border border-ink-300 p-0.5 bg-ink-50">
              <button
                type="button"
                onClick={() => setSelectedMethod("flat")}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedMethod === "flat"
                    ? "bg-white text-forest-800 shadow-sm font-semibold"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                Flat Rate (Baku)
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("anuitas")}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedMethod === "anuitas"
                    ? "bg-white text-forest-800 shadow-sm font-semibold"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                Anuitas
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("efektif")}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedMethod === "efektif"
                    ? "bg-white text-forest-800 shadow-sm font-semibold"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                Efektif
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-6">
            {/* Jumlah Pinjaman */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-ink-800">
                  Jumlah Pinjaman (Rp)
                </label>
                <span className="text-ink-500 font-tabular font-medium">
                  {formatIDR(amountInput)}
                </span>
              </div>
              <input
                type="range"
                min={activeProduct.minAmount}
                max={activeProduct.maxAmount}
                step={500_000}
                value={amountInput}
                onChange={(e) => setAmountInput(Number(e.target.value))}
                className="w-full accent-forest-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-ink-500 font-tabular">
                <span>{formatIDR(activeProduct.minAmount)}</span>
                <span>{formatIDR(activeProduct.maxAmount)}</span>
              </div>
            </div>

            {/* Tenor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-ink-800">
                  Jangka Waktu (Tenor)
                </label>
                <span className="text-ink-500 font-medium">
                  {tenorInput} Bulan
                </span>
              </div>
              <input
                type="range"
                min={activeProduct.minTenorMonths}
                max={activeProduct.maxTenorMonths}
                step={activeProduct.type === "darurat" ? 1 : 3}
                value={tenorInput}
                onChange={(e) => setTenorInput(Number(e.target.value))}
                className="w-full accent-forest-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-ink-500">
                <span>{activeProduct.minTenorMonths} Bulan</span>
                <span>{activeProduct.maxTenorMonths} Bulan</span>
              </div>
            </div>

            {/* Info Produk Terpilih */}
            <div className="p-3.5 bg-ink-50 rounded-lg text-xs text-ink-600 space-y-1.5 border border-ink-200">
              <div className="font-semibold text-ink-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                Ketentuan {activeProduct.name}
              </div>
              <p className="leading-relaxed">
                Suku bunga: {activeProduct.interestRatePct}% p.a. • Administrasi: {activeProduct.adminFeePct}% • {activeProduct.notes}
              </p>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-7 bg-forest-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-subtle">
            <div>
              <div className="text-xs uppercase tracking-wider text-forest-200 font-semibold mb-1">
                Estimasi Angsuran Bulanan
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-tabular mb-6">
                {formatIDR(simulation.monthlyInstallmentEstimate)}
                <span className="text-xs font-normal text-forest-300 ml-1">/ bulan</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-forest-800/80 pt-4 text-xs">
                <div>
                  <div className="text-forest-300 text-[11px]">Pokok Pinjaman:</div>
                  <div className="font-semibold text-white font-tabular text-sm">
                    {formatIDR(simulation.principalAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-forest-300 text-[11px]">Total Bunga:</div>
                  <div className="font-semibold text-white font-tabular text-sm">
                    {formatIDR(simulation.totalInterestAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-forest-300 text-[11px]">Biaya Administrasi:</div>
                  <div className="font-semibold text-white font-tabular text-sm">
                    {formatIDR(simulation.adminFeeAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-forest-300 text-[11px]">Pencairan Bersih:</div>
                  <div className="font-semibold text-forest-200 font-tabular text-sm">
                    {formatIDR(simulation.netDisbursementAmount)}
                  </div>
                </div>
                <div className="col-span-2 pt-2 border-t border-forest-800/80">
                  <div className="flex justify-between items-center">
                    <span className="text-forest-300 text-[11px]">Total Estimasi Pengembalian:</span>
                    <span className="font-bold text-white font-tabular text-base">
                      {formatIDR(simulation.totalRepaymentAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowScheduleModal(!showScheduleModal)}
                leftIcon={<FileText className="w-4 h-4 shrink-0" />}
                className="bg-transparent border-forest-500/80 text-white hover:bg-forest-800 text-xs font-medium justify-center whitespace-nowrap"
              >
                {showScheduleModal ? "Tutup Rincian Jadwal" : "Lihat Jadwal Angsuran"}
              </Button>

              <Link to="/portal/pinjaman" className="flex-1">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4 shrink-0" />}
                  className="w-full bg-forest-100 text-forest-900 hover:bg-white text-xs font-semibold justify-center whitespace-nowrap shadow-sm"
                >
                  Ajukan di Portal Anggota
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Schedule Table Preview */}
        {showScheduleModal && (
          <div className="border-t border-ink-200 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-ink-900">
                Proyeksi Jadwal Angsuran Pinjaman ({tenorInput} Periode)
              </h3>
              <span className="text-xs text-ink-500">
                *Sisa pembulatan pokok dialokasikan pada angsuran bulan terakhir
              </span>
            </div>

            <div className="overflow-x-auto border border-ink-200 rounded-lg max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-ink-50">
                    <TableHead className="text-xs">Bulan</TableHead>
                    <TableHead className="text-xs">Estimasi Jatuh Tempo</TableHead>
                    <TableHead className="text-xs text-right">Porsi Pokok</TableHead>
                    <TableHead className="text-xs text-right">Porsi Bunga</TableHead>
                    <TableHead className="text-xs text-right font-bold">Total Angsuran</TableHead>
                    <TableHead className="text-xs text-right">Sisa Saldo Pokok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulation.schedule.map((item) => (
                    <TableRow key={item.installmentNumber} className="hover:bg-ink-50/50">
                      <TableCell className="text-xs font-medium">Ke-{item.installmentNumber}</TableCell>
                      <TableCell className="text-xs text-ink-600">{item.dueDate}</TableCell>
                      <TableCell className="text-xs font-tabular text-right">
                        {formatIDR(item.principalAmount)}
                      </TableCell>
                      <TableCell className="text-xs font-tabular text-right text-ink-600">
                        {formatIDR(item.interestAmount)}
                      </TableCell>
                      <TableCell className="text-xs font-tabular text-right font-bold text-ink-900">
                        {formatIDR(item.totalAmount)}
                      </TableCell>
                      <TableCell className="text-xs font-tabular text-right text-ink-500">
                        {formatIDR(item.remainingPrincipalAfter)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* 5. Syarat & Tata Cara Pengajuan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-ink-200 shadow-subtle">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-forest-700" />
              Syarat Kelayakan Peminjam (BR-03.1)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-ink-600 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-forest-700 font-bold">•</span>
              <span>Terdaftar sebagai Anggota Koperasi KMB dengan masa keanggotaan minimal 3 bulan (ilustrasi demonstrasi).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-forest-700 font-bold">•</span>
              <span>Tidak sedang dalam status sanksi keanggotaan Dibekukan.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-forest-700 font-bold">•</span>
              <span>Tidak memiliki riwayat angsuran pinjaman berjalan yang sedang menunggak (lewat jatuh tempo).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-forest-700 font-bold">•</span>
              <span>Maksimum 2 pinjaman aktif berjalan bersamaan per anggota.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-ink-200 shadow-subtle">
          <CardHeader>
            <CardTitle className="text-base font-bold text-ink-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              Tata Kelola & Penyaluran Berjenjang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-ink-600 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-forest-700 font-bold">•</span>
              <span><strong>Level 1:</strong> Verifikasi administratif & kelengkapan dokumen pendukung oleh Staf Operasional.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-forest-700 font-bold">•</span>
              <span><strong>Level 2:</strong> Analisa kelayakan dan persetujuan Finance Officer (hingga batas plafon Rp 10.000.000).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-forest-700 font-bold">•</span>
              <span><strong>Level 3:</strong> Persetujuan Manajer/Pengurus untuk pengajuan di atas Rp 10.000.000 guna menjaga rasio likuiditas koperasi.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-forest-700 font-bold">•</span>
              <span>Pemisahan tugas (SoD) ketat: pemohon dilarang menyetujui pengajuannya sendiri.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Footer Call to Action */}
      <div className="bg-ink-100 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-ink-900">
          Belum Menjadi Anggota Koperasi KMB?
        </h3>
        <p className="text-xs text-ink-600 max-w-xl mx-auto">
          Daftarkan diri Anda untuk menikmati kemudahan fasilitas pembiayaan berbunga bersahabat dan bagi hasil sisa hasil usaha (SHU) setiap akhir tahun buku.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/daftar">
            <Button variant="primary" size="sm" className="text-xs">
              Daftar Jadi Anggota
            </Button>
          </Link>
          <Link to="/masuk">
            <Button variant="outline" size="sm" className="text-xs">
              Masuk Portal Anggota
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
