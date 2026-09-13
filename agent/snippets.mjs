import { lifecyclePattern } from "./patterns.mjs";
import { frameworks, primitives } from "./catalog.mjs";

// Template factory only: never transforms or evaluates application source.
export function snippet(primitive, framework) {
  if (!Object.hasOwn(primitives, primitive) || !Object.hasOwn(frameworks, framework))
    throw new Error("Unknown primitive or framework");
  if (primitive === "arrow" && ["vue", "svelte"].includes(framework))
    return lifecyclePattern(framework, true);
  const title = primitive[0].toUpperCase() + primitive.slice(1);
  const options = {
    seed: 42,
    ...(primitive === "sticky"
      ? { text: "Review the consequences before continuing.", offsetY: 8 }
      : primitive === "arrow"
        ? { label: "Review this action.", labelOffsetY: -12 }
        : { description: "Review this action before continuing." }),
  };
  const adapterOptions = { ...options, ...(primitive === "mark" ? { kind: "wrong" } : {}) };
  const js = (value) => JSON.stringify(value);
  const css = 'import "@funsaized/stet/style.css";';
  const note =
    "// Adapt these sample elements to existing source; retain their semantics and handlers.\n";
  if (framework === "vanilla")
    return {
      extension: "ts",
      code:
        note +
        `import { ${primitive} } from "@funsaized/stet";\n${css}\n\n// Call after DOM mount with resolved, unique Elements. Call cleanup before removal.\nexport function annotate(target: Element${primitive === "arrow" ? ", destination: Element" : ""}) {\n  const handle = ${primitive}(target, ${primitive === "arrow" ? "destination, " : primitive === "mark" ? '"wrong", ' : ""}${js(options)});\n  return { refresh: () => handle.refresh(), destroy: () => handle.destroy() };\n}\n`,
    };
  if (framework === "react") {
    const props = Object.entries(adapterOptions)
      .map(([k, v]) => `${k}={${js(v)}}`)
      .join(" ");
    return {
      extension: "tsx",
      code: `"use client";\n${note}import { useCallback, useRef } from "react";\nimport { ${title} } from "@funsaized/stet/react";\nimport type { StetHandle } from "@funsaized/stet";\n${css}\n\nexport function AnnotatedAction({ enabled = true }: { enabled?: boolean }) {\n  const target = useRef<HTMLButtonElement>(null);\n${primitive === "arrow" ? "  const destination = useRef<HTMLParagraphElement>(null);\n" : ""}  const handle = useRef<StetHandle | null>(null);\n  const onHandle = useCallback((next: StetHandle | null) => { handle.current = next; }, []);\n  return <>\n    <button ref={target} type="button">Review action</button>\n${primitive === "arrow" ? "    <p ref={destination}>Consequences of this action</p>\n" : ""}    {enabled && <${title} ${primitive === "arrow" ? "from={target} to={destination}" : "target={target}"} ${props} onHandle={onHandle} />}\n  </>;\n}\n`,
    };
  }
  if (framework === "vue")
    return {
      extension: "vue",
      code: `<script setup lang="ts">\n${note}import { ref } from "vue";\nimport { vStet${title} } from "@funsaized/stet/vue";\nimport type { StetHandle } from "@funsaized/stet";\n${css}\nconst handle = ref<StetHandle | null>(null);\nconst onHandle = (next: StetHandle | null) => { handle.value = next; };\n${primitive === "arrow" ? "const destination = ref<HTMLParagraphElement | null>(null);\n" : ""}</script>\n\n<template>\n${primitive === "arrow" ? '  <p ref="destination">Consequences of this action</p>\n  <!-- Wait until the destination exists before mounting the arrow host. -->\n' : ""}  <button ${primitive === "arrow" ? 'v-if="destination" ' : ""}type="button" v-stet-${primitive}='${primitive === "arrow" ? "{ ..." + js(adapterOptions) + ", to: destination, onHandle }" : "{ ..." + js(adapterOptions) + ", onHandle }"}'>Review action</button>\n</template>\n`,
    };
  if (framework === "svelte")
    return {
      extension: "svelte",
      code: `<script lang="ts">\n${note}import { ${primitive} } from "@funsaized/stet/svelte";\nimport type { StetHandle } from "@funsaized/stet";\n${css}\nlet handle: StetHandle | null = null;\nconst onHandle = (next: StetHandle | null) => { handle = next; };\n${primitive === "arrow" ? "let destination: HTMLParagraphElement | undefined;\n" : ""}</script>\n\n${primitive === "arrow" ? "<p bind:this={destination}>Consequences of this action</p>\n<!-- Wait for destination before mounting the action host. -->\n{#if destination}\n" : ""}<button type="button" use:${primitive}={{ ...${js(adapterOptions)}, ${primitive === "arrow" ? "to: destination, " : ""}onHandle }}>Review action</button>\n${primitive === "arrow" ? "{/if}\n" : ""}`,
    };
  return {
    extension: "ts",
    code:
      note +
      `import { Component } from "@angular/core";\nimport type { StetHandle } from "@funsaized/stet";\nimport { Stet${title}Directive } from "@funsaized/stet/angular";\n// Add @import "@funsaized/stet/style.css"; to the application's global stylesheet.\n@Component({\n  selector: "app-annotated-action",\n  standalone: true,\n  imports: [Stet${title}Directive],\n  template: \`\n${primitive === "arrow" ? "    <p #destination>Consequences of this action</p>\n" : ""}    <button type="button" [stet${title}]='${primitive === "arrow" ? '{ to: destination, seed: 42, label: "Review this action.", labelOffsetY: -12 }' : js(adapterOptions)}' [stetOnHandle]="onHandle">Review action</button>\n  \`,\n})\nexport class AnnotatedAction {\n  handle: StetHandle | null = null;\n  readonly onHandle = (next: StetHandle | null) => { this.handle = next; };\n}\n`,
  };
}
