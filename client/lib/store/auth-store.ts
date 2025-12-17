'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token: string, user: User) => {
        set({
          token,
          user,
        });
      },
      logout: () => {
        set({
          token: null,
          user: null,
        });
      },
      setUser: (user: User) => {
        set({ user });
      },
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Селектор для isAuthenticated
export const useIsAuthenticated = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  return !!token && !!user;
};


