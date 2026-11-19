// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { HomeView } from "@/features/public/HomeView";
import { AboutView } from "@/features/public/AboutView";
import { useConfigStore } from "@/stores/configStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { useAuthStore } from "@/stores/authStore";

describe("STAGE 3.1 — Visual Refinement & Scroll-Responsive Navbar Tests", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(performance.now());
      return 1;
    });
    useConfigStore.getState().resetConfig();
    useMembershipStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
    window.scrollY = 0;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("1. Navbar Scroll Collapse & Interaction States", () => {
    it("renders full floating fill navbar when scroll position is at the top", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      // Desktop navigation links must be present
      expect(screen.getByText("Tentang Koperasi")).toBeDefined();
      expect(screen.getByText("Cara Bergabung")).toBeDefined();
      expect(screen.getByText("Masuk Portal")).toBeDefined();
      expect(screen.getByText("Daftar Anggota")).toBeDefined();

      // Compact button should NOT be rendered when at top
      expect(screen.queryByLabelText("Buka navigasi Nusantara Maju")).toBeNull();
    });

    it("collapses navbar into compact floating brand icon after scrolling past threshold", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      // Simulate scrolling down past 80px
      act(() => {
        window.scrollY = 150;
        fireEvent.scroll(window);
      });

      // Compact floating button should appear
      const compactBtn = screen.getByLabelText("Buka navigasi Nusantara Maju");
      expect(compactBtn).toBeDefined();
      expect(compactBtn.getAttribute("aria-expanded")).toBe("false");
    });

    it("expands full navbar when compact floating button is clicked", () => {
      // Mock desktop window width
      window.innerWidth = 1440;

      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      // Scroll to trigger collapse
      act(() => {
        window.scrollY = 200;
        fireEvent.scroll(window);
      });

      const compactBtn = screen.getByLabelText("Buka navigasi Nusantara Maju");
      act(() => {
        fireEvent.click(compactBtn);
      });

      // Full navbar links and close button should now be rendered
      expect(screen.getByText("Tentang Koperasi")).toBeDefined();
      expect(screen.getByLabelText("Tutup navigasi")).toBeDefined();
    });

    it("closes expanded navbar when explicit close button (X) is clicked", () => {
      window.innerWidth = 1440;

      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      // Scroll and open
      act(() => {
        window.scrollY = 200;
        fireEvent.scroll(window);
      });

      act(() => {
        fireEvent.click(screen.getByLabelText("Buka navigasi Nusantara Maju"));
      });

      const closeBtn = screen.getByLabelText("Tutup navigasi");
      act(() => {
        fireEvent.click(closeBtn);
      });

      // Should return to compact button
      expect(screen.getByLabelText("Buka navigasi Nusantara Maju")).toBeDefined();
    });

    it("closes expanded navbar when Escape key is pressed", () => {
      window.innerWidth = 1440;

      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      act(() => {
        window.scrollY = 200;
        fireEvent.scroll(window);
      });

      act(() => {
        fireEvent.click(screen.getByLabelText("Buka navigasi Nusantara Maju"));
      });

      expect(screen.getByLabelText("Tutup navigasi")).toBeDefined();

      // Press Escape
      act(() => {
        fireEvent.keyDown(document, { key: "Escape" });
      });

      expect(screen.getByLabelText("Buka navigasi Nusantara Maju")).toBeDefined();
    });

    it("closes expanded navbar when clicking outside the navbar container", () => {
      window.innerWidth = 1440;

      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      act(() => {
        window.scrollY = 200;
        fireEvent.scroll(window);
      });

      act(() => {
        fireEvent.click(screen.getByLabelText("Buka navigasi Nusantara Maju"));
      });

      expect(screen.getByLabelText("Tutup navigasi")).toBeDefined();

      // Click outside (on document body)
      act(() => {
        fireEvent.mouseDown(document.body);
      });

      expect(screen.getByLabelText("Buka navigasi Nusantara Maju")).toBeDefined();
    });

    it("opens mobile drawer when compact button is clicked on mobile screen", () => {
      window.innerWidth = 375;

      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      act(() => {
        window.scrollY = 200;
        fireEvent.scroll(window);
      });

      act(() => {
        fireEvent.click(screen.getByLabelText("Buka navigasi Nusantara Maju"));
      });

      // Drawer title should appear
      expect(screen.getByText("Menu Navigasi")).toBeDefined();
      expect(screen.getByText("Masuk Portal Anggota")).toBeDefined();
    });

    it("automatically restores full navbar when user scrolls back to top", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      // Scroll down
      act(() => {
        window.scrollY = 200;
        fireEvent.scroll(window);
      });
      expect(screen.getByLabelText("Buka navigasi Nusantara Maju")).toBeDefined();

      // Scroll back up to 0
      act(() => {
        window.scrollY = 0;
        fireEvent.scroll(window);
      });

      expect(screen.queryByLabelText("Buka navigasi Nusantara Maju")).toBeNull();
      expect(screen.getByText("Tentang Koperasi")).toBeDefined();
    });

    it("verifies Floating Settings Controller does not collide with navbar", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicLayout />
        </MemoryRouter>
      );

      // Floating settings trigger button must be present in layout
      const settingsTrigger = screen.getByLabelText("Pengaturan Demonstrasi & Peran");
      expect(settingsTrigger).toBeDefined();

      // It sits at bottom right while navbar header is at top
      expect(settingsTrigger.className).toContain("bottom-5");
      expect(settingsTrigger.className).toContain("right-5");
    });
  });

  describe("2. Clean Photographic Assets & Hero Composition", () => {
    it("renders HomeView hero with clean WebP photographic background and HTML typography", () => {
      render(
        <MemoryRouter>
          <HomeView />
        </MemoryRouter>
      );

      const heroImg = screen.getByAltText(
        "Aktivitas gotong royong dan kemitraan anggota koperasi Nusantara Maju"
      ) as HTMLImageElement;
      expect(heroImg).toBeDefined();
      expect(heroImg.src).toContain("/images/public/01-beranda-hero.webp");

      // Semantic HTML Heading (not in image)
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1.textContent).toContain("Tumbuh Bersama");
      expect(h1.textContent).toContain("Menyejahterakan");
    });

    it("renders HomeView services and about sections with clean WebP photos", () => {
      render(
        <MemoryRouter>
          <HomeView />
        </MemoryRouter>
      );

      // About photo
      const aboutImg = screen.getByAltText(
        "Pertemuan musyawarah dan kerja sama pengurus serta anggota Nusantara Maju"
      ) as HTMLImageElement;
      expect(aboutImg.src).toContain("/images/public/02-tentang-nusantara-maju.webp");

      // Simpanan photo
      const simpananImg = screen.getByAltText(
        "Unit usaha dan produk kebutuhan anggota koperasi"
      ) as HTMLImageElement;
      expect(simpananImg.src).toContain("/images/public/03-simpanan.webp");

      // Pinjaman photo
      const pinjamanImg = screen.getByAltText(
        "Pelaku UMKM dan pedagang binaan yang didukung pembiayaan koperasi"
      ) as HTMLImageElement;
      expect(pinjamanImg.src).toContain("/images/public/04-pinjaman.webp");

      // CTA photo
      const ctaImg = screen.getByAltText(
        "Petugas koperasi melayani transaksi anggota dengan ramah di kasir modern"
      ) as HTMLImageElement;
      expect(ctaImg.src).toContain("/images/public/10-tumbuh-bersama.webp");
    });
  });

  describe("3. Content & Claims Audit Compliance", () => {
    it("verifies statistics cards reflect factual governance pillars rather than fabricated assets", () => {
      render(
        <MemoryRouter>
          <HomeView />
        </MemoryRouter>
      );

      expect(screen.getByText("Transparansi Mutasi")).toBeDefined();
      expect(screen.getByText("Demokrasi Koperasi")).toBeDefined();
      expect(screen.getByText("Tata Kelola & SoD")).toBeDefined();
      expect(screen.getByText("Akses Layanan Mandiri")).toBeDefined();
    });

    it("verifies AboutView legal card displays factual cooperative entity data without fabricated claims", () => {
      render(
        <MemoryRouter>
          <AboutView />
        </MemoryRouter>
      );

      expect(screen.getByText("Koperasi Konsumen Primer")).toBeDefined();
      expect(screen.getByText("AD / ART Koperasi")).toBeDefined();
      expect(screen.getByText("Milik Bersama Seluruh Anggota")).toBeDefined();
    });
  });
});
