import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App, makeRouter } from './App';
import '@funsaized/stet/style.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/caveat/latin-400.css';
import './styles.css';

const root = document.getElementById('root')!;
const router = await makeRouter();
const app = (
  <StrictMode>
    <App router={router} />
  </StrictMode>
);
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
