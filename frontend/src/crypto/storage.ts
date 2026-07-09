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
