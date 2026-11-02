import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { formatIDR } from "@/lib/utils";
import { mockAdminStats } from "@/mocks/seedData";
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
  Users,
  Wallet,
  CreditCard,
  ShieldCheck,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";

export const AdminDashboardView: React.FC = () => {
  const { currentUser } = useAuthStore();

  const auditLogs = [
    {
      id: "LOG-9021",
      waktu: "2026-11-02 10:14",
      aktor: "Dewi Lestari (Staff)",
      aksi: "VERIFIKASI_BERKAS",
      entitas: "Calon Anggota DEMO-ID-0002",
      status: "Berhasil",
    },
    {
      id: "LOG-9020",
      waktu: "2026-11-02 09:30",
      aktor: "Ahmad Fauzi (Finance Officer)",
      aksi: "REKONSILIASI_SETORAN",
      entitas: "Simpanan Wajib DEMO-ID-0001 (Rp 50.000)",
      status: "Berhasil",
    },
    {
      id: "LOG-9019",
      waktu: "2026-11-01 16:45",
      aktor: "Hendra Kurniawan (Manager)",
      aksi: "APPROVAL_PINJAMAN_LV3",
      entitas: "Pinjaman PJ-2026-0045 (Rp 25.000.000)",
      status: "Berhasil",
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header & SoD Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-900">
              Dashboard Operasional Koperasi
            </h1>
            <Badge variant="forest" size="sm">
              Tahun Buku 2026
            </Badge>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Masuk sebagai: <strong className="text-ink-900">{currentUser.name}</strong> ({currentUser.roleName})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/anggota/verifikasi">
            <Button variant="primary" size="sm">
              Periksa Antrean Verifikasi ({mockAdminStats.calonAnggotaMenunggu})
            </Button>
          </Link>
          <Link to="/admin/pengaturan">
            <Button variant="outline" size="sm">
              Konfigurasi Modul
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Institutional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-ink-600 mb-1">
            <span>Anggota Terdaftar</span>
            <Users className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-ink-900 tabular-nums">
            {mockAdminStats.totalAnggotaAktif}
          </div>
          <div className="text-[11px] text-success-700 mt-1 font-medium flex items-center gap-1">
            <span>+{mockAdminStats.calonAnggotaMenunggu} permohonan baru</span>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-ink-600 mb-1">
            <span>Dana Simpanan Anggota</span>
            <Wallet className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-ink-900 tabular-nums">
            {formatIDR(mockAdminStats.totalSimpananAnggota)}
          </div>
          <div className="text-[11px] text-ink-500 mt-1 font-mono">
            Kas Riil: {formatIDR(mockAdminStats.kasOperasional)}
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-ink-600 mb-1">
            <span>Portofolio Pembiayaan</span>
            <CreditCard className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-ink-900 tabular-nums">
            {formatIDR(mockAdminStats.totalPortofolioPinjaman)}
          </div>
          <div className="text-[11px] text-success-700 mt-1 font-medium">
            Kolektibilitas Lancar: {mockAdminStats.rasioKolektibilitasLancar}%
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-ink-600 mb-1">
            <span>Rasio NPL / Bermasalah</span>
            <ShieldCheck className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-ink-900 tabular-nums">
            {mockAdminStats.nplRasio}%
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            Ambang batas sehat: &lt; 5.0%
          </div>
        </Card>
      </div>

      {/* 3. Task Queues (Separation of Duties Demonstration) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Queue 1: Verifikasi Calon Anggota */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning-700" />
                <CardTitle className="text-sm">Antrean Verifikasi Berkas Calon</CardTitle>
              </div>
              <Badge variant="warning" size="sm">
                4 Menunggu Staf
              </Badge>
            </div>
            <CardDescription>
              Staf operasional memeriksa format ID demonstrasi dan kelengkapan dokumen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="p-3 bg-ink-50 border border-ink-200 rounded-md flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-ink-900 block">Budi Santoso</span>
                <span className="text-[11px] text-ink-500 font-mono">DEMO-ID-0002 — UMKM Percetakan</span>
              </div>
              <Link to="/admin/anggota/verifikasi">
                <Button variant="outline" size="sm">
                  Verifikasi Berkas
                </Button>
              </Link>
            </div>
            <div className="p-3 bg-ink-50 border border-ink-200 rounded-md flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-ink-900 block">Maya Indah Permata</span>
                <span className="text-[11px] text-ink-500 font-mono">DEMO-ID-0003 — Toko Kelontong</span>
              </div>
              <Link to="/admin/anggota/verifikasi">
                <Button variant="outline" size="sm">
                  Verifikasi Berkas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Queue 2: Persetujuan Pinjaman Bertingkat */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-forest-700" />
                <CardTitle className="text-sm">Antrean Persetujuan Pinjaman</CardTitle>
              </div>
              <Badge variant="forest" size="sm">
                2 Menunggu Otorisasi
              </Badge>
            </div>
            <CardDescription>
              Workflow bertingkat: Level 2 Finance Officer s.d. 10 Jt; Level 3 Pengurus &gt; 10 Jt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="p-3 bg-ink-50 border border-ink-200 rounded-md flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-ink-900 block">Pengajuan Rp 25.000.000</span>
                <span className="text-[11px] text-ink-500">Anggota DEMO-ID-0001 — Tenor 12 Bln (Eskalasi Level 3 Pengurus)</span>
              </div>
              <Button variant="secondary" size="sm">
                Tinjau
              </Button>
            </div>
            <div className="p-3 bg-ink-50 border border-ink-200 rounded-md flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-ink-900 block">Pengajuan Rp 8.000.000</span>
                <span className="text-[11px] text-ink-500">Anggota DEMO-ID-0006 — Tenor 6 Bln (Level 2 Finance Officer)</span>
              </div>
              <Button variant="secondary" size="sm">
                Tinjau
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Core Audit Trail Log (Read Only) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-forest-700" />
            Core Audit Logging (Internal Platform — Read-Only)
          </h2>
          <span className="text-xs text-ink-500 font-mono">Pencatatan Otomatis Setiap Operasi Tulis</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Log / Waktu</TableHead>
              <TableHead>Aktor & Peran</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Entitas Terkait</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="font-mono text-xs font-semibold text-ink-900">{log.id}</div>
                  <div className="text-[11px] text-ink-500">{log.waktu}</div>
                </TableCell>
                <TableCell className="font-medium text-ink-800 text-xs">{log.aktor}</TableCell>
                <TableCell>
                  <span className="font-mono text-[11px] bg-ink-100 px-1.5 py-0.5 rounded text-ink-700">
                    {log.aksi}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-ink-600">{log.entitas}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="success" size="sm">
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
