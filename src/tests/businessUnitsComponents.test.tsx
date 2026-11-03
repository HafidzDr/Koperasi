// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminBusinessUnitsView } from "@/features/business-units/pages/AdminBusinessUnitsView";
import { MemberBusinessUnitsView } from "@/features/business-units/pages/MemberBusinessUnitsView";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessUnitStore } from "@/features/business-units/stores/businessUnitStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { demoUsers } from "@/mocks/seedData";

describe("PHASE 6 — Business Units Real DOM Components & User Interaction Tests", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useBusinessUnitStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. AdminBusinessUnitsView", () => {
    it("1.1. Manager melihat halaman portofolio unit usaha lengkap dengan tombol Tambah Unit dan Catat Aktivitas", () => {
      act(() => {
        useAuthStore.setState({ currentUser: demoUsers.manager });
      });

      render(
        <MemoryRouter>
          <AdminBusinessUnitsView />
        </MemoryRouter>
      );

      expect(screen.getByText("Portofolio Unit Usaha")).toBeTruthy();
      expect(screen.getByText("Tambah Unit Usaha")).toBeTruthy();
      expect(screen.getByText("Catat Aktivitas")).toBeTruthy();
      expect(screen.getByText(/Waserda KMB Mart Mandiri/i)).toBeTruthy();
      expect(screen.getByText(/Sentra Pengolahan Kopi/i)).toBeTruthy();
    });

    it("1.2. Auditor hanya melihat mode inspeksi/read-only tanpa tombol Tambah Unit atau Catat Aktivitas", () => {
      act(() => {
        useAuthStore.setState({ currentUser: demoUsers.auditor });
      });

      render(
        <MemoryRouter>
          <AdminBusinessUnitsView />
        </MemoryRouter>
      );

      expect(screen.getByText("Portofolio Unit Usaha")).toBeTruthy();
      // Auditor cannot mutate
      expect(screen.queryByText("Tambah Unit Usaha")).toBeNull();
      expect(screen.queryByText("Catat Aktivitas")).toBeNull();
      // But Auditor can export
      expect(screen.getByText("Ekspor Data")).toBeTruthy();
    });

    it("1.3. Pergantian tab navigasi antara Portofolio, Pencatatan Aktivitas, dan Rekapitulasi Kinerja", () => {
      act(() => {
        useAuthStore.setState({ currentUser: demoUsers.manager });
      });

      render(
        <MemoryRouter>
          <AdminBusinessUnitsView />
        </MemoryRouter>
      );

      // Default tab: Portofolio
      expect(screen.getByText("Daftar Portofolio Unit Usaha")).toBeTruthy();

      // Switch to Pencatatan Aktivitas
      const activitiesTabBtn = screen.getByRole("button", {
        name: /Pencatatan Aktivitas/i,
      });
      fireEvent.click(activitiesTabBtn);
      expect(screen.getByText("Riwayat Aktivitas Operasional")).toBeTruthy();

      // Switch to Rekapitulasi Kinerja
      const recapTabBtn = screen.getByRole("button", {
        name: /Rekapitulasi Kinerja/i,
      });
      fireEvent.click(recapTabBtn);
      expect(screen.getByText(/Matriks Rekapitulasi Kinerja per Unit Usaha/i)).toBeTruthy();
      expect(screen.getByText(/Agregasi Keterlibatan Ekonomi Anggota/i)).toBeTruthy();
    });

    it("1.4. Membuka modal Tambah Unit Usaha dan melakukan penutupan modal", () => {
      act(() => {
        useAuthStore.setState({ currentUser: demoUsers.manager });
      });

      render(
        <MemoryRouter>
          <AdminBusinessUnitsView />
        </MemoryRouter>
      );

      const addBtn = screen.getByText("Tambah Unit Usaha");
      fireEvent.click(addBtn);

      expect(screen.getByText("Tambah Unit Usaha Baru")).toBeTruthy();
      expect(screen.getByPlaceholderText(/Misal: WSR-02, LOG-02/i)).toBeTruthy();

      // Close modal
      const cancelBtn = screen.getByText("Batal");
      fireEvent.click(cancelBtn);

      expect(screen.queryByText("Tambah Unit Usaha Baru")).toBeNull();
    });
  });

  describe("2. MemberBusinessUnitsView", () => {
    it("2.1. Anggota melihat ringkasan partisipasi belanja pribadi dan katalog unit usaha aktif", () => {
      act(() => {
        useAuthStore.setState({
          currentUser: {
            ...demoUsers.member,
            memberId: "DEMO-ID-0001",
          },
        });
      });

      render(
        <MemoryRouter>
          <MemberBusinessUnitsView />
        </MemoryRouter>
      );

      expect(screen.getByText("Unit Usaha & Belanja Anggota")).toBeTruthy();
      expect(screen.getByText("Total Belanja di Waserda")).toBeTruthy();
      expect(screen.getByText("Pasokan Komoditas Hasil Usaha")).toBeTruthy();
      expect(screen.getByText(/Katalog Unit Usaha Koperasi KMB/i)).toBeTruthy();
      expect(screen.getByText(/Riwayat Partisipasi & Belanja Anda/i)).toBeTruthy();
      expect(screen.getByText(/Privasi Terjaga/i)).toBeTruthy();
    });

    it("2.2. Anggota hanya melihat riwayat transaksi miliknya dan tidak ada data anggota lain", () => {
      act(() => {
        useAuthStore.setState({
          currentUser: {
            ...demoUsers.member,
            memberId: "DEMO-ID-0001",
          },
        });
      });

      render(
        <MemoryRouter>
          <MemberBusinessUnitsView />
        </MemoryRouter>
      );

      // Siti Rahma's transactions
      expect(screen.getByText(/TRX-BU-2026-0001/i)).toBeTruthy();
      expect(screen.getByText(/TRX-BU-2026-0003/i)).toBeTruthy();

      // Dian Pratama's transaction (TRX-BU-2026-0002) should NOT be displayed in Siti's table
      expect(screen.queryByText("TRX-BU-2026-0002")).toBeNull();
    });
  });
});
