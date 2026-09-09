import { scenarios } from './showcase/scenarios';
import { frameworks } from './frameworks';
export const ORIGIN = 'https://www.stetkit.com';
export type PageKind =
  | 'home'
  | 'docs'
  | 'framework'
  | 'playground'
  | 'cases'
  | 'scenario'
  | 'workflow';
export const pageComponents: Record<PageKind, string> = {
  home: 'Home',
  docs: 'Docs',
  framework: 'FrameworkDocs',
  playground: 'PlaygroundPage',
  cases: 'UseCases',
  scenario: 'UseCases',
  workflow: 'AgentWorkflow',
};
export type PublicPage = {
  path: string;
  title: string;
  description: string;
  label: string;
  kind: PageKind;
  parent?: string;
  index: true;
  sitemap: true;
};
const page = (
  path: string,
  title: string,
  description: string,
  label: string,
  kind: PageKind,
  parent?: string,
): PublicPage => ({ path, title, description, label, kind, parent, index: true, sitemap: true });
export const publicPages: PublicPage[] = [
  page(
    '/',
    'Stet — Hand-Drawn UI Annotation Library',
    'Hand-sketched annotations for live interfaces. A free JavaScript library for developers and coding agents, with React, Vue, Svelte, and Angular adapters.',
    'Stet',
    'home',
  ),
  page(
    '/docs',
    'Stet Documentation — JavaScript UI Annotations',
    'Install Stet, choose a framework, and attach annotations to existing UI elements. Explore six primitives, styling, accessibility, and coding-agent setup.',
    'Documentation',
    'docs',
  ),
  page(
    '/playground',
    'UI Annotation Playground — Try Stet’s Six Primitives',
    'Try circles, highlights, underlines, arrows, sticky notes, and proofreader marks on live UI. Tune the ink and copy options for your own interface.',
    'Playground',
    'playground',
  ),
  page(
    '/use-cases',
    'Live UI Annotation Examples — Stet Use Cases',
    'Explore working UI annotation examples for form review, product demos, guided tutorials, documentation, and coding-agent handoffs. Inspect the source and plans.',
    'Use cases',
    'cases',
  ),
  page(
    '/agent-workflow',
    'UI Annotations for Coding Agents — Stet Workflow',
    'Follow a task from project inspection through a validated annotation plan, framework implementation, browser verification, and visual handoff with Stet.',
    'Agent workflow',
    'workflow',
  ),
  ...scenarios.map((s) =>
    page(
      `/use-cases/${s.id}`,
      `${s.seoTitle} — Stet`,
      s.description,
      s.title,
      'scenario',
      '/use-cases',
    ),
  ),
  ...frameworks.map((f) =>
    page(
      `/docs/${f.slug}`,
      `${f.name} UI Annotation Library — Stet Guide`,
      f.description,
      f.name,
      'framework',
      '/docs',
    ),
  ),
];
export const findPage = (path: string) => publicPages.find((p) => p.path === path);
export const canonical = (path: string) => `${ORIGIN}${path}`;
export function structuredData(p: PublicPage) {
  const website = {
    '@type': 'WebSite',
    '@id': `${ORIGIN}/#website`,
    url: `${ORIGIN}/`,
    name: 'Stet',
  };
  if (p.kind === 'home')
    return {
      '@context': 'https://schema.org',
      '@graph': [
        website,
        {
          '@type': 'SoftwareApplication',
          '@id': `${ORIGIN}/#software`,
          name: 'Stet',
          url: `${ORIGIN}/`,
          description: p.description,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web browser',
          license: 'https://github.com/funsaized/stet/blob/master/LICENSE',
          downloadUrl: 'https://www.npmjs.com/package/@funsaized/stet',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      ],
    };
  const ancestors = [publicPages[0], ...(p.parent ? [findPage(p.parent)!] : []), p];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: ancestors.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: canonical(item.path),
    })),
  };
}
