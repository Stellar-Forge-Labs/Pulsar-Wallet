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

export function deriveKeyPair(seed: Buffer, path: string): DerivedKeyPair {
  const wallet = stellarHDWallet;
  if (!wallet) {
    throw new Error('StellarHDWallet not initialized');
  }
  const hdWallet = wallet.fromSeed(seed);
  return {
    publicKey: hdWallet.getPublicKey(0),
    secretKey: hdWallet.getSecret(0),
    path,
  };
}

export function createRandomKeyPair(): KeyPair {
  const { Keypair } = require('@stellar/stellar-base');
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

export function keyPairFromSecret(secret: string): KeyPair {
  const { Keypair } = require('@stellar/stellar-base');
  const keypair = Keypair.fromSecret(secret);
  return {
    publicKey: keypair.publicKey(),
    secretKey: secret,
  };
}

export async function encryptSecret(password: string, plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = new Uint8Array(crypto.getRandomValues(new Uint8Array(16)));
  const iv = new Uint8Array(crypto.getRandomValues(new Uint8Array(12)));

  const baseKey = await deriveKey(password, salt);
  const aesKey = await crypto.subtle.importKey('raw', baseKey, 'AES-GCM', false, ['encrypt']);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encoder.encode(plaintext)
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return Buffer.from(combined).toString('base64');
}

export async function decryptSecret(password: string, encryptedBase64: string): Promise<string> {
  const decoder = new TextDecoder();
  const combined = Buffer.from(encryptedBase64, 'base64');
  const salt = combined.subarray(0, 16);
  const iv = combined.subarray(16, 28);
  const data = combined.subarray(28);

  const baseKey = await deriveKey(password, salt);
  const aesKey = await crypto.subtle.importKey('raw', baseKey, 'AES-GCM', false, ['decrypt']);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, data);
  return decoder.decode(decrypted);
}
