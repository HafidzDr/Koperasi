import React from "react";
import { Link } from "react-router-dom";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useSavingsStore } from "../stores/savingsStore";
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
  CheckCircle2,
  XCircle,
  ArrowRight,
  Info,
  Building,
} from "lucide-react";

export const PublicSavingsCatalogView: React.FC = () => {
  const { savingsConfig } = useMembershipStore();
  const { sukarelaConfig } = useSavingsStore();

  return (
    <div className="space-y-10 text-left max-w-6xl mx-auto py-4">
      {/* 1. Hero Section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="forest" size="md">
          Produk Simpanan Koperasi KMB
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
          Pemupukan Modal Bersama yang Aman, Berkeadilan, dan Berkah
        </h1>
        <p className="text-sm text-ink-600 leading-relaxed">
          Sebagai wujud tata kelola koperasi yang transparan dan akuntabel, simpanan anggota merupakan pilar utama kemandirian finansial bersama. Seluruh simulasi produk berikut merupakan contoh ilustrasi dalam demonstrasi; ketentuan final mengikuti AD/ART dan keputusan Rapat Anggota setelah ditetapkan.
        </p>
      </div>

      {/* 2. Notice Disclaimer */}
      <div className="p-4 bg-warning-100/30 border border-warning-base/30 rounded-lg text-xs text-ink-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-warning-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-ink-900 font-semibold">
            {savingsConfig.label}
          </strong>
          <p className="leading-relaxed">
            {savingsConfig.disclaimer} Besaran definitif Simpanan Pokok dan Simpanan Wajib diputuskan secara demokratis dalam Rapat Anggota Tahunan (RAT).
          </p>
        </div>
      </div>

      {/* 3. Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simpanan Pokok */}
        <Card className="flex flex-col justify-between border-forest-600/30 shadow-subtle hover:shadow-elevation transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="forest" size="sm">Kode: SP</Badge>
              <span className="text-[11px] text-ink-500 font-medium">Sekali Setor</span>
            </div>
            <CardTitle className="text-lg mt-2">Simpanan Pokok</CardTitle>
            <CardDescription>
              Bukti penyertaan modal awal yang disetorkan saat seseorang resmi terdaftar menjadi Anggota KMB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 bg-forest-50/60 rounded-lg border border-forest-600/20">
              <span className="text-[11px] text-forest-700 block">Besaran Setoran Ilustrasi:</span>
              <div className="text-2xl font-bold font-mono text-forest-900">
                {formatIDR(savingsConfig.simpananPokokNominal)}
              </div>
              <span className="text-[10px] text-forest-600 block mt-0.5">Disetor satu kali di awal pendaftaran</span>
            </div>

            <ul className="space-y-2 text-ink-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span>Memberikan hak suara penuh dalam Rapat Anggota (1 Anggota = 1 Suara).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span>Mendapatkan Kartu Anggota Digital dan akses Member Portal.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-danger-700 shrink-0 mt-0.5" />
                <span>Tidak dapat ditarik selama masa keanggotaan masih aktif.</span>
              </li>
            </ul>

            <Link to="/daftar" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Daftar Menjadi Anggota
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Simpanan Wajib */}
        <Card className="flex flex-col justify-between border-forest-700 shadow-subtle hover:shadow-elevation transition-shadow relative">
          <div className="absolute -top-3 right-4">
            <Badge variant="forest" size="sm">Utama</Badge>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="info" size="sm">Kode: SW</Badge>
              <span className="text-[11px] text-ink-500 font-medium">Bulanan</span>
            </div>
            <CardTitle className="text-lg mt-2">Simpanan Wajib</CardTitle>
            <CardDescription>
              Iuran rutin bulanan untuk memperkuat permodalan operasional dan investasi usaha koperasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 bg-ink-50 rounded-lg border border-ink-200">
              <span className="text-[11px] text-ink-600 block">Iuran Rutin Bulanan Ilustrasi:</span>
              <div className="text-2xl font-bold font-mono text-ink-900">
                {formatIDR(savingsConfig.simpananWajibBulanan)} <span className="text-xs font-normal text-ink-500">/ bulan</span>
              </div>
              <span className="text-[10px] text-ink-500 block mt-0.5">Jatuh tempo setiap tanggal 10 bulan berjalan</span>
            </div>

            <ul className="space-y-2 text-ink-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span>Menjadi dasar perhitungan alokasi SHU Bagian Jasa Modal (Jasa Simpanan).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span>Membuka kelayakan fasilitas pembiayaan/pinjaman usaha produktif.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-danger-700 shrink-0 mt-0.5" />
                <span>Hanya dapat dicairkan saat pengunduran diri resmi dari keanggotaan.</span>
              </li>
            </ul>

            <Link to="/portal/simpanan" className="block pt-2">
              <Button variant="primary" size="sm" className="w-full">
                Buka Portal Simpanan
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Simpanan Sukarela */}
        <Card className="flex flex-col justify-between border-forest-600/30 shadow-subtle hover:shadow-elevation transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm">Kode: SS</Badge>
              <span className="text-[11px] text-forest-800 font-semibold">Likuid / Fleksibel</span>
            </div>
            <CardTitle className="text-lg mt-2">Simpanan Sukarela</CardTitle>
            <CardDescription>
              Tabungan anggota berjangka fleksibel yang dapat disetor dan ditarik kapan saja sesuai kebutuhan likuiditas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 bg-warning-100/40 rounded-lg border border-warning-base/30">
              <span className="text-[11px] text-ink-600 block">Suku Bunga Ilustrasi Simulasi:</span>
              <div className="text-2xl font-bold font-mono text-ink-900">
                {sukarelaConfig.interestRatePct}% <span className="text-xs font-normal text-ink-500">p.a.</span>
              </div>
              <span className="text-[10px] text-ink-500 block mt-0.5">
                Setoran min. {formatIDR(sukarelaConfig.minDeposit)} • Tarik min. {formatIDR(sukarelaConfig.minWithdrawal)}
              </span>
            </div>

            <ul className="space-y-2 text-ink-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span>Bebas biaya administrasi bulanan tersembunyi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span>Pengajuan penarikan dana diproses cepat via portal daring.</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-ink-500 shrink-0 mt-0.5" />
                <span>Saldo mengendap minimum: {formatIDR(sukarelaConfig.minBalance)}.</span>
              </li>
            </ul>

            <Link to="/portal/simpanan" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Kelola Tabungan Sukarela
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 4. Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matriks Perbandingan Karakteristik Simpanan</CardTitle>
          <CardDescription>
            Tinjauan cepat perbedaan ketentuan Simpanan Pokok, Wajib, dan Sukarela pada KMB.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter / Ketentuan</TableHead>
                  <TableHead>Simpanan Pokok (SP)</TableHead>
                  <TableHead>Simpanan Wajib (SW)</TableHead>
                  <TableHead>Simpanan Sukarela (SS)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold text-xs text-ink-900">Frekuensi Setoran</TableCell>
                  <TableCell className="text-xs text-ink-700">1 kali (saat registrasi)</TableCell>
                  <TableCell className="text-xs text-ink-700">Rutin bulanan</TableCell>
                  <TableCell className="text-xs text-ink-700">Fleksibel sewaktu-waktu</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-xs text-ink-900">Penarikan Selama Anggota Aktif</TableCell>
                  <TableCell className="text-xs text-danger-700 font-medium">Tidak dapat ditarik</TableCell>
                  <TableCell className="text-xs text-danger-700 font-medium">Tidak dapat ditarik</TableCell>
                  <TableCell className="text-xs text-forest-700 font-medium">Dapat ditarik sewaktu-waktu</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-xs text-ink-900">Hak Suara (RAT)</TableCell>
                  <TableCell className="text-xs text-forest-700 font-medium">Syarat utama hak suara</TableCell>
                  <TableCell className="text-xs text-forest-700 font-medium">Syarat keaktifan suara</TableCell>
                  <TableCell className="text-xs text-ink-500">Tidak memengaruhi hak suara</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-xs text-ink-900">Alokasi SHU Modal</TableCell>
                  <TableCell className="text-xs text-ink-700">Kebijakan RAT</TableCell>
                  <TableCell className="text-xs text-forest-700 font-medium">Diperhitungkan proporsional</TableCell>
                  <TableCell className="text-xs text-ink-700">Memperoleh imbal bunga</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-xs text-ink-900">Pengembalian Saat Keluar</TableCell>
                  <TableCell className="text-xs text-ink-700">Dikembalikan 100%</TableCell>
                  <TableCell className="text-xs text-ink-700">Dikembalikan 100%</TableCell>
                  <TableCell className="text-xs text-ink-700">Dapat ditarik seluruhnya</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="p-3 bg-ink-50 border-t border-ink-100 text-[11px] text-ink-600">
            * <strong>Catatan Kebijakan:</strong> Karakteristik dan hak anggota dalam tabel di atas merupakan contoh ilustrasi produk dalam demonstrasi; ketentuan final mengenai simpanan, hak suara, alokasi SHU, dan pengembalian simpanan saat keluar keanggotaan mengikuti AD/ART dan ketetapan resmi Rapat Anggota setelah disahkan.
          </div>
        </CardContent>
      </Card>

      {/* 5. Institutional CTA Banner */}
      <div className="p-6 sm:p-8 bg-forest-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-elevation">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Building className="w-5 h-5 text-forest-200" />
            <span className="text-xs text-forest-200 font-semibold uppercase tracking-wider">
              Koperasi Konsumen Makmur Bersama Nusantara
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Siap Mengembangkan Usaha Bersama KMB?</h2>
          <p className="text-xs text-forest-100 max-w-xl">
            Mari bergabung sebagai anggota resmi KMB dan nikmati kemudahan akses permodalan, pembagian SHU tahunan, dan pengelolaan simpanan yang berkeadilan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <Link to="/daftar" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full bg-forest-600 hover:bg-forest-500 text-white border-forest-500"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Mulai Pendaftaran
            </Button>
          </Link>
          <Link to="/tentang" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              className="w-full text-white border-forest-700 hover:bg-forest-800"
            >
              Pelajari KMB
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
