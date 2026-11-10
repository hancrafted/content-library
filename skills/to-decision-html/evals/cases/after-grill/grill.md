# Site polish grill

A grilling session in which Han and a coding agent settled seven small site changes. The text below is the session verbatim, from Han's request to the agent's proposed test seams. The agent sent three read-only investigation requests to a helper; each request and the helper's report appear where the agent received them. Tool calls and file reads are omitted. Implementation had not started at the cutoff.

## Han (01:47 UTC, 5 Nov 2026)

/grilling to clarify my intent
i need to perform some smaller changes 
1. For laptop (my mac ist 1512px wide) so below 1920 (fullhd) use a general 2 column grid on all pages showing cards. (explorables, events, resources, episodes,...)
2. change hello@hancrafted.net to hi@hancrafted.net
3. @hancrafted add current year (correct copyright display), ideally on build time the correct year

4. use Intro Human in the Loop Workflow as title for event 2026-11-04-intro-hitl-workflows and the title of the intro slide
5. the intro episode of 2026-11-04-intro-hitl-workflows is not of type workflow (same for 2 previous) events but "overview", we need a new artwork for that
6. Remove the "start with episode 1" button from all events
7. Rename "workflow" tag to "agentic workflow"

## Agent (01:47 UTC, 5 Nov 2026)

I’ll map these into decisions and check the existing site conventions so the questions focus on intent rather than facts I can look up.

## Investigation request (01:47 UTC, 5 Nov 2026)

Read-only investigation for a grilling session, no changes. Find concrete current implementation and relevant facts for these requested changes: card grid breakpoints and pages showing cards, email occurrences, copyright year, event 2026-11-04-intro-hitl-workflows and its intro slide and two prior events and their episode types/artwork, event start-with-episode-1 button, workflow tag definitions/translations and references. Report concise facts with precise file locations, relevant existing languages, dates, types, and ambiguous scope. Do not decide design or ask user; stop once facts established.

## Agent (01:47 UTC, 5 Nov 2026)

**Purpose:** Clarify the seven site changes, including their boundaries and intended behavior.  
**Result:** An agreed implementation brief; no changes until you confirm our understanding.

❓ **Q1** · contract — **How should card grids behave on narrow screens?**

“Below 1920px” includes phones as well as your 1512px laptop.

1. Use one column on narrow screens and two on laptop-sized screens, preserving usability.
2. Use two columns at every width below 1920px, applying the rule literally.

➡️ **Recommendation: Option 1.** Would you keep a single column on phones and use two columns on your laptop?

**Option 1**
```text
Phone:   [card]
         [card]       # room for readable content

Laptop:  [card] [card] # two columns
```

**Option 2**
```text
Phone:   [card] [card] # two columns even at narrow widths

Laptop:  [card] [card] # same column count
```

---

❓ **Q2** · architecture — **When should the copyright year advance?**

1. At build time, so the static site displays the build year without browser code.
2. In the visitor’s browser, so it advances even if the site has not been rebuilt.

➡️ **Recommendation: Option 1.** Would you accept that the displayed year stays unchanged until the first build of the new year?

**Option 1**
```text
Build in 2026 → © 2026
No rebuild in 2027 → © 2026  # static until the next build
```

**Option 2**
```text
Viewed in 2026 → © 2026
Viewed in 2027 → © 2027       # updates without a rebuild
```

The remaining questions depend on an investigation of the existing Events, artwork, tags, and card layouts.

## Investigation report (01:47 UTC, 5 Nov 2026)

- **Card grids**
  - Events: `src/events/components/event-browser.client.tsx:84` — 1 column default, 2 at `sm`, 3 at `lg`; list view is alternate.
  - Resources: `src/page-assembly/resources-overview/resource-browser.client.tsx:170` — same breakpoints.
  - Explorables: `src/page-assembly/explorables-overview/explorables-overview-page.tsx:42` — same breakpoints.
  - Guides: `src/page-assembly/guides-overview/guides-overview-page.tsx:82` — same breakpoints.
  - Event-related cards: `src/page-assembly/event/event-related.tsx:21` — default/`sm` two-column only.
  - Episode browser cards: `src/episodes/components/episode-browser/episode-browser.client.tsx:174` — default/`sm` two-column.

