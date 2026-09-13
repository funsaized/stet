import capabilities from '@funsaized/stet/agent/capabilities.json';
export const REPO = 'https://github.com/funsaized/stet';
export const INSTALL = 'npm install @funsaized/stet@0.1.0';
export const AGENT_INIT = './node_modules/.bin/stet agent init --tool codex';
export const LIFETIME_QUESTION =
  'Should this explanation remain in the application, or exist only in this captured handoff?';
export const SAVE_SNIPPET = `import { circle, underline } from "@funsaized/stet";
import "@funsaized/stet/style.css";

export function explainSave(save: Element, hint: Element, ready: boolean) {
  // Still by default. Use 0.3 for optional ambient motion.
  const boil = 0;
  const handles = [
    circle(save, {
      seed: 12,
      boil,
      description: ready
        ? "Save is available."
        : "Save is disabled because the title is empty.",
    }),
    underline(hint, {
      seed: 8,
      boil,
      description: ready
        ? "The title now satisfies Save."
        : "This is why Save is disabled.",
    }),
  ];
  return () => handles.forEach((handle) => handle.destroy());
}
`;
export const AGENT_PROMPT = `Explain why Save is disabled using the installed @funsaized/stet@0.1.0 API. Attach circle to the Save control and underline to the reason text. Import @funsaized/stet/style.css. Destroy the handles on cleanup. Keep marks still with boil: 0, or use boil: 0.3 only if I ask for optional motion. ${LIFETIME_QUESTION} If it should remain, write it in source. If it is only a captured artifact, stop and report that the advertised 0.1.0 package does not export Playwright injection; do not invent an import. Stet does not run an agent, edit automatically, apply plans, or perform QA. I will inspect the live result; existing tests check the app.`;
export type Kind = keyof typeof capabilities.primitives;
export const kinds = Object.keys(capabilities.primitives) as Kind[];
export const descriptions: Record<Kind, [string, string]> = {
  circle: [
    'Make the good stuff impossible to miss.',
    'A slightly imperfect loop around anything worth a second look.',
  ],
  underline: [
    'Give your words a little emphasis.',
    'A hand-drawn stroke that follows the text, even when it wraps.',
  ],
  highlight: [
    'A bright idea deserves a bright mark.',
    'A translucent sweep of color. Your words still do the talking.',
  ],
  arrow: [
    'Point people in a good direction.',
    'Connect two real elements with a curved arrow and an optional label.',
  ],
  sticky: [
    'Leave a thought in the margin.',
    'A little paper note for context, encouragement, or a friendly nudge.',
  ],
  mark: ['A small mark. A clear message.', 'Give feedback with a handwritten check or cross.'],
};
