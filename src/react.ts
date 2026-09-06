"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  arrow,
  circle,
  highlight,
  mark,
  sticky,
  underline,
  type ArrowOptions,
  type MarkKind,
  type StetHandle,
  type StetOptions,
  type StickyOptions,
} from "./index.js";

type TargetProps<T extends StetOptions = StetOptions> = T & {
  target: RefObject<Element | null>;
};

function useTarget(
  target: RefObject<Element | null>,
  attach: (element: Element) => StetHandle,
  dependencies: readonly unknown[],
): void {
  useTargets([target], ([element]) => attach(element), dependencies);
}

function useTargets(
  refs: RefObject<Element | null>[],
  attach: (elements: Element[]) => StetHandle,
  dependencies: readonly unknown[],
): void {
  const mounted = useRef<{ elements: (Element | null)[]; dependencies: readonly unknown[]; handle?: StetHandle } | null>(null);
  // Ref identity can stay stable while React replaces the underlying DOM node.
  useEffect(() => {
    const elements = refs.map((ref) => ref.current);
    const previous = mounted.current;
    if (previous && elements.every((element, index) => element === previous.elements[index]) &&
      dependencies.every((value, index) => Object.is(value, previous.dependencies[index]))) return;
    previous?.handle?.destroy();
    mounted.current = { elements, dependencies,
      handle: elements.every((element): element is Element => element !== null) ? attach(elements) : undefined };
  });
  useEffect(() => () => {
    mounted.current?.handle?.destroy();
    mounted.current = null;
  }, []);
}

function optionsOf(props: StetOptions): StetOptions {
  const { seed, roughness, boil, stroke, fill, width, resketchOnHover, padding, description } = props;
  return { seed, roughness, boil, stroke, fill, width, resketchOnHover, padding, description };
}

const dependenciesOf = (options: StetOptions): unknown[] => Object.values(options);

export function Circle(props: TargetProps): null {
  const options = optionsOf(props);
  useTarget(props.target, (element) => circle(element, options), dependenciesOf(options));
  return null;
}

export function Underline(props: TargetProps): null {
  const options = optionsOf(props);
  useTarget(props.target, (element) => underline(element, options), dependenciesOf(options));
  return null;
}

export function Highlight(props: TargetProps): null {
  const options = optionsOf(props);
  useTarget(props.target, (element) => highlight(element, options), dependenciesOf(options));
  return null;
}

export function Sticky(props: TargetProps<StickyOptions>): null {
  const { target, text, side, ...shared } = props;
  const options = { ...optionsOf(shared), text, side };
  useTarget(target, (element) => sticky(element, options), [
    ...dependenciesOf(optionsOf(shared)),
    text,
    side,
  ]);
  return null;
}

export function Mark(props: TargetProps & { kind: MarkKind }): null {
  const { target, kind } = props;
  const options = optionsOf(props);
  useTarget(target, (element) => mark(element, kind, options), [...dependenciesOf(options), kind]);
  return null;
}

export function Arrow({
  from,
  to,
  label,
  curvature,
  ...shared
}: ArrowOptions & {
  from: RefObject<Element | null>;
  to: RefObject<Element | null>;
}): null {
  const options = { ...optionsOf(shared), label, curvature };
  useTargets([from, to], ([start, end]) => arrow(start, end, options), [
    ...dependenciesOf(optionsOf(shared)), label, curvature,
  ]);
  return null;
}
