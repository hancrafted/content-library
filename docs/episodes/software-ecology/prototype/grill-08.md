# Grill 08 (2026-11-12): toolbar in one row

Answers to Q138–Q148, verbatim, then the settled design.

- Q138: option 1 and we merge swing and roles into one, so the card should show the current role view + the cartoon quote is visible next oder under the image.
- Q139: 1, default is 1x
- Q140: move upload downdown into the ... menu as well
- Q141: 1
- Q142: 1
- Q143: 1
- Q144: more like tire swing 2.0?
- Q145: 1, also instead of engineer, lets use department/org name so engineering, apply for rest as well
- Q146: 1
- Q147: 1
- Q148: 1, ba => show only Analysis (in artefact we have Spec, ADR, Design, Data model)
- Confirmation: ok

## Settled

- Toolbar, one row at laptop width: `[Tire swing 2.0 | Ideal | Realistic●] [Scenarios▾] [▶ Tour] 🗨 [⊞ Compare] [⏸ 1×▾ ⟲ Week n · Day d] [🏭 use case▾] [⚙]`. Below laptop width it wraps; sticky from 768 px.
- Swing and Roles merge into one state, preset id `roles` (`swing` loads as `roles`); its label is per use case: "Tire swing 2.0" on Tire swing, "Roles" elsewhere. The "modified" mark is a dot on the active state.
- Speed is a menu; the page starts at 1×; tours still run at 10× between steps and give back the viewer's speed.
- "Fix the orders first" becomes its Context marker icon beside Tour, tooltip "Fix the orders first", opening "Muddy instructions cost accuracy".
- Removed from the toolbar: the use-case description and "What to watch" lines (the Scenarios menu and tour box carry them), Download/Upload, the Rework/Churn/Complaints toggles, Dark theme (the site header owns it).
- One settings popover replaces Model and ⋮: up to 720 px wide, kept inside the window, three columns Model (Ideal…Realistic, AI where, Company, AI quality, Back to the state) · Mechanics (Rework, Churn, Complaints switches and strengths) · Display (belt motion, pile-up style), File (Download YAML, Upload) at its foot; dropping a file still uploads. Columns stack on narrow screens.
- Merged-view card: department, job, cartoon panel, the cartoon quote under the panel, then artefacts. All three tiles stay (what the customer really needed, Documentation, Billing). Quality assurance and the use cases without a cartoon show no image.
- One title per work center, a department name in every view: Sales, Product management, Analysis, Support, Engineering, Quality assurance, Operations (de: Vertrieb, Produktmanagement, Analyse, Support, Entwicklung, Qualitätssicherung, Betrieb). Analysis's artefacts: Spec, ADR, Design, Data model. A role naming one person (Gatekeeper lead's lead) keeps its name.
- Built after the About Section merges, in `episode/software-ecology--toolbar-one-row`, with /tdd, /code-review and a Chrome pass; it overrules the approved Spec's toolbar (Option 1a).
