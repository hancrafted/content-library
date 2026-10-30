import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import { GuideToolbar } from '@/episodes/components/slide-shared/guide-toolbar/guide-toolbar';
import type { ReactNode } from 'react';
import { FindPicture } from './find-picture';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { OpenWindow } from './open-window';
import { type OsPick } from './os-pick.pure';
import { OsView } from './os-view.client';

const POWELL = { slug: 'powell-computer-anxiety', url: 'https://doi.org/10.1016/j.chb.2013.05.012' };
const VORONKOV = { slug: 'voronkov-sysadmins-cli', url: 'https://arxiv.org/abs/1905.13582' };
const WILSON = { slug: 'wilson-software-carpentry', url: 'https://doi.org/10.12688/f1000research.3-62.v2' };
const BERRY = { slug: 'berry-shellonyou', url: 'https://ctiber.github.io/papers/2022/VBetAl_ITICSE_2022.pdf' };

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
 * Open your terminal (Spec Option 2a): find it, then see it. Above the card the page's toolbar, the OS group live; in the card the way in for the picked system beside the window the viewer gets, linked by one
 * arrow, and three reassurance lines; Help in the header. The AI agent group is dimmed (nothing here differs by
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
  headerAction: ({ t, template }) => (
    <GuideHelp
      step={t('help.step')}
      words={{
        button: t('help.button'),
        label: t('help.label'),
        placeholder: t('help.placeholder'),
        copy: t('help.copy'),
        copied: t('help.copied'),
        prompt: template('help.prompt'),
        noError: t('help.noError'),
        chats: {
          openAIChats: t('help.chats.openAIChats'),
          openAIChatTip: template('help.chats.openAIChatTip'),
          newTab: t('help.chats.newTab'),
        },
      }}
    />
  ),
  content: ({ t, target, marker, Marker }) => {
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
        <GuideToolbar active={['os']} labels={{ os: t('toolbar.os'), agent: t('toolbar.agent') }} />
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
      </SlideFrame>
    );
  },
});
