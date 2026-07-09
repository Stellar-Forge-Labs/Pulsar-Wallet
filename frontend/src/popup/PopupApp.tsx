import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/wallet';
import { useNetworkStore } from '../stores/network';
import { useUiStore } from '../stores/ui';
import { getPasswordStrength } from '../crypto/crypto';

type View = 'loading' | 'locked' | 'unlocked' | 'create' | 'import' | 'mnemonic' | 'confirm';

function PopupApp() {
  const { publicKey, lock, reset, createWallet, importWallet, checkHasWallet } = useWalletStore();
  const { network } = useNetworkStore();
  const { autoLockMinutes, setAutoLockMinutes } = useUiStore();

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
