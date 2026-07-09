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
