---
type: feature-guide
title: Episode migration
stale_after: 2027-01-11T00:00:00Z
---

# Episode migration

Read before turning a prototype (for example an HTML tower page) into an Episode, or before adding any Episode. Binding rules: [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md); colour and type: [FE-011 Design Tokens](../../.archgate/adrs/FE-011-design-tokens.md). Key roles: [episode-translation-keys.md](episode-translation-keys.md). Copy source: `src/episodes/tooling/episode-template/`. Layouts: the frame components in `src/episodes/components/slide-master/` and the Slide library, `src/episodes/tooling/slide-master/`.

Each step ends on a completion criterion. Stop at a step only when its criterion holds. Work in a worktree; commit through `/commit`.

**Splitting the work across agents.** The orchestrator does steps 1–3 and 7–10. Each sub-agent owns whole Slide folders, steps 4–6: Scene, widgets, CSS module and its `i18n/` text, and touches no file outside them. The orchestrator then adds only one import and one list entry per Slide to its Section's module (step 7). No two agents write the same file.

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

## 3. Copy the template, register the Episode, write its text

Copy `episode-template/` to `episodes/<ep>/`, then:

- Delete its Slide folders and its `published-anchors.json`; the anchors bind at publication ([Episode publishing](episode-publishing.md)), not here.
- Keep `episode.ts` and rename its export to the camelCase slug. Set `slug: '<ep>'` and `sections: []` until step 7; add `youtube: { en, de }` to `episode-metadata.ts` once the video ids exist.
- Register it now: write `episodes/<ep>/episode-metadata.ts` (its `status` decides published or upcoming) and run `npm run registry`, which adds the slug, the metadata and the record to the Episode registry from the folder; the fast suite fails while the registry is stale. The metadata holds `status: 'upcoming'`, its primary Topic, any extra Topics, its Format and its Tags, as in `specs-an-agent-can-follow/episode-metadata.ts`, and no `publishedOn`: publishing adds `status: 'published'` and `publishedOn` later. The page is built and served at `/episode/<ep>`, `noindex`, its overview card Upcoming and unlinked.
- If `episodes/<ep>/` already exists as an Upcoming Episode, copy into it, keep `status: 'upcoming'`, run `npm run registry` once `episode.ts` sits beside its metadata (it then has a page), and move its copy from `episodeBrowser.upcoming.<ep>` into `episodes/<ep>/i18n/` ([Episode browser entries](episode-translation-keys.md#episode-browser-entries)).
- Write the Episode's own text in `i18n/en.json` and `de.json`: `title`, `caption`, `description`. English goes in verbatim from the source; German is written fresh from the same facts, not translated.

Done when: both files hold the three keys and `npm run typecheck` passes.

## 4. Write each Slide as one folder

One folder per Slide, `slides/<slide>/`, named after its slug. Write its text and its server entry together, Slide by Slide:

- `i18n/en.json` and `i18n/de.json`: the Slide's strings by role ([episode-translation-keys.md](episode-translation-keys.md)), no Episode or Slide prefix. Leave `title` out of a purely visual Slide, so it renders but is not listed. A section slide always has one.
- `slide.tsx`, the server entry:

```tsx
import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame, SlideProse } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const theLostMiddle = slide({
  slug: 'the-lost-middle',
  messages: { en, de },
  notes: [{ slug: 'attention-valley', target: 'prose' }],
  segments: [{ slug: 'blank-slate' }],
  content: ({ t, ref, target }) => (
    <SlideFrame>
      <div className="mt-10">
        <SlideProse {...target('prose')}>{t.rich('prose', { ref: ref('attention-valley') })}</SlideProse>
      </div>
    </SlideFrame>
  ),
});
```

- The Slide wrapper renders the Slide header from the Slide's own text: the Eyebrow (computed), the `title` (or `heading`) and the `caption`, typed in once ([design-ADR-0012](../adr/0012-slide-header-and-play-once-motion.md)). The Scene is free JSX in a `SlideFrame` holding the visual only; a `<Title>` in it fails the build. The frame layouts (`SectionSlide`, `BasicPageSlide`, `ThreeColumnSlide` in `src/episodes/components/slide-master/`) author their own header, for an Episode whose record sets `header: 'authored'`.
- A section slide's Scene echoes the Hero motif; the Title slide's hero visual is a Slide folder set as the record's `title` (see `episode-template/slides/hero/` and `foundations/`).
- No entrance motion in a Scene: the wrapper fades it up once. Hover emphasis reuses the shared classes in [the design system](../design/design-system.md#hover-vocabulary).
- A type error from a kit field or from `messages` means the Slide's own files or its declaration are wrong: German must have every English key. Fix them; never cast.
- The kit is everything a Scene needs:
  - `t('caption')`, `t('count', { n })`; `t.rich('prose', { ref: ref('<note>') })` already knows `<em>`, `<b>`, `<code>` — pass a tag only to restyle it.
  - `template('showAll')`: the raw string, `{count}` unfilled, for a client widget to fill with `fillTemplate` from `@/shared/lib/template.pure`.
  - `slideHref('the-lost-middle')`: the localized link to another Slide of this Episode; a slug not in the Episode fails the build.
  - `locale`: for `Intl` number or date formatting.
  - `ref`, `target`: notes, below; `Title` only on an Episode with `header: 'authored'`.
- A Slide folder imports only its own files and the global shared locations: `src/episodes/components/slide-master/`, `src/episodes/components/slide-shared/`, `src/shared/components/ui/`, `src/shared/hooks/`, `src/shared/lib/`; its `*.client.tsx` widgets reach only their own folder, `src/shared/hooks/` and `src/shared/lib/` (step 6). A server part only this Slide uses sits in its folder (see `episode-template/slides/what-comes-next/statement.tsx`); a part two Slides share goes in `src/episodes/components/slide-shared/`, plain props, no kit.
- Colour, size and weight come from tokens only ([FE-011](../../.archgate/adrs/FE-011-design-tokens.md#dos-and-donts), reference in [the design system](../design/design-system.md)): `text-foreground`, `text-machine`, `var(--…)`; text sizes `text-body`, `text-caption`, `text-subheading`, `text-heading`. Never `bg-amber-500`, `text-xs`, `text-[13px]`, `font-bold` or a hex value; a Slide's own colour is a token in its CSS module with a `:global(.dark)` value. Lint and `archgate check` refuse the rest.
- A Slide's own CSS is a CSS module in its folder, combined with Tailwind via `cn()` (see `ai-token-economy/slides/motivation/freelancer-cards.module.css`). Only a token remap that the chrome reads too (the Title slide glow, `<em>`, the talk player) goes in one Episode stylesheet beside the Episode file, every selector under `[data-episode='<ep>']` (see `maintaining-markdown-for-ai/palette.css`). Never style one Slide from it.
- A `slide-shared` part reaches only other slide-shared parts, the UI kit, the core components and `src/shared/lib` (dependency-cruiser rule `slide-shared-reaches-only-ui-and-lib`, [FE-007 §5](../../.archgate/adrs/FE-007-module-layering.md#5-a-slide-folder-imports-only-global-shared-code)). A popover uses the shared `usePopoverPlacement` hook; see [Episode chrome](episode-chrome.md).

Done when: every Slide of step 1 has a folder and `npm run typecheck` passes.

## 5. Notes, targets and the Voice script

- A note's `target` is a short name: `title`, `caption`, `prose`, a column slug, or `{...target('chart')}` on a one-off element.
- A Context reference is `<ref>phrase</ref>` in the string and `ref('<note>')` in `t.rich`, or a Context marker: `<marker>phrase</marker>` with `marker('<note>')`, or `<Marker note="<note>" />` on an element.
- `sources: [{ slug, url }]` on the note that cites them; titles under `notes.<note>.sources.<source>.title`.
- Voice script: `segments` by slug, strings under `voiceScript.segments.<segment>`. A segment's `bridge: true` needs a `bridge` string.
- Reading time is counted from the script and bridge words (en 140, de 120 per minute), so write no minutes and no segment times ([FE-002 §2](../../.archgate/adrs/FE-002-episode-page.md#2-the-slide-is-the-unit)).

Done when: every note target resolves to one element of its Slide, and every source voice-script passage sits in a segment.

## 6. Client widgets

- Interactive or animated parts go in the Slide's folder as `<name>.client.tsx` ([FE-002 §3](../../.archgate/adrs/FE-002-episode-page.md#3-scene-is-free)); they reach only their own folder, `src/shared/hooks/` and `src/shared/lib/`.
- Logic goes in `<name>.pure.ts` beside it with a `.pure.test.ts`; test the logic, not the markup.
- Respect `prefers-reduced-motion`; pause looping animation outside the active Slide.
- Slide files render the widget like any component and stay server components.

Done when: each widget's pure logic has a passing test.

## 7. Compose and snapshot

- `episodes/<ep>/sections/<section-slug>.ts`, one per Section, `<section-slug>` the slug of its section slide: export that Section's Slide list, `[sectionSlide, ...pages]`, in order ([FE-004 §3](../../.archgate/adrs/FE-004-slide-architecture.md#3-each-module-owns-one-thing), [design-ADR-0008](../adr/0008-pipeline-jobs-belong-to-stages.md)). A page Slide is listed there, never in the Episode file. Copying a Slide in from another Episode is `cp -r` of its folder plus one import and one entry in its Section's module.
- `episodes/<ep>/episode.ts`: import each Section's list and fill `sections: [...]` with them, in Section order, in `episode({ slug, youtube, messages: { en, de }, sections })`.
- To feature it, edit the three Episode ids in `FEATURED` in `src/content-store/featured.ts`.
- Do not write `published-anchors.json`: `published-anchors.test.ts` skips an upcoming Episode, and the publish step writes the file ([Episode publishing](episode-publishing.md)).

Done when: `npx vitest run src/episodes/lib/published-anchors.test.ts` is green.

## 8. Verify

```sh
npm run verify
npm run build && npm run test:build
```

`test:build` holds three hand-kept expectations a new Episode touches; the rest, such as whether a page must carry Speaker notes, it derives from the built pages:

- **Captured text:** the first run writes `tests/post-build/episode-text/<ep>.{en,de}.json` and fails on purpose. Review both files, commit them, run again. A later wording change fails against the capture: delete the two files, rerun, review the new capture.
- **Untitled Slides:** each Slide left without a `title` gets its anchor in `UNTITLED` in `tests/post-build/episode-structure.build.test.ts`.
- **Published list:** an upcoming Episode sits in `DRAFT_SLUGS`, not `PUBLISHED_SLUGS`, in `tests/post-build/episodes-index.build.test.ts`; it moves at publication ([Episode publishing](episode-publishing.md)).

Done when: both pass, the build lists `/episode/<ep>` and `/de/episode/<ep>`, and the post-build tests cover it.

## 9. Check every Slide in both themes

After step 8's build, serve the export and shoot each Slide in each theme and locale. A Slide's id is its entry in `published-anchors.json`; `--clip` scrolls it into view so its content mounts, and `--theme` sets the system colour scheme the site follows by default:

```sh
npm run preview &   # serves out/ at http://localhost:4300/
npm run inspect-page -- --url http://localhost:4300/episode/<ep> --clip '#<slide-id>' --theme light --out <scratchpad>/<slide-id>-light.png
npm run inspect-page -- --url http://localhost:4300/de/episode/<ep> --clip '#<slide-id>' --theme dark --out <scratchpad>/<slide-id>-de-dark.png
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
