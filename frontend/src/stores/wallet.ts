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

  unlock: async (password: string) => {
    const { loadWalletData, createChromeStorage, createSecureStorage } = await import('../crypto/storage');
    const { decryptSecret } = await import('../crypto/crypto');
    const storage = createSecureStorage(createChromeStorage());
    const data = await loadWalletData(storage);

    if (!data) {
      return false;
    }

    try {
      const mnemonic = await decryptSecret(password, data.encryptedMnemonic);
      const secretKey = data.encryptedSecretKey
        ? await decryptSecret(password, data.encryptedSecretKey)
        : '';

      const { Keypair } = require('@stellar/stellar-base');
      const keypair = secretKey ? Keypair.fromSecret(secretKey) : Keypair.fromMnemonic(mnemonic, "m/44'/148'/0'");

      session.unlock({
        mnemonic,
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
      });

      set({ publicKey: keypair.publicKey(), isUnlocked: true });
      return true;
    } catch {
      return false;
    }
  },

  lock: () => {
    session.lock();
    set({ publicKey: null, isUnlocked: false });
  },

  reset: async () => {
    const { clearWalletData, createChromeStorage, createSecureStorage } = await import('../crypto/storage');
    const storage = createSecureStorage(createChromeStorage());
    await clearWalletData(storage);
    session.clear();
    set({ publicKey: null, isUnlocked: false });
  },

  createWallet: async (password: string) => {
    const { generateMnemonic, encryptSecret } = await import('../crypto/crypto');
    const { saveWalletData, createChromeStorage, createSecureStorage } = await import('../crypto/storage');
    const { Keypair } = require('@stellar/stellar-base');

    const mnemonic = await generateMnemonic(256);
    const keypair = Keypair.fromMnemonic(mnemonic, "m/44'/148'/0'");
    const encryptedMnemonic = await encryptSecret(password, mnemonic);
    const encryptedSecretKey = await encryptSecret(password, keypair.secret());

    const storage = createSecureStorage(createChromeStorage());
    await saveWalletData(storage, {
      encryptedMnemonic,
      encryptedSecretKey,
      createdAt: new Date().toISOString(),
    });

    session.unlock({
      mnemonic,
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    });

    set({ publicKey: keypair.publicKey(), isUnlocked: true });
    return { mnemonic, publicKey: keypair.publicKey() };
  },
