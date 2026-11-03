import React from "react";
import { Link } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Landmark, Award, Users, ShieldCheck, ArrowRight, BookOpen, Compass } from "lucide-react";

export const AboutView: React.FC = () => {
  const { config } = useConfigStore();

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Editorial Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200/60 text-forest-800 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-forest-700" />
          <span>Profil Kelembagaan & Tata Kelola</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 tracking-tight leading-tight">
          Membangun Kedaulatan Finansial Melalui Gotong Royong Digital
        </h1>
        <p className="text-sm sm:text-base text-ink-600 max-w-2xl mx-auto leading-relaxed">
          {config.name} berdedikasi mewujudkan tata kelola koperasi yang transparan, modern, dan berintegritas demi kesejahteraan bersama seluruh anggota.
        </p>
      </section>

      {/* Profil Legalitas & Visi Misi */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Legalitas Card */}
          <Card className="flex flex-col justify-between border-ink-200 shadow-subtle hover:border-forest-600/30 transition-all">
            <CardHeader className="bg-forest-50/50 border-b border-ink-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-forest-800">
                  <div className="p-2 rounded-md bg-forest-100 text-forest-800">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-ink-900">Legalitas & Kelembagaan</CardTitle>
                    <p className="text-xs text-ink-500">Legalitas resmi simulasi tata kelola</p>
                  </div>
                </div>
                <Badge variant="forest" size="sm">SIMULASI DEMO</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-ink-700 pt-5">
              <div className="flex justify-between items-center py-2 border-b border-ink-100">
                <span className="text-ink-500 font-medium">Nama Resmi</span>
                <span className="font-semibold text-ink-900">{config.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-ink-100">
                <span className="text-ink-500 font-medium">Sebutan Singkat</span>
                <span className="font-semibold text-ink-900">{config.shortName} ({config.acronym})</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-ink-100 gap-2">
                <span className="text-ink-500 font-medium shrink-0">Nomor Badan Hukum (Demo)</span>
                <span className="font-mono font-semibold text-forest-800 break-all text-right">{config.legalNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-ink-100 gap-2">
                <span className="text-ink-500 font-medium shrink-0">NIKOP Registrasi (Demo)</span>
                <span className="font-mono font-semibold text-forest-800 break-all text-right">{config.cooperativeRegistrationNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-ink-100">
                <span className="text-ink-500 font-medium">Tahun Berdiri (Demo)</span>
                <span className="font-semibold text-ink-900">{config.establishedYear}</span>
              </div>
              <div className="flex justify-between items-start py-2">
                <span className="text-ink-500 font-medium shrink-0">Domisili Kantor</span>
                <span className="text-right text-ink-700 max-w-xs">{config.address.street}, {config.address.city}, {config.address.province}</span>
              </div>
            </CardContent>
          </Card>

          {/* Visi & Misi Card */}
          <Card className="flex flex-col justify-between border-ink-200 shadow-subtle hover:border-forest-600/30 transition-all">
            <CardHeader className="bg-forest-50/50 border-b border-ink-100 pb-4">
              <div className="flex items-center gap-2.5 text-forest-800">
                <div className="p-2 rounded-md bg-forest-100 text-forest-800">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-ink-900">Visi & Arah Strategis</CardTitle>
                  <p className="text-xs text-ink-500">Fondasi pelayanan dan pemberdayaan</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 text-xs text-ink-700 pt-5">
              <div className="p-3.5 rounded-lg bg-warm-cream border border-ink-200/60">
                <h4 className="font-bold text-ink-900 mb-1.5 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-forest-700" />
                  Visi Jangka Panjang
                </h4>
                <p className="text-ink-600 leading-relaxed text-xs">
                  Menjadi ekosistem koperasi digital terdepan di Indonesia yang mandiri, berkeadilan sosial, dan terpercaya dalam menyejahterakan anggota melalui pemanfaatan teknologi tepat guna.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-ink-900 mb-2 text-sm">Tiga Pilar Misi Utama:</h4>
                <ul className="space-y-2.5 text-ink-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Menyelenggarakan layanan simpan pinjam yang aman, mudah diakses, dan bebas biaya tersembunyi bagi anggota.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Menerapkan tata kelola terbuka digital dengan pemisahan kewenangan (Segregation of Duties) dan audit trail otomatis.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Mendorong pembiayaan sektor riil produktif guna meningkatkan produktivitas dan skala usaha ekonomi anggota.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Nilai Dasar Koperasi */}
      <section className="bg-ink-100/60 py-12 border-y border-ink-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-ink-900">Nilai-Nilai Luhur Koperasi</h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-1">Prinsip dasar yang memandu setiap keputusan dan layanan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg bg-white border border-ink-200 shadow-subtle space-y-2">
              <div className="w-10 h-10 rounded-md bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mb-2">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900">Asas Kekeluargaan</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Koperasi didirikan dari, oleh, dan untuk anggota. Setiap keputusan strategis diambil demi kemaslahatan bersama secara adil dan demokratis.
              </p>
            </div>
            <div className="p-5 rounded-lg bg-white border border-ink-200 shadow-subtle space-y-2">
              <div className="w-10 h-10 rounded-md bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900">Transparansi Finansial</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Pencatatan mutasi saldo dan riwayat pinjaman dapat dipantau langsung oleh anggota, didukung audit trail digital yang terekam sistematis.
              </p>
            </div>
            <div className="p-5 rounded-lg bg-white border border-ink-200 shadow-subtle space-y-2">
              <div className="w-10 h-10 rounded-md bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mb-2">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-900">Kemandirian Berkelanjutan</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Memperkuat fondasi permodalan mandiri anggota agar terbebas dari ketergantungan rentenir atau skema pinjaman berbunga mencekik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Susunan Pengurus & Pengawas */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <Badge variant="forest" size="sm" className="mb-2">TATA KELOLA ORGANISASI</Badge>
          <h2 className="text-2xl font-bold text-ink-900">Susunan Pengurus & Pengawas</h2>
          <p className="text-xs sm:text-sm text-ink-600 mt-1">Representasi struktural kepengurusan percontohan pada platform demonstrasi</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="text-center p-6 border-ink-200 shadow-subtle hover:border-forest-600/30 transition-all">
            <div className="w-14 h-14 bg-forest-100 text-forest-900 font-bold text-base rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-forest-200">
              HK
            </div>
            <h3 className="text-base font-bold text-ink-900">Hendra Kurniawan</h3>
            <p className="text-xs text-forest-700 font-semibold mt-0.5">Ketua Pengurus</p>
            <p className="text-xs text-ink-500 mt-2.5 leading-relaxed">
              Penanggung jawab eksekutif, koordinasi umum, dan otorisasi strategis kebijakan koperasi percontohan.
            </p>
            <div className="mt-4 pt-3 border-t border-ink-100">
              <Badge variant="neutral" size="sm">Akun Simulasi: Manager</Badge>
            </div>
          </Card>

          <Card className="text-center p-6 border-ink-200 shadow-subtle hover:border-forest-600/30 transition-all">
            <div className="w-14 h-14 bg-forest-100 text-forest-900 font-bold text-base rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-forest-200">
              SM
            </div>
            <h3 className="text-base font-bold text-ink-900">Sri Mulyani</h3>
            <p className="text-xs text-forest-700 font-semibold mt-0.5">Bendahara Koperasi</p>
            <p className="text-xs text-ink-500 mt-2.5 leading-relaxed">
              Pengawasan likuiditas kas, manajemen arus dana simpan pinjam, rekonsiliasi, dan pelaporan keuangan.
            </p>
            <div className="mt-4 pt-3 border-t border-ink-100">
              <Badge variant="neutral" size="sm">Akun Simulasi: Treasurer</Badge>
            </div>
          </Card>

          <Card className="text-center p-6 border-ink-200 shadow-subtle hover:border-forest-600/30 transition-all">
            <div className="w-14 h-14 bg-forest-100 text-forest-900 font-bold text-base rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-forest-200">
              BI
            </div>
            <h3 className="text-base font-bold text-ink-900">Bambang Irawan</h3>
            <p className="text-xs text-forest-700 font-semibold mt-0.5">Pengawas & Auditor</p>
            <p className="text-xs text-ink-500 mt-2.5 leading-relaxed">
              Pemeriksaan kepatuhan AD/ART, integritas audit trail, serta pengawasan independen atas pelaksanaan operasional.
            </p>
            <div className="mt-4 pt-3 border-t border-ink-100">
              <Badge variant="neutral" size="sm">Akun Simulasi: Auditor</Badge>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-forest-900 text-white p-6 sm:p-10 text-center space-y-4 shadow-md">
          <h3 className="text-2xl font-bold tracking-tight">Siap Menjadi Bagian dari Koperasi Kami?</h3>
          <p className="text-xs sm:text-sm text-forest-100 max-w-xl mx-auto leading-relaxed">
            Pendaftaran terbuka bagi seluruh masyarakat yang memenuhi persyaratan keanggotaan. Nikmati kemudahan layanan simpanan dan pembiayaan berbasis gotong royong.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/daftar">
              <Button variant="primary" size="md" className="bg-lime-accent text-forest-900 hover:bg-lime-400 font-semibold w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Daftar Menjadi Anggota
              </Button>
            </Link>
            <Link to="/layanan/simpanan">
              <Button variant="secondary" size="md" className="bg-white/10 text-white hover:bg-white/20 border-white/20 w-full sm:w-auto">
                Pelajari Layanan Simpanan
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
