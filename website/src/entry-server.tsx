import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App, makeRouter } from './App';
export { publicPages, pageComponents, canonical, ORIGIN, structuredData } from './seo';
export async function render(path: string) {
  const router = await makeRouter(path);
  return renderToString(
    <StrictMode>
      <App router={router} />
    </StrictMode>,
  );
}