- **Email**
  - Canonical address: `hello@hancrafted.net`, defined at `src/shared/lib/contact.ts:3`.
  - Rendered by the landing contact footer via `src/page-assembly/landing/contact-footer.tsx:23`; copy UI is `src/page-assembly/landing/copy-email.client.tsx:46-57`.
  - English/German labels are in `src/page-assembly/landing/i18n/{en,de}.json:172-174`; German lacks the English “copy” key according to the visible excerpt, scope may require checking translation parity.

- **Copyright**
  - Footer currently renders only `© {brand}`, with no year: `src/shared/page-chrome/footer/footer-bar.tsx:5-10`.
  - Brand translations are `src/shared/page-chrome/i18n/{en,de}.json`; requested year has no current implementation.

- **Event `2026-11-04-intro-hitl-workflows`**
  - Record: `src/content-store/events/2026-11-04-intro-hitl-workflows.ts:3-13`.
  - Date `2026-11-04`, workshop, hancrafted, organization audience, onsite, Guangzhou/UTC+8, `13:30–14:15 CST`, tags `agentic-ai` and `workflow`; no image/artwork field.
  - Intro episode: `src/episodes/by-event/2026-11-04-intro-hitl-workflows/intro/episode.ts:10-15`; title slide is `slides/hero/slide.tsx`.
  - Metadata: `intro/episode-metadata.ts:3-11` — published, unlisted, `short`, published `2026-11-04`, tags workflow/agentic-ai.
  - Playlist and ordering: `src/content-store/playlists/intro-hitl-workflows.ts:3-14`; intro first, followed by `onboard-ai-every-time`, `ai-attention-span`, and `ai-gives-you-more-work`, with intro check-in anchors interleaved.

- **Two prior events**
  - `2026-10-28-cyberforum-akademie-intro-agentic-workflow`: `src/content-store/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow.ts:4-20` — webinar, remote Zoom, individual audience, image `/images/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow.webp`, credit `© CyberForum e.V.`, tags agentic-ai/workflow.
  - Its intro metadata: `src/episodes/by-event/2026-10-28-cyberforum-akademie-intro-agentic-workflow/intro/episode-metadata.ts:3-11` — published, unlisted, `short`, date `2026-10-28`.
  - `2026-10-23-axel-agentic-workflow`: `src/content-store/events/2026-10-23-axel-agentic-workflow.ts:4-15` — workshop, remote Zoom, organization audience, tags agentic-ai/workflow, no event artwork.
  - Its `onboard-ai-every-time` metadata: `src/episodes/by-event/2026-10-23-axel-agentic-workflow/onboard-ai-every-time/episode-metadata.ts:3-12` — published, unlisted, `foundations`, date `2026-10-23`, YouTube recording in English.

- **Start-with-Episode-1**
  - Translation is `eventPage.start`: `src/page-assembly/event/i18n/en.json:4` (“Start with Episode {step}”), German at `de.json:4`.
  - Rendered by `StartButton` in `src/page-assembly/event/event-page.tsx:90`; event page invokes it at approximately `:126`, using `startOf(episodes)`. The first playlist entry is therefore the current event’s first episode, not necessarily a globally numbered Episode 1.

- **Workflow tag**
  - Closed vocabulary is `src/content-store/schemas/fields.ts:20`: six tags, including `workflow`; valid for Episodes and Events.
  - Icon: `list-plus`; artwork: `process-loop`: `src/content-store/schemas/tag-looks.ts:16-28`.
  - Colour token is `--tag-workflow`: `src/app/globals.css:43,114`.
  - Translated tag name/tooltips are owned by page-assembly `lib` translations, as documented in `fields.ts:15-17`; references include all three event records and multiple episode metadata records.

## Agent (01:47 UTC, 5 Nov 2026)

I’ve checked the existing implementation. I’ll wait for your answers to **Q1 and Q2** before the next round.

## Han (01:48 UTC, 5 Nov 2026)

Q1: 1
Q2: 1

## Investigation request (01:48 UTC, 5 Nov 2026)

Follow-up read-only: determine how episode card artwork and 'workflow' type/classification are chosen, whether 'overview' exists, identify precisely the intro Episodes of the two previous events (including if absent), their card presentation and whether they share artwork; determine whether workflow tag is used as URL/query/filter contract, exact German label and relevant places. Report concise evidence and paths.

## Agent (01:49 UTC, 5 Nov 2026)

Settled: **one column on phones**, **two on laptops**, and the copyright year set at **build time**.

