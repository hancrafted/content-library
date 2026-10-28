# Landing a Workflow

The repo checklist for step 7. The page reads only the repo's `<id>.{en,de}.yml` in `src/explorables/human-in-the-loop/`; registration is _Adding a Workflow_ in `docs/features/explorables/human-in-the-loop.md`. Below are the steps in order and the gotchas no config confesses.

## 1. Branch

`npm run wt:new -- feat/<id>-workflow`, and work in that worktree.

_Done when_ `git branch --show-current` prints the branch.

## 2. English file

Copy `.scratch/<id>/<id>.en.yml` in; a new Workflow is registered in `workflow-data.ts`. The pair test compares `foreach.over` verbatim, so a fan-out H2 must slug the same in both languages: pick an H2 that reads in German too (`## Research`, `## Epics`).

_Done when_ `render-prompt.ts` prints every job of the repo file.

## 3. German file

Dispatch one subagent to translate it: du-Form in lowercase, German number format (1.500 €, 9,4 / 10), and the review words project-plan uses ("Korrekturanweisung", "Bereit", "Nachbessern nötig"). Same ids, slots, `foreach` and template keys; only strings differ. Every do and review `instructions` text stays at most two sentences, the picker `description` one sentence, and no `learningGoal` equals its English one.

_Done when_ `npx vitest run src/explorables/human-in-the-loop/workflow-pair.test.ts` passes, and **Han has read the German file**: ask him before the PR.

## 4. Tests that read shipped Workflows

The engine tests run on `workflow.fixture.en.yml`, so only these read a shipped Workflow: `workflow-pair`, `workflow-content.*`, `workflow-file`, `workflow-state`, `human-in-the-loop` and its `.browser` test. They find stages by index or id, so changing a shipped Workflow's stages or jobs breaks them by position: update each to the new shape.

_Done when_ `npm run verify` passes. Prettier formats the YAML too.

## 5. Slide text

`src/episodes/explorable-pages/human-in-the-loop/slides/another-use-case/i18n/{en,de}.json` describes vacation's stages in words. Update it when vacation's shape changes; a new Workflow that a Slide describes gets the same treatment.

_Done when_ every stage the text names exists in the file, in both languages.

## 6. Captures and the browser test

The captures `tests/post-build/episode-text/human-in-the-loop.{en,de}.json` hold the diagram text. Delete both, run `npm run build`, then `npm run test:build` twice (the first writes them, the second checks), and read the diff: only the stages you changed may move. Then `npm run test:browser -- src/explorables/human-in-the-loop/human-in-the-loop.browser.test.ts`.

_Done when_ both pass and the capture diff holds only intended text.

## 7. Gates and PR

`archgate check`, then `/code-review` against `main`, `/commit`, and `/pr` once Han asks for the push. The PR names Han's target-tool result and the last stand-in run.

_Done when_ the PR is open.
