import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { CalendarClock, FolderOpen, LayoutGrid, Mic, NotebookPen, Plus, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

const LEFT = ['projects', 'meetings', 'artifacts', 'scheduled'] as const;
const RIGHT = ['instructions', 'memory', 'context'] as const;
type Feature = (typeof LEFT)[number] | (typeof RIGHT)[number];
const NUMBER: Record<Feature, number> = {
  projects: 1,
  meetings: 2,
  artifacts: 3,
  scheduled: 4,
  instructions: 5,
  memory: 6,
  context: 7,
};
const ROWS = ['proposal', 'report', 'pricing', 'case'] as const;
const FILES = ['prices', 'tone', 'cases', 'offer'] as const;

function Callout({ n, large = false }: { n: number; large?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex flex-none items-center justify-center rounded-full bg-brand-accent font-semibold text-background ring-4 ring-brand-accent/25 ${large ? 'size-9 text-body' : 'size-6 text-caption'}`}
    >
      {n}
    </span>
  );
}

function NavItem({ icon, n, children }: { icon: ReactNode; n?: number; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-1.5 py-1 whitespace-nowrap">
      {n !== undefined && <Callout n={n} />}
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </div>
  );
}

const ICON = 'size-4';

export const enablementClaudeDesktop = slide({
  slug: 'enablement-claude-desktop',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'app' }],
  content: ({ t, target }) => {
    const legend = (features: readonly Feature[], side: 'left' | 'right') => (
      <ol className="grid content-center gap-6">
        {features.map((feature) => (
          <li
            key={feature}
            className={`flex items-start gap-3 ${side === 'left' ? 'lg:flex-row-reverse lg:text-right' : ''}`}
          >
            <Callout n={NUMBER[feature]} large />
            <div>
              <p className="text-body font-semibold">{t(`features.${feature}.name`)}</p>
              <p className="text-caption text-muted-foreground">{t(`features.${feature}.body`)}</p>
            </div>
          </li>
        ))}
      </ol>
    );
    return (
      <SlideFrame className="justify-center">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_3fr_1fr]">
          {legend(LEFT, 'left')}
          <figure
            {...target('app')}
            role="img"
            aria-label={t('app.label')}
            className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-caption shadow-lg"
          >
            <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2" aria-hidden="true">
              <i className="size-2.5 rounded-full bg-muted-foreground/45" />
              <i className="size-2.5 rounded-full bg-muted-foreground/45" />
              <i className="size-2.5 rounded-full bg-muted-foreground/45" />
              <span className="ml-3 font-semibold text-muted-foreground">{t('app.window')}</span>
            </div>
            <div className="grid flex-1 grid-cols-[27%_1fr_29%]" aria-hidden="true">
              <div className="flex min-w-0 flex-col gap-0.5 bg-muted p-2">
                <NavItem icon={<Plus className={ICON} />}>{t('app.new')}</NavItem>
                <NavItem icon={<Search className={ICON} />}>{t('app.search')}</NavItem>
                <NavItem icon={<FolderOpen className={ICON} />} n={1}>
                  {t('features.projects.name')}
                </NavItem>
                <NavItem icon={<NotebookPen className={ICON} />} n={2}>
                  {t('features.meetings.name')}
                  <span className="rounded-full bg-card px-1.5 text-muted-foreground">{t('app.beta')}</span>
                </NavItem>
                <NavItem icon={<LayoutGrid className={ICON} />} n={3}>
                  {t('features.artifacts.name')}
                </NavItem>
                <NavItem icon={<CalendarClock className={ICON} />} n={4}>
                  {t('features.scheduled.name')}
                </NavItem>
                <p className="mt-3 px-1.5 font-semibold text-muted-foreground">{t('app.pinned')}</p>
                <p className="truncate rounded-md bg-card px-1.5 py-1 font-semibold">{t('app.project')}</p>
                {ROWS.slice(0, 3).map((row) => (
                  <p key={row} className="truncate pl-4 text-muted-foreground">
                    {t(`app.rows.${row}.name`)}
                  </p>
                ))}
              </div>
              <div className="flex min-w-0 flex-col gap-2 p-4">
                <p className="font-serif text-body">{t('app.project')}</p>
                <p className="text-muted-foreground">{t('app.by')}</p>
                <div className="flex flex-col gap-2 rounded-lg border border-border p-2.5 text-muted-foreground">
                  <span>{t('app.prompt')}</span>
                  <span className="flex items-center gap-2">
                    <Plus className={ICON} />
                    <span className="flex gap-2 rounded bg-muted px-1.5">
                      <span className="text-foreground">{t('app.chat')}</span>
                      {t('app.cowork')}
                    </span>
                    <Mic className={`${ICON} ml-auto`} />
                  </span>
                </div>
                <div className="mt-2 flex gap-3">
                  <span className="rounded bg-muted px-1.5">{t('app.chats')}</span>
                  <span className="text-muted-foreground">{t('app.activity')}</span>
                </div>
                {ROWS.map((row) => (
                  <div key={row} className="flex justify-between gap-3 border-b border-border py-1 whitespace-nowrap">
                    <span className="truncate">{t(`app.rows.${row}.name`)}</span>
                    <span className="text-muted-foreground">{t(`app.rows.${row}.when`)}</span>
                  </div>
                ))}
              </div>
              <div className="flex min-w-0 flex-col gap-2 border-l border-border p-3">
                <div className="rounded-lg border border-border p-2">
                  <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                    <Callout n={5} />
                    {t('features.instructions.name')}
                  </p>
                  <p className="mt-1 text-muted-foreground">{t('app.instructionsText')}</p>
                </div>
                <div className="rounded-lg border border-border p-2">
                  <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                    <Callout n={6} />
                    {t('features.memory.name')}
                    <span className="ml-auto rounded-full border border-border px-1.5 font-normal whitespace-nowrap text-muted-foreground">
                      {t('app.onlyYou')}
                    </span>
                  </p>
                  <p className="mt-1 text-muted-foreground">{t('app.memoryText')}</p>
                </div>
                <div className="rounded-lg border border-border p-2">
                  <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                    <Callout n={7} />
                    {t('features.context.name')}
                  </p>
                  <div className="mt-1.5 h-1 rounded-full bg-muted">
                    <i className="block h-full w-[8%] rounded-full bg-(--info)" />
                  </div>
                  <p className="mt-1 text-muted-foreground">{t('app.capacity')}</p>
                  <div className="mt-1.5 grid gap-1">
                    {FILES.map((file) => (
                      <span key={file} className="truncate rounded border border-border px-1.5 py-0.5">
                        {t(`app.files.${file}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </figure>
          {legend(RIGHT, 'right')}
        </div>
      </SlideFrame>
    );
  },
});
