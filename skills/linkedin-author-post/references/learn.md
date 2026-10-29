# Learn from a posted version

The user has posted and pasted the final text. Han's edits are the only signal of what sounds like him, so each one becomes an example and, where it generalises, a rule.

## Steps

### 1. Diff the draft against the post

Find the draft in `.scratch/linkedin/` by slug and locale; ask for the URL when it is ambiguous. With no draft on disk (drafted in another session or by hand), diff the post against `voice.md` instead: every place it departs from a rule is a change. List each change: added, cut, reworded, reordered. LinkedIn's `lnkd.in` link rewrite is not a change.

_Done when_ every changed line is in the list.

### 2. Save the example

Write the posted text verbatim to `examples/<slug>.<locale>.md`, with any person's name replaced by `<Kontakt>`.

_Done when_ the file holds the pasted text byte for byte, apart from `<Kontakt>`.

### 3. Propose rules

For each change that would apply to another post, propose one line for [`voice.md`](../voice.md) under "Learned rules", ending with the slug in parentheses. A changed Organizer name becomes a row under "Tag names". A person's name Han added becomes `<Kontakt>` in the example and neither a rule nor a row: the repo is public. Put the proposals to Han one by one; write only the ones he accepts.

_Done when_ Han has answered every proposal.

### 4. Ship

From a branch `chore/linkedin-voice-<slug>`, commit the example and the `voice.md` change with `/commit`, then open a PR to `main` with `/pr`.

_Done when_ the PR is open; give the user its URL.
