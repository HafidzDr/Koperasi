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
  Lock,
  ShieldAlert,
  Settings,
  Eye,
  Landmark,
} from "lucide-react";

export const AdminDashboardView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const role = currentUser.role;

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

  // Specific role metadata
  const getRoleHeaderInfo = () => {
    switch (role) {
      case "auditor":
        return {
          title: "Dashboard Pengawasan & Kepatuhan Institusional",
          subtitle: "Ruang kerja audit independen & pengawas. Akses murni Hanya Baca (Read-Only) terhadap seluruh data keuangan dan operasional.",
          badgeVariant: "neutral" as const,
          badgeText: "AUDITOR (READ-ONLY)",
        };
      case "staff":
        return {
          title: "Dashboard Operasional & Pelayanan Anggota",
          subtitle: "Pemeriksaan kelengkapan berkas pendaftaran, verifikasi administratif, dan pencatatan layanan simpan pinjam.",
          badgeVariant: "forest" as const,
          badgeText: "STAF OPERASIONAL",
        };
      case "finance_officer":
        return {
          title: "Dashboard Operasional Keuangan & Analisa Kredit",
          subtitle: "Pencatatan mutasi kas, rekonsiliasi setoran, persetujuan pinjaman Level 2 (s.d. Rp 10 Juta), dan eksekusi pencairan.",
          badgeVariant: "info" as const,
          badgeText: "PETUGAS KEUANGAN",
        };
      case "treasurer":
        return {
          title: "Dashboard Pengawasan Likuiditas & Otorisasi Kas",
          subtitle: "Pengawasan saldo kas harian, persetujuan penutupan buku kas, otorisasi transaksi besar, dan koreksi penyesuaian.",
          badgeVariant: "warning" as const,
          badgeText: "BENDAHARA KOPERASI",
        };
      case "manager":
        return {
          title: "Dashboard Eksekutif & Tata Kelola Organisasi",
          subtitle: "Persetujuan final penerimaan anggota, otorisasi pinjaman besar Level 3 (> Rp 10 Juta), dan laporan pertanggungjawaban.",
          badgeVariant: "success" as const,
          badgeText: "KETUA PENGURUS / MANAJER",
        };
      case "admin":
        return {
          title: "Dashboard Pemeliharaan Sistem & Pengguna",
          subtitle: "Manajemen akun staf, hak akses teknis, dan audit log sistem. Tanpa kewenangan transaksi keuangan maupun persetujuan anggota.",
          badgeVariant: "warning" as const,
          badgeText: "ADMINISTRATOR SISTEM (TEKNIS)",
        };
      case "super_admin":
        return {
          title: "Dashboard Infrastruktur Platform & Mesin Demo",
          subtitle: "Arsitektur platform modular, pemantauan 7 fondasi core, 9 modul bisnis, dan kontrol pemeliharaan lingkungan demo.",
          badgeVariant: "forest" as const,
          badgeText: "SUPER ADMINISTRATOR",
        };
      default:
        return {
          title: "Dashboard Operasional Koperasi",
          subtitle: "Tinjauan menyeluruh aktivitas koperasi KMB.",
          badgeVariant: "neutral" as const,
          badgeText: currentUser.roleName,
        };
    }
  };

  const headerInfo = getRoleHeaderInfo();

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header & SoD Role Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-900">
              {headerInfo.title}
            </h1>
            <Badge variant={headerInfo.badgeVariant} size="sm">
              {headerInfo.badgeText}
            </Badge>
          </div>
          <p className="text-xs text-ink-600 mt-1 max-w-3xl leading-relaxed">
            {headerInfo.subtitle}
          </p>
        </div>

        {/* Role-Specific Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {role === "staff" && (
            <Link to="/admin/anggota/verifikasi">
              <Button variant="primary" size="sm" leftIcon={<Clock className="w-3.5 h-3.5" />}>
                Verifikasi Berkas ({mockAdminStats.calonAnggotaMenunggu})
              </Button>
            </Link>
          )}

          {role === "manager" && (
            <Link to="/admin/anggota/verifikasi">
              <Button variant="primary" size="sm" leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>
                Persetujuan Anggota Final
              </Button>
            </Link>
          )}

          {role === "finance_officer" && (
            <Link to="/admin/keuangan">
              <Button variant="primary" size="sm" leftIcon={<Landmark className="w-3.5 h-3.5" />}>
                Rekonsiliasi Kas Harian
              </Button>
            </Link>
          )}

          {role === "treasurer" && (
            <Link to="/admin/keuangan">
              <Button variant="primary" size="sm" leftIcon={<Landmark className="w-3.5 h-3.5" />}>
                Persetujuan Buku Kas
              </Button>
            </Link>
          )}

          {role === "auditor" && (
            <Link to="/admin/audit">
              <Button variant="primary" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                Tinjau Audit Trail
              </Button>
            </Link>
          )}

          {(role === "admin" || role === "super_admin") && (
            <Link to="/admin/pengaturan">
              <Button variant="primary" size="sm" leftIcon={<Settings className="w-3.5 h-3.5" />}>
                Konfigurasi Platform
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* SoD Alert for Admin / Super Admin */}
      {(role === "admin" || role === "super_admin") && (
        <div className="p-3.5 bg-warning-100/60 border border-warning-base/30 rounded-lg flex items-start gap-3 text-xs text-warning-800">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-warning-700" />
          <div>
            <strong>Prinsip Separation of Duties (IA Seksi 5.4 Catatan Kaki 2):</strong> Akun Administrator Sistem bertugas mengelola pemeliharaan sistem, pengguna, dan konfigurasi teknis. Anda <strong>tidak memiliki kewenangan transaksi keuangan</strong> (setor, tarik, rekonsiliasi kas, koreksi saldo, pencairan pinjaman) maupun persetujuan keanggotaan.
          </div>
        </div>
      )}

      {/* SoD Alert for Auditor */}
      {role === "auditor" && (
        <div className="p-3.5 bg-ink-100 border border-ink-200 rounded-lg flex items-start gap-3 text-xs text-ink-800">
          <Lock className="w-5 h-5 shrink-0 mt-0.5 text-ink-600" />
          <div>
            <strong>Prinsip Pengawasan Independen (Read-Only):</strong> Seluruh tombol mutasi, entri transaksi, dan tombol persetujuan dinonaktifkan secara ketat pada akun Auditor. Akses dibatasi pada penelusuran log, ekspor laporan, dan verifikasi kepatuhan.
          </div>
        </div>
      )}

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

      {/* 3. Task Queues - Dynamically Tailored by Role */}
      {role !== "auditor" && role !== "admin" && role !== "super_admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Queue 1: Verifikasi Calon Anggota (Staff & Manager) */}
          {(role === "staff" || role === "manager") && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning-700" />
                    <CardTitle className="text-sm">
                      {role === "staff"
                        ? "Antrean Verifikasi Berkas Calon (Staf)"
                        : "Antrean Persetujuan Final Anggota (Pengurus)"}
                    </CardTitle>
                  </div>
                  <Badge variant="warning" size="sm">
                    {mockAdminStats.calonAnggotaMenunggu} Menunggu
                  </Badge>
                </div>
                <CardDescription>
                  {role === "staff"
                    ? "Staf operasional memeriksa format ID demonstrasi dan kelengkapan dokumen."
                    : "Pengurus memberikan keputusan penerimaan organisasi dan menerbitkan nomor anggota."}
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
                      {role === "staff" ? "Verifikasi Berkas" : "Putuskan Persetujuan"}
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
                      {role === "staff" ? "Verifikasi Berkas" : "Putuskan Persetujuan"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Queue 2: Persetujuan Pinjaman Bertingkat (Finance Officer & Manager) */}
          {(role === "finance_officer" || role === "manager" || role === "treasurer") && (
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
                    <span className="text-[11px] text-ink-500">Anggota DEMO-ID-0001 — Tenor 12 Bln (Level 3 Pengurus)</span>
                  </div>
                  {role === "manager" ? (
                    <Button variant="primary" size="sm">
                      Otorisasi Lv3
                    </Button>
                  ) : (
                    <span className="text-[11px] text-ink-500 italic">Eskalasi ke Pengurus</span>
                  )}
                </div>
                <div className="p-3 bg-ink-50 border border-ink-200 rounded-md flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-ink-900 block">Pengajuan Rp 8.000.000</span>
                    <span className="text-[11px] text-ink-500">Anggota DEMO-ID-0006 — Tenor 6 Bln (Level 2 Finance Officer)</span>
                  </div>
                  {role === "finance_officer" ? (
                    <Button variant="primary" size="sm">
                      Analisa & Approve Lv2
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm">
                      Tinjau
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 4. Core Audit Trail Log (Read Only for all) */}
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
