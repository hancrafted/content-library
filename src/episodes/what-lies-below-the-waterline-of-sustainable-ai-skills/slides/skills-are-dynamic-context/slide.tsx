import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import { ARRIVAL_DELAY, at, CARD, ControlRoomArt, type Arrival } from './control-room-art';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './slide.module.css';

const DAY_1 = { slug: 'google-day-1-new-sdlc', url: 'https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding' };
const DAY_3 = { slug: 'google-day-3-agent-skills', url: 'https://www.kaggle.com/whitepaper-agent-skills' };
const CLAUDE_MEMORY = { slug: 'anthropic-claude-code-memory', url: 'https://code.claude.com/docs/en/memory' };
const GEMINI_MD = {
  slug: 'google-gemini-cli-gemini-md',
  url: 'https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/gemini-md.md',
};
const COPILOT_INSTRUCTIONS = {
  slug: 'github-copilot-repository-instructions',
  url: 'https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions',
};
const CLAUDE_SKILLS = { slug: 'anthropic-claude-code-skills', url: 'https://code.claude.com/docs/en/skills' };

const STATIC_ROWS = ['system', 'skills', 'memory'] as const;
type Row = (typeof STATIC_ROWS)[number] | 'instructions' | 'frames' | 'sonar' | 'logs';
/** Each dynamic row stacks onto the window on the beat its object lands on the desk. */
const DYNAMIC_ROWS: readonly { readonly row: Row; readonly arrival: Arrival }[] = [
  { row: 'instructions', arrival: 'card' },
  { row: 'frames', arrival: 'frames' },
  { row: 'sonar', arrival: 'sonar' },
  { row: 'logs', arrival: 'logs' },
];
type Pill = 'feed' | 'index' | 'orders' | 'card' | 'frames' | 'sonar' | 'logs';
const PILLS: readonly { readonly pill: Pill; readonly x: number; readonly y: number }[] = [
  { pill: 'feed', x: 340, y: 70 },
  { pill: 'index', x: 1095, y: 345 },
  { pill: 'orders', x: 405, y: 500 },
  { pill: 'card', x: 580, y: 600 },
  { pill: 'frames', x: 770, y: 600 },
  { pill: 'sonar', x: 905, y: 600 },
  { pill: 'logs', x: 1035, y: 600 },
];

/** One block of the context window: its AI term, and the scene's word or the file behind it on the right. */
function WindowRow(props: {
  readonly term: string;
  readonly chat: string;
  readonly coding: string;
  readonly tone: 'static' | 'focal' | 'result';
  readonly arrival?: Arrival;
}) {
  const style =
    props.arrival === undefined
      ? undefined
      : ({ '--arrive-delay': `${ARRIVAL_DELAY[props.arrival]}ms` } as CSSProperties);
  return (
    <li
      data-row-tone={props.tone}
      data-motion={props.arrival === undefined ? undefined : 'stack-on'}
      style={style}
      className={cn(
        'flex flex-wrap items-baseline justify-between gap-x-3 rounded-lg px-3 py-2 text-caption',
        props.tone === 'static' && 'bg-card text-card-foreground shadow-sm',
        props.tone === 'focal' && 'bg-foreground py-4 text-background',
        props.tone === 'result' && 'bg-(--photo) text-foreground',
        props.arrival !== undefined && styles.arrive,
      )}
    >
      <span className="font-semibold">{props.term}</span>
      <InView view="chat" className="opacity-80">
        {props.chat}
      </InView>
      <InView view="coding" className="font-mono opacity-80">
        {props.coding}
      </InView>
    </li>
  );
}

