# Agent instructions (MIMTCA)

## Work log rule (every agent: Claude, Codex, Cursor, people)

1. **Before you start:** read `docs/AGENT_HANDOFF.md`, `docs/PROJECT_STATUS.md`, `docs/TASK_QUEUE.md`, `docs/DEPLOYMENT.md`, `docs/DECISIONS.md`, the top of `WORKLOG.md`, and the titles of open pull requests. If the same work is `active` or has an open PR, continue it or pick other work.
2. **Claim it:** add one line at the top of the log with status `active`.
3. **Before you stop:** update your line (`done`, `PR #n`, `blocked: reason`) and the next step. Commit and push it with your work.
4. One line per piece of work, newest first.
5. Update the five docs with the verified SHA, CI status, blockers, real deployment status, and exact next task before stopping.
6. These files are a relay for an authorized external orchestrator; no prompt can restart a terminated chat by itself.

Line format: `YYYY-MM-DD | agent | branch → PR | status | what | next step`

## Scope

MIMT owns telecom: accounts, numbers, voice, SMS/MMS, voicemail, telecom billing and Twilio. TAKATAK owns identity and activation. Do not edit TAKATAK repositories from here. Coordinate TAKATAK-side changes (for example the dashboard's MIMT client) with the TAKATAK agent.

## Rules

- Follow `docs/BRAND.md`: electric blue on deep navy. Green is for status only.
- French first in all user-facing text.
- 9-1-1 is never blocked. Tests in `apps/api` enforce this; never weaken them.
- No secrets in code, logs, chat or URLs.
- Never skip or disable a test to get CI green.
