---
type: feature-guide
stale_after: 2027-01-11T00:00:00Z
---

# Episode migration

Read before turning a prototype (for example an HTML tower page) into an Episode, or before adding any Episode. Binding rules: [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md). Key roles: [episode-translation-keys.md](episode-translation-keys.md). Copy source: `src/components/episodes/page-template/`. Every Slide layout rendered: `src/components/episodes/slide-layouts/`.

Each step ends on a completion criterion. Stop at a step only when its criterion holds. Work in a worktree; commit through `/commit`.

**Splitting the work across agents.** The orchestrator does steps 1–3 and 7–10. Each sub-agent owns whole Slide folders, steps 4–6: Scene, widgets, CSS module and its `i18n/` text, and touches no file outside them. The orchestrator then adds only one import and one list entry per Slide to the Episode file. No two agents write the same file.

## 1. Read the source

List the source's Sections and Slides, in order.

- Each prototype beat is one Slide; each group of beats is one Section.
- The first Slide of a Section is its section slide: it names the Section (a title and caption). Add a section slide only where a source heading has no beat of its own:
  - Bare heading over beats (`<h2>Cost</h2>`, then three beats): add a section slide from the heading; the three beats become page slides.
  - Heading inside a beat (a full-height frame titled "Cost", with its own prose or visual): that beat is the section slide; add nothing.
- The Episode's own title and caption are the Title slide, not a Slide.
- Note the source's speaker notes, voice script and video id.

Done when: a table lists every Section with its Slides in order, and each Slide is marked animated, static or one-off visual.

## 2. Name the slugs

Kebab-case, from the titles: `the-lost-middle`.

