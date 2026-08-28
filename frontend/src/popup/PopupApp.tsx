import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/wallet';
import { useNetworkStore } from '../stores/network';
import { useUiStore } from '../stores/ui';
import { getPasswordStrength } from '../crypto/crypto';
import { useTransactionStore } from '../stores/transaction';
import { TransactionConfirm } from './components/TransactionConfirm';

type View = 'loading' | 'locked' | 'unlocked' | 'create' | 'import' | 'mnemonic' | 'confirm';

function PopupApp() {
  const { publicKey, lock, reset, createWallet, importWallet, checkHasWallet } = useWalletStore();
  const { network, setNetwork } = useNetworkStore();
  const { autoLockMinutes, setAutoLockMinutes } = useUiStore();
  const { status: txStatus, setDraft } = useTransactionStore();

  const [view, setView] = useState<View>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [importValue, setImportValue] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [quizWordIndex, setQuizWordIndex] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>([]);

  useEffect(() => {
    checkHasWallet().then(() => {
      const state = useWalletStore.getState();
      if (state.isUnlocked) {
        setView('unlocked');
      } else if (state.hasWallet) {
        setView('locked');
      } else {
        setView('locked');
      }
    });
  }, [checkHasWallet]);

  useEffect(() => {
    const handleMessage = (_message: any) => {
      if (_message.type === 'LOCK_WALLET') {
        lock();
        setView('locked');
        setPassword('');
        setError('');
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [lock]);

  const handleUnlock = async () => {
    setLoading(true);
    setError('');
    const success = await useWalletStore.getState().unlock(password);
    setLoading(false);
    if (success) {
      setView('unlocked');
      setPassword('');
    } else {
      setError('Invalid password');
    }
  };

  const startMnemonicQuiz = () => {
    const words = generatedMnemonic.split(' ');
    const index = Math.floor(Math.random() * words.length);
    setQuizWordIndex(index);
    const correct = words[index];
    const options = [correct];
    while (options.length < 4) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      if (!options.includes(randomWord)) {
        options.push(randomWord);
      }
    }
    options.sort(() => Math.random() - 0.5);
    setQuizOptions(options);
    setQuizAnswer('');
  };

  const handleCreate = async () => {
    const strength = getPasswordStrength(password);
    if (strength.score < 3) {
      setError('Password is too weak. Add uppercase, numbers, or symbols.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await createWallet(password);
      setGeneratedMnemonic(result.mnemonic);
      setView('mnemonic');
    } catch {
      setError('Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleMnemonicNext = () => {
    startMnemonicQuiz();
    setView('confirm');
  };

  const handleConfirmMnemonic = () => {
    const words = generatedMnemonic.split(' ');
    const correct = words[quizWordIndex!];
    if (quizAnswer === correct) {
      setView('unlocked');
    } else {
      setError('Incorrect word. Please try again or restart.');
      setView('mnemonic');
    }
  };

  const handleImport = async () => {
    if (!importValue.trim()) {
      setError('Please enter a mnemonic or secret key');
      return;
    }
    const strength = getPasswordStrength(password);
    if (strength.score < 3) {
      setError('Password is too weak. Add uppercase, numbers, or symbols.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await importWallet(importValue.trim(), password);
      setView('unlocked');
      setImportValue('');
      setPassword('');
    } catch {
      setError('Invalid mnemonic or secret key');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    lock();
    setView('locked');
    setPassword('');
    setError('');
  };

  const handleReset = async () => {
    await reset();
    setView('locked');
    setPassword('');
    setError('');
  };

  const passwordStrength = getPasswordStrength(password);

  if (view === 'loading') {
    return (
      <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex items-center justify-center">
        <p className="text-slate-gray">Loading...</p>
      </div>
    );
  }

  if (view === 'mnemonic') {
    return (
      <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex flex-col">
        <header className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-electric-blue">Backup Phrase</h1>
        </header>
        <main className="flex-1 p-4 space-y-4">
          <div className="card">
            <p className="text-sm text-slate-gray mb-2">Write down these 24 words in order and store them safely.</p>
            <p className="text-xs text-error-red mb-3">Never share your recovery phrase with anyone.</p>
            <p className="text-white font-mono text-sm leading-relaxed break-words">{generatedMnemonic}</p>
          </div>
          <button className="btn-primary w-full" onClick={handleMnemonicNext}>
            I wrote down my phrase
          </button>
        </main>
      </div>
    );
  }

  if (view === 'confirm') {
    return (
      <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex flex-col">
        <header className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-electric-blue">Confirm Phrase</h1>
        </header>
        <main className="flex-1 p-4 space-y-4">
          <div className="card">
            <p className="text-sm text-slate-gray mb-3">Select the correct word for position #{quizWordIndex! + 1}</p>
            <div className="grid grid-cols-2 gap-2">
              {quizOptions.map((option) => (
                <button
                  key={option}
                  className={`btn-secondary w-full ${quizAnswer === option ? 'border-success-green text-success-green' : ''}`}
                  onClick={() => setQuizAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-error-red text-sm">{error}</p>}
          <button className="btn-primary w-full" onClick={handleConfirmMnemonic} disabled={!quizAnswer}>
            Confirm
          </button>
        </main>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex flex-col">
        <header className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-electric-blue">Create Wallet</h1>
        </header>
        <main className="flex-1 p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-gray mb-1">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} transition-all`} style={{ width: `${(passwordStrength.score / 6) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-gray">{passwordStrength.label}</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-gray mb-1">Confirm Password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
            />
          </div>
          {error && <p className="text-error-red text-sm">{error}</p>}
          <button className="btn-primary w-full" onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Wallet'}
          </button>
          <button className="btn-secondary w-full" onClick={() => setView('locked')}>
            Back
          </button>
        </main>
      </div>
    );
  }

  if (view === 'import') {
    return (
      <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex flex-col">
        <header className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-electric-blue">Import Wallet</h1>
        </header>
        <main className="flex-1 p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-gray mb-1">Mnemonic or Secret Key</label>
            <textarea
              className="input h-24 resize-none"
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder="Enter 12/24 words or secret key"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-gray mb-1">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} transition-all`} style={{ width: `${(passwordStrength.score / 6) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-gray">{passwordStrength.label}</span>
                </div>
              </div>
            )}
          </div>
          {error && <p className="text-error-red text-sm">{error}</p>}
          <button className="btn-primary w-full" onClick={handleImport} disabled={loading}>
            {loading ? 'Importing...' : 'Import Wallet'}
          </button>
          <button className="btn-secondary w-full" onClick={() => setView('locked')}>
            Back
          </button>
        </main>
      </div>
    );
  }

  if (view === 'locked') {
    return (
      <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex flex-col">
        <header className="flex items-center justify-center p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-electric-blue">Pulsar Wallet</h1>
        </header>
        <main className="flex-1 p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-gray mb-1">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Enter password"
            />
          </div>
          {error && <p className="text-error-red text-sm">{error}</p>}
          <button className="btn-primary w-full" onClick={handleUnlock} disabled={loading}>
            {loading ? 'Unlocking...' : 'Unlock'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary w-full" onClick={() => setView('create')}>
              Create
            </button>
            <button className="btn-secondary w-full" onClick={() => setView('import')}>
              Import
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (txStatus !== 'idle') {
    return <TransactionConfirm />;
  }

  return (
    <div className="min-w-[320px] min-h-[480px] bg-deep-space text-white font-body flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-electric-blue">Pulsar Wallet</h1>
        <select 
          className="bg-slate-800 text-stellar-cyan text-xs px-2 py-1 rounded border border-slate-700 outline-none cursor-pointer capitalize"
          value={network}
          onChange={(e) => setNetwork(e.target.value as 'testnet' | 'mainnet')}
        >
          <option value="mainnet">Mainnet</option>
          <option value="testnet">Testnet</option>
        </select>
      </header>

      <main className="flex-1 p-4">
        <div className="space-y-4">
          <div className="card">
            <p className="text-slate-gray text-sm">Wallet connected</p>
            <p className="text-white font-mono text-sm mt-1" title={publicKey || ''}>
              {publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}` : 'Loading...'}
            </p>
          </div>

          <div className="space-y-2">
            <button className="btn-primary w-full" onClick={() => {
              setDraft({
                destination: 'GBQA5O5T2M2ZY36QW4P4T5AABR2N7C6N2A2R3X4G5B6C7D8E9F0A1B2C',
                amount: '1'
              });
            }}>Send (Test)</button>
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
              onChange={(e) => {
                const minutes = Number(e.target.value);
                setAutoLockMinutes(minutes);
                if (minutes > 0) {
                  chrome.runtime.sendMessage({ type: 'SET_AUTO_LOCK', minutes });
                } else {
                  chrome.runtime.sendMessage({ type: 'CANCEL_AUTO_LOCK' });
                }
              }}
              min={1}
              max={60}
            />
          </div>

          <div className="space-y-2 pt-2">
            <button className="btn-secondary w-full" onClick={handleLock}>
              Lock
            </button>
            <button className="btn-danger w-full" onClick={handleReset}>
              Reset Wallet
            </button>
          </div>
        </div>
      </main>

      <footer className="p-3 border-t border-slate-700 text-center">
        <p className="text-xs text-slate-gray capitalize">{network}</p>
      </footer>
    </div>
  );
}

export default PopupApp;
