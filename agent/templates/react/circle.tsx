"use client";
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { useRef } from "react";
import { Circle } from "@funsaized/stet/react";
import "@funsaized/stet/style.css";

export function AnnotatedAction({ enabled = true }: { enabled?: boolean }) {
  const target = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={target} type="button">Review action</button>
    {enabled && <Circle target={target} seed={42} description={"Review this action before continuing."} />}
  </>;
}
