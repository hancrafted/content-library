import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import { GuideToolbar } from '@/episodes/components/slide-shared/guide-toolbar/guide-toolbar';
import { DEFAULT_LOCALE, localizePath } from '@/shared/lib/locale.pure';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { UnzipView } from './unzip-view.client';

/*
 * The zip's file name and the folder's files are names, not words, so they stay out of the Translation files. Both are
 * placeholders until the separate starter-folder build: it puts the zip in public/ with its files at the zip's root
 * (no top folder, or Windows' Extract All nests starter-folder\starter-folder and step 6's path breaks).
 */
const ZIP = 'starter-folder.zip';
const FOLDER = 'starter-folder';
/** One file for both locales, so its URL is the default locale's bare path. */
const ZIP_PATH = `/${ZIP}`;

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d="M12 4v11M7 10l5 5 5-5M5 20h14"
        className="fill-none stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon({ folder = false }: { folder?: boolean }) {
  return folder ? (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
      <path
        d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2h9A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"
        className="fill-primary/20 stroke-primary"
        strokeWidth="1.5"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
      <path
        d="M6 3h8l4 4v14H6z"
        className="fill-card stroke-muted-foreground"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** One half's mono index line, as the grid-1x2 Master slide draws it. */
function HalfIndex({ index, accent, children }: { index: string; accent: string; children: ReactNode }) {
  return (
    <h4 className="flex items-center gap-3 font-mono text-caption font-normal text-muted-foreground">
      <span aria-hidden="true" className={`size-2 rounded-full ${accent}`} />
      {index} · {children}
    </h4>
  );
}

/** A row of the unzipped folder: its file name, bold for the skills folder, and what it is for. */
function FolderRow({ name, note, folder = false }: { name: string; note?: string; folder?: boolean }) {
  return (
    <li className="flex items-center gap-3 rounded-lg px-3 py-2">
      <FileIcon folder={folder} />
      <span className={folder ? 'font-semibold' : undefined}>{name}</span>
      {note ? <span className="ml-auto text-right text-muted-foreground">{note}</span> : null}
    </li>
  );
}

// Step 5, Option 5a: a copy of the grid-1x2 Master slide, download on the left and the unzipped folder on the right,
// hover dimming the other half. The OS toolbar group is live, since the unzip gesture differs by OS (the build notes overrule
// the Visual's "neither toolbar shows"); the AI-agent group is dimmed. Help sits in the header.
export const downloadAndUnzipTheStarterFolder = slide({
  slug: 'download-and-unzip-the-starter-folder',
  messages: { en, de },
  segments: [{ slug: 'one-link-one-zip' }, { slug: 'where-it-lives' }],
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
  content: ({ t }) => {
    return (
      <SlideFrame>
        <div className="flex flex-col gap-8">
          <GuideToolbar active={['os']} labels={{ os: t('toolbar.os'), agent: t('toolbar.agent') }} />
          <div className="focus-group focus-group--dim-others grid grid-cols-1 divide-y divide-border rounded-3xl border border-border bg-card md:grid-cols-2 md:divide-x md:divide-y-0">
            <section className="focus-group__item flex min-w-0 flex-col gap-6 p-5 md:p-8">
              <HalfIndex index="01" accent="bg-foreground">
                {t('download.heading')}
              </HalfIndex>
              <a
                href={localizePath(ZIP_PATH, DEFAULT_LOCALE)}
                download={ZIP}
                className="card-hover card-hover--raise inline-flex w-fit items-center gap-3 rounded-full bg-primary px-6 py-3 text-body font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <DownloadIcon />
                {t('download.label')}
              </a>
              <UnzipView
                warning={t.rich('unzip.windowsWarning')}
                words={{
                  downloads: t('download.downloads'),
                  zip: ZIP,
                  justNow: t('download.justNow'),
                  older: t('download.older'),
                  lastWeek: t('download.lastWeek'),
                  menuLabel: t('unzip.menuLabel'),
                  action: { mac: t('unzip.mac'), windows: t('unzip.windows'), linux: t('unzip.linux') },
                  menu: {
                    windows: {
                      before: [t('unzip.menu.windows.open'), t('unzip.menu.windows.openWith')],
                      after: [t('unzip.menu.windows.share'), t('unzip.menu.windows.copyPath')],
                    },
                    linux: {
                      before: [t('unzip.menu.linux.openWith')],
                      after: [t('unzip.menu.linux.rename'), t('unzip.menu.linux.trash')],
                    },
                  },
                }}
              />
            </section>
            <section className="focus-group__item flex min-w-0 flex-col gap-6 p-5 md:p-8">
              <HalfIndex index="02" accent="bg-primary">
                {t('folder.heading')}
              </HalfIndex>
              <div className="rounded-2xl border border-border bg-background">
                <p className="flex items-center gap-2 border-b border-border px-4 py-2 text-caption text-muted-foreground">
                  {t('download.downloads')} <span aria-hidden="true">›</span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">{FOLDER}</span>
                </p>
                <ul aria-label={t('folder.label')} className="flex flex-col gap-1 p-3 text-caption text-foreground">
                  <FolderRow folder name="skills" note={t('folder.rows.skills')} />
                  <FolderRow name="AGENTS.md" note={t('folder.rows.agents')} />
                  <FolderRow name="CLAUDE.md" />
                  <FolderRow name="GLOSSARY.md" note={t('folder.rows.glossary')} />
                </ul>
              </div>
              <p className="flex items-center gap-3 rounded-xl bg-(--success)/15 px-4 py-3 text-caption text-foreground">
                <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    className="fill-none stroke-(--success)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t.rich('folder.worked')}</span>
              </p>
              <p className="text-body text-foreground">
                {t.rich('folder.remember', {
                  muted: (chunks) => <span className="text-muted-foreground">{chunks}</span>,
                })}
              </p>
            </section>
          </div>
        </div>
      </SlideFrame>
    );
  },
});
