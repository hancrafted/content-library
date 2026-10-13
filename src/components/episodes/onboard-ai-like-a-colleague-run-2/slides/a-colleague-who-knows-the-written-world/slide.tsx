import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { DayOneNote } from '@/components/slide-shared/day-one-note';
import { useId } from 'react';
import styles from './colleague.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';

interface Trait {
  id: string;
  index: string;
  title: string;
  caption: string;
}

// One trait column, copied from the grid-1x3 master: the AI colleague's stub on the hairline at full width, the
// numeral, then title and caption. No hover: every trait is readable at rest.
function TraitColumn({ trait }: { trait: Trait }) {
  const id = `colleague-${useId()}`;
  return (
    <article aria-labelledby={id} className={`relative border-t border-border pt-8 md:pt-10 ${styles.trait}`}>
      <span aria-hidden className="absolute -top-px left-0 h-1 w-full rounded-full bg-ai" />
      <span
        aria-hidden
        className="block text-heading leading-none font-normal tracking-tighter text-muted-foreground tabular-nums"
      >
        {trait.index}
      </span>
      <h4 id={id} className="mt-6 text-subheading font-semibold tracking-tight text-balance text-foreground">
        {trait.title}
      </h4>
      <p className="mt-3 max-w-xs text-body text-pretty text-muted-foreground">{trait.caption}</p>
    </article>
  );
}

const TRAITS = ['written-world', 'confident', 'eager'] as const;
const GAP_ROWS = ['people', 'budget', 'last-year'] as const;

/*
 * Three strengths and one blank: the grid-1x3 master, copied with changes. The three columns are the new colleague's
 * profile, each on an `ai` stub; under them sits the day-one note, still blank, its rows naming what they do not
 * know yet. One CSS entrance: the traits rise left to right, then the note's rows top to bottom.
 */
export const aColleagueWhoKnowsTheWrittenWorld = slide({
  slug: 'a-colleague-who-knows-the-written-world',
  messages: { en, de },
  notes: [
    {
      slug: 'vendors-brief-it',
      target: 'traits',
      sources: [
        {
          slug: 'be-clear-and-direct',
          url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct',
        },
      ],
    },
    {
      slug: 'the-lens-has-a-lineage',
      target: 'title',
      sources: [
        { slug: 'good-enough-prompting', url: 'https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough' },
      ],
    },
    {
      slug: 'developers-use-the-same-picture',
      target: 'gap',
      sources: [
        { slug: 'ai-skills-podcast', url: 'https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock' },
      ],
    },
  ],
  segments: [{ slug: 'profile' }, { slug: 'eager' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('traits')} className="mt-10 grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-10">
        {TRAITS.map((id, i) => (
          <TraitColumn
            key={id}
            trait={{
              id,
              index: String(i + 1).padStart(2, '0'),
              title: t(`traits.${id}.title`),
              caption: t(`traits.${id}.caption`),
            }}
          />
        ))}
      </div>
      <div className="mt-12 max-w-2xl">
        <DayOneNote
          {...target('gap')}
          label={t('gap.label')}
          rowClassName={styles.row}
          rows={GAP_ROWS.map((id) => ({
            id,
            term: t(`gap.rows.${id}`),
            text: <span className="sr-only">{t('gap.empty')}</span>,
          }))}
        />
      </div>
    </SlideFrame>
  ),
});
