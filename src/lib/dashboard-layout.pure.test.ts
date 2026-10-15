import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createLogFold } from '../../skills/new-episode/scripts/run-log.pure';
import { dashboardLayout } from './dashboard-layout.pure';
import { parseDashboardPipeline, projectDashboard } from './dashboard-projection.pure';
import { projectStages } from './dashboard-stages.pure';

function stagesOf(file: string) {
  const text = readFileSync(new URL(`../../tests/fixtures/pipeline-dashboard/${file}`, import.meta.url), 'utf8');
  const view = projectDashboard(parseDashboardPipeline(text), createLogFold({ live: 'unfinished' }).snapshot());
  return projectStages(view.jobs, view.stages).stages;
}

function overlaps(layout: ReturnType<typeof dashboardLayout>) {
  const nodes = layout.stages.flatMap((stage) => {
    const nodes = [
      { name: stage.id, x: stage.x, y: 0, size: 48 },
      ...stage.branches.flatMap((branch) =>
        branch.nodes.map((node, index) => ({
          name: `${branch.job}:${index}`,
          x: stage.x + node.x,
          y: node.y,
          size: 28,
        })),
      ),
    ];
    return nodes;
  });
  nodes.push({ name: layout.end.id, x: layout.end.x, y: 0, size: 16 });
  return nodes.flatMap((a, index) =>
    nodes
      .slice(index + 1)
      .flatMap((b) =>
        Math.abs(a.x - b.x) < (a.size + b.size) / 2 && Math.abs(a.y - b.y) < (a.size + b.size) / 2
          ? [`${a.name} / ${b.name}`]
          : [],
      ),
  );
}

describe('success cases', () => {
  it('merges both needs and wants branches into their dependent Job', () => {
    // ARRANGE
    const stage = stagesOf('synthetic-pipeline.yml')[0];
    const base = stage.jobs[0];
    stage.jobs = [
      { ...base, id: 'left', needs: [], wants: [] },
      { ...base, id: 'right', needs: [], wants: [] },
      { ...base, id: 'joined', needs: ['left'], wants: ['right'] },
    ];
    const expected = ['left:1', 'right:1'];
    // ACT
    const layout = dashboardLayout([stage]);
    const incoming = layout.stages[0].branches
      .find((branch) => branch.job === 'joined')!
      .edges.filter((edge) => edge.to.id === 'joined:0')
      .map((edge) => edge.from.id)
      .sort();
    // ASSERT
    expect(incoming).toEqual(expected);
    expect(overlaps(layout)).toEqual([]);
  });
  it('routes every dependency forward and every terminal Job to the next Stage', () => {
    // ARRANGE
    const inputs = ['pipeline.yml', 'synthetic-pipeline.yml'].map(stagesOf);
    const expected: string[] = [];
    // ACT
    const invalid = inputs.flatMap((stages) => {
      const layout = dashboardLayout(stages);
      return layout.stages.flatMap((stage, index) =>
        stage.branches.flatMap((branch) => {
          const dependent = stages[index].jobs.some((job) => [...job.needs, ...job.wants].includes(branch.job));
          const next = stages[index + 1]?.id ?? 'run-end';
          const backwards = branch.edges.filter((edge) => edge.to.x <= edge.from.x || edge.to.id === stage.id);
          const missingExit = !dependent && !branch.edges.some((edge) => edge.to.id === next);
          return [...backwards.map((edge) => `${edge.from.id} → ${edge.to.id}`), ...(missingExit ? [branch.job] : [])];
        }),
      );
    });
    // ASSERT
    expect(invalid).toEqual(expected);
  });
  it('fits dogfood and synthetic demo nodes without overlapping a stage or another Job', () => {
    // ARRANGE
    const files = ['pipeline.yml', 'synthetic-pipeline.yml'];
    const desktopCard = 1166;
    // ACT
    const layouts = files.map((file) => dashboardLayout(stagesOf(file)));
    const collisions = layouts.flatMap(overlaps);
    const maximumWidth = Math.max(...layouts.map((layout) => layout.width));
    // ASSERT
    expect(collisions).toEqual([]);
    expect(maximumWidth).toBeLessThanOrEqual(desktopCard);
  });
});

describe('failure cases', () => {
  it('retains failed Jobs on separate branches instead of hiding their nodes', () => {
    // ARRANGE
    const stages = stagesOf('synthetic-pipeline.yml');
    stages[0].jobs[0].state = 'error';
    const expectedJob = stages[0].jobs[0].id;
    // ACT
    const layout = dashboardLayout(stages);
    const names = layout.stages[0].branches.map((branch) => branch.job);
    // ASSERT
    expect(names).toContain(expectedJob);
    expect(overlaps(layout)).toEqual([]);
  });
});

describe('edge cases', () => {
  it('fans parallel Jobs in the final Stage on distinct sides of the spine', () => {
    // ARRANGE
    const stages = stagesOf('synthetic-pipeline.yml');
    const last = stages.at(-1)!;
    last.jobs.push({ ...last.jobs[0], id: 'publish-summary', needs: [], wants: [] });
    const expected = [-28, 28];
    // ACT
    const layout = dashboardLayout(stages);
    const lanes = layout.stages.at(-1)!.branches.map((branch) => branch.nodes[0].y);
    // ASSERT
    expect(lanes).toEqual(expected);
    expect(overlaps(layout)).toEqual([]);
  });
  it('keeps single-job and final-stage agents to the right of their Stage', () => {
    // ARRANGE
    const stages = stagesOf('synthetic-pipeline.yml');
    // ACT
    const layout = dashboardLayout(stages);
    const onStage = layout.stages.flatMap((stage) =>
      stage.branches.flatMap((branch) => branch.nodes.filter((node) => node.x <= 0)),
    );
    // ASSERT
    expect(onStage).toEqual([]);
    expect(layout.stages.at(-1)?.branches.length).toBeGreaterThan(0);
  });
});
