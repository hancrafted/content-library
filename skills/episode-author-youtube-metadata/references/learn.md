# Learn from an edit on YouTube

Han changed a description or pinned comment in YouTube Studio. His edits are the signal of what the copy should have been, so each one comes back into the repo and, where it generalises, becomes a rule. The repo stays the source (design-ADR 0020): YouTube is read, never trusted as a second copy.

## Steps

### 1. Pull

Run `npm run youtube:pull -- <episode>`. It writes nothing and prints a word diff per part, `[-repo-]` against `{+YouTube+}`, with a verdict:

- **edited on YouTube**: Han's edit, the input for this branch.
- **changed in the repo, not yet applied**: no edit; stop, apply instead.
- **side unknown** (no applied fingerprint stored yet): ask Han which lines he changed.

_Done when_ every changed line is listed as added, cut, reworded or reordered.

### 2. Take the edit in

Write Han's edits into `recording/youtube.<lang>.md`, so the repo shows what YouTube shows and the next apply keeps them. Chapter lines are the exception, because `youtube:chapters` regenerates them:

- A moved or added chapter goes into `recording/slide-starts.<lang>.json` (a start, or `extraChapters`).
- A renamed chapter is a Section's first Slide title: propose renaming that Slide's title to Han. An `extraChapters` title is edited in place. A title Han wants on YouTube only stays a difference, named in the PR.

Then run `npm run youtube:chapters -- <episode>` and `npm run youtube:recording -- <episode>`.

_Done when_ `npm run youtube:pull -- <episode>` reports no difference beyond the ones Han chose to keep, and `youtube:recording` reports no violations.

### 3. Propose rules

For each change that would apply to another video, propose one line under "Learned rules" in `references/description.<lang>.md`, ending with the Episode slug in parentheses. A change that also holds in the other language goes into both files. Put the proposals to Han one by one; write only the ones he accepts. A change specific to this video stays in its file and becomes no rule.

_Done when_ Han has answered every proposal.

### 4. Ship

From a branch `chore/youtube-copy-<slug>`, commit the Recording folder and the template change with `/commit`, then open a PR to `main` with `/pr`. After the merge, run `npm run youtube:apply -- <episode>` from `main`: it stores the new fingerprint, which lands with `/commit` and `/pr` like the comment ID. Until it lands, the guard on `main` is off.

_Done when_ the PR is open; give the user its URL.
