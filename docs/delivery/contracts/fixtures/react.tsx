import { useCallback, useRef } from "react";
import type { StetHandle } from "../../../../src/index.js";
import { ReactCircle as Circle } from "./adapter-types.js";

export function Example({ isVisible }: { isVisible: boolean }) {
  const target = useRef<HTMLButtonElement>(null);
  const handle = useRef<StetHandle | null>(null);
  const onHandle = useCallback((next: StetHandle | null) => {
    handle.current = next;
  }, []);
  return (
    <>
      <button ref={target}>Save</button>
      <Circle target={target} visible={isVisible} onHandle={onHandle} />
    </>
  );
}
