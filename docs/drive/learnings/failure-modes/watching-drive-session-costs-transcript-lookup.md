---
title: 'Watching a drive session by hand costs time on the transcript path and its UTC timestamps'
enforcer: 'test-runner: `drive transcript` finds the session and its Subagent transcripts and prints local time, pinned by skills/drive/scripts/log.slow.test.ts'
status: fixed
ticket: https://github.com/hancrafted/content-library/commit/de6c0ea0649c846d8a1d5640a1e0537b03d650a2
fixed-by: https://github.com/hancrafted/content-library/commit/de6c0ea0649c846d8a1d5640a1e0537b03d650a2
fixed-on: '2026-11-19'
---

# Watching a drive session by hand costs time on the transcript path and its UTC timestamps

## Symptom

Watching a drive session by hand costs time: the transcript path is not named, its timestamps are UTC and Subagent transcripts sit in a subfolder.
