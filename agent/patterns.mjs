import { frameworks } from './catalog.mjs';

// Copyable component-local lifecycle examples, not an application runtime layer.
export function lifecyclePattern(framework, arrowOnly = false) {
  if (!Object.hasOwn(frameworks, framework)) throw new Error('Unknown framework');
  const helper = `import { arrow, circle, sticky, type StetHandle } from "@funsaized/stet";
function attachMarks(target: Element, destination: Element | null | undefined, enabled: boolean) {
  const handles: StetHandle[] = [];
  const destroy = () => { for (const handle of handles.splice(0).reverse()) handle.destroy(); };
  try {
    if (enabled) {
${arrowOnly ? '' : '      handles.push(circle(target, { seed: 42, description: "Review this action before continuing." }));\n      handles.push(sticky(target, { seed: 43, text: "Read the consequences before continuing." }));\n'}      if (destination) handles.push(arrow(target, destination, { seed: 44, label: "Consequences are explained here." }));
    }
    return destroy;
  } catch (error) { destroy(); throw error; }
}
`;
  const note = '// Adapt to existing controls; annotation state never controls their presence.\n';
  const css = 'import "@funsaized/stet/style.css";\n';
  if (framework === 'vanilla') return { extension: 'ts', code: note + helper + css + `
// Call update after the application mounts/replaces/removes its destination.
// Call destroy before removing the source control. Reattachment preserves seeds.
export function annotate(target: Element) {
  let cleanup = () => {};
  return {
    update(enabled: boolean, destination: Element | null = null) {
      cleanup(); cleanup = () => {};
      cleanup = attachMarks(target, destination, enabled);
    },
    destroy() { cleanup(); cleanup = () => {}; },
  };
}
` };
  if (framework === 'react') return { extension: 'tsx', code: '"use client";\n' + note + 'import { useEffect, useRef } from "react";\n' + helper + css + `
export function AnnotatedAction({ enabled = true, destination = 0 }: { enabled?: boolean; destination?: number }) {
  const target = useRef<HTMLButtonElement>(null);
  const to = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (target.current) return attachMarks(target.current, to.current, enabled);
  }, [enabled, destination]);
  return <>
    <button ref={target} type="submit">Review action</button>
    {destination > 0 && <p key={destination} ref={to}>Consequences of this action</p>}
  </>;
}
` };
  if (framework === 'vue') return { extension: 'vue', code: '<script setup lang="ts">\n' + note + 'import { ref, watchPostEffect } from "vue";\n' + helper + css + `
const props = withDefaults(defineProps<{ enabled?: boolean; destination?: number }>(), { enabled: true, destination: 0 });
const target = ref<HTMLButtonElement | null>(null);
const to = ref<HTMLParagraphElement | null>(null);
watchPostEffect(onCleanup => {
  if (target.value) onCleanup(attachMarks(target.value, to.value, props.enabled));
});
</script>
<template>
  <button ref="target" type="submit">Review action</button>
  <p v-if="props.destination > 0" :key="props.destination" ref="to">Consequences of this action</p>
</template>
` };
  if (framework === 'svelte') return { extension: 'svelte', code: '<script lang="ts">\n' + note + helper + css + `
let { enabled = true, destination = 0 }: { enabled?: boolean; destination?: number } = $props();
let target = $state<HTMLButtonElement>();
let to = $state<HTMLParagraphElement>();
$effect(() => {
  if (target) return attachMarks(target, to, enabled);
});
</script>
<button bind:this={target} type="submit">Review action</button>
{#if destination > 0}{#key destination}
  <p bind:this={to}>Consequences of this action</p>
{/key}{/if}
` };
  return { extension: 'ts', code: note + 'import { Component, ElementRef, afterRenderEffect, input, viewChild } from "@angular/core";\n' + helper + `
// Add @import "@funsaized/stet/style.css"; to the application global stylesheet.
@Component({
  selector: "app-annotated-action",
  standalone: true,
  template: \`
    <button #target type="submit">Review action</button>
    @for (key of destination() > 0 ? [destination()] : []; track key) {
      <p #to>Consequences of this action</p>
    }
  \`,
})
export class AnnotatedAction {
  readonly enabled = input(true);
  readonly destination = input(0);
  private readonly target = viewChild<ElementRef<HTMLButtonElement>>('target');
  private readonly to = viewChild<ElementRef<HTMLParagraphElement>>('to');
  constructor() {
    afterRenderEffect(onCleanup => {
      const target = this.target()?.nativeElement;
      if (target) onCleanup(attachMarks(target, this.to()?.nativeElement, this.enabled()));
    });
  }
}
` };
}
