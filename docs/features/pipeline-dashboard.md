---
type: feature-guide
title: Pipeline dashboard
stale_after: 2027-01-14T00:00:00Z
---

# Pipeline dashboard

`/dashboard` is a read-only operations view of one local Episode's `pipeline.yml`
and `events.jsonl`. Its picker needs Chrome or Edge with the File System Access
API on a secure origin (HTTPS or localhost). Folder selection is a user gesture;
the page asks for read access only. Cancelling the picker is not an error.

## Local access

Choose `docs/episodes/<slug>`. A folder without a readable, valid `pipeline.yml`
is refused with the file name and the reason. Missing `events.jsonl` is a visible
waiting-for-file condition; polling can discover it when the writer creates it.
Permission failures, malformed YAML, invalid UTF-8 and malformed log lines are
visible. An error marks the view as potentially stale; valid lines remain visible.

Folder handles, parsed configuration, byte buffers, folded spans and errors live
only in page memory. Reloading returns to the picker. The dashboard writes no
files, stores no handles and uploads no local data. An output a Job writes opens
read-only in a new tab as plain text, from an object URL revoked after a minute. It does not approve Gates.
Log text is rendered as text, not HTML. Transcript paths and agent input messages
stay out of the graph and cards. Expanding **Raw JSON** in the local log modal can
reveal them; no external transcript is opened and nothing is uploaded.

## Graph and disclosure

The operations header is one line: Dashboard, the selected folder and Choose
folder. Marketing navigation is hidden on this page. Motion follows
`prefers-reduced-motion` automatically; there is no manual pause control.

The overview groups Jobs into stages without changing the pipeline. A pipeline
with a top-level `stages:` list sets the stages and their order; each Job sits in
the stage its `stage:` names. A listed stage without Jobs yet (Research or Build
before `customize-pipeline` expands them) shows as **Not planned yet** with a
dashed node. An unexpanded `foreach` template Job in a draft scaffold shows as a
dashed placeholder, "One Job per item in <heading>", and does not count as planned
work. A Job naming a stage the list lacks gets its own stage after the listed ones.
Known stage ids have translated names; an unknown id is title-cased.

A Run scaffolded before stages existed lists no `stages:`. The dashboard still
reads it and falls back to a fixed grouping:

| Stage         | Jobs                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Brief         | `brief-grill`                                                                                       |
| Setup         | `scaffold-pipeline`, `categorize-research`, `retrieval`, `convert-references`, `customize-pipeline` |
| Research      | every `write-research-*`                                                                            |
| Dossier       | `write-dossier`, `write-voice-script`                                                               |
| Specification | `write-spec`, `write-design-spec`                                                                   |
| Build         | `implement-episode`, `implement-episode-init`, every `implement-section-*`                          |
| PR            | `open-pr`                                                                                           |

Unrecognized Jobs remain visible as their own stage. The graph reads left to
right at every width, scrolling inside its own container on narrow screens.
The summary counts successful/reused stages,
not elapsed time. A stage is complete only when all its Jobs are successful or
reused, with no open Gate. Attention is counted separately from active work, so
a failed optional research Job remains visible when the Dossier proceeds.

**Show Jobs** is a switch beside Live, off by default. On, stages remain on a
vertically centred spine. Dependency layers follow left to right within each
stage gap; parallel Jobs branch evenly above and below the spine. Each Job's
configured agents are consecutive nodes, in pipeline order. The final stage's
branch folds back into its terminal node. Longer stages widen the shared canvas
instead of shrinking pointer targets or overflowing the page.

Job cards are gone from the overview. Hover or keyboard-focus an agent node for
a speech bubble with status, elapsed time, skills, checks and available preview.
Escape dismisses the bubble without removing focus. Clicking a node or bubble
selects its Job's evidence. State icons accompany colours. Branch strokes fill
according to observed Job times at the replay cutoff; stage positions have a
light snap zone (at most 0.8% of the rail). The switch is transient page memory
(FE-001), and all motion respects reduced motion.

Selecting a node reveals dependency levels and parallel Job lanes. Expanding a
Job reveals observed ticket/session lanes and the existing evidence cards.
Ticket identity comes from an explicit `ticket` or a matching structured spawn
description. Unidentified sessions stay unassigned; the dashboard does not
invent ticket totals. The spawn-label parser is shared with the adapter; adapter
behavior is unchanged. Role retries remain inspectable instead of being erased.
An agent without an end record whose Job or parent Attempt has ended is labelled
`unclosed`, not running. This is a display distinction: it does not invent a
successful finish, a duration, or alter the shared fold's raw history.

