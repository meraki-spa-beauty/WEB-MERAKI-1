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

// Maps auth & quota listener before React mount
if (typeof window !== 'undefined') {
  window.gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
  };

  const origError = console.error.bind(console);

  console.error = (...args) => {
    origError(...args);

    const msg = args.map((item) => String(item)).join(' ');

    if (
      msg.includes('InvalidKeyMapError') ||
      msg.includes('ApiNotActivatedMapError') ||
      msg.includes('RefererNotAllowedMapError') ||
      msg.includes('BillingNotEnabledMapError')
    ) {
      window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    } else if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
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
