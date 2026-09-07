import { useState } from 'react';
import { Code } from './Code';
import { CopyButton } from './CopyButton';
import { Icon } from './Icon';
import { canonicalCode } from '../showcase/canonical';
const snippets = {
  React: canonicalCode('react'),
  JavaScript: canonicalCode('vanilla'),
  Vue: canonicalCode('vue'),
  Svelte: canonicalCode('svelte'),
  Angular: canonicalCode('angular'),
};
type Framework = keyof typeof snippets;
export function FrameworkCode() {
  const [framework, setFramework] = useState<Framework>('React');
  return (
    <div className="framework-code">
      <div className="framework-tabs" aria-label="Framework examples">
        {(Object.keys(snippets) as Framework[]).map((f) => (
          <button key={f} aria-pressed={framework === f} onClick={() => setFramework(f)}>
            {f === 'React' ? '⚛︎ ' : ''}
            {f}
          </button>
        ))}
      </div>
      <div className="code-filename">
        <span>
          <span className="status-dot" />
          {
            {
              React: 'AnnotatedAction.tsx',
              JavaScript: 'annotate.ts',
              Vue: 'AnnotatedAction.vue',
              Svelte: 'AnnotatedAction.svelte',
              Angular: 'annotated-action.component.ts',
            }[framework]
          }
        </span>
        <CopyButton value={snippets[framework]} />
      </div>
      <Code text={snippets[framework]} />
      <div className="code-footer">
        <span>That’s it. Your button is still your button.</span>
        <Icon name="check" size={15} />
      </div>
    </div>
  );
}
