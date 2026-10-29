import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import type { ReactNode } from 'react';
import { FindPicture } from './find-picture';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { OpenWindow } from './open-window';
import { OsToolbar } from './os-toolbar.client';
import { OsView } from './os-view.client';
import { StepProgress } from './step-progress';
import { StuckBox } from './stuck-box.client';
import { OS_PICKS, type OsPick } from './stuck-prompt.pure';

const POWELL = { slug: 'powell-computer-anxiety', url: 'https://doi.org/10.1016/j.chb.2013.05.012' };
const VORONKOV = { slug: 'voronkov-sysadmins-cli', url: 'https://arxiv.org/abs/1905.13582' };
const WILSON = { slug: 'wilson-software-carpentry', url: 'https://doi.org/10.12688/f1000research.3-62.v2' };
const BERRY = { slug: 'berry-shellonyou', url: 'https://ctiber.github.io/papers/2022/VBetAl_ITICSE_2022.pdf' };

/** This step on the route, and how many steps the route has (the Overview's "8 steps"). */
const STEP = 2;
const TOTAL = 8;

/** The three reassurance lines, each with the target it lights and the Speaker note its Context marker opens. */
const REASSURANCE = [
  { key: 'normal', target: 'normal', note: 'hesitation-is-normal' },
  { key: 'noClicking', target: 'no-clicking', note: 'why-the-command-line-feels-scary' },
  { key: 'setup', target: 'setup', note: 'setup-is-the-hard-part' },
] as const;

function Arrow() {
  return (
    <div className="flex justify-center @3xl:col-span-1">
      <svg viewBox="0 0 60 24" className="w-12 rotate-90 @3xl:w-full @3xl:rotate-0" aria-hidden="true">
        <path
          d="M2 12h50M42 4l10 8-10 8"
          className="fill-none stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

const Kbd = (chunks: ReactNode) => (
  <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-caption whitespace-nowrap">
    {chunks}
  </kbd>
);

/**
 * Open your terminal (Spec Option 2a): find it, then see it. Above the card the step pill, the eight-segment rail and
 * the page's OS toolbar; in the card the way in for the picked system beside the window the viewer gets, linked by one
 * arrow, and three reassurance lines; under it the troubleshooting box. No AI agent toggle (nothing here differs by
 * AI agent), no motion: the cursor is drawn still.
 */
export const openYourTerminal = slide({
  slug: 'open-your-terminal',
  messages: { en, de },
  notes: [
    { slug: 'hesitation-is-normal', target: 'normal', sources: [POWELL] },
    { slug: 'why-the-command-line-feels-scary', target: 'no-clicking', sources: [VORONKOV] },
    { slug: 'setup-is-the-hard-part', target: 'setup', sources: [WILSON] },
    { slug: 'feedback-builds-confidence', target: 'open-window', sources: [BERRY] },
  ],
  segments: [{ slug: 'not-a-personal-failing' }, { slug: 'one-window-one-cursor' }, { slug: 'stuck-paste-it' }],
  content: ({ t, template, target, marker, Marker }) => {
    const view = (os: OsPick) => (
      <>
        <p data-os-line className="text-body text-pretty">
          {t.rich(`os.${os}.line`, { kbd: Kbd })}
        </p>
        <div className="mt-7 grid items-center gap-6 @3xl:grid-cols-12">
          <div className="flex flex-col gap-2 @3xl:col-span-5">
            <p className="text-caption tracking-wide text-muted-foreground uppercase">{t('findLabel')}</p>
            <FindPicture
              os={os}
              query={t(`os.${os}.query`)}
              result={t(`os.${os}.result`)}
              resultKind={t(`os.${os}.resultKind`)}
              {...(os === 'mac' && { other: t('os.mac.other') })}
            />
          </div>
          <Arrow />
          <div className="flex flex-col gap-2 @3xl:col-span-6">
            <p className="text-caption tracking-wide text-muted-foreground uppercase">{t('seeLabel')}</p>
            <OpenWindow
              title={t(`os.${os}.window`)}
              lines={t(`os.${os}.output`) === '' ? [] : [t(`os.${os}.output`)]}
              prompt={t(`os.${os}.prompt`)}
              target={target('open-window')}
              marker={<Marker note="feedback-builds-confidence" className="top-2 right-2 z-10" />}
            />
            <p className="text-caption text-muted-foreground">{t('success')}</p>
          </div>
        </div>
      </>
    );
    return (
      <SlideFrame className="@container gap-7">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <StepProgress step={STEP} total={TOTAL} label={t('progress')} />
          <OsToolbar
            label={t('toolbarLabel')}
            options={OS_PICKS.map((os) => ({ value: os, label: t(`os.${os}.label`) }))}
          />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 @3xl:p-8">
          <OsView views={{ mac: view('mac'), windows: view('windows'), linux: view('linux') }} />
          <ul className="mt-8 grid gap-4 border-t border-border pt-5 text-caption text-muted-foreground @3xl:grid-cols-3">
            {REASSURANCE.map((line) => (
              <li key={line.key} {...target(line.target)}>
                {t.rich(`reassurance.${line.key}`, { marker: marker(line.note) })}
              </li>
            ))}
          </ul>
        </div>
        <StuckBox
          words={{
            title: t('stuck.title'),
            hint: t('stuck.hint'),
            paste: t('stuck.paste'),
            placeholder: t('stuck.placeholder'),
            includes: t('stuck.includes'),
            copy: t('stuck.copy'),
            copied: t('stuck.copied'),
            prompt: template('stuck.prompt'),
            empty: t('stuck.empty'),
            step: t('stuck.step'),
            os: { mac: t('os.mac.label'), windows: t('os.windows.label'), linux: t('os.linux.label') },
            agents: {
              'claude-code': t('agents.claude-code'),
              antigravity: t('agents.antigravity'),
              codex: t('agents.codex'),
              copilot: t('agents.copilot'),
            },
          }}
        />
      </SlideFrame>
    );
  },
});
