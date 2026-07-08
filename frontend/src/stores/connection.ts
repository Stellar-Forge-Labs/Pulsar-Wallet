import { create } from 'zustand';

export interface ConnectionState {
  isConnected: boolean;
  accountId: string | null;
  connect: (accountId: string) => void;
  disconnect: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isConnected: false,
  accountId: null,
  connect: (accountId) => set({ isConnected: true, accountId }),
  disconnect: () => set({ isConnected: false, accountId: null }),
}));
