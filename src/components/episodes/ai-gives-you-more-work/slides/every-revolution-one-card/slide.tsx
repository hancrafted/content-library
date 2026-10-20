import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { Exhibit } from './exhibit';
import { Fork } from './fork';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { RevealSteps } from './reveal-steps.client';

const SOURCES = {
  jevons: { slug: 'jevons-coal-question', url: 'https://www.econlib.org/library/YPDBooks/Jevons/jvnCQ.html' },
  autor: { slug: 'autor-still-so-many-jobs', url: 'https://www.aeaweb.org/articles?id=10.1257/jep.29.3.3' },
  boserup: {
    slug: 'boserup-agricultural-growth',
    url: 'https://www.biw.kuleuven.be/aee/clo/idessa_files/boserup1965.pdf',
  },
  ure: { slug: 'ure-philosophy-of-manufactures', url: 'https://archive.org/details/philosophyofmanu00urea' },
  mokyr: {
    slug: 'meisenzahl-mokyr-invention',
    url: 'https://www.nber.org/system/files/working_papers/w16993/w16993.pdf',
  },
  pleijt: { slug: 'de-pleijt-steam-human-capital', url: 'https://doi.org/10.1093/jeea/jvz006' },
  kwa: { slug: 'kwa-long-tasks', url: 'https://arxiv.org/abs/2503.14499' },
  dellacqua: {
    slug: 'dellacqua-jagged-frontier',
    url: 'https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf',
  },
  becker: { slug: 'becker-early-2025-ai', url: 'https://arxiv.org/abs/2507.09089' },
  atil: { slug: 'atil-llm-stability', url: 'https://arxiv.org/abs/2408.04667' },
} as const;

/** The disclosure, one step per click (Option 1a): the upper layers at rest, then each step the Voice script names. */
const STEP = { farmingPeople: 2, steamPeople: 3, computerPeople: 4, steamFork: 5, aiMachine: 6, aiPeople: 7 } as const;
const STEPS = 7;

/**
 * Every revolution, one card (Option 1a, the hairline frame): a gallery wall of exhibits read left to right in time,
 * farming, the steam engine and the computer, then AI twice as wide as the lead exhibit. Each exhibit shows what the
 * machine took over on top and where people moved up below; the steam engine's fork shows people going two ways
 * without judgment, and AI's fork is left open. The presenter reveals the climb step by step; without script, in
 * print and under reduced motion the finished wall shows. Overrules `master: grid-bento`, keeps `motion: local`.
 */
