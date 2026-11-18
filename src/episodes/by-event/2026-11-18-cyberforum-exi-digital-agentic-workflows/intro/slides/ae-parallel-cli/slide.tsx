import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './terminal.module.css';

type Tone = 'plain' | 'dim' | 'green' | 'orange' | 'blue' | 'pink';
const TONE: Record<Tone, string> = {
  plain: '',
  dim: 'text-(--term-dim)',
  green: 'text-(--term-green)',
  orange: 'text-(--term-orange)',
  blue: 'text-(--term-blue)',
  pink: 'text-(--term-pink)',
};

const TERMINALS = {
  implement: {
    lines: {
      cmd: 'dim',
      read: 'blue',
      plan: 'plain',
      brief: 'orange',
      agent: 'pink',
      started: 'dim',
      probe: 'dim',
      handoff: 'blue',
      rule: 'dim',
      wait: 'pink',
    },
  },
  grill: {
    lines: {
      q15: 'orange',
      o1: 'plain',
      o2: 'plain',
      rec: 'blue',
      code: 'green',
      sep: 'dim',
      q16: 'orange',
      rule: 'dim',
      status: 'orange',
    },
  },
  monitor: {
    lines: {
      cooked: 'dim',
      event: 'blue',
      gate: 'blue',
      'so-far': 'plain',
      f1: 'plain',
      f2: 'plain',
      rule: 'dim',
      status: 'orange',
    },
  },
} as const satisfies Record<string, { lines: Record<string, Tone> }>;
type TerminalKey = keyof typeof TERMINALS;

export const aeParallelCli = slide({
  slug: 'ae-parallel-cli',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'terminals' }],
  content: ({ t, target }) => {
    const text = (key: string) => t(key as Parameters<typeof t>[0]);
    const flightdeck = (
      <div className="flex w-[44%] flex-none flex-col gap-1.5 border-l border-(--term-rule) p-2">
        <p className="font-semibold tracking-wide">{t('flightdeck.head')}</p>
        <div className="grid gap-0.5 rounded-sm border border-(--term-red) p-1">
          <span>{t('flightdeck.model')}</span>
          <span>{t('flightdeck.ctx')}</span>
        </div>
        <div className="grid gap-0.5 rounded-sm border border-(--term-green) p-1">
          <span className="text-(--term-green)">{t('flightdeck.gate')}</span>
          <span>{t('flightdeck.allowed')}</span>
        </div>
        <div className="rounded-sm border border-(--term-red) p-1">{t('flightdeck.turn')}</div>
        <div className="grid gap-0.5 text-(--term-dim)">
          <span>{t('flightdeck.log')}</span>
          <span>{t('flightdeck.entry')}</span>
          <span>{t('flightdeck.entry')}</span>
          <span>{t('flightdeck.entry')}</span>
        </div>
      </div>
    );
    return (
      <SlideFrame className="justify-center gap-5">
        <div
          {...target('terminals')}
          role="img"
          aria-label={t('terminalsLabel')}
          className={`${styles.scene} grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1.35fr]`}
        >
          {(Object.keys(TERMINALS) as TerminalKey[]).map((key, index) => (
            <div key={key} data-terminal={key} className="flex min-w-0 flex-col gap-2">
              <p className="flex items-center gap-2 text-body font-semibold">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-accent text-caption text-background">
                  {index + 1}
                </span>
                {text(`terminals.${key}.stage`)}
                <span className="font-normal text-muted-foreground">· {text(`terminals.${key}.app`)}</span>
              </p>
              <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-(--term-bg) font-mono text-caption text-(--term-fg)">
                <div className="flex justify-between bg-(--term-bar) px-3 py-1.5 text-(--term-dim)">
                  <span>{text(`terminals.${key}.tab`)}</span>
                  <span>{text(`terminals.${key}.cmd`)}</span>
                </div>
                <div className="flex flex-1">
                  <div className="min-w-0 flex-1 p-3 leading-relaxed whitespace-pre-wrap">
                    {Object.entries(TERMINALS[key].lines).map(([line, tone]) => (
                      <p key={line} className={TONE[tone]}>
                        {text(`terminals.${key}.lines.${line}`)}
                      </p>
                    ))}
                  </div>
                  {key === 'monitor' && flightdeck}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border-l-4 border-l-brand-accent bg-muted px-5 py-4">
          <div>
            <p className="text-body font-semibold">{t('drive.head')}</p>
            <p className="text-caption text-muted-foreground">{t('drive.body')}</p>
          </div>
        </div>
      </SlideFrame>
    );
  },
});
