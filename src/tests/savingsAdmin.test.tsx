// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { AdminSavingsManagementView } from "@/features/savings/pages/AdminSavingsManagementView";
import { useAuthStore } from "@/stores/authStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useSavingsStore } from "@/features/savings/stores/savingsStore";
import { useToastStore } from "@/stores/toastStore";
import { demoUsers } from "@/mocks/seedData";

describe("PHASE 4 — AdminSavingsManagementView Real DOM Component & SoD Tests", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useSavingsStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("1. Finance Officer melihat dashboard administrasi simpanan dan antrean verifikasi", () => {
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
    });

    render(<AdminSavingsManagementView />);

    expect(screen.getByText("Manajemen Simpanan Anggota")).toBeTruthy();
    expect(screen.getByText("Petugas Keuangan")).toBeTruthy();
    expect(screen.getByText(/Total Saldo Simpanan/i)).toBeTruthy();

    // Pending queue tab is active by default
    expect(screen.getByText(/Antrean Pemeriksaan & Otorisasi/i)).toBeTruthy();
  });

  it("2. Pembuat transaksi ditandai dengan peringatan SoD dan tombol Setujui berstatus disabled", () => {
    let trxStaffId: string | undefined;
    let trxFOId: string | undefined;

    // Dewi Lestari (staff) creates a transaction
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.staff });
      const res1 = useSavingsStore.getState().recordStaffTransaction({
        memberDemoId: "DEMO-ID-0001",
        savingsType: "sukarela",
        transactionType: "deposit",
        amount: 500000,
      });
      trxStaffId = res1.transactionId;
    });

    // Finance Officer (Ahmad Fauzi) creates another transaction
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
      const res2 = useSavingsStore.getState().recordStaffTransaction({
        memberDemoId: "DEMO-ID-0007",
        savingsType: "wajib",
        transactionType: "deposit",
        amount: 50000,
      });
      trxFOId = res2.transactionId;
    });

    // Dewi Lestari verifies both transactions so they enter under_review stage
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.staff });
      if (trxStaffId) useSavingsStore.getState().reviewTransaction(trxStaffId);
      if (trxFOId) useSavingsStore.getState().reviewTransaction(trxFOId);
    });

    // Render as Ahmad Fauzi (FO)
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
    });
    render(<AdminSavingsManagementView />);

    // Warning SoD must be rendered for Ahmad Fauzi's own transaction
    expect(screen.getAllByText(/Peringatan SoD/i).length).toBeGreaterThanOrEqual(1);

    // The approve button for his own transaction must be disabled
    const approveBtns = screen.getAllByRole("button", { name: /^Setujui$/i });
    expect(approveBtns.some((btn) => (btn as HTMLButtonElement).disabled)).toBe(true);
    expect(approveBtns.some((btn) => !(btn as HTMLButtonElement).disabled)).toBe(true);
  });

  it("3. Filter pencarian pada Tab 2 memfilter daftar transaksi", () => {
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.staff });
    });

    render(<AdminSavingsManagementView />);

    // Switch to tab 2
    const tabTrx = screen.getByText(/2. Daftar Transaksi/i);
    fireEvent.click(tabTrx);

    expect(screen.getByText("Seluruh Transaksi Simpanan")).toBeTruthy();

    // Type query "DEMO-ID-0001"
    const searchInput = screen.getByPlaceholderText(/Cari ID\/nama\/nomor/i);
    fireEvent.change(searchInput, { target: { value: "DEMO-ID-0001" } });

    // Table should show Siti Rahma
    expect(screen.getAllByText("Siti Rahma").length).toBeGreaterThan(0);
  });

  it("4. Tab 3 Direktori Saldo Anggota menampilkan rekapitulasi seluruh anggota", () => {
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.finance_officer });
    });

    render(<AdminSavingsManagementView />);

    // Switch to Tab 3
    const tabMembers = screen.getByText(/3. Direktori Saldo Anggota/i);
    fireEvent.click(tabMembers);

    expect(screen.getByText("Direktori Buku Simpanan Anggota")).toBeTruthy();
    expect(screen.getByText("Siti Rahma")).toBeTruthy();
    expect(screen.getByText("Dian Pratama")).toBeTruthy();
    expect(screen.getByText("Eko Prasetyo")).toBeTruthy();
  });

  it("5. Tab 5 Laporan & Rekapitulasi menampilkan metrik agregat dinamis", () => {
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.auditor });
    });

    render(<AdminSavingsManagementView />);

    // Switch to Tab 5
    const tabReports = screen.getByText(/5. Laporan & Rekapitulasi/i);
    fireEvent.click(tabReports);

    expect(screen.getByText(/Laporan Rekapitulasi Simpanan Koperasi/i)).toBeTruthy();
    expect(screen.getByText(/Total Akumulasi Masuk/i)).toBeTruthy();
    expect(screen.getByText(/Total Akumulasi Keluar/i)).toBeTruthy();
    expect(screen.getByText(/Distribusi Status Transaksi/i)).toBeTruthy();
  });

  it("6. Tab 6 Konfigurasi Produk Simpanan dapat diperbarui oleh Bendahara", () => {
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.treasurer });
    });

    render(<AdminSavingsManagementView />);

    // Switch to Tab 6
    const tabConfig = screen.getByText(/6. Konfigurasi Produk Simpanan/i);
    fireEvent.click(tabConfig);

    expect(screen.getByText("Parameter Produk Simpanan Sukarela")).toBeTruthy();

    const minDepositInput = screen.getByLabelText(/Setoran Minimum/i);
    fireEvent.change(minDepositInput, { target: { value: "25000" } });

    const submitBtn = screen.getByRole("button", { name: /Simpan Parameter Sukarela/i });
    fireEvent.click(submitBtn);

    const toasts = useToastStore.getState().toasts;
    expect(
      toasts.some(
        (t) => t.type === "success" && t.title.includes("Parameter Simpanan Sukarela Diperbarui")
      )
    ).toBe(true);

    expect(useSavingsStore.getState().sukarelaConfig.minDeposit).toBe(25000);
  });
});
