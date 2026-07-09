export type MnemonicStrength = 128 | 160 | 192 | 224 | 256;

export interface KeyPair {
  publicKey: string;
  secretKey: string;
}

export interface DerivedKeyPair extends KeyPair {
  path: string;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

let stellarHDWallet: any = null;

async function getStellarHDWallet() {
  if (!stellarHDWallet) {
    const mod = await import('stellar-hd-wallet');
    stellarHDWallet = mod.default;
  }
  return stellarHDWallet;
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-error-red' };
  if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-success-green' };
}

export async function generateMnemonic(strength: MnemonicStrength = 256): Promise<string> {
  const wallet = await getStellarHDWallet();
  return wallet.generateMnemonic({ entropyBits: strength });
}

export function validateMnemonic(mnemonic: string): boolean {
  if (!stellarHDWallet) {
    throw new Error('StellarHDWallet not initialized');
  }
  return stellarHDWallet.validateMnemonic(mnemonic);
}