- One slug per Slide, unique across the whole Episode, section slides included; never `top` or a position ([FE-002 §2](../../.archgate/adrs/FE-002-episode-page.md#2-the-slide-is-the-unit)).
- The Episode slug is the folder name and the route: `episode/<ep>`.

Done when: no two slugs match and each Section's first slug names the Section.

## 3. Copy the template and write the Episode's text

Copy `page-template/` to `episodes/<ep>/`, rename its slug, delete its Slide folders. Write the Episode's own text in `episodes/<ep>/i18n/en.json` and `de.json`: `title`, `caption`, `description`. English goes in verbatim from the source; German is written fresh from the same facts, not translated.

Done when: both files hold the three keys.

## 4. Write each Slide as one folder

One folder per Slide, `slides/<slide>/`, named after its slug. Write its text and its server entry together, Slide by Slide:

- `i18n/en.json` and `i18n/de.json`: the Slide's strings by role ([episode-translation-keys.md](episode-translation-keys.md)), no Episode or Slide prefix. Leave `title` out of a purely visual Slide, so it renders but is not listed. A section slide always has one.
- `slide.tsx`, the server entry:

```tsx
import { BasicPageSlide } from '@/components/slide-master/basic-page-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const theLostMiddle = slide({
  slug: 'the-lost-middle',
  messages: { en, de },
  notes: [{ slug: 'attention-valley', target: 'prose' }],
  segments: [{ slug: 'blank-slate' }],
  content: ({ t, ref, target, Title }) => (
    <BasicPageSlide
      title={<Title>{t('title')}</Title>}
      caption={t('caption')}
      prose={t.rich('prose', { ref: ref('attention-valley') })}
    />
  ),
});
```

- Pick the layout from `slide-layouts/`: section slide, basic page, three-column. A Scene that fits none is free JSX in a `SlideFrame` with the kit's `<Title>` ([FE-002 §3](../../.archgate/adrs/FE-002-episode-page.md#3-scene-is-free)).
- A type error from a kit field or from `messages` means the Slide's own files or its declaration are wrong: German must have every English key. Fix them; never cast.
- The kit is everything a Scene needs:
  - `t('caption')`, `t('count', { n })`; `t.rich('prose', { ref: ref('<note>') })` already knows `<em>`, `<b>`, `<code>` — pass a tag only to restyle it.
  - `template('showAll')`: the raw string, `{count}` unfilled, for a client widget to fill with `fillTemplate` from `@/lib/template.pure`.
  - `slideHref('the-lost-middle')`: the localized link to another Slide of this Episode; a slug not in the Episode fails the build.
  - `locale`: for `Intl` number or date formatting.
  - `ref`, `target`, `Title`: notes and heading, below.
- A Slide folder imports only its own files and the global shared locations: `src/components/slide-master/`, `src/components/slide-shared/`, `src/components/ui/`, `src/hooks/`, `src/lib/`. A server part only this Slide uses sits in its folder (see `page-template/slides/what-comes-next/statement.tsx`); a part two Slides share goes in `src/components/slide-shared/`, plain props, no kit. Colour tokens: [FE-002 §7](../../.archgate/adrs/FE-002-episode-page.md#7-episode-styling-stays-in-the-episode).
- A Slide's own CSS is a CSS module in its folder, combined with Tailwind via `cn()` (see `ai-token-economy/slides/motivation/freelancer-cards.module.css`). Only a token remap that the chrome reads too (the Title slide glow, `<em>`, the talk player) goes in one Episode stylesheet beside the Episode file, every selector under `[data-episode='<ep>']` (see `maintaining-markdown-for-ai/palette.css`). Never style one Slide from it.
- A `slide-shared` part reaches only other slide-shared parts, the UI kit and `src/lib` (dependency-cruiser rule `slide-shared-reaches-only-ui-and-lib`, [FE-007 §5](../../.archgate/adrs/FE-007-module-layering.md#5-a-slide-folder-imports-only-global-shared-code)). A popover uses the shared `usePopoverPlacement` hook; see [Episode chrome](episode-chrome.md).

Done when: every Slide of step 1 has a folder and `npm run typecheck` passes.

## 5. Notes, targets and the Voice script

- A note's `target` is a short name: `title`, `caption`, `prose`, a column slug, or `{...target('chart')}` on a one-off element.
- A Context reference is `<ref>phrase</ref>` in the string and `ref('<note>')` in `t.rich`.
- `sources: [{ slug, url }]` on the note that cites them; titles under `notes.<note>.sources.<source>.title`.
- Voice script: `segments` by slug, strings under `voiceScript.segments.<segment>`. A segment's `bridge: true` needs a `bridge` string.
- Reading time is counted from the script and bridge words (en 140, de 120 per minute), so write no minutes and no segment times ([FE-002 §2](../../.archgate/adrs/FE-002-episode-page.md#2-the-slide-is-the-unit)).

Done when: every note target resolves to one element of its Slide, and every source voice-script passage sits in a segment.

## 6. Client widgets

- Interactive or animated parts go in the Slide's folder as `<name>.client.tsx` ([FE-002 §3](../../.archgate/adrs/FE-002-episode-page.md#3-scene-is-free)); they reach only their own folder, `src/hooks/` and `src/lib/`.
- Logic goes in `<name>.pure.ts` beside it with a `.pure.test.ts`; test the logic, not the markup.
- Respect `prefers-reduced-motion`; pause looping animation outside the active Slide.
- Slide files render the widget like any component and stay server components.

Done when: each widget's pure logic has a passing test.

## 7. Compose, register, snapshot

- `episodes/<ep>/<ep>.ts`: `episode({ slug, youtube, messages: { en, de }, sections: [[sectionSlide, ...pages], ...] })` from `@/components/slide-master/slide`, `en` and `de` imported from `./i18n/`. Copying a Slide in from another Episode is `cp -r` of its folder plus one import and one entry here.
- Add the slug to `EPISODE_SLUGS` in `src/lib/routes.ts`, and the record to `EPISODES` in `src/components/episodes/registry.ts`.
- `episodes/<ep>/episode-metadata.ts`: `status: 'published'`, its primary Topic, any extra Topics, its Format, its Tags and `publishedOn`; add it to `PUBLISHED` in `src/components/episodes/episode-repository.ts`. If the Episode was an Upcoming Episode, flip its existing file, move it out of `UPCOMING` and move its copy from `landing.episodeOverview.upcoming.<ep>` into `episodes/<ep>/i18n/` ([Episode overview entries](episode-translation-keys.md#episode-overview-entries)). To feature it, edit the three slugs in `FEATURED` in `src/lib/episode-overview.ts`.
- Run `npx vitest run src/components/episodes/published-anchors.test.ts`. It fails for the new Episode and prints the file path and its JSON; create `episodes/<ep>/published-anchors.json` with exactly that content.

Done when: the same test run is green.

## 8. Verify

```sh
npm run verify          # mh check fails in a worktree; read everything before it
npm run build && npm run test:build
```

Done when: both pass, the build lists `/episode/<ep>` and `/de/episode/<ep>`, and the post-build tests cover it.

## 9. Check every Slide in both themes

After step 8's build, serve the export and shoot each Slide in each theme and locale. A Slide's id is its entry in `published-anchors.json`; `--clip` scrolls it into view so its content mounts, and `--theme` sets the system colour scheme the site follows by default:

```sh
npm run preview &   # serves out/ at http://localhost:4300/
npm run shot -- --url http://localhost:4300/episode/<ep> --clip '#<slide-id>' --theme light --out <scratchpad>/<slide-id>-light.png
npm run shot -- --url http://localhost:4300/de/episode/<ep> --clip '#<slide-id>' --theme dark --out <scratchpad>/<slide-id>-de-dark.png
```

Read the images one at a time (the `visual-check` skill has the probe options for layout questions a picture is not needed for).

- Text and marks readable on both backgrounds; no colour that only works in one theme.
- Layout and wording match the source Slide.

Done when: every Slide reads correctly in light and dark, en and de, or the gap is listed in your report.

## 10. Final review in the browser

The orchestrator, not a sub-agent, does this step. Open the source and the Episode side by side in Chrome, en and de, light and dark. Without browser tools, review the step 9 screenshots instead.

- Same Sections, Slides, wording and visual intent; table of contents tracks scroll.
- Hovering a note lights its element; a Context reference opens its note.
- Each client widget plays, and pauses off-screen.

Done when: no Slide differs from the source in either theme without a recorded reason.
