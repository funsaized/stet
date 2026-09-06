import { useState } from 'react';
import { Code } from './Code';
import { CopyButton } from './CopyButton';
import { Icon } from './Icon';
const snippets = {
  React: `import { useRef } from "react";\nimport { Circle } from "@funsaized/stet/react";\nimport "@funsaized/stet/style.css";\n\nexport default function LittleWin() {\n  const button = useRef(null);\n\n  return (\n    <>\n      <button ref={button}>Ship it</button>\n      <Circle target={button} stroke="#c84935" />\n    </>\n  );\n}`,
  JavaScript: `import { circle } from "@funsaized/stet";\nimport "@funsaized/stet/style.css";\n\nconst button = document.querySelector("#ship");\nconst sketch = circle(button, {\n  stroke: "#c84935",\n});\n\n// A fresh sketch, whenever you like.\nsketch.resketch();\n\n// Clean up when the element is removed.\nsketch.destroy();`,
  Vue: `<script setup>\nimport { vStetCircle } from "@funsaized/stet/vue";\nimport "@funsaized/stet/style.css";\n</script>\n\n<template>\n  <button v-stet-circle="{ stroke: '#c84935' }">\n    Ship it\n  </button>\n</template>`,
  Svelte: `<script>\n  import { circle } from "@funsaized/stet/svelte";\n  import "@funsaized/stet/style.css";\n</script>\n\n<button use:circle={{ stroke: "#c84935" }}>\n  Ship it\n</button>`,
  Angular: `import { Component } from "@angular/core";\nimport { StetCircleDirective } from "@funsaized/stet/angular";\nimport "@funsaized/stet/style.css";\n\n@Component({\n  selector: "app-little-win",\n  standalone: true,\n  imports: [StetCircleDirective],\n  template: \`\n    <button [stetCircle]="{ stroke: '#c84935' }">\n      Ship it\n    </button>\n  \`,\n})\nexport class LittleWin {}`,
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
              React: 'LittleWin.jsx',
              JavaScript: 'little-win.js',
              Vue: 'LittleWin.vue',
              Svelte: 'LittleWin.svelte',
              Angular: 'little-win.component.ts',
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
