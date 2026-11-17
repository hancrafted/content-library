import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import {
  SkillScopeMatrix,
  type Care,
  type SquareId,
} from '@/episodes/components/slide-shared/skill-scope-matrix/skill-scope-matrix';
import type { PictureKind } from '@/episodes/components/slide-shared/skill-scope-matrix/square-picture';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { CardArt, PlanLead } from './card-art';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './slide.module.css';

const CLAUDE_SKILLS = { slug: 'claude-code-skills', url: 'https://code.claude.com/docs/en/skills' };
const CODEX_SKILLS = { slug: 'codex-build-skills', url: 'https://learn.chatgpt.com/docs/build-skills' };
const SKILLDEX = { slug: 'skilldex', url: 'https://arxiv.org/abs/2604.16911' };
const ZONED_GOVERNANCE = {
  slug: 'microsoft-zoned-governance',
  url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase2',
};
const SWE_SKILLS_BENCH = { slug: 'swe-skills-bench', url: 'https://arxiv.org/abs/2603.15401' };

const STORED = 'where-a-skill-is-stored';
const INFERENCE = 'the-skill-scope-matrix-is-an-inference';
const EVALS = 'evals-matter-once-a-skill-is-shared';

const CODE = {
  inline: 'SKILL.md',
  personal: '~/.claude/skills/<name>/SKILL.md',
  personalLabel: '~/.claude/skills/',
  project: '.claude/skills/',
  references: 'references/',
} as const;

const SQUARES: readonly { id: SquareId; care: Care; picture: PictureKind }[] = [
  { id: 'pp', care: 1, picture: 'notebook' },
  { id: 'pg', care: 2, picture: 'toolkit' },
  { id: 'sp', care: 3, picture: 'binder' },
  { id: 'sg', care: 4, picture: 'fleet' },
];
const FOCUS: SquareId = 'sg';

function TripLabel({ end, children }: { readonly end: 'start' | 'arrival'; readonly children: string }) {
  return (
    <p
      data-trip={end}
      className={cn(
        styles[end],
        'absolute top-2 right-2 rounded-full bg-foreground px-2 text-caption font-semibold text-background',
      )}
    >
      {children}
    </p>
  );
}

export const whoUsesItAndWhere = slide({
  slug: 'who-uses-it-and-where',
  messages: { en, de },
  presentation: atDepth(5, 'page'),
  notes: [
    { slug: STORED, target: 'shared', sources: [CLAUDE_SKILLS, CODEX_SKILLS] },
    { slug: INFERENCE, target: 'stamp', sources: [SKILLDEX, ZONED_GOVERNANCE] },
    { slug: EVALS, target: 'evals', sources: [SWE_SKILLS_BENCH] },
  ],
  segments: [{ slug: 'two-questions' }, { slug: 'four-squares' }, { slug: 'a-rule-of-thumb' }],
  content: ({ t, target, Marker }) => {
    const coding: Record<SquareId, { head: ReactNode; sub: ReactNode }> = {
      pp: {
        head: t.rich('squares.pp.coding.head', { file: CODE.inline }),
        sub: t.rich('squares.pp.coding.sub', { step: t('squares.pp.coding.step') }),
      },
      pg: { head: t.rich('squares.pg.coding.head', { path: CODE.personal }), sub: t('squares.pg.coding.sub') },
      sp: {
        head: t.rich('squares.sp.coding.head', { path: CODE.project }),
        sub: t.rich('squares.sp.coding.sub', { references: CODE.references }),
      },
      sg: {
        head: t('squares.sg.coding.head'),
        sub: (
          <>
            <span>{t('squares.sg.coding.sub')}</span>
            <Marker note={EVALS} placement="beside" />
          </>
        ),
      },
    };
    const codingLabels: Record<SquareId, string> = {
      pp: CODE.inline,
      pg: CODE.personalLabel,
      sp: CODE.project,
      sg: t('squares.sg.coding.picture'),
    };
    const extras: Partial<Record<SquareId, ReactNode>> = {
      pp: (
        <>
          <TripLabel end="start">{t('trip.personal')}</TripLabel>
          <p
            data-scribble
            className={cn(
              styles.scribble,
              styles.art,
              'absolute right-[18%] bottom-[22%] isolate -rotate-6 px-2 pt-2.5 pb-1.5 text-caption font-semibold italic',
            )}
          >
            <CardArt />
            {t('scribble')}
          </p>
        </>
      ),
      pg: (
        <>
          <PlanLead className={styles.art} />
          <p className={cn(styles.art, styles.paperInk, 'absolute top-[22%] left-[69%] text-caption font-semibold')}>
            {t('plan')}
          </p>
        </>
      ),
      sg: (
        <>
          <TripLabel end="arrival">{t('trip.shared')}</TripLabel>
          <div
            className={cn(styles.card, styles.art, 'absolute bottom-[18%] left-[30%] flex flex-col items-start gap-1')}
          >
            <span aria-hidden className="relative isolate block h-8 w-14 rotate-6">
              <CardArt ruled />
            </span>
            <p
              data-owner-tag
              className={cn(
                styles.ownerTag,
                'flex rotate-[4deg] items-center gap-1 rounded-full bg-primary px-2 text-caption font-semibold text-primary-foreground shadow-md',
              )}
            >
              <span aria-hidden className="size-1.5 rounded-full bg-primary-foreground" />
              {t('ownerTag')}
            </p>
          </div>
        </>
      ),
    };
    const squares = SQUARES.map(({ id, care, picture }) => ({
      id,
      care,
      picture,
      careLabel: t('careLevel', { level: care }),
      head:
        id === FOCUS ? (
          <>
            <span>{t(`squares.${id}.head`)}</span>
            <Marker note={EVALS} placement="beside" />
          </>
        ) : (
          t(`squares.${id}.head`)
        ),
      sub: t(`squares.${id}.sub`),
      coding: coding[id],
      label: { chat: t(`squares.${id}.picture`), coding: codingLabels[id] },
      extras: extras[id],
      focus: id === FOCUS,
      target: id === FOCUS ? target('evals') : undefined,
    }));
    return (
      <SlideFrame className="@container mt-8 gap-6">
        <SkillScopeMatrix
          label={t('alt.matrix')}
          care={t('care')}
          who={[
            { label: t('axes.who.personal.label'), hint: t('axes.who.personal.hint') },
            {
              label: (
                <>
                  {t('axes.who.shared.label')}
                  <Marker note={STORED} placement="beside" />
                </>
              ),
              hint: t('axes.who.shared.hint'),
              target: target('shared'),
            },
          ]}
          where={[
            { label: t('axes.where.specific.label'), hint: t('axes.where.specific.hint') },
            { label: t('axes.where.general.label'), hint: t('axes.where.general.hint') },
          ]}
          squares={squares}
        />
        <footer className="flex flex-col gap-4 border-t border-border pt-4 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-10">
          <p className="max-w-md text-caption text-muted-foreground">
            <span className="font-semibold text-foreground">{t('footer.story')}</span> {t('analogy')}
          </p>
          <div className="flex max-w-xl items-start gap-2">
            <p
              {...target('stamp')}
              className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 text-caption font-semibold text-muted-foreground"
            >
              {t('stamp')}
              <Marker note={INFERENCE} placement="beside" />
            </p>
            <p className="text-caption text-muted-foreground">
              <InView view="chat">{t('footer.chat')}</InView>
              <InView view="coding" className="inline-flex items-start gap-1">
                <span>{t('footer.coding')}</span>
                <Marker note={STORED} placement="beside" />
              </InView>
            </p>
          </div>
        </footer>
      </SlideFrame>
    );
  },
});
