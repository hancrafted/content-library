/*
 * Where the diving robot is on each Slide of "What lies below the waterline of sustainable AI skills" that shows it,
 * in story order (feedback 3, decision 42): the one table the section slides and the page Slides read, so no Slide
 * hoists the robot back to the A-frame after an earlier one has it in the water. The shared `Robot` knows none of
 * this; it draws whatever a Slide places. Shared beside `WATERLINE_SECTIONS` because Slides of every Section read it.
 */
import type { Zone } from '../iceberg/zones.pure';

/** Where the robot is: on the ship's deck, hanging from the A-frame over the water, in the water, on the seabed, or hauled back aboard at the end. */
export type RobotState = 'deck' | 'hanging' | 'in-water' | 'seabed' | 'recovered';

/** One Slide's robot: its state and, under the waterline, the zone it is in. */
export interface RobotBeat {
  /** The Slide's slug. */
  readonly slide: string;
  readonly state: RobotState;
  /** The zone the robot is in, while it is in the water or on the seabed. */
  readonly depth?: Zone;
}

/** Every Slide that shows the robot, Title slide first, in the Episode's order. */
export const ROBOT_STORY: readonly RobotBeat[] = [
  { slide: 'hero', state: 'hanging' },
  { slide: 'a-thought-experiment', state: 'deck' },
  { slide: 'an-ai-model-that-forgets-every-morning', state: 'deck' },
  { slide: 'a-skill-hands-the-ai-your-procedure', state: 'in-water', depth: 'surface' },
  { slide: 'what-a-skill-is', state: 'in-water', depth: 'surface' },
  { slide: 'skills-are-dynamic-context', state: 'seabed', depth: 'twilight' },
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

/** The robot on a Slide; refused for a Slide the story has no row for. */
export function robotAt(slide: string, story: readonly RobotBeat[] = ROBOT_STORY): RobotBeat {
  const beat = story.find((own) => own.slide === slide);
  if (beat === undefined) throw new Error(`No robot in the story on "${slide}"; add its row to ROBOT_STORY.`);
  return beat;
}

const UNDERWATER: ReadonlySet<RobotState> = new Set(['in-water', 'seabed']);

/**
 * The Slides that break the story: once the robot is in the water, any later row on deck or hanging, and a
 * `recovered` row anywhere but last. Empty when the story holds.
 */
export function storyBreaks(story: readonly RobotBeat[]): readonly string[] {
  const firstIn = story.findIndex(({ state }) => UNDERWATER.has(state));
  return story.flatMap(({ slide, state }, index) => {
    const climbsOut = firstIn !== -1 && index > firstIn && (state === 'deck' || state === 'hanging');
    const earlyRecovery = state === 'recovered' && index !== story.length - 1;
    return climbsOut || earlyRecovery ? [slide] : [];
  });
}
