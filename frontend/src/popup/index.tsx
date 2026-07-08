import React from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/index.css';
import PopupApp from './PopupApp';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

createRoot(container).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
);
