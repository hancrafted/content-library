import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ControlRoom } from './room';
import { SkillIndexSheet } from './skill-index-sheet';
import styles from './slide.module.css';
import { requestBubble, requestLines, WIDE_PICTURE_PIXELS } from './speech.pure';

const SPECIFICATION = { slug: 'agent-skills-specification', url: 'https://agentskills.io/specification' };
const ANTHROPIC = {
  slug: 'anthropic-skill-authoring-best-practices',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices',
};
const OPTIMIZING = {
  slug: 'agent-skills-optimizing-descriptions',
  url: 'https://agentskills.io/skill-creation/optimizing-descriptions',
};
const GOOGLE = { slug: 'google-agent-skills-whitepaper', url: 'https://www.kaggle.com/whitepaper-agent-skills' };

const SKILL = 'collect-sediment-sample';

const matched = (chunks: ReactNode) => (
  <span className="underline decoration-primary decoration-2 underline-offset-4">{chunks}</span>
);
const matchedOnDark = (chunks: ReactNode) => (
  <span className="underline decoration-background decoration-2 underline-offset-4">{chunks}</span>
);
const plain = (chunks: string) => chunks;

function linesFrom(words: string) {
  const { content, moment } = requestLines(requestBubble(words, WIDE_PICTURE_PIXELS));
  const at = ({ x, y }: { x: number; y: number }) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  return {
    content: `M ${at(content)} C 470 ${content.y.toFixed(1)}, 460 150, 530 150`,
    moment: `M ${at(moment)} C 470 ${moment.y.toFixed(1)}, 458 312, 548 312`,
    start: moment,
  };
}

export const nameTheMomentNotTheContent = slide({
  slug: 'name-the-moment-not-the-content',
  messages: { en, de },
  presentation: atDepth(3, 'page'),
  captionNote: 'write-the-description-in-the-users-words',
  notes: [
    { slug: 'a-description-says-what-and-when', target: 'moment', sources: [SPECIFICATION, ANTHROPIC] },
    { slug: 'write-the-description-in-the-users-words', target: 'caption', sources: [OPTIMIZING] },
    { slug: 'not-for-lines-googles-advice-alone', target: 'not-for', sources: [OPTIMIZING] },
    { slug: 'the-not-for-clause-in-googles-day-3', target: 'hedge', sources: [GOOGLE] },
  ],
  segments: [{ slug: 'two-labels' }, { slug: 'your-request' }, { slug: 'the-closing-line' }],
  content: ({ t, target, Marker }) => {
    const request = {
      chat: t.markup('request.text', { match: plain }),
      coding: t.markup('request.coding', { match: plain }),
    };
    const lines = linesFrom(request.chat);
    return (
      <SlideFrame className="@container mt-8 gap-6">
        <p data-request-who className="text-caption font-semibold text-muted-foreground">
          <InView view="chat">{t('request.who')}</InView>
          <InView view="coding">{t('request.codingWho')}</InView>
        </p>
        <div className="grid gap-4">
          <ZoneScene
            zone="sunlit"
            iceberg="none"
            label={t('alt.scene')}
            className="aspect-[25/16] w-full rounded-2xl shadow-md @5xl:col-start-1 @5xl:row-start-1"
          >
            <ControlRoom request={request} />
          </ZoneScene>
          <p className="relative w-fit rounded-full bg-primary px-3 py-1 text-caption font-semibold text-primary-foreground @5xl:col-start-1 @5xl:row-start-1 @5xl:mt-[33%] @5xl:ml-[25%] @5xl:self-start @5xl:justify-self-start">
            {t('match.pairs')}
          </p>
          <SkillIndexSheet
            className="@5xl:col-start-1 @5xl:row-start-1 @5xl:mt-[3.4%] @5xl:ml-[54.8%] @5xl:w-[42%] @5xl:self-start @5xl:justify-self-start"
            name={t('index.skill')}
            slug={SKILL}
            target={target('moment')}
            chat={{ title: t('index.title'), note: t('index.note') }}
            coding={{
              title: t('coding.title'),
              note: t.rich('coding.note'),
              hedge: (
                <>
                  {t('coding.hedge')}
                  <Marker note="the-not-for-clause-in-googles-day-3" placement="beside" />
                  <Marker note="not-for-lines-googles-advice-alone" placement="beside" />
                </>
              ),
            }}
            content={{
              tag: t('content.tag'),
              verdict: t('content.verdict'),
              text: t('content.text'),
              coding: t('content.text'),
            }}
            moment={{
              tag: t('moment.tag'),
              verdict: t('moment.verdict'),
              text: t.rich('moment.use', { match: matched }),
              coding: t.rich('moment.use', { match: matchedOnDark }),
              notFor: (
                <>
                  <span {...target('not-for')}>{t('moment.notFor')}</span>
                  <Marker note="not-for-lines-googles-advice-alone" placement="beside" />
                </>
              ),
              notForCoding: t('moment.notFor'),
              hedge: (
                <>
                  <span {...target('hedge')}>{t('moment.notForTag')}</span>
                  <Marker note="the-not-for-clause-in-googles-day-3" placement="beside" />
                </>
              ),
              marker: <Marker note="a-description-says-what-and-when" placement="beside" />,
            }}
          />
          <svg
            aria-hidden
            viewBox="0 0 1000 640"
            className="pointer-events-none relative hidden size-full @5xl:col-start-1 @5xl:row-start-1 @5xl:block"
          >
            <path
              d={lines.content}
              strokeWidth={2}
              strokeDasharray="4 7"
              strokeLinecap="round"
              className="fill-none stroke-muted-foreground"
            />
            <path
              d="M 528 140 l 10 20 M 538 140 l -10 20"
              strokeWidth={2}
              strokeLinecap="round"
              className="fill-none stroke-muted-foreground"
            />
            <path
              d={lines.moment}
              pathLength={1}
              strokeWidth={4.5}
              strokeLinecap="round"
              className={`fill-none stroke-primary ${styles.match}`}
            />
            <circle
              cx={lines.start.x}
              cy={lines.start.y}
              r={6}
              strokeWidth={2}
              className="fill-primary stroke-background"
            />
            <path d="M 562 312 l -14 -9 l 0 18 z" className={`fill-primary ${styles.verdict}`} />
          </svg>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-body font-semibold text-primary-foreground">
            2
          </span>
          <p className="text-body font-semibold">{t('step')}</p>
        </div>
        <footer className="flex flex-col gap-4 border-t border-border pt-4 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-10">
          <p className="max-w-md text-caption text-muted-foreground">
            <span className="font-semibold text-foreground">{t('footer.story')}</span> {t('analogy')}
          </p>
          <p className="flex max-w-xl items-start gap-1 text-caption text-muted-foreground @4xl:text-right">
            <span>
              <InView view="chat">{t('footer.chat')}</InView>
              <InView view="coding">{t('footer.coding')}</InView>
            </span>
            <Marker note="a-description-says-what-and-when" placement="beside" />
          </p>
        </footer>
      </SlideFrame>
    );
  },
});
