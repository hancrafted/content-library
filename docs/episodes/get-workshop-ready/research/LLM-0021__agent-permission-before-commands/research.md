---
type: research
title: 'Why does each AI agent ask permission before a skill runs a command?'
description: 'A model can be steered by text it reads, so each agent gates shell commands behind a human approval step; the vendors and OWASP name prompt injection and unintended actions as the reason.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-29T00:00:00Z
stale_after: 2027-04-29T00:00:00Z
sources:
  - id: 1
    resource: https://code.claude.com/docs/en/permissions
    title: 'Anthropic, Claude Code: Configure permissions'
  - id: 2
    resource: https://www.anthropic.com/engineering/claude-code-sandboxing
    title: 'Anthropic, Making Claude Code more secure and autonomous with sandboxing'
  - id: 3
    resource: https://learn.chatgpt.com/docs/agent-approvals-security
    title: 'OpenAI, Codex: Agent approvals and security'
  - id: 4
    resource: https://geminicli.com/docs/reference/policy-engine/
    title: 'Google, Gemini CLI: Policy engine'
  - id: 5
    resource: https://geminicli.com/docs/cli/trusted-folders/
    title: 'Google, Gemini CLI: Trusted Folders'
  - id: 6
    resource: https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli
    title: 'GitHub, About GitHub Copilot CLI'
  - id: 7
    resource: https://antigravity.google/docs/permissions/
    title: 'Google, Antigravity: Permissions'
  - id: 8
    resource: https://antigravity.google/docs/agent-settings/
    title: 'Google, Antigravity: Agent settings'
  - id: 9
    resource: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
    title: 'OWASP, LLM01: Prompt Injection'
  - id: 10
    resource: https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
    title: 'OWASP, LLM06:2025 Excessive Agency'
  - id: 11
    resource: https://arxiv.org/abs/2302.12173
    title: 'Greshake et al., Not what you''ve signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection'
---

# Why does each AI agent ask permission before a skill runs a command?

## Context

Asked to support a claim for first-time users: when an AI agent shows an approval prompt before a skill runs a shell command, that prompt is a designed safeguard, not an error. The question covers Claude Code, Codex CLI, Gemini CLI, GitHub Copilot CLI and Antigravity, and names what each agent calls its prompt. Vendor docs change fast, so prompt names are as of the generation date.

## Answer

A shell command runs with the user's own rights, and the model choosing it can be wrong or steered by text it read, such as a web page or a project file. OWASP lists human approval of privileged or high-impact actions as a mitigation for both prompt injection and excessive agency. Each vendor builds that approval into its default mode, so a first-run skill that runs a command pauses for a yes or no. The prompts differ in name and scope, but all five agents ask by default before a non-read-only command outside a sandbox.

## Findings

1. A language model cannot reliably tell data from instructions: hidden instructions in retrieved content such as web pages can steer an application, and the authors say effective mitigations are lacking [11].
2. OWASP defines indirect prompt injection as outside content (websites, files) steering the model, says it is unclear whether fool-proof prevention exists, and recommends human-in-the-loop controls for privileged operations [9].
3. OWASP's Excessive Agency entry says damaging actions can follow unexpected, ambiguous or manipulated model output, whatever the cause (hallucination or injection), and says to require a human to approve high-impact actions before they are taken [10].
4. Claude Code is read-only by default; in Manual mode, Bash commands need approval except a built-in read-only set (such as `ls`, `cat`, `grep`). The prompt is a "Bash command" dialog asking "Do you want to proceed?" with Yes, "Yes, and don't ask again", and No [1].
5. Anthropic says broad file access is risky "especially in the case of prompt injection", and that repeated approvals cause approval fatigue, which makes people stop scrutinizing; sandboxing cut permission prompts by 84% in internal use [2]. This is a vendor-internal measure, not an independent study.
6. Codex separates the sandbox (what it can do technically) from the approval policy (when it must ask). In the default Auto preset it works freely inside the workspace but asks for edits outside it, or commands needing network access; network is off by default, and web search uses a cached index to reduce prompt-injection exposure [3].
7. Gemini CLI's policy engine defaults write tools, including `run_shell_command`, to `ask_user` in its default approval mode; `yolo` mode allows all tools and is marked "use with extreme caution"; in headless runs `ask_user` is treated as deny [4].
8. With Trusted Folders enabled, Gemini CLI prompts before any tool runs in an untrusted folder, even when auto-acceptance is on, to keep malicious project code from running automatically. The feature is off by default [5].
9. GitHub Copilot CLI asks you to confirm trust for the launch directory, then in manual approval mode prompts for tools that change or run files, offering "Yes", "Yes, and approve TOOL for the rest of the running session", and "No, and tell Copilot what to do differently (Esc)". GitHub says automatic approval "increases the risk of unintended actions" and suggests sandboxing [6].
10. Antigravity has an Ask list among Deny, Ask and Allow rules: the agent "pauses and prompts for your explicit approval". The app presets are Request Review (always ask), Default (sandboxed commands run, ask outside), Auto (Preview) and Turbo (no prompts). The reason given is that the sandbox has no network and limited paths, so commands beyond it need approval [7].
11. Antigravity's older terminal setting is Require Review, Proceed in Sandbox or Always Proceed [8].

## Caveats

The prompt-injection risk is shown in published attacks on named products [11] and in OWASP guidance [9][10], not measured as a rate for these five CLIs. Some vendor pages state the safeguard's purpose only in passing (Codex, Antigravity, Gemini's shell tool), so "why" there is partly inferred from the mechanism. Findings 4 to 11 describe settings as of 2026-10-29; defaults, preset names and URLs move often (the Codex docs already redirected between domains), so recheck before showing a prompt on screen. Default modes and prompt wording depend on version and account type. Claude Code's built-in skills may carry their own pre-approved tools; this file does not cover that.

[1]: <https://code.claude.com/docs/en/permissions> "Anthropic, Claude Code: Configure permissions"
[2]: <https://www.anthropic.com/engineering/claude-code-sandboxing> "Anthropic, Making Claude Code more secure and autonomous with sandboxing"
[3]: <https://learn.chatgpt.com/docs/agent-approvals-security> "OpenAI, Codex: Agent approvals and security"
[4]: <https://geminicli.com/docs/reference/policy-engine/> "Google, Gemini CLI: Policy engine"
[5]: <https://geminicli.com/docs/cli/trusted-folders/> "Google, Gemini CLI: Trusted Folders"
[6]: <https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli> "GitHub, About GitHub Copilot CLI"
[7]: <https://antigravity.google/docs/permissions/> "Google, Antigravity: Permissions"
[8]: <https://antigravity.google/docs/agent-settings/> "Google, Antigravity: Agent settings"
[9]: <https://genai.owasp.org/llmrisk/llm01-prompt-injection/> "OWASP, LLM01: Prompt Injection"
[10]: <https://genai.owasp.org/llmrisk/llm062025-excessive-agency/> "OWASP, LLM06:2025 Excessive Agency"
[11]: <https://arxiv.org/abs/2302.12173> "Greshake et al., Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection"
