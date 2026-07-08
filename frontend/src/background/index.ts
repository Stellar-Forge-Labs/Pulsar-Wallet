chrome.runtime.onInstalled.addListener(() => {
  console.log('Pulsar Wallet background service worker started');
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'auto-lock') {
    console.log('Auto-lock triggered');
    chrome.runtime.sendMessage({ type: 'LOCK_WALLET' }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message, _sender) => {
  if (message.type === 'SET_AUTO_LOCK') {
    const minutes = message.minutes;
    chrome.alarms.create('auto-lock', { delayInMinutes: minutes, periodInMinutes: minutes });
  } else if (message.type === 'CANCEL_AUTO_LOCK') {
    chrome.alarms.clear('auto-lock');
  }
  return false;
});
