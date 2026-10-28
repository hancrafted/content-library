import { describe, expect, it } from 'vitest';
import { SCENES, finalFrame, type Frame } from './scene-frames.pure';

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

  it('an agent loops to the model twice, each loop sent by the tool it calls, before its answer returns', () => {
    // ARRANGE
    const expected = ['me', 'tool', 'tool', 'ai'];
    const loops = [1, 1];
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

  it('a tool line shows before the round trip it sends, so the wire moves with the chat', () => {
    // ARRANGE
    const frames = SCENES.agents;
    // ACT
    const firstTool = frames.findIndex(({ messages }) => messages.some(({ from }) => from === 'tool'));
    const firstTrip = frames.findIndex(({ dot }) => dot?.dir === 'down');
    // ASSERT
    expect(firstTool).toBeLessThan(firstTrip);
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
