import { ensureOpenSCADExternalsReady } from './setupOpenSCADBase';
import React from 'react';
import ReactDOM from 'react-dom/client';

async function bootstrap() {
  try {
    await ensureOpenSCADExternalsReady();
    const { default: App } = await import('./App');
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize OpenSCAD Playground', error);
  }
}

bootstrap();
