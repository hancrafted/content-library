# Calibration answers

My answers to anything you would ask before building. Where a question is not answered here, proceed and mark the value you chose as assumed.

- **Mode:** `decide`. I pick one Option per Slide.
- **Audience:** me, who judges each Slide's design and picks an Option per Slide. I review on a 1512px-wide laptop.
- **Items:** the Title slide and the four Slides in `decisions.md`, in its order. Keep each Slide's slug as its item id (`top` for the Title slide) and each Option's id as its Option id.
- **Depth:** `simple` on every item. Each Option's build notes sit behind a Show details toggle.
- **Fidelity:** `mock` for every item, a real-content mock of the Slide.
- **Design size:** 1920 × 1080: a mock is a Slide frame that grows to 1920 px on a wide screen.
- **Recommendation:** keep the recommended Option `decisions.md` marks on each Slide. I still make the pick.
- **Allowed Next actions:** "Redesign the open Slides" and "Approve the Spec". Preset "Redesign the open Slides".
- **Gates:** approval is my pick on every Slide plus the Next action "Approve the Spec". A Slide set to Redesign has no pick, so it blocks approval.
- **Design guidance:** the tokens and type roles in `design.css`, inlined. Mocks use token classes and the type roles `text-body`, `text-caption`, `text-subheading`, `text-heading` and `text-hero`, never a hex colour or a raw size. The page's own styling uses the same variables (`--background`, `--card`, `--border`, `--primary`, `--foreground`, `--muted-foreground`, `--ring`) with light and dark themes. Look: minimalist and modern, with quiet borders and shadows, consistent radii and a restrained accent.
- **Vocabulary:** use the terms in `decisions.md` as written: Brief, Slide, Section, Title slide, Option, Visual language, Episode page, Speaker notes, Voice script.
- **Motion library:** none named.

## Page

- **Context cards:** the Brief, Style, Visual language and Episode page sit in one row of collapsible cards, closed by default, ahead of the first item, so the first decision starts high on the page. A note field inside a closed card still posts.
- **Toolbar:** sticky and always one row, down to 1024 px wide. It holds the outline as a dropdown, the render presets as one segmented bar with a single selection, the theme switch and Copy as prompt. Each preset's label is its name only; its size is in a tooltip.
- **Pick bar:** each item has a bar with one segment per Option, single selection, and a last segment, Redesign, which clears the pick. The recommended Option's segment carries a star icon whose accessible name says recommended. Each segment is at least 44 × 44 px. Beside the bar are a Show details toggle and Reset, which returns the item to the recommended Option.
- **Default pick:** the recommended Option is selected when the page loads, so a Slide I do not touch goes with the recommendation.
- **Comment:** each item has one comment field, optional, 4 rows by default. A Slide set to Redesign needs no comment.
- **Words:** each Slide's Visual idea, Voice script and Speaker notes sit in the rail below the comment, one collapsible each, closed by default, so the mock leads the main column.
- **Review panel:** at the bottom of the page and the full width of the content. It holds the general comment, the Next action, "Before you approve" and Save.
- **Scroll control:** one small circle at the bottom right, split into a to-top and a to-bottom half, each showing only a caret.
- **Copy as prompt:** always present, in the review panel next to Save and on the toolbar. It copies the lines Save would send, led by one line naming the Episode and the round.

## Render presets

Each preset re-renders every mock at one width; `fit` is the full column.

| Preset    | Size                   |
| --------- | ---------------------- |
| `desktop` | 1920 px wide           |
| `laptop`  | 1440 px wide           |
| `tablet`  | 1024 px wide           |
| `mobile`  | 390 px wide            |
| `shorts`  | 1080 × 1920 (vertical) |

`shorts` is a fixed design size: the mock keeps its 1080 × 1920 layout, as YouTube Shorts shows it, and is scaled down to fit the viewport below the toolbar, so the whole 9:16 frame is visible without scrolling.

## Feedback

The page is a form that posts to a local review server with a `POST /` of `application/x-www-form-urlencoded`. This route takes precedence over your default. Fields:

| Field                  | Carries                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `pick:<slug>`          | One per picked Option, valued by the Option id; `pick:top` for the Title slide |
| `note:<slug>`          | The comment on a Slide; optional                                               |
| `note:visual-language` | The note on the Visual language                                                |
| `note:page`            | The general comment on the whole page                                          |
| `next`                 | The Next action: `redesign` or `approve`                                       |

The server refuses `approve` while any Slide is set to Redesign or has more than one pick, and the page checks the same before it posts or copies. Before you approve: accessibility (contrast, focus, motion), the German text length, what each pick costs to build, and what a Slide's Option copies from a shared one.
