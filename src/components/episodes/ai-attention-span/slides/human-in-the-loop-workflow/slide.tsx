import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { HumanInTheLoop } from '@/components/slide-shared/human-in-the-loop/human-in-the-loop';
import de from './i18n/de.json';
import en from './i18n/en.json';

const CLEAN_WINDOWS = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const CONTEXT_LENGTH = { slug: 'du-context-length-alone-hurts', url: 'https://arxiv.org/abs/2510.05381' };

const WORKERS = 'workers';
const LOOP_NOTE = 'loop-note';

/**
 * The human in the loop workflow: the brief-the-venue Workflow whole (its columns, connectors and the fan-out to the
 * worker chats and back in), only without bold first letters and the acronym unnamed. The loop strip did not fit
 * beside it at 1280x800, so its message (planner chat, worker chats, you checking) lives in the caption.
 */
export const humanInTheLoopWorkflow = slide({
  slug: 'human-in-the-loop-workflow',
  messages: { en, de },
  notes: [
    { slug: 'clean-windows-for-each-part', target: WORKERS, sources: [CLEAN_WINDOWS] },
    { slug: 'short-tasks-beat-long-ones', target: LOOP_NOTE, sources: [CONTEXT_LENGTH] },
  ],
  segments: [
    { slug: 'recall' },
    { slug: 'human-in-the-loop' },
    { slug: 'planner-and-handoff' },
    { slug: 'worker-chats' },
    { slug: 'you-check' },
  ],
  content: ({ t, template, locale, target, marker, Marker }) => {
    return (
      <SlideFrame className="mt-10 gap-10">
        <HumanInTheLoop
          workflow="project-plan"
          locale={locale}
          view="detailed"
          diagram={{
            label: t('workflowLabel'),
            jobsLabel: template('jobsLabel'),
            checked: t('jobs.checked'),
            initials: false,
            stages: {
              execute: {
                target: target(WORKERS),
                aside: <Marker note="clean-windows-for-each-part" placement="beside" />,
              },
            },
            jobs: {
              scope: {
                detail: (
                  <>
                    {t('jobs.scope.detail')}
                    <br />
                    {t.rich('jobs.scope.forgot', { marker: (chunks) => chunks })}
                  </>
                ),
              },
            },
          }}
        />
        <p {...target(LOOP_NOTE)} className="text-caption text-pretty text-muted-foreground">
          {t.rich('loop.note', { marker: marker('short-tasks-beat-long-ones') })}
        </p>
      </SlideFrame>
    );
  },
});