I’m checking how Episode artwork and tags are represented before the next round.

## Investigation report (01:49 UTC, 5 Nov 2026)

- **Episode card artwork selection**
  - `src/episodes/components/episode-card/episode-card.tsx:96-103`: artwork is selected from the card’s **lead Tag**: `TAG_ARTWORK[card.leadTag.id]`; icon/accent also use the lead Tag.
  - `src/content-store/schemas/tag-looks.ts:16-28`: `workflow` maps to icon `list-plus` and artwork `process-loop`.
  - Card content includes category, title, caption, Tags, date/video according to `episode-card.tsx:80-84`; published cards link as a whole, unlisted cards are only shown in event playlists.
  - Event/resource cards use the same lead-Tag artwork mechanism: `src/events/components/event-card.tsx:48-54`, `src/page-assembly/resources-overview/resource-card.tsx:64-67`.

- **“Workflow” classification**
  - It is not an Episode `format`/type. Formats are `foundations`, `teardown`, `short`: `src/content-store/schemas/fields.ts:11-14`.
  - `workflow` is one of six closed Tag IDs: `src/content-store/schemas/fields.ts:20-21`.
  - The current event intro metadata is `format: 'short'`, tags `['workflow','agentic-ai']`: `src/episodes/by-event/2026-11-04-intro-hitl-workflows/intro/episode-metadata.ts:5-10`.
  - No `overview` Episode type/format exists. “Overview” refers to pages/modes, e.g. `src/episodes/components/episode-card/episode-cards.ts:50-62` and `src/episodes/components/episode-page/content-area.tsx` comments; the overview excludes unlisted Episodes (`episode-cards.ts:56-62`).

- **Previous-event intro Episodes**
  - **CyberForum, 2026-10-28:** intro exists at `src/episodes/by-event/2026-10-28-cyberforum-akademie-intro-agentic-workflow/intro/episode.ts:14-32`; metadata is published, unlisted, `short`, published `2026-10-28`: `.../intro/episode-metadata.ts:3-11`.
  - **AXEL, 2026-10-23:** no `.../intro/` Episode exists. Search finds only an unrelated test reference to an expected source folder: `src/shared/lib/change-prompt.pure.test.ts:68-76`. Its first listed Episode is `onboard-ai-every-time`, metadata `foundations`, unlisted, published `2026-10-23`: `src/episodes/by-event/2026-10-23-axel-agentic-workflow/onboard-ai-every-time/episode-metadata.ts:3-12`.
  - CyberForum’s intro is an event-only unlisted Episode, so it does not appear in the general Episode overview. Event playlist cards are compact: `src/page-assembly/event/event-page.tsx:playlistEntries` (around lines 100-118); anchor entries show only the section title/details as documented in `src/episodes/components/episode-card/episode-cards.ts` around lines 64-70.
  - No separate intro-specific artwork is declared; the card would use its lead Tag artwork. The CyberForum and 2026-11-04 intro metadata both lead with `workflow`, so both resolve to `process-loop`. AXEL has no intro card to compare.

- **Workflow URL/filter contract**
  - `workflow` is a Tag/filter value, not a route or dedicated query parameter. Event overview filtering is in-memory state: `src/events/lib/events-overview.pure.ts:46+`; the client renders Tag chips/search in `src/events/components/event-browser.client.tsx:222+`.
  - Episode overview exposes Tags as filter chips and searches Tag names: `src/episodes/components/episode-browser/episode-browser.pure.ts:12`.
  - Relevant event filtering tests use `{ query: 'workflow', tags: [] }` and `tags: ['workflow', ...]`: `src/events/lib/events-overview.pure.test.ts:89-142`. No URL/query contract is evidenced.
  - Exact German label: **“Workflow”**; tooltip: **“Wie Arbeit in Schritte geteilt und zwischen Chats übergeben wird”**: `src/page-assembly/lib/i18n/de.json:56-59`. English is “Workflow” with tooltip “Work split into steps”: `.../en.json:56-59`.

## Agent (01:49 UTC, 5 Nov 2026)

The current site calls `workflow` a **Tag**, not an Episode Format. A card’s first Tag selects its artwork. The glossary also reserves **Overview** for a listing page, so using it as a visible Tag would give the word a second meaning.

---

❓ **Q3** · architecture — **What should “overview” mean for an intro Episode?**

