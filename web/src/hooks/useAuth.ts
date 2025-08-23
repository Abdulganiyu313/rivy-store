import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = { id: string; name: string; email: string };
type AuthState = {
  user: User | null;
  token: string | null;
  login: (u: User, token: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "rivy-auth" }
  )
);
