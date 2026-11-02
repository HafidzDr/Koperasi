import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
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
  FileText,
  ShieldAlert,
  Send,
  Eye,
  Lock,
} from "lucide-react";

interface Applicant {
  id: string;
  demoId: string;
  nama: string;
  email: string;
  kota: string;
  pekerjaan: string;
  status: "Menunggu Verifikasi" | "Direkomendasikan Staf" | "Disetujui Pengurus";
  tanggalDaftar: string;
}

export const MemberVerificationView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: "APP-001",
      demoId: "DEMO-ID-0002",
      nama: "Budi Santoso",
      email: "budi.santoso@email.invalid",
      kota: "Jakarta Selatan",
      pekerjaan: "Usaha Percetakan",
      status: "Menunggu Verifikasi",
      tanggalDaftar: "2026-11-01",
    },
    {
      id: "APP-002",
      demoId: "DEMO-ID-0003",
      nama: "Maya Indah Permata",
      email: "maya.indah@email.invalid",
      kota: "Tangerang",
      pekerjaan: "Toko Sembako",
      status: "Menunggu Verifikasi",
      tanggalDaftar: "2026-11-01",
    },
    {
      id: "APP-003",
      demoId: "DEMO-ID-0004",
      nama: "Agus Setiawan",
      email: "agus.setiawan@email.invalid",
      kota: "Depok",
      pekerjaan: "Bengkel Sepeda Motor",
      status: "Direkomendasikan Staf",
      tanggalDaftar: "2026-10-31",
    },
  ]);

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Authority rules (Information Architecture Seksi 5.4)
  const isStaff = currentUser.role === "staff";
  const isManagerOrBoard = currentUser.role === "manager";
  const isAuditor = currentUser.role === "auditor";
  const isAdminOrSuperAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
  const isFinancialStaff = currentUser.role === "finance_officer" || currentUser.role === "treasurer";

  const handleRecommendByStaff = (appId: string) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, status: "Direkomendasikan Staf" } : a
      )
    );
    setIsActionModalOpen(false);
    addToast({
      type: "success",
      title: "Rekomendasi Staf Dikirim",
      message: "Berkas berhasil diverifikasi dan direkomendasikan ke Pengurus untuk persetujuan final.",
    });
  };

  const handleApproveByBoard = (appId: string) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, status: "Disetujui Pengurus" } : a
      )
    );
    setIsActionModalOpen(false);
    addToast({
      type: "success",
      title: "Persetujuan Final Keanggotaan Berhasil",
      message: "Pengurus telah menyetujui. Sistem otomatis menerbitkan status keanggotaan aktif.",
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Verifikasi & Rekomendasi Keanggotaan
          </h1>
          <p className="text-xs text-ink-600 mt-1">
            Pemisahan 5 tahap: Kelengkapan → Verifikasi Staf → Rekomendasi → Persetujuan Pengurus → Penerbitan Nomor Anggota
          </p>
        </div>

        {/* SoD Badge */}
        <div className="flex items-center gap-2">
          {isStaff && (
            <Badge variant="forest" size="md">
              Kewenangan: Verifikasi & Rekomendasi Staf
            </Badge>
          )}
          {isManagerOrBoard && (
            <Badge variant="success" size="md">
              Kewenangan: Persetujuan Final Pengurus
            </Badge>
          )}
          {isAuditor && (
            <Badge variant="neutral" size="md">
              Auditor: Mode Inspeksi Read-Only
            </Badge>
          )}
          {isAdminOrSuperAdmin && (
            <Badge variant="warning" size="md">
              Admin Teknis: Tanpa Otoritas Organisasi
            </Badge>
          )}
          {isFinancialStaff && (
            <Badge variant="neutral" size="md">
              Keuangan: Di Luar Domain Keanggotaan
            </Badge>
          )}
        </div>
      </div>

      {/* SoD Notice Warning if Admin or Financial role */}
      {isAdminOrSuperAdmin && (
        <div className="p-3.5 bg-warning-100/60 border border-warning-base/30 rounded-lg flex items-start gap-3 text-xs text-warning-800">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-warning-700" />
          <div>
            <strong>Prinsip Separation of Duties (SoD):</strong> Akun Administrator Sistem bertugas memelihara infrastruktur teknis dan tidak memiliki kewenangan organisasi untuk menyetujui atau menolak keanggotaan koperasi. Silakan gunakan <em>Demo Role Switcher</em> untuk beralih ke <strong>Staf Operasional</strong> (verifikasi) atau <strong>Manajer / Pengurus</strong> (persetujuan final).
          </div>
        </div>
      )}

      {isAuditor && (
        <div className="p-3.5 bg-ink-100 border border-ink-200 rounded-lg flex items-start gap-3 text-xs text-ink-800">
          <Lock className="w-5 h-5 shrink-0 mt-0.5 text-ink-600" />
          <div>
            <strong>Mode Auditor (Read-Only):</strong> Anda memiliki akses membaca penuh terhadap berkas pendaftaran dan catatan verifikasi kepatuhan, namun dilarang melakukan aksi mutasi, rekomendasi, maupun persetujuan data.
          </div>
        </div>
      )}

      {/* Applicant Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Permohonan Calon Anggota Masuk</CardTitle>
          <CardDescription>
            Seluruh data identitas menggunakan format demonstrasi aman DEMO-ID-XXXX tanpa NIK nasional.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode / Tanggal</TableHead>
                <TableHead>Nama Calon & ID Demo</TableHead>
                <TableHead>Domisili & Usaha</TableHead>
                <TableHead>Dokumen</TableHead>
                <TableHead>Status Tahapan</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-mono text-xs font-bold text-ink-900">{app.id}</div>
                    <div className="text-[11px] text-ink-500">{app.tanggalDaftar}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-ink-900 text-xs">{app.nama}</div>
                    <div className="text-[11px] font-mono text-forest-700">{app.demoId}</div>
                  </TableCell>
                  <TableCell className="text-xs text-ink-600">
                    <div>{app.kota}</div>
                    <div className="text-[11px] text-ink-500">{app.pekerjaan}</div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        setSelectedApplicant(app);
                        setIsDocModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-forest-700 hover:text-forest-900 font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Dokumen</span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        app.status === "Disetujui Pengurus"
                          ? "success"
                          : app.status === "Direkomendasikan Staf"
                          ? "info"
                          : "warning"
                      }
                      size="sm"
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isAuditor ? (
                      <span className="text-[11px] text-ink-500 italic">Hanya Baca</span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplicant(app);
                          setIsActionModalOpen(true);
                        }}
                      >
                        {isStaff
                          ? "Verifikasi & Rekomendasi"
                          : isManagerOrBoard
                          ? "Persetujuan Final"
                          : "Tinjau Berkas"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Preview Modal */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Pratinjau Dokumen Calon Anggota (Simulasi)"
        maxWidth="md"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setIsDocModalOpen(false)}>
            Tutup
          </Button>
        }
      >
        {selectedApplicant && (
          <div className="space-y-4 text-center">
            <div className="p-8 border-2 border-dashed border-ink-300 rounded-lg bg-ink-50 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none rotate-[-20deg]">
                <span className="text-3xl font-extrabold text-ink-900 uppercase">
                  CONTOH DEMONSTRASI - BUKAN DOKUMEN SAH
                </span>
              </div>
              <FileText className="w-12 h-12 text-forest-700 mx-auto mb-2" />
              <h4 className="font-bold text-ink-900 font-mono text-sm">
                SIMULATED_IDENTITY_CARD.PDF
              </h4>
              <p className="text-xs text-ink-600 mt-1">
                Subjek: {selectedApplicant.nama} ({selectedApplicant.demoId})
              </p>
              <Badge variant="forest" size="sm" className="mt-3">
                Dokumen Sintetis Terverifikasi Format Demo
              </Badge>
            </div>
            <p className="text-[11px] text-ink-500">
              *Sistem demonstrasi tidak menyimpan file biner atau base64 asli dari perangkat pengguna.
            </p>
          </div>
        )}
      </Modal>

      {/* Action Decision Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={`Tindak Lanjut Berkas: ${selectedApplicant?.nama}`}
        maxWidth="md"
      >
        {selectedApplicant && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-ink-50 rounded border border-ink-200 space-y-1">
              <div>Nama: <strong>{selectedApplicant.nama}</strong></div>
              <div>ID Demonstrasi: <strong className="font-mono">{selectedApplicant.demoId}</strong></div>
              <div>Status Saat Ini: <strong>{selectedApplicant.status}</strong></div>
            </div>

            {/* If Staff: Only Verify & Recommend, NO final approval button */}
            {isStaff && (
              <div className="space-y-3 pt-2">
                <p className="text-ink-700">
                  Sebagai <strong>Staf Operasional</strong>, Anda berwenang memverifikasi kelengkapan berkas dan memberikan rekomendasi kelayakan ke Pengurus:
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRecommendByStaff(selectedApplicant.id)}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Rekomendasikan ke Pengurus (Dokumen Lengkap & Valid)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsActionModalOpen(false);
                      addToast({
                        type: "warning",
                        title: "Permintaan Perbaikan",
                        message: "Catatan perbaikan dikirim ke calon anggota.",
                      });
                    }}
                  >
                    Minta Calon Anggota Lengkapi Berkas
                  </Button>
                </div>
              </div>
            )}

            {/* If Manager / Board: Has Final Approval Authority */}
            {isManagerOrBoard && (
              <div className="space-y-3 pt-2">
                <p className="text-ink-700">
                  Sebagai <strong>Manajer / Pengurus</strong>, Anda memegang hak otorisasi final penerimaan anggota organisasi:
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApproveByBoard(selectedApplicant.id)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Setujui Keanggotaan Final & Terbitkan Nomor Anggota
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setIsActionModalOpen(false);
                      addToast({
                        type: "danger",
                        title: "Permohonan Ditolak",
                        message: "Pengurus menolak permohonan keanggotaan dengan alasan kebijakan organisasi.",
                      });
                    }}
                  >
                    Tolak Permohonan
                  </Button>
                </div>
              </div>
            )}

            {/* If Auditor: Read-Only message */}
            {isAuditor && (
              <div className="p-3 bg-ink-100 rounded text-ink-700 space-y-1">
                <strong>Mode Auditor Independen:</strong> Peran ini memiliki hak inspeksi kepatuhan (*Read-Only*) dan tidak berwenang memberikan rekomendasi atau persetujuan transaksi organisasi.
              </div>
            )}

            {/* If Admin / Super Admin */}
            {isAdminOrSuperAdmin && (
              <div className="space-y-2 pt-2 text-warning-800 bg-warning-100/50 p-3 rounded border border-warning-base/30">
                <p className="font-semibold">
                  Akses Dibatasi (Separation of Duties):
                </p>
                <p>
                  Peran <strong>{currentUser.roleName}</strong> tidak memiliki otoritas organisasi untuk mengeksekusi rekomendasi maupun persetujuan final keanggotaan.
                </p>
                <p className="text-[11px] text-ink-600">
                  Gunakan panel <em>Demo Role Switcher</em> di kanan bawah untuk beralih ke <strong>Staf Operasional</strong> atau <strong>Manajer / Pengurus</strong>.
                </p>
              </div>
            )}

            {/* If Financial Staff */}
            {isFinancialStaff && (
              <div className="space-y-2 pt-2 text-ink-700 bg-ink-100 p-3 rounded">
                <p>
                  Peran <strong>{currentUser.roleName}</strong> berfokus pada domain keuangan/kas dan tidak memiliki kewenangan verifikasi atau persetujuan keanggotaan organisasi.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
