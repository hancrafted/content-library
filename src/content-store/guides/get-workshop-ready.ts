import type { GuideInput } from '../schemas/guide.schema';

// Needs human: the Brief names no Tag. `agentic-ai` is the closest existing one (the Guide sets up an AI agent); the
// lead Tag is Han's call.
export const guide = {
  slug: 'get-workshop-ready',
  tags: ['agentic-ai'],
  visibility: 'public',
} as const satisfies GuideInput;
