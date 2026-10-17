import { slide } from '@/components/slide-master/slide';
import { SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { SpineStepper } from './spine-stepper.client';

// A Slide is one folder named after its slug: this server entry, its client widgets and their `.pure.ts` logic, an
// optional CSS module, and its own Translation files. It imports only its own files and global shared code.
// Header: the Slide wrapper renders the Eyebrow, `title` and `caption` from this folder's Translation files and types
// them in once, so the Scene below holds the visual only; a `<Title>` or caption in it fails the build (FE-012).
// Notes: `target` is the Scene element a note explains. Mark it with the kit's `{...target('name')}`, as the spine and
// the prose below do; the Slide header marks `title` and `caption`.
// Add `sources: [{ slug, url }]` to cite; its title goes under `notes.<note>.sources.<slug>.title`.
// Reading time is counted from the Voice script's words (`speaking-time.pure.ts`): no minutes or spans to set.
export const whyATemplate = slide({
  slug: 'why-a-template',
  messages: { en, de },
  notes: [
    { slug: 'reference-episode', target: 'prose' },
    { slug: 'spine', target: 'spine' },
  ],
  segments: [{ slug: 'one-breath' }, { slug: 'the-spine', bridge: true }],
  content: ({ t, ref, target }) => (
    <SlideFrame>
      <div {...target('spine')} className="mt-10">
        <SpineStepper
          labels={{ episode: t('spine.episode'), section: t('spine.section'), slide: t('spine.slide') }}
          button={t('spine.next')}
        />
      </div>
      <div className="mt-auto pt-10">
        <SlideProse {...target('prose')}>{t.rich('prose', { ref: ref('reference-episode') })}</SlideProse>
      </div>
    </SlideFrame>
  ),
});
