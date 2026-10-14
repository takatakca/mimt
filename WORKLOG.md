# Work log

Newest first, one line per piece of work. Rule: `AGENTS.md` › Work log rule.
Format: `YYYY-MM-DD | agent | branch → PR | status | what | next step`

- 2026-10-14 | GPT-6 (MIMT SECURITY) | main | active | Restrict Fastify trusted proxies to explicit verified CIDRs; prevent X-Forwarded-For spoof of per-IP rate limits | Add tests, CI, docs

- 2026-10-14 | GPT-6 (MIMT WEB-04) | main | active | Add CI link/fragment integrity checking for all 28 static routes with test cases; audit launch gates | Verify CI, update docs and handoff; no deployment without verified hosting

- 2026-10-14 | GPT-6 (MIMT WEB-01) | main | done (live approval pending) | Audited live French website vs source; reconciled AI/compare; added backup-first no-delete SSH release guard and 28-route bilingual launch/9-1-1 export regression checks; CI success at aaa8b629 | Next: audit live English pages, validate editorial/legal differences, verify hosting and secure CD approvals, then API/DB rollout

- 2026-10-14 | codex (MIMT orchestration) | hourly external schedule | done | Configured authorized hourly GitHub resumption using the five handoff documents, guarded deploy and real CI evidence | On next invocation: check current HEAD and CI, continue the highest unblocked TASK_QUEUE item; report actions
- 2026-10-14 | codex (MIMT hardening) | main | done (production blocked) | Added public form collector with tests and RLS migration, five handoff docs, Coolify API deploy workflow and site forms build variable; CI verified through d4b168d | Owner: create dedicated Supabase MIMT project, deploy API, verify mimt.ca hosting and SSH, configure GitHub vars/secrets, validate telecom/legal
- 2026-10-14 | codex (MIMT website) | main | blocked: live SSH target not configured | Restored FR/EN AI, compare and web app pages, navigation and home; CI builds and verifies 28 routes, exports artifact; added guarded SSH deployment and documented prerequisites | Owner: verify real mimt.ca document root, configure GitHub Actions vars/secrets, add .mimt-web-managed marker; review legal and 9-1-1 before telecom launch
- 2026-10-09 | cursor (MIMT) | main | done | Phase-1 gaps in code: Quebec tax lines, Cuba SIP trunk, AdMob SSV, device bind, Apple/Google receipt checks, private voicemail copy, Sentry/Better Stack/daily Twilio cost, guardrails script. Gate 3 client is in the local takatak-v1 VoIP files (not pushed; homepage, AI, and Social untouched) | owner: Twilio sub-account, Supabase Canada, Coolify secrets, store accounts, push the TAKATAK Gate 3 branch
- 2026-10-09 | claude (MIMT agent 2, session 01GtWamF) | main | done | Bootstrap: shared package, API (125 tests), mobile app (29), website (22 pages), DB schema, CI | owner: Twilio sub-account + secrets, Supabase MIMT project; dev: deploy API on Coolify, apply migrations, dev build on a real phone, first real call