1. Add **Overview** as a Tag and use it as the intro Episode’s lead Tag, giving it its own artwork.
2. Add **Overview** as an Episode Format, alongside Foundations, Teardown and Short, with artwork chosen separately.

➡️ **Recommendation: Option 1.** A Tag already controls card artwork; the intro can remain a Short. Would you use **Overview** as a new Tag?

**Option 1**
```text
Format: Short
Lead Tag: Overview          # selects overview artwork
```

**Option 2**
```text
Format: Overview
Lead Tag: Agentic workflow  # artwork needs a separate rule
```

---

❓ **Q4** · contract — **How completely should the workflow Tag be renamed?**

1. Rename both the displayed Tag and its stored ID to `agentic-workflow`.
2. Rename only the displayed Tag, keeping `workflow` as its stored ID.

➡️ **Recommendation: Option 1.** The stored name then matches the visible concept, and the current filter does not put the Tag ID in the URL. Would you rename both?

**Option 1**
```text
Stored ID: agentic-workflow
Displayed: Agentic workflow  # name and ID agree
```

**Option 2**
```text
Stored ID: workflow
Displayed: Agentic workflow  # existing ID stays unchanged
```

---

❓ **Q5** · contract — **Which Episode should receive overview artwork for the October 23 AXEL Event?**

The October 28 CyberForum Event has an intro Episode, but the October 23 AXEL Event does not. Its first Episode is **Onboard AI Every Time**.

1. Leave the AXEL Event unchanged, because its first Episode is not an intro.
2. Treat **Onboard AI Every Time** as its overview, because it is first.
3. Identify another Event or Episode you meant.

➡️ **Recommendation: Option 1.** Would you change the November 4 and October 28 intro Episodes, but leave AXEL’s first Episode alone?

**Option 1**
```text
Oct 28: intro                  → overview artwork
Oct 23: Onboard AI Every Time → existing artwork
```

**Option 2**
```text
Oct 28: intro                  → overview artwork
Oct 23: Onboard AI Every Time → overview artwork
```

**Option 3**
```text
Oct 28: intro                  → overview artwork
Other Event/Episode you name   → overview artwork
```

**Decided without asking**

- Keep the existing three-column layout at 1920px and above; use two columns below that on sufficiently wide screens.
- Remove the “Start with Episode 1” button, not the Playlist or its Episode links.
- Replace the shared contact address with `hi@hancrafted.net`.

The new artwork’s visual quality will need human review; the product vision notes that UX taste has no automated check.

## Han (01:50 UTC, 5 Nov 2026)

Q3: 1
Q4: 1
Q5: 1

## Investigation request (01:50 UTC, 5 Nov 2026)

One more read-only follow-up: report exact current en/de titles for Nov 4 event and its intro Episode and intro Slide, indicate whether each shares translation keys, and current en/de titles of Oct 28 intro. Check exact tag arrays of those two intros, and how newly added lead Tag affects Event playlist card artworks. Concise precise paths and values only.

## Agent (01:50 UTC, 5 Nov 2026)

Settled: **Overview** will be a new lead Tag with its own artwork; `workflow` becomes `agentic-workflow`; the October 23 AXEL Episode stays unchanged.

---

❓ **Q6** · contract — **Should the intro Episodes retain the Agentic workflow Tag?**

1. Keep it as a secondary Tag, because the intros still concern agentic workflows.
2. Remove it, because the intros should be classified only as overviews.

➡️ **Recommendation: Option 1.** The **Overview** lead Tag determines the artwork, while the secondary Tag keeps the subject searchable. Would you keep both?

**Option 1**
```text
Tags: Overview, Agentic workflow
Artwork: Overview                  # first Tag selects artwork
```

**Option 2**
```text
Tags: Overview
Artwork: Overview                  # no workflow classification
```

## Investigation report (01:51 UTC, 5 Nov 2026)

- **Nov 4 Event**
  - EN: `Intro HITL Workflows`
  - DE: `Intro HITL Workflows`
  - `src/events/lib/i18n/{en,de}.json:27-29`
  - Event key is slug-specific: `events.<slug>.title`.

- **Nov 4 intro Episode**
  - EN: `Intro HITL Workflows`
  - DE: `Intro HITL Workflows`
  - `src/episodes/by-event/2026-11-04-intro-hitl-workflows/intro/i18n/{en,de}.json:2`
  - Same displayed value, but **not shared translation keys**: Event copy is in `events/lib/i18n`; Episode copy is in the Episode’s own `i18n`.

