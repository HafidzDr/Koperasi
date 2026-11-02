import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import { HomeView } from "@/features/public/HomeView";
import { AboutView } from "@/features/public/AboutView";
import { RegistrationWizardView } from "@/features/public/RegistrationWizardView";
import { ApplicationTrackingView } from "@/features/membership/pages/ApplicationTrackingView";

import { MemberDashboardView } from "@/features/member/MemberDashboardView";
import { MemberProfilePortalView } from "@/features/membership/pages/MemberProfilePortalView";
import { AdminDashboardView } from "@/features/admin/AdminDashboardView";
import { MemberVerificationView } from "@/features/admin/MemberVerificationView";
import { MemberListView } from "@/features/membership/pages/MemberListView";
import { PlatformSettingsView } from "@/features/admin/PlatformSettingsView";
import { PublicSavingsCatalogView } from "@/features/savings/pages/PublicSavingsCatalogView";
import { MemberSavingsPortalView } from "@/features/savings/pages/MemberSavingsPortalView";
import { AdminSavingsManagementView } from "@/features/savings/pages/AdminSavingsManagementView";
import { ModulePlaceholderView } from "@/components/common/ModulePlaceholderView";
import { RouteGuard } from "@/components/common/RouteGuard";

export const router = createBrowserRouter([
  // 1. PUBLIC WEBSITE ENVIRONMENT
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomeView /> },
      { path: "tentang", element: <AboutView /> },
      {
        path: "layanan/simpanan",
        element: <PublicSavingsCatalogView />,
      },
      {
        path: "layanan/pinjaman",
        element: (
          <ModulePlaceholderView
            moduleKey="loans"
            title="Layanan Pembiayaan & Pinjaman"
            description="Kalkulator simulasi pinjaman produktif modal usaha bagi anggota."
            environment="Public"
            phasePlanned={5}
          />
        ),
      },
      {
        path: "cara-bergabung",
        element: (
          <ModulePlaceholderView
            title="Tata Cara & Syarat Keanggotaan KMB"
            description="Langkah pendaftaran anggota, pembayaran simpanan awal, dan hak bersuara."
            environment="Public"
            phasePlanned={4}
          />
        ),
      },
      { path: "daftar", element: <RegistrationWizardView /> },
      { path: "status-pengajuan", element: <ApplicationTrackingView /> },
      {
        path: "transparansi",
        element: (
          <ModulePlaceholderView
            title="Transparansi & Akuntabilitas Publik"
            description="Laporan tahunan ringkas dan kepatuhan prinsip keterbukaan informasi koperasi."
            environment="Public"
            phasePlanned={7}
          />
        ),
      },
    ],
  },

  // 2. MEMBER PORTAL ENVIRONMENT
  {
    path: "/portal",
    element: (
      <RouteGuard>
        <MemberLayout />
      </RouteGuard>
    ),
    children: [
      { index: true, element: <MemberDashboardView /> },
      {
        path: "simpanan",
        element: <MemberSavingsPortalView />,
      },
      {
        path: "pinjaman",
        element: (
          <ModulePlaceholderView
            moduleKey="loans"
            title="Pinjaman & Jadwal Angsuran"
            description="Status kolektibilitas pinjaman aktif, rincian jadwal jatuh tempo, dan pengajuan baru."
            environment="Portal"
            phasePlanned={5}
          />
        ),
      },
      {
        path: "pembayaran",
        element: (
          <ModulePlaceholderView
            title="Pusat Pembayaran Simulasi"
            description="Instruksi transfer manual simulasi bukti bayar serta gateway instan (VA sintetis & QRIS mock)."
            environment="Portal"
            phasePlanned={6}
          />
        ),
      },
      {
        path: "shu",
        element: (
          <ModulePlaceholderView
            moduleKey="shu"
            title="Alokasi Sisa Hasil Usaha (SHU)"
            description="Riwayat pembagian SHU dan proyeksi jasa modal serta jasa anggota."
            environment="Portal"
            phasePlanned={6}
          />
        ),
      },
      {
        path: "unit-usaha",
        element: (
          <ModulePlaceholderView
            moduleKey="business_units"
            title="Katalog & Transaksi Unit Usaha"
            description="Pencatatan omzet belanja anggota di unit retail/waserda untuk kalkulasi jasa transaksi."
            environment="Portal"
            phasePlanned={6}
          />
        ),
      },
      {
        path: "rapat",
        element: (
          <ModulePlaceholderView
            moduleKey="meetings"
            title="Rapat Anggota Tahunan & Bilik Suara"
            description="Presensi kuorum digital terpisah dan simulasi e-voting keputusan AD/ART (1 Member = 1 Vote)."
            environment="Portal"
            phasePlanned={6}
          />
        ),
      },
      {
        path: "profil",
        element: <MemberProfilePortalView />,
      },
      {
        path: "bantuan",
        element: (
          <ModulePlaceholderView
            title="Bantuan & Dukungan Anggota"
            description="Panduan penggunaan portal dan informasi operasional koperasi."
            environment="Portal"
            phasePlanned={4}
          />
        ),
      },
    ],
  },

  // 3. ADMINISTRATION SYSTEM ENVIRONMENT
  {
    path: "/admin",
    element: (
      <RouteGuard>
        <AdminLayout />
      </RouteGuard>
    ),
    children: [
      { index: true, element: <AdminDashboardView /> },
      { path: "anggota/verifikasi", element: <MemberVerificationView /> },
      { path: "anggota", element: <MemberListView /> },
      {
        path: "simpanan",
        element: <AdminSavingsManagementView />,
      },
      {
        path: "pinjaman",
        element: (
          <ModulePlaceholderView
            moduleKey="loans"
            title="Manajemen Pengajuan & Pencairan Pinjaman"
            description="Workflow persetujuan berjenjang: Level 1 Verifikasi, Level 2 Analisa FO, Level 3 Approval Pengurus."
            environment="Admin"
            phasePlanned={5}
          />
        ),
      },
      {
        path: "keuangan",
        element: (
          <ModulePlaceholderView
            title="Buku Kas Harian & Rekonsiliasi"
            description="Pencatatan mutasi kas operasional, rekonsiliasi transfer anggota, dan verifikasi bukti bayar."
            environment="Admin"
            phasePlanned={6}
          />
        ),
      },
      {
        path: "unit-usaha",
        element: (
          <ModulePlaceholderView
            moduleKey="business_units"
            title="Portofolio Unit Usaha Koperasi"
            description="Manajemen toko/waserda, pencatatan omzet unit, dan agregasi kontribusi belanja anggota."
            environment="Admin"
            phasePlanned={6}
          />
        ),
      },
      {
        path: "rapat",
        element: (
          <ModulePlaceholderView
            moduleKey="meetings"
            title="Penyelenggaraan Rapat Anggota (RAT/RALB)"
            description="Publikasi agenda, repositori LPJ/RAPBK, pemantauan kuorum presensi, dan rekap e-voting."
            environment="Admin"
            phasePlanned={6}
          />
        ),
      },
      {
        path: "laporan",
        element: (
          <ModulePlaceholderView
            moduleKey="reports"
            title="Laporan Keuangan Demonstrasi"
            description="Neraca seimbang, Laporan Laba Rugi, dan Arus Kas (Akses Administrator: View & Export teknis)."
            environment="Admin"
            phasePlanned={7}
          />
        ),
      },
      {
        path: "audit",
        element: (
          <ModulePlaceholderView
            moduleKey="audit_trail"
            title="Antarmuka Audit Trail Operasional"
            description="Penelusuran jejak aktivitas seluruh pengguna secara kronologis (Read-Only)."
            environment="Admin"
            phasePlanned={7}
          />
        ),
      },
      { path: "pengaturan", element: <PlatformSettingsView /> },
    ],
  },

  // Fallback Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
