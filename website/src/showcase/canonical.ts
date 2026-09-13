import capabilities from '@funsaized/stet/agent/capabilities.json';
const templates = import.meta.glob<string>(
  '../../node_modules/@funsaized/stet/agent/templates/**/*',
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
);
export { capabilities };
export type Framework = keyof typeof capabilities.frameworks;
export function canonicalCode(framework: Framework, primitive = 'circle') {
  return templates[
    `../../node_modules/@funsaized/stet/agent/templates/${framework}/${primitive}.${capabilities.frameworks[framework].extension}`
  ];
}
