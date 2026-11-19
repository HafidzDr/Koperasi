// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomeView } from "@/features/public/HomeView";
import { AboutView } from "@/features/public/AboutView";
import { PublicSavingsCatalogView } from "@/features/savings/pages/PublicSavingsCatalogView";
import { PublicLoanCatalogView } from "@/features/loans/pages/PublicLoanCatalogView";
import { RegistrationWizardView } from "@/features/public/RegistrationWizardView";
import { ApplicationTrackingView } from "@/features/membership/pages/ApplicationTrackingView";
import { ModulePlaceholderView } from "@/components/common/ModulePlaceholderView";
import { PublicLayout } from "@/layouts/PublicLayout";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useConfigStore } from "@/stores/configStore";
import { useAuthStore } from "@/stores/authStore";

describe("STAGE 3 — Public Website Redesign Quality Gates", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useConfigStore.getState().resetConfig();
    useAuthStore.getState().resetToDefault();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Public Route Renders & Structural Integrity", () => {
    it("renders HomeView with editorial H1, value propositions, and FAQ", () => {
      render(
        <MemoryRouter>
          <HomeView />
        </MemoryRouter>
      );

      // Semantic H1 check
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeDefined();
      expect(h1.textContent).toContain("Tumbuh Bersama");

      // Check section titles
      expect(screen.getByText("Keanggotaan Terbuka")).toBeDefined();
      expect(screen.getByText("Solusi Keuangan Berkeadilan untuk Anggota")).toBeDefined();
      expect(screen.getByText("Pertanyaan yang Sering Diajukan")).toBeDefined();
    });

    it("renders AboutView with institutional legal data and leadership", () => {
      render(
        <MemoryRouter>
          <AboutView />
        </MemoryRouter>
      );

      expect(screen.getByText("Legalitas & Kelembagaan")).toBeDefined();
      expect(screen.getByText("Visi & Arah Strategis")).toBeDefined();
      expect(screen.getByText("Hendra Kurniawan")).toBeDefined();
      expect(screen.getByText("Sri Mulyani")).toBeDefined();
      expect(screen.getByText("Bambang Irawan")).toBeDefined();
    });

    it("renders PublicSavingsCatalogView with product cards and matrix table", () => {
      render(
        <MemoryRouter>
          <PublicSavingsCatalogView />
        </MemoryRouter>
      );

      expect(screen.getByText("Simpanan Pokok")).toBeDefined();
      expect(screen.getByText("Simpanan Wajib")).toBeDefined();
      expect(screen.getByText("Simpanan Sukarela")).toBeDefined();
      expect(screen.getByText("Matriks Perbandingan Karakteristik Simpanan")).toBeDefined();
    });

    it("renders PublicLoanCatalogView with product catalog and calculator", () => {
      render(
        <MemoryRouter>
          <PublicLoanCatalogView />
        </MemoryRouter>
      );

      expect(screen.getByText("Layanan Pembiayaan Nusantara Maju")).toBeDefined();
      expect(screen.getByText("Kalkulator Simulasi Pembiayaan")).toBeDefined();
      expect(screen.getByText("Estimasi Angsuran Bulanan")).toBeDefined();
    });

    it("renders RegistrationWizardView step 1 with accessible inputs and auto ID", () => {
      render(
        <MemoryRouter>
          <RegistrationWizardView />
        </MemoryRouter>
      );

      expect(screen.getByText("Formulir Permohonan Menjadi Anggota")).toBeDefined();
      expect(screen.getByLabelText(/Nama Lengkap Sesuai Dokumen/i)).toBeDefined();
      expect(screen.getByLabelText(/Alamat Email Kontak/i)).toBeDefined();
      expect(screen.getByText("ID Demonstrasi Pendaftar")).toBeDefined();
    });

    it("renders ApplicationTrackingView with search bar and demo quick pickers", () => {
      render(
        <MemoryRouter>
          <ApplicationTrackingView />
        </MemoryRouter>
      );

      expect(screen.getByText("Lacak Status Pengajuan Keanggotaan")).toBeDefined();
      expect(screen.getByPlaceholderText(/Masukkan Kode Registrasi/i)).toBeDefined();
      expect(screen.getByRole("button", { name: "Cari Status" })).toBeDefined();
    });

    it("renders dedicated public placeholder for /cara-bergabung", () => {
      render(
        <MemoryRouter>
          <ModulePlaceholderView
            title="Tata Cara & Syarat Keanggotaan Nusantara Maju"
            description="Langkah pendaftaran anggota, pembayaran simpanan awal, dan hak bersuara."
            environment="Public"
            phasePlanned={4}
          />
        </MemoryRouter>
      );

      expect(screen.getByText("Tata Cara & Syarat Keanggotaan Nusantara Maju")).toBeDefined();
      expect(screen.getByText("Empat Langkah Menjadi Anggota")).toBeDefined();
      expect(screen.getByText("Persyaratan Utama Calon Anggota")).toBeDefined();
    });

    it("renders dedicated public placeholder for /transparansi", () => {
      render(
        <MemoryRouter>
          <ModulePlaceholderView
            title="Transparansi & Akuntabilitas Publik"
            description="Laporan tahunan ringkas dan kepatuhan prinsip keterbukaan informasi koperasi."
            environment="Public"
            phasePlanned={7}
          />
        </MemoryRouter>
      );

      expect(screen.getByText("Transparansi & Akuntabilitas Publik")).toBeDefined();
      expect(screen.getByText("Empat Pilar Tata Kelola Akuntabel")).toBeDefined();
      expect(screen.getByText("Buku Mutasi Saldo Digital")).toBeDefined();
    });
  });

  describe("2. Masalah A & Masalah B — CTA Consistency & Validation", () => {
    it("ensures all public CTA banners use standardized pattern (Daftar Menjadi Anggota & Pelajari Layanan Simpanan)", () => {
      render(
        <MemoryRouter>
          <HomeView />
        </MemoryRouter>
      );

      // Verify standardized primary CTA presence
      const primaryCtas = screen.getAllByRole("button", { name: /Daftar Menjadi Anggota/i });
      expect(primaryCtas.length).toBeGreaterThanOrEqual(1);

      // Verify standardized secondary CTA presence
      const secondaryCtas = screen.getAllByRole("button", { name: /Pelajari Layanan Simpanan/i });
      expect(secondaryCtas.length).toBeGreaterThanOrEqual(1);
    });

    it("verifies no button exists without descriptive label or text (Masalah A)", () => {
      const { container } = render(
        <MemoryRouter>
          <HomeView />
        </MemoryRouter>
      );

      const allButtons = container.querySelectorAll("button");
      allButtons.forEach((btn) => {
        const text = btn.innerText || btn.textContent || btn.getAttribute("aria-label");
        expect(text && text.trim().length > 0).toBe(true);
      });
    });

    it("verifies public layout Floating Fill navbar and Floating Settings are intact", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      // Floating Fill navbar links
      expect(screen.getByRole("link", { name: "Beranda" })).toBeDefined();
      expect(screen.getByRole("link", { name: "Tentang Koperasi" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Daftar Anggota" })).toBeDefined();

      // Floating Settings Controller trigger
      expect(screen.getByRole("button", { name: /Pengaturan Demonstrasi & Peran/i })).toBeDefined();
    });
  });
});
