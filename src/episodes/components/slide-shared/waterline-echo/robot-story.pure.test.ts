import { describe, expect, it } from 'vitest';
import { ROBOT_STORY, robotAt, storyBreaks, type RobotBeat } from './robot-story.pure';

/*
 * Where the diving robot is on each Slide of "What lies below the waterline of sustainable AI skills" that shows it, in
 * story order (feedback 3, decision 42): on deck, hanging from the A-frame, in the water at a depth, or on the seabed,
 * and once it is in the water it never climbs back to the A-frame or the deck until it is recovered at the very end.
 */

describe('success cases', () => {
  it('never takes the robot back to the A-frame or the deck once it is in the water', () => {
    // ARRANGE
    const expected: readonly string[] = [];
    // ACT
    const breaks = storyBreaks(ROBOT_STORY);
    // ASSERT
    expect(breaks).toEqual(expected);
  });

  it('puts the robot in the water on the title of "What a skill is", as the Slide before it shows (Image 36)', () => {
    // ARRANGE
    const expected = { state: 'in-water', depth: 'surface' };
    // ACT
    const { state, depth } = robotAt('what-a-skill-is');
    // ASSERT
    expect({ state, depth }).toEqual(expected);
  });

  it('keeps the robot at or above Sunlit until the first Twilight Section, "What goes inside" (decision 57)', () => {
    // ARRANGE
    const expected: readonly string[] = [];
    const firstTwilight = ROBOT_STORY.findIndex(({ slide }) => slide === 'what-goes-inside');
    // ACT
    const tooDeep = ROBOT_STORY.slice(0, firstTwilight)
      .filter(({ depth }) => depth !== undefined && depth !== 'surface' && depth !== 'sunlit')
      .map(({ slide }) => slide);
    // ASSERT
    expect(tooDeep).toEqual(expected);
  });

  it('opens on deck in the thought experiment and goes in the water when the skill hands over the procedure', () => {
    // ARRANGE
    const expected = ['deck', 'deck', 'in-water'];
    // ACT
    const states = [
      'a-thought-experiment',
      'an-ai-model-that-forgets-every-morning',
      'a-skill-hands-the-ai-your-procedure',
    ].map((slide) => robotAt(slide).state);
    // ASSERT
    expect(states).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names the Slide that pulls the robot back out of the water', () => {
    // ARRANGE
    const story: readonly RobotBeat[] = [
      { slide: 'one', state: 'deck' },
      { slide: 'two', state: 'in-water', depth: 'sunlit' },
      { slide: 'three', state: 'hanging' },
      { slide: 'four', state: 'deck' },
    ];
    const expected = ['three', 'four'];
    // ACT
    const breaks = storyBreaks(story);
    // ASSERT
    expect(breaks).toEqual(expected);
  });

  it('refuses a Slide that has no row in the story', () => {
    // ARRANGE
    const expected = /No robot in the story on "no-such-slide"/;
    // ACT
    const look = () => robotAt('no-such-slide');
    // ASSERT
    expect(look).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('lets the robot be recovered only as the story ends, never before', () => {
    // ARRANGE
    const early: readonly RobotBeat[] = [
      { slide: 'one', state: 'in-water', depth: 'sunlit' },
      { slide: 'two', state: 'recovered' },
      { slide: 'three', state: 'in-water', depth: 'abyss' },
    ];
    const expected = { early: ['two'], last: ROBOT_STORY.at(-1)?.state };
    // ACT
    const seen = { early: storyBreaks(early), last: 'recovered' };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
