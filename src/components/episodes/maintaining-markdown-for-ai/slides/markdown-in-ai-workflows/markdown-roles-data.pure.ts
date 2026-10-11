export type RoleKey = 'knowledge' | 'instruction' | 'memory';
export type ModalKey = 'frontmatter' | 'syntax' | RoleKey;

export interface RoleDetail {
  readonly key: RoleKey;
  readonly title: string;
  readonly badge: string;
  readonly badgeClass: string;
  readonly badgeColor: string;
  readonly source: string;
  readonly sourceUrl: string;
  readonly costNote: string;
  readonly filename: string;
  readonly frontmatter: string;
  readonly hasFrontmatter: boolean;
  readonly bodyTitle: string;
  readonly bodyDesc: string;
  readonly items: readonly {
    readonly id: string;
    readonly label: string;
    readonly badge?: string;
    readonly checked?: boolean;
  }[];
  readonly quote: string;
  readonly quoteBorder: string;
}

export const ROLES_DATA: Record<RoleKey, RoleDetail> = {
  knowledge: {
    key: 'knowledge',
    title: 'Knowledge',
    badge: 'Retrieved on demand',
    badgeClass: 'border-accent/40 bg-accent/10 text-accent',
    badgeColor: 'accent',
    source: 'onboarding.md · wiki · docs',
    sourceUrl: 'https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f',
    costNote: 'Pay only when fetched',
    filename: 'docs/handbook/onboarding.md',
    hasFrontmatter: true,
    frontmatter: `---
type: Handbook
stale_after: 2026-07-01
owner: "@people-ops"
---`,
    bodyTitle: 'Employee onboarding',
    bodyDesc:
      'Handbook for first-week setup. Dynamic context: the agent pays token costs only when a question reaches for it.',
    items: [
      { id: 'k1', label: '1. Collect laptop from IT on day one', checked: true },
      { id: 'k2', label: '2. Complete security training module', checked: false },
      { id: 'k3', label: '3. Meet your onboarding buddy', checked: false },
    ],
    quote: 'Retrieved on demand. Stale pages answer just as fluently as fresh ones.',
    quoteBorder: 'border-accent/50',
  },
  instruction: {
    key: 'instruction',
    title: 'Instructions',
    badge: 'User or model invoked',
    badgeClass: 'border-secondary/40 bg-secondary/10 text-secondary',
    badgeColor: 'secondary',
    source: 'commit · skills · commands',
    sourceUrl: 'https://github.com/hancrafted/skills/blob/main/skills/commit/SKILL.md',
    costNote: 'Progressive disclosure',
    filename: '.claude/skills/commit/SKILL.md',
    hasFrontmatter: true,
    frontmatter: `---
name: commit
description: Author a commit message and commit it — Conventional
  Commits header, Keep a Changelog body, Source trailer. Use before every
  git commit.
---`,
    bodyTitle: 'Commit skill',
    bodyDesc:
      'Only the description is loaded at startup. The steps below arrive when a task matches — progressive disclosure.',
    items: [
      { id: 'i1', badge: '2', label: 'Read the change — a non-empty index is expressed intent' },
      { id: 'i2', badge: '4', label: 'Author the message; done when the gate exits 0' },
      { id: 'i3', badge: '7', label: 'Report and stop — pushing is the human’s act' },
    ],
    quote: 'Run step by step on your repo. A wrong instruction executes without being reread.',
    quoteBorder: 'border-secondary/50',
  },
  memory: {
    key: 'memory',
    title: 'Memory',
    badge: 'Always loaded',
    badgeClass: 'border-primary/40 bg-primary/10 text-primary',
    badgeColor: 'primary',
    source: 'AGENTS.md · CLAUDE.md',
    sourceUrl: 'https://agents.md/',
    costNote: 'Paid on every turn',
    filename: 'AGENTS.md',
    hasFrontmatter: false,
    frontmatter: `No front matter header: pure Markdown loaded unconditionally at session start so entire contents stream straight into prompt window.`,
    bodyTitle: 'AGENTS.md',
    bodyDesc:
      'Project overview & ground rules for AI pair programmers. Static context: every token is present in every interaction.',
    items: [
      { id: 'm1', badge: '›', label: 'Commands: npm run build · npm run verify' },
      { id: 'm2', badge: '›', label: 'Ground rule: Tailwind v4 — no inline styles' },
      { id: 'm3', badge: '›', label: 'Ground rule: One commit addresses exactly one scope' },
    ],
    quote: 'Always loaded, every interaction. Length is a budget, not a virtue.',
    quoteBorder: 'border-primary/50',
  },
};

