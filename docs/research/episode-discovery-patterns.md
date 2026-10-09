# Episode discovery patterns

Research date: 2026-10-09. Scope: how strong content-discovery surfaces help visitors find an item among 5, 20 and 60, for a statically exported Next.js landing page (no server, no query-param state, in-memory UI state only). Not binding; binding decisions live in `.archgate/adrs/`.

Evidence grades: **[P]** primary (the site, standard or study owner), **[S]** secondary or practitioner opinion. Live pages were fetched as text, so layout details (column counts, card sizes, motion) are often not visible; each pattern says what was actually seen. Netflix, egghead, MasterClass and Apple HIG could not be read first-hand (403 or no body), see "Gaps".

Repo context: `src/lib/episode-index.pure.ts` (untracked, in progress) already models `topic` (4 values: ai-collaboration, documentation, economics, adoption), `format` (3: foundations, teardown, short), `status`, `publishedOn`, `featuredRank`. That is a small, closed vocabulary, which shapes the fit notes below.

## Short answer

- Split the section in two, as the owner suggests: a small **Featured** block (static, no rotation, 3-5 items, real Episode cards) plus a **Browse** block (all Episodes, chips for topic, cards). This is the Stripe / Linear / Master.dev shape.
- Use **single-select chips on one dimension (topic)**, not facets. Offer format as a card label, not top-level navigation.
- Make the card grid exist in the server HTML; make filtering a progressive enhancement. Chips are toggle buttons, state lives in React memory.
- Avoid: auto-rotating hero, horizontal-only rails for essential items, more than ~5 hero items, a "Format" primary nav.

## Patterns

