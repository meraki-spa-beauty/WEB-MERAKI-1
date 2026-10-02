import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/globals.css';
import { initTrafficSource } from './utils/trafficSource';

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
