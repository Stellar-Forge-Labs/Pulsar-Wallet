import { create } from 'zustand';

export interface NetworkState {
  network: 'testnet' | 'mainnet';
  horizonUrl: string;
  setNetwork: (network: 'testnet' | 'mainnet') => void;
  setHorizonUrl: (url: string) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  network: 'testnet',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  setNetwork: (network) => set({ network }),
  setHorizonUrl: (horizonUrl) => set({ horizonUrl }),
}));