### 1. Featured lead plus latest list (the "featured + list" split)
- **What:** one or a few items promoted at the top, then the recency-ordered remainder. Stripe's blog opens with one featured post (category, date, author, image, summary), then a tab row ("All Corporate Engineering Industry Product"), three latest posts, short "Recent highlights", and one capped section per category with "View all [category] posts" ([Stripe blog](https://stripe.com/blog), **[P]**, text only, layout not visible). Linear's "Now" opens with category tabs plus search, image cards, an embedded changelog list, then a text-only archive with "Load more" ([Linear Now](https://linear.app/now), **[P]**). Every.to opens with a product hero, then a row of three article cards, then themed sections ([Every](https://every.to/), **[P]**).
- **Scales:** 5 items: the whole list is the featured block, no split needed. 20: good fit. 60: good if the Browse block is capped or filtered; Stripe and Linear cap and push the tail to an archive.
- **Pitfalls:** the same post appears in several sections on Stripe, which is fine for browsing but inflates the page. NN/g warns that featured content must be representative, because seasonal or promotional picks shape what visitors think the site offers ([NN/g homepage principles](https://www.nngroup.com/articles/homepage-design-principles/), via search excerpt).
- **A11y:** plain headings and a list of links; no widget needed. Mark the featured block with its own `h2` so it is a navigable landmark by heading.
- **Mobile:** stacks to one column. Cap at a few cards so Browse is not pushed far below the fold; NN/g eyetracking shows 74% of viewing time falls in the first two screenfuls ([NN/g scrolling and attention](https://www.nngroup.com/articles/scrolling-and-attention/), **[P]**).

### 2. Themed shelves with a cap and "View more"
- **What:** one section per topic, 5-10 items each, link to the full list. Master.dev (Frontend Masters) opens its catalog with "Latest" (10) and "Popular" (10), each with a "View more" link that carries a sort parameter, then one section per topic; the same course appears in several sections; cards show thumbnail, title, instructor only, no level, length or rating ([Master.dev courses](https://master.dev/courses/), **[P]**). Netflix describes its home page as thematically coherent rows in a two-dimensional layout, scroll horizontally within a row, vertically between rows ([Netflix Tech Blog](https://netflixtechblog.com/learning-a-personalized-homepage-aa8ec670359a), **[P]**, read through a search excerpt because the page returned 403). YouTube channels use up to 12-13 custom sections and a separate "Spotlight" featured video for returning subscribers vs a trailer for non-subscribers ([YouTube Help](https://support.google.com/youtube/answer/3219384), via search excerpt).
- **Scales:** 5: pointless. 20: works only if shelves have 4+ items each; with 4 topics and 20 Episodes, ~5 per shelf is right. 60: best at this size, this is where shelves beat a flat grid.
- **Pitfalls:** shelves hide items behind "View more" and duplicate items. Netflix rows are horizontal; NN/g found desktop users often do not discover horizontal scrolling and rate it negatively ([NN/g horizontal scrolling](https://www.nngroup.com/articles/horizontal-scrolling/), **[P]**). Prefer wrapping grids per shelf over horizontal scrollers.
- **A11y:** each shelf is a heading plus a list. If you do scroll horizontally, the scroll container needs `tabindex="0"` or focusable children, otherwise it fails axe `scrollable-region-focusable` (WCAG 2.1.1) ([Deque](https://dequeuniversity.com/rules/axe/4.10/scrollable-region-focusable), **[P]**).
- **Mobile:** vertical stack of shelves works; horizontal rails need a visible peek of the next card (NN/g calls "illusion of continuity" the strongest cue) and should be reachable in 3-4 swipes ([NN/g mobile carousels](https://www.nngroup.com/articles/mobile-carousels/), **[P]**).

### 3. Category chips or tabs as an in-page filter
- **What:** a row of single-select chips ("All", then topics) above one card grid. Linear's tabs: All, Changelog, Product launches, From the team, From the community, Press ([Linear Now](https://linear.app/now), **[P]**). Stripe has the same four-category row. Spotify and Google Maps use chip bars ([UXPin](https://www.uxpin.com/studio/blog/filter-ui-and-ux/), **[S]**).
- **Rules from design systems:** use chips to refine the current view and tabs to move to a different view; all chip sets on a page should share one behaviour (single or multi) ([eBay Playbook](https://playbook.ebay.com/design-system/components/filter-chip), [Material 3 chips](https://m3.material.io/components/chips/guidelines), both **[P]**). UXPin puts the sweet spot at 3-8 mutually exclusive options **[S]**. NN/g's tabs guidance: tabs suit few groups and fail when users must compare across tabs; in-page tabs should keep the same layout and swap only data ([NN/g tabs](https://www.nngroup.com/articles/tabs-used-right/), **[P]**, via search excerpt).
- **Scales:** 5: unnecessary, a chip row for 5 items is noise. 20: good. 60: good, but add a count per chip or an empty-state message.
- **Pitfalls:** only one tab's content is visible, so users may miss items in other groups (California Courts design system, **[S]**). The active filter must stay visible.
- **A11y:** two valid options. (a) Toggle buttons with `aria-pressed`; the label must not change with state ([APG button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), **[P]**). (b) ARIA tabs: `tablist`/`tab`/`tabpanel`, Left/Right arrows move between tabs, Tab leaves the list, roving tabindex, automatic activation recommended when panels need no loading ([APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), **[P]**). Single-select chips that filter one shared grid are not a tabpanel-per-tab structure, so toggle buttons (or radio-style group) fit better; my inference, not stated by APG. Announce the result count in a polite live region (inference; verify with a screen reader). If filtering animates, honour `prefers-reduced-motion` ([WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), AAA, **[P]**).
- **Mobile:** a wrapping or horizontally scrolling chip row; a scrolling row needs the peek cue and 44px-class targets. With 4 topics all chips fit on one wrapped row at 375px, so no scroller is needed.

### 4. Faceted navigation
- **What:** several independent filters at once (topic, format, level, length, status). NN/g: filters exclude items; faceted navigation is many filters that comprehensively describe the content; it matters "for extremely large content sets", costs more to build, and requires metadata for every facet on all current and future content. Advice: make sure users truly need it before investing ([NN/g filters vs facets](https://www.nngroup.com/articles/filters-vs-facets/), **[P]**).
- **Who:** Epicurious (NN/g example), Lowe's-style catalogs, Vercel templates by framework (URL structure only; the live page showed no filter controls in the text fetched, [Vercel templates](https://vercel.com/templates), **[P]**).
- **Scales:** 5 and 20: overkill. 60: still overkill for two dimensions. Becomes justified in the hundreds, as with the ~480 Vercel templates (my count from the fetched list).
- **A11y/mobile:** facet panels become a sheet or accordion on mobile and need full form semantics (fieldset/legend, checkboxes). Much more work than chips.

### 5. Topic tiles (topic index)
- **What:** a grid or strip of topic entry points instead of a filter. Master.dev shows roughly 70 topic icons linking to filtered lists ([Master.dev courses](https://master.dev/courses/), **[P]**). MasterClass categories were not readable (403).
- **Scales:** useful when topics outnumber ~8. With 4 topics it duplicates the chip row, and with a static export topic tiles would need their own routes (`/topics/economics`), which is a bigger decision than a filter.
- **A11y:** links to real pages, the most robust pattern. **Mobile:** 2-column grid.
- **Note:** a real route per topic gives search engines a page per topic; relevant for German buyers arriving from queries (repo context in `AGENTS.md`). Weigh against the no-state rule: routes are allowed, query params are not.

### 6. Learning paths (curated sequences)
- **What:** an ordered set of items toward a goal. Master.dev lists 25 paths in two groups (6 career-level, 19 topic), each with name, tagline and total time; no course count ([Master.dev paths](https://master.dev/learn/), **[P]**; the page's own stats text says 24, so the count is inconsistent).
- **Scales:** 5: no. 20: one or two paths ("Start here") add real guidance. 60: strongly useful, because visitors cannot judge order from titles alone.
- **Pitfall:** needs editorial upkeep and a sequence that makes sense; with separate topic and format axes, a path is the only way to express "read these three in order".
- **A11y:** an ordered list (`ol`) with step numbers. **Mobile:** vertical list.

### 7. Bento or mixed-size tile grid
- **What:** tiles of different sizes, size = importance. Practitioners describe Linear's changelog as large cards for major updates and compact tiles for minor ones, and Apple product pages as one anchor tile plus supporting cells ([setproduct](https://www.setproduct.com/blog/bento-grid-layout-design-guide), **[S]**; found by search, not primary).
- **Evidence:** none from controlled studies. Commentary says it works for about 4-12 parallel items with one clear anchor and degrades for content needing a reading order or comparison; quoted performance statistics (47% longer, 23% faster) had no traceable source and should be ignored.
- **Scales:** fits a **featured block of 3-5**, not a 60-item catalog. NN/g on cards generally: good for browsing, worse than lists for scanning, and rank is de-emphasised ([NN/g cards](https://www.nngroup.com/articles/cards-component/), **[P]**).
- **A11y:** DOM order must match intended reading order; CSS grid `order` or `grid-area` placement that diverges from the DOM breaks keyboard and screen-reader order. **Mobile:** collapse to a single column and drop the size hierarchy, or the anchor tile is just another card.

### 8. Flat list or archive for the long tail
- **What:** dense text rows, newest first. Vercel's blog index is a single reverse-date list of 612 posts, mixed with customer stories, optional category label, no featured post and no filter in the text version ([Vercel blog](https://vercel.com/blog), **[P]**). Linear's archive is one line per post with "Load more" ([Linear Now](https://linear.app/now), **[P]**). Vercel templates is a title plus one-line description list (~480 items).
- **Why it works:** NN/g: lists scan better than cards when users look for something specific, and show more items per screen ([NN/g cards](https://www.nngroup.com/articles/cards-component/), **[P]**).
- **Scales:** 5: fine. 20: fine. 60: best second tier, under a featured block, if a visitor wants "everything". Pair with browser find-in-page; no JS needed.
- **A11y:** plain `ul`; best of all patterns. **Mobile:** unchanged.

### 9. Hero carousel and horizontal rails (cautionary)
- Listed here because it is the default instinct for "hottest". See pitfalls. A rail of related, non-essential items is acceptable; a hero carousel carrying the only path to an Episode is not ([NN/g mobile carousels](https://www.nngroup.com/articles/mobile-carousels/), **[P]**: "important items used in hero carousels should be accessible in some other way").

## Evidence on pitfalls

| Pitfall | Evidence | Source |
|---|---|---|
| Auto-rotation hides content | 5-second rotation means each item is visible 20% of the time; the one offer that mattered was missed. Moving content is assumed to be an ad, so it is ignored. Guidance: show a new panel only when the user asks | [NN/g auto-forwarding](https://www.nngroup.com/articles/auto-forwarding/) **[P]** |
| Auto-rotation is an accessibility failure | Content that starts automatically, lasts over 5 seconds and sits beside other content needs a pause, stop or hide mechanism (WCAG 2.2.2, Level A). APG: rotation stops on focus and hover, and needs a start/stop button that comes first in tab order | [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [APG carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) **[P]** |
| Too many frames | 5 or fewer; users rarely view more. Most people stop after 3-4 pages of a mobile carousel; Netflix's 70+ item row took 23+ swipes | [NN/g carousels](https://www.nngroup.com/articles/designing-effective-carousels/), [mobile](https://www.nngroup.com/articles/mobile-carousels/) **[P]** |
| Carousels get skipped | People often scroll past carousels on large and small screens; one frame may mislead about the whole set. Static hero often better. A third-party study (Notre Dame, ~1% clicked, 84% of those on slide 1) is quoted in search results but was not checked first-hand | [NN/g carousels](https://www.nngroup.com/articles/designing-effective-carousels/) **[P]**, Notre Dame figure **[S]** |
| Hidden arrows and sideways scroll | Even strong cues like arrows often go unnoticed on desktop; hover-only arrows (Netflix) may never be found; do not put essential content behind horizontal scroll | [NN/g horizontal scrolling](https://www.nngroup.com/articles/horizontal-scrolling/) **[P]** |
| Promo look = ignored | 52% of 2013 homepage screen space went to filler, self-promotion, ads and blank space; self-promotion rose from 9% to 15%. The more a block looks like an ad, the more it is ignored | [NN/g real estate](https://www.nngroup.com/articles/homepage-real-estate-allocation/) **[P]** |
| Format as primary navigation | Users want topic answers, not formats; "Videos" does not say what is inside; navigation "should not be like a box of chocolates". Exception: sites whose main behaviour is browsing | [NN/g format-based navigation](https://www.nngroup.com/articles/format-based-navigation/) **[P]** |
| Facets built too early | Facets are "significantly more expensive to create and maintain" and need metadata on every item | [NN/g filters vs facets](https://www.nngroup.com/articles/filters-vs-facets/) **[P]** |
| Choice overload | Evidence is contested: the 2010 meta-analysis (63 conditions, N = 5,036) found a mean effect of virtually zero with high variance; a later meta-analysis (Chernev et al. 2015) found a significant effect. Treat "fewer options always wins" as unproven; better supported: category labels and ordering help | [Scheibehenne et al., JCR 2010](https://doi.org/10.1086/651235) **[P]**, Chernev commentary via search **[S]** |
| Attention drops below the fold | 57% of viewing time above the fold, 74% in the first two screenfuls (120 participants, 130,000 fixations) | [NN/g scrolling and attention](https://www.nngroup.com/articles/scrolling-and-attention/) **[P]** |
| Weak link text | Link/label must say what is behind it; card image + title + summary form the information scent | [NN/g information scent](https://www.nngroup.com/articles/information-scent/) **[P]** |

Rotation timing if you ignore all of the above: NN/g suggests about 3 words per second as a starting point and no auto-advance on mobile ([NN/g carousels](https://www.nngroup.com/articles/designing-effective-carousels/)).

## Fit by catalog size (my synthesis, not a source claim)

| Size | Featured block | Browse block |
|---|---|---|
| 4-5 | the whole set as cards; no chips, no split | none |
| 15-25 | 3-4 static cards (hottest) | chip row for topic plus one grid of all Episodes |
| 40-60 | 3-5 static cards, plus optional 1-2 learning paths | chips plus grid, capped (e.g. first 12 with "Show all" or "Load more" client-side); or topic shelves |

Notes for this repo, inferred:
- **Only one filter dimension on the surface.** 4 topics fit a single chip row; show `format` (foundations, teardown, short) as a label on each card. NN/g's format-nav warning applies at top level; a label on the card is a deeper level and acceptable. If 3 formats prove useful, a second chip row is the point to reconsider, not before.
- **Upcoming Episodes** (status `upcoming`) should be visible but not link-like, and never occupy Featured; Featured promising a page that does not exist is the worst information-scent failure.
- **Featured ordering** can come from `featuredRank` in the index; keep the number of featured slots a constant so rank 1-N is the contract.
- **Server HTML first.** Render every card, hide non-matching ones client-side with the `hidden` attribute (find-in-page and printing caveats as in `docs/research/context-drawer-patterns.md`: `hidden` computes to `display: none`). With JS off, all Episodes show. This matches the static-export constraint; the chips are a leaf client component.
- **No URL state** means a back navigation from an Episode resets the chip to "All". That is a known cost (see `docs/research/url-as-application-state.md` for the repo's earlier analysis); keep the grid short enough that it is tolerable, or keep the selected chip in `sessionStorage` (decision for the owner, not evidence-based here).
- **Localisation:** topic chip labels are Translation keys; German labels are often longer (compound nouns), so test chip wrap at 320-375px in `de`.
- **Avoid in GSAP landing:** if the hero already animates (see `CLAUDE.md` testing notes), a second moving region in the Episodes section compounds the 2.2.2 problem; keep this section static.

## Gaps and caveats

- Not read first-hand: Netflix Tech Blog (403, used search excerpt), egghead (403), MasterClass (403), Apple HIG collections (page body not returned; no claims taken from it), Apple TV+ shelves, Readwise, YouTube channel help (404 on one URL; second URL via search excerpt).
- Live-site observations come from text extraction; visual layout (grid columns, card size, sticky behaviour, animation) is unverified. A browser pass on Stripe, Linear, Master.dev would confirm.
- Bento-grid usability claims are practitioner opinion; no controlled study was found.
- NN/g chips-vs-tabs: no NN/g article compares them; guidance is from eBay, Material and UXPin.
- Choice-overload findings conflict; do not cite either side as settled.
