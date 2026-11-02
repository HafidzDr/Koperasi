import React from "react";
import { Link } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Building2,
  FileCheck2,
  Sparkles,
  Layers,
} from "lucide-react";

export const HomeView: React.FC = () => {
  const { config } = useConfigStore();

  const values = [
    {
      icon: Users,
      title: "Gotong Royong Modern",
      desc: "Kemandirian ekonomi anggota melalui prinsip kebersamaan dan saling menopang berbasis tata kelola digital.",
    },
    {
      icon: ShieldCheck,
      title: "Transparansi Teruji",
      desc: "Seluruh simpanan, angsuran pembiayaan, dan pembagian SHU dapat diaudit secara real-time oleh anggota.",
    },
    {
      icon: TrendingUp,
      title: "Keadilan Finansial",
      desc: "Bunga simpanan berkeadilan dan pembiayaan produktif dengan skema yang jelas tanpa biaya tersembunyi.",
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <Badge variant="forest" size="md" className="px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            Platform Digital Koperasi Indonesia
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            {config.name}
          </h1>

          <p className="text-base sm:text-lg text-ink-600 leading-relaxed font-normal">
            *"{config.tagline}"* — Ekosistem layanan simpan pinjam dan usaha koperasi yang transparan, akuntabel, dan inklusif untuk seluruh anggota di seluruh Nusantara.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/daftar">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Daftar Menjadi Anggota
              </Button>
            </Link>
            <Link to="/portal">
              <Button size="lg" variant="outline">
                Buka Portal Anggota
              </Button>
            </Link>
          </div>

          {/* Institutional Trust Badges */}
          <div className="pt-6 border-t border-ink-200/80 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-forest-700" />
              Badan Hukum: <strong className="text-ink-800">{config.legalNumber}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-forest-700" />
              NIKOP: <strong className="text-ink-800">{config.cooperativeRegistrationNumber}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-forest-700" />
              Arsitektur: <strong className="text-ink-800">Platform Core + Modular</strong>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Core Values */}
      <section className="bg-white border-y border-ink-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-ink-900">Nilai Fundamental KMB</h2>
            <p className="text-sm text-ink-600 mt-2">
              Berakar pada nilai kekeluargaan dan dikelola dengan standar akuntabilitas digital terkini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="p-6 rounded-lg border border-ink-200 bg-ink-50/50 hover:bg-white hover:shadow-subtle transition-all">
                  <div className="w-10 h-10 rounded bg-forest-100 flex items-center justify-center text-forest-900 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-ink-900 mb-2">{v.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Modular Business Services Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">Layanan & Modul Koperasi</h2>
            <p className="text-sm text-ink-600 mt-1">
              Fleksibilitas produk keuangan yang menyesuaikan kebutuhan anggota.
            </p>
          </div>
          <Link to="/layanan/simpanan">
            <Button variant="outline" size="sm">
              Lihat Seluruh Layanan
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Simpanan */}
          <Card className="hover:border-forest-600 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant={config.activeModules.savings ? "forest" : "neutral"} size="sm">
                  {config.activeModules.savings ? "Modul Aktif" : "Non-Aktif"}
                </Badge>
                <span className="text-xs font-semibold text-forest-700">Imbal Hasil s.d. 5.5%</span>
              </div>
              <CardTitle>Simpanan Anggota</CardTitle>
              <CardDescription>
                Simpanan Pokok ({formatIDR(100000)}), Simpanan Wajib ({formatIDR(50000)}/bln), dan Simpanan Sukarela yang fleksibel ditarik kapan saja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-ink-600 space-y-1.5 list-disc list-inside">
                <li>Buku simpanan digital transparan</li>
                <li>Bebas biaya administrasi bulanan</li>
                <li>Simulasi bagi hasil SHU tahunan</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: Pinjaman */}
          <Card className="hover:border-forest-600 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant={config.activeModules.loans ? "forest" : "neutral"} size="sm">
                  {config.activeModules.loans ? "Modul Aktif" : "Non-Aktif"}
                </Badge>
                <span className="text-xs font-semibold text-forest-700">Plafon s.d. Rp 50 Jt</span>
              </div>
              <CardTitle>Pinjaman Modal Usaha</CardTitle>
              <CardDescription>
                Pembiayaan produktif untuk pelaku UMKM anggota koperasi dengan proses verifikasi bertingkat yang adil dan transparan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-ink-600 space-y-1.5 list-disc list-inside">
                <li>Kalkulator simulasi angsuran instan</li>
                <li>Tenor fleksibel 3 hingga 24 bulan</li>
                <li>Tanpa agunan untuk plafon mikro</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 3: SHU & RAT */}
          <Card className="hover:border-forest-600 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="forest" size="sm">
                  Transparansi
                </Badge>
                <span className="text-xs font-semibold text-forest-700">RAT Digital</span>
              </div>
              <CardTitle>Sisa Hasil Usaha (SHU)</CardTitle>
              <CardDescription>
                Pembagian keuntungan tahunan berprinsip gotong royong: jasa modal dan jasa usaha/transaksi dibagikan secara adil.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-ink-600 space-y-1.5 list-disc list-inside">
                <li>Presensi kuorum rapat anggota terverifikasi</li>
                <li>Simulasi e-voting 1 Member = 1 Vote</li>
                <li>Rekapitulasi hak SHU transparan</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Join CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-forest-900 text-white rounded-xl p-8 sm:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <h3 className="text-2xl font-bold text-forest-50">
              Siap Bertumbuh Bersama Koperasi KMB?
            </h3>
            <p className="text-xs sm:text-sm text-forest-100/90 leading-relaxed">
              Bergabunglah dengan ratusan anggota produktif lainnya. Pendaftaran mudah, aman, dan seluruh data keanggotaan terkelola secara akuntabel.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/daftar">
              <Button size="lg" className="bg-white text-forest-900 hover:bg-forest-50">
                Mulai Pendaftaran Online
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
