import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './the-twist.module.css';

const BEST_PRACTICES = { slug: 'claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' };

/*
 * The closing statement: a one-off Scene from SlideFrame and the kit's <Title>, not BasicPageSlide, whose title-top,
 * prose-bottom layout and required caption do not fit one statement. The statement and a pointer line naming grill-me,
 * the Slide's one `primary`, rise in together once when the Slide becomes active and hold.
 */
export const theTwist = slide({
  slug: 'the-twist',
  messages: { en, de },
  notes: [{ slug: 'ai-as-a-second-pair-of-eyes', target: 'title', sources: [BEST_PRACTICES] }],
  segments: [{ slug: 'the-twist' }, { slug: 'a-first-step' }],
  content: ({ t, Title }) => (
    <SlideFrame className="justify-center">
      <div className={styles.scene}>
        <Title>{t('title')}</Title>
        <p className="mt-10 max-w-md border-t border-border pt-6 text-body text-muted-foreground">
          {t.rich('pointer', {
            tool: (chunks) => <span className="font-semibold text-primary">{chunks}</span>,
          })}
        </p>
      </div>
    </SlideFrame>
  ),
});
