import React, { useState } from 'react';
import { useTransactionStore } from '../../stores/transaction';
import { StellarTransactionService } from '../../services/TransactionBuilder';
import { useNetworkStore } from '../../stores/network';

export function TransactionConfirm() {
  const { draft, status, setStatus, setError, error, setTxHash, reset } = useTransactionStore();
  const { network } = useNetworkStore();
  const [loading, setLoading] = useState(false);

  if (!draft) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setStatus('building');
    setError(null);
    try {
      const { useWalletStore } = await import('../../stores/wallet');
      const publicKey = useWalletStore.getState().publicKey;
      
      if (!publicKey) throw new Error("Wallet not loaded");

      const service = new StellarTransactionService(network);
      
      const tx = await service.buildPaymentTx({
        sourcePublicKey: publicKey,
        destinationPublicKey: draft.destination,
        amount: draft.amount,
        assetCode: draft.assetCode,
        assetIssuer: draft.assetIssuer,
        memo: draft.memo,
      });

      setStatus('signing');
      const signedTx = service.signTransaction(tx);

      setStatus('submitting');
      const response = await service.submitTransaction(signedTx);
      
      setStatus('success');
      setTxHash(response.hash);
    } catch (err: any) {
      console.error(err);
      // Stellar sdk errors are sometimes nested, so we do our best to extract a readable message
      setError(err?.response?.data?.extras?.result_codes?.transaction || err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
  };

  if (status === 'success') {
    return (
      <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex flex-col">
        <header className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-success-green">Success</h1>
        </header>
        <main className="flex-1 p-4 space-y-4 flex flex-col justify-center">
          <div className="card text-center">
            <p className="text-white mb-2">Transaction sent successfully!</p>
            <p className="text-xs text-slate-gray break-words">Hash: {useTransactionStore.getState().txHash}</p>
          </div>
          <button className="btn-primary w-full" onClick={handleCancel}>Done</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex flex-col">
      <header className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-electric-blue">Confirm Transaction</h1>
      </header>
      <main className="flex-1 p-4 space-y-4">
        <div className="card space-y-2">
          <div>
            <span className="block text-xs text-slate-gray">To</span>
            <span className="block text-sm font-mono break-all">{draft.destination}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-gray">Amount</span>
            <span className="block text-sm">{draft.amount} {draft.assetCode || 'XLM'}</span>
          </div>
          <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
            <span className="text-xs text-slate-gray">Network Fee</span>
            <span className="text-xs text-slate-gray">0.00001 XLM</span>
          </div>
        </div>
        
        {error && <p className="text-error-red text-sm">{error}</p>}
        
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button className="btn-secondary w-full" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-primary w-full" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Sending...' : 'Confirm'}
          </button>
        </div>
      </main>
    </div>
  );
}
