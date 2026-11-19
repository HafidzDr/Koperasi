import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  ChevronDown,
  CheckCircle2,
  Coins,
  Scale,
  Award,
  ArrowUpRight,
  Quote,
  Sprout,
  Landmark,
} from "lucide-react";

export const HomeView: React.FC = () => {
  const { savingsConfig } = useMembershipStore();

  // Accordion state for FAQ section
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const principles = [
    {
      title: "Keanggotaan Terbuka",
      desc: "Inklusif tanpa diskriminasi bagi seluruh masyarakat.",
      icon: Users,
    },
    {
      title: "Pengelolaan Demokratis",
      desc: "Satu anggota satu suara dalam RAT tahunan.",
      icon: Scale,
    },
    {
      title: "Partisipasi Berkeadilan",
      desc: "Bagi hasil SHU proporsional terhadap kontribusi.",
      icon: Coins,
    },
    {
      title: "Kemandirian Usaha",
      desc: "Otonom, mandiri, dan berorientasi kesejahteraan.",
      icon: Award,
    },
    {
      title: "Edukasi & Transparansi",
      desc: "Literasi finansial dan keterbukaan audit mutasi.",
      icon: ShieldCheck,
    },
  ];

  const stats = [
    {
      value: "30+",
      label: "Portofolio Usaha Produktif",
      desc: "Fasilitas pembiayaan riil bagi pelaku UMKM anggota",
    },
    {
      value: "Rp 4,5M+",
      label: "Simpanan Terkelola",
      desc: "Akumulasi saldo pokok, wajib, dan sukarela anggota",
    },
    {
      value: "100%",
      label: "Pencatatan Digital Terverifikasi",
      desc: "Sistem pencatatan terpadu dengan jejak audit akuntabel",
    },
    {
      value: "24/7",
      label: "Akses Layanan Mandiri",
      desc: "Pemantauan saldo dan jadwal angsuran setiap saat",
    },
  ];

  const faqItems = [
    {
      question: "Apa saja persyaratan untuk mendaftar sebagai anggota Nusantara Maju?",
      answer:
        "Warga Negara Indonesia, memiliki KTP yang sah, menyetujui Anggaran Dasar/Anggaran Rumah Tangga (AD/ART), serta menyetorkan Simpanan Pokok awal yang terkonfirmasi oleh staf koperasi melalui alur pendaftaran digital terverifikasi.",
    },
    {
      question: "Berapa nominal Simpanan Pokok dan Simpanan Wajib?",
      answer: `Berdasarkan kebijakan koperasi yang berlaku: Simpanan Pokok ditetapkan sebesar ${formatIDR(
        savingsConfig.simpananPokokNominal
      )} (disetor 1 kali saat pendaftaran disetujui). Simpanan Wajib ditetapkan sebesar ${formatIDR(
        savingsConfig.simpananWajibBulanan
      )} per bulan buku berjalan. Keduanya menjadi modal kepemilikan Anda bersama di koperasi.`,
    },
    {
      question: "Bagaimana ketentuan suku bunga, denda, dan plafon pinjaman?",
      answer:
        "Nusantara Maju menyediakan Pinjaman Modal Usaha Produktif dengan bunga flat 10,0% p.a. (tenor 6–36 bulan, plafon s.d. Rp 100 Jt) dan Pinjaman Konsumtif dengan bunga flat 12,0% p.a. (tenor 3–36 bulan, plafon s.d. Rp 50 Jt). Denda keterlambatan ditetapkan sebesar 0,5% per hari setelah grace period 3 hari. Syarat pengajuan: telah menjadi anggota aktif minimal 3 bulan.",
    },
    {
      question: "Kapan dan bagaimana Sisa Hasil Usaha (SHU) dibagikan?",
      answer:
        "SHU dibagikan setahun sekali setelah disahkan dalam Rapat Anggota Tahunan (RAT). Keuntungan dialokasikan secara adil berdasarkan porsi jasa modal (saldo simpanan) dan jasa usaha/transaksi anggota secara proporsional sesuai ketentuan AD/ART.",
    },
    {
      question: "Bagaimana keamanan saldo dan integritas data anggota dijamin?",
      answer:
        "Nusantara Maju menerapkan arsitektur fail-closed dengan Segregation of Duties (SoD) 3-tingkat (Staf Verifikator, Petugas Keuangan, dan Persetujuan Pengurus), pencegahan mutasi saldo ganda, audit trail digital sistematis, dan otorisasi berbasis peran (RBAC).",
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* =========================================================================
          1. HERO SECTION (Warm Modern Editorial Landscape)
         ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-forest-950 text-white min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center">
        {/* Full Photographic Background with High-Quality Contrast */}
        <div className="absolute inset-0">
          <img
            src="/images/public/01-beranda-hero.webp"
            alt="Aktivitas gotong royong dan kemitraan anggota koperasi Nusantara Maju"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle Institutional Overlays for Optimal Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/80 sm:via-forest-950/65 to-forest-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-transparent to-forest-950/30 sm:hidden" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-24 lg:pb-28 w-full">
          <div className="max-w-xl lg:max-w-2xl text-left">
            {/* Top Institutional Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-forest-400/40 bg-forest-900/80 text-forest-100 text-xs sm:text-sm font-medium tracking-wide mb-5 sm:mb-6 shadow-subtle backdrop-blur-sm">
              <Landmark className="w-4 h-4 text-forest-300" />
              <span>Nusantara Maju</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-forest-800 text-forest-200 uppercase tracking-wider">
                Koperasi Digital
              </span>
            </div>

            {/* Semantic H1 for SEO, Accessibility & Quality Gate */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] sm:leading-[1.08] break-words mb-5">
              Tumbuh Bersama, <br />
              <span className="text-forest-200">Menyejahterakan</span> Anggota.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-forest-100/95 leading-relaxed font-normal mb-8 sm:mb-9 max-w-xl">
              Platform koperasi terpercaya yang memadukan semangat gotong royong dengan tata kelola finansial modern, transparan, dan berkeadilan bagi seluruh anggota.
            </p>

            {/* Standardized Hero Action Buttons (CTA Pola Baku) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-10 sm:mb-12 w-full max-w-md sm:max-w-none">
              <Link to="/daftar" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto bg-forest-700 hover:bg-forest-800 text-white font-semibold px-7 shadow-md border-0"
                >
                  Daftar Menjadi Anggota
                </Button>
              </Link>
              <Link to="/layanan/simpanan" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/60 text-white hover:bg-white/10 font-medium px-7 backdrop-blur-sm"
                >
                  Pelajari Layanan Simpanan
                </Button>
              </Link>
            </div>

            {/* Bottom 3 Trust Indicators */}
            <div className="pt-6 sm:pt-7 border-t border-forest-800/80 flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-7 text-forest-100">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-forest-300 shrink-0" strokeWidth={2} />
                <span className="text-xs sm:text-sm font-medium tracking-tight text-white/95 whitespace-nowrap">
                  Layanan Anggota Terpadu
                </span>
              </div>
              <div className="hidden lg:block w-px h-4 bg-forest-700" />
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-forest-300 shrink-0" strokeWidth={2} />
                <span className="text-xs sm:text-sm font-medium tracking-tight text-white/95 whitespace-nowrap">
                  Tata Kelola Transparan
                </span>
              </div>
              <div className="hidden lg:block w-px h-4 bg-forest-700" />
              <div className="flex items-center gap-2.5">
                <Sprout className="w-5 h-5 text-forest-300 shrink-0" strokeWidth={2} />
                <span className="text-xs sm:text-sm font-medium tracking-tight text-white/95 whitespace-nowrap">
                  Ekonomi Gotong Royong
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. COOPERATIVE PRINCIPLES STRIP (Gotong Royong & Good Governance)
         ========================================================================= */}
      <section className="bg-white border-b border-ink-200 py-6 sm:py-7 shadow-subtle relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 sm:gap-6 lg:gap-8">
            {principles.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-start space-y-2 text-left">
                  <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-200/50 flex items-center justify-center text-forest-800 shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-ink-900">{item.title}</h3>
                    <p className="text-[11px] sm:text-xs text-ink-600 leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Body Content Sections with Balanced Editorial Pacing */}
      <div className="space-y-16 sm:space-y-24 py-12 sm:py-16">

        {/* =========================================================================
            3. ASYMMETRIC ABOUT SECTION (Editorial Split Layout)
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (5 Cols): Metric Card + Institutional Photo */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-forest-50 border border-forest-200/60 shadow-subtle">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-forest-900 tracking-tight font-mono">
                    100%
                  </span>
                  <Badge variant="forest" size="sm">
                    Akuntabel
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-ink-900 mt-1">Transparansi Finansial & Tata Kelola Digital</h4>
                <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
                  Setiap mutasi simpanan, pengajuan pinjaman, dan alur persetujuan tercatat dengan jejak audit digital yang dapat dipantau langsung oleh anggota.
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-ink-200 shadow-subtle aspect-[4/3]">
                <img
                  src="/images/public/02-tentang-nusantara-maju.webp"
                  alt="Pertemuan musyawarah dan kerja sama pengurus serta anggota Nusantara Maju"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column (7 Cols): Editorial Narrative & Values */}
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-block text-xs font-bold text-forest-700 tracking-wider uppercase">
                TENTANG NUSANTARA MAJU
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900 tracking-tight leading-snug">
                Membangun Kedaulatan Finansial Keluarga Melalui Semangat Kebersamaan
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                Nusantara Maju hadir sebagai wadah ekonomi gotong royong yang berorientasi pada kemakmuran bersama. Kami percaya bahwa kekuatan finansial sejati lahir dari rasa saling percaya, kedisiplinan menabung, dan akses permodalan yang adil tanpa jeratan biaya tersembunyi.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-ink-900">Demokratis & Satu Anggota Satu Suara</h4>
                    <p className="text-xs text-ink-600 leading-relaxed">
                      Kedaulatan tertinggi berada di tangan anggota melalui Rapat Anggota Tahunan (RAT) untuk menentukan arah kebijakan strategis organisasi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-ink-900">Bagi Hasil SHU yang Proporsional</h4>
                    <p className="text-xs text-ink-600 leading-relaxed">
                      Keuntungan usaha tahunan dibagikan kembali kepada anggota berdasarkan porsi jasa modal dan aktivitas transaksi secara transparan sesuai AD/ART.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-ink-900">Pemberdayaan Sektor Riil & UMKM</h4>
                    <p className="text-xs text-ink-600 leading-relaxed">
                      Mendukung pembiayaan usaha produktif anggota mulai dari pedagang kecil, pengrajin, petani, hingga wirausaha mandiri keluarga.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link to="/tentang">
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Profil & Tata Kelola
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. STATISTIK ORGANISASI & PORTOFOLIO
           ========================================================================= */}
        <section className="bg-ink-100/70 border-y border-ink-200/80 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-white border border-ink-200/70 shadow-subtle flex flex-col text-left"
                >
                  <span className="text-3xl sm:text-4xl font-extrabold text-forest-800 tracking-tight font-mono tabular-nums mb-1.5">
                    {s.value}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-ink-900 mb-1">{s.label}</span>
                  <span className="text-[11px] sm:text-xs text-ink-600 leading-relaxed">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. SERVICES & SOLUTIONS GRID (#layanan)
           ========================================================================= */}
        <section id="layanan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-block text-xs font-bold text-forest-700 tracking-wider uppercase mb-1">
                PRODUK & LAYANAN UNGGULAN
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                Solusi Keuangan Berkeadilan untuk Anggota
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 mt-1 max-w-xl leading-relaxed">
                Didesain khusus untuk memenuhi kebutuhan permodalan produktif dan penyimpanan dana yang aman serta terkelola secara profesional.
              </p>
            </div>
            <Link to="/cara-bergabung">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Panduan Bergabung
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Card 1: Simpanan */}
            <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden shadow-subtle flex flex-col hover:border-forest-600/40 transition-all">
              <div className="relative h-48 overflow-hidden bg-ink-100">
                <img
                  src="/images/public/03-simpanan.webp"
                  alt="Anggota mengakses buku simpanan digital koperasi via perangkat mobile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-forest-800 shadow-subtle">
                  Bunga Sukarela 2,0% p.a.*
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-ink-900 mb-1">Simpanan Anggota</h3>
                  <p className="text-xs text-ink-600 leading-relaxed mb-3">
                    Simpanan Pokok ({formatIDR(savingsConfig.simpananPokokNominal)}), Simpanan Wajib ({formatIDR(savingsConfig.simpananWajibBulanan)}/bln), serta Simpanan Sukarela yang fleksibel disetor & ditarik mulai Rp 10.000.
                  </p>
                  <ul className="text-xs text-ink-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>Buku simpanan digital mandiri real-time</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>Bebas biaya administrasi bulanan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>Perhitungan jasa modal SHU tahunan proporsional</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-ink-100">
                  <Link to="/layanan/simpanan" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span>Detail Produk Simpanan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Service Card 2: Pinjaman */}
            <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden shadow-subtle flex flex-col hover:border-forest-600/40 transition-all">
              <div className="relative h-48 overflow-hidden bg-ink-100">
                <img
                  src="/images/public/04-pinjaman.webp"
                  alt="Usaha produktif anggota yang didukung pembiayaan modal koperasi"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-forest-800 shadow-subtle">
                  Bunga Flat 10,0% p.a.*
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-ink-900 mb-1">Pinjaman Modal Usaha</h3>
                  <p className="text-xs text-ink-600 leading-relaxed mb-3">
                    Pembiayaan produktif UMKM anggota (Plafon s.d. Rp 100 Jt) & konsumtif (s.d. Rp 50 Jt) dengan skema angsuran flat dan denda 0,5%/hari setelah grace period 3 hari.
                  </p>
                  <ul className="text-xs text-ink-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>Kalkulator simulasi pinjaman instan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>Tenor fleksibel 3 hingga 36 bulan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>Syarat keanggotaan aktif minimal 3 bulan</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-ink-100">
                  <Link to="/layanan/pinjaman" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span>Simulasi Pinjaman Modal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Service Card 3: SHU & RAT */}
            <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden shadow-subtle flex flex-col hover:border-forest-600/40 transition-all">
              <div className="relative h-48 overflow-hidden bg-ink-100">
                <img
                  src="/images/public/07-transparansi.webp"
                  alt="Musyawarah Rapat Anggota Tahunan (RAT) dan pertanggungjawaban terbuka"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-forest-800 shadow-subtle">
                  1 Anggota 1 Suara
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-ink-900 mb-1">Sisa Hasil Usaha (SHU)</h3>
                  <p className="text-xs text-ink-600 leading-relaxed mb-3">
                    Pembagian keuntungan tahunan berprinsip gotong royong: jasa modal dan jasa transaksi anggota dibagikan secara adil dan terbuka melalui RAT.
                  </p>
                  <ul className="text-xs text-ink-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>Presensi kuorum Rapat Anggota Tahunan digital</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>Rekapitulasi hak dividen SHU rinci</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>Laporan pertanggungjawaban terbuka pengurus</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-ink-100">
                  <Link to="/transparansi" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span>Transparansi & Tata Kelola</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. ALUR TIGA LANGKAH BERGABUNG (Workflow)
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: 3 Step Cards */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="inline-block text-xs font-bold text-forest-700 tracking-wider uppercase mb-1">
                  ALUR PENDAFTARAN
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                  Tiga Langkah Mudah Menjadi Bagian dari Nusantara Maju
                </h2>
                <p className="text-xs sm:text-sm text-ink-600 mt-1 leading-relaxed">
                  Proses registrasi terstruktur dan cepat yang menjamin kenyamanan anggota dan kepatuhan hukum organisasi.
                </p>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-5 rounded-xl border border-ink-200 bg-white shadow-subtle flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 font-bold text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Registrasi Identitas & Komitmen Simpanan Pokok</h3>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                      Lengkapi formulir online dengan mengisi data diri yang sah serta menyetujui komitmen Simpanan Pokok ({formatIDR(savingsConfig.simpananPokokNominal)}) dan AD/ART koperasi.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-xl border border-forest-600/40 bg-forest-50/50 shadow-subtle flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-forest-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Verifikasi Dokumen & Penerbitan Nomor Anggota</h3>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                      Staf operasional memverifikasi kelengkapan berkas dan pengurus mengesahkan status keanggotaan untuk menerbitkan Nomor Induk Koperasi resmi.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-xl border border-ink-200 bg-white shadow-subtle flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 font-bold text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Aktivasi Penuh Layanan Simpanan & Modal</h3>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                      Akses portal mandiri untuk memantau mutasi buku tabungan, mengajukan fasilitas pinjaman modal usaha, dan menerima dividen SHU tahunan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Photo Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-ink-200 shadow-md aspect-[4/3]">
                <img
                  src="/images/public/05-cara-bergabung.webp"
                  alt="Petugas koperasi memberikan pendampingan pendaftaran dan konsultasi anggota"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-forest-300">
                    Layanan Pendampingan Anggota
                  </span>
                  <p className="text-xs text-white/90 mt-1 leading-relaxed">
                    Petugas koperasi siap mendampingi proses administrasi, konsultasi pinjaman, dan aktivasi keanggotaan Anda dengan ramah dan transparan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. MEMBER TESTIMONIALS (Community Voice)
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="bg-forest-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-14 shadow-lg border border-forest-800">
            <div className="max-w-2xl mb-10">
              <span className="inline-block text-xs font-bold text-forest-300 tracking-wider uppercase mb-1">
                SUARA ANGGOTA
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Aspirasi Anggota & Pelaku Usaha Binaan
              </h2>
              <p className="text-xs sm:text-sm text-forest-100/90 mt-2 leading-relaxed">
                Pengalaman nyata anggota dalam memanfaatkan keterbukaan informasi dan fasilitas permodalan di Nusantara Maju.
              </p>
            </div>

            {/* 2 Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Testimonial 1 */}
              <div className="bg-forest-800/80 rounded-2xl p-6 border border-forest-700/80 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <Quote className="w-6 h-6 text-forest-300/60" />
                  <p className="text-xs sm:text-sm text-forest-50 leading-relaxed italic">
                    &quot;Pengajuan pinjaman modal usaha di Nusantara Maju sangat jelas dan transparan. Tidak ada potongan tersembunyi yang membingungkan. Simulasi angsuran di portal sangat membantu saya merencanakan arus kas usaha.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3.5 pt-4 border-t border-forest-700/60">
                  <img
                    src="/images/landing/testimonial-member-1.jpg"
                    alt="Budi Santoso, anggota pengelola hasil usaha"
                    className="w-12 h-12 rounded-full object-cover border-2 border-forest-500 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Budi Santoso</h3>
                    <p className="text-xs text-forest-200">Anggota Aktif & Pelaku Agribisnis</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-forest-800/80 rounded-2xl p-6 border border-forest-700/80 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <Quote className="w-6 h-6 text-forest-300/60" />
                  <p className="text-xs sm:text-sm text-forest-50 leading-relaxed italic">
                    &quot;Buku simpanan digital membuat saya sangat tenang karena setiap rupiah simpanan wajib dan sukarela dapat saya pantau dari ponsel. Saat pembagian SHU tahun lalu, laporannya sangat rapi dan adil.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3.5 pt-4 border-t border-forest-700/60">
                  <img
                    src="/images/landing/testimonial-member-2.jpg"
                    alt="Siti Rahmawati, anggota pengusaha kuliner binaan"
                    className="w-12 h-12 rounded-full object-cover border-2 border-forest-500 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Siti Rahmawati</h3>
                    <p className="text-xs text-forest-200">Anggota Aktif & Pemilik Usaha Kuliner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. FAQ ACCORDION SECTION (#faq)
           ========================================================================= */}
        <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Heading, description, meeting image */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="inline-block text-xs font-bold text-forest-700 tracking-wider uppercase mb-1">
                  PUSAT BANTUAN
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                  Pertanyaan yang Sering Diajukan
                </h2>
                <p className="text-xs sm:text-sm text-ink-600 mt-2 leading-relaxed">
                  Ketahui lebih banyak mengenai ketentuan keanggotaan, simpanan, pembiayaan, dan mekanisme tata kelola di Nusantara Maju.
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-ink-200 shadow-subtle aspect-[4/3]">
                <img
                  src="/images/public/09-kolaborasi-anggota.webp"
                  alt="Musyawarah anggota koperasi dalam suasana kekeluargaan"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 right-4 text-[11px] text-white/95 font-medium leading-relaxed">
                  Musyawarah mufakat dan keterbukaan informasi adalah pondasi utama Nusantara Maju.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-ink-50 border border-ink-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-ink-900 block">Butuh informasi lebih lanjut?</span>
                  <span className="text-[11px] text-ink-600">Pelajari profil dan tata kelola sekretariat kami.</span>
                </div>
                <Link to="/tentang">
                  <Button variant="outline" size="sm">
                    Hubungi Sekretariat
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Accessible FAQ Accordion */}
            <div className="lg:col-span-7 space-y-3">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-ink-200 bg-white overflow-hidden shadow-subtle transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-ink-900 hover:text-forest-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
                      aria-expanded={isOpen}
                    >
                      <span className="text-xs sm:text-sm font-semibold">{item.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-forest-700" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-ink-600 leading-relaxed border-t border-ink-100 bg-ink-50/40">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. CURVED FOREST GREEN CTA SECTION (Resolusi Masalah A & B)
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 text-left">
          <div className="relative rounded-2xl sm:rounded-3xl bg-forest-900 text-white overflow-hidden shadow-lg border border-forest-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-12 lg:p-14">
              {/* Left Content (8 Cols) */}
              <div className="md:col-span-8 space-y-4">
                <span className="inline-block text-xs font-bold text-forest-300 tracking-wider uppercase">
                  BERGABUNG BERSAMA KAMI
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
                  Siap Memulai Langkah Menuju Kemandirian Finansial?
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-forest-100/90 leading-relaxed max-w-xl">
                  Bergabunglah bersama ribuan anggota aktif Nusantara Maju. Pendaftaran online praktis, layanan simpanan transparan, dan akses pembiayaan yang mendukung kemajuan usaha keluarga.
                </p>

                {/* Pola CTA Baku Terpadu (Masalah A & B Selesai 100%) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link to="/daftar" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="primary"
                      className="w-full sm:w-auto bg-forest-700 hover:bg-forest-800 text-white font-semibold px-6 shadow-md border-0"
                      rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
                    >
                      Daftar Menjadi Anggota
                    </Button>
                  </Link>
                  <Link to="/layanan/simpanan" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto bg-transparent hover:bg-forest-800/60 text-white border-white/50 px-6"
                    >
                      Pelajari Layanan Simpanan
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Photo (4 Cols) */}
              <div className="md:col-span-4 flex justify-center md:justify-end">
                <div className="relative rounded-2xl overflow-hidden border-2 border-forest-700/80 shadow-md w-full max-w-xs aspect-square">
                  <img
                    src="/images/public/10-tumbuh-bersama.webp"
                    alt="Petugas dan anggota koperasi tersenyum menyambut anggota baru"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="inline-block text-[11px] font-semibold text-white/95 bg-forest-950/80 px-2.5 py-1 rounded backdrop-blur-sm">
                      Keluarga Besar Nusantara Maju
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
