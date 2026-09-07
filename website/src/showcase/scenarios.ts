import type { AnnotationPlan } from '../../../agent/annotation-plan';

// Demo metadata only. These plans are inspectable source-editing artifacts;
// the browser mounts explicit React adapters in the fixtures, never interprets plans.
import { ink, type Perspective } from './options';
export type { Perspective } from './options';
const target = (file: string, locator: string, description: string) => ({
  strategy: 'ref' as const,
  file: `website/src/showcase/${file}.tsx`,
  locator,
  description,
});
const workspace = (locator: string, description: string) =>
  target('Workspace', locator, description);
const security = (locator: string, description: string) => target('Security', locator, description);
const release = (locator: string, description: string) => target('Release', locator, description);
const plan = (intent: string, annotations: AnnotationPlan['annotations']): AnnotationPlan => ({
  version: 1,
  framework: 'react',
  intent,
  annotations,
});
export const workspacePlans = {
  explain: plan('Explain workspace deletion without replacing the native warning.', [
    {
      id: 'danger',
      primitive: 'circle',
      targets: [workspace('remove', 'Delete workspace button')],
      options: ink.explain,
    },
  ]),
  product: plan('Make annual and monthly billing totals explicit before commitment.', [
    {
      id: 'total',
      primitive: 'highlight',
      targets: [target('TeamExamples', 'total', 'Billing total')],
      options: ink.product,
    },
  ]),
  ux: plan('Help users recover from an empty project search.', [
    {
      id: 'recovery',
      primitive: 'underline',
      targets: [target('TeamExamples', 'recovery', 'Clear search control')],
      options: ink.ux,
    },
  ]),
  handoff: plan(
    'Show the implemented confirmation entry point; open it to inspect exact-name verification.',
    [
      {
        id: 'confirmation',
        primitive: 'circle',
        targets: [workspace('remove', 'Opens inline confirmation')],
        options: ink.handoff,
      },
    ],
  ),
  qe: plan('Exercise CSV import acceptance and rejection.', [
    {
      id: 'upload',
      primitive: 'circle',
      targets: [target('TeamExamples', 'upload', 'File input')],
      options: ink.qe,
    },
  ]),
} satisfies Record<Perspective, AnnotationPlan>;
export const perspectives: {
  id: Perspective;
  label: string;
  inputLabel: string;
  input: string;
  outcome: string;
}[] = [
  {
    id: 'explain',
    label: 'Explain',
    inputLabel: 'Prompt',
    input: 'Explain this settings screen and make the destructive action understandable.',
    outcome:
      'One focal circle directs attention to the existing warning. Stet supplies no safety behavior.',
  },
  {
    id: 'product',
    label: 'Product',
    inputLabel: 'Requirement',
    input: 'Show the total due before users choose annual or monthly billing.',
    outcome: 'Toggle billing periods and check that the total due follows the selected plan.',
  },
  {
    id: 'ux',
    label: 'UX',
    inputLabel: 'Design intent',
    input: 'Give people a useful recovery action when project search returns no results.',
    outcome:
      'Edit the search and clear it to restore the project list. The annotation points to the recovery action.',
  },
  {
    id: 'handoff',
    label: 'Engineering',
    inputLabel: 'Delivery note',
    input:
      'Implemented password requirements, session revocation and a two-factor setup entry point.',
    outcome:
      'Try the account-security controls and inspect their source. These local examples make delivery concrete.',
  },
  {
    id: 'qe',
    label: 'QE',
    inputLabel: 'Acceptance result',
    input:
      'Verify that the importer accepts a CSV filename and rejects other extensions with a clear message.',
    outcome:
      'Choose a CSV file, then a different file type. The browser tests exercise both paths; this fixture checks filenames, not file contents.',
  },
];
export const securityPlan = plan(
  'Hand off three implemented account-security controls, with explicit local-demo limits.',
  [
    {
      id: 'password',
      primitive: 'highlight',
      targets: [security('requirements', 'Password requirements copy')],
      options: ink.password,
    },
    {
      id: 'session',
      primitive: 'circle',
      targets: [security('revoke', 'Revoke demo session control')],
      options: ink.session,
    },
    {
      id: 'two-factor',
      primitive: 'underline',
      targets: [security('setup', 'Two-factor setup control')],
      options: ink.twoFactor,
    },
  ],
);
export const reviewPlan = plan(
  'Reproduce an invalid release submission and show the focus failure without fixing it.',
  [
    {
      id: 'focus',
      primitive: 'circle',
      targets: [release('submit', 'Submit control retaining focus after an invalid attempt')],
      options: ink.review,
    },
  ],
);
export const reviewErrorPlan = plan(
  'Show the error after reproducing the invalid release submission.',
  [
    ...reviewPlan.annotations,
    {
      id: 'message',
      primitive: 'highlight',
      targets: [release('error', 'Conditional error after invalid submission')],
      options: ink.error,
    },
  ],
);
export const releasePlan = plan(
  'Show the three features of the release form in a restrained product demonstration.',
  [
    {
      id: 'name',
      primitive: 'underline',
      targets: [release('titleLabel', 'Release name label')],
      options: ink.title,
    },
    {
      id: 'audience',
      primitive: 'highlight',
      targets: [release('audienceLabel', 'Private preview label')],
      options: ink.audience,
    },
    {
      id: 'publish',
      primitive: 'circle',
      targets: [release('submit', 'Publish preview button')],
      options: ink.publish,
    },
  ],
);
export const fixedReviewPlan = plan('Fix invalid submit by focusing the invalid release name.', [
  {
    id: 'fixed-focus',
    primitive: 'circle',
    targets: [release('nameInput', 'Invalid field receives focus')],
    options: ink.fixed,
  },
]);
export const tutorialPlans = [
  plan('Select a source branch.', [
    {
      id: 'branch',
      primitive: 'underline',
      targets: [target('Deployment', 'branch', 'Source branch selector')],
      options: ink.branch,
    },
  ]),
  plan('Choose a deployment environment.', [
    {
      id: 'environment',
      primitive: 'highlight',
      targets: [target('Deployment', 'environment', 'Environment choices')],
      options: ink.environment,
    },
  ]),
  plan('Queue the deployment.', [
    {
      id: 'deploy',
      primitive: 'circle',
      targets: [target('Deployment', 'deploy', 'Queue deployment button')],
      options: ink.deploy,
    },
  ]),
];
export const activityPlan = plan(
  'Document filtering, event details and read state in a live inbox.',
  [
    {
      id: 'filter',
      primitive: 'underline',
      targets: [target('Activity', 'filter', 'Unread filter')],
      options: ink.filter,
    },
    {
      id: 'event',
      primitive: 'highlight',
      targets: [
        target('Activity', 'event', 'Expandable activity event; visible in current filter'),
      ],
      options: ink.event,
    },
    {
      id: 'read',
      primitive: 'circle',
      targets: [target('Activity', 'read', 'Mark all read')],
      options: ink.read,
    },
  ],
);
export const scenarios = [
  {
    id: 'workspace-deletion',
    group: 'Agentic',
    title: 'Explain a dangerous action',
    subtitle: 'Five viewpoints. Five working examples.',
    roles: 'Agent · Product · UX · Engineering · QE',
    surface: 'workspace',
    inputLabel: 'Prompt',
    input: perspectives[0].input,
    outcome: perspectives[0].outcome,
    plan: workspacePlans.explain,
  },
  {
    id: 'security-handoff',
    group: 'Agentic',
    title: 'Hand off what you built',
    subtitle: 'Delivery with evidence, not just a diff.',
    roles: 'Agent · Engineering · Human review',
    surface: 'security',
    inputLabel: 'Prompt',
    input: 'Implement account security, then annotate what changed for me.',
    outcome:
      'Inspect password requirements, session revocation and the setup step. Authentication, persistence and actual 2FA enrollment are follow-ups outside this local fixture.',
    plan: securityPlan,
  },
  {
    id: 'form-review',
    group: 'Agentic',
    title: 'Review & reproduce a bug',
    subtitle: 'Reproduce the problem. Inspect the fix.',
    roles: 'Agent · UX · QE',
    surface: 'review',
    inputLabel: 'Bug observation',
    input: 'Submit this form with no release name. Mark where validation becomes confusing.',
    outcome:
      'Compare the buggy form with the fixed version: the fix moves focus to the invalid name field. Green ink identifies the corrected behavior.',
    plan: reviewPlan,
  },
  {
    id: 'feature-showcase',
    group: 'Agentic',
    title: 'Showcase three features',
    subtitle: 'Let the working product do the talking.',
    roles: 'Agent · Engineering · Product',
    surface: 'showcase',
    inputLabel: 'Prompt',
    input: 'Annotate the three most important features of this screen for a product demo.',
    outcome:
      'Name a release, choose its audience, then publish a local preview. The annotations explain value while the application stays usable.',
    plan: releasePlan,
  },
  {
    id: 'guided-tutorial',
    group: 'Developer',
    title: 'Teach a release workflow',
    subtitle: 'Progressive emphasis, ordinary controls.',
    roles: 'Developer · Documentation · Education',
    surface: 'tutorial',
    inputLabel: 'Teaching intent',
    input: 'Teach a teammate to select a branch, choose an environment and queue a deployment.',
    outcome:
      'Advance the lesson without losing typed values. Your application owns progression; Stet adds emphasis and cleans up each step.',
    plan: tutorialPlans[0],
  },
  {
    id: 'live-documentation',
    group: 'Developer',
    title: 'Document a live interface',
    subtitle: 'An example readers can actually try.',
    roles: 'Developer · Internal tooling · Product',
    surface: 'documentation',
    inputLabel: 'Documentation brief',
    input:
      'Document the team activity inbox: filter unread events, inspect details and mark activity as read.',
    outcome:
      'Readers can explore a working activity stream while the annotations explain each control. Copy the source into your handbook.',
    plan: activityPlan,
  },
] as const;
export type Scenario = (typeof scenarios)[number];
export const allPlans = [
  ...Object.values(workspacePlans),
  securityPlan,
  reviewPlan,
  reviewErrorPlan,
  fixedReviewPlan,
  activityPlan,
  releasePlan,
  ...tutorialPlans,
];
