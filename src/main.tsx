import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './index.css';
import { initTrafficSource } from './utils/trafficSource';

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

// Tier 1 Google Maps Platform quota & auth failure guard before React mount
if (typeof window !== 'undefined') {
  window.gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  };

  const origError = console.error.bind(console);

  console.error = (...args) => {
    origError(...args);

    const msg = args.map((item) => String(item)).join(' ');

    if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  };
}

initTrafficSource();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Meraki application root element was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
