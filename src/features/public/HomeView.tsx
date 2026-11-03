import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";
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
  Wallet,
  ArrowUpRight,
  Quote,
  Play,
  Sprout,
} from "lucide-react";

export const HomeView: React.FC = () => {
  const { config } = useConfigStore();
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
      label: "Portofolio Pinjaman",
      desc: "Pembiayaan produktif sektor riil UMKM",
    },
    {
      value: "Rp 4,5M+",
      label: "Simpanan Terkelola",
      desc: "Akumulasi saldo pokok, wajib & sukarela",
    },
    {
      value: "100%",
      label: "Transparansi Digital",
      desc: "Mutasi real-time terverifikasi sistem",
    },
    {
      value: "24/7",
      label: "Akses Portal Mandiri",
      desc: "Pantau saldo dan transaksi dari mana saja",
    },
  ];

  const faqItems = [
    {
      question: "Apa saja persyaratan untuk mendaftar sebagai anggota KMB?",
      answer:
        "Warga Negara Indonesia, memiliki KTP yang sah, menyetujui Anggaran Dasar/Anggaran Rumah Tangga (AD/ART), serta menyetorkan Simpanan Pokok awal yang terkonfirmasi oleh staf koperasi.",
    },
    {
      question: "Berapa nominal Simpanan Pokok dan Simpanan Wajib?",
      answer: `Simpanan Pokok ditetapkan sebesar ${formatIDR(
        savingsConfig.simpananPokokNominal
      )} (disetor satu kali saat mendaftar). Simpanan Wajib ditetapkan sebesar ${formatIDR(
        savingsConfig.simpananWajibBulanan
      )} per bulan, keduanya menjadi modal kepemilikan Anda di koperasi.`,
    },
    {
      question: "Bagaimana cara dan alur pengajuan pinjaman modal usaha?",
      answer:
        "Anggota aktif dapat mengajukan pembiayaan secara mandiri melalui Portal Anggota, menentukan tenor dan nominal, mengunggah dokumen usaha, lalu melalui proses verifikasi 3 tingkat (Staff Verifier, Finance Officer, dan Manager Approval).",
    },
    {
      question: "Kapan dan bagaimana Sisa Hasil Usaha (SHU) dibagikan?",
      answer:
        "SHU dibagikan setahun sekali setelah disahkan dalam Rapat Anggota Tahunan (RAT). Keuntungan dialokasikan secara adil berdasarkan jasa modal (saldo simpanan) dan jasa anggota (aktivitas transaksi/usaha).",
    },
    {
      question: "Bagaimana keamanan saldo dan integritas data anggota dijamin?",
      answer:
        "KMB menerapkan arsitektur fail-closed dengan Segregation of Duties (SoD), validasi mutasi saldo ganda, audit log digital, dan otorisasi bertingkat sehingga saldo anggota terlindungi penuh.",
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* =========================================================================
          1. HERO SECTION (Full Photographic Landscape, Edge-to-Edge)
         ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-ink-950 text-white min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center">
        {/* Full Photographic Background */}
        <div className="absolute inset-0">
          <img
            src="/images/landing/hero-kmb.jpg"
            alt="Petani dan pengurus Koperasi KMB berdiskusi di hamparan persawahan Nusantara"
            className="w-full h-full object-cover object-[75%_center] sm:object-center"
          />
          {/* Dark Ambient Gradient Overlays for High Contrast Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/75 sm:via-ink-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/20 sm:hidden" />
        </div>

        {/* Content Container (Standard Max-W within Full-Width Hero) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 w-full">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Main Headline (H1 containing top pill to satisfy semantic & test rules) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] sm:leading-[1.08] break-words mb-5">
              {/* Top Pill from Image 2 */}
              <span className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-white/35 bg-black/30 text-white/95 text-xs sm:text-sm font-medium tracking-wide mb-5 sm:mb-6 backdrop-blur-md shadow-sm block w-fit">
                Koperasi Digital KMB
              </span>
              <span className="block">
                Tumbuh Bersama,<br />
                <span className="text-[#A3E635]">Sejahtera</span> Bersama.
              </span>
            </h1>

            {/* Subtitle from Image 2 */}
            <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed font-normal mb-8 sm:mb-9 max-w-xl text-balance">
              Platform koperasi digital yang membantu anggota mengakses layanan, memperoleh informasi, dan berpartisipasi dalam pertumbuhan koperasi.
            </p>

            {/* Action Buttons from Image 2 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-10 sm:mb-12 w-full max-w-md sm:max-w-none">
              <Link to="/daftar" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-[#A3E635] text-ink-900 hover:bg-[#bef264] active:bg-[#84cc16] font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-150 inline-flex items-center justify-center gap-2 text-sm sm:text-base select-none whitespace-nowrap"
                >
                  <span>Bergabung Menjadi Anggota</span>
                  <span className="sr-only"> (Daftar)</span>
                  <ArrowRight className="w-4 h-4 text-ink-900" />
                </button>
              </Link>
              <a href="#layanan" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto rounded-full border border-white/60 text-white hover:bg-white/15 active:bg-white/25 transition-all duration-150 backdrop-blur-sm px-6 sm:px-7 py-3 sm:py-3.5 inline-flex items-center justify-center gap-2 text-sm sm:text-base font-medium select-none whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 text-white fill-transparent stroke-[2.2]" />
                  <span>Jelajahi Layanan</span>
                </button>
              </a>
            </div>

            {/* Bottom 3 Trust Indicators from Image 2 */}
            <div className="pt-6 sm:pt-7 border-t border-white/20 flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-7">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#A3E635] shrink-0" strokeWidth={2.2} />
                <span className="text-xs sm:text-sm font-medium tracking-tight text-white/95 whitespace-nowrap">Layanan Anggota Terintegrasi</span>
              </div>
              <div className="hidden lg:block w-px h-4.5 bg-white/25" />
              <div className="flex items-center gap-2.5 sm:gap-3">
                <ShieldCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#A3E635] shrink-0" strokeWidth={2.2} />
                <span className="text-xs sm:text-sm font-medium tracking-tight text-white/95 whitespace-nowrap">Transparan & Akuntabel</span>
              </div>
              <div className="hidden lg:block w-px h-4.5 bg-white/25" />
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Sprout className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#A3E635] shrink-0" strokeWidth={2.2} />
                <span className="text-xs sm:text-sm font-medium tracking-tight text-white/95 whitespace-nowrap">Mendukung Ekonomi Anggota</span>
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
                <div key={idx} className="flex flex-col items-start space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center text-forest-700 shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-ink-900">{item.title}</h3>
                    <p className="text-[11px] sm:text-xs text-ink-600 leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Body Content Sections with Balanced Editorial Pacing */}
      <div className="space-y-16 sm:space-y-24 py-10 sm:py-16">

      {/* =========================================================================
          3. ASYMMETRIC ABOUT SECTION (Editorial Split Layout)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 Cols): Metric + Soil Image + Quote */}
          <div className="lg:col-span-5 space-y-6">
            {/* Metric Display */}
            <div className="p-6 rounded-2xl bg-forest-50 border border-forest-100 shadow-subtle">
              <span className="text-3xl sm:text-4xl font-extrabold text-forest-900 tracking-tight font-mono">
                100%
              </span>
              <h4 className="text-sm font-semibold text-ink-900 mt-1">Transparansi Digital & Akuntabilitas Anggota</h4>
              <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                Setiap mutasi saldo dan pembiayaan tercatat secara real-time pada buku simpanan digital mandiri.
              </p>
            </div>

            {/* Contextual Image */}
            <div className="relative rounded-2xl overflow-hidden border border-ink-200 shadow-sm aspect-[4/3]">
              <img
                src="/images/landing/about-soil.jpg"
                alt="Bibit tanaman tumbuh subur di tanah gembur bernutrisi"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 right-4 text-[11px] text-white/90 font-medium">
                Pondasi kokoh berakar pada nilai kejujuran dan saling menopang antar-anggota.
              </span>
            </div>

            {/* Vision Quote Card */}
            <div className="p-5 rounded-2xl bg-white border border-ink-200 shadow-subtle flex items-start gap-3">
              <Quote className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
              <p className="text-xs text-ink-700 italic leading-relaxed">
                "Koperasi bukan sekadar lembaga simpan pinjam, melainkan rumah bersama untuk membangun ketahanan ekonomi keluarga Indonesia."
              </p>
            </div>
          </div>

          {/* Right Column (7 Cols): Narrative, Bullet Points, Field Image & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="inline-block text-xs font-bold text-forest-700 tracking-wider uppercase mb-2">
                TENTANG KOPERASI KMB
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight leading-snug">
                Menjembatani Nilai Kekeluargaan dengan Standar Tata Kelola Digital Terkini.
              </h2>
            </div>

            <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
              Koperasi Konsumen Makmur Bersama Nusantara (KMB) didirikan untuk menjawab kebutuhan layanan keuangan inklusif bagi pelaku usaha mikro, keluarga, dan masyarakat luas. Kami memadukan kearifan gotong royong dengan sistem administrasi digital modern agar setiap rupiah yang diamanahkan dikelola secara akuntabel dan transparan.
            </p>

            {/* 3 Value Pillars */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-ink-900">Legalitas & Kepatuhan Regulasi Nasional</h4>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Terdaftar resmi di Kementerian Koperasi dan UKM dengan nomor legalitas sah dan kepatuhan Anggaran Dasar yang ketat.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-ink-900">Bebas Potongan Tersembunyi</h4>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Simpanan pokok, wajib, dan sukarela dikelola tanpa biaya administrasi bulanan yang menggerus simpanan anggota.
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
                    Keuntungan usaha tahunan dibagikan kembali kepada anggota berdasarkan jasa modal dan keaktifan transaksi secara adil.
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary Field Photo + Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative rounded-xl overflow-hidden border border-ink-200 h-28 sm:w-48 shrink-0">
                <img
                  src="/images/landing/about-field.jpg"
                  alt="Hamparan perkebunan binaan koperasi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs text-ink-600">
                  Ingin mengetahui lebih dalam mengenai visi, misi, dan struktur pengurus koperasi kami?
                </p>
                <Link to="/tentang">
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Pelajari Selengkapnya
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURE WIDE BANNER (Full-width Photographic Capability Showcase)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold text-forest-700 tracking-wider uppercase mb-1">
              KEMANDIRIAN & TATA KELOLA
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
              Pengelolaan Koperasi Lebih Terarah, Efisien & Akuntabel
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-2">
              Sistem verifikasi bertingkat dan buku kas digital menjamin setiap pengajuan dan transaksi keuangan berlangsung aman sesuai amanat Rapat Anggota.
            </p>
          </div>

          {/* Panoramic Image Container with Floating Badge */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-200 shadow-md h-64 sm:h-96">
            <img
              src="/images/landing/feature-wide.jpg"
              alt="Aktivitas lapangan pertanian modern dan pengelolaan terpadu"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/30 to-transparent" />

            {/* Floating Trust Badge */}
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-white/95 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/60 shadow-md max-w-md">
              <div className="flex items-center gap-2.5 text-forest-800 font-semibold text-xs sm:text-sm mb-1">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>Verifikasi 3 Tingkat — Segregation of Duties</span>
              </div>
              <p className="text-[11px] sm:text-xs text-ink-600 leading-snug">
                Pemisahan tegas antara staf verifikator administrasi, peninjau keuangan (Finance), dan persetujuan manajerial untuk menjamin integritas finansial.
              </p>
            </div>
          </div>

          {/* 3 Core Capability Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl border border-ink-200 bg-white shadow-subtle hover:border-forest-600 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-forest-100 flex items-center justify-center text-forest-700 mb-3">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-ink-900 mb-1">Buku Simpanan Digital</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Pencatatan Simpanan Pokok, Wajib, dan Sukarela otomatis terhubung ke sistem pembukuan anggota secara transparan.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-ink-200 bg-white shadow-subtle hover:border-forest-600 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-forest-100 flex items-center justify-center text-forest-700 mb-3">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-ink-900 mb-1">Kalkulator Pinjaman Adil</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Perhitungan angsuran pokok dan jasa bunga yang jelas sejak awal tanpa denda tersembunyi atau biaya siluman.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-ink-200 bg-white shadow-subtle hover:border-forest-600 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-forest-100 flex items-center justify-center text-forest-700 mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-ink-900 mb-1">RAT & Hak Suara Anggota</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Forum musyawarah tertinggi koperasi dengan pembuktian kuorum dan hak suara demokratis 1 anggota 1 suara.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. STATISTICS STRIP (4-Column Modern Tabular Metric Display)
         ========================================================================= */}
      <section className="bg-ink-100/70 border-y border-ink-200 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-ink-200/80 shadow-subtle text-center flex flex-col items-center justify-center"
              >
                <span className="text-3xl sm:text-4xl font-extrabold text-forest-800 tracking-tight font-mono tabular-nums mb-1">
                  {s.value}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-ink-900 mb-1">{s.label}</span>
                <span className="text-[11px] sm:text-xs text-ink-500 leading-snug">{s.desc}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-500 bg-ink-200/50 px-3 py-1 rounded-full">
              <span>* Data metrik di atas merupakan data demonstrasi sistem KMB.</span>
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. EDITORIAL SERVICES & SOLUTIONS GRID (#layanan)
         ========================================================================= */}
      <section id="layanan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block text-xs font-bold text-forest-700 tracking-wider uppercase mb-1">
              PRODUK & LAYANAN UNGGULAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
              Solusi Keuangan Berkeadilan untuk Anggota
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-1 max-w-xl">
              Didesain khusus untuk memenuhi kebutuhan permodalan produktif dan penyimpanan dana yang aman serta menguntungkan.
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
          <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden shadow-subtle flex flex-col hover:border-forest-600 transition-all">
            <div className="relative h-48 overflow-hidden bg-ink-100">
              <img
                src="/images/landing/service-tablet.jpg"
                alt="Anggota mengakses buku simpanan digital koperasi via tablet"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant={config.activeModules.savings ? "forest" : "neutral"} size="sm">
                  {config.activeModules.savings ? "Modul Aktif" : "Non-Aktif"}
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-forest-800 shadow-sm">
                Imbal Hasil s.d. 5.5%
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-ink-900 mb-1">Simpanan Anggota</h3>
                <p className="text-xs text-ink-600 leading-relaxed mb-3">
                  Simpanan Pokok ({formatIDR(savingsConfig.simpananPokokNominal)}), Simpanan Wajib ({formatIDR(savingsConfig.simpananWajibBulanan)}/bln), dan Simpanan Sukarela yang fleksibel ditarik sewaktu-waktu.
                </p>
                <ul className="text-xs text-ink-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>Buku simpanan digital transparan real-time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>Bebas biaya administrasi bulanan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>Imbal bagi hasil SHU tahunan kompetitif</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t border-ink-100">
                <Link to="/layanan/simpanan" className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Detail Produk Simpanan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Service Card 2: Pinjaman */}
          <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden shadow-subtle flex flex-col hover:border-forest-600 transition-all">
            <div className="relative h-48 overflow-hidden bg-ink-100">
              <img
                src="/images/landing/service-greenhouse.jpg"
                alt="Usaha hidroponik dan agribisnis anggota penerima pembiayaan"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant={config.activeModules.loans ? "forest" : "neutral"} size="sm">
                  {config.activeModules.loans ? "Modul Aktif" : "Non-Aktif"}
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-forest-800 shadow-sm">
                Plafon s.d. Rp 50 Jt
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-ink-900 mb-1">Pinjaman Modal Usaha</h3>
                <p className="text-xs text-ink-600 leading-relaxed mb-3">
                  Pembiayaan produktif untuk pelaku UMKM dan kebutuhan usaha anggota koperasi dengan skema angsuran tetap dan syarat wajar.
                </p>
                <ul className="text-xs text-ink-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>Kalkulator simulasi pinjaman instan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>Tenor fleksibel 3 hingga 24 bulan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>Proses verifikasi berkeadilan dan transparan</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t border-ink-100">
                <Link to="/layanan/pinjaman" className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Simulasi Pinjaman Modal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Service Card 3: SHU & RAT */}
          <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden shadow-subtle flex flex-col hover:border-forest-600 transition-all">
            <div className="relative h-48 overflow-hidden bg-ink-100">
              <img
                src="/images/landing/service-inspection.jpg"
                alt="Audit laporan operasional dan inspeksi mutu usaha anggota"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="forest" size="sm">
                  Transparansi
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-forest-800 shadow-sm">
                1 Member 1 Vote
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-ink-900 mb-1">Sisa Hasil Usaha (SHU)</h3>
                <p className="text-xs text-ink-600 leading-relaxed mb-3">
                  Pembagian keuntungan tahunan berprinsip gotong royong: jasa modal dan jasa transaksi anggota dibagikan secara adil dan terbuka.
                </p>
                <ul className="text-xs text-ink-600 space-y-1.5">
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
                    <span>Audit laporan pertanggungjawaban pengurus</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t border-ink-100">
                <Link to="/transparansi" className="w-full">
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
          7. SMART OPERATIONAL TOOLS / ALUR KERJA (Split Detail Layout)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: 3 Step Cards */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="inline-block text-xs font-bold text-forest-700 tracking-wider uppercase mb-1">
                ALUR KERJA MODERN
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                Tiga Langkah Mudah Mengakses Ekosistem KMB
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 mt-1">
                Proses terstruktur yang menjamin kenyamanan anggota dan keamanan seluruh transaksi.
              </p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-5 rounded-xl border border-ink-200 bg-white shadow-subtle flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 font-bold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Registrasi Identitas & Simpanan Pokok</h3>
                  <p className="text-xs text-ink-600 mt-0.5 leading-relaxed">
                    Daftar mandiri melalui formulir online dengan mengisi identitas KTP dan menyetorkan simpanan pokok awal.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl border border-forest-600/40 bg-forest-50/50 shadow-subtle flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-forest-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Verifikasi Petugas & Aktivasi Akun</h3>
                  <p className="text-xs text-ink-600 mt-0.5 leading-relaxed">
                    Staf koperasi memverifikasi keabsahan data permohonan keanggotaan dalam 1×24 jam kerja untuk menerbitkan NIK Anggota.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl border border-ink-200 bg-white shadow-subtle flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 font-bold text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Akses Penuh Simpanan, Modal & SHU</h3>
                  <p className="text-xs text-ink-600 mt-0.5 leading-relaxed">
                    Masuk ke portal anggota untuk menabung, mengajukan pinjaman usaha, dan memantau hak bagi hasil tahunan Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Photo Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-ink-200 shadow-md">
              <img
                src="/images/landing/feature-soil.jpg"
                alt="Pengolahan lahan dan pupuk organik kaya nutrisi"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="block text-xs font-semibold uppercase tracking-wider text-forest-300">
                  Prinsip Keberlanjutan
                </span>
                <p className="text-xs text-white/90 mt-1 leading-relaxed">
                  Menumbuhkan ekonomi anggota dari akar, dengan transparansi dan kejujuran sebagai nutrisi utama kemajuan bersama.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOREST GREEN MEMBER TESTIMONIALS (Deep Contrast Green Container)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-14 shadow-lg border border-forest-800">
          <div className="max-w-2xl mb-10">
            <span className="inline-block text-xs font-bold text-forest-300 tracking-wider uppercase mb-1">
              SUARA ANGGOTA KOPERASI
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Dipercaya oleh Ratusan Anggota & Pelaku Usaha Mikro
            </h2>
            <p className="text-xs sm:text-sm text-forest-100/90 mt-2">
              Kisah nyata bagaimana keterbukaan dan kemudahan akses pembiayaan KMB membantu usaha mereka terus bertumbuh.
            </p>
          </div>

          {/* 2 Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Testimonial 1 */}
            <div className="bg-forest-800/80 rounded-2xl p-6 border border-forest-700/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-forest-300/60" />
                <p className="text-xs sm:text-sm text-forest-50 leading-relaxed italic">
                  "Pengajuan pinjaman modal usaha di KMB sangat jelas dan transparan. Tidak ada potongan tersembunyi yang membingungkan. Simulasi angsuran di portal sangat membantu saya merencanakan arus kas masa panen."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-forest-700/60">
                <img
                  src="/images/landing/testimonial-member-1.jpg"
                  alt="Foto Budi Santoso, anggota pengelola hasil bumi"
                  className="w-12 h-12 rounded-full object-cover border-2 border-forest-500 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-semibold text-white">Budi Santoso</h3>
                  <p className="text-xs text-forest-200">Anggota Aktif & Petani Hortikultura</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-forest-800/80 rounded-2xl p-6 border border-forest-700/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-forest-300/60" />
                <p className="text-xs sm:text-sm text-forest-50 leading-relaxed italic">
                  "Buku simpanan digital membuat saya sangat tenang karena setiap rupiah simpanan wajib dan sukarela dapat saya pantau dari ponsel. Saat pembagian SHU tahun lalu, laporannya sangat rapi dan adil."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-forest-700/60">
                <img
                  src="/images/landing/testimonial-member-2.jpg"
                  alt="Foto Siti Rahmawati, anggota pengrajin makanan olahan"
                  className="w-12 h-12 rounded-full object-cover border-2 border-forest-500 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-semibold text-white">Siti Rahmawati</h3>
                  <p className="text-xs text-forest-200">Anggota Aktif & Pemilik Usaha Kuliner</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center sm:text-left text-[11px] text-forest-300">
            * Profil dan testimoni anggota di atas merupakan representasi ilustratif demonstrasi sistem KMB.
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FAQ ACCORDION SECTION (#faq)
         ========================================================================= */}
      <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
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
                Ketahui lebih banyak mengenai ketentuan keanggotaan, simpanan, pembiayaan, dan mekanisme tata kelola di Koperasi KMB.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-ink-200 shadow-sm aspect-[4/3]">
              <img
                src="/images/landing/faq-meeting.jpg"
                alt="Musyawarah anggota koperasi dalam suasana kekeluargaan"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 right-4 text-[11px] text-white/95 font-medium">
                Musyawarah mufakat dan keterbukaan informasi adalah pondasi utama KMB.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-ink-50 border border-ink-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-ink-900 block">Butuh bantuan lebih lanjut?</span>
                <span className="text-[11px] text-ink-600">Hubungi pengurus melalui sekretariat kami.</span>
              </div>
              <a href={`mailto:${config.contact.email}`}>
                <Button variant="outline" size="sm">
                  Kirim Email
                </Button>
              </a>
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
          10. CURVED FOREST GREEN CTA SECTION (Join Community Banner)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="relative rounded-2xl sm:rounded-3xl bg-forest-900 text-white overflow-hidden shadow-lg border border-forest-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-12 lg:p-14">
            {/* Left Content (8 Cols) */}
            <div className="md:col-span-8 space-y-4">
              <span className="inline-block text-xs font-bold text-forest-300 tracking-wider uppercase">
                BERGABUNG HARI INI
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
                Siap Memulai Langkah Menuju Kemandirian Finansial?
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-forest-100/90 leading-relaxed max-w-xl">
                Bergabunglah bersama ratusan anggota produktif lainnya. Pendaftaran online mudah, buku simpanan digital langsung aktif setelah diverifikasi pengurus.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link to="/daftar" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-forest-900 hover:bg-forest-50 font-semibold px-6 shadow-md border-0"
                    rightIcon={<ArrowRight className="w-4 h-4 text-forest-900" />}
                  >
                    Mulai Pendaftaran Online
                  </Button>
                </Link>
                <Link to="/portal" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm px-6"
                  >
                    Buka Portal Anggota
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Photo (4 Cols) */}
            <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="relative rounded-2xl overflow-hidden border-2 border-forest-600/60 shadow-md w-full max-w-xs aspect-square">
                <img
                  src="/images/landing/cta-officer.jpg"
                  alt="Petugas dan anggota koperasi tersenyum menyambut anggota baru"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="inline-block text-[11px] font-semibold text-white/95 bg-forest-950/80 px-2.5 py-1 rounded backdrop-blur-sm">
                    Keluarga Besar KMB Nusantara
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
