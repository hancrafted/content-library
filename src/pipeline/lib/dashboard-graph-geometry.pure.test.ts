import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { graphGeometry } from './dashboard-graph-geometry.pure';
import { parseDashboardPipeline, projectDashboard } from './dashboard-projection.pure';
import { projectStages } from './dashboard-stages.pure';
import { createLogFold } from './run-log.pure';

/**
 * Three Stages without Jobs in the Job network, laid out from GRAPH_LAYOUT by hand: the first centre sits at half a
 * Stage node plus the node inset (24 + 6 = 30); an inner Stage spans the minimum gap (96); the last spans half a Stage
 * node, a Job node and edge padding to the Run end (24 + 14 + 8 = 46) plus the same to it (8 + 14 + 8 = 30), 76; and
 * the canvas runs half an end node and edge padding past the Run end (8 + 8). Centres 30, 126, 222; Run end 298; 314 wide.
 */
const EMPTY_STAGES = projectStages([], ['brief', 'research', 'pr']).stages;
const EMPTY_WIDTH = 314;

const percentOf = (inset: string) => Number.parseFloat(inset);

function stagesOf(file: string) {
  const text = readFileSync(new URL(`../../../tests/fixtures/pipeline-dashboard/${file}`, import.meta.url), 'utf8');
  const view = projectDashboard(parseDashboardPipeline(text), createLogFold({ live: 'unfinished' }).snapshot());
  return projectStages(view.jobs, view.stages).stages;
}

describe('success cases', () => {
  it('ends the replay rail under the first Stage and the Run end in the Stage view', () => {
    // ARRANGE
    const stages = stagesOf('synthetic-pipeline.yml');
    const expected = { start: '6.25%', end: '6.25%', first: 1 / 16, last: 15 / 16 };
    // ACT
    const geometry = graphGeometry(stages, false);
    // ASSERT
    expect(geometry.cssVars['--start-inset']).toBe(expected.start);
    expect(geometry.cssVars['--end-inset']).toBe(expected.end);
    expect(geometry.stages[0].centre).toBe(expected.first);
    expect(geometry.end).toBe(expected.last);
  });
  it('ends the replay rail under the first Stage and the Run end in the Job network', () => {
    // ARRANGE
    const expected = {
      start: (30 / EMPTY_WIDTH) * 100,
      end: ((EMPTY_WIDTH - 298) / EMPTY_WIDTH) * 100,
      screens: [0, 96 / 268, 192 / 268, 1],
    };
    const places = [0, 1 / 3, 2 / 3, 1];
    // ACT
    const geometry = graphGeometry(EMPTY_STAGES, true);
    const screens = places.map((place) => geometry.rail.screenOf(place));
    // ASSERT
    expect(percentOf(geometry.cssVars['--start-inset'])).toBeCloseTo(expected.start);
    expect(percentOf(geometry.cssVars['--end-inset'])).toBeCloseTo(expected.end);
    expect(screens).toEqual(expected.screens.map((screen) => expect.closeTo(screen)));
  });
  it('draws every edge from one node centre to another', () => {
    // ARRANGE
    const files = ['pipeline.yml', 'synthetic-pipeline.yml'];
    const expected: string[] = [];
    // ACT
    const loose = files.flatMap((file) =>
      graphGeometry(stagesOf(file), true).stages.flatMap((stage) => {
        const centres = new Set([`0 0`, `${stage.width} 0`]);
        for (const node of stage.branches.flatMap((branch) => branch.nodes)) centres.add(`${node.x} ${node.y}`);
        return stage.branches.flatMap((branch) =>
          branch.edges.flatMap((edge) => {
            const numbers = edge.path.split(/[A-Z ]+/).filter(Boolean);
            const ends = [numbers.slice(0, 2).join(' '), numbers.slice(-2).join(' ')];
            return ends.filter((end) => !centres.has(end)).map((end) => `${edge.id} @ ${end}`);
          }),
        );
      }),
    );
    // ASSERT
    expect(loose).toEqual(expected);
  });
  it('places no node over another on the canvas', () => {
    // ARRANGE
    const files = ['pipeline.yml', 'synthetic-pipeline.yml'];
    const sizes = { stage: 48, job: 28, end: 16 };
    // ACT
    const collisions = files.flatMap((file) => {
      const geometry = graphGeometry(stagesOf(file), true);
      const nodes = geometry.stages.flatMap((stage) => {
        const x = stage.centre * geometry.width;
        return [
          { name: stage.id, x, y: 0, size: sizes.stage },
          ...stage.branches.flatMap((branch) =>
            branch.nodes.map((node) => ({ name: node.id, x: x + node.x, y: node.y, size: sizes.job })),
          ),
        ];
      });
      nodes.push({ name: 'run-end', x: geometry.end * geometry.width, y: 0, size: sizes.end });
      return nodes.flatMap((a, index) =>
        nodes
          .slice(index + 1)
          .filter((b) => Math.abs(a.x - b.x) < (a.size + b.size) / 2 && Math.abs(a.y - b.y) < (a.size + b.size) / 2)
          .map((b) => `${a.name} / ${b.name}`),
      );
    });
    // ASSERT
    expect(collisions).toEqual([]);
  });
});

describe('failure cases', () => {
  it('still places the Run end, and holds the whole rail at its start, when no Stage is planned', () => {
    // ARRANGE
    const expected = { end: 0.5, screen: 0, place: 0 };
    // ACT
    const geometry = graphGeometry([], false);
    const screen = geometry.rail.screenOf(1);
    const place = geometry.rail.placeOf(1);
    // ASSERT
    expect(geometry.end).toBe(expected.end);
    expect(screen).toBe(expected.screen);
    expect(place).toBe(expected.place);
  });
});

describe('edge cases', () => {
  it('derives the Stage centre variables the stylesheet aligns lines and the Run end to', () => {
    // ARRANGE
    const expected = { centre: '30px', anchor: '60px', size: '48px', inset: '6px' };
    // ACT
    const { cssVars } = graphGeometry(stagesOf('synthetic-pipeline.yml'), false);
    // ASSERT
    expect(cssVars['--stage-centre']).toBe(expected.centre);
    expect(cssVars['--stage-anchor-size']).toBe(expected.anchor);
    expect(cssVars['--stage-size']).toBe(expected.size);
    expect(cssVars['--node-inset']).toBe(expected.inset);
  });
  it('puts the scrubber on a Stage centre when replay reaches that Stage, and back', () => {
    // ARRANGE
    const geometry = graphGeometry(EMPTY_STAGES, true);
    // The third of four Stage rail places; its centre 222 is 192 along the 268 from the first centre to the Run end.
    const stage = 2 / 3;
    const expected = 192 / 268;
    // ACT
    const visual = geometry.rail.screenOf(stage);
    const structural = geometry.rail.placeOf(expected);
    // ASSERT
    expect(visual).toBeCloseTo(expected);
    expect(structural).toBeCloseTo(stage);
  });
});
