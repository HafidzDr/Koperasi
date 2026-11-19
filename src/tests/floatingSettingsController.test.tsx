// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { FloatingSettingsController } from "@/components/common/FloatingSettingsController";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { useToastStore } from "@/stores/toastStore";

describe("STAGE 2 — Floating Settings Controller & Navigation Tests", () => {
  beforeEach(() => {
    useAuthStore.getState().resetToDefault();
    useConfigStore.getState().resetConfig();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <FloatingSettingsController />
      </BrowserRouter>
    );

  describe("1. Trigger Button & Panel Open/Close Accessibility", () => {
    it("renders trigger button with accessible label and opens panel on click", () => {
      renderComponent();
      const triggerBtn = screen.getByRole("button", {
        name: /Pengaturan Demonstrasi & Peran/i,
      });
      expect(triggerBtn).toBeDefined();

      fireEvent.click(triggerBtn);
      expect(screen.getByRole("dialog")).toBeDefined();
      expect(screen.getByText("Pengaturan Demonstrasi")).toBeDefined();
    });

    it("closes panel when Escape key is pressed", () => {
      renderComponent();
      const triggerBtn = screen.getByRole("button", {
        name: /Pengaturan Demonstrasi & Peran/i,
      });
      fireEvent.click(triggerBtn);
      expect(screen.getByRole("dialog")).toBeDefined();

      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("closes panel when close icon button is clicked", () => {
      renderComponent();
      const triggerBtn = screen.getByRole("button", {
        name: /Pengaturan Demonstrasi & Peran/i,
      });
      fireEvent.click(triggerBtn);

      const closeBtn = screen.getByRole("button", { name: "Tutup pengaturan" });
      fireEvent.click(closeBtn);
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("2. User Context & Role Switching", () => {
    it("switches demo role accurately and dispatches toast notification", () => {
      renderComponent();
      const triggerBtn = screen.getByRole("button", {
        name: /Pengaturan Demonstrasi & Peran/i,
      });
      fireEvent.click(triggerBtn);

      // Default role is public_visitor
      expect(useAuthStore.getState().currentRole).toBe("public_visitor");

      // Click on Bendahara role
      const treasurerBtn = screen.getByText("Bendahara");
      fireEvent.click(treasurerBtn);

      // Verify authStore state updated to treasurer
      expect(useAuthStore.getState().currentRole).toBe("treasurer");

      // Verify toast notification dispatched
      const toasts = useToastStore.getState().toasts;
      expect(toasts.length).toBeGreaterThan(0);
      expect(toasts[0].title).toBe("Peran Demonstrasi Diubah");
    });

    it("renders both 8 authenticated accounts and 2 public preview contexts", () => {
      renderComponent();
      fireEvent.click(
        screen.getByRole("button", { name: /Pengaturan Demonstrasi & Peran/i })
      );

      expect(screen.getByText("Super Administrator")).toBeDefined();
      expect(screen.getByText("Anggota Koperasi")).toBeDefined();
      expect(screen.getAllByText("Pengunjung Publik").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Calon Anggota").length).toBeGreaterThan(0);
    });
  });

  describe("3. Platform Configuration & RBAC Enforcement", () => {
    it("disables module toggles for roles lacking platform_config:update (e.g. member)", () => {
      useAuthStore.getState().setRole("member");
      renderComponent();

      fireEvent.click(
        screen.getByRole("button", { name: /Pengaturan Demonstrasi & Peran/i })
      );

      // Navigate to Modul Bisnis tab
      fireEvent.click(screen.getByText("Modul Bisnis"));

      // Verify restricted access alert is shown
      expect(screen.getByText(/Hak Akses Terbatas \(SoD\)/i)).toBeDefined();

      // Verify switches are disabled
      const switches = screen.getAllByRole("switch");
      expect(switches.length).toBeGreaterThan(0);
      switches.forEach((sw) => {
        expect(sw.hasAttribute("disabled")).toBe(true);
      });
    });

    it("strictly disables module toggles for standard admin role (super_admin only)", () => {
      useAuthStore.getState().setRole("admin");
      renderComponent();

      fireEvent.click(
        screen.getByRole("button", { name: /Pengaturan Demonstrasi & Peran/i })
      );

      // Navigate to Modul Bisnis tab
      fireEvent.click(screen.getByText("Modul Bisnis"));

      // Verify restricted access alert is shown for admin
      expect(screen.getByText(/Hak Akses Terbatas \(SoD\)/i)).toBeDefined();

      // Verify switches are disabled for admin
      const switches = screen.getAllByRole("switch");
      switches.forEach((sw) => {
        expect(sw.hasAttribute("disabled")).toBe(true);
      });

      // Verify direct click on switch does not change store state
      const initialSavingsState = useConfigStore.getState().config.activeModules.savings;
      const savingsSwitch = screen.getByLabelText(/Toggle Savings Management \(Simpanan\)/i);
      fireEvent.click(savingsSwitch);
      expect(useConfigStore.getState().config.activeModules.savings).toBe(initialSavingsState);
    });

    it("enables module toggles for authorized roles (e.g. super_admin)", () => {
      useAuthStore.getState().setRole("super_admin");
      renderComponent();

      fireEvent.click(
        screen.getByRole("button", { name: /Pengaturan Demonstrasi & Peran/i })
      );

      // Navigate to Modul Bisnis tab
      fireEvent.click(screen.getByText("Modul Bisnis"));

      // Verify authorized access alert is shown
      expect(screen.getByText(/Hak Akses Terverifikasi/i)).toBeDefined();

      // Toggle first module (Savings)
      const initialSavingsState =
        useConfigStore.getState().config.activeModules.savings;
      const savingsSwitch = screen.getByLabelText(
        /Toggle Savings Management \(Simpanan\)/i
      );
      expect(savingsSwitch.hasAttribute("disabled")).toBe(false);

      fireEvent.click(savingsSwitch);
      expect(useConfigStore.getState().config.activeModules.savings).toBe(
        !initialSavingsState
      );
    });
  });

  describe("4. Demo Tools & Reset Authorization", () => {
    it("disables Reset button for non-super_admin roles", () => {
      useAuthStore.getState().setRole("admin"); // Admin lacks demo_tools:reset_demo
      renderComponent();

      fireEvent.click(
        screen.getByRole("button", { name: /Pengaturan Demonstrasi & Peran/i })
      );

      // Navigate to Alat Demo tab
      fireEvent.click(screen.getByText("Alat Demo"));

      const resetBtn = screen.getByRole("button", {
        name: /Reset Data Demonstrasi/i,
      });
      expect(resetBtn.hasAttribute("disabled")).toBe(true);
      expect(
        screen.getByText(/Reset data prototype dibatasi secara eksklusif/i)
      ).toBeDefined();
    });

    it("allows Super Admin to execute Demo Reset with confirmation dialog", () => {
      useAuthStore.getState().setRole("super_admin");
      renderComponent();

      fireEvent.click(
        screen.getByRole("button", { name: /Pengaturan Demonstrasi & Peran/i })
      );

      // Navigate to Alat Demo tab
      fireEvent.click(screen.getByText("Alat Demo"));

      const resetBtn = screen.getByRole("button", {
        name: /Reset Data Demonstrasi/i,
      });
      expect(resetBtn.hasAttribute("disabled")).toBe(false);

      // Click reset button -> triggers confirmation dialog
      fireEvent.click(resetBtn);
      expect(screen.getByText("Konfirmasi Reset Demonstrasi")).toBeDefined();

      // Confirm reset
      const confirmBtn = screen.getByRole("button", {
        name: /Ya, Reset Demonstrasi/i,
      });
      fireEvent.click(confirmBtn);

      // Verify success toast
      const toasts = useToastStore.getState().toasts;
      expect(toasts.some((t) => t.title.includes("Reset Demonstrasi"))).toBe(
        true
      );
    });
  });

  describe("5. Invariant: Opening Panel Grants Zero Privilege Escalation", () => {
    it("maintains strict role permissions unchanged when panel is toggled", () => {
      useAuthStore.getState().setRole("auditor");
      renderComponent();

      expect(useAuthStore.getState().currentRole).toBe("auditor");

      // Open panel
      fireEvent.click(
        screen.getByRole("button", { name: /Pengaturan Demonstrasi & Peran/i })
      );

      // Role must remain auditor
      expect(useAuthStore.getState().currentRole).toBe("auditor");

      // Close panel
      fireEvent.click(screen.getByRole("button", { name: "Tutup pengaturan" }));

      // Role still auditor
      expect(useAuthStore.getState().currentRole).toBe("auditor");
    });
  });
});
