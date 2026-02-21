import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Robust process shim for browser environments to prevent Uncaught ReferenceErrors
// when libraries or the SDK attempt to access process.env
const win = window as any;
win.process = win.process || { env: {} };
win.process.env = win.process.env || {};
win.process.env.NODE_ENV = win.process.env.NODE_ENV || 'production';

const rootElement = document.getElementById('root');
if (!rootElement) {
  // This helps identify if the script is running before the DOM is ready
  console.error("ChronoMax: Root element #root not found at initialization.");
} else {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}