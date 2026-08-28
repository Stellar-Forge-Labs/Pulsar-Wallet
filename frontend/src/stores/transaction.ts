import { create } from 'zustand';

export interface DraftTransaction {
  destination: string;
  amount: string;
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
}

export interface TransactionState {
  draft: DraftTransaction | null;
  status: 'idle' | 'building' | 'confirming' | 'signing' | 'submitting' | 'success' | 'error';
  error: string | null;
  txHash: string | null;
  setDraft: (draft: DraftTransaction | null) => void;
  setStatus: (status: TransactionState['status']) => void;
  setError: (error: string | null) => void;
  setTxHash: (hash: string | null) => void;
  reset: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  draft: null,
  status: 'idle',
  error: null,
  txHash: null,
  
  setDraft: (draft) => set({ draft, status: draft ? 'confirming' : 'idle', error: null, txHash: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),
  setTxHash: (txHash) => set({ txHash }),
  reset: () => set({ draft: null, status: 'idle', error: null, txHash: null }),
}));
