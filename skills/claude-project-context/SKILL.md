---
name: claude-project-context
description: Sync the folders of documents the user uploads to the Claude Desktop project, and propose documents to add to the upload list. Use only when the user asks to sync or refresh the Claude Desktop project context, or what to upload there.
---

# Claude project context

The Claude Desktop project holds copies of the documents in [`assets/files.md`](assets/files.md). Voice sessions run on those copies. The user deletes everything in the Desktop project and uploads one folder whole.

Each folder lives in the main checkout's `docs/claude-project-context/` (git-ignored), whichever worktree you run from, and holds real copies under flat names: `SKILL.md` → `<skill>.md`.

- `main/` comes from `main`'s last commit.
- `<branch-slug>/` (`feat/x` → `feat-x/`) comes from the current branch's last commit. A run on a branch syncs both folders.

Each folder reads `assets/files.md` at its own ref, so uncommitted edits, list edits included, count only after a commit.

## Run

1. Run `node skills/claude-project-context/scripts/sync.ts`. It writes nothing. For each folder it prints the files that are `changed`, `added` and `removed` against the folder's contents, then the files it proposes adding to the list: docs and skills that agent sessions edited or commits touched since the folder's last sync. The folder's own commits only, on a branch.
2. Show the user the report, folder by folder. Weigh each proposal: a doc a voice session plans with (an agent-guide, a feature doc, a skill the user runs) is worth listing; a one-off handoff or research note is not. Say which ones you recommend.
3. Wait for the user's confirmation. If they accept any proposals, add them to `assets/files.md` and commit with `/commit`; on a branch they reach `main/` only once the branch merges.
4. Run the script again with `--apply`. It rewrites each folder and stamps the sync time. The run is done when it prints `✔ N files written` for each folder.

Finish by naming the folder to upload, as a path the user can open in Finder.

## Lifecycle

`npm run wt:done -- <branch>` deletes that branch's folder. If a folder's branch is gone some other way, the script reports it as orphaned; it never deletes a branch folder itself.

The script exits 1 when two listed files flatten to one name, or when a list entry matches no file at the ref.
