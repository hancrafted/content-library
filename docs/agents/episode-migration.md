# Episode migration

Read before turning a prototype (for example an HTML tower page) into an Episode, or before adding any Episode. Binding rules: [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md). Key roles: [episode-translation-keys.md](episode-translation-keys.md). Copy source: `src/components/episodes/page-template/`. Every Slide layout rendered: `src/components/episodes/slide-layouts/`.

Each step ends on a completion criterion. Stop at a step only when its criterion holds. Work in a worktree; commit through `/commit`.

## 1. Read the source

List the source's Sections and Slides, in order.

- Each prototype beat is one Slide; each group of beats is one Section.
- The first Slide of a Section is its section slide: it names the Section (a title and caption). Add one when the source has only a heading.
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
  minutes: { en: 2, de: 2 }, // only with a Voice script
  notes: [{ slug: 'attention-valley', target: 'prose' }],
  segments: [{ slug: 'blank-slate', from: 0, to: 2 }],
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
- A type error from `t`, `ref` or `target` means the Translation keys or the declaration are wrong. Fix them; never cast.

Done when: every Slide of step 1 has a file and `npm run typecheck` passes.

## 5. Notes, targets and the Voice script

- A note's `target` is a short name: `title`, `caption`, `prose`, a column slug, or `{...target('chart')}` on a one-off element.
- A Context reference is `<ref>phrase</ref>` in the string and `ref('<note>')` in `t.rich`.
- `sources: [{ slug, url }]` on the note that cites them; titles under `notes.<note>.sources.<source>.title`.
- Voice script: `segments` with `from`/`to` in minutes, strings under `voiceScript.segments.<segment>`. A segment's `bridge: true` needs a `bridge` string.
- Set `minutes` only on a Slide with a Voice script. No Voice script, no minutes.

Done when: every note target resolves to one element of its Slide, and every Voice script Slide has `minutes`.

## 6. Client widgets

- Interactive or animated parts go in `episodes/<ep>/client/<name>.client.tsx`: the only place an Episode carries `'use client'`.
- Logic goes in `client/<name>.pure.ts` with a `.pure.test.ts` beside it; test the logic, not the markup.
- Respect `prefers-reduced-motion`; pause looping animation outside the active Slide.
- Slide files render the widget like any component and stay server components.

Done when: each widget's pure logic has a passing test.

## 7. Compose, register, snapshot

- `episodes/<ep>/<ep>.ts`: `episode({ slug, youtube, sections: [[sectionSlide, ...pages], ...] })`.
- Add the slug to `EPISODE_SLUGS` in `src/lib/routes.ts`, and the record to `EPISODES` in `src/components/episodes/registry.ts`.
- Write `episodes/<ep>/published-anchors.json`: a sorted array of the anchors, `<section>` and `<section>--<slide>`.

Done when: `npx vitest run src/components/episodes/published-anchors.test.ts` is green.

## 8. Verify

```sh
npm run verify          # mh check fails in a worktree; read everything before it
npm run build && npm run test:build
```

Done when: both pass, the build lists `/episode/<ep>` and `/de/episode/<ep>`, and the post-build tests cover it.

## 9. Compare in the browser

Preview a worktree with `npx serve out -l 3100`. Open the source and the Episode side by side, in en and de.

- Same Sections, Slides, wording and visual intent; table of contents tracks scroll.
- Hovering a note lights its element; a Context reference opens its note.
- Each `client/` widget plays, and pauses off-screen.

Done when: no Slide differs from the source without a recorded reason.
