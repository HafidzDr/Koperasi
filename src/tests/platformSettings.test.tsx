// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PlatformSettingsView } from "@/features/admin/PlatformSettingsView";
import { useAuthStore } from "@/stores/authStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useToastStore } from "@/stores/toastStore";

describe("PHASE 3.4 — PlatformSettingsView Savings Config Input Validation Tests", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    cleanup();
  });

  const setupTab = () => {
    render(<PlatformSettingsView />);
    // Switch to tab 2: Cooperative & Product Configuration
    const tabBtn = screen.getByText(/2. Cooperative & Product Configuration/i);
    fireEvent.click(tabBtn);

    const inputPokok = screen.getByLabelText(/Simpanan Pokok Ilustrasi/i) as HTMLInputElement;
    const inputWajib = screen.getByLabelText(/Simpanan Wajib Bulanan Ilustrasi/i) as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /Simpan Perubahan/i });

    return { inputPokok, inputWajib, submitBtn };
  };

  it("1. Menolak Simpanan Pokok bernilai string kosong ('')", () => {
    const { inputPokok, submitBtn } = setupTab();

    fireEvent.change(inputPokok, { target: { value: "" } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("Nominal Simpanan Pokok wajib diisi dan tidak boleh kosong.")
    ).toBeTruthy();
    const toasts = useToastStore.getState().toasts;
    expect(
      toasts.some((t) => t.type === "danger" && t.message?.includes("tidak boleh kosong"))
    ).toBe(true);
    // Store remains unchanged at initial value
    expect(useMembershipStore.getState().savingsConfig.simpananPokokNominal).toBe(100000);
  });

  it("2. Menolak Simpanan Wajib bernilai string kosong ('')", () => {
    const { inputWajib, submitBtn } = setupTab();

    fireEvent.change(inputWajib, { target: { value: "" } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("Nominal Simpanan Wajib wajib diisi dan tidak boleh kosong.")
    ).toBeTruthy();
    const toasts = useToastStore.getState().toasts;
    expect(
      toasts.some((t) => t.type === "danger" && t.message?.includes("tidak boleh kosong"))
    ).toBe(true);
    // Store remains unchanged at initial value
    expect(useMembershipStore.getState().savingsConfig.simpananWajibBulanan).toBe(50000);
  });

  it("3. Menolak input yang hanya berisi karakter spasi ('   ')", () => {
    const { inputPokok, submitBtn } = setupTab();

    fireEvent.change(inputPokok, { target: { value: "   " } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("Nominal Simpanan Pokok wajib diisi dan tidak boleh kosong.")
    ).toBeTruthy();
    expect(useMembershipStore.getState().savingsConfig.simpananPokokNominal).toBe(100000);
  });

  it("4. Mengizinkan nilai nol (0) sebagai nominal yang sah", () => {
    const { inputPokok, inputWajib, submitBtn } = setupTab();

    fireEvent.change(inputPokok, { target: { value: "0" } });
    fireEvent.change(inputWajib, { target: { value: "0" } });
    fireEvent.click(submitBtn);

    expect(screen.queryByText(/wajib diisi dan tidak boleh kosong/i)).toBeNull();
    expect(screen.queryByText(/harus berupa angka/i)).toBeNull();
    expect(screen.queryByText(/tidak boleh bernilai negatif/i)).toBeNull();
    expect(useMembershipStore.getState().savingsConfig.simpananPokokNominal).toBe(0);
    expect(useMembershipStore.getState().savingsConfig.simpananWajibBulanan).toBe(0);

    const toasts = useToastStore.getState().toasts;
    expect(
      toasts.some((t) => t.type === "success" && t.title.includes("Parameter Demonstrasi Diperbarui"))
    ).toBe(true);
  });

  it("5. Menolak input bernilai negatif (-1)", () => {
    const { inputPokok, submitBtn } = setupTab();

    fireEvent.change(inputPokok, { target: { value: "-1" } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("Nominal Simpanan Pokok tidak boleh bernilai negatif.")
    ).toBeTruthy();
    expect(useMembershipStore.getState().savingsConfig.simpananPokokNominal).toBe(100000);
  });

  it("6. Menolak input melebihi batas maksimum (> 1.000.000.000)", () => {
    const { inputPokok, submitBtn } = setupTab();

    fireEvent.change(inputPokok, { target: { value: "1000000001" } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("Nominal Simpanan Pokok melebihi batas maksimum wajar (Rp 1.000.000.000).")
    ).toBeTruthy();
    expect(useMembershipStore.getState().savingsConfig.simpananPokokNominal).toBe(100000);
  });

  it("7. Menerima input valid (150000, 75000) dan memperbarui store secara reaktif", () => {
    const { inputPokok, inputWajib, submitBtn } = setupTab();

    fireEvent.change(inputPokok, { target: { value: "150000" } });
    fireEvent.change(inputWajib, { target: { value: "75000" } });
    fireEvent.click(submitBtn);

    expect(screen.queryByText(/Validasi Gagal/i)).toBeNull();
    expect(useMembershipStore.getState().savingsConfig.simpananPokokNominal).toBe(150000);
    expect(useMembershipStore.getState().savingsConfig.simpananWajibBulanan).toBe(75000);

    const toasts = useToastStore.getState().toasts;
    expect(
      toasts.some((t) => t.type === "success" && t.title.includes("Parameter Demonstrasi Diperbarui"))
    ).toBe(true);
  });
});
