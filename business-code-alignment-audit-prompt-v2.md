# Business-Code Alignment & Operational Readiness Audit — v2
### (Aligned to ENGINEERING_PLAYBOOK.md)

Copy everything below into your agentic AI tool, pointed at the target repo.
Attach or ensure `ENGINEERING_PLAYBOOK.md` is accessible to the agent — either
committed in the repo or pasted alongside this prompt.

---

## GOVERNING STANDARD

This audit is governed by **`ENGINEERING_PLAYBOOK.md`** — the project's
engineering doctrine covering documentation requirements, lifecycle gates,
MERN/Expo architecture, backend/database/web/mobile rules, API contracts,
auth & authorization, security baseline, testing strategy, observability,
CI/CD, performance, provider adapters, webhooks/idempotency, identity/KYC/KYB,
admin operations, secret hygiene, AI agent rules, the Production Readiness
Matrix, and the Definition of Done.

**Locate this file first.** Check repo root, `/docs`, `/docs/engineering`, or
any path referenced in the README. Read it in full before doing anything
else — it defines what "aligned," "operational," "production-ready," and
"done" mean for this specific audit. Do not substitute your own general
judgment or generic best-practice assumptions for its specific rules.

If `ENGINEERING_PLAYBOOK.md` cannot be found anywhere in the repo, **STOP**
and tell me. Ask me to point you to it or paste it in before proceeding.

---

## ⛔ NON-NEGOTIABLE OPERATING RULES — READ FIRST

1. **This is a read-only audit.** Read, search, grep, and run non-mutating
   commands (tests in read-only mode, typecheck, lint, dependency audit) to
   gather evidence. Do NOT create, edit, delete, or refactor any file. Do NOT
   run migrations, install/remove packages, or change config.
2. **No exceptions for "obvious" or "safe" fixes.** Every fix — however
   small — goes into the Remediation Roadmap (Phase 7) as a proposal, not
   an action.
3. **Every proposed fix is a numbered, individually approvable item.**
   Nothing gets implemented until I approve specific item numbers in a
   follow-up message.
4. **If and when I approve items, implementation must follow Playbook
   Section 23 (AI Agent Implementation Rules) exactly**: read the existing
   feature folder and shared patterns first, preserve naming/architecture/
   error-handling/state-management conventions already in use, introduce no
   new abstraction or dependency unless the existing codebase already
   supports it or the change clearly requires it, run typecheck/lint/tests
   after each change, update docs/checklists if behavior changed, and list
   remaining blockers. Show each diff for my confirmation before moving to
   the next approved item.
5. If the audit itself is ambiguous, or the playbook conflicts with a
   project-specific doc, say so explicitly and note which you treated as
   authoritative and why — don't silently pick one.

---

## PHASE 1 — Documentation Discovery (mapped to Playbook §2)

Check for the exact `docs/` structure the playbook prescribes:

```
docs/README.md
docs/product/PRODUCT_BRIEF.md, USER_FLOWS.md, FEATURE_MAP.md, FUTURE_IDEAS.md
docs/engineering/ARCHITECTURE.md, API_CONTRACT.md, DATA_MODEL.md,
  SECURITY_SWEEP.md, ROUTE_GUARD_AUDIT.md, PERFORMANCE_REVIEW.md,
  CURRENT_PRECEDENCE_LIST.md
docs/playbooks/OPERATIONAL_RUNBOOK.md, RELEASE_RUNBOOK.md,
  INCIDENT_RESPONSE.md, ENVIRONMENT_SETUP.md
docs/decisions/ADR-*.md
docs/provider/PROVIDER_ADAPTER_CONTRACT.md, PROVIDER_READINESS.md
docs/reviews/CODE_QUALITY_AUDIT.md, PRODUCTION_READINESS_REVIEW.md
```

For each, report **present** (with path) or **missing**.

Separately, flag the status of the **seven minimum documents before
production** the playbook names: product brief, architecture overview, API
contract, data model, security sweep, operational runbook, and current
precedence list. Any of these seven that are missing is a documentation gap
in its own right — call it out distinctly from feature-level gaps.

Also collect any other business-intent docs found elsewhere in the repo
(README, package.json description, inline top-of-file comments, etc.) —
don't assume `docs/` is the only source, but treat the playbook's structure
as the expected target state and measure the gap against it.

## PHASE 2 — Build the Ground-Truth Requirements Model

