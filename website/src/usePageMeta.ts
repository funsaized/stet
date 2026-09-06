import { useEffect } from 'react';
export function usePageMeta(title: string, path: string) {
  useEffect(() => {
    document.title = title;
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `https://stetkit.com${path}`);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute('content', `https://stetkit.com${path}`);
  }, [title, path]);
}
