# Local saving

## Start the helper

Use the caller's existing save helper and representation when supplied. For a generic Spec, use this skill's reusable `scripts/serve.ts`. The helper serves just that HTML and writes just its assigned feedback file.

The authoring agent starts it using an existing Node.js installation with native TypeScript support (22.18+), on loopback and an unprivileged port. No packages, admin elevation or runtime installation are needed. If Node is missing or execution is restricted, state that direct Save is unavailable and retain standalone review, Copy prompt and Save As.

```sh
node <skill-directory>/scripts/serve.ts \
  --html /absolute/path/review.html \
  --feedback /absolute/path/feedback-01.md \
  --spec-id site-polish-review \
  --revision r1
```

By default the OS chooses a free port; `--port` can request one above 1023. Start it with the harness's supported persistent-process mechanism, verify the printed URL responds, then open that URL. Record the process handle for later shutdown. The user need not run terminal commands to review or save. Stop the old helper and restart with the new revision and filename after an explicit HTML update.

## Wire the authored HTML

At startup, only when served over HTTP, request `GET /__html-spec/config`. It returns `{ specId, revision, destination, token }`. Enable Save only when identity, revision and absolute destination match the constants embedded in the HTML. Keep the token in memory; omit it from drafts and exported prompts.

On Save, capture the complete current prompt, then:

```js
const response = await fetch('/__html-spec/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-HTML-Spec-Token': config.token,
  },
  body: JSON.stringify({
    specId,
    revision,
    destination,
    prompt,
  }),
});
const result = await response.json();
if (!response.ok) throw new Error(result.error);
// Report result.saved only after success; preserve all inputs and drafts.
```

Requests must come from the served page's origin. The helper limits feedback to 1 MB, rejects mismatched identities/destinations and stale HTML, and atomically replaces the assigned file. It serves neither directory listings nor other local files. A changed destination requires restarting the helper, not sending another filesystem path in the request.

Opening through `file://`, failed configuration discovery, cancellation or rejected writes leave the copy/browser-save paths usable. Avoid automatic retries that could obscure whether an approval handoff was saved.

## Continue the originating session

Before yielding, the agent names the assigned absolute feedback file and tells the reviewer how to report completion. On "saved feedback", read that file, check its Spec identity and revision, preserve the complete text, then follow its accepted action within the caller's constraints. Saving does not itself execute a skill, poll a folder or resume an agent.
