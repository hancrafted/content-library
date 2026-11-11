---
type: feedback
title: Feedback round 3
generated:
  by: human:han
  at: 2026-11-11T12:00:00Z
round: 3
via: app
---

# Feedback round 3

- `your-terminal--overview` · content — Reorder the steps so the AI agent first starts inside the starter folder: 1 Your terminal → 2 Your AI agent (install only) → 3 Your folder (download and unzip, start the agent inside that folder, log in) → 4 Your first skill. Checkbox ids stay as they are; `agent-logged-in` moves under step 3.
- `your-terminal--overview` · content — Name each checklist step exactly as its Section title, so the ready state and the Sections below it read as the same steps.
- `your-terminal--overview` · design — In the ready state, show "✓ Done, no need to repeat" on every step Section header below the Overview, so a visitor scrolling past the success message knows not to redo the steps.
- `your-ai-agent--log-in` · content — Move this Slide to the end of the Your folder Section, after `start-the-agent-inside-that-folder`; its anchor becomes `your-folder--log-in`.
- `your-ai-agent--log-in` · implementation — Update `published-anchors.json` for the move: `your-ai-agent--log-in` is removed on purpose (nothing links it; the check skill links only `#your-terminal--overview`).
- `your-ai-agent--log-in` · content — Drop the "Open a new terminal window first" card; opening the terminal inside the folder after installing already gives a fresh window.
- `your-ai-agent--log-in` · content — Move the trust prompt ("Do you trust the files in this folder?") from this Slide to `start-the-agent-inside-that-folder`.
- `your-ai-agent--install-your-ai-agent` · content — End the Slide at the version check in a fresh window, without starting the agent: for Codex, answer N to "Start Codex now?".
- `your-ai-agent--install-your-ai-agent` · content — Rewrite the Voice script to the new order: the agent is installed here and first started in the folder step.
- `your-ai-agent--install-your-ai-agent` · content — `commandPromptHint` renders `C:\&gt;` literally in both locales: write a literal `>`, and assert the rendered text shows `C:\>`.
- `your-folder--start-the-agent-inside-that-folder` · content — On Windows, lead with Windows 11's right-click **Open in Terminal** / **In Terminal öffnen**; Shift + right-click "Open PowerShell window here" becomes the Windows 10 fallback.
- `your-folder--start-the-agent-inside-that-folder` · content — Answer the trust prompt here: Yes, because this is the starter folder. The Slide ends with the agent running in the folder; sign-in follows on the next Slide.
- `your-folder--start-the-agent-inside-that-folder` · content — Rewrite the Voice script: this is where the agent first starts, then the Windows 11 route and the trust prompt.
- `your-terminal--open-your-terminal` · content — On Windows, name **Terminal** first (Windows key, type "Terminal"; the Windows 11 default) and PowerShell as the Windows 10 case, in the toolbar label, the find-it drawing and the copy. The prompt inside stays `PS C:\…`.
- `your-terminal--open-your-terminal` · content — Rewrite the Voice script for the Windows Terminal naming.
- `your-terminal--open-your-terminal` · content — On the "What you're looking at" Slide, replace "You can't break anything" / "Du kannst hier nichts kaputt machen" with "Looking around and closing the window breaks nothing" in the caption, the info card and its explanation, in both locales.
- `your-terminal--open-your-terminal` · content — On the "What you're looking at" Slide, reword the Voice script segment "You can't break anything" the same way.
- `your-first-skill--run-your-first-skill` · content — On the German page, the typed line and Copy button read `/hancrafted-check-setup de`; the English page keeps the bare command.
- `your-first-skill--run-your-first-skill` · content — Rewrite the German Voice script to say `/hancrafted-check-setup de`.
- `your-first-skill--run-your-first-skill` · implementation — In the starter's `hancrafted-check-setup` skill (`~/Developer/playground`), accept `de` as a second form of its one argument: `de` opens `/de/guides/setup-ai-agent-and-starter-folder/`, a host still swaps the origin, no argument opens English. Rebuild `public/hancrafted-workshop-starter.zip`.
