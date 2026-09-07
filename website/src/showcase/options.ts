// Shared visual options for the live fixtures and inspectable plans.
export const ink = {
  fixed: {
    seed: 63,
    description: 'Fixed: invalid submission focuses the release name.',
    stroke: '#278044',
  },
  branch: { seed: 81, description: 'Select the branch to deploy.', stroke: '#416ba0' },
  environment: {
    seed: 82,
    description: 'Choose a staging environment before production.',
    fill: '#e3b937',
  },
  deploy: { seed: 83, description: 'Queue a local deployment preview.', stroke: '#426650' },
  filter: {
    seed: 91,
    description: 'Filter the activity stream to unread events.',
    stroke: '#416ba0',
  },
  event: { seed: 92, description: 'Open an event to inspect its details.', fill: '#e3b937' },
  read: { seed: 93, description: 'Mark all activity as read.', stroke: '#426650' },
  explain: {
    seed: 41,
    description: 'Read the irreversible consequences before deleting.',
    stroke: '#b33e2b',
  },
  product: {
    seed: 42,
    description: 'Acceptance intent: annual billing clearly shows the total due.',
    fill: '#e3b937',
  },
  ux: {
    seed: 43,
    description: 'Explain an empty search and offer a way to recover.',
    stroke: '#416ba0',
  },
  handoff: {
    seed: 44,
    description: 'Implemented: confirmation requires the exact workspace name.',
    stroke: '#426650',
  },
  qe: {
    seed: 45,
    description: 'Verify that only CSV files can be imported.',
    stroke: '#426650',
  },
  password: {
    seed: 51,
    description: 'Implemented: minimum twelve characters, displayed before submit.',
    fill: '#e3b937',
  },
  session: { seed: 52, description: 'Implemented: revoke this demo session.', stroke: '#426650' },
  twoFactor: {
    seed: 53,
    description: 'Implemented: reveal a local two-factor setup step. No server enrollment.',
    stroke: '#416ba0',
  },
  review: {
    seed: 61,
    description: 'Reproduced defect: invalid submit leaves focus on the submit button.',
    stroke: '#b33e2b',
  },
  error: {
    seed: 62,
    description: 'The error appears, but the invalid field does not receive focus.',
    fill: '#e3b937',
  },
  title: {
    seed: 71,
    description: 'Name the release so your team can recognize it.',
    stroke: '#416ba0',
  },
  audience: {
    seed: 72,
    description: 'Choose a private preview before a public launch.',
    fill: '#e3b937',
  },
  publish: {
    seed: 73,
    description: 'Publish updates the local preview status.',
    stroke: '#b33e2b',
  },
} as const;
export type Perspective = 'explain' | 'product' | 'ux' | 'handoff' | 'qe';
