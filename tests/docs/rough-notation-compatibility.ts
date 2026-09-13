import { box, mark, type StetAnimationResult } from "@funsaized/stet";
import "@funsaized/stet/style.css";

declare const target: Element;

const annotation = box(target, {
  visible: false,
  animate: true,
  animationDuration: 600,
});
const result: Promise<StetAnimationResult> = annotation.show();
annotation.hide();
annotation.destroy();

const crossedOff = mark(target, "wrong");
crossedOff.destroy();

void result;
