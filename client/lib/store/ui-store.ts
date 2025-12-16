'use client';

import { create } from 'zustand';
import type { Notification } from '@/types';

interface UIState {
  loading: boolean;
  error: string | null;
  notifications: Notification[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  error: null,
  notifications: [],
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(7);
    const timestamp = Date.now();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id, timestamp }],
    }));
    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  clearNotifications: () => set({ notifications: [] }),
}));


