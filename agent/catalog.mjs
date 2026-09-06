// Agent-only behavior metadata. Option types come from src/*.ts, identity from package.json.
export const frameworks = {
  vanilla: { extension: 'ts', subpath: '', shape: 'DOM attachers', lifecycle: 'Attach after DOM mount; destroy before removal; destroy and reattach to change options.' },
  react: { extension: 'tsx', subpath: '/react', shape: 'null-rendering components with target refs; Arrow uses from/to refs', lifecycle: 'Effects attach after commit and clean up; ref changes require a React commit.' },
  vue: { extension: 'vue', subpath: '/vue', shape: 'vStet directives; arrow host is from, binding.to is Element', lifecycle: 'mounted/updated/unmounted; mount arrow host only after destination exists.' },
  svelte: { extension: 'svelte', subpath: '/svelte', shape: 'actions; arrow host is from, options.to is Element', lifecycle: 'Action update/destroy; mount arrow host only after destination exists.' },
  angular: { extension: 'ts', subpath: '/angular', shape: 'standalone Stet*Directive; arrow host is from, input.to is Element', lifecycle: 'afterNextRender/ngOnChanges/ngOnDestroy; replace input option objects on update.' },
};
export const primitives = {
  circle: { type: 'StetOptions', targets: ['target'], padding: 5, purpose: 'Emphasize an existing element', meaningfulText: 'description' },
  underline: { type: 'StetOptions', targets: ['target'], padding: 3, purpose: 'Emphasize words, following wrapped text', meaningfulText: 'description' },
  highlight: { type: 'StetOptions', targets: ['target'], padding: 5, purpose: 'Marker wash following wrapped text', meaningfulText: 'description' },
  arrow: { type: 'ArrowOptions', targets: ['from', 'to'], purpose: 'Connect two existing elements', meaningfulText: 'label or description; describes to' },
  sticky: { type: 'StickyOptions', targets: ['target'], padding: 14, purpose: 'Explain with concise paper-note text', meaningfulText: 'text; describes target' },
  mark: { type: 'StetOptions', targets: ['target'], padding: 4, purpose: 'Check right or cross wrong; kind is a separate core argument', meaningfulText: 'description' },
};
export const defaults = { seed: 'random uint32', roughness: 1, boil: 0, stroke: 'CSS token', fill: 'CSS token', width: 'CSS token', resketchOnHover: false, description: 'absent', label: 'absent', curvature: 0.16, side: 'auto' };
export const strategies = ['ref', 'id', 'data-attribute', 'source', 'stet-attribute', 'css'];
export const tools = { claude: '.claude/skills', cursor: '.agents/skills', opencode: '.agents/skills', codex: '.agents/skills' };
export const constraints = {
  ownership: 'Existing UI owns layout, semantics, focus, pointer interaction, forms and lifecycle. Annotations never replace controls.',
  accessibility: 'SVG is decorative. Supply description for meaningful marks. Sticky text and arrow labels are DOM text linked by aria-describedby. Do not use annotations as the only persistent safety warning.',
  motion: 'Still by default; reduced motion disables boil and hover resketch live. Fixed seed, dimensions and options reproduce geometry.',
  lifecycle: 'DOM Elements in the current document and document.body must exist. Options are snapshots. Handles expose refresh(), resketch(seed?), destroy().',
  targeting: 'Targets are source-editing evidence, not executable selectors. Prove uniqueness and readiness in application code. Arrow order is from, to.',
  placement: 'Body overlays; resize/scroll/font tracking. Movement without resize needs refresh(). No collision engine, cross-document targets, top-layer dialogs or transformed/zoomed body/html support. Partial clipping and very long notes need visual review.',
  styling: 'Import @funsaized/stet/style.css once; preserve target layout and semantics. CSS variables theme the overlay.',
};
