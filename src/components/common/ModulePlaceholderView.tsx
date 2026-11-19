import React from "react";
import { Link } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { formatIDR } from "@/lib/utils";
import { BusinessModuleKey } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Info,
  ArrowLeft,
  ArrowRight,
  Layers,
  Compass,
  CheckCircle2,
  Users,
  ShieldCheck,
  FileText,
  Scale,
  Award,
  BookOpen,
} from "lucide-react";

export interface ModulePlaceholderViewProps {
  moduleKey?: BusinessModuleKey;
  title: string;
  description: string;
  phasePlanned?: number;
  environment?: "Public" | "Portal" | "Admin";
}

export const ModulePlaceholderView: React.FC<ModulePlaceholderViewProps> = ({
  moduleKey,
  title,
  description,
  phasePlanned = 6,
  environment = "Portal",
}) => {
  const { config } = useConfigStore();
  const { savingsConfig } = useMembershipStore();

  const isModuleDisabled = moduleKey ? !config.activeModules[moduleKey] : false;

  if (isModuleDisabled) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-left">
        <Card className="border-warning-base/40 bg-white shadow-subtle">
          <CardHeader className="bg-warning-50/50 border-b border-warning-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning" size="sm" dot>Status: Modul Dinonaktifkan</Badge>
            </div>
            <CardTitle className="text-lg text-ink-900">{title}</CardTitle>
            <CardDescription className="text-xs text-ink-600">
              Modul bisnis ini saat ini dinonaktifkan dalam konfigurasi koperasi. Sesuai prinsip arsitektur modular, platform tetap berfungsi normal tanpa modul ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <p className="text-xs text-ink-600 leading-relaxed">
              Anda dapat mengaktifkan modul ini kembali melalui bilah demonstrasi <strong>&quot;Modul Bisnis&quot;</strong> atau melalui menu <strong>Pengaturan Platform</strong> pada Portal Administrasi.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link to={environment === "Admin" ? "/admin/pengaturan" : "/portal"}>
                <Button variant="outline" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
                  Buka Konfigurasi Modul
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 1. DEDICATED PUBLIC VIEW FOR /cara-bergabung
  if (environment === "Public" && title.toLowerCase().includes("keanggotaan")) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12 text-left">
        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200/60 text-forest-800 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-forest-700" />
            <span>Panduan Resmi Anggota</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-ink-900 tracking-tight">
            Tata Cara & Syarat Keanggotaan Nusantara Maju
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
            Menjadi bagian dari koperasi konsumen berbasis gotong royong digital yang mandiri, berkeadilan, dan menyejahterakan anggota.
          </p>
        </div>

        {/* Header Illustration Card */}
        <div className="relative rounded-2xl overflow-hidden border border-ink-200 shadow-subtle aspect-[21/9] max-h-72">
          <img
            src="/images/public/05-cara-bergabung.webp"
            alt="Petugas koperasi mendampingi pendaftaran anggota baru"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-300">
              Prinsip Keanggotaan Terbuka
            </span>
            <p className="text-xs text-forest-100 mt-1 max-w-xl">
              Nusantara Maju membuka pintu keanggotaan bagi seluruh warga yang memenuhi persyaratan AD/ART tanpa membedakan suku, agama, dan golongan.
            </p>
          </div>
        </div>

        {/* 4 Langkah Bergabung */}
        <div className="space-y-6">
          <div className="border-b border-ink-200 pb-3">
            <h2 className="text-xl font-bold text-ink-900">Empat Langkah Menjadi Anggota</h2>
            <p className="text-xs text-ink-600 mt-0.5">Alur terstruktur dari registrasi hingga penerbitan Nomor Induk Koperasi</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5 border-ink-200 shadow-subtle flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-sm font-bold text-ink-900">Pengisian Formulir Digital</h3>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Lengkapi data identitas diri yang valid, domisili, bidang usaha, serta kontak aktif pada formulir pendaftaran daring.
                </p>
              </div>
            </Card>

            <Card className="p-5 border-ink-200 shadow-subtle flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-sm font-bold text-ink-900">Verifikasi Dokumen Identitas</h3>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Staf operasional memvalidasi kesesuaian berkas dan menerbitkan kode pelacakan pendaftaran mandiri calon anggota.
                </p>
              </div>
            </Card>

            <Card className="p-5 border-ink-200 shadow-subtle flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="text-sm font-bold text-ink-900">Komitmen Simpanan Pokok & Wajib</h3>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Penyetoran Simpanan Pokok ({formatIDR(savingsConfig.simpananPokokNominal)}) 1 kali dan Simpanan Wajib ({formatIDR(savingsConfig.simpananWajibBulanan)}/bln) sebagai bukti penyertaan modal awal.
                </p>
              </div>
            </Card>

            <Card className="p-5 border-ink-200 shadow-subtle flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <h3 className="text-sm font-bold text-ink-900">Penerbitan Nomor Anggota & Akses Portal</h3>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Setelah disetujui Pengurus, akun portal anggota aktif untuk mengakses layanan simpanan, pengajuan pinjaman, dan hak suara RAT.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Syarat & Ketentuan Keanggotaan */}
        <Card className="p-6 border-ink-200 shadow-subtle bg-white">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-forest-700" />
            <h3 className="text-base font-bold text-ink-900">Persyaratan Utama Calon Anggota</h3>
          </div>
          <ul className="space-y-3 text-xs text-ink-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>Warga Negara Indonesia (WNI) berusia minimal 18 tahun atau telah menikah.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>Memiliki Kartu Tanda Penduduk (KTP) yang sah dan berdomisili/berusaha di wilayah operasional koperasi.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>Menyetujui dan menyatakan tunduk pada Anggaran Dasar serta Anggaran Rumah Tangga (AD/ART) Nusantara Maju.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>Bersedia memenuhi kewajiban Simpanan Pokok awal dan Simpanan Wajib berkala tepat waktu.</span>
            </li>
          </ul>
        </Card>

        {/* Standardized Institutional CTA Banner */}
        <div className="rounded-2xl sm:rounded-3xl bg-forest-900 text-white p-8 sm:p-12 text-center space-y-4 shadow-lg border border-forest-800">
          <span className="inline-block text-xs font-bold text-forest-300 tracking-wider uppercase">
            MULAI SEKARANG
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Siap Menjadi Anggota Nusantara Maju?</h2>
          <p className="text-xs sm:text-sm text-forest-100 max-w-xl mx-auto leading-relaxed">
            Daftarkan diri Anda hari ini secara online dan pantau langsung proses verifikasi dokumen Anda secara real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/daftar" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="bg-forest-700 hover:bg-forest-800 text-white font-semibold w-full sm:w-auto px-6 border-0 shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
              >
                Daftar Menjadi Anggota
              </Button>
            </Link>
            <Link to="/layanan/simpanan" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="bg-transparent text-white hover:bg-forest-800/60 border-white/40 w-full sm:w-auto px-6"
              >
                Pelajari Layanan Simpanan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. DEDICATED PUBLIC VIEW FOR /transparansi
  if (environment === "Public" && title.toLowerCase().includes("transparansi")) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12 text-left">
        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200/60 text-forest-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Tata Kelola Terbuka</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-ink-900 tracking-tight">
            Transparansi & Akuntabilitas Publik
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
            Komitmen teguh Nusantara Maju dalam menjunjung tinggi keterbukaan informasi, kepatuhan audit, dan tata kelola koperasi yang profesional.
          </p>
        </div>

        {/* Header Illustration Card */}
        <div className="relative rounded-2xl overflow-hidden border border-ink-200 shadow-subtle aspect-[21/9] max-h-72">
          <img
            src="/images/public/07-transparansi.webp"
            alt="Suasana Rapat Anggota Tahunan dan audit pertanggungjawaban terbuka"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-300">
              Kedaulatan Anggota
            </span>
            <p className="text-xs text-forest-100 mt-1 max-w-xl">
              Setiap anggota berhak mengetahui posisi keuangan, perputaran simpanan, dan alokasi keuntungan usaha tahunan secara transparan.
            </p>
          </div>
        </div>

        {/* 4 Pilar Transparansi */}
        <div className="space-y-6">
          <div className="border-b border-ink-200 pb-3">
            <h2 className="text-xl font-bold text-ink-900">Empat Pilar Tata Kelola Akuntabel</h2>
            <p className="text-xs text-ink-600 mt-0.5">Mekanisme kelembagaan yang melindungi kepentingan dan kepemilikan modal anggota</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5 border-ink-200 shadow-subtle bg-white space-y-2">
              <div className="w-9 h-9 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900">Buku Mutasi Saldo Digital</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Setiap rupiah setoran, penarikan, dan perolehan bagi hasil simpanan tercatat dengan presisi dan dapat diakses mandiri oleh pemilik akun secara real-time.
              </p>
            </Card>

            <Card className="p-5 border-ink-200 shadow-subtle bg-white space-y-2">
              <div className="w-9 h-9 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900">Segregation of Duties (SoD)</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Pemisahan tegas fungsi pencatatan, verifikasi, otorisasi kas, dan audit independen. Tidak ada satu individu pun yang dapat menyetujui transaksi keuangannya sendiri.
              </p>
            </Card>

            <Card className="p-5 border-ink-200 shadow-subtle bg-white space-y-2">
              <div className="w-9 h-9 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900">Rapat Anggota Tahunan (RAT)</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Forum pertanggungjawaban tertinggi di mana Laporan Pertanggungjawaban (LPJ) pengurus dan pengawas diperiksa serta disahkan bersama dengan asas 1 Anggota = 1 Suara.
              </p>
            </Card>

            <Card className="p-5 border-ink-200 shadow-subtle bg-white space-y-2">
              <div className="w-9 h-9 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900">Audit Trail Sistematis</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Setiap tindakan penting dalam sistem platform diberi stempel waktu, identitas pengguna, dan log perubahan yang tidak dapat dimanipulasi secara sepihak.
              </p>
            </Card>
          </div>
        </div>

        {/* Standardized Institutional CTA Banner */}
        <div className="rounded-2xl sm:rounded-3xl bg-forest-900 text-white p-8 sm:p-12 text-center space-y-4 shadow-lg border border-forest-800">
          <span className="inline-block text-xs font-bold text-forest-300 tracking-wider uppercase">
            PELAJARI LEBIH LANJUT
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Ingin Mengetahui Lebih Dalam Mengenai Organisasi Kami?</h2>
          <p className="text-xs sm:text-sm text-forest-100 max-w-xl mx-auto leading-relaxed">
            Pelajari profil pengurus, pengawas, dasar hukum pendirian, serta visi jangka panjang Nusantara Maju.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/daftar" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="bg-forest-700 hover:bg-forest-800 text-white font-semibold w-full sm:w-auto px-6 border-0 shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
              >
                Daftar Menjadi Anggota
              </Button>
            </Link>
            <Link to="/tentang" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="bg-transparent text-white hover:bg-forest-800/60 border-white/40 w-full sm:w-auto px-6"
              >
                Profil & Tata Kelola
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. DEFAULT PLACEHOLDER FOR PORTAL / ADMIN (Development Roadmap)
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-left">
      <Card className="border-ink-200 shadow-subtle bg-white">
        <CardHeader className="bg-forest-50/40 border-b border-ink-100 pb-4">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <Badge variant="forest" size="sm">
              <Compass className="w-3 h-3 mr-1 inline" />
              Rencana Pengembangan
            </Badge>
            <span className="text-xs font-semibold text-ink-500 font-mono">
              Target Rilis: Phase {phasePlanned}
            </span>
          </div>
          <CardTitle className="text-xl text-ink-900">{title}</CardTitle>
          <CardDescription className="text-xs text-ink-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-xs text-ink-700 pt-5">
          <div className="p-4 bg-ink-50 rounded-lg border border-ink-200/60 flex items-start gap-3">
            <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-ink-900 block font-semibold">
                Status Rute & Desain Sistem Terintegrasi
              </strong>
              <p className="text-ink-600 leading-relaxed">
                Rute dan skema arsitektur informasi modul ini telah siap. Seluruh tata kelola RBAC, breadcrumbs, dan layout navigasi telah terhubung dengan design system Nusantara Maju.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link to={environment === "Admin" ? "/admin" : environment === "Public" ? "/" : "/portal"}>
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Kembali ke {environment === "Admin" ? "Dashboard Administrasi" : environment === "Public" ? "Beranda" : "Portal Anggota"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
