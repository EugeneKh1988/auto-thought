import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

type AuthState = {
  isLogged: boolean;
  user_id: number | null;
  hasHydrated: boolean;
};

type AuthActions = {
  setLogged: (status: AuthState["isLogged"]) => void;
  seUserId: (user_id: AuthState["user_id"]) => void;
  clearUserId: () => void;
  setHasHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      isLogged: false,
      user_id: null,
      hasHydrated: false,
      setLogged: (status) =>
        set((state) => {
          state.isLogged = status;
        }),
      seUserId: (user_id) =>
        set((state) => {
          state.user_id = user_id;
        }),
      clearUserId: () =>
        set((state) => {
          state.user_id = null;
        }),
      setHasHydrated: (v: boolean) =>
        set((state) => {
          state.hasHydrated = v;
        }),
    })),
    {
      name: "auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
