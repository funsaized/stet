import type { Framework } from './showcase/canonical';

export const frameworks: {
  id: Framework;
  slug: string;
  name: string;
  description: string;
  api: string;
  lifecycle: string;
  use: string;
}[] = [
  {
    id: 'react',
    slug: 'react',
    name: 'React',
    description:
      'Add hand-drawn UI annotations in React with DOM refs and Stet components. Install the library, handle conditional targets, and clean up marks after unmount.',
    api: 'React components attach to DOM refs after mount and render no wrapper element. Keep the ref on your existing button; conditionally mount Circle to toggle emphasis without removing the control.',
    lifecycle:
      'For several marks or changing arrow destinations, useEffect can attach the core handles and return their cleanup function. Include enabled state and destination identity in the dependencies. Cleanup also makes development Strict Mode remounts safe.',
    use: 'Use a conditional Circle to identify a form finding, then remove the finding when your application resolves it.',
  },
  {
    id: 'vue',
    slug: 'vue',
    name: 'Vue',
    description:
      'Annotate Vue interfaces with Stet directives. Learn directive bindings, post-render effects, changing targets, and cleanup with canonical Vue examples.',
    api: 'Vue exposes directives such as vStetCircle. Import the directive in script setup and bind options directly to the existing element with v-stet-circle. Vue retains ownership of the element and its event handlers.',
    lifecycle:
      'When multiple marks depend on reactive targets, watchPostEffect runs after Vue updates the DOM. Register the returned cleanup with onCleanup so old handles are destroyed before a new binding or destination is attached.',
    use: 'Bind an annotation to a reactive settings control; use post-render effects when a conditional explanation becomes an arrow destination.',
  },
  {
    id: 'svelte',
    slug: 'svelte',
    name: 'Svelte',
    description:
      'Use Stet actions to annotate Svelte UI elements. See action options, Svelte 5 effects, conditional destinations, and lifecycle cleanup in working source examples.',
    api: 'The Svelte adapter exposes element actions: import circle from @funsaized/stet/svelte and apply use:circle to your button. Action updates follow option changes and destroy the annotation when the element is removed.',
    lifecycle:
      'For coordinated marks in Svelte 5, bind:this supplies the target and $effect attaches handles after the DOM update. Return cleanup from the effect. A keyed conditional destination makes replacement explicit while preserving the source control.',
    use: 'Keep tutorial form values in your Svelte state and change only the marks as the reader advances.',
  },
  {
    id: 'angular',
    slug: 'angular',
    name: 'Angular',
    description:
      'Add Stet annotation directives to Angular components. Learn standalone imports, global styles, signal inputs, after-render effects, and cleanup.',
    api: 'Import StetCircleDirective in a standalone component and bind [stetCircle] to an options object on the original control. Put the Stet CSS import in the global stylesheet so body-level overlays receive their styles.',
    lifecycle:
      'For multiple handles, afterRenderEffect reads signal inputs and viewChild ElementRefs after rendering. Register cleanup with onCleanup before targets change. The canonical example uses a tracked @for block to model destination replacement.',
    use: 'Annotate a settings form inside an Angular component without replacing its validation, handlers, or native focus behavior.',
  },
  {
    id: 'vanilla',
    slug: 'javascript',
    name: 'JavaScript',
    description:
      'Draw hand-sketched annotations on live DOM elements with Stet’s JavaScript API. Install, attach marks, refresh placement, and destroy handles on cleanup.',
    api: 'The core exports circle, underline, highlight, arrow, mark, and sticky. Pass resolved Elements after DOM mount. Each call returns a handle; your application decides when to attach and remove it. No framework or runtime dependency is required.',
    lifecycle:
      'Call refresh after application-driven movement that does not resize the target. Call destroy before removing the element. When changing options or arrow destinations, destroy old handles and attach new ones; keep the same seed for repeatable geometry.',
    use: 'Add marks to an existing handbook or product demo with ordinary DOM elements and your own event listeners.',
  },
];
