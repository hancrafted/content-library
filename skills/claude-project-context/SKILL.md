---
name: claude-project-context
description: Rebuild the folder of documents uploaded to the Claude Desktop project. Use after changing a file listed in `assets/files.md`, or when the user asks which files to re-upload.
---

# Claude project context

The Claude Desktop project holds copies of the documents in [`assets/files.md`](assets/files.md). Voice sessions run on those copies, so a changed document is stale there until re-uploaded.

## Run

`node skills/claude-project-context/scripts/sync.ts` rebuilds `docs/claude-project-context/` from the list: one flat folder of relative symlinks, git-ignored. It removes links the list no longer yields and is safe to rerun. It exits 1 when two listed files share a name or a listed entry matches no file.

The user selects everything in that folder and uploads it. The run is done when the script prints `✔ claude-project-context: N links`.

## Report

End your final report with a line `Re-upload to Claude Desktop:` followed by the path of each changed document that `assets/files.md` lists, or `Re-upload to Claude Desktop: nothing` when none changed.
