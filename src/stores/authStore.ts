import { create } from "zustand";
import { Role, DemoUser } from "@/types";
import { demoUsers } from "@/mocks/seedData";

interface AuthState {
  currentRole: Role;
  currentUser: DemoUser;
  setRole: (role: Role) => void;
  resetToDefault: () => void;
}

const STORAGE_KEY = "kmb_demo_role";

function getInitialRole(): Role {
  if (typeof window === "undefined") return "public_visitor";
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY) as Role | null;
    if (saved && demoUsers[saved]) {
      return saved;
    }
  } catch {
    // sessionStorage fallback
  }
  return "public_visitor";
}

export const useAuthStore = create<AuthState>((set) => {
  const initialRole = getInitialRole();
  return {
    currentRole: initialRole,
    currentUser: demoUsers[initialRole],
    setRole: (role: Role) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, role);
      } catch {
        // ignore
      }
      set({
        currentRole: role,
        currentUser: demoUsers[role],
      });
    },
    resetToDefault: () => {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      set({
        currentRole: "public_visitor",
        currentUser: demoUsers["public_visitor"],
      });
    },
  };
});
