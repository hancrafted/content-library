// The help text of `npm run episode:run`: printed by the skill's run.ts and on any command run-commands.ts cannot read.
export const USAGE = `usage: npm run episode:run -- <slug> <command> ...
  begin-run --model <model> [--harness <h>]        open the Run and the marker (refused while a Run is open);
                                                   writes the draft pipeline.yml and starts the dashboard and Spec servers
  end-run [status] [summary]                       close the Run, record orchestrator usage, clear the marker, stop both servers
                                                   (ok refused while a span is open; error|crashed leaves it crashed)
  begin-job <job>                                  open a Job pipeline.yml declares (reused when already open)
  end-job <job> [status] [summary]                 close the Job (refused while its Attempt is open); an orchestrator-session
                                                   Job also records the orchestrator's usage over its span
  reuse <job>                                      count an earlier Run's ok Job as done in this Run: a reused Job span
                                                   linked to it (idempotent; refused with no earlier ok span)
  begin-attempt <job>                              open the next Attempt; prints its spawn description
  end-attempt <job> [status] [summary]             close the open Attempt
  begin-agent <job>#<n>/<role>[/#<ticket>]         open a typed agent span under that Attempt (any harness; repeat is a no-op);
                                                   the Claude Code adapter enriches the same span by name
  end-agent <job>#<n>/<role>[/#<ticket>] [status] [summary]
                                                   close it; a refused spawn is end-agent <desc> refused
  open-gate <job> <name>                           open a Gate under the Run
  close-gate <name> [status] [summary]             close the open Gate
  score <target> <name> <value> --source s [--rubric r] [--body b] [--via chat|commit] [--comment c] [--ticket n]
                                                   target: <job> (Job), <job>#<n> (Attempt) or gate:<name>
  note <job> <type> "<text>"                       record a typed note on the open Job; type is needs-human, blocked,
                                                   research-gap, spine-change or no-library-match
  resume                                           re-open the marker for the current Run in a new session
  archive                                          copy events.jsonl, pipeline.yml, brief.md, spec/spec.html to .logs/new-episode/<slug>/
status is ok (default), error, refused, crashed or reused.`;
