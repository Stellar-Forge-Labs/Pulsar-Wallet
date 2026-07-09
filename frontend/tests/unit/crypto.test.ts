import { describe, it, expect } from 'vitest';
import { createRandomKeyPair, keyPairFromSecret, validateMnemonic, generateMnemonic } from '../../src/crypto/crypto';

describe('Crypto', () => {
  it('creates a random keypair', () => {
    const keypair = createRandomKeyPair();
    expect(keypair.publicKey).toMatch(/^G[A-Z0-9]+$/);
    expect(keypair.secretKey).toMatch(/^S[A-Z0-9]+$/);
  });

  it('derives keypair from secret', async () => {
    const secret = 'SDAWB5AQYWKOZQFO4S2OYQ2P7GFOWY5J5GVYQLAXVA3QK2KQRDWZ74ZK';
    const keypair = keyPairFromSecret(secret);
    expect(keypair.publicKey).toBe('GAMEZ6NUTQUIZJJUEXYPBT2FXGP6JUIZW7F3JKCHFSHZYM5Q7CJW4KPA');
    expect(keypair.secretKey).toBe(secret);
  });

  it('validates mnemonics', async () => {
    await generateMnemonic();
    expect(validateMnemonic('illness spike retreat truth genius clock brain pass fit cave bargain toe')).toBe(true);
    expect(validateMnemonic('invalid words here definitely not a valid mnemonic phrase')).toBe(false);
  });
});
