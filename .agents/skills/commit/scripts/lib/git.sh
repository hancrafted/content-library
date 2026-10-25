# The gate's only impure surface: everything that asks git a question. Isolated
# here so ../commit-msg reads as orchestration and so each probe can be
# substituted in a test.
#
# Sourced by ../commit-msg. Not executable on its own.

# git_comment_string — what git will treat as a comment when it cleans the
# message up *after* this hook returns. `core.commentString` (git 2.45+) wins
# over `core.commentChar`; unset means `#`.
# Locals are not POSIX, so everything a sourced function keeps is prefixed to
# stay out of the entrypoint's namespace.
git_comment_string() {
  _git_value=$(git config --get core.commentString 2>/dev/null) || _git_value=''
  if [ -z "$_git_value" ]; then
    _git_value=$(git config --get core.commentChar 2>/dev/null) || _git_value=''
  fi
  if [ -z "$_git_value" ]; then
    _git_value='#'
  fi
  printf '%s' "$_git_value"
}

# git_source_values <message-file> — the `Source:` values git itself will expose
# to `git log --format='%(trailers:key=Source,valueonly)'`, one per line.
#
# Handing the raw file to git's own parser is the whole point, and is deliberate
# in two ways. First, a text search cannot tell a real trailer from a line that
# merely looks like one: git recognises trailers only in the final paragraph, so
# a message with prose after `Source:` passes a search and yields nothing to
# `git log`. Second, git's parser already ignores comment lines and truncates at
# the scissors cut line, so pre-processing the file here would only introduce a
# way for the gate and `git log` to disagree.
git_source_values() {
  git interpret-trailers --parse <"$1" 2>/dev/null |
    grep -i '^source:' |
    sed 's/^[^:]*:[[:space:]]*//'
}

# git_merge_in_progress — whether a merge is being concluded right now. Probed
# semantically rather than by matching a message beginning with "Merge", so
# `feat: merge two resolvers` is still judged.
#
# COMMIT_MSG_GATE_MERGE_HEAD overrides the probed path, which is what lets a test
# drive both branches without manufacturing a real conflict.
git_merge_in_progress() {
  if [ -n "${COMMIT_MSG_GATE_MERGE_HEAD-}" ]; then
    [ -e "$COMMIT_MSG_GATE_MERGE_HEAD" ]
    return $?
  fi
  _git_merge_head=$(git rev-parse --git-path MERGE_HEAD 2>/dev/null) || return 1
  [ -n "$_git_merge_head" ] && [ -e "$_git_merge_head" ]
}

# git_feeds_values <message-file> — the `Feeds:` values git's trailer parser sees,
# one per line. Same parser as `Source:`, for the same reason.
git_feeds_values() {
  git interpret-trailers --parse <"$1" 2>/dev/null |
    grep -i '^feeds:' |
    sed 's/^[^:]*:[[:space:]]*//'
}

# git_staged_paths — the paths this commit changes, one per line.
git_staged_paths() {
  git diff --cached --name-only --diff-filter=ACMRD 2>/dev/null
}

# git_feeds_globs — the repository's content paths, from `.husky/feeds-paths`
# (one shell glob per line; `*` crosses `/`). No file means the repository has no
# content paths and the `Feeds:` check does not apply.
git_feeds_globs() {
  _git_top=$(git rev-parse --show-toplevel 2>/dev/null) || return 0
  [ -f "$_git_top/.husky/feeds-paths" ] && cat "$_git_top/.husky/feeds-paths"
  return 0
}

# git_path_exists <path> — whether <path> exists in the repository's working tree.
git_path_exists() {
  _git_top=$(git rev-parse --show-toplevel 2>/dev/null) || return 1
  [ -e "$_git_top/$1" ]
}