From all documents found in Phase 1 (and only these), extract:

1. Core business goal / problem being solved
2. Target user(s) / roles
3. Every distinct feature or capability claimed or specified
4. The authorization matrix, if one exists (Actor | Action | Resource |
   Allowed When — per §10 format)
5. Documented verification states (KYC/KYB), if applicable — per §20
6. Documented provider adapters and their contracts, if applicable — per §18
7. Anything explicitly marked out-of-scope, future work, or non-blocking in
   `CURRENT_PRECEDENCE_LIST.md` if it exists

Present as a numbered list, citing the source document for each item. Flag
conflicts between documents (e.g., an ADR that contradicts the current
architecture doc) and state which you're treating as authoritative.

## PHASE 3 — Feature-by-Feature Code Verification

For each item from Phase 2, search the code and determine its real status.
No inference — every verdict needs a file path and line number.

| Tag | Meaning |
|---|---|
| ✅ IMPLEMENTED | Cite file(s) and line(s) as evidence |
| ⚠️ PARTIAL | Describe exactly what's missing vs. built |
| ❌ NOT IMPLEMENTED | Documented but no corresponding code found |
| 🔍 UNDOCUMENTED | Exists in code, not mentioned in any doc |
| 📝 DOC-CODE MISMATCH | Doc claims one thing, code does another |

## PHASE 4 — Playbook Compliance Audit

This is the core of the alignment check. Go through each applicable playbook
section and audit the real code against it — cite the section, the rule, a
verdict, and file:line evidence. Mark each as ✅ Compliant / ⚠️ Partial /
❌ Non-compliant / N/A (genuinely not applicable to this product).

- **Backend (§5)** — route handlers stay thin (auth, validation, one service
  call, response only); business logic/money math/provider calls live in
  services, not routes; central error handler with a stable error shape;
  background jobs are idempotent with retry limits and correlation IDs.
- **Database (§6)** — collections documented (purpose, indexes, retention,
  sensitive fields); every frequent query is index-backed; multi-document
  atomic actions use transactions or an explicit state machine; money is
  stored as integer minor units or Decimal128, never floating point;
  pagination is cursor-based, not unbounded `find()`.
- **Web (§7)** — feature-based folder structure; server-state library
  (RTK Query/TanStack/Apollo) owns server truth, not Redux/Context directly;
  forms use schema validation with duplicate-submit protection; every screen
  handles loading/empty/error/retry/success/permission-denied states.
- **Mobile (§8, if applicable)** — secure storage for sensitive values; the
  actual device-trust tier in use (soft tracking vs. software-signed vs.
  hardware-backed) vs. what the product's risk level requires; deep link
  params treated as untrusted and re-validated server-side; push tokens
  bound to session with rotation/unregister-on-logout; evidence of testing
  outside Expo Go for release-critical behavior.
- **API Contract (§9)** — every endpoint documents method/path, auth
  requirement, request/response shape, error codes, idempotency behavior,
  and rate-limit behavior; breaking changes are versioned.
- **Auth & Authorization (§10)** — authentication and authorization are
  clearly separated in code; refresh rotation and session revocation exist;
  every route in the authorization matrix has tests for unauthenticated,
  wrong-user, wrong-role, revoked-user, and wrong-ownership cases. **This is
  where BOLA/BFLA gaps get caught explicitly — flag any route with an
  authorization check present on one action but silently missing on a
  sibling action for the same resource.**
- **Security Baseline (§11)** — server-side input validation, NoSQL
  injection protection, rate limiting on auth/high-cost routes, Helmet/CORS
  configured, secrets never logged, passwords/OTPs/reset tokens hashed,
  webhook signatures verified against the raw body, file upload limits and
  scanning if applicable.
- **Testing (§12)** — presence of each test layer (unit, API integration,
  DB, web E2E, mobile E2E, contract, load) relative to what the product
  needs; required test cases present per production feature (happy path,
  validation failure, unauthorized, wrong-owner, duplicate submission,
  provider failure, expired token).
- **Observability (§13)** — structured logs with request ID/user ID/
  route/status/duration; no sensitive values logged; Sentry or equivalent
  wired for server/web/mobile with release tracking; `/health/live` and
  `/health/ready` exist and readiness actually reflects dependency health;
  key metrics tracked.
