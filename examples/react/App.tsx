import { useRef } from "react";
import { Arrow, Circle, Mark, Sticky } from "stet/react";
import "stet/style.css";

export function App() {
  const heading = useRef<HTMLHeadingElement>(null);
  const email = useRef<HTMLInputElement>(null);
  return (
    <>
      <h1 ref={heading}>Create an account</h1>
      <input ref={email} type="email" aria-label="Email" />
      <Circle target={email} />
      <Arrow from={heading} to={email} label="start here" />
      <Sticky target={email} text="required" side="right" />
      <Mark target={email} kind="right" />
    </>
  );
}