The initial active stage opens automatically. Later polls do not move selection,
collapse evidence, or steal focus. Running nodes pulse, completed connectors are
green, and icons/text distinguish attention and failure. Animation respects reduced motion; replay and source errors pause it.

**View events** opens a large native modal, scoped to a stage, Job, or ticket.
**All Run events** includes malformed records with their source line numbers.
Original records are retained during the incremental read, not read again for
the modal. Readable events follow timestamp/sequence order; raw source lines,
including repeated ends and Scores, remain available. Following new events is
explicitly opt-in; scrolling away pauses it. Escape and the close button return
focus to the trigger. The browser's modal makes the background inert.
React's development effect replay may close and reopen the native dialog; a
queued close notification only dismisses a dialog that is still closed.

## Time travel

The progress bar **is** the scrubber, aligned with the first and last stage
centres. **Live**, beside **Show Jobs**, follows the latest read at the right
edge. Dragging or clicking left unchecks Live; reaching the far right or pressing
End rechecks it. Unchecking Live freezes the latest moment while polling
continues. Arrow keys move one minute, Page Up/Down ten; Home selects Run start.
The accessible readout and drag bubble give minutes since start and local time.
Start time is below the left end; total observed duration is below the right.

`scrubTimeline()`, `scrubPosition()` and `scrubTime()` map time to structure:
each stage gap has equal width, each Job an equal share within that gap.
Parallel Jobs contribute their individual elapsed fractions together; a long
Job gets no extra width. Knots come from observed Job starts/ends and the Run
bounds, never estimated durations. Open Jobs use the latest read as their
observed endpoint. Idle plateaus select the latest observation at that position;
the first point remains Run start. The last stage shares the terminal point
(there is no gap after PR); minute keys can still inspect it. The rightmost
point always means the latest event/read, even with unstarted stages.

Replay logs nothing new and never reads the file again. `replayDashboard()`
feeds the retained events stamped no later than the cutoff through the shared
fold with `live: 'unfinished'` and the live projection, so a Run that had not
ended at the cutoff reads its open spans as running. Ties at the cutoff are all
included; the fold orders them by sequence. The event log modal shows the same
events, `eventsAt()`. Polling continues while scrubbing and extends the slider,
but the view stays at the cutoff and its animation pauses; turning Live back on
shows the current state. The checkbox and cutoff are transient page memory
(FE-001).

Job boxes, Job and Attempt summaries, agent chips and evidence metrics show how
long each span took: its measured duration once ended, otherwise the time so far
from its start to the cutoff, or to the last read while live; never a clock read
at render. A span open without running (crashed, or an agent unclosed under an
ended Job) shows no time. While replaying, a Job not started by the cutoff lists
no outputs, and previews follow the replayed state; outputs still open as they
are on disk now, which the slider says once.

## Outputs, previews and attention

A Job's card lists its `outputs`. After every poll the dashboard probes each one
through the chosen folder's handle: it strips the staging prefix
`docs/episodes/<slug>/`, `<slug>` the folder's name, and walks the sub-folders.
A written output is a button that opens the file as plain text in a new tab; one
not on disk yet reads **not written yet** and is disabled, not an error. A glob
output of a draft is shown as text. A path outside the folder is never opened.

A Build Job with a `port` (design-ADR-0008, Ports) shows **Preview :<port>**
in its card and in its Job box, a button opening `http://localhost:<port>` in a
new tab, while its server is meant to run: `implement-episode-init`'s once it
has started, a Section Job's only while the Job is open, since the orchestrator
stops that server before removing its worktree. It is a button, not a link,
because FE-003 admits no `http:` href; it does not check that `next dev` answers.

A Job waiting on Han, ended `error`, `refused` or `crashed`, or whose latest
Attempt holds a `needs-human` rubric Score carries an exclamation mark in its Job box and its card, labelled **Needs attention** for
screen readers and on hover, beside its state in words.

## Skills and checks

Every Job popover lists a chip for each skill its agents' `skills`
name (once each) and each check its `checks` name; the card groups the skills by
agent type. A chip is bordered and grey while pending, green with a check mark
once run or passed, red with a cross once skipped or failed; its state is in
words for screen readers and on hover. It reads only the Job's current Run and
latest Attempt, so a retry starts its chips over, and the replay cutoff applies.

Each agent row of the card holds its own state: a skill is run when a `skill`
line (design-ADR-0009) or a `skills_invoked` names it on a span answering to
that agent, an agent span by role or, for an orchestrator-session agent only,
the Job span; skipped once each such span ended with `skills_invoked` known and
without it; an unknown `skills_invoked` keeps it pending. On the Job span only
`skill` lines from the latest Attempt's start count, and its `skills_invoked`
only while the Run has one Attempt. The Job box shows each skill once: green
when every agent listing it ran it, red when any skipped it. A check reads its
latest `check:<name>` Score: `pass` or `fail`. `jobChips()` in
`src/lib/dashboard-chips.pure.ts` computes both for the projection; the
pipeline's `checks` reach it through `jobOf()`.

