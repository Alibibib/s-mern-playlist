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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

// Селектор для isAuthenticated
export const useIsAuthenticated = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  return !!token && !!user;
};


