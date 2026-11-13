#!/bin/sh
# `tools/test-budget/file-issue.sh <title> <body>`: the Nightly workflow's one way to file a finding. Comments on the
# open issue with exactly this title, or opens it with `needs-triage`, so a finding that recurs nightly stays one issue.
# Needs GH_TOKEN.
title=$1
body=$2
open=$(gh issue list --state open --search "in:title \"$title\"" --json number,title \
  --jq ".[] | select(.title == \"$title\") | .number" | head -1)
if [ -n "$open" ]; then
  gh issue comment "$open" --body "$body"
else
  gh issue create --title "$title" --label needs-triage --body "$body"
fi
