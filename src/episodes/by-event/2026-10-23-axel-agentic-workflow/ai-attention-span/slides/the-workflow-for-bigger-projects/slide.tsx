import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ContextBarsPreset } from '@/explorable-explanations/context/context';
import { CompareMotion } from './compare-motion.client';
import { ComparePanel } from './compare-panel';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './the-workflow-for-bigger-projects.module.css';

const CLEAN_WINDOWS = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const CONTEXT_LENGTH = { slug: 'du-context-length-alone-hurts', url: 'https://arxiv.org/abs/2510.05381' };

const AFTER = 'after';
const NOTE = 'after-note';

/**
 * The workflow for bigger projects (Spec Option 11c): before and after. On the left the one long summer-party chat as
 * the cornerstone's mini bar, past the smart zone, on a muted panel; on the right the workflow, the planner and its
 * worker chats as the cornerstone's mini bars on the accent-bordered panel, with the three small results they hand
 * back. The left panel fades as the right lights, on the Slide's first `active` and on every mouse enter and keyboard
 * focus.
 */
export const theWorkflowForBiggerProjects = slide({
  slug: 'the-workflow-for-bigger-projects',
  messages: { en, de },
  notes: [
    { slug: 'clean-windows-for-each-part', target: AFTER, sources: [CLEAN_WINDOWS] },
    { slug: 'short-tasks-beat-long-ones', target: NOTE, sources: [CONTEXT_LENGTH] },
  ],
  segments: [
    { slug: 'one-chat-is-too-small' },
    { slug: 'break-it-down-first' },
    { slug: 'one-planner' },
    { slug: 'a-fresh-chat-per-step' },
    { slug: 'you-coordinate' },
  ],
  content: ({ t, locale, target, marker, Marker }) => {
    return (
      <SlideFrame className="mt-10 gap-8">
        <CompareMotion label={t('compareLabel')} className={`${styles.compare} grid gap-8 lg:grid-cols-12`}>
          <ComparePanel title={t('before.title')} tone="before">
            <ContextBarsPreset preset="slide-11-before" locale={locale} />
            <p className="text-center text-caption text-muted-foreground">{t('before.note')}</p>
          </ComparePanel>
          <ComparePanel
            title={t('after.title')}
            tone="after"
            marker={<Marker note="clean-windows-for-each-part" placement="beside" />}
            target={target(AFTER)}
          >
            <ContextBarsPreset preset="slide-11-after" locale={locale} />
            <p {...target(NOTE)} className="text-caption text-muted-foreground">
              {t.rich('after.note', { marker: marker('short-tasks-beat-long-ones') })}
            </p>
          </ComparePanel>
        </CompareMotion>
        <p className="text-caption text-pretty text-muted-foreground">{t('illustrative')}</p>
      </SlideFrame>
    );
  },
});
