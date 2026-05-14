import { create } from "zustand";
import { persist } from "zustand/middleware";

// Frontend-only prototype auth: a single persisted flag. No real credentials
// are verified — login/skip-login flip this, logout clears it.
interface AuthState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
    }),
    { name: "art-auth" }
  )
);
