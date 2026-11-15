import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { Provision } from './provision';
import { SkillRow } from './skill-row';

const MOLLICK = {
  slug: 'mollick-management-superpower',
  url: 'https://www.oneusefulthing.org/p/management-as-ai-superpower',
};
const LEE = {
  slug: 'lee-critical-thinking',
  url: 'https://www.microsoft.com/en-us/research/wp-content/uploads/2025/01/lee_2025_ai_critical_thinking_survey.pdf',
};
const TOMASEV = { slug: 'tomasev-intelligent-delegation', url: 'https://arxiv.org/abs/2602.11865' };

/**
 * "What to look for in your team" (Spec Option 12a), on screen Slide 1's question "What did you need to do?": a copy of
 * the `grid-1x2` master on the board, two halves split by a hairline. On the left each skill to build in each person
 * points at the failures it fixed, all four marked fixed; on the right the four things the organisation gives, the
 * oversight policy as the shared in/on/out pills. Keeps `motion: none`; each half's list dims the others on hover.
 */
export const whatToLookForInYourTeam = slide({
  slug: 'what-to-look-for-in-your-team',
  messages: { en, de },
  notes: [
    { slug: 'management-101-skills', target: 'person', sources: [MOLLICK] },
    { slug: 'effort-moves-to-steering-and-checking', target: 'person', sources: [LEE] },
    { slug: 'evidence-is-indirect', target: 'footnote', sources: [TOMASEV] },
    { slug: 'juniors-may-not-build-them', target: 'footnote', sources: [TOMASEV] },
  ],
  segments: [
    { slug: 'the-answer' },
    { slug: 'break-down' },
    { slug: 'write-contracts' },
    { slug: 'review-twice' },
    { slug: 'the-organisation' },
    { slug: 'look-at-your-team' },
    { slug: 'take-one-process' },
  ],
  content: ({ t, marker, Marker, target }) => {
    const fixedLabel = t('fixed');
    return (
      <SlideFrame className="gap-6 @container">
        <div className="grid grid-cols-1 divide-y divide-border rounded-xl bg-muted p-5 @3xl:p-8 @4xl:grid-cols-2 @4xl:divide-x @4xl:divide-y-0">
          <section {...target('person')} className="flex flex-col gap-4 pb-6 @container @4xl:pr-8 @4xl:pb-0">
            <p className="flex items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-caption font-semibold text-primary-foreground">
                {t('person.label')}
              </span>
              <Marker note="management-101-skills" placement="beside" />
            </p>
            <ol className="focus-group focus-group--dim-others flex flex-col gap-4">
              <SkillRow
                slug="break-down"
                tilt="left"
                skill={t('person.skills.breakDown.skill')}
                fixedLabel={fixedLabel}
                fixed={[
                  {
                    slug: 'drivers',
                    was: t('person.skills.breakDown.fixed.drivers.was'),
                    now: t('person.skills.breakDown.fixed.drivers.now'),
                  },
                  {
                    slug: 'cold',
                    was: t('person.skills.breakDown.fixed.cold.was'),
                    now: t('person.skills.breakDown.fixed.cold.now'),
                  },
                ]}
              />
              <SkillRow
                slug="contract"
                tilt="right"
                skill={t('person.skills.contract.skill')}
                fixedLabel={fixedLabel}
                fixed={[
                  {
                    slug: 'eggs',
                    was: t('person.skills.contract.fixed.eggs.was'),
                    now: t('person.skills.contract.fixed.eggs.now'),
                  },
                ]}
              />
              <SkillRow
                slug="review"
                tilt="left"
                skill={t.rich('person.skills.review.skill', {
                  marker: marker('effort-moves-to-steering-and-checking'),
                })}
                fixedLabel={fixedLabel}
                fixed={[
                  {
                    slug: 'paintball',
                    was: t('person.skills.review.fixed.paintball.was'),
                    now: t('person.skills.review.fixed.paintball.now'),
                  },
                ]}
              />
            </ol>
          </section>
          <section className="flex flex-col gap-4 pt-6 @4xl:pt-0 @4xl:pl-8">
            <p>
              <span className="rounded-full border border-foreground px-3 py-1 text-caption font-semibold">
                {t('organisation.label')}
              </span>
            </p>
            <ul className="focus-group focus-group--dim-others grid grid-cols-1 gap-4 @2xl:grid-cols-2">
              <Provision
                slug="goals"
                title={t('organisation.items.goals.title')}
                text={t('organisation.items.goals.text')}
              />
              <Provision
                slug="contracts"
                title={t('organisation.items.contracts.title')}
                text={t('organisation.items.contracts.text')}
              />
              <Provision
                slug="oversight"
                title={t('organisation.items.oversight.title')}
                pills={[t('oversight.in'), t('oversight.on'), t('oversight.out')]}
              />
              <Provision
                slug="workflows"
                title={t('organisation.items.workflows.title')}
                text={t('organisation.items.workflows.text')}
              />
            </ul>
          </section>
        </div>
        <p {...target('footnote')} className="text-caption text-muted-foreground">
          {t.rich('footnote.synthesis', { marker: marker('evidence-is-indirect') })}{' '}
          {t.rich('footnote.juniors', { marker: marker('juniors-may-not-build-them') })}
        </p>
      </SlideFrame>
    );
  },
});
