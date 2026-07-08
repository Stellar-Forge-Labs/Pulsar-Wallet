import { create } from 'zustand';

export interface WalletState {
  mnemonic: string | null;
  publicKey: string | null;
  secretKey: string | null;
  isUnlocked: boolean;
  setMnemonic: (mnemonic: string) => void;
  setPublicKey: (publicKey: string) => void;
  setSecretKey: (secretKey: string) => void;
  unlock: () => void;
  lock: () => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  mnemonic: null,
  publicKey: null,
  secretKey: null,
  isUnlocked: false,
  setMnemonic: (mnemonic) => set({ mnemonic }),
  setPublicKey: (publicKey) => set({ publicKey }),
  setSecretKey: (secretKey) => set({ secretKey }),
  unlock: () => set({ isUnlocked: true }),
  lock: () => set({ isUnlocked: false }),
  reset: () =>
    set({
      mnemonic: null,
      publicKey: null,
      secretKey: null,
      isUnlocked: false,
    }),
}));
