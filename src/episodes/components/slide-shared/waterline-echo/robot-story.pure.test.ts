import { describe, expect, it } from 'vitest';
import { ROBOT_STORY, robotAt, storyAgainstSlides, storyBreaks, type RobotBeat } from './robot-story.pure';

describe('success cases', () => {
  it("lists the Slides that draw the robot in the Episode's order, and finds no stray state when each matches its row", () => {
    // ARRANGE
    const story: readonly RobotBeat[] = [
      { slide: 'one', state: 'deck' },
      { slide: 'three', state: 'in-water', depth: 'sunlit' },
    ];
    const slides = [
      { slug: 'one', robots: ['deck'] },
      { slug: 'two', robots: [] },
      { slug: 'three', robots: ['in-water'] },
    ];
    const expected = { drawn: ['one', 'three'], strays: [], unheld: [] };
    // ACT
    const findings = storyAgainstSlides(slides, story);
    // ASSERT
    expect(findings).toEqual(expected);
  });

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
  it('names a Slide that draws the robot in a state its row does not hold, and a row for no Slide the Episode holds', () => {
    // ARRANGE
    const story: readonly RobotBeat[] = [
      { slide: 'one', state: 'deck' },
      { slide: 'gone', state: 'in-water', depth: 'sunlit' },
    ];
    const slides = [
      { slug: 'one', robots: ['hanging', 'deck'] },
      { slug: 'two', robots: [] },
    ];
    const expected = { drawn: ['one'], strays: ['one draws hanging, its row says deck'], unheld: ['gone'] };
    // ACT
    const findings = storyAgainstSlides(slides, story);
    // ASSERT
    expect(findings).toEqual(expected);
  });

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
  it('lists each Slide once in the story, even a Slide that draws the robot twice', () => {
    // ARRANGE
    const slugs = ROBOT_STORY.map(({ slide }) => slide);
    const expected: readonly string[] = [];
    // ACT
    const repeated = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    // ASSERT
    expect(repeated).toEqual(expected);
  });

  it('names a robot drawn without a state as unmarked, and leaves a Slide with no row to the order check', () => {
    // ARRANGE
    const story: readonly RobotBeat[] = [{ slide: 'one', state: 'deck' }];
    const slides = [
      { slug: 'one', robots: ['unmarked'] },
      { slug: 'extra', robots: ['deck'] },
    ];
    const expected = { drawn: ['one', 'extra'], strays: ['one draws unmarked, its row says deck'], unheld: [] };
    // ACT
    const findings = storyAgainstSlides(slides, story);
    // ASSERT
    expect(findings).toEqual(expected);
  });

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
