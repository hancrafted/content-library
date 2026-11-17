import {
  BAD_JOB_ID,
  JOB_ID,
  jobGraph,
  missingEdges,
  parsePipeline,
  type Job,
  type JobSource,
} from './episode-pipeline-definition.pure';
import {
  agentFields,
  CHECKS,
  JOB_FIELDS,
  SKILL_PREFIXES,
  SPAWNING_SKILLS,
  TOP_FIELDS,
} from './episode-pipeline-fields.pure';
import { ancestors, concurrentJobs } from './episode-pipeline-graph.pure';
import { checkOutputs } from './episode-pipeline-outputs.pure';
import { checkPorts } from './episode-pipeline-ports.pure';
import { checkSkillNames } from './episode-pipeline-skills.pure';
import { checkSpecGate } from './episode-pipeline-spec-gate.pure';
import { checkStages } from './episode-pipeline-stages.pure';
import { unless, type Finding } from './finding.pure';
import { checkMapping, isMapping, isString, isStringList, stringsOf, type Mapping } from './mapping-fields.pure';

export interface PipelineContext {
  skillFolder: string;
  skills: readonly string[];
  disabled: readonly string[];
  exists: (path: string) => boolean;
  staging: string;
  perRun: boolean;
  governs: (output: string) => boolean;
  pending?: readonly string[];
  retired?: readonly string[];
}

interface Reader {
  job: string;
  where: string;
  byId: ReadonlyMap<string, Job>;
  jobs: readonly Job[];
  context: PipelineContext;
  expanded: boolean;
}

function isKnownPath(context: PipelineContext, resolved: string): boolean {
  const retired = context.perRun ? (context.retired ?? []) : [];
  return context.exists(resolved) || (context.pending ?? []).includes(resolved) || retired.includes(resolved);
}

function checkRead({ job, where, byId, jobs, context }: Reader, reference: string): string[] {
  const target = reference.split('#')[0];
  const writers = jobs.filter(({ outputs }) => outputs.includes(target)).map(({ id }) => id);
  if (writers.length > 0) {
    const upstream = ancestors(job, byId);
    if (writers.some((writer) => writer === job || upstream.has(writer))) return [];
    return [
      `${where} reads "${reference}", which job "${writers[0]}" writes, but "${job}" neither needs nor wants it.`,
    ];
  }
  const resolved = SKILL_PREFIXES.some((prefix) => target.startsWith(prefix))
    ? `${context.skillFolder}/${target}`
    : target;
  if (isKnownPath(context, resolved)) return [];
  return [`${where} reads "${reference}", which resolves to ${resolved}, no existing file.`];
}

function checkAgent(reader: Reader, agent: unknown): string[] {
  const { where, context } = reader;
  if (!isMapping(agent)) return [`${where} must be a mapping.`];
  const reviewer = agent.type === 'reviewer';
  const strayRubric = agent.type === 'implementor' && Object.hasOwn(agent, 'rubric');
  const rubric = reviewer && isString(agent.rubric) ? [agent.rubric] : [];
  return [
    ...checkMapping(where, agent, agentFields(reviewer)),
    ...unless(!strayRubric, `${where} is an implementor and has a rubric; only a reviewer has one.`),
    ...checkSkillNames(where, stringsOf(agent.skills), context),
    ...stringsOf(agent.skills)
      .filter((skill) => SPAWNING_SKILLS.includes(skill) && agent.session !== 'orchestrator')
      .map(
        (skill) =>
          `${where} names the skill "${skill}", which spawns subagents; the agent needs session: orchestrator.`,
      ),
    ...[...stringsOf(agent.references), ...rubric].flatMap((reference) => checkRead(reader, reference)),
  ];
}

function checkJob(reader: Reader, { job: read, mapping: job }: JobSource): string[] {
  const { where, byId, context, expanded } = reader;
  const foreach = isString(job.foreach) ? [job.foreach] : [];
  const agents = Array.isArray(job.agents) ? (job.agents as unknown[]) : [];
  return [
    ...checkMapping(where, job, JOB_FIELDS),
    ...stringsOf(job.checks)
      .filter((check) => !CHECKS.includes(check))
      .map((check) => `${where} has the check "${check}"; the checks are ${CHECKS.join(', ')}.`),
    ...unless(!isString(job.id) || JOB_ID.test(job.id), `${where} has ${BAD_JOB_ID}`),
    ...checkOutputs(where, job, { staging: context.staging, expanded }),
    ...stringsOf(job.outputs)
      .filter((output) => output.endsWith('.md') && !context.governs(output))
      .map(
        (output) =>
          `${where} writes "${output}", which no markdown-harness rule governs; its implementor would query no intents.`,
      ),
    ...missingEdges(read, byId).map(
      ({ edge, other }) => `${where} ${edge} "${other}", which is no job in the pipeline.`,
    ),
    ...foreach.flatMap((path) => checkRead({ ...reader, where: `${where} foreach` }, path)),
    ...agents.flatMap((agent, at) => checkAgent({ ...reader, where: `${where}, agent ${at + 1}` }, agent)),
  ];
}

