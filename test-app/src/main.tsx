import { ensureOpenSCADExternalsReady } from './setupOpenSCADBase';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ensureOpenSCADExternalsReady().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch((error) => {
  console.error('Failed to load OpenSCAD externals', error);
});
