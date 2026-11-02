import React from "react";
import { useConfigStore } from "@/stores/configStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Landmark, Award } from "lucide-react";

export const AboutView: React.FC = () => {
  const { config } = useConfigStore();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="forest">Tentang Organisasi</Badge>
        <h1 className="text-3xl font-bold text-ink-900">{config.name}</h1>
        <p className="text-sm text-ink-600 leading-relaxed">
          Membangun kemandirian ekonomi masyarakat melalui ekosistem koperasi digital berlandaskan asas gotong royong dan transparansi.
        </p>
      </div>

      {/* Profil Kelembagaan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-forest-700 mb-1">
              <Landmark className="w-5 h-5" />
              <CardTitle>Legalitas & Kelembagaan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-ink-700">
            <div className="flex justify-between py-1.5 border-b border-ink-100">
              <span className="text-ink-500">Nama Resmi</span>
              <span className="font-semibold">{config.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-ink-100">
              <span className="text-ink-500">Sebutan Singkat</span>
              <span className="font-semibold">{config.shortName} ({config.acronym})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-ink-100">
              <span className="text-ink-500">Nomor Badan Hukum (Demo)</span>
              <span className="font-mono font-semibold">{config.legalNumber}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-ink-100">
              <span className="text-ink-500">NIKOP Registrasi (Demo)</span>
              <span className="font-mono font-semibold">{config.cooperativeRegistrationNumber}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-ink-100">
              <span className="text-ink-500">Tahun Berdiri Simulasi</span>
              <span className="font-semibold">{config.establishedYear}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-ink-500">Alamat Kantor</span>
              <span className="text-right max-w-xs">{config.address.street}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-forest-700 mb-1">
              <Award className="w-5 h-5" />
              <CardTitle>Visi & Misi Koperasi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-ink-700">
            <div>
              <h4 className="font-bold text-ink-900 mb-1 text-sm">Visi</h4>
              <p className="text-ink-600 leading-relaxed">
                Menjadi koperasi digital terdepan di Indonesia yang mandiri, berkeadilan, dan terpercaya dalam menyejahterakan anggota secara berkelanjutan.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-ink-900 mb-1 text-sm">Misi</h4>
              <ul className="list-disc list-inside space-y-1.5 text-ink-600 leading-relaxed">
                <li>Menyelenggarakan layanan simpan pinjam yang mudah diakses dan aman.</li>
                <li>Menerapkan prinsip tata kelola keterbukaan digital pada setiap proses finansial.</li>
                <li>Mendukung pembiayaan produktif sektor riil dan UMKM anggota.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Struktur Kepengurusan Percontohan */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-ink-900">Susunan Pengurus & Pengawas (Simulasi)</h2>
          <p className="text-xs text-ink-600 mt-1">Representasi tata kelola organisasi koperasi percontohan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="text-center p-5">
            <div className="w-12 h-12 bg-forest-100 text-forest-900 font-bold rounded-full mx-auto flex items-center justify-center mb-3">
              HK
            </div>
            <h3 className="text-sm font-bold text-ink-900">Hendra Kurniawan</h3>
            <p className="text-xs text-forest-700 font-medium">Ketua Pengurus</p>
            <p className="text-[11px] text-ink-500 mt-2">Penanggung jawab eksekutif dan otorisasi strategis organisasi.</p>
          </Card>

          <Card className="text-center p-5">
            <div className="w-12 h-12 bg-forest-100 text-forest-900 font-bold rounded-full mx-auto flex items-center justify-center mb-3">
              SM
            </div>
            <h3 className="text-sm font-bold text-ink-900">Sri Mulyani</h3>
            <p className="text-xs text-forest-700 font-medium">Bendahara Koperasi</p>
            <p className="text-[11px] text-ink-500 mt-2">Pengawasan likuiditas kas, rekonsiliasi, dan pelaporan keuangan.</p>
          </Card>

          <Card className="text-center p-5">
            <div className="w-12 h-12 bg-forest-100 text-forest-900 font-bold rounded-full mx-auto flex items-center justify-center mb-3">
              BI
            </div>
            <h3 className="text-sm font-bold text-ink-900">Bambang Irawan</h3>
            <p className="text-xs text-forest-700 font-medium">Pengawas & Auditor</p>
            <p className="text-[11px] text-ink-500 mt-2">Pemeriksaan kepatuhan AD/ART dan audit jejak transaksi operasional.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