function inOrchestrator(job: Mapping): boolean {
  const agents = Array.isArray(job.agents) ? (job.agents as unknown[]) : [];
  return agents.length > 0 && agents.every((agent) => isMapping(agent) && agent.session === 'orchestrator');
}

function checkIsolation(sources: readonly JobSource[], byId: ReadonlyMap<string, Job>): string[] {
  const jobs = sources.map(({ job }) => job);
  const concurrent = concurrentJobs(jobs, byId);
  return sources
    .filter(({ job, mapping }) => concurrent.has(job.id) || Object.hasOwn(mapping, 'foreach'))
    .map(({ mapping }) => mapping)
    .filter((job) => job.isolation !== 'worktree' && !inOrchestrator(job))
    .map(
      (job) =>
        `Job "${String(job.id)}" may run beside another job but lacks isolation: worktree; each parallel job checks and merges from its own worktree.`,
    );
}

function readsOf(sources: readonly JobSource[]): Map<string, string[]> {
  return new Map(
    sources.map(({ job, mapping }) => [
      job.id,
      (Array.isArray(mapping.agents) ? (mapping.agents as unknown[]) : [])
        .filter(isMapping)
        .flatMap((agent) => stringsOf(agent.references)),
    ]),
  );
}

function checkJobs(document: Mapping, sources: readonly JobSource[], context: PipelineContext): string[] {
  // The reader returns a Pipeline only for a document with a job list.
  const raw = document.jobs as unknown[];
  const stages = isStringList(document.stages) ? document.stages : null;
  const expanded = context.perRun && document.status === 'approved';
  const jobs = sources.map(({ job }) => job);
  const { byId, duplicates, missing, cycle } = jobGraph(jobs);
  return [
    ...raw.flatMap((job, index) => unless(isMapping(job), `Job ${index + 1} must be a mapping.`)),
    ...sources.flatMap((source) =>
      checkJob({ job: source.job.id, where: `Job "${source.job.id}"`, byId, jobs, context, expanded }, source),
    ),
    ...duplicates.map((id) => `The job id "${id}" appears twice; job ids are unique.`),
    ...(stages === null ? [] : checkStages(stages, jobs)),
    ...checkPorts(jobs, { perRun: context.perRun, expanded }),
    ...checkSpecGate(jobs, { staging: context.staging, expanded, reads: readsOf(sources) }),
    ...(cycle === null ? [] : [`The needs graph has a cycle: ${cycle.join(' → ')}.`]),
    ...(cycle === null && missing.length === 0 ? checkIsolation(sources, byId) : []),
  ];
}

function checkTemplate(document: Mapping, context: PipelineContext): string[] {
  const named = Object.hasOwn(document, 'template');
  return [
    ...unless(
      named || !context.perRun,
      'The pipeline lacks template; a per-run pipeline names the template commit it was tailored from.',
    ),
    ...unless(
      !named || context.perRun,
      'The pipeline has template; only a per-run pipeline names the template commit it was tailored from.',
    ),
  ];
}

export function checkPipeline(file: string, yaml: string, context: PipelineContext): Finding[] {
  const parsed = parsePipeline(yaml);
  const document = 'document' in parsed ? parsed.document : undefined;
  const pipeline = 'pipeline' in parsed ? parsed.pipeline : null;
  const sources = 'sources' in parsed ? parsed.sources : [];
  const messages =
    'error' in parsed
      ? [parsed.error]
      : !isMapping(document)
        ? ['The pipeline must be a mapping with status and jobs.']
        : [
            ...checkMapping('The pipeline', document, TOP_FIELDS),
            ...checkTemplate(document, context),
            ...(pipeline === null ? [] : checkJobs(document, sources, context)),
          ];
  return messages.map((message): Finding => ({ kind: 'pipeline', file, message }));
}
