import { create } from 'zustand';
import { session } from '../crypto/session';

export interface WalletState {
  publicKey: string | null;
  isUnlocked: boolean;
  hasWallet: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  reset: () => Promise<void>;
  createWallet: (password: string) => Promise<{ mnemonic: string; publicKey: string }>;
  importWallet: (source: string, password: string) => Promise<{ publicKey: string }>;
  checkHasWallet: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey: null,
  isUnlocked: false,
  hasWallet: false,

  checkHasWallet: async () => {
    const { loadWalletData, createChromeStorage, createSecureStorage } = await import('../crypto/storage');
    const storage = createSecureStorage(createChromeStorage());
    const data = await loadWalletData(storage);
    set({ hasWallet: !!data });
  },