## Reading and interpretation

Polling runs about every two seconds after each completed read, never overlapping.
Each poll obtains fresh files. `pipeline.yml` is parsed only when `lastModified`
changes, including when its contents are invalid. The reader calls
`events.jsonl.slice(offset)` only for appended bytes. Its offset includes bytes
buffered in a partial line; complete newline-terminated lines alone reach the
parser, so partial UTF-8 and JSONL survive appends.

A file smaller than the offset resets byte state, line numbers, errors and the
incremental fold, including a file that shrinks to empty. An append-only file
replaced by an equal-sized or larger unrelated file cannot be detected by size;
choose the folder again in that case. The footer reports bytes read and complete
lines, including malformed lines.

The shared `createLogFold()` in `skills/new-episode/scripts/run-log-fold.pure.ts`
owns both batch and incremental span semantics. `live: 'unfinished'` treats open
spans as running only while their own trace's Run has no end. Chronological order
is timestamp then sequence; the latest end supplies the terminal state. The
batch fold's default remains crashed for open spans.
Attribute-only `attrs` records update evidence without closing or reopening a
Span; `skill` records join their Span's `skills`. Measured end times can precede their stamped start records; those ends
still pair with their Span rather than being reported as orphaned.

Every configured Job appears in topological `needs` order. `wants` are labelled
non-blocking dependencies separately. Raw terminal states stay visible;
Attempts retain retry links, and failed or `needs-human` rubric Scores retain
their text. Measured durations and input, output and cache-read token counts come
from the log; missing measurements are labelled, not fabricated.

An open Gate is prominently labelled **Waiting on Han**. Closing a Gate removes
that notice; a Gate without an end in a finished Run is crashed, not waiting.
Agents attach by their `job` or parent ancestry, including `role: skill-spawned`
agents directly under a Job. A spawn description labels an agent when present.

## English-only route and metadata

Han's approved FE-008 exception permits English-only operational pages:
`PageRef` includes `dashboard`, and `pageLocales('dashboard')` contains only `en`.
`pageMetadata('dashboard', 'en')` supplies `noindex`, an English canonical, and
only `en` and `x-default` alternates. There is no `/de/dashboard` export.

Dashboard navigation appears in the English header only. The dashboard's locale
toggle offers English only, so it cannot emit a nonexistent German counterpart.
German Translation keys remain typed alongside the site's English source.
The shared post-build route walk checks the dashboard as an English-only page,
and every emitted alternate must resolve and link back.

## Public test seams

- `createLogStream().append(bytes, fileSize)` and `.offset`: complete-line byte
  splitting, partial UTF-8, empty appends and truncation.
- `createLogFold().append(lines)` and `.snapshot()`, plus `projectDashboard()`:
  shared spans, retries, Run liveness, Gates, Scores and Job-parented agents.
- `createEpisodeReader(folder).poll()`: structural read-only file handles, fresh
  files, offsets, pipeline modification times and visible source errors.
- Built output: the English-only route, metadata, header and picker markup.
- `projectStages(jobs, stages)`, `stageTitle()`, `stageLayers()` and `jobLanes()`:
  stage order and membership from the pipeline, not-planned stages, template
  placeholders, the legacy fallback, stage progress, attention, parallel
  dependency levels and ticket/session identity.
- `outputSegments()`, `outputLabel()`, `isGlob()`, `previewPort()` and
  `previewHref()`: an output's path in the chosen folder, its label, whether it
  is a pattern, and when and where a Job's preview shows.
- `jobNeedsAttention()`: the attention mark.
- `replayDashboard()`, `eventsAt()`, `replayBounds()` and `stageMarks()`: the
  view and event log at a cutoff from the retained events, the slider's range
  and its stage tick marks.
- `spanElapsed()` and `agentElapsed()`: a span's duration, or its time so far
  at the moment shown.
- `scrubTimeline()`, `scrubPosition()` and `scrubTime()`: equal structural
  shares, concurrent Jobs, the observed time inverse and terminal bounds.
- `selectEvents()`: scoped, chronological source events, including ends and
  Scores associated through their start Span's ancestry.

The frozen fixture under `tests/fixtures/pipeline-dashboard/` contains exact
snapshots of the approved `never-too-early-sales-run-2` files. It carries private
absolute transcript paths; live-state screenshots must not be published. Picker
permissions and pixel layout are outside the unit-test seams.
