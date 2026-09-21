import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';

// Polyfill Buffer for Midnight SDK and cryptographic libraries in the browser
window.Buffer = window.Buffer || Buffer;
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
