// The help text of `npm run episode:run`: printed by run.ts and on any command run-commands.ts cannot read.
export const USAGE = `usage: npm run episode:run -- <slug> <command> ...
  begin-run --model <model> [--harness <h>]        open the Run and the marker (refused while a Run is open)
  end-run [status] [summary]                       close the Run, record orchestrator usage, clear the marker
                                                   (ok refused while a span is open; error|crashed leaves it crashed)
  begin-job <job>                                  open a Job pipeline.yml declares (reused when already open)
  end-job <job> [status] [summary]                 close the Job (refused while its Attempt is open)
  begin-attempt <job>                              open the next Attempt; prints its spawn description
  end-attempt <job> [status] [summary]             close the open Attempt
  open-gate <job> <name>                           open a Gate under the Run
  close-gate <name> [status] [summary]             close the open Gate
  score <target> <name> <value> --source s [--rubric r] [--body b] [--via chat|commit] [--comment c]
                                                   target: <job> (Job), <job>#<n> (Attempt) or gate:<name>
  resume                                           re-open the marker for the current Run in a new session
  archive                                          copy the log to .logs/new-episode/<slug>/<run id>.jsonl
status is ok (default), error, refused, crashed or reused.`;