- **Nov 4 intro Slide**
  - The hero/title Slide has **no title key**; it uses the Episode title as the record title.
  - Its only localized text is the kicker:
    - EN: `Guangzhou, China · 4 Nov 2026`
    - DE: `Guangzhou, China · 04.11.2026`
  - `src/episodes/by-event/2026-11-04-intro-hitl-workflows/intro/slides/hero/i18n/{en,de}.json:2`
  - Hero implementation confirms it is the record’s title Slide and renders only `kicker`: `.../intro/slides/hero/slide.tsx:8-14,25-31`.

- **Oct 28 intro Episode**
  - EN: `Generative AI at work: working agentically`
  - DE: `Generative KI im Arbeitsalltag: agentisch arbeiten`
  - `src/episodes/by-event/2026-10-28-cyberforum-akademie-intro-agentic-workflow/intro/i18n/{en,de}.json:2`
  - Its hero kicker:
    - EN: `Zoom webinar · 28 Oct 2026`
    - DE: `Zoom-Webinar · 28.10.2026`
  - `.../intro/slides/hero/i18n/{en,de}.json:2`

- **Exact tag arrays**
  - Nov 4 intro: `['workflow', 'agentic-ai']`
    - `src/episodes/by-event/2026-11-04-intro-hitl-workflows/intro/episode-metadata.ts:8`
  - Oct 28 intro: `['workflow', 'agentic-ai']`
    - `src/episodes/by-event/2026-10-28-cyberforum-akademie-intro-agentic-workflow/intro/episode-metadata.ts:8`

- **Lead Tag and Event playlist artwork**
  - The first tag is the lead Tag; card artwork is selected as `TAG_ARTWORK[card.leadTag.id]`: `src/episodes/components/episode-card/episode-card.tsx:96-103`.
  - Therefore adding/prepending `workflow` makes the playlist Episode card artwork `process-loop`; it also changes the card accent/icon to workflow’s values.
  - Both intros already lead with `workflow`, so both currently use `process-loop`; playlist rendering uses compact Episode cards in `src/page-assembly/event/event-page.tsx` around `playlistEntries`.

## Agent (01:51 UTC, 5 Nov 2026)

The November 4 intro Slide uses the Episode title, so renaming it will also rename the Episode card and page title. I’ll wait for your answer to **QQ6** before the next round.

## Han (01:53 UTC, 5 Nov 2026)

Q6: 1

## Agent (01:53 UTC, 5 Nov 2026)

**Proposed brief**

1. Card grids use one column on phones, two up to 1919px, and three from 1920px. Apply this across card-listing pages.
2. Change the contact address to `hi@hancrafted.net`.
3. Add the build year to the copyright; it advances on the first build of a new year.
4. Rename the November 4 Event and its intro Episode to **Intro Human in the Loop Workflow** in both locales. The title Slide uses the Episode title.
5. Add an **Overview** Tag with distinct artwork. Make it the lead Tag for the November 4 and October 28 intro Episodes, retaining **Agentic workflow** and their other Tags. Leave the October 23 AXEL Episode unchanged.
6. Remove the “Start with Episode 1” button from every Event, leaving Playlist navigation intact.
7. Rename the `workflow` Tag and its stored ID to **Agentic workflow** / `agentic-workflow` throughout the site.

The new artwork should fit the existing visual language; its quality needs human review. The glossary will need to distinguish the new **Overview** Tag from an Overview listing page.

**Does this capture your intent?** I won’t make changes until you confirm.

## Han (01:57 UTC, 5 Nov 2026)

make the changes

## Agent (01:57 UTC, 5 Nov 2026)

I’ll map the agreed changes onto the existing content and UI boundaries, then propose the test seams before writing tests.

## Agent (01:57 UTC, 5 Nov 2026)

Before I write tests, please confirm these **test seams**:

1. **Content store and filters:** verify the renamed Tag and the two intro Episodes’ lead Tag; this won’t assess artwork appearance.
2. **Rendered pages:** verify the Event title, contact address, copyright and removed button; this won’t measure responsive layout.
3. **Visual inspection:** check card columns at phone, laptop and 1920px widths, plus the new artwork in light and dark; this is a manual check, not an automated regression test.

Are these seams acceptable?
