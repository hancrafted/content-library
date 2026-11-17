import { z } from 'zod';

// decision: docs/adr/0016-content-data-model.md
export const VISIBILITIES = ['public', 'unlisted'] as const;

export const FORMATS = ['foundations', 'teardown', 'short'] as const;
export type FormatId = (typeof FORMATS)[number];

export const TAG_IDS = [
  'context-engineering',
  'agentic-ai',
  'markdown',
  'cost',
  'sales',
  'agentic-workflow',
  'overview',
] as const;
export type TagId = (typeof TAG_IDS)[number];

// decision: docs/adr/0019-resources-overview.md
// decision: docs/adr/0026-themes-are-authoring-templates.md
export const TEMPLATE_TYPES = ['episode-template', 'master-slide', 'theme'] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const YOUTUBE_ID = /^[\w-]{11}$/;

export const EVENT_FORMATS = ['onsite', 'remote', 'hybrid'] as const;
export type EventFormat = (typeof EVENT_FORMATS)[number];

export const PLATFORMS = ['zoom', 'teams', 'google-meet'] as const;

export const EVENT_KINDS = ['workshop', 'webinar'] as const;

export const AUDIENCES = ['individual', 'organization'] as const;

export const ORGANIZER_IDS = ['hancrafted', 'axel', 'cyberforum'] as const;
export type OrganizerId = (typeof ORGANIZER_IDS)[number];

export interface Organizer {
  readonly name: string;
  readonly url?: string;
}

export const ORGANIZERS: Readonly<Record<OrganizerId, Organizer>> = {
  hancrafted: { name: 'hancrafted', url: 'https://hancrafted.net' },
  axel: { name: 'AXEL', url: 'https://axel.energy/' },
  cyberforum: {
    name: 'CyberForum Akademie',
    url: 'https://www.cyberforum.de/akademie/kuenstliche-intelligenz-karl',
  },
};

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDay(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export const slug = z.string().regex(KEBAB, 'must be kebab-case');

export const isoDate = z
  .string()
  .regex(ISO_DAY, 'must be written YYYY-MM-DD')
  .refine(isCalendarDay, 'is not a real calendar day');

export type IsoDate = z.infer<typeof isoDate>;

export const visibility = z.enum(VISIBILITIES, {
  error: (issue) => {
    if (issue.input === undefined) return 'is required, public or unlisted';
    if (issue.input === 'attendees') return 'is "attendees", which is refused until horizon 3 gives it an enforcer';
    return `is "${String(issue.input)}", but must be public or unlisted`;
  },
});

export function closed<const T extends readonly [string, ...string[]]>(values: T) {
  const list = values.join(', ');
  return z.enum(values, {
    error: (issue) =>
      issue.input === undefined
        ? `is required, one of ${list}`
        : `is "${String(issue.input)}", but must be one of ${list}`,
  });
}

const tag = closed(TAG_IDS);

export const tags = z.tuple([tag], tag, { error: 'is required, one Tag or more, the first its lead Tag' }).readonly();
