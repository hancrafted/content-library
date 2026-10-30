import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import type { ReactNode } from 'react';
import { CommandRow } from './command-row';
import { CopyLine } from './copy-line.client';
import { CheckBundle, HomepageResult, OfficialLink, SetupAnswers, SkillPicker } from './drawings';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The Node.js project's own download page: the install instructions stay there (Visual language, "Official links"). */
const NODE_DOWNLOAD = 'https://nodejs.org/en/download';
/** The exact lines to type: never translated. */
const ADD_SKILLS = 'npx skills@latest add mattpocock/skills';
const SETUP_SKILL = '/setup-matt-pocock-skills';
const CHECK_SKILL = '/check-workshop-readiness';
/** The installer's main group, by the name `mattpocock/skills` gives it in `.claude-plugin/plugin.json`. */
const MAIN_GROUP = 'mattpocock-skills';
const OTHER_GROUP = 'Other';
/** The hancrafted entry to paste into GLOSSARY.md; a placeholder until the base zip's GLOSSARY.md settles it. */
const GLOSSARY_ENTRY = "**hancrafted**:\nHan's workshop homepage, https://hancrafted.net";

/*
 * Step 8, "Set up the Matt Pocock skills yourself" (Spec Option 8a): a five-row recipe card, the reason on the left
 * and the exact line on the right, with Help in the header. No toolbar: nothing here differs by operating system or AI
 * agent. The rows are a `focus-group--dim-others`, so Han can point at one while presenting. No motion of its own.
 */
export const setUpTheMattPocockSkillsYourself = slide({
  slug: 'set-up-the-matt-pocock-skills-yourself',
  messages: { en, de },
  segments: [{ slug: 'same-chain-built-by-hand' }, { slug: 'same-proof' }],
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
    const copy = { copy: t('copy'), copied: t('copied') };
    const code = (chunks: ReactNode) => <code className="font-mono">{chunks}</code>;
    return (
      <SlideFrame>
        <div className="@container flex flex-col gap-8">
          <ol
            aria-label={t('rows.label')}
            className="focus-group focus-group--dim-others flex flex-col rounded-xl border border-border bg-card"
          >
            <CommandRow rowKey="node" n={1} title={t('rows.node.title')} reason={t('rows.node.reason')}>
              <OfficialLink url={NODE_DOWNLOAD} newTab={t('newTab')}>
                {t('nodeLink')}
              </OfficialLink>
            </CommandRow>
            <CommandRow rowKey="add" n={2} title={t('rows.add.title')} reason={t.rich('rows.add.reason')}>
              <CopyLine text={ADD_SKILLS} where="shell" words={copy} />
              <SkillPicker
                question={t('picker.question')}
                groups={[
                  { name: MAIN_GROUP, holds: t('picker.main'), picked: true },
                  { name: OTHER_GROUP, holds: t('picker.other'), picked: false },
                ]}
              />
            </CommandRow>
            <CommandRow rowKey="setup" n={3} title={t('rows.setup.title')} reason={t('rows.setup.reason')}>
              <CopyLine text={SETUP_SKILL} where="agent" words={copy} />
              <SetupAnswers
                answers={(['tracker', 'docs', 'labels', 'file'] as const).map((key) => ({
                  question: t(`answers.${key}.question`),
                  answer: t.rich(`answers.${key}.answer`, {
                    code,
                    at: (chunks) => <code className="font-mono text-primary">{chunks}</code>,
                  }),
                }))}
              />
            </CommandRow>
            <CommandRow
              rowKey="check"
              n={4}
              title={t('rows.check.title')}
              reason={t.rich('rows.check.reason', { code })}
            >
              <CheckBundle
                bundle={{ link: t('bundle.link'), size: t('bundle.size'), entryLabel: t('bundle.entryLabel') }}
                glossaryEntry={GLOSSARY_ENTRY}
                words={copy}
              />
            </CommandRow>
            <CommandRow rowKey="run" n={5} focal title={t('rows.run.title')} reason={t('rows.run.reason')}>
              <CopyLine text={CHECK_SKILL} where="agent" focal words={copy} />
              <HomepageResult site="hancrafted.net" name="hancrafted" opens={t('homepage')} />
            </CommandRow>
          </ol>
        </div>
      </SlideFrame>
    );
  },
});
