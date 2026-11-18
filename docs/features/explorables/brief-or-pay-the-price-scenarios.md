---
type: feature-guide
title: Scenario authoring guide
stale_after: 2027-05-18T00:00:00Z
---

# Scenario authoring guide

Read before writing or changing a Scenario file for the brief-or-pay-the-price Explorable. It is the whole contract of the file: what each field means, which problem the loader reports for which mistake, and a one-stage file that loads. A **Scenario**, an **Agentic workflow** and a **Stage** are defined in the [glossary](../../../GLOSSARY.md). A Cell is one BRIEF move against one PRICE trait in the Agent matrix; an Annotation is one drawn element a Scenario attaches to a BRACE letter. Spec: issue #703.

## One file, both languages

A Scenario is one YAML file named after its `id`, registered in the Explorable's list of Scenarios; the Workflow toolbar's picker shows every registered Scenario. Unlike a human-in-the-loop Workflow file, it holds both languages: the structure sits at the top level, and every visible string sits under `i18n.en` and `i18n.de`, keyed by id. The build throws every problem of a shipped Scenario.

Stages are agnostic: DRIVE is the first Scenario, not a built-in. A Scenario names no layout and no coordinates; the loader lays it out.

## Top level

All fields are required unless marked. Unknown fields are rejected at the top level and on Stages, nodes, Cells, edges and Annotations; the loader does not check `i18n` for extra locales or extra word keys.

| Field         | Holds                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`          | The Scenario's id: the file's name and the picker key.                                                        |
| `acronym`     | Optional: one letter per Stage, in order. It names the Stages tab; without it the tab is "Stages" / "Phasen". |
| `stages`      | At least one Stage, in drawing order: `{ id, scene }`.                                                        |
| `nodes`       | At least one node: `{ id, stage, cells }`. A node is one agent's piece of the Agentic workflow.               |
| `edges`       | `{ from, to }`, node ids; `to: goal` reaches the goal. At least one edge reaches the goal.                    |
| `annotations` | Optional: BRACE letter (`B`, `R`, `A`, `C`, `E`) → a list of Annotation primitives.                           |
| `i18n`        | `en` and `de`, each with every string below.                                                                  |

`goal` is reserved: no node may use it.

## Stages and scenes

A Stage's `scene` names its card animation on the Stages tab, picked from a fixed catalogue in the Explorable: `grill`, `plan`, `parallel`, `check`, `harden`, `draft`. A new scene is code, not YAML.

Nodes of one Stage run in parallel: the wide layout stacks them in the Stage's column, the narrow one sets them side by side in the Stage's row.

## Cells

A node's `cells` list the Cells its agent leans on: `{ id, move, trait }`, a BRIEF move id and a PRICE trait id.

- Moves: `break-it-down`, `requirements-first`, `interview-yourself-with-ai`, `evaluate-each-step`, `fresh-start-for-each-piece`.
- Traits: `probabilistic`, `relentless`, `informed`, `confident`, `every-word-billed`.
- A Cell id is unique within its node. Parallel nodes share Cells, and their words, through a YAML anchor: `cells: &implement` on the first, `cells: *implement` on the next.
- A Cell outside the counters table is allowed: it renders outlined, labelled "in this context". The loader does not check it.

## Annotations

Each BRACE letter holds a list of primitives, each a mapping keyed by `type`. A field the primitive doesn't have is a shape problem. Edges are referenced as `from>to`.

| `type`      | Fields                                                        |
| ----------- | ------------------------------------------------------------- |
| `highlight` | any of `nodes`, `edges`, `stages`, `goal: true`               |
| `arrow`     | `from`, `to` (node or `goal`), `route: under \| over`, `text` |
| `group`     | `nodes`, `text`                                               |
| `tag`       | `node`, `text`                                                |
| `chip`      | `edge`, `text`                                                |
| `mark`      | `nodes`, `kind: intent \| chunks \| check`                    |

`text` is a text id, its words under `i18n.<locale>.annotations`. Steps are cumulative: step n shows letters 1..n and lights only letter n, so draw each letter for what it adds. A `chip` names the contract handed over on its edge; keep it to two or three words, since it is sized to its edge.

## Words

Under each of `i18n.en` and `i18n.de`:

| Key           | Holds                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| `title`       | The picker title.                                                                          |
| `stages.<id>` | `name`, `short` (the card face line), `analogy` (the freelancer card), `ai` (the AI card). |
| `nodes.<id>`  | `label` and `role`; the role hides on a node too narrow for it.                            |
| `cells.<id>`  | `freelancer` and `ai`: this node's example of the Cell.                                    |
| `annotations` | Every text id an Annotation names.                                                         |

Stage names stay as written in both locales when an acronym spells them (DRIVE's Define … Evolve).

## A complete one-stage file

```yaml
id: guide-fixture
stages:
  - { id: draft, scene: draft }
nodes:
  - id: write
    stage: draft
    cells:
      - { id: write-br, move: break-it-down, trait: relentless }
edges:
  - { from: write, to: goal }
annotations:
  B:
    - { type: arrow, from: goal, to: write, route: under, text: b-arrow }
i18n:
  en:
    title: One agent, one draft
    stages:
      draft:
        { name: Draft, short: One draft, analogy: The freelancer writes the draft., ai: The agent writes the draft. }
    nodes:
      write: { label: Write, role: One agent }
    cells:
      write-br: { freelancer: 'One section at a time.', ai: 'One section per chat.' }
    annotations:
      b-arrow: plan backwards from the goal
  de:
    title: Ein Agent, ein Entwurf
    stages:
      draft:
        {
          name: Entwurf,
          short: Ein Entwurf,
          analogy: Der Freelancer schreibt den Entwurf.,
          ai: Der Agent schreibt den Entwurf.,
        }
    nodes:
      write: { label: Schreiben, role: Ein Agent }
    cells:
      write-br: { freelancer: 'Ein Abschnitt nach dem anderen.', ai: 'Ein Abschnitt pro Chat.' }
    annotations:
      b-arrow: vom Ziel rückwärts planen
```

## Problems the loader reports

Every problem names the file and the path to the field, and the loader reports all of them at once.

| Mistake                                                                                       | Problem names                                                                                                                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A field missing, of the wrong type, or unknown                                                | the field; a missing `i18n.<locale>` names `i18n.<locale>`                                                                                  |
| `acronym` not one letter per Stage                                                            | `acronym`                                                                                                                                   |
| An id used twice (Stage, node, Cell within its node)                                          | the id                                                                                                                                      |
| A node named `goal`                                                                           | the node                                                                                                                                    |
| A `scene` outside the catalogue                                                               | the Stage's `scene`, with the catalogue                                                                                                     |
| A node's `stage`, an edge end or an Annotation target that does not resolve                   | the reference; an arrow end names the Annotation (`annotations.B[0]`), other targets name the field (`.nodes`, `.node`, `.edge`, `.stages`) |
| A Cell's `move` or `trait` that is not a BRIEF move or PRICE trait                            | the Cell                                                                                                                                    |
| No edge reaching the goal                                                                     | `edges`                                                                                                                                     |
| An `annotations` key that is not a BRACE letter, an unknown `type`, a wrong `route` or `kind` | the Annotation                                                                                                                              |
| A string missing in one locale                                                                | `i18n.<locale>.title`, `i18n.<locale>.<key>.<id>.<field>` or `i18n.<locale>.annotations.<id>`                                               |

The Scenario registry adds one problem of its own: a shipped Scenario whose `id` is not its registered file name, naming `id`.
