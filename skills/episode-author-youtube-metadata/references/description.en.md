# Description template (English)

Block order, top to bottom. Budgets count characters of the published description (markers excluded). Write in Han's voice, address the viewer as you.

Grounded in YouTube Help 12948449 (descriptions) and 9884579 (chapters):

- "Consider using the first few lines of your description to describe your video because it's what viewers will see first." So the hook and the link lead.
- "Identify 1-2 main words that describe your video and feature them prominently in both your description and title." So the summary carries one or two keywords.
- "The description allows a maximum of 5000 characters." Target 1,500–2,500.
- "Your video should have at least three timestamps listed in ascending order"; the first starts at 00:00; chapters are at least 10 seconds. The generated block already complies.

| #   | Block              | Rule                                                                                                                                    |
| --- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hook               | One sentence, at most 100 characters, the main keyword in it, no link.                                                                  |
| 2   | Episode link       | `All slides and sources for this episode: <Episode URL>`, the first link of the description.                                            |
| 3   | Summary            | 300–600 characters, own words for this video, 1–2 keywords, what the viewer can do after watching.                                      |
| 4   | Chapters           | The generated block with its markers. Leave it as it is.                                                                                |
| 5   | Call to action     | One line, one link: for an Event copy the Event page `https://hancrafted.net/events/<event>/`, else the Episode link.                   |
| 6   | Research questions | Heading `The research questions behind the claims`, one title per line, `- `. Titles only until the site publishes a page per question. |
| 7   | About              | `About hancrafted`, one line on Han, then `hancrafted.net` and LinkedIn from `SOCIAL_LINKS`.                                            |
| 8   | Hashtags           | Last line: three topical, the first is the main keyword, then always `#AIEnablement`.                                                   |

Pinned comment: the call-to-action line of block 5 with its link, then one line recapping the chapters as their titles joined by `·`.

```
<hook>

All slides and sources for this episode: <Episode URL>

<summary>

<chapter block>

<call to action>

The research questions behind the claims:
- <title>

About hancrafted: <one line>
hancrafted.net: https://hancrafted.net/
LinkedIn: <linkedin href>

#<keyword> #<tag> #<tag> #AIEnablement
```

## Learned rules

The Learn branch (`references/learn.md`) appends here; each line names the Episode it came from and binds every description.

- Every description ends its hashtags with `#AIEnablement`. (onboard-ai-every-time, ai-attention-span)
