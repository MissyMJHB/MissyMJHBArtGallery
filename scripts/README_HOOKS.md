Git hooks (local)

This repository includes a local git hook to prevent accidental direct pushes to main/master.

Files provided:
- .githooks/pre-push  -- blocks pushes when current branch is 'main' or 'master'
- scripts/install_hooks.ps1 -- sets git config core.hooksPath to .githooks for this repo

Install steps (recommended):
1. From the repo root run (PowerShell):
   .\\scripts\\install_hooks.ps1

2. Confirm git now uses .githooks:
   git config core.hooksPath

Notes:
- This is a client-side safety measure. For secure enforcement, enable branch protection rules on the remote (e.g., GitHub/GitLab) to prevent direct pushes to main.
- To temporarily bypass the hook locally (not recommended), set environment variable ALLOW_PUSH_MAIN=1 and then push. This should be used only by trusted admins.
