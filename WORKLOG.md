# Work log

Newest first, one line per piece of work. Rule: `AGENTS.md` › Work log rule.
Format: `YYYY-MM-DD | agent | branch → PR | status | what | next step`

- 2026-10-15 | GPT-6 (TEL-01 readiness) | main | done (code/test only; schema production pending) | /readyz via PostgresRepository.ping now requires 24 MIMT tables with RLS enabled, tests on isolated PostgreSQL for missing schema and disabled RLS; CI #38776170530 green at 5c30e035 | Next: provision isolated MIMT Supabase, apply and audit all migrations, configure secrets, check live /readyz; do not enable CD before real evidence

- 2026-10-15 | GPT-6 (SECURITY-03B shared limiter) | main | done (code/CI; DB production pending) | Added transactional PostgreSQL shared buckets, HMAC-SHA256 private keys, fail-closed DB outage handling, migration + isolated PostgreSQL 16 CI concurrency tests and safe expiry pruning; full CI #38775431115 successful at e5079982 | Next: provision independent MIMT Supabase, apply/review migration, configure RATE_LIMIT_HMAC_KEY; Fastify IP limiter and other jobs still not distributed; keep CD disabled

- 2026-10-15 | GPT-6 (SECURITY-03A bounded buckets) | main | done (distributed deployment pending) | Capped in-memory token buckets to 50,000 active keys with fail-closed overflow, idle bucket sweeping, clock rollback handling and invalid input guards; 3 regression tests; full CI #38734095766 green at 4d0f81c6 | Next: implement atomic shared limiter before scaling beyond one API instance, no effect on 9-1-1 override

- 2026-10-14 | GPT-6 (WEB-04 link attribute audit) | agent/web04-link-attributes-20261014-3 → PR pending | done (local 7/7; full CI pending) | Fixed false-positive data-href/data-id in static link audit, 3 regression tests; separate from WEB-02 and 9-1-1 | Open PR, verify full CI, merge only if green; no deployment

- 2026-10-14 | GPT-6 (MIMT WEB-02 consent integrity) | main | active | Align canonical FR/EN marketing consent copy across website/API, reject tampered opt-in evidence, add regression tests; no production deployment | Finish guarded change, run CI, update five handoff docs

- 2026-10-14 | GPT-6 (MIMT SECURITY) | main | done (prod config pending) | Replaced Fastify trustProxy=true with explicit CIDR allowlist, validated CIDR config, added client IP regression tests; CI 38626239265 success at 319e8794 | Owner: confirm reverse proxy IP/CIDR before API deployment; no telecom deployment verified

- 2026-10-14 | GPT-6 (MIMT WEB-04) | main | done | Added link/fragment auditor for bilingual site and four Node regression tests; enforced in CI after export, run 38625918929 success at 501839f9 | Next: verify live English parity, missing legal/provider approvals and server deployment access

- 2026-10-14 | GPT-6 (MIMT WEB-01) | main | done (live approval pending) | Audited live French website vs source; reconciled AI/compare; added backup-first no-delete SSH release guard and 28-route bilingual launch/9-1-1 export regression checks; CI success at aaa8b629 | Next: audit live English pages, validate editorial/legal differences, verify hosting and secure CD approvals, then API/DB rollout

- 2026-10-14 | codex (MIMT orchestration) | hourly external schedule | done | Configured authorized hourly GitHub resumption using the five handoff documents, guarded deploy and real CI evidence | On next invocation: check current HEAD and CI, continue the highest unblocked TASK_QUEUE item; report actions
- 2026-10-14 | codex (MIMT hardening) | main | done (production blocked) | Added public form collector with tests and RLS migration, five handoff docs, Coolify API deploy workflow and site forms build variable; CI verified through d4b168d | Owner: create dedicated Supabase MIMT project, deploy API, verify mimt.ca hosting and SSH, configure GitHub vars/secrets, validate telecom/legal
- 2026-10-14 | codex (MIMT website) | main | blocked: live SSH target not configured | Restored FR/EN AI, compare and web app pages, navigation and home; CI builds and verifies 28 routes, exports artifact; added guarded SSH deployment and documented prerequisites | Owner: verify real mimt.ca document root, configure GitHub Actions vars/secrets, add .mimt-web-managed marker; review legal and 9-1-1 before telecom launch
- 2026-10-09 | cursor (MIMT) | main | done | Phase-1 gaps in code: Quebec tax lines, Cuba SIP trunk, AdMob SSV, device bind, Apple/Google receipt checks, private voicemail copy, Sentry/Better Stack/daily Twilio cost, guardrails script. Gate 3 client is in the local takatak-v1 VoIP files (not pushed; homepage, AI, and Social untouched) | owner: Twilio sub-account, Supabase Canada, Coolify secrets, store accounts, push the TAKATAK Gate 3 branch
- 2026-10-09 | claude (MIMT agent 2, session 01GtWamF) | main | done | Bootstrap: shared package, API (125 tests), mobile app (29), website (22 pages), DB schema, CI | owner: Twilio sub-account + secrets, Supabase MIMT project; dev: deploy API on Coolify, apply migrations, dev build on a real phone, first real call
