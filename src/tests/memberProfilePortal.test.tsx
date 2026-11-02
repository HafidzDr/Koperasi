import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemberProfilePortalView } from "@/features/membership/pages/MemberProfilePortalView";
import { useAuthStore } from "@/stores/authStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { demoUsers } from "@/mocks/seedData";

describe("PHASE 3.2 — MemberProfilePortalView Component Privacy & Isolation Tests", () => {
  const origUseSyncExternalStore = React.useSyncExternalStore;

  beforeAll(() => {
    // In React SSR (renderToString), bridge getServerSnapshot to getSnapshot
    // so the component renders the live mutated Zustand state during test execution
    React.useSyncExternalStore = <Snapshot,>(
      subscribe: (onStoreChange: () => void) => () => void,
      getSnapshot: () => Snapshot
    ): Snapshot => {
      return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    };
  });

  afterAll(() => {
    React.useSyncExternalStore = origUseSyncExternalStore;
  });

  beforeEach(() => {
    useMembershipStore.getState().resetToSeed();
    useAuthStore.getState().resetToDefault();
  });

  it("1. Member dengan memberId valid hanya melihat profil miliknya sendiri", () => {
    // Demo user 'member' is linked to DEMO-ID-0001 (Siti Rahma, KMB-2026-0001)
    useAuthStore.getState().setRole("member");

    const html = renderToString(<MemberProfilePortalView />);

    // Must render Siti Rahma's profile
    expect(html).toContain("Siti Rahma");
    expect(html).toContain("KMB-2026-0001");
    expect(html).toContain("DEMO-ID-0001");
    expect(html).toContain("Profil Anggota");

    // Must NOT render other members (e.g. Dian Pratama, Eko Prasetyo)
    expect(html).not.toContain("Dian Pratama");
    expect(html).not.toContain("KMB-2026-0002");
    expect(html).not.toContain("Eko Prasetyo");
    expect(html).not.toContain("Profil Keanggotaan Tidak Ditemukan");
  });

  it("2. Member tanpa memberId menampilkan EmptyState", () => {
    // Current user with memberId undefined
    useAuthStore.setState({
      currentUser: {
        ...demoUsers.member,
        memberId: undefined,
      },
    });

    const html = renderToString(<MemberProfilePortalView />);

    // Must render EmptyState with clear guidance
    expect(html).toContain("Profil Keanggotaan Tidak Ditemukan");
    expect(html).toContain("belum memiliki tautan identitas anggota");

    // Must NOT render any member profile data
    expect(html).not.toContain("Siti Rahma");
    expect(html).not.toContain("KMB-2026-0001");
    expect(html).not.toContain("Dian Pratama");
  });

  it("3. Member dengan memberId tidak dikenal menampilkan EmptyState", () => {
    // Current user with nonexistent memberId
    useAuthStore.setState({
      currentUser: {
        ...demoUsers.member,
        memberId: "DEMO-ID-9999",
      },
    });

    const html = renderToString(<MemberProfilePortalView />);

    // Must render EmptyState mentioning the unknown ID
    expect(html).toContain("Profil Keanggotaan Tidak Ditemukan");
    expect(html).toContain("DEMO-ID-9999");
    expect(html).toContain("tidak ditemukan dalam Buku Induk Anggota KMB");

    // Must NOT render any valid member data
    expect(html).not.toContain("Siti Rahma");
    expect(html).not.toContain("KMB-2026-0001");
    expect(html).not.toContain("Dian Pratama");
  });

  it("4. Profil anggota pertama tidak muncul sebagai fallback bila ID tidak cocok", () => {
    const firstMember = useMembershipStore.getState().members[0];
    expect(firstMember).toBeDefined();

    // User with non-matching ID
    useAuthStore.setState({
      currentUser: {
        ...demoUsers.member,
        memberId: "DEMO-ID-INVALID",
      },
    });

    const html = renderToString(<MemberProfilePortalView />);

    // Strictly ensure members[0] is NOT returned as fallback
    expect(html).not.toContain(firstMember.fullName);
    expect(html).not.toContain(firstMember.memberNumber);
    expect(html).toContain("Profil Keanggotaan Tidak Ditemukan");
  });

  it("5. Pergantian akun demo mengubah profil sesuai memberId aktif", () => {
    // Account 1: Siti Rahma (DEMO-ID-0001)
    useAuthStore.setState({
      currentUser: {
        ...demoUsers.member,
        name: "Siti Rahma",
        memberId: "DEMO-ID-0001",
      },
    });

    const htmlMember1 = renderToString(<MemberProfilePortalView />);
    expect(htmlMember1).toContain("Siti Rahma");
    expect(htmlMember1).toContain("KMB-2026-0001");
    expect(htmlMember1).not.toContain("Dian Pratama");

    // Account 2: Dian Pratama (DEMO-ID-0007)
    useAuthStore.setState({
      currentUser: {
        ...demoUsers.member,
        name: "Dian Pratama",
        memberId: "DEMO-ID-0007",
      },
    });

    const htmlMember2 = renderToString(<MemberProfilePortalView />);
    expect(htmlMember2).toContain("Dian Pratama");
    expect(htmlMember2).toContain("KMB-2026-0002");
    expect(htmlMember2).not.toContain("Siti Rahma");
  });
});
