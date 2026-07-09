const STORAGE_KEY = 'pulsar_wallet_v1';

export interface SecureStorage {
  getItem(key: string): Promise<string | undefined>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createSecureStorage(chromeStorage: ChromeStorage): SecureStorage {
  return {
    async getItem(key: string): Promise<string | undefined> {
      const result = await chromeStorage.get([key]);
      return result[key] as string | undefined;
    },

    async setItem(key: string, value: string): Promise<void> {
      await chromeStorage.set({ [key]: value });
    },

    async removeItem(key: string): Promise<void> {
      await chromeStorage.remove(key);
    },
  };
}

export interface StoredWalletData {
  encryptedMnemonic: string;
  encryptedSecretKey?: string;
  createdAt: string;
}

export async function saveWalletData(
  storage: SecureStorage,
  data: StoredWalletData
): Promise<void> {
  await storage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function loadWalletData(storage: SecureStorage): Promise<StoredWalletData | null> {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredWalletData;
  } catch {
    return null;
  }
}

export async function clearWalletData(storage: SecureStorage): Promise<void> {
  await storage.removeItem(STORAGE_KEY);
}
