---
type: research
title: 'Why do organisations tier, own and review shared skills the way they do today, treating them like knowledge articles with an owner and a review date?'
description: 'Shared skills are governed like controlled knowledge: tiered by audience, reviewed by someone else, registered with owner and version; fixed review dates are advice, not a feature.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-12T00:00:00Z
stale_after: 2027-05-12T00:00:00Z
sources:
  - id: 1
    resource: https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030
    title: 'Consortium for Service Innovation, KCS v6 Practices Guide, Technique 5.2: KCS Article State'
  - id: 2
    resource: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise
    title: 'Anthropic, Skills for enterprise'
  - id: 3
    resource: https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization
    title: 'Anthropic, Provision and manage skills for your organization'
  - id: 4
    resource: https://code.claude.com/docs/en/plugins/org.md
    title: 'Anthropic, Manage Claude Code plugins for your organization'
  - id: 5
    resource: https://code.claude.com/docs/en/plugins/host-marketplace.md
    title: 'Anthropic, Host and maintain a marketplace'
  - id: 6
    resource: https://agentskills.io/specification
    title: 'Agent Skills, Specification'
  - id: 7
    resource: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills
    title: 'GitHub, Adding agent skills for GitHub Copilot'
---

# Why do organisations tier, own and review shared skills the way they do today, treating them like knowledge articles with an owner and a review date?

## Context

Asked to support the claim that a skill someone shares with colleagues needs the controls a company knowledge article has: a named owner, a version and a review date, and that organisations separate widely shared skills from narrow ones. The question is what vendor documentation and knowledge-management practice actually prescribe, as opposed to what would be a sensible analogy.

## Answer

Organisations treat shared skills as controlled content because a shared skill changes what every user's agent does, and because it can run code, so one author's edit reaches everyone. The vendor guidance converges on the same controls as knowledge management: a registry entry with purpose, owner and version; review by someone other than the author; a fixed approved version that users stay on until a new one is approved; and tiers by audience, from personal through shared groups to organisation-wide. Knowledge-Centered Service (KCS) supplies the article-side model of confidence states, restricted editing rights and archiving instead of deleting, but it ties review to reuse, not to a calendar. Anthropic's guidance names an owner and last evaluation date; a fixed review date, and named tiers such as "universal" or "product-specific", are practice you apply yourself, not a feature of any product examined here.

## Findings

1. KCS gives each knowledge article a confidence state: Work in Progress (no resolution yet), Not Validated (a resolution, but not trusted yet), Validated ("considered complete and reusable, and we are confident in it") and Archived. Validation depends on the author's confidence and on compliance with the content standard [1].
2. KCS restricts who may change an article by role: Candidates "can only create and modify Not Validated articles", which a Coach reviews, and a Publisher can modify a Validated article. Its governance attribute can also restrict creating and editing to designated individuals or groups. Audience runs from Internal through Partners and Customers to Public [1].
3. KCS does not review on a schedule: "Let reuse of Not Validated articles be the review", and "If we are reviewing articles in absence of demand, we are not doing KCS". The page does not use the word "owner"; responsibility is a "flag it or fix it" culture. It also prefers archiving to deleting, because deleting can break links, and an archived article can be restored [1].
4. Anthropic's enterprise guidance says to keep an internal registry entry per skill with purpose, owner ("Team or individual responsible for maintenance"), version, dependencies and evaluation status including the last evaluation date, and to document a deployed skill "with purpose, owner, and version" [2].
5. The same guidance requires separation of duties ("Skill authors should not be their own reviewers"), a security review checklist, and evaluation suites for triggering, coexistence and output quality before approval. It says to rerun evaluations periodically to detect drift and to deprecate a skill whose evaluations consistently fail or whose workflow is retired [2].
6. Review is demanded because a skill can carry scripts and instructions that run with the user's access: the guidance rates code execution, MCP references, network calls and hardcoded credentials as high concern, and tells admins to "treat Skill installation with the same rigor as installing software on production systems" [2].
7. For production, Anthropic's guidance says to pin a skill to a specific version, because omitting the version means "a new version uploaded by anyone in the workspace immediately changes what production agents run", and to keep the previous version as a rollback [2].
8. Anthropic's tiers by audience in claude.ai are personal skills, skills shared with individuals (view-only, off until the recipient enables them), group-targeted skills bundled in a plugin (Enterprise), and organisation-wide skills that only owners can add or remove and users can switch off but not delete [3].
9. Anthropic's org library offers three publishing modes: Requires review, Open and Off. A reviewer, an owner or a role with library management rights, approves "a fixed version", and users stay on the approved version until a new submission is approved. A published item stays in the library if its author leaves [3].
10. Reviewers also set the access level per item or group: Available to install, Installed by default, Not available or Required [3].
11. For Claude Code, administrators register an organisation marketplace and force-enable named plugins through managed settings, restrict which marketplace sources are allowed, and block individual plugins. Marketplace allowlists restrict sources, not entries inside an allowed marketplace [4].
12. A marketplace owner releases a version by changing its `version`, or tracks commits by omitting it. Pins can be held with `ref` and `sha`, and two marketplaces pointing at different refs of the same plugin give stable and early-access channels. The marketplace has no deprecation state: removal is done by deleting the entry and mapping its name to `null` in `renames` [5].
13. The open Agent Skills format has no owner, version or review-date field of its own. Its optional `metadata` field is a free key-value map, and the specification's own example stores `author` and `version` there [6].
14. GitHub Copilot's skills documentation describes only project and personal skill locations and warns that skills "are not verified by GitHub". Its `gh skill` tool installs a skill at a `@TAG` or `@SHA`, records provenance in the frontmatter, and skips pinned skills during updates [7].

## Caveats

- No source defines "an owner and a review date" for skills as a rule; the pairing comes from reading KCS and the Anthropic registry guidance together. KCS itself has no owner role and reviews by reuse, so a calendar review date is an adaptation, not KCS practice.
- Document control in ISO 9001 (identification, review and approval, version control) was meant as a second knowledge-management source, but the standard's text is paywalled and could not be read here, so no claim rests on it.
- The tier names of the question's framing, such as universal, team or product-specific, are not vendor terms. Vendors tier by audience and delivery (personal, shared, group, organisation) and by risk, not by how general the content is.
- GitHub documentation read here shows no organisation-level skill location; this may change. OpenAI's help article on Skills in ChatGPT, which describes workspace sharing and admin roles for sharing skills, could not be fetched, so ChatGPT is not covered by any Finding.
- Anthropic's guidance describes what to require of authors and reviewers; the sources do not show how many organisations do so, and no survey of adoption was found.

[1]: <https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030> "Consortium for Service Innovation, KCS v6 Practices Guide, Technique 5.2: KCS Article State"
[2]: <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise> "Anthropic, Skills for enterprise"
[3]: <https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization> "Anthropic, Provision and manage skills for your organization"
[4]: <https://code.claude.com/docs/en/plugins/org.md> "Anthropic, Manage Claude Code plugins for your organization"
[5]: <https://code.claude.com/docs/en/plugins/host-marketplace.md> "Anthropic, Host and maintain a marketplace"
[6]: <https://agentskills.io/specification> "Agent Skills, Specification"
[7]: <https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills> "GitHub, Adding agent skills for GitHub Copilot"
