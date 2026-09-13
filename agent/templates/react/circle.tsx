"use client";
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { useCallback, useRef } from "react";
import { Circle } from "@funsaized/stet/react";
import type { StetHandle } from "@funsaized/stet";
import "@funsaized/stet/style.css";

export function AnnotatedAction({ enabled = true }: { enabled?: boolean }) {
  const target = useRef<HTMLButtonElement>(null);
  const handle = useRef<StetHandle | null>(null);
  const onHandle = useCallback((next: StetHandle | null) => { handle.current = next; }, []);
  return <>
    <button ref={target} type="button">Review action</button>
    {enabled && <Circle target={target} seed={42} description={"Review this action before continuing."} onHandle={onHandle} />}
  </>;
}
