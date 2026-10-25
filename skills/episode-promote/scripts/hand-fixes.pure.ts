// The Promotion Gate's hand-fix cards (design-ADR 0016, A fix by hand feeds back, rule 19): one card per hand fix
// of the Run, by where its `Feeds:` trailer says the lesson goes. Pure: the fixes in, the section out;
// `hand-fixes.ts` reads them from git and `harvest-report.ts` adds the section.

import { JARGON, type Card, type Section } from './harvest-report.pure.ts';

/** One `fix(...)` commit on content paths, as git holds it. */
export interface HandFix {
  hash: string;
  subject: string;
  /** The `Feeds:` value: a repo path, an issue URL, `none: <reason>`, or null when the commit names none. */
  feeds: string | null;
  /** The content files it touched. */
  files: string[];
}

const FLOW_TODAY = {
  kind: 'flow',
  nodes: [{ label: 'the Run writes it wrong', tone: 'bad' }, { label: 'you fix it by hand' }],
} as const;

/** A rule id or section sign reads `a rule` or `a section`: the report refuses them on a card's face. */
function plain(text: string): string {
  return text.replace(JARGON, (word) => (word.startsWith('§') ? 'a section' : 'a rule'));
}

/** What the commit fixed, without its type and scope: `fix(demo): the label` reads `the label`. */
function whatOf(subject: string): string {
  return plain(subject.replace(/^fix(\([^)]*\))?!?:\s*/, ''));
}

type Words = Omit<Card, 'id' | 'before' | 'evidence'>;

const RIGHT = { label: 'the Run writes it right', tone: 'good' } as const;
const GAIN = 'The next Run gets this right without a hand fix.';

/** No trailer: only a skipped commit gate lets one through. */
function unnamed(fixed: string, what: string): Words {
  return {
    title: `Name the file that should have caught the fix "${what}".`,
    weight: 'strong',
    happened: `${fixed}, and the commit says nowhere the lesson goes.`,
    change:
      'Name in the note the skill, template or guide that should have caught it; the pipeline-feedback skill lands it.',
    gain: 'No hand fix goes untaught.',
    after: { kind: 'flow', nodes: [{ label: 'a file teaches it' }, RIGHT] },
  };
}

/** `none: <reason>`: listed so the user can contest the reason. */
function oneOff(fixed: string, what: string, reason: string): Words {
  return {
    title: `Agree that the fix "${what}" teaches the pipeline nothing.`,
    weight: 'worth',
    happened: `${fixed}. The commit says no process could have caught it: ${plain(reason)}.`,
    change:
      'Keep the card to agree. Strike it to contest the reason, and name in its note the file that should have caught it.',
    gain: 'A fix that could teach the pipeline is not lost.',
    after: { kind: 'quote', text: 'a one-off: nothing to teach' },
  };
}

function issue(fixed: string, what: string, url: string): Words {
  return {
    title: `Keep the issue that holds the lesson of the fix "${what}".`,
    weight: 'strong',
    happened: `${fixed}. The commit filed the lesson as an issue.`,
    change: `The issue ${url} names the change to make; the pipeline-feedback skill lands it.`,
    gain: GAIN,
    after: { kind: 'flow', nodes: [{ label: 'the issue is fixed' }, RIGHT] },
  };
}

/** The path shows on the card's Changes line only: a file such as an ADR can carry a rule id in its name. */
function file(fixed: string, what: string, feeds: string): Words {
  return {
    title: `Put the lesson of the fix "${what}" into the file its commit names.`,
    weight: 'strong',
    changes: feeds,
    happened: `${fixed}. The commit says the lesson belongs in this file.`,
    change: 'The pipeline-feedback skill writes the lesson into the file named under the title.',
    gain: GAIN,
    after: { kind: 'flow', nodes: [{ label: 'that file teaches it' }, RIGHT] },
  };
}

/** The card's words by the form of the `Feeds:` value, the same three forms the commit gate allows. */
function wordsOf(what: string, feeds: string | null): Words {
  const fixed = `You fixed "${what}" by hand`;
  if (feeds === null) return unnamed(fixed, what);
  if (feeds.startsWith('none:')) return oneOff(fixed, what, feeds.slice('none:'.length).trim());
  if (/^https?:\/\//.test(feeds)) return issue(fixed, what, feeds);
  return file(fixed, what, feeds);
}

function card({ hash, subject, feeds, files }: HandFix, at: number): Card {
  const { after, ...words } = wordsOf(whatOf(subject), feeds);
  return {
    id: `F${at + 1}`,
    ...words,
    before: { ...FLOW_TODAY, nodes: [...FLOW_TODAY.nodes] },
    after,
    evidence: [`${hash.slice(0, 8)} ${subject}`, ...files].join(' · '),
  };
}

/** The Harvest report's hand-fix section: a card per hand fix of the Run, in commit order. */
export function handFixSection(fixes: readonly HandFix[]): Section {
  return {
    key: 'hand-fixes',
    title: 'Hand fixes',
    target: 'the file or issue each Feeds line names, through the pipeline-feedback skill',
    cards: fixes.map(card),
  };
}