/** A bracket beside one part of the window, naming it static or dynamic. */
function Bracket({ label, children }: { readonly label: ReactNode; readonly children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-l-4 border-foreground pl-3 text-caption">
      <p className="flex items-center gap-1 text-body font-semibold">{label}</p>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

/**
 * "Skills are static and dynamic context" (Spec Option 5b): the control room at the end of the dive beside the context
 * window standing upright, in the context window Explorable's own order and labels, static on top and dynamic below,
 * with a bracket naming each part. Overrules `grid-2x1` loosely for room, window and brackets over one footer; keeps
 * `motion: local`, each object landing on the desk as its block stacks onto the window.
 */
export const skillsAreDynamicContext = slide({
  slug: 'skills-are-dynamic-context',
  messages: { en, de },
  presentation: atDepth(1, 'page'),
  captionNote: 'static-and-dynamic-as-google-defines-them',
  notes: [
    { slug: 'static-and-dynamic-as-google-defines-them', target: 'static', sources: [DAY_1] },
    { slug: 'why-static-and-dynamic-context-are-kept-apart', target: 'always-loaded', sources: [DAY_1, DAY_3] },
    {
      slug: 'static-instructions-are-a-rule-of-thumb',
      target: 'rule-of-thumb',
      sources: [CLAUDE_MEMORY, GEMINI_MD, COPILOT_INSTRUCTIONS, CLAUDE_SKILLS],
    },
  ],
  segments: [{ slug: 'back-to-the-window' }, { slug: 'the-standing-part' }, { slug: 'filling-as-you-dive' }],
  content: ({ t, target, Marker }) => {
    const row = (name: Row) => ({
      term: t(`window.rows.${name}.term`),
      chat: t(`window.rows.${name}.chat`),
      coding: t(`window.rows.${name}.coding`),
    });
    return (
      <SlideFrame className={cn(styles.scene, '@container mt-6 flex flex-col gap-6')}>
        <div className="grid gap-6 @4xl:grid-cols-[7fr_5fr]">
          <ZoneScene
            zone="twilight"
            label={t('alt.room')}
            className="aspect-[3/2] w-full rounded-2xl shadow-md"
            overlay={
              <>
                <p
                  style={at(785, 90)}
                  className="absolute hidden -translate-x-1/2 text-caption font-semibold whitespace-nowrap text-foreground @lg:block"
                >
                  {t('art.brief')}
                </p>
                <p
                  style={at(1092, 170)}
                  className="absolute hidden -translate-x-1/2 text-caption font-semibold text-foreground @lg:block"
                >
                  {t('art.index')}
                </p>
                <div
                  style={{ ...at(CARD.x, CARD.y + 8), width: `${CARD.width / 12}%` }}
                  className="absolute hidden flex-col p-2 text-caption leading-tight text-foreground @2xl:flex"
                >
                  <span className="font-semibold">{t('art.cardTitle')}</span>
                </div>
                {PILLS.map(({ pill, x, y }) => (
                  <span
                    key={pill}
                    data-scene-pill
                    style={at(x, y)}
                    className="absolute hidden -translate-x-1/2 rounded-full bg-foreground px-2 text-caption font-semibold whitespace-nowrap text-background @lg:block"
                  >
                    {t(`art.pills.${pill}`)}
                  </span>
                ))}
              </>
            }
          >
            <ControlRoomArt />
          </ZoneScene>
          <section aria-label={t('window.label')} className="flex flex-col gap-2">
            <p className="text-caption text-muted-foreground">{t('window.heading')}</p>
            <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-x-4 gap-y-3">
              <ol className="flex flex-col gap-2 rounded-xl border p-2">
                {STATIC_ROWS.map((name) => (
                  <WindowRow key={name} tone="static" {...row(name)} />
                ))}
              </ol>
              <div {...target('static')}>
                <Bracket
                  label={
                    <>
                      {t('static.label')}
                      <Marker note="static-and-dynamic-as-google-defines-them" placement="beside" />
                    </>
                  }
                >
                  <p {...target('always-loaded')} className="flex items-center gap-1">
                    {t('static.text')}
                    <Marker note="why-static-and-dynamic-context-are-kept-apart" placement="beside" />
                  </p>
                </Bracket>
              </div>
              <div aria-hidden className="col-span-2 h-1 rounded-full bg-foreground" />
              <ol className="flex flex-col gap-2 rounded-xl border p-2">
                {DYNAMIC_ROWS.map(({ row: name, arrival }) => (
                  <WindowRow
                    key={name}
                    tone={name === 'instructions' ? 'focal' : 'result'}
                    arrival={arrival}
                    {...row(name)}
                  />
                ))}
                <li className="rounded-lg border-2 border-dashed px-3 py-4 text-center text-caption text-muted-foreground">
                  {t('window.free')}
                </li>
              </ol>
              <div className="self-end">
                <Bracket label={t('dynamic.label')}>{t('dynamic.text')}</Bracket>
              </div>
            </div>
          </section>
        </div>
        <footer className="grid gap-4 border-t pt-4 text-caption @3xl:grid-cols-[7fr_5fr]">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{t('analogy.label')}</span> {t('analogy.text')}
          </p>
          <div {...target('rule-of-thumb')} className="flex flex-col gap-1">
            <InView view="chat" as="p" className="text-body">
              {t('footer.chat')}
            </InView>
            <InView view="chat" as="p" className="flex items-center gap-1 text-muted-foreground">
              {t('footer.ruleOfThumb')}
              <Marker note="static-instructions-are-a-rule-of-thumb" placement="beside" />
            </InView>
            <InView view="coding" as="p">
              <span className="font-semibold">{t('footer.codingLead')}</span> {t.rich('footer.coding')}
            </InView>
            <InView view="coding" as="p" className="flex items-start gap-1 text-muted-foreground">
              <span>
                <span className="font-semibold">{t('footer.exceptionsLead')}</span> {t.rich('footer.exceptions')}
              </span>
              <Marker note="static-instructions-are-a-rule-of-thumb" placement="beside" />
            </InView>
          </div>
        </footer>
      </SlideFrame>
    );
  },
});
