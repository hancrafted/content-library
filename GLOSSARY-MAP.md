# Glossary map

## Contexts

- [Content library](./GLOSSARY.md): the site, its Episodes, Explorables, Events and the evidence behind them.
- [Factory](./tools/factory/GLOSSARY.md): the machinery that makes them, and later other one-person businesses' digital work.
- [Drive](./.agents/skills/drive/GLOSSARY.md): how an Orchestrator runs a Workflow with the Operator and Subagents. It ships with the `/drive` skill, so it holds no word of this repo.

## Relationships

- **Factory → Content library**: the Factory makes Episodes. The content library decides what an Episode must be; the Factory decides how it is made.
- **Drive → Content library**: `new-episode` is Drive's first instance: its orchestrator is a Drive Orchestrator running an Episode Run. It is to shrink to its domain specifics and run on `/drive`.
- **Drive → Factory**: the Factory may run its software work as a Drive Workflow. **Operator** means the same person in both.
- **Shared words**: Run, Job, Stage, Gate, Attempt, Span and Score are defined for an Episode's per-run pipeline in `GLOSSARY.md` until the _Factory vocabulary_ issue generalises them. A word means what the context of the file you are in says. **Workflow** is the human-in-the-loop Explorable's way of working in the content library, and the orchestrated process `/drive` runs in Drive.
