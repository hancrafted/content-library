---
name: linkedin-author-post
description: Draft a LinkedIn post in Han's voice from a hancrafted.net Event, Episode or Explorable URL, then learn from the version he posted. Use when the user wants a LinkedIn post for an Event, Episode or Explorable, or says "posted" or "gepostet" and pastes the final text.
---

# LinkedIn author post

One URL in, one draft out: three hooks above one body, value up front, in Han's voice. The post exists to solve a real problem for the reader and move them to change something. The skill drafts; Han posts by hand.

Two branches:

- **Draft**: the user gives a URL. Steps 1 to 5.
- **Learn**: the user says "posted" or "gepostet" and pastes the final text. Follow [`references/learn.md`](references/learn.md).

## Steps

### 1. Resolve the URL

Strip `https://hancrafted.net`. A leading `/de` makes the post German, addressing the reader as Du; the bare root makes it English. Write the other language only when asked. Match the rest against [Post kinds](#post-kinds) and open every source file that row names.

_Done when_ the kind, the locale and each source file are named, and each file is open.

### 2. Load the voice

Read, in order: `docs/profile/tone-guide.md` (Han's voice, the source of truth), [`voice.md`](voice.md) (the LinkedIn rules, learned rules and tag names), and every file in [`examples/`](examples/) in the post's locale.

_Done when_ all three are read; every rule in `voice.md` binds the draft.

### 3. Gather the material

Collect what the kind's row asks for. For a past Event, look for a follow-up: the earliest Event in `src/content-store/events/` dated after today that shares an Organizer, so readers can still register. If there is none, the post ends with "Schreib mir auf LinkedIn" or "Message me on LinkedIn".

_Done when_ every link the post will carry is a full URL, and every number has its n.

### 4. Check the page is live

Run `curl -sI <url>` on each hancrafted.net link. A status other than 200 means the page is not deployed yet; say so above the draft.

_Done when_ each hancrafted.net link has a status.

### 5. Draft

Write three hooks, each one sentence of at most 140 characters, and recommend one with a reason. Write one body under them following `voice.md`. Save the draft to `.scratch/linkedin/<slug>.<locale>.md`, then show it in chat with these notes below it:

- Tag the Organizer with LinkedIn's picker; pasted text does not create a mention.
- For a past Event or a release with a video: post once the video is public; LinkedIn caches the first preview it fetches.
- After posting, say "gepostet" or "posted" and paste the final text, so the skill learns from it.

_Done when_ the draft file exists and every rule in `voice.md` holds for it.

## Post kinds

| URL path                       | Kind                                              | Source files                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/events/<slug>`               | Past Event (date before today), else future Event | `src/content-store/events/<slug>.ts`, `src/events/lib/i18n/<locale>.json`, its Playlist in `src/content-store/playlists/`, the Episodes in `src/episodes/by-event/<slug>/` |
| `/events/<slug>/episodes/<id>` | The Event's post, past or future                  | as `/events/<slug>`; this Episode's recording goes first                                                                                                                   |
| `/episodes/<id>`               | Release                                           | `src/episodes/<id>/brief.md`, `episode-metadata.ts`, its Slides' Speaker notes in `i18n/<locale>.json`                                                                     |
| `/explorables/<id>`            | Offering                                          | `src/episodes/explorable-pages/<id>/` (its `i18n/` and Slides), `docs/features/explorables/<id>.md`                                                                        |

An Event-scoped Episode is a copy made for that Event, so its post is the Event's post, not a release.

### Past Event

- **Hook**: the Event's poll counts, rows of `docs/llm-wiki/research/AIE/*/responses.csv` whose `event_slug` is the Event's slug. Pick the count that surprises most, and state its n ("rund 10 Teilnehmende"). The counts describe these attendees only, never people in general.
- **Thanks**: the Organizer only, never `hancrafted`. Han adds a contact person by hand.
- **Video**: at least one recording, the `youtube` id on the Event's Episodes, as `https://youtu.be/<id>`. Lead with the recording of the Episode the hook's poll question is about (`<episode>.seen`, `<episode>.known`), so the video delivers what the hook promises. If its `language` differs from the post's locale, name it ("Aufzeichnung auf Englisch").
- **Content**: the hancrafted Event page.
- **Follow-up**: the follow-up Event's `listing`, from step 3.

### Future Event

- **Hook**: the problem the Event solves for the reader, taken from its description in `src/events/lib/i18n/<locale>.json`; the date and format come after it.
- **Goal**: registrations. First link: the Event's `listing`; second: the hancrafted Event page.
- **Image**: suggest the Event's `image`; when it has none, suggest `/hancrafted-cover-art`.

### Release

- **Hooks**: three insight options, each the problem from `brief.md` with one concrete line from the Speaker notes as proof. "New Episode" comes after the value.
- **First link**: the video when `episode-metadata.ts` has `youtube`, else the Episode page.
- **Ending**: one concrete next step the reader can take tomorrow.

### Offering

- **Hook shape**: "Need help explaining <concept>? Check out this explorable explanation …", or in German "Du musst <Konzept> erklären? …". On LinkedIn the genre name "explorable explanation" replaces the repo's "Explorable".
- **First link**: the Explorable page.
- **Ending**: one concrete next step the reader can take tomorrow.
