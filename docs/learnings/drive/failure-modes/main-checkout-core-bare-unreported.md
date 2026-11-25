---
type: failure-mode
stale_after: 2026-12-19
title: 'The main checkout is found with `core.bare=true` and nothing reports it'
enforcer: 'check: new check in `npm run preflight` plus a temp-repo test, quick win'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/797
fixed-by: https://github.com/hancrafted/content-library/commit/db4b92c0ff42e11c60b640f53f6ae22530a560d7
fixed-on: '2026-11-19'
---

# The main checkout is found with `core.bare=true` and nothing reports it

## Symptom

The main checkout is found with `core.bare=true` mid-run and no command reports it; someone resets it by hand.
