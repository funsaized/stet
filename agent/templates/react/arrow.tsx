"use client";
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { useRef } from "react";
import { Arrow } from "@funsaized/stet/react";
import "@funsaized/stet/style.css";

export function AnnotatedAction({ enabled = true }: { enabled?: boolean }) {
  const target = useRef<HTMLButtonElement>(null);
  const destination = useRef<HTMLParagraphElement>(null);
  return <>
    <button ref={target} type="button">Review action</button>
    <p ref={destination}>Consequences of this action</p>
    {enabled && <Arrow from={target} to={destination} seed={42} label={"Review this action."} />}
  </>;
}
