import type { RobotState } from '../deep-sea-expedition/robot.pure';
import type { Zone } from '../iceberg/zones.pure';

export type { RobotState } from '../deep-sea-expedition/robot.pure';

export interface RobotBeat {
  readonly slide: string;
  readonly state: RobotState;
  readonly depth?: Zone;
}

export const ROBOT_STORY: readonly RobotBeat[] = [
  { slide: 'hero', state: 'hanging' },
  { slide: 'a-thought-experiment', state: 'deck' },
  { slide: 'an-ai-model-that-forgets-every-morning', state: 'deck' },
  { slide: 'a-skill-hands-the-ai-your-procedure', state: 'in-water', depth: 'surface' },
  { slide: 'what-a-skill-is', state: 'in-water', depth: 'surface' },
  { slide: 'skills-are-dynamic-context', state: 'in-water', depth: 'sunlit' },
  { slide: 'when-to-write-one', state: 'in-water', depth: 'sunlit' },
  { slide: 'write-it-from-a-good-run', state: 'in-water', depth: 'sunlit' },
  { slide: 'the-label', state: 'in-water', depth: 'sunlit' },
  { slide: 'what-goes-inside', state: 'in-water', depth: 'twilight' },
  { slide: 'one-skill-one-job', state: 'in-water', depth: 'twilight' },
  { slide: 'what-stays-beside', state: 'in-water', depth: 'twilight' },
  { slide: 'beside-the-skill', state: 'in-water', depth: 'twilight' },
  { slide: 'sharing-it', state: 'in-water', depth: 'midnight' },
  { slide: 'who-owns-the-shared-skill-library', state: 'in-water', depth: 'midnight' },
  { slide: 'does-the-skill-make-things-better', state: 'in-water', depth: 'midnight' },
  { slide: 'keeping-it-alive', state: 'seabed', depth: 'abyss' },
  { slide: 'every-skill-is-a-loan', state: 'in-water', depth: 'abyss' },
  { slide: 'the-model-changes-the-skill-doesn-t', state: 'in-water', depth: 'abyss' },
  { slide: 'retire-skills', state: 'in-water', depth: 'abyss' },
  { slide: 'the-whole-iceberg', state: 'recovered' },
];

export function robotAt(slide: string, story: readonly RobotBeat[] = ROBOT_STORY): RobotBeat {
  const beat = story.find((own) => own.slide === slide);
  if (beat === undefined) throw new Error(`No robot in the story on "${slide}"; add its row to ROBOT_STORY.`);
  return beat;
}

const UNDERWATER: ReadonlySet<RobotState> = new Set(['in-water', 'seabed']);

export function storyBreaks(story: readonly RobotBeat[]): readonly string[] {
  const firstIn = story.findIndex(({ state }) => UNDERWATER.has(state));
  return story.flatMap(({ slide, state }, index) => {
    const climbsOut = firstIn !== -1 && index > firstIn && (state === 'deck' || state === 'hanging');
    const earlyRecovery = state === 'recovered' && index !== story.length - 1;
    return climbsOut || earlyRecovery ? [slide] : [];
  });
}

export interface DrawnSlide {
  readonly slug: string;
  readonly robots: readonly string[];
}

export interface StoryFindings {
  readonly drawn: readonly string[];
  readonly strays: readonly string[];
  readonly unheld: readonly string[];
}

export function storyAgainstSlides(
  slides: readonly DrawnSlide[],
  story: readonly RobotBeat[] = ROBOT_STORY,
): StoryFindings {
  const held = new Set(slides.map(({ slug }) => slug));
  return {
    drawn: slides.filter(({ robots }) => robots.length > 0).map(({ slug }) => slug),
    strays: slides.flatMap(({ slug, robots }) => {
      const row = story.find(({ slide }) => slide === slug);
      if (row === undefined) return [];
      return robots
        .filter((state) => state !== row.state)
        .map((state) => `${slug} draws ${state}, its row says ${row.state}`);
    }),
    unheld: story.filter(({ slide }) => !held.has(slide)).map(({ slide }) => slide),
  };
}
