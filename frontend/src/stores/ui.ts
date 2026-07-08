import { create } from 'zustand';

export interface UiSettings {
  autoLockMinutes: number;
  currency: string;
  theme: 'dark' | 'light';
}

export interface UiState extends UiSettings {
  setAutoLockMinutes: (minutes: number) => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUiStore = create<UiState>((set) => ({
  autoLockMinutes: 5,
  currency: 'USD',
  theme: 'dark',
  setAutoLockMinutes: (autoLockMinutes) => set({ autoLockMinutes }),
  setCurrency: (currency) => set({ currency }),
  setTheme: (theme) => set({ theme }),
}));
