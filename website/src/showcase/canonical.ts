import capabilities from '../../../agent/capabilities.json';
const templates = import.meta.glob<string>('../../../agent/templates/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
});
export { capabilities };
export type Framework = keyof typeof capabilities.frameworks;
export function canonicalCode(framework: Framework, primitive = 'circle') {
  return templates[
    `../../../agent/templates/${framework}/${primitive}.${capabilities.frameworks[framework].extension}`
  ];
}
