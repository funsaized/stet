"use client";

import { useEffect, type RefObject } from "react";
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
  useEffect(() => {
    if (!target.current) return;
    const handle = attach(target.current);
    return () => handle.destroy();
  }, [target, ...dependencies]);
}

function optionsOf(props: StetOptions): StetOptions {
  const { seed, roughness, boil, stroke, fill, width, resketchOnHover, padding } = props;
  return { seed, roughness, boil, stroke, fill, width, resketchOnHover, padding };
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
  ...shared
}: ArrowOptions & {
  from: RefObject<Element | null>;
  to: RefObject<Element | null>;
}): null {
  const options = { ...optionsOf(shared), label };
  useEffect(() => {
    if (!from.current || !to.current) return;
    const handle = arrow(from.current, to.current, options);
    return () => handle.destroy();
  }, [from, to, ...dependenciesOf(optionsOf(shared)), label]);
  return null;
}
