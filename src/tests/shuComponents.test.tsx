// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AdminShuView } from "../features/shu/pages/AdminShuView";
import { MemberShuPortalView } from "../features/shu/pages/MemberShuPortalView";
import { useAuthStore } from "../stores/authStore";
import { useShuStore } from "../features/shu/stores/shuStore";
import { useToastStore } from "../stores/toastStore";
import { demoUsers } from "../mocks/seedData";

describe("PHASE 7 — SHU Components Real DOM & User Interaction Tests", () => {
  beforeEach(() => {
    useShuStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. AdminShuView DOM Rendering & Tab Navigation", () => {
    it("1.1. Menampilkan header pengelolaan SHU, banner simulasi, dan kartu ringkasan eksekutif", () => {
      useAuthStore.setState({ currentUser: demoUsers.manager, currentRole: "manager" });

      render(
        <BrowserRouter>
          <AdminShuView initialTab="overview" />
        </BrowserRouter>
      );

      expect(screen.getByText(/Pengelolaan Sisa Hasil Usaha \(SHU\)/i)).toBeTruthy();
      expect(screen.getByText(/DEMO MODE — Pengelolaan SHU Terkendali/i)).toBeTruthy();
      expect(screen.getAllByText(/Hasil Usaha Bersih/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/SHU Dialokasikan/i)).toBeTruthy();
      expect(screen.getByText(/Matriks Alokasi Kebijakan SHU/i)).toBeTruthy();
    });

    it("1.2. Navigasi tab berfungsi dengan baik (berpindah ke tab Kebijakan Alokasi)", () => {
      useAuthStore.setState({ currentUser: demoUsers.manager, currentRole: "manager" });

      render(
        <BrowserRouter>
          <AdminShuView initialTab="overview" />
        </BrowserRouter>
      );

      const tabBtn = screen.getByRole("button", { name: /Kebijakan Alokasi/i });
      fireEvent.click(tabBtn);

      expect(screen.getByText(/Formula Alokasi Pembagian SHU/i)).toBeTruthy();
      expect(screen.getByText(/1. Dana Cadangan \(%\)/i)).toBeTruthy();
      expect(screen.getByText(/2. Jasa Modal Anggota \(%\)/i)).toBeTruthy();
      expect(screen.getByText(/U-07: Ilustratif — Perlu Penetapan RAT/i)).toBeTruthy();
    });

    it("1.3. Tab Simulasi Kalkulasi menampilkan form input finansial dan tombol eksekusi", () => {
      useAuthStore.setState({ currentUser: demoUsers.finance_officer, currentRole: "finance_officer" });

      render(
        <BrowserRouter>
          <AdminShuView initialTab="perhitungan" />
        </BrowserRouter>
      );

      expect(screen.getByText(/Input Kinerja Keuangan Demonstrasi/i)).toBeTruthy();
      expect(screen.getByText(/Total Pendapatan Kotor \(IDR\)/i)).toBeTruthy();
      expect(screen.getByText(/Total Beban Operasional \(IDR\)/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: /Jalankan Kalkulasi Simulasi/i })).toBeTruthy();
    });

    it("1.4. Tab Pemeriksaan menampilkan peringatan SoD bila currentUser adalah pembuat kalkulasi", () => {
      // SNAP-2025-v1 dihitung oleh Ahmad Fauzi (finance_officer)
      useAuthStore.setState({ currentUser: demoUsers.finance_officer, currentRole: "finance_officer" });

      render(
        <BrowserRouter>
          <AdminShuView initialTab="pemeriksaan" />
        </BrowserRouter>
      );

      expect(screen.getByText(/Pemisahan Tugas \(SoD\) Aktif:/i)).toBeTruthy();
      expect(screen.getByText(/dilarang memberikan persetujuan akhir terhadap kalkulasi buatan sendiri/i)).toBeTruthy();
    });
  });

  describe("2. MemberShuPortalView DOM Rendering & Privacy Tests", () => {
    it("2.1. Menampilkan rincian SHU resmi untuk Anggota aktif (Siti Rahma)", () => {
      useAuthStore.setState({ currentUser: demoUsers.member, currentRole: "member" });

      render(
        <BrowserRouter>
          <MemberShuPortalView />
        </BrowserRouter>
      );

      expect(screen.getByText(/Sisa Hasil Usaha \(SHU\) Saya/i)).toBeTruthy();
      expect(screen.getByText(/Tahun Buku 2024/i)).toBeTruthy();
      expect(screen.getByText(/Dipublikasikan Resmi/i)).toBeTruthy();
      expect(screen.getByText(/Total SHU Diterima/i)).toBeTruthy();
      expect(screen.getByText(/Bagian Jasa Modal/i)).toBeTruthy();
      expect(screen.getByText(/Bagian Jasa Usaha/i)).toBeTruthy();
      expect(screen.getByText(/Rincian Komponen Pembagian SHU/i)).toBeTruthy();
      expect(screen.getByText(/Transparansi Alokasi Kelembagaan Koperasi/i)).toBeTruthy();
    });

    it("2.2. Menampilkan kondisi aman bila sesi anggota tidak memiliki memberId valid", () => {
      const anonymousMember = {
        ...demoUsers.member,
        memberId: undefined,
      };
      useAuthStore.setState({ currentUser: anonymousMember, currentRole: "member" });

      render(
        <BrowserRouter>
          <MemberShuPortalView />
        </BrowserRouter>
      );

      expect(screen.getByText(/Identitas Anggota Tidak Ditemukan/i)).toBeTruthy();
      expect(screen.queryByText(/Total SHU Diterima/i)).toBeNull();
    });

    it("2.3. Menampilkan empty state bila belum ada SHU yang dipublikasikan", () => {
      // Hapus status published pada seed
      useShuStore.setState({
        periods: useShuStore.getState().periods.filter((p) => p.status !== "published" && p.status !== "closed"),
      });
      useAuthStore.setState({ currentUser: demoUsers.member, currentRole: "member" });

      render(
        <BrowserRouter>
          <MemberShuPortalView />
        </BrowserRouter>
      );

      expect(screen.getByText(/Belum Ada SHU yang Dipublikasikan/i)).toBeTruthy();
      expect(screen.queryByText(/Total SHU Diterima/i)).toBeNull();
    });

  });
});
