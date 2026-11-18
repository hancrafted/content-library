import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { externalHref } from '@/shared/lib/external-link.pure';
import { ArrowRight, Play } from 'lucide-react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { TOOLS } from './tools.pure';

type Tone = 'agent' | 'context' | 'local' | 'remote';
const NODES = {
  agent: { tone: 'agent', items: ['you'] },
  context: { tone: 'context', items: ['agents', 'skills', 'adrs', 'drive'] },
  quick: { tone: 'local', items: ['lint', 'tests'] },
  commit: { tone: 'local', items: ['archgate', 'message'] },
  push: { tone: 'local', items: ['slow', 'build'] },
  ci: { tone: 'remote', items: ['checks', 'build'] },
  nightly: { tone: 'remote', items: ['slow'] },
  live: { tone: 'remote', items: ['site', 'build'] },
} as const satisfies Record<string, { tone: Tone; items: readonly string[] }>;
type NodeKey = keyof typeof NODES;

const COLUMNS: readonly (readonly NodeKey[])[] = [
  ['agent'],
  ['context'],
  ['quick', 'commit', 'push'],
  ['ci', 'nightly'],
  ['live'],
];

const EDGE: Record<Tone, string> = {
  agent: 'border-l-border',
  context: 'border-l-foreground',
  local: 'border-l-(--info)',
  remote: 'border-l-brand-accent',
};
const LABEL: Record<Tone, string> = {
  agent: 'text-muted-foreground',
  context: 'text-muted-foreground',
  local: 'text-(--info)',
  remote: 'text-brand-accent',
};

function GitHubMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export const aeHarness = slide({
  slug: 'ae-harness',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'flow' }],
  content: ({ t, target }) => {
    const node = (key: NodeKey) => {
      const { tone, items } = NODES[key];
      return (
        <div
          key={key}
          data-harness-node={key}
          className={`flex flex-col gap-1 rounded-lg border border-l-4 border-border bg-card px-3 py-2.5 ${EDGE[tone]}`}
        >
          <span className={`text-caption font-semibold tracking-widest uppercase ${LABEL[tone]}`}>
            {t(`nodes.${key}.label` as Parameters<typeof t>[0])}
          </span>
          <p className="text-body font-semibold">{t(`nodes.${key}.head` as Parameters<typeof t>[0])}</p>
          <ul className="grid gap-0.5 text-caption text-muted-foreground">
            {items.map((item) => (
              <li key={item}>{t(`nodes.${key}.items.${item}` as Parameters<typeof t>[0])}</li>
            ))}
          </ul>
        </div>
      );
    };
    return (
      <SlideFrame className="justify-center gap-6">
        <ol
          {...target('flow')}
          aria-label={t('flowLabel')}
          className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1fr)_auto_minmax(0,1.1fr)_auto_minmax(0,1.1fr)_auto_minmax(0,1.15fr)]"
        >
          {COLUMNS.map((column, index) => (
            <li key={column.join()} className="contents">
              {index > 0 && (
                <ArrowRight aria-hidden="true" className="mx-auto size-6 rotate-90 text-muted-foreground lg:rotate-0" />
              )}
              <div className="grid gap-2">
                {column.map(node)}
                {column.includes('live') && (
                  <a
                    href="https://hancrafted.net/dashboard/"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-live-demo=""
                    className="flex items-center gap-2.5 rounded-xl border-2 border-brand-accent bg-brand-accent/10 py-2.5 pr-4 pl-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                  >
                    <span className="inline-flex size-9 flex-none items-center justify-center rounded-lg bg-brand-accent text-background">
                      <Play aria-hidden="true" className="size-5" />
                    </span>
                    <span className="grid min-w-0">
                      <span className="text-caption font-semibold tracking-widest text-brand-accent uppercase">
                        {t('demo.label')}
                      </span>
                      <span className="text-body font-semibold">{t('demo.name')}</span>
                      <span className="text-caption text-muted-foreground">{t('demo.body')}</span>
                      <span className="sr-only"> ({t('demo.newTabHint')})</span>
                    </span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div>
          <p className="mb-2 text-caption font-semibold tracking-widest text-muted-foreground uppercase">
            {t('toolsLabel')}
          </p>
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            {TOOLS.map(({ key, url }) => (
              <li key={key} className="flex">
                <a
                  href={externalHref(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-tool-card={key}
                  className="group relative flex flex-1 flex-col gap-0.5 rounded-lg border border-border bg-card px-3 py-2 pr-8 hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent motion-safe:transition-colors"
                >
                  <span className="text-body font-semibold">{t(`tools.${key}.name` as Parameters<typeof t>[0])}</span>
                  <span className="text-caption text-muted-foreground">
                    {t(`tools.${key}.body` as Parameters<typeof t>[0])}
                  </span>
                  <span className="sr-only"> ({t('githubHint')})</span>
                  <GitHubMark className="absolute top-2.5 right-2.5 size-4 text-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:-translate-y-1 motion-safe:transition motion-safe:duration-200 motion-safe:group-hover:translate-y-0 motion-safe:group-focus-visible:translate-y-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </SlideFrame>
    );
  },
});
