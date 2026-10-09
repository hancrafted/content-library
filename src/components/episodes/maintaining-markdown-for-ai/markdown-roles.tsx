import { cn } from '@/lib/utils';

interface RoleCardData {
  key: string;
  title: string;
  badge: string;
  badgeColor: string;
  source: string;
  description: string;
}

const ROLES: RoleCardData[] = [
  {
    key: 'knowledge',
    title: 'Knowledge',
    badge: 'Retrieved on demand',
    badgeColor: 'border-accent/40 bg-accent/10 text-accent',
    source: 'onboarding.md · wiki · docs ↗',
    description: 'Dynamic context: the agent pays token costs only when a question reaches for it.',
  },
  {
    key: 'instructions',
    title: 'Instructions',
    badge: 'User or model invoked',
    badgeColor: 'border-secondary/40 bg-secondary/10 text-secondary',
    source: 'commit · skills · commands ↗',
    description: 'Progressive disclosure: guidelines and workflows loaded when triggered.',
  },
  {
    key: 'memory',
    title: 'Memory',
    badge: 'Always loaded',
    badgeColor: 'border-primary/40 bg-primary/10 text-primary',
    source: 'AGENTS.md · CLAUDE.md ↗',
    description: 'Static context: re-sent with every message in the session history.',
  },
];

function FrontmatterBlock() {
  return (
    <div className="mt-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frontmatter</p>
      <pre className="mt-2 rounded-lg bg-muted/50 p-3 font-mono text-xs leading-relaxed text-foreground/90">
        <code>{`---
type: Handbook
stale_after: 2026-07-01
owner: "@people-ops"
---`}</code>
      </pre>
    </div>
  );
}

function FilePreviewCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-7">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <span className="font-mono text-xs text-muted-foreground">docs/handbook/onboarding.md</span>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent">
          Retrieved on demand
        </span>
      </div>
      <FrontmatterBlock />
      <div className="mt-4 flex-1">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Purpose</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Dynamic context: the agent pays token costs only when a question reaches for it.
        </p>
      </div>
      <blockquote className="mt-4 border-l-2 border-primary/40 pl-3 font-mono text-xs italic text-muted-foreground">
        Retrieved on demand. Stale pages answer just as fluently as fresh ones.
      </blockquote>
    </div>
  );
}

function RoleCards({ knowledgeId }: { knowledgeId?: string }) {
  return (
    <div className="flex flex-col justify-between gap-4 lg:col-span-5">
      {ROLES.map((item) => (
        <div
          key={item.key}
          id={item.key === 'knowledge' ? knowledgeId : undefined}
          className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-foreground">{item.title}</span>
            <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[10px]', item.badgeColor)}>
              {item.badge}
            </span>
          </div>
          <p className="mt-2 text-xs font-mono text-muted-foreground">{item.source}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export function MarkdownRoles({ knowledgeId }: { knowledgeId?: string }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <FilePreviewCard />
      <RoleCards knowledgeId={knowledgeId} />
    </div>
  );
}
