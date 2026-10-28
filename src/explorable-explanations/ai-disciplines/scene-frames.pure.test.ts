import { describe, expect, it } from 'vitest';
import { SCENES, finalFrame, onWire, type Frame } from './scene-frames.pure';

/** The frames that send a message down to the model, and the dots each sends. */
function downs(frames: readonly Frame[]): number[] {
  return frames.flatMap(({ dot }) => (dot?.dir === 'down' ? [dot.count] : []));
}

describe('success cases', () => {
  it('a prompt goes to the model once and its answer comes back into the chat', () => {
    // ARRANGE
    const expected = ['me', 'ai'];
    // ACT
    const chat = SCENES.prompting;
    // ASSERT
    expect(downs(chat)).toEqual([1]);
    expect(finalFrame('prompting').messages.map(({ from }) => from)).toEqual(expected);
  });

  it('an agent loops to the model three times: once for the request, once for each tool it calls, then answers', () => {
    // ARRANGE
    const expected = ['me', 'tool', 'tool', 'ai'];
    const loops = [1, 1, 1];
    // ACT
    const agent = SCENES.agents;
    // ASSERT
    expect(downs(agent)).toEqual(loops);
    expect(finalFrame('agents').messages.map(({ from }) => from)).toEqual(expected);
  });

  it('a workflow fans out from one agent to three and back into one, each turning done', () => {
    // ARRANGE
    const expected = { a: 'done', b1: 'done', b2: 'done', b3: 'done', c: 'done' };
    const calls = [1, 3, 1];
    // ACT
    const workflow = SCENES.workflows;
    // ASSERT
    expect(downs(workflow)).toEqual(calls);
    expect(finalFrame('workflows').nodes).toEqual(expected);
  });

  it('three agents of the fan-out work at the same time', () => {
    // ARRANGE
    const fanOut = ['b1', 'b2', 'b3'];
    // ACT
    const busy = SCENES.workflows.map(({ nodes }) =>
      Object.entries(nodes ?? {})
        .filter(([, state]) => state === 'active')
        .map(([node]) => node),
    );
    // ASSERT
    expect(busy).toContainEqual(fanOut);
  });
});

describe('failure cases', () => {
  it('a prompt never shows a tool: only an agent reaches for one', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const tools = SCENES.prompting.flatMap(({ messages }) => messages.filter(({ from }) => from === 'tool'));
    // ASSERT
    expect(tools).toEqual(expected);
  });

  it('a result leaves the factory only for a request that entered and went to the model and back', () => {
    // ARRANGE
    const cycle = ['enter', 'down', 'up', 'leave'];
    // ACT
    const steps = new Map<number, string[]>();
    for (const { jobs } of SCENES.factory) {
      for (const { id, step } of jobs ?? []) {
        const seen = steps.get(id) ?? [];
        if (seen.at(-1) !== step) steps.set(id, [...seen, step]);
      }
    }
    // ASSERT
    expect(steps.size).toBeGreaterThan(1);
    for (const seen of steps.values()) expect(seen).toEqual(cycle);
  });

  it('the factory never opens: requests go in and results come out, its inside stays a question', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const shown = SCENES.factory.flatMap(({ messages }) => messages);
    const playing = SCENES.factory.slice(0, -1).map(({ running }) => running ?? false);
    // ASSERT
    expect(shown).toEqual(expected);
    expect(playing).not.toContain(false);
  });
});

describe('edge cases', () => {
  it('a scene at rest is still: the factory stops running once it has played', () => {
    // ARRANGE
    const atRest = finalFrame('factory');
    // ACT
    const running = atRest.running ?? false;
    // ASSERT
    expect(running).toBe(false);
  });

  it('each tool line shows between two round trips: the model asks for it, its result goes back', () => {
    // ARRANGE
    const frames = SCENES.agents;
    const tools = (frame: Frame) => frame.messages.filter(({ from }) => from === 'tool').length;
    const tripsBeforeEachTool = [1, 2];
    // ACT
    const tripsBefore = [1, 2].map((count) => {
      const shown = frames.findIndex((frame) => tools(frame) === count);
      return frames.slice(0, shown).filter(({ dot }) => dot?.dir === 'up').length;
    });
    // ASSERT
    expect(tripsBefore).toEqual(tripsBeforeEachTool);
  });

  it('up to five requests travel to the model at once, never more, arriving at uneven times', () => {
    // ARRANGE
    const most = 5;
    // ACT
    const inFlight = SCENES.factory.map(({ jobs }) => jobs?.length ?? 0);
    const wire = SCENES.factory.map((frame) => onWire(frame).length);
    const firstSeen = new Map<number, number>();
    SCENES.factory.forEach(({ jobs }, tick) => jobs?.forEach(({ id }) => firstSeen.set(id, firstSeen.get(id) ?? tick)));
    const arrivals = [...firstSeen.values()];
    const gaps = new Set(arrivals.slice(1).map((tick, index) => tick - (arrivals[index] ?? 0)));
    // ASSERT
    expect(Math.max(...inFlight)).toBe(most);
    expect(Math.max(...wire)).toBeGreaterThan(1);
    expect(gaps.size).toBeGreaterThan(1);
  });

  it('every scene has a positive duration on every frame, so a loop never spins', () => {
    // ARRANGE
    const scenes = Object.values(SCENES);
    // ACT
    const still = scenes.flat().filter(({ ms }) => !(ms > 0));
    // ASSERT
    expect(still).toEqual([]);
  });

  it('an answer comes up the wire before it shows: each up-dot precedes the answer it carries', () => {
    // ARRANGE
    const frames = SCENES.prompting;
    // ACT
    const up = frames.findIndex(({ dot }) => dot?.dir === 'up');
    const answer = frames.findIndex(({ messages }) => messages.some(({ from }) => from === 'ai'));
    // ASSERT
    expect(up).toBeLessThan(answer);
  });
});
