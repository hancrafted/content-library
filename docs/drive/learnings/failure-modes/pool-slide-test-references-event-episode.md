---
title: "A pool Slide's test references a by-event Episode, and nothing checks it"
enforcer: 'adr-checker: archgate, new rule in ARCH-003-testing over `src/episodes/slide-pool/**/*.test.ts`, quick win'
status: proposed
---

# A pool Slide's test references a by-event Episode, and nothing checks it

## Symptom

A test of a shared pool Slide renders through a by-event Episode copy, so the test breaks when the Event copy changes and nothing checks it.
