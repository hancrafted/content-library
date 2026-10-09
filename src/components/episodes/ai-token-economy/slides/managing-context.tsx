import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

function ChatLane(): ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">Plain chat</span>
        <span className="font-mono text-success font-bold">25% · fresh</span>
      </div>
      <div className="flex h-10 w-full overflow-hidden rounded-box border border-base-content/10 bg-base-300">
        <div className="flex w-1/4 items-center justify-center bg-neutral text-neutral-content font-mono text-[0.65rem]">
          Boot-up
        </div>
        <div className="w-[15%] bg-primary" />
        <div className="w-[10%] bg-accent" />
      </div>
    </div>
  );
}

function AgentLane(): ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">Agentic coding</span>
        <span className="font-mono text-error font-bold">85% · full</span>
      </div>
      <div className="flex h-10 w-full overflow-hidden rounded-box border border-base-content/10 bg-base-300">
        <div className="flex w-1/4 items-center justify-center bg-neutral text-neutral-content font-mono text-[0.65rem]">
          Boot-up
        </div>
        <div className="w-[15%] bg-primary" />
        <div className="w-[25%] bg-warning" />
        <div className="w-[20%] bg-warning/80" />
      </div>
    </div>
  );
}

function AttentionLanes(): ReactElement {
  return (
    <div className="mt-8 space-y-6">
      <ChatLane />
      <AgentLane />
      <div className="flex justify-between font-mono text-xs text-base-content/60">
        <span>9 AM · fresh</span>
        <span>12 PM</span>
        <span>3 PM</span>
        <span>5 PM · running on fumes</span>
      </div>
    </div>
  );
}

export const managingContext = slide({
  slug: 'managing-context',
  notes: [{ slug: 'cognitive-stamina', target: 'title' }],
  content: ({ t, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <AttentionLanes />
    </SectionSlide>
  ),
});
