// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemberSavingsPortalView } from "@/features/savings/pages/MemberSavingsPortalView";
import { useAuthStore } from "@/stores/authStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useSavingsStore } from "@/features/savings/stores/savingsStore";
import { useToastStore } from "@/stores/toastStore";
import { demoUsers } from "@/mocks/seedData";

describe("PHASE 4 — MemberSavingsPortalView Real DOM Component & Privacy Tests", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useSavingsStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("1. Member aktif dengan memberId valid melihat saldo dan data simpanan miliknya sendiri", () => {
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.member });
    });

    render(<MemberSavingsPortalView />);

    // Header & Identity
    expect(screen.getByText("Buku Simpanan Saya")).toBeTruthy();
    expect(screen.getByText("Siti Rahma")).toBeTruthy();
    expect(screen.getByText("KMB-2026-0001")).toBeTruthy();

    // Saldo Pokok, Wajib, Sukarela cards exist in DOM
    expect(screen.getByText("Simpanan Pokok (SP)")).toBeTruthy();
    expect(screen.getByText("Simpanan Wajib (SW)")).toBeTruthy();
    expect(screen.getByText("Simpanan Sukarela (SS)")).toBeTruthy();

    // Verify other members' names are NOT displayed
    expect(screen.queryByText("Dian Pratama")).toBeNull();
    expect(screen.queryByText("Eko Prasetyo")).toBeNull();
    expect(screen.queryByText("Ratna Juwita")).toBeNull();
  });

  it("2. Member tanpa memberId menampilkan EmptyState yang aman tanpa fallback ke anggota lain", () => {
    act(() => {
      useAuthStore.setState({
        currentUser: {
          ...demoUsers.member,
          memberId: undefined,
        },
      });
    });

    render(<MemberSavingsPortalView />);

    // EmptyState
    expect(screen.getByText("Rekening Simpanan Tidak Ditemukan")).toBeTruthy();
    expect(screen.getByText(/belum memiliki tautan identitas anggota aktif/i)).toBeTruthy();

    // Must NOT render any member's saldo or name
    expect(screen.queryByText("Siti Rahma")).toBeNull();
    expect(screen.queryByText("Dian Pratama")).toBeNull();
    expect(screen.queryByText("KMB-2026-0001")).toBeNull();
  });

  it("3. Tab Riwayat Transaksi menampilkan transaksi milik member", () => {
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.member });
    });

    render(<MemberSavingsPortalView />);

    // Switch to tab 2: Riwayat Transaksi
    const tabHistory = screen.getByText(/Riwayat Transaksi/i);
    fireEvent.click(tabHistory);

    // Initial seed transactions for Siti Rahma should be visible in table
    expect(screen.getByText("SAV-TRX-2026-0001")).toBeTruthy();
    expect(screen.getByText("SAV-TRX-2026-0002")).toBeTruthy();
  });

  it("4. Form Pengajuan Setoran memvalidasi nominal dan menambahkan pengajuan ke antrean aktif", () => {
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.member });
    });

    render(<MemberSavingsPortalView />);

    // Click "Setor Simpanan" button to open modal
    const setorBtn = screen.getByRole("button", { name: /^Setor Simpanan$/i });
    fireEvent.click(setorBtn);

    expect(screen.getByText("Form Pengajuan Setoran Simpanan")).toBeTruthy();

    // Submit with empty/invalid amount
    const submitBtn = screen.getByRole("button", { name: /Kirim Pengajuan Setoran/i });
    const amountInput = screen.getByLabelText(/Nominal Setoran/i);

    fireEvent.change(amountInput, { target: { value: "0" } });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Nominal setoran harus berupa angka positif.")).toBeTruthy();

    // Submit with valid amount
    fireEvent.change(amountInput, { target: { value: "75000" } });
    fireEvent.click(submitBtn);

    // Toast success must be fired
    const toasts = useToastStore.getState().toasts;
    expect(toasts.some((t) => t.type === "success" && t.title.includes("Setoran Berhasil Diajukan"))).toBe(true);

    // Must automatically switch to Pengajuan Aktif tab
    expect(screen.getByText(/Pengajuan Menunggu Verifikasi/i)).toBeTruthy();
  });

  it("5. Form Penarikan Sukarela menolak jika nominal melebihi batas saldo mengendap", () => {
    act(() => {
      useAuthStore.setState({ currentUser: demoUsers.member });
    });

    render(<MemberSavingsPortalView />);

    // Click "Tarik Sukarela"
    const tarikBtn = screen.getByRole("button", { name: /Tarik Sukarela/i });
    fireEvent.click(tarikBtn);

    expect(screen.getByText("Form Pengajuan Penarikan Simpanan Sukarela")).toBeTruthy();

    const amountInput = screen.getByLabelText(/Nominal Penarikan/i);
    const submitBtn = screen.getByRole("button", { name: /Kirim Pengajuan Penarikan/i });

    // Enter excessive amount
    fireEvent.change(amountInput, { target: { value: "999999999" } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Saldo sukarela tidak mencukupi/i)).toBeTruthy();
  });
});
