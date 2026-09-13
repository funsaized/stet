import type { RefObject } from "react";
import type { Action } from "svelte/action";
import type { Directive } from "vue";
import type { StetHandle, StetOptions } from "../../../../src/index.js";

export type FutureStetOptions = StetOptions & {
  visible?: boolean;
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
};
export type AdapterOptions<T> = T & { onHandle?: (handle: StetHandle | null) => void };

export declare function ReactCircle(
  props: AdapterOptions<FutureStetOptions> & { target: RefObject<Element | null> },
): null;
export declare const vStetCircle: Directive<HTMLElement, AdapterOptions<FutureStetOptions>>;
export declare const svelteCircle: Action<
  HTMLElement,
  AdapterOptions<FutureStetOptions> | undefined
>;
