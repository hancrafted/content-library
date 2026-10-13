# How agentic workflow systems define their pipelines

Research date: 2026-10-12. Scope: how agent frameworks and classic workflow engines declare a pipeline (static or dynamic graph, declarative or code), with the focus on **dynamic fan-out** over a list that does not exist until an upstream job runs. Also: where the labels "graph engineering", "harness engineering", "context engineering" and "workflow engineering" come from. Not binding; binding decisions live in `.archgate/adrs/`.

Evidence grades: **[P]** primary (the vendor's own docs, engineering blog or paper), **[S]** secondary (third-party write-up, search excerpt). Claims without a grade are from a **[P]** page fetched in this session. Every URL below was fetched or surfaced by search on 2026-10-12.

Context: the pipeline under redesign is `.agents/skills/new-episode/assets/pipeline.yml` in the `episode-onboard-ai-like-a-colleague` worktree. One orchestrator (a Claude Code session) walks a YAML job list as a todo list and spawns subagents per job. Jobs have `needs`, an optional `foreach: <file>#<heading>`, `outputs`, `checks`, `retries`, `gate: human`, and an ordered `agents` list (implementor, then a fresh reviewer).

## Short answer

- **Dynamic fan-out is a runtime map over an upstream output.** Every engine that supports it takes the list as _data produced by a previous step_ and instantiates the body once per item. The declarative engines (Argo `withParam`, GitHub Actions `fromJSON`, Step Functions `ItemsPath`/`ItemReader`, Airflow `expand`) say so in one field that names the upstream output. The code frameworks (LangGraph `Send`, ADK dynamic workflows, Mastra `.foreach`, Claude Code `pipeline()`) do it with a loop or map over a value in memory. Your option 1 (upstream writes a list, `foreach` points at it) is the dominant declarative shape. Option 2 (query a live source) appears in no engine as the primary primitive; the nearest is Step Functions' `ItemReader`, which reads a stored dataset at run time, not a live query.
- **The graph itself stays static; only the item count is dynamic.** No declarative system lets a job invent new job _types_ at run time. The fan-out body is a fixed sub-graph stamped N times.
- **Dependencies between items of one fan-out are not a first-class feature in any system read.** The documented fan-out bodies are independent per item. Ordering is expressed by splitting the work into stages (a fixed job before the map, or a second map after it) or by nesting a sub-workflow per item. That favours your "lift it into a fixed job" option. This is an inference from absence; see Gaps.
- **Evaluator-optimizer is a bounded loop with an explicit cap, in code or in a loop node.** Retry counts are declared at the loop (`max_iterations`, `iterationCount`, `MAX_FIX_ROUNDS`) or at the job (Argo `retryStrategy`, Step Functions `Retry`), and human approval is a _pause with a resume token_, not a job type.
- **Run identity is a platform-generated id, separate from the user-chosen business id, plus a per-run usage object.** Temporal (Run Id vs Workflow Id), LangGraph (`thread_id`), Step Functions (Map Run ARN), OpenAI Agents SDK (`usage` per run), Claude Code (`/workflows` agent and token view).
- **Naming.** "Context engineering" (June 2025) and "harness engineering" (Feb 2026) have identifiable origins and working definitions. "Graph engineering" (popularised July 2026) and "workflow engineering" are loosely defined and lack a canonical primary source.

## 1. Agent frameworks

### Anthropic: "Building effective agents" (2024-12-19)

[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

- Splits "agentic systems" into **workflows**, "systems where LLMs and tools are orchestrated through predefined code paths", and **agents**, "systems where LLMs dynamically direct their own processes and tool usage."
- **Orchestrator-workers**: "A central LLM dynamically breaks down tasks, delegates them to worker LLMs, and synthesizes their results." It resembles parallelization but "subtasks aren't pre-defined, but determined by the orchestrator based on the specific input." This is the description of your `spec` -> `implement` shape: the subtask list is decided by an upstream step.
- **Evaluator-optimizer**: "One LLM call generates a response while another provides evaluation and feedback in a loop." Fits when evaluation criteria are clear.
- **Parallelization** has two forms, sectioning (independent pieces) and voting (same task repeated).
- Pattern descriptions only; no declarative format. The guide treats the patterns as code.

### Anthropic: multi-agent research system

[How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

- Orchestrator-worker: a lead agent plans, spawns subagents, then a separate citation agent attributes claims. Each subagent gets "an objective, an output format, guidance on the tools and sources to use, and clear task boundaries."
- **Effort scaling is stated in the prompt, not in a graph**: 1 agent for simple fact-finding, 2-4 subagents for comparisons, more than 10 for complex research. Early versions made the mistake of "spawning 50 subagents for simple queries."
- Subagents "store their work in external systems, then pass lightweight references back." This is your staging-file handoff.
- Cost: "multi-agent systems use about 15x more tokens than chats." Resumability: "restarts are expensive", so they combine the model with "deterministic safeguards like retry logic and regular checkpoints."
- Limitation reported: subagents run synchronously, "the lead agent can't steer subagents, subagents can't coordinate." That matches the absence of intra-fan-out dependencies.

### Claude Code subagents

[Create custom subagents](https://code.claude.com/docs/en/sub-agents)

- **Declarative single agents**: Markdown with YAML frontmatter (`name`, `description`, `tools`, `model`, `maxTurns`, `skills`, `isolation: worktree`, `background`, and more). The body is the system prompt. No pipeline is declared; the parent session decides turn by turn.
- Parallel spawn, chaining ("each subagent completes its task and returns results to Claude, which then passes relevant context to the next"), nesting up to 3 layers by default, concurrency cap of 20 running subagents, no total cap per session.
- Each invocation is a new instance, with an **agent ID** returned on completion; resume with `SendMessage`. Transcripts persist per agent under the session directory.
- Subagents receive their system prompt, the task message, CLAUDE.md and preloaded skills, not the conversation history. Results return as a summary.
- `maxTurns` is the built-in cap; output is marked partial when hit.

### Claude Code dynamic workflows (research preview)

[Orchestrate subagents at scale with dynamic workflows](https://code.claude.com/docs/en/workflows)

This is the closest first-party analogue of your orchestrator, and it chose **code, not YAML**.

- A workflow is "a JavaScript script that orchestrates many subagents at once". The script, not Claude, "holds the loop, the branching, and the intermediate results." The doc's comparison table states who holds the plan: with subagents, skills and agent teams "Claude, turn by turn"; with workflows "the script."
- **Dynamic fan-out is a map over a value returned by an earlier agent.** The doc's own example: one `agent()` call with a JSON `schema` lists files, then `pipeline(found.files, file => agent(...))` runs one agent per item. `parallel()` runs a fixed set. Limits: 4,096 items per `parallel()`/`pipeline()`, 1,000 agents per run, 16 concurrent agents by default (configurable 1-256).
- **Structured output as the list contract.** `schema` on `agent()` forces JSON matching the shape; validation is retried up to five times (`MAX_STRUCTURED_OUTPUT_RETRIES`). This is the "upstream writes a list file" idea with a validated schema.
- **Failure inside a fan-out yields `null`** in the results array, kept in place, so the script must filter. Directly awaited failures end the run.
- **Resume replays by call order.** Completed agents return saved results; the first agent whose prompt differs, or a failed one, reruns along with every agent after it, "even ones that completed". Timestamps and randomness throw inside the script so a relaunch repeats the same calls.
- **Human gates are not supported mid-run**: "No mid-run user input ... For sign-off between stages, run each stage as its own workflow." A run pauses only for permission prompts and usage limits.
- **Metrics**: `/workflows` shows each phase's agent count, token total and elapsed time, and each agent's prompt, tool calls, result, token usage and retry attempts (`attempt 2 (stalled)`). Stalled agents restart up to five times. A run can be saved as `.claude/workflows/<name>.js`, with a `meta` block (name, description, phases) and `args` input.
- Evaluator-optimizer examples are code loops: "keep fixing until a check passes ... or two rounds in a row make no progress."

### LangGraph

[Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api), [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)

- **Code**: `StateGraph` parameterised by a state schema; `add_node`, `add_edge`, `add_conditional_edges`, then `.compile()`, which "provides a few basic checks on the structure of your graph (no orphaned nodes, etc)". Edges are static unless conditional.
- **Dynamic fan-out = the `Send` API.** "The exact edges are not known ahead of time"; "the number of objects may be unknown ahead of time". A conditional edge returns `Send(node_name, state)` objects, one per item: `[Send("generate_joke", {"subject": s}) for s in state['subjects']]`. Each downstream run gets its own state; results merge through a per-key **reducer** (`Annotated[list, add]`).
- **Retry and recursion**: `recursion_limit` caps super-steps (default 1000 since 1.0.6); a `RemainingSteps` managed value lets the graph route to a fallback before hitting it.
- **Human gate**: `interrupt()` pauses; resume with `Command(resume=...)`; needs a checkpointer; `thread_id` is "effectively your persistent cursor." On resume the node reruns from its top, so side effects before the call must be idempotent.

### Google ADK

[Workflow agents](https://adk.dev/agents/workflow-agents/), [Dynamic workflows](https://adk.dev/graphs/dynamic/)

- 1.x **template workflows**: `SequentialAgent`, `ParallelAgent`, `LoopAgent`, "predefined logic ... without consulting an AI model for assistance with the orchestration." The overview describes parallel as running "multiple sub-agents", i.e. a fixed set. `max_iterations` and escalate-to-exit were not on the overview page (sub-pages not read).
- **ADK 2.0 supersedes them** (Python, Go; TypeScript 2.0 GA) with **graph workflows** (`Workflow(name=..., edges=[("START", node)])`, "static process structures") and **dynamic workflows** (plain code).
- **Dynamic fan-out is a loop of futures plus `asyncio.gather`**: `tasks.append(ctx.run_node(real_node, item))` then `await asyncio.gather(*tasks)`. Start children "in a synchronous loop to keep the IDs deterministic across a resume." Built-in alternative: `parallelWorker: true, maxParallelWorkers: 4` (default 8).
- Parent nodes must set `rerun_on_resume=True`; on resume "only failed or interrupted worker nodes are re-executed." Execution IDs are deterministic (parent id plus counter); custom `run_id` allowed but discouraged.
- Loops are `while`/`for` in code with a manual cap (`MAX_FIX_ROUNDS`). Human input: a node yields `RequestInput`; `ctx.run_node` does not throw when a child interrupts, so check `interruptIds`.
- The docs warn graphs can become "too unwieldy to manage" as logic grows, which is why dynamic workflows exist.

### CrewAI Flows

[Flows](https://docs.crewai.com/en/concepts/flows)

- **Code, decorator graph**: `@start()`, `@listen()`, `@router()` (returns a label string), `or_`, `and_`. State is a dict or a Pydantic model with an auto UUID.
- **Dynamic fan-out is not documented on the Flows page.** The only fan-out shown is static: several listeners on one event or several `@start` methods. `kickoff_for_each` appears only in passing. Per-item work would be a loop inside a method; the page does not cover it. (Gap, see below.)
- **Human gate**: `@human_feedback` pauses the flow; with `emit=[...]` an LLM collapses free-form feedback into one of the named outcomes that route to listeners. `@persist` (SQLite default) resumes by id; `restore_from_state_id` forks with a fresh `state.id`.

### Microsoft Agent Framework (successor to AutoGen)

[Workflow concepts](https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/), [Edges](https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/edges), [Declarative workflows](https://learn.microsoft.com/en-us/agent-framework/workflows/declarative), [AutoGen README](https://github.com/microsoft/autogen)

- AutoGen: "now in maintenance mode ... New users should start with Microsoft Agent Framework." (README; no date on the notice.)
- MAF offers two APIs over the same run model: **graph** (`WorkflowBuilder`: typed executors and edges, "best for fixed graphs, fan-out/fan-in") and, in Python, an experimental **functional** API (`@workflow`, native `if`/loops/`asyncio.gather`). "Explicit, inspectable execution paths."
- **Edge types**: direct, conditional, switch-case, fan-out, fan-in, multi-selection. **Multi-selection ("dynamic fan-out")** uses a target-assigner function that returns which of a _fixed_ target set to activate (`AddFanOutEdge(source, targets, targetSelector)`). It chooses among predeclared executors; it does not create N copies for N items. Do not read it as `foreach`.
- Checkpoints at superstep boundaries; human input via `RequestInfoExecutor` (graph) or `ctx.request_info()` (functional).
- **Declarative YAML exists**: `kind: Workflow` with actions including `If`, `ConditionGroup`, `SetVariable` and **`Foreach`** (`source: =Local.items`, `itemName`, `indexName`, `BreakLoop`, `ContinueLoop`). The Foreach source is a runtime variable, so a prior step can fill it. The closest declarative match to your YAML among agent frameworks.

### OpenAI Agents SDK

[Orchestrating multiple agents](https://openai.github.io/openai-agents-python/multi_agent/), [Usage](https://openai.github.io/openai-agents-python/usage/)

- Two approaches: **LLM-driven orchestration** (agents with handoffs, `Agent.as_tool()`) and **orchestrating via code** ("determining the flow of agents via your code ... more deterministic and predictable, in terms of speed, cost and performance").
- Fan-out is plain Python: "Running multiple agents in parallel, e.g. via Python primitives like `asyncio.gather`." Evaluator-optimizer is a `while` loop: a task agent produces output, "an evaluator agent" assesses it, "stop when the evaluator says the output passes the required criteria." No declarative format and no dedicated map primitive.
- **Metrics**: the SDK "automatically tracks token usage for every run" (`result.context_wrapper.usage`: `requests`, `input_tokens`, `output_tokens`, `total_tokens`, cached and reasoning tokens, per-request `request_usage_entries`). Each `Runner.run()` call reports its own usage; `to_state()` snapshots usage so a resumed run continues the count. Tracing ids are on a separate page, not read.

### Mastra workflows

[Control flow](https://mastra.ai/docs/workflows/control-flow)

- **Code**, chained TypeScript: `createWorkflow(...).then().parallel().branch().foreach().dountil().commit()`. The graph is serialisable (`serializedStepGraph`).
- **`.foreach(step, { concurrency })`**: "The input must be of type `array`"; "always returns an array containing the output of each iteration", in input order; default concurrency 1; the next step waits for all iterations. Chaining two `.foreach()` calls produces nested arrays; passing a nested workflow to `.foreach()` "lets each item move through its whole pipeline independently." That is the per-item pipeline shape (implementor, checks, reviewer per ticket).
- `.dountil()` / `.dowhile()`: cap iterations by checking `iterationCount` in the condition and throwing past the limit. `.parallel()` fails entirely if any step throws, so catch inside steps.
- Suspend/resume for human approval is documented on a separate page (not read).

## 2. Classic workflow engines

| Engine                 | Declaration                 | Fan-out primitive                            | Source of the list                                                                                                      | Concurrency / failure knobs                                                                                                |
| ---------------------- | --------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Actions**     | YAML                        | `strategy.matrix`                            | `fromJSON(needs.define-matrix.outputs.colors)`: a prior job writes JSON to `$GITHUB_OUTPUT`                             | `max-parallel`; `fail-fast`; `continue-on-error`                                                                           |
| **Argo Workflows**     | YAML (CRD)                  | `withItems`, `withSequence`, **`withParam`** | `withParam: "{{steps.generate.outputs.result}}"`, a JSON array printed by an earlier step; "only calculated at runtime" | Workflow-level `parallelism` ("max total parallel pods")                                                                   |
| **Airflow**            | Python                      | `.expand()` (dynamic task mapping)           | A task's XCom: "a task generate[s] the list to iterate over" (dict or list)                                             | `max_map_length` (default 1024); `max_active_tis_per_dag`                                                                  |
| **AWS Step Functions** | JSON (ASL)                  | `Map` state, Inline or Distributed           | `ItemsPath` / `Items` on state input, or `ItemReader` over S3 JSON/CSV                                                  | `MaxConcurrency`; `ToleratedFailurePercentage` / `Count`; `Retry`, `Catch`                                                 |
| **Temporal**           | Code (Go, Java, TS, Python) | Child Workflows or Activities in a loop      | Any value in workflow code                                                                                              | Doc advice: "a single Parent should not spawn more than 1,000 Child Workflow Executions"; "When in doubt, use an Activity" |
| **Dagster**            | Python                      | `DynamicOut` + `.map()` + `.collect()`       | Op yields `DynamicOutput(value, mapping_key=...)`                                                                       | Downstream ops "cloned for each dynamic output"; `.collect()` is the fan-in                                                |

Details and caveats:

- **GitHub Actions** [Matrix](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs): the dynamic matrix is the canonical "upstream job emits a list, downstream job points at it" pattern. The string output is turned back into an array by `fromJSON`. A `needs` entry is mandatory.
- **Argo** [Loops](https://argo-workflows.readthedocs.io/en/latest/walk-through/loops/): aggregated loop output is available afterwards as a JSON array; each iteration's output "must be valid JSON." The Loops page names no parallelism cap; `parallelism` is a Workflow field ([field reference](https://argo-workflows.readthedocs.io/en/latest/fields/)).
- **Airflow** [Dynamic task mapping](https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/dynamic-task-mapping.html): `partial()` holds constants, `expand()` the varying arguments. An empty list marks the mapped task `SKIPPED` and creates no instances. A reduce task receives a lazy sequence. `expand_kwargs` maps several arguments per instance. Zero-item behaviour matters for your `foreach` too: decide whether an empty list is "skipped" or an error.
- **Step Functions** [Map](https://docs.aws.amazon.com/step-functions/latest/dg/state-map.html), [Distributed Map](https://docs.aws.amazon.com/step-functions/latest/dg/state-map-distributed.html): Inline mode takes only a JSON array from the previous step, up to 40 concurrent iterations, within a 256 KiB payload and 25,000 history entries. Distributed mode runs each iteration as a **child workflow execution with its own history**, up to 10,000 in parallel, and creates a **Map Run** resource with its own ARN, `DescribeMapRun` and CloudWatch metrics. That is the "black-box job that fans out internally", made observable by a first-class run id.
- **Temporal** [Workflows](https://docs.temporal.io/workflows), [Child workflows](https://docs.temporal.io/child-workflows), [Workflow Id and Run Id](https://docs.temporal.io/workflow-execution/workflowid-runid): the definition is "the code that defines your Workflow"; replay requires determinism; completed Activity results are "reused, not recomputed" on replay. Children keep their own Event History, so they "partition large workloads into smaller chunks." The docs warn against using Child Workflows just to organise code.
- **Dagster** [Dynamic graphs](https://dagster.io/docs/guides/build/ops/dynamic-graphs): the `.map()` callable "runs only once, when the graph is built" and ops are cloned per `mapping_key`; a dynamic output "can not be passed directly to another op. Either `map` or `collect` must be invoked on it." The docs steer new users toward assets over ops.

Across all six the **list is typed data** (JSON array, XCom, `DynamicOutput`), items are independent, there is a size cap, and the empty-list and partial-failure behaviours are declared explicitly.

## 3. Cross-cutting comparison

| System                | Graph                        | Declared in          | Dynamic fan-out primitive                                         | Loop cap                      | Human gate                        |
| --------------------- | ---------------------------- | -------------------- | ----------------------------------------------------------------- | ----------------------------- | --------------------------------- |
| Claude Code workflows | Dynamic (script)             | JS code              | `pipeline(list, fn)`, `parallel()`                                | Code loops; 1,000 agents/run  | None mid-run; split into stages   |
| LangGraph             | Static + runtime edges       | Python/JS code       | `Send` from conditional edge + reducer                            | `recursion_limit`             | `interrupt()` + `Command(resume)` |
| Google ADK 2.0        | Static graph or dynamic code | Code                 | `run_node` futures + `gather`; `parallelWorker`                   | Manual in code                | `RequestInput`                    |
| CrewAI Flows          | Static decorators            | Python code          | Not documented                                                    | Not documented                | `@human_feedback`                 |
| MS Agent Framework    | Static graph; functional     | Code; YAML (preview) | YAML `Foreach`; code loops; fan-out edges select from a fixed set | Not read                      | `RequestInfoExecutor`             |
| OpenAI Agents SDK     | Dynamic (code)               | Python code          | `asyncio.gather`                                                  | `while` loop                  | Not read                          |
| Mastra                | Static chain                 | TS code              | `.foreach(step, {concurrency})`                                   | `.dountil` + `iterationCount` | Suspend/resume                    |
| GitHub Actions        | Static + matrix              | YAML                 | `matrix` from `fromJSON(needs.x.outputs.y)`                       | n/a                           | Environment approval (not read)   |
| Argo                  | Static + loop                | YAML                 | `withParam` from step output                                      | `retryStrategy`               | Suspend template (not read)       |
| Airflow               | Static + mapped              | Python               | `.expand()` over XCom                                             | `max_map_length`              | Not read                          |
| Step Functions        | Static + Map                 | JSON                 | `Map` + `ItemsPath`/`ItemReader`                                  | `Retry`, tolerated failures   | Task token (not read)             |
| Temporal              | Dynamic (code)               | Code                 | Child workflows / activities in a loop                            | Retry policy (not read)       | Signals (not read)                |
| Dagster               | Static + dynamic out         | Python               | `DynamicOut` + `.map()`                                           | n/a                           | n/a                               |

"Not read" marks a feature I did not fetch a primary source for; treat as unknown, not absent.

## 4. The four terms

### Context engineering

- **Origin and popularisation**: June 2025. Tobi Lutke (Shopify CEO) preferred the term to "prompt engineering" on 2025-06-18 and Andrej Karpathy endorsed it days later, calling it "the delicate art and science of filling the context window with just the right information for the next step" **[S]**. The primary tweets could not be fetched (X returned 402).
- **Primary definition**: Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (2025-09-29): "the set of strategies for curating and maintaining the optimal set of tokens (information) during LLM inference," including "all the other information that may land there outside of the prompts" (tools, MCP, external data, message history). "The natural progression of prompt engineering"; "iterative and the curation phase happens each time we decide what to pass to the model." Core question: "what configuration of context is most likely to generate our model's desired behavior?"
- **Status**: well defined. Variants group it differently (LangChain's write/select/compress/isolate **[S]**), but they agree on scope: what goes into the model's window per call.

### Harness engineering

- **Coiner**: Mitchell Hashimoto, [My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey), 2026-02-05, "Step 5: Engineer the Harness": he has "grown to calling this 'harness engineering'." Definition: whenever an agent errs, "you take the time to engineer a solution such that the agent never makes that mistake again." He says he is open to adopting an existing term.
- **Popularised**: Ryan Lopopolo (OpenAI), "Harness engineering: leveraging Codex in an agent-first world", 2026-02-11, `openai.com/index/harness-engineering/` (fetch returned 403, so date, author and content are **[S]** via search and InfoQ). Three engineers, about 1,500 PRs, zero hand-written code, "Humans steer. Agents execute." Lopopolo later said he was "kind of having invented the term" (AI Native DevCon, June 2026 **[S]**); credit is contested, with Hashimoto's post earlier by about a week.
- **Working definitions**: Lopopolo's repo: "the practice of improving agent output by shaping the environment around it", holding model and agent constant as a black box, improving context and tools ([github.com/lopopolo/harness-engineering](https://github.com/lopopolo/harness-engineering) **[S]**, as quoted in search). Hashimoto's is narrower: permanent fixes after each failure.
- **Related primary**: Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (2025-11-26, Justin Young). It says "harness" and "agent harness" but never defines it and never says "harness engineering". Pattern: an initializer agent creates `init.sh`, a progress file, a git commit and a **JSON feature list** (`passes: false`, coding agents may only flip `passes`); each coding session does one feature and leaves structured notes. JSON was chosen because the model is less prone to alter it than Markdown. Relevant to your list-file design.
- **Status**: the term predates the field's agreement on what it covers. It spans repo structure, linters, instruction files, tools and feedback loops. Academic use is emerging (arXiv 2603.25723 "Natural-Language Agent Harnesses" and others, surfaced by search only, not read).

### Graph engineering

- **Earliest roots**: "flow engineering": Ridnik, Kredo, Friedman, [AlphaCodium](https://arxiv.org/abs/2401.08500), arXiv 2024-01-16, title "Code Generation with AlphaCodium: From Prompt Engineering to Flow Engineering", "a test-based, multi-stage, code-oriented iterative flow." DataCamp credits Friedman with the "flow (/graph) engineering" phrasing in February 2024 **[S]**; I did not locate the original post.
- **Popularised**: July 2026 on X, per [DataCamp](https://www.datacamp.com/tutorial/graph-engineering-guide) (2026-09-24) **[S]**: a ladder "prompt, context, harness, loop, graph" (Mike Masson), then Peter Steinberger's 2026-07-18 post (3.1M views). Harrison Chase asked if it is "basically just langgraph?" I could not fetch these posts.
- **Working definition** (DataCamp **[S]**): "making an agent system's control flow explicit in code rather than leaving it to the model's judgment": nodes do work, edges route, shared state carries data; the model reasons "inside one node instead of across the whole job." DataCamp's default advice: use a loop; use a graph only for real specialisation, parallelism or independent verification.
- **Status**: **loosely defined and no primary source**. Several write-ups say it renames what LangGraph, ADK and AutoGen already did. Another reading adds self-rewriting agent organisations (explainx **[S]**) or knowledge-graph memory (Flowtivity **[S]**). Treat as a label for "explicit static control flow", not a specification.

### Workflow engineering

- **Closest primary use**: LlamaIndex, [Context Engineering guide](https://www.llamaindex.ai/blog/context-engineering-what-it-is-and-techniques-to-consider) (2025-07-03, Tuana Celik and Logan Markewich): "workflow engineering takes a step back to ask: what sequence of LLM calls and non-LLM steps do we need to reliably complete this work?" Workflows "prevent context overload" by giving each step its own context window. It promotes LlamaIndex Workflows (event-driven).
- **Adjacent**: Andrew Ng's "agentic workflows" (March 2024: reflection, tool use, planning, multi-agent collaboration) is the ancestor concept; Ng did not use "workflow engineering" in anything I found **[S]**.
- **Status**: **no single coiner found; loosely defined.** The LlamaIndex sentence is the only definition from a vendor's own page. Anthropic's workflow/agent split (predefined code paths versus LLM-directed) is the more authoritative framing of the same idea, without the label.

How the four relate (my synthesis, not a source claim): context engineering is the unit of one model call; harness engineering is the environment around one agent; workflow or graph engineering is the control flow between agents. Your pipeline.yml sits in the last layer, and each `agents` entry's `skills` and `references` sit in the first.

## 5. Mapping onto the four design questions

### Q1. Fan-out over a list that does not exist until an upstream job runs

**Dominant pattern: upstream output is a typed list, and the fan-out names it. Not a live query, not a black box.**

- File or structured output the downstream step reads: GitHub Actions (`fromJSON(needs.job.outputs.x)`), Argo (`withParam: {{steps.generate.outputs.result}}`), Airflow (`expand` over XCom, with `max_map_length`), Claude Code workflows (`agent(..., {schema})` then `pipeline(found.files, ...)`), MS Agent Framework YAML (`Foreach source: =Local.items`).
- In-memory value from an upstream node, same idea in code: LangGraph (`Send` per item), Mastra (`.foreach`), Google ADK 2.0 (`run_node` plus `gather`).
- Black-box internal fan-out is the second pattern, used for scale and isolation, not for declaring dependencies: Step Functions Distributed Map, Temporal child workflows. Both give the inner run its own id and history. It only suits you if you accept that the orchestrator cannot see per-ticket agents.
- Querying a live source as the primary primitive: no system found. Step Functions' `ItemReader` reads a stored dataset, which is a snapshot.
- What your design should copy from them: declare the list's schema, a size cap (Airflow 1024, Claude Code 4,096, Step Functions payload 256 KiB), the empty-list rule (Airflow marks the mapped task `SKIPPED`) and the failure policy (Step Functions tolerated failures, Claude Code `null` per failed item). A list file with a schema matches Anthropic's JSON feature list.

### Q2. Dependencies between items of one fan-out (scaffold ticket blocks the others)

**Dominant pattern: no per-item dependencies; lift ordering into stages. Inferred from absence.**

- Fixed stage before the map: Argo, Airflow, GitHub Actions (a `needs` job before the matrix), Claude Code workflows (a first `agent()` call, then `pipeline`).
- Two-pass maps (first item or group, then the rest): expressible in Mastra (`.foreach` twice or a nested workflow), Dagster (`.map().map()`), Claude Code (two `pipeline()` calls in sequence).
- Per-item sub-pipeline: Mastra nested workflow, Step Functions Distributed Map child execution, Temporal child workflow. The body has internal order; items remain independent.
- Anthropic's research system reports that subagents "can't coordinate", consistent with independent items.
- For your scaffold ticket: make `scaffold` its own job with `needs` before `implement`. If the ticket set is only known after `spec`, split `spec` output into `scaffold.md` and `rest-list`.

### Q3. Implementor, checks, fresh reviewer, retries, human gates

**Dominant pattern: a bounded loop with the cap declared at the loop; human approval as pause and resume.**

- Evaluator-optimizer as a code loop with an iteration cap: OpenAI Agents SDK (`while` with evaluator approval), Google ADK 2.0 (loop with `MAX_FIX_ROUNDS`), Claude Code workflows ("until it passes or two rounds make no progress"), Mastra (`.dountil` plus `iterationCount`). Anthropic describes the pattern but declares nothing.
- Declarative retry on the job: Step Functions (`Retry`, `Catch`, thresholds), Argo (`retryStrategy`). These retry failed _tasks_, not a reviewer verdict. A reviewer fail is a business outcome and needs a loop.
- Human gate as pause plus resume token: LangGraph (`interrupt()`, `Command(resume)`, `thread_id`), CrewAI (`@human_feedback`), ADK (`RequestInput`), MS Agent Framework (`RequestInfoExecutor`). Claude Code workflows deliberately have none mid-run; split into separate runs at each gate, which is how your `gate: human` already behaves.
- Fresh reviewer: Claude Code subagents start with a clean context by design (system prompt plus task message only); Anthropic's workflow docs mention independent agents adversarially reviewing each other's findings.

### Q4. Run identity and per-agent-run metrics

**Dominant pattern: a platform-generated run id distinct from the business id, one record per agent run, usage as a counter on that record.**

- Run id versus business id: Temporal (Run Id "globally unique, platform-level" versus a customisable Workflow Id; a new Run Id on Continue-As-New or retry; do not branch logic on it), LangGraph (`thread_id` as the cursor), CrewAI (auto UUID in state; `restore_from_state_id` forks to a new id), Step Functions (Map Run ARN, optional `Label`), ADK (deterministic ids from parent id plus counter).
- Per-agent metrics: OpenAI Agents SDK (`usage` per run with `requests`, input, output, cached and reasoning tokens, `request_usage_entries` per call), Claude Code (agent ID on subagent completion, and `/workflows` showing per-agent token use, attempt number and phase counts), Step Functions (CloudWatch metrics per Map Run).
- Attempts: Claude Code shows `attempt N (stalled)` and caps restarts at five; Temporal creates a new Run Id per retry within a chain.
- Take for your design: one run id for the pipeline, an attempt counter and an agent id per agent run, and token counts kept per attempt (a Claude Code stalled attempt's tokens "stay in the run's total").

## Gaps and caveats

- **Not read first-hand**: OpenAI's `harness-engineering` post (HTTP 403; date, author and content via search excerpts and InfoQ), Karpathy's and Lutke's original posts (X blocked), and the Peter Steinberger and Mike Masson posts behind the "graph engineering" timeline. The AlphaCodium abstract was read; Friedman's February 2024 "flow (/graph) engineering" phrasing is DataCamp's claim.
- **Not documented or not found**: CrewAI `kickoff_for_each` semantics (the Flows page does not describe them); ADK `max_iterations` and escape-from-loop (sub-pages not read); Mastra suspend/resume, GitHub Actions environment approvals, Argo suspend, Step Functions task tokens, Airflow human approval (pages not read, shown as "not read").
- **Unverified numbers**: GitHub Actions' 256-job matrix limit (page fetch was truncated before the `strategy` section; I did not confirm it), Temporal's 51,200-event history limit (the page I read gives no figure), Argo `failFast` and `retryStrategy` sub-fields (field reference truncated).
- **Claim of absence**: "no system has intra-fan-out dependencies" is inferred from the documented shapes, not from a statement in any doc. Argo and Airflow DAGs can express item-level graphs by other means that I did not test.
- **Moving targets**: Claude Code dynamic workflows are a research preview and the docs mention behaviour changing by version (for example the subagent depth default changed three times). ADK 2.0 and MAF declarative workflows are recent; MAF's declarative page is dated 2026-10-01.
- **Search-sourced terms**: "graph engineering" and "workflow engineering" have no canonical definition; do not cite either as a standard.
