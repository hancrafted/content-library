# Drive learnings

One entry per Operator correction, logged at once, and per Fortify option that was not picked, with a recurrence
count. Fortify reads this file for past proposals.

- Enforcer detection covers Node repos only (package.json scripts, husky, .archgate); non-Node manifests (pyproject, uv, Cargo, go.mod) are not detected yet. Deferred from review checkpoint 2.