export const everyRevolutionOneCard = slide({
  slug: 'every-revolution-one-card',
  messages: { en, de },
  notes: [
    { slug: 'cheaper-unit-more-work', target: 'caption', sources: [SOURCES.jevons] },
    { slug: 'tool-lifts-the-tasks', target: 'lifted-people', sources: [SOURCES.autor] },
    { slug: 'plough-is-the-weaker-card', target: 'farming', sources: [SOURCES.boserup] },
    { slug: 'some-workers-did-rise', target: 'steam-fork', sources: [SOURCES.ure, SOURCES.mokyr] },
    { slug: 'steam-shifted-the-skill-mix', target: 'steam-fork', sources: [SOURCES.pleijt] },
    { slug: 'ai-completes-longer-tasks', target: 'ai', sources: [SOURCES.kwa] },
    { slug: 'gain-is-conditional', target: 'ai', sources: [SOURCES.dellacqua, SOURCES.becker] },
    { slug: 'same-prompt-answers-differently', target: 'ai', sources: [SOURCES.atil] },
  ],
  segments: [
    { slug: 'every-revolution-one-card' },
    { slug: 'the-climb' },
    { slug: 'the-fork-no-judgment' },
    { slug: 'now-it-thinks' },
    { slug: 'biggest-step' },
  ],
  content: ({ t, Marker }) => {
    const layers = { machine: t('layers.machine'), people: t('layers.people') };
    // On the lead exhibit's tinted layers muted grey falls under 4.5:1, so its asides read in the text colour.
    const aside = 'flex items-center gap-1 text-caption text-foreground';
    return (
      <SlideFrame className="mt-10">
        <RevealSteps steps={STEPS} className="@container">
          <div className="rounded-xl bg-muted px-4 py-6 @min-[40rem]:px-8 @min-[40rem]:py-10">
            <div className="grid grid-cols-1 items-start gap-10 @min-[60rem]:grid-cols-10 @min-[60rem]:gap-6">
              <div className="grid grid-cols-1 gap-10 @min-[40rem]:grid-cols-3 @min-[40rem]:gap-x-6 @min-[40rem]:gap-y-0 @min-[60rem]:col-span-6">
                <Exhibit
                  slug="farming"
                  size="standard"
                  target="farming"
                  title={t('exhibits.farming.title')}
                  era={t('exhibits.farming.era')}
                  line={t('exhibits.farming.line')}
                  machine={{
                    label: layers.machine,
                    text: t('exhibits.farming.machine'),
                    marker: <Marker note="plough-is-the-weaker-card" className="relative top-0 right-0" />,
                  }}
                  people={{ label: layers.people, text: t('exhibits.farming.people'), reveal: STEP.farmingPeople }}
                />
                <Exhibit
                  slug="steam"
                  size="standard"
                  title={t('exhibits.steam.title')}
                  era={t('exhibits.steam.era')}
                  line={t('exhibits.steam.line')}
                  machine={{ label: layers.machine, text: t('exhibits.steam.machine') }}
                  people={{
                    label: layers.people,
                    text: t('exhibits.steam.people'),
                    reveal: STEP.steamPeople,
                    target: 'lifted-people',
                    marker: <Marker note="tool-lifts-the-tasks" className="relative top-0 right-0" />,
                  }}
                >
                  <div data-reveal={STEP.steamFork} data-target="steam-fork" className="flex flex-col gap-2">
                    <Fork
                      open={false}
                      rose={
                        <>
                          {t('fork.rose')}
                          <Marker note="some-workers-did-rise" className="relative top-0 right-0" />
                        </>
                      }
                      stayed={
                        <>
                          {t('fork.stayed')}
                          <Marker note="steam-shifted-the-skill-mix" className="relative top-0 right-0" />
                        </>
                      }
                    />
                  </div>
                </Exhibit>
                <Exhibit
                  slug="computer"
                  size="standard"
                  title={t('exhibits.computer.title')}
                  era={t('exhibits.computer.era')}
                  line={t('exhibits.computer.line')}
                  machine={{ label: layers.machine, text: t('exhibits.computer.machine') }}
                  people={{
                    label: layers.people,
                    text: t('exhibits.computer.people'),
                    reveal: STEP.computerPeople,
                    marker: <Marker note="tool-lifts-the-tasks" className="relative top-0 right-0" />,
                  }}
                />
              </div>
              <div className="@min-[60rem]:col-span-4">
                <Exhibit
                  slug="ai"
                  size="lead"
                  target="ai"
                  title={t('exhibits.ai.title')}
                  era={t('exhibits.ai.era')}
                  line={t('exhibits.ai.line')}
                  machine={{
                    label: t('layers.ai'),
                    text: t('exhibits.ai.machine'),
                    reveal: STEP.aiMachine,
                    extra: (
                      <>
                        <ul className="flex flex-wrap gap-2 text-caption">
                          {(['language', 'reasoning', 'ideas'] as const).map((each) => (
                            <li key={each} className="rounded-full bg-card px-3 py-1 shadow-sm">
                              {t(`ai.capabilities.${each}`)}
                            </li>
                          ))}
                        </ul>
                        <p className={aside}>
                          {t('ai.taskLength')}
                          <Marker note="ai-completes-longer-tasks" className="relative top-0 right-0 shrink-0" />
                        </p>
                        <p className={aside}>
                          {t('ai.variance')}
                          <Marker note="same-prompt-answers-differently" className="relative top-0 right-0 shrink-0" />
                        </p>
                      </>
                    ),
                  }}
                  people={{
                    label: t('layers.aiPeople'),
                    text: t('exhibits.ai.people'),
                    reveal: STEP.aiPeople,
                    extra: (
                      <p className={aside}>
                        {t('ai.team')}
                        <Marker note="gain-is-conditional" className="relative top-0 right-0 shrink-0" />
                      </p>
                    ),
                  }}
                >
                  <div data-reveal={STEP.aiPeople} className="flex flex-col gap-2">
                    <Fork
                      open
                      title={t('forkOpen.title')}
                      beside={t('forkOpen.beside')}
                      manage={t('forkOpen.manage')}
                    />
                  </div>
                </Exhibit>
              </div>
            </div>
          </div>
        </RevealSteps>
      </SlideFrame>
    );
  },
});