export interface ModalContent {
  readonly key: ModalKey;
  readonly eyebrow: string;
  readonly title: string;
  readonly lede: string;
  readonly filename?: string;
  readonly sourceExcerpt?: string;
  readonly linkUrl?: string;
  readonly linkText?: string;
  readonly reads?: string;
  readonly costs?: string;
  readonly breaks?: string;
  readonly credibility?: string;
}

export const MODALS_DATA: Record<ModalKey, ModalContent> = {
  frontmatter: {
    key: 'frontmatter',
    eyebrow: 'markdown.md · Front matter',
    title: 'Structured metadata above unstructured text',
    lede: 'A YAML header between triple-dash fences (---). It provides typed, deterministic attributes so agents and linters inspect what a file is before parsing its prose.',
    filename: 'markdown.md',
    sourceExcerpt: `---
type: Playbook
stale_after: 2026-07-01
owner: "@engineering/sre"
verified_by: "human:han"
---

# Incident Response Runbook
1. Triage telemetry payload.`,
    linkUrl: 'https://archgate.dev/',
    linkText: 'Learn about Open Knowledge Format ↗',
  },
  syntax: {
    key: 'syntax',
    eyebrow: 'markdown.md · Body syntax',
    title: 'Eight bits of syntax, and that is the whole format',
    lede: 'No runtime, no schema, no database. A handful of characters that a person can read unaided and a parser agrees on — which is exactly why both humans and machines can use the same file.',
    linkUrl: 'https://github.com/adam-p/markdown-here/wiki/markdown-cheatsheet',
    linkText: 'Adam Pritchard’s Cheatsheet on GitHub ↗',
  },
  knowledge: {
    key: 'knowledge',
    eyebrow: 'Knowledge',
    title: 'Dynamic context, fetched only when a question reaches for it',
    lede: 'What the organisation knows and would otherwise have to re-learn: playbooks, decisions, runbooks, post-mortems. Most of it is never opened in any given session.',
    reads:
      'On demand. It is indexed or searched, and the pages that match the question get pulled in — three files out of four hundred.',
    costs:
      'Almost nothing to store and very little to carry, because only matched pages enter the window. The cost is not tokens; it is upkeep.',
    breaks:
      'It is retrieved without being re-verified. A playbook that expired two quarters ago answers just as fluently as a fresh one.',
    credibility: 'LLM-wiki — Karpathy, April 2026, 5,000+ stars. The canonical reference for the term.',
    linkUrl: 'https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f',
    linkText: 'Karpathy’s LLM-wiki gist on GitHub ↗',
    filename: 'docs/handbook/onboarding.md',
    sourceExcerpt: `---
type: Handbook
stale_after: 2026-07-01
owner: "@people-ops"
---

# Employee onboarding
1. Collect laptop from IT on day one.`,
  },
  instruction: {
    key: 'instruction',
    eyebrow: 'Instructions',
    title: 'A procedure, written to be executed rather than read',
    lede: 'The repeatable jobs: how a review is run, how a release note is drafted, how a page gets checked. Prose describes; an instruction is followed step by step.',
    reads: 'When its trigger matches. At startup the agent sees only the front matter; the steps arrive on the match.',
    costs:
      'Only loaded when invoked, so it is cheap to keep dozens. The real cost is that a vague trigger gets it loaded for the wrong task.',
    breaks: 'The steps drift from reality. A wrong step in an instruction gets run on your repo without being reread.',
    credibility:
      'Agent Skills standard — Osmani, Saboo & Kartakis, The New SDLC with Vibe Coding (Google, May 2026), fig. 4.',
    linkUrl: 'https://github.com/hancrafted/skills/blob/main/skills/commit/SKILL.md',
    linkText: 'Read the commit skill on GitHub ↗',
    filename: '.claude/skills/commit/SKILL.md',
    sourceExcerpt: `---
name: commit
description: Author a commit message and commit it.
---
2. Read the change.
4. Author the message.
7. Report and stop.`,
  },
  memory: {
    key: 'memory',
    eyebrow: 'Memory',
    title: 'Static context — what the project is, carried into every turn',
    lede: 'Long-term persistent state: how you build, what you never do, who to ask. It is the agent’s memory of the project, read whether or not the task needs it.',
    reads: 'At the start of every session, in full, before your first sentence. It arrives already read.',
    costs:
      'It occupies the context window for the entire session. Every line you add is a line paid for on every single turn.',
    breaks:
      'A rule changes and the file does not. Because it is loaded unconditionally, a stale line here is applied with total confidence.',
    credibility:
      'AGENTS.md — used by 60k+ open-source projects; stewarded by Linux Foundation / Agentic AI Foundation.',
    linkUrl: 'https://agents.md/',
    linkText: 'Visit agents.md ↗',
    filename: 'AGENTS.md',
    sourceExcerpt: `# AGENTS.md
## Commands
- npm run build
- npm run verify
## Ground rules
1. Run verify before every commit.`,
  },
};
