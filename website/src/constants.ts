import capabilities from '@funsaized/stet/agent/capabilities.json';
export const REPO = 'https://github.com/funsaized/stet';
export const INSTALL = 'npm install @funsaized/stet@0.1.0';
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
