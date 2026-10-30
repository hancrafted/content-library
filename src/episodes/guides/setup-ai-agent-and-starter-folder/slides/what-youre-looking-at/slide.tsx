import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import { GuideToolbar } from '@/episodes/components/slide-shared/guide-toolbar/guide-toolbar';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';
import { Anatomy } from './anatomy.client';
import de from './i18n/de.json';
import en from './i18n/en.json';

const BERRY = { slug: 'berry-shellonyou', url: 'https://ctiber.github.io/papers/2022/VBetAl_ITICSE_2022.pdf' };

/**
 * What you're looking at (Feedback round 2): the open terminal drawn as five parts with a dotted callout to each, and
 * the explanation of the one the viewer points at, focuses, taps or steps to. The cursor blinks, the command types
 * itself in once and the output appears, all CSS and all off under reduced motion. The OS group of the toolbar is live
 * (the prompt follows it); the reassurance sits under the picture.
 */
export const whatYoureLookingAt = slide({
  slug: 'what-youre-looking-at',
  messages: { en, de },
  notes: [{ slug: 'try-and-see-what-happens', target: 'safe', sources: [BERRY] }],
  segments: [{ slug: 'five-parts' }, { slug: 'point-at-anything' }, { slug: 'you-cant-break-it' }],
  headerAction: ({ t, template }) => (
    <GuideHelp
      step={t('help.step')}
      words={{
        button: t('help.button'),
        label: t('help.label'),
        placeholder: t('help.placeholder'),
        copy: t('help.copy'),
        copied: t('help.copied'),
        copyTip: t('help.copyTip'),
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
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container gap-7">
      <GuideToolbar active={['os']} show={['os']} labels={{ os: t('toolbar.os'), agent: t('toolbar.agent') }} />
      <Alert role="note" className="border-primary/40 bg-primary/10" data-skip-note="">
        <Info aria-hidden="true" />
        <AlertDescription className="text-foreground">
          {t.rich('skip', { b: (chunks) => <b>{chunks}</b> })}
        </AlertDescription>
      </Alert>
      <div className="grid items-start gap-6 @3xl:grid-cols-12">
        <div className="relative @3xl:col-span-8">
          <Anatomy
            words={{
              parts: {
                prompt: { name: t('parts.prompt.name'), explanation: t('parts.prompt.explanation') },
                cursor: { name: t('parts.cursor.name'), explanation: t('parts.cursor.explanation') },
                command: { name: t('parts.command.name'), explanation: t('parts.command.explanation') },
                output: { name: t('parts.output.name'), explanation: t('parts.output.explanation') },
                close: { name: t('parts.close.name'), explanation: t('parts.close.explanation') },
              },
              prompts: { mac: t('prompts.mac'), windows: t('prompts.windows'), linux: t('prompts.linux') },
              command: t('command'),
              output: t('output'),
              windowTitle: t('windowTitle'),
              previous: t('previous'),
              next: t('next'),
              hint: t('hint'),
            }}
          />
        </div>
        <div
          className="relative flex flex-col gap-2 rounded-xl border border-border bg-card p-5 @3xl:col-span-4"
          {...target('safe')}
        >
          <Marker note="try-and-see-what-happens" className="top-2 right-2" />
          <p className="pr-8 text-body font-semibold">{t('safe.title')}</p>
          <p className="text-caption text-muted-foreground">{t('safe.text')}</p>
        </div>
      </div>
    </SlideFrame>
  ),
});
