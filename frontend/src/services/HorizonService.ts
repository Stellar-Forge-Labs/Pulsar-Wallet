import type { Horizon } from 'stellar-sdk';
import StellarSdk from 'stellar-sdk';

/**
 * HorizonService
 * ---------------
 * A thin wrapper around the Stellar SDK `Server` class that
 * 
 *  * keeps a single instance per network (mainnet / testnet)
 *  * exposes helpers to fetch account state and handle the
 *    "account not yet created" case.
 *
 * The service is intentionally minimal so that it can be
 * injected into stores or components without creating cyclic
 * dependencies.
 */

export type Network = 'testnet' | 'mainnet';

export interface Account {
  address: string;
  balances: AccountBalance[];
  sequence: string;
  hasAuth?: boolean;
}

export interface AccountBalance {
  asset_type: string; // e.g. "native" or "credit_alphanum4"
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
  limit?: string;
}

const serverMap: Record<Network, Horizon.Server> = {
  testnet: new StellarSdk.Server('https://horizon-testnet.stellar.org'),
  mainnet: new StellarSdk.Server('https://horizon.stellar.org'),
};

export const getServer = (network: Network): Horizon.Server => serverMap[network];

export const fetchAccount = async (
  network: Network,
  address: string,
): Promise<Account> => {
  const server = getServer(network);
  try {
    const account = await server.loadAccount(address);
    return {
      address: account.accountId(),
      sequence: account.sequence,
      balances: account.balances,
    };
  } catch (e: any) {
    // Stellar SDK throws an error when the account does not exist.
    if (e?.type === 'server_error' && e?.data?.code === 404) {
      throw new Error(`Account ${address} not found on ${network}`);
    }
    throw e;
  }
};

/**
 * A simple polling helper. In production you would move this into a
 * zustand store or a React hook that exposes value + loading state.
 */
export const pollAccount = (
  network: Network,
  address: string,
  callback: (acc: Account) => void,
  intervalMs = 30_000,
): (() => void) => {
  let timeout: NodeJS.Timeout | null = null;

  const loop = async () => {
    try {
      const acc = await fetchAccount(network, address);
      callback(acc);
    } catch {}
    timeout = setTimeout(loop, intervalMs);
  };

  loop();

  return () => {
    if (timeout) clearTimeout(timeout);
  };
};
