// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PublicLoanCatalogView } from "@/features/loans/pages/PublicLoanCatalogView";
import { MemberLoanPortalView } from "@/features/loans/pages/MemberLoanPortalView";
import { AdminLoanManagementView } from "@/features/loans/pages/AdminLoanManagementView";
import { useAuthStore } from "@/stores/authStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useLoanStore } from "@/features/loans/stores/loanStore";
import { useToastStore } from "@/stores/toastStore";
import { demoUsers } from "@/mocks/seedData";

describe("Loan Components DOM Rendering & Interaction Tests", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useLoanStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. PublicLoanCatalogView", () => {
    it("1.1. Menampilkan katalog produk, disclaimer ilustrasi, dan kalkulator simulasi pinjaman", () => {
      render(
        <MemoryRouter>
          <PublicLoanCatalogView />
        </MemoryRouter>
      );

      // Hero & Disclaimer
      expect(screen.getByText("Layanan Pembiayaan Koperasi KMB")).toBeTruthy();
      expect(screen.getByText(/Parameter kebijakan pinjaman/i)).toBeTruthy();

      // Product cards
      expect(screen.getByText("Pinjaman Konsumtif Anggota")).toBeTruthy();
      expect(screen.getByText("Pinjaman Modal Usaha Produktif")).toBeTruthy();
      expect(screen.getByText("Pinjaman Siaga Darurat")).toBeTruthy();

      // Simulator
      expect(screen.getByText("Kalkulator Simulasi Pembiayaan")).toBeTruthy();
      expect(screen.getByText(/Estimasi Angsuran Bulanan/i)).toBeTruthy();
    });
  });

  describe("2. MemberLoanPortalView", () => {
    it("2.1. Member aktif dengan memberId valid melihat portofolio pinjaman miliknya sendiri", () => {
      act(() => {
        useAuthStore.setState({ currentUser: demoUsers.member });
      });

      render(
        <MemoryRouter>
          <MemberLoanPortalView />
        </MemoryRouter>
      );

      // Header identitas
      expect(screen.getByText("Portal Pinayaan & Angsuran Anggota")).toBeTruthy();
      expect(screen.getByText("Siti Rahma")).toBeTruthy();
      expect(screen.getByText("KMB-2026-0001")).toBeTruthy();

      // Pinjaman berjalan milik Siti Rahma (PJ-2026-0001)
      expect(screen.getByText("PJ-2026-0001")).toBeTruthy();
      expect(screen.getByText("Lancar")).toBeTruthy();

      // Memastikan nama anggota lain TIDAK muncul
      expect(screen.queryByText("Budi Santoso")).toBeNull();
      expect(screen.queryByText("Joko Widodo")).toBeNull();
    });

    it("2.2. Menampilkan EmptyState yang aman jika currentUser tidak memiliki memberId valid", () => {
      act(() => {
        useAuthStore.setState({
          currentUser: {
            ...demoUsers.member,
            memberId: undefined,
          },
        });
      });

      render(
        <MemoryRouter>
          <MemberLoanPortalView />
        </MemoryRouter>
      );

      expect(screen.getByText("Profil Anggota Tidak Ditemukan")).toBeTruthy();
      expect(screen.queryByText("PJ-2026-0001")).toBeNull();
    });
  });

  describe("3. AdminLoanManagementView", () => {
    it("3.1. Finance Officer dapat melihat antrean verifikasi, siap cair, dan portofolio 30 rekord pinjaman", () => {
      act(() => {
        useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      });

      render(
        <MemoryRouter>
          <AdminLoanManagementView />
        </MemoryRouter>
      );

      // Header identitas
      expect(screen.getByText("Manajemen Pinjaman & Angsuran")).toBeTruthy();
      expect(screen.getByText("Ahmad Fauzi")).toBeTruthy();

      // Tab navigasi
      expect(screen.getByRole("button", { name: /Antrean Persetujuan/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Siap Dicairkan/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Portofolio & Kolektibilitas/i })).toBeTruthy();

      // Switch to Portfolio tab
      const portfolioTab = screen.getByRole("button", { name: /Portofolio & Kolektibilitas/i });
      act(() => {
        fireEvent.click(portfolioTab);
      });

      // Verify table headers and seed records
      expect(screen.getByText("Portofolio Pinjaman & Kolektibilitas Anggota")).toBeTruthy();
      expect(screen.getByText("PJ-2026-0001")).toBeTruthy();
      expect(screen.getByText("PJ-2026-0002")).toBeTruthy();
    });
  });
});
