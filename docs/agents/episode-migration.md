# Episode migration

Read before turning a prototype (for example an HTML tower page) into an Episode, or before adding any Episode. Binding rules: [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md). Key roles: [episode-translation-keys.md](episode-translation-keys.md). Copy source: `src/components/episodes/page-template/`. Every Slide layout rendered: `src/components/episodes/slide-layouts/`.

Each step ends on a completion criterion. Stop at a step only when its criterion holds. Work in a worktree; commit through `/commit`.

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

- One slug per Slide, unique across the whole Episode, section slides included.
- Never `top`, never a position.
- The Episode slug is the folder name and the route: `episode/<ep>`.

Done when: no two slugs match and each Section's first slug names the Section.

## 3. Write the Translation keys

In `src/messages/en.json` and `src/messages/de.json`, before any Slide file: the Slide types derive from these keys.

- Episode: `episodes.<ep>.{title,caption,description}`.
- Slides: `episodes.<ep>.slides.<slide>.<role>`; roles in [episode-translation-keys.md](episode-translation-keys.md). No Section level.
- English text goes in verbatim from the source. German is written fresh from the same facts, not translated.
- Leave `title` out of a purely visual Slide, so it renders but is not listed. A section slide always has one.

Done when: `npm run typecheck` accepts both files and every English key has a German one.

## 4. Write the Slide files

Copy `page-template/` to `episodes/<ep>/`, rename its slug, delete its Slides. Then one file per Slide, `slides/<slide>.tsx`:

```tsx
const slide = slidesFor('<ep>');

export const theLostMiddle = slide({
  slug: 'the-lost-middle',
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

- Pick the layout from `slide-layouts/`: section slide, basic page, three-column. A Canvas that fits none is free JSX in a `SlideFrame` with the kit's `<Title>`.
- A type error from a kit field means the Translation keys or the declaration are wrong. Fix them; never cast.
- The kit is everything a Canvas needs:
  - `t('caption')`, `t('count', { n })`; `t.rich('prose', { ref: ref('<note>') })` already knows `<em>`, `<b>`, `<code>` — pass a tag only to restyle it.
  - `template('show-all')`: the raw string, `{count}` unfilled, for a `client/` widget to fill with `fillTemplate` from `@/lib/template.pure`.
  - `slideHref('the-lost-middle')`: the localized link to another Slide of this Episode.
  - `locale`: for `Intl` number or date formatting.
  - `ref`, `target`, `Title`: notes and heading, below.
- A part or data several Slides share goes in `episodes/<ep>/canvas/`: a server component with plain props (`<Statement>{t('statement')}</Statement>`), never the kit, never importing a Slide. See `page-template/canvas/statement.tsx`.
- Episode CSS, when Tailwind is not enough, sits in `canvas/` with every selector under `[data-episode='<ep>']`. Machine, human, AI, primary and secondary use the site tokens (`text-machine`, `text-human`, `text-ai`, `text-primary`, `text-secondary`); any other colour gets a light and a dark value. `globals.css` changes only for a token two Episodes share.

Done when: every Slide of step 1 has a file and `npm run typecheck` passes.

## 5. Notes, targets and the Voice script

- A note's `target` is a short name: `title`, `caption`, `prose`, a column slug, or `{...target('chart')}` on a one-off element.
- A Context reference is `<ref>phrase</ref>` in the string and `ref('<note>')` in `t.rich`.
- `sources: [{ slug, url }]` on the note that cites them; titles under `notes.<note>.sources.<source>.title`.
- Voice script: `segments` by slug, strings under `voiceScript.segments.<segment>`. A segment's `bridge: true` needs a `bridge` string.
- Reading time is counted from the script and bridge words (en 140, de 120 per minute). Write no minutes and no segment times; a Slide without a script adds no time.

Done when: every note target resolves to one element of its Slide, and every source voice-script passage sits in a segment.

## 6. Client widgets

- Interactive or animated parts go in `episodes/<ep>/client/<name>.client.tsx`: the only place an Episode carries `'use client'`.
- Logic goes in `client/<name>.pure.ts` with a `.pure.test.ts` beside it; test the logic, not the markup.
- Respect `prefers-reduced-motion`; pause looping animation outside the active Slide.
- Slide files render the widget like any component and stay server components.

Done when: each widget's pure logic has a passing test.

## 7. Compose, register, snapshot

- `episodes/<ep>/<ep>.ts`: `episode({ slug, youtube, sections: [[sectionSlide, ...pages], ...] })`.
- Add the slug to `EPISODE_SLUGS` in `src/lib/routes.ts`, and the record to `EPISODES` in `src/components/episodes/registry.ts`.
- Run `npx vitest run src/components/episodes/published-anchors.test.ts`. It fails for the new Episode and prints the file path and its JSON; create `episodes/<ep>/published-anchors.json` with exactly that content.

Done when: the same test run is green.

## 8. Verify

```sh
npm run verify          # mh check fails in a worktree; read everything before it
npm run build && npm run test:build
```

Done when: both pass, the build lists `/episode/<ep>` and `/de/episode/<ep>`, and the post-build tests cover it.

## 9. Check every Slide in both themes

Preview a worktree with `npx serve out -l 3100`, then shoot each locale in each theme:

```sh
npm run screenshot -- /episode/<ep> --theme light --base http://localhost:3100
npm run screenshot -- /episode/<ep> --theme dark --base http://localhost:3100
npm run screenshot -- /de/episode/<ep> --theme light --base http://localhost:3100
npm run screenshot -- /de/episode/<ep> --theme dark --base http://localhost:3100
```

First run on a machine: `npx playwright install chromium`. Read every PNG in `.screenshots/<ep>[-de]/<theme>/`.

- Text and marks readable on both backgrounds; no colour that only works in one theme.
- Layout and wording match the source Slide.

Done when: every Slide reads correctly in light and dark, en and de, or the gap is listed in your report.

## 10. Final review in the browser

The orchestrator, not a sub-agent, does this step. Open the source and the Episode side by side in Chrome, en and de, light and dark. Without browser tools, review the step 9 screenshots instead.

- Same Sections, Slides, wording and visual intent; table of contents tracks scroll.
- Hovering a note lights its element; a Context reference opens its note.
- Each `client/` widget plays, and pauses off-screen.

Done when: no Slide differs from the source in either theme without a recorded reason.
