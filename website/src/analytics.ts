import { ORIGIN } from './seo';

// Keep local previews out of conversion counts. Never send copied code or form values.
export function trackAction(event: 'copy_install' | 'select_framework', framework?: string) {
  if (window.location.origin !== ORIGIN) return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('event', event, framework ? { framework } : {});
}
