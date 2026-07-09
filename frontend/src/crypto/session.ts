export interface SessionState {
  mnemonic: string | null;
  publicKey: string | null;
  secretKey: string | null;
  isUnlocked: boolean;
}

export class SessionKeyManager {
  private state: SessionState = {
    mnemonic: null,
    publicKey: null,
    secretKey: null,
    isUnlocked: false,
  };

  get isUnlocked(): boolean {
    return this.state.isUnlocked;
  }

  get publicKey(): string | null {
    return this.state.publicKey;
  }

  unlock(data: { mnemonic?: string; publicKey: string; secretKey: string }): void {
    this.state = {
      mnemonic: data.mnemonic ?? null,
      publicKey: data.publicKey,
      secretKey: data.secretKey,
      isUnlocked: true,
    };
  }

  lock(): void {
    this.state = {
      mnemonic: null,
      publicKey: null,
      secretKey: null,
      isUnlocked: false,
    };
  }

  getSecretKey(): string | null {
    return this.state.secretKey;
  }

  getMnemonic(): string | null {
    return this.state.mnemonic;
  }

  clear(): void {
    this.lock();
  }
}

export const session = new SessionKeyManager();