- **CI/CD (§14)** — pipeline runs install/typecheck/lint/tests/build/audit
  on every PR; release rules followed (no dirty-worktree deploys, migrations
  reviewed, env vars verified before startup, rollback path known).
- **Performance (§15)** — indexes back frequent queries, no N+1 provider/DB
  calls, external calls have timeouts, expensive reads are cached, mobile
  tested on low-end devices if relevant to the user base.
- **Provider Adapters (§18, if applicable)** — the
  `Controller → Service → Adapter → Provider` pattern is actually followed;
  no controller calls a provider SDK directly; no provider secret reaches
  the frontend; responses are normalized (not raw provider fields leaking
  into product state, e.g. `monnifyStatus` used as business truth).
- **Webhooks & Idempotency (§19, if applicable)** — signatures verified on
  raw body, events deduplicated by provider event ID, processing is
  idempotent, and idempotency keys are enforced on every money/ownership/
  scarce-resource action the playbook lists (checkout, escrow creation,
  payout/refund, KYC session start, invitation acceptance, etc.).
- **Identity/KYC/KYB/Device Trust (§20, if applicable)** — verification
  state is modeled explicitly (not a single `isVerified` boolean); the
  provider supplies evidence but the backend decides policy; business
  (KYB) verification doesn't silently grant admin or financial authority.
- **Admin & Internal Ops (§21, if applicable)** — admin auth is separate
  from user auth, admin actions are audited, admins request domain
  operations rather than mutating data or calling providers directly from
  the frontend.
- **Env Vars & Secret Hygiene (§22)** — `.env.example` exists and is
  current, startup fails fast on missing required secrets in strict mode,
  no real secret is committed to git.

## PHASE 5 — Production Lifecycle Gate Assessment (mapped to Playbook §3, §24, §25)

For each feature, determine which lifecycle gate it has **actually** cleared
— Gate 0 Discovery, 1 Foundation, 2 Build, 3 Hardening, 4 Launch, 5 Operate
— based on evidence, not on what any doc or commit message claims. Use the
exact checklist items under each phase in §3. State the highest gate cleared
and precisely what's blocking the next one.

Then apply the **Production Readiness Matrix (§24)** row by row across the
whole product — Product, Auth, Authorization, Database, Providers, Webhooks,
Files, Mobile, Observability, Rate Limits, Secrets, CI/CD, Runbooks — marking
each **Ready** or **Blocking** with evidence.

Finally, for any feature described as "done" anywhere in the docs or commit
history, verify it against the applicable **Definition of Done (§25)**
checklist (normal feature / provider-backed / security-sensitive / mobile
feature) and flag any that were marked done prematurely.

## PHASE 6 — Deliver the Report

1. **Executive Summary** (3–5 sentences: alignment + operational health)
2. **Documentation Coverage** — §2 structure found vs. missing, minimum
   7 docs status
3. **Feature-by-Feature Alignment Table** (Feature | Doc Source | Status |
   Evidence)
4. **Playbook Compliance Scorecard** (Phase 4, section by section)
5. **Lifecycle Gate Assessment + Readiness Matrix + DoD Check** (Phase 5)
6. **Discrepancies & Doc-Code Mismatches** (ranked by severity/risk)
7. **Undocumented Functionality** (scope creep vs. possibly-lost
   requirements)
8. **Blocking Gaps** — what genuinely stands between this and launch,
   per the Readiness Matrix
9. **Remediation Roadmap** (Phase 7)

## PHASE 7 — Remediation Roadmap (Proposals Only — Nothing Applied)

Numbered, individually approvable list. For each item:

- What the fix is (description or illustrative diff — not applied)
- Which playbook section / doc requirement it closes
- Risk level if left unaddressed (Critical / High / Medium / Low)
- Rough effort estimate

Close with this exact statement:

> "No code has been changed. Reply with the item numbers you want me to
> implement. I will follow Playbook §23 for each — reading existing patterns
> first, preserving conventions, running typecheck/lint/tests, and updating
> docs — implementing one item at a time and showing each diff for
> confirmation before proceeding to the next."

---

## GENERAL RULES

- Every claim needs a file path or doc citation. No unverified claims.
- Where the playbook and a project-specific doc disagree, flag it rather
  than resolving it silently.
- Do not pad the report with generic advice the playbook doesn't already
  cover for this codebase.
- Do not modify, create, or delete any file at any point during this audit.
