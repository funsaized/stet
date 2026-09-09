import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { canonical, findPage, ORIGIN, structuredData } from './seo';
export function usePageMeta() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const p = findPage(path);
    document.title = p?.title ?? 'Page not found — Stet';
    const meta = (attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.append(element);
      }
      element.content = content;
    };
    meta('name', 'robots', p ? 'index,follow' : 'noindex,follow');
    meta(
      'name',
      'description',
      p?.description ??
        'This page could not be found. Explore Stet documentation and live UI examples.',
    );
    for (const prefix of ['og', 'twitter']) {
      const attribute = prefix === 'og' ? 'property' : 'name';
      meta(attribute, `${prefix}:title`, document.title);
      meta(attribute, `${prefix}:description`, p?.description ?? 'This page could not be found.');
      meta(attribute, `${prefix}:image`, `${ORIGIN}/social.png`);
    }
    const link = document.querySelector('link[rel="canonical"]');
    if (p) {
      const element = link ?? document.createElement('link');
      element.setAttribute('rel', 'canonical');
      element.setAttribute('href', canonical(p.path));
      if (!link) document.head.append(element);
      meta('property', 'og:url', canonical(p.path));
    } else {
      link?.remove();
      document.querySelector('meta[property="og:url"]')?.remove();
    }
    document.querySelector('#page-schema')?.remove();
    if (p) {
      const script = document.createElement('script');
      script.id = 'page-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData(p));
      document.head.append(script);
    }
  }, [path]);
}
