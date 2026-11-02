// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { MemberProfilePortalView } from "@/features/membership/pages/MemberProfilePortalView";
import { useAuthStore } from "@/stores/authStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { demoUsers } from "@/mocks/seedData";

describe("PHASE 3.3 — MemberProfilePortalView Real DOM Component Privacy & Reactivity Tests", () => {
  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
  });

  afterEach(() => {
    cleanup();
  });

  it("1. Member dengan memberId valid hanya melihat profil miliknya sendiri di DOM", () => {
    // Demo user 'member' is linked to DEMO-ID-0001 (Siti Rahma, KMB-2026-0001)
    act(() => {
      useAuthStore.getState().setRole("member");
    });

    render(<MemberProfilePortalView />);

    // Must render Siti Rahma's profile in real DOM (card title & biodata)
    expect(screen.getAllByText("Siti Rahma").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("KMB-2026-0001").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/DEMO-ID-0001/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Profil Anggota & Kartu Digital")).toBeTruthy();

    // Must NOT render other members (e.g. Dian Pratama, Eko Prasetyo)
    expect(screen.queryAllByText("Dian Pratama")).toHaveLength(0);
    expect(screen.queryAllByText("KMB-2026-0002")).toHaveLength(0);
    expect(screen.queryAllByText("Eko Prasetyo")).toHaveLength(0);
    expect(screen.queryByText("Profil Keanggotaan Tidak Ditemukan")).toBeNull();
  });

  it("2. Member tanpa memberId menampilkan EmptyState di DOM", () => {
    // Current user with memberId undefined
    act(() => {
      useAuthStore.setState({
        currentUser: {
          ...demoUsers.member,
          memberId: undefined,
        },
      });
    });

    render(<MemberProfilePortalView />);

    // Must render EmptyState with clear guidance in DOM
    expect(screen.getByText("Profil Keanggotaan Tidak Ditemukan")).toBeTruthy();
    expect(
      screen.getByText(/belum memiliki tautan identitas anggota/i)
    ).toBeTruthy();

    // Must NOT render any member profile data
    expect(screen.queryByText("Siti Rahma")).toBeNull();
    expect(screen.queryByText("KMB-2026-0001")).toBeNull();
    expect(screen.queryByText("Dian Pratama")).toBeNull();
  });

  it("3. Member dengan memberId tidak dikenal menampilkan EmptyState di DOM", () => {
    // Current user with nonexistent memberId
    act(() => {
      useAuthStore.setState({
        currentUser: {
          ...demoUsers.member,
          memberId: "DEMO-ID-9999",
        },
      });
    });

    render(<MemberProfilePortalView />);

    // Must render EmptyState mentioning the unknown ID
    expect(screen.getByText("Profil Keanggotaan Tidak Ditemukan")).toBeTruthy();
    expect(
      screen.getByText(/tidak ditemukan dalam Buku Induk Anggota KMB/i)
    ).toBeTruthy();

    // Must NOT render any valid member data
    expect(screen.queryByText("Siti Rahma")).toBeNull();
    expect(screen.queryByText("KMB-2026-0001")).toBeNull();
    expect(screen.queryByText("Dian Pratama")).toBeNull();
  });

  it("4. Profil anggota pertama tidak pernah muncul sebagai fallback bila ID tidak cocok", () => {
    const firstMember = useMembershipStore.getState().members[0];
    expect(firstMember).toBeDefined();

    // User with non-matching ID
    act(() => {
      useAuthStore.setState({
        currentUser: {
          ...demoUsers.member,
          memberId: "DEMO-ID-INVALID",
        },
      });
    });

    render(<MemberProfilePortalView />);

    // Strictly ensure members[0] is NOT returned as fallback
    expect(screen.queryByText(firstMember.fullName)).toBeNull();
    expect(screen.queryByText(firstMember.memberNumber)).toBeNull();
    expect(screen.getByText("Profil Keanggotaan Tidak Ditemukan")).toBeTruthy();
  });

  it("5. Pergantian akun aktif saat komponen TETAP TERPASANG memperbarui DOM secara reaktif tanpa unmount manual", () => {
    // 1. Initial mount with Account 1: Siti Rahma (DEMO-ID-0001)
    act(() => {
      useAuthStore.setState({
        currentUser: {
          ...demoUsers.member,
          name: "Siti Rahma",
          memberId: "DEMO-ID-0001",
        },
      });
    });

    // Mount ONCE in the DOM
    const { unmount } = render(<MemberProfilePortalView />);

    expect(screen.getAllByText("Siti Rahma").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("KMB-2026-0001").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText("Dian Pratama")).toHaveLength(0);

    // 2. Switch to Account 2: Dian Pratama (DEMO-ID-0007) WITHOUT unmounting or re-rendering
    act(() => {
      useAuthStore.setState({
        currentUser: {
          ...demoUsers.member,
          name: "Dian Pratama",
          memberId: "DEMO-ID-0007",
        },
      });
    });

    // Verify mounted DOM updated reactively
    expect(screen.getAllByText("Dian Pratama").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("KMB-2026-0002").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText("Siti Rahma")).toHaveLength(0);
    expect(screen.queryAllByText("KMB-2026-0001")).toHaveLength(0);

    // 3. Switch to Account without memberId while STILL MOUNTED
    act(() => {
      useAuthStore.setState({
        currentUser: {
          ...demoUsers.public_visitor,
          memberId: undefined,
        },
      });
    });

    // Verify mounted DOM reactively switches to EmptyState
    expect(screen.getByText("Profil Keanggotaan Tidak Ditemukan")).toBeTruthy();
    expect(screen.queryAllByText("Dian Pratama")).toHaveLength(0);
    expect(screen.queryAllByText("Siti Rahma")).toHaveLength(0);

    unmount();
  });
});
