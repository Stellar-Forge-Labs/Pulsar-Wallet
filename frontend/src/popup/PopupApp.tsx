import { useWalletStore } from '../stores/wallet';
import { useNetworkStore } from '../stores/network';
import { useUiStore } from '../stores/ui';

function PopupApp() {
  const { isUnlocked, lock, reset } = useWalletStore();
  const { network } = useNetworkStore();
  const { autoLockMinutes, setAutoLockMinutes } = useUiStore();

  return (
    <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-electric-blue">Pulsar Wallet</h1>
        <span className="text-xs text-stellar-cyan capitalize bg-slate-800 px-2 py-1 rounded">
          {network}
        </span>
      </header>

      <main className="flex-1 p-4">
        {isUnlocked ? (
          <div className="space-y-4">
            <div className="card">
              <p className="text-slate-gray text-sm">Wallet connected</p>
              <p className="text-white font-mono text-sm mt-1">G...example</p>
            </div>

            <div className="space-y-2">
              <button className="btn-primary w-full">Send</button>
              <button className="btn-secondary w-full">Receive</button>
            </div>

            <div className="card">
              <label className="block text-sm text-slate-gray mb-1">
                Auto-lock after (minutes)
              </label>
              <input
                type="number"
                className="input"
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                min={1}
                max={60}
              />
            </div>

            <div className="space-y-2 pt-2">
              <button className="btn-secondary w-full" onClick={lock}>
                Lock
              </button>
              <button className="btn-danger w-full" onClick={reset}>
                Reset Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-slate-gray">Wallet is locked</p>
            <button className="btn-primary">Unlock</button>
          </div>
        )}
      </main>

      <footer className="p-3 border-t border-slate-700 text-center">
        <p className="text-xs text-slate-gray">Testnet</p>
      </footer>
    </div>
  );
}

export default PopupApp;
