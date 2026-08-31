# HANDOFF — read me first

This backend is a **working bootstrap** covering the full CareerForge API surface. It was built
against the existing frontend (`../frontend`) and audited via `productnote.md`. Everything below
tells you what state it's in and what to do next.

## Status: what works today

Verified end-to-end against a live MongoDB:

- signup / login / me / update-password, JWT auth, role guards (admin routes reject non-admins)
- job board: filters, search, pagination, company population; recruiter can post/edit/delete jobs
- applications: apply + duplicate check + recruiter inbox + status transitions (state machine
  enforced) + notifications to both sides + withdraw with applicants_count correction
- saved jobs, companies CRUD, notifications CRUD, admin users/audit/reports endpoints
- password reset: request + complete (single-use token), dev-mode link outside production
- admin platform stats (`/admin/stats`) and cross-company job search (`/admin/jobs`)
- mail adapter (dev console + Nodemailer SMTP), auto-link recruiter to company on create
- refresh token rotation with session revocation, token-family reuse detection
- **file uploads**: resume upload (PDF/DOC/DOCX/txt, 5 MB max, MIME allowlist) stored outside the app
  source in `UPLOAD_DIR` with immutable `FileRecord` metadata (sha256, mimetype, size, owner), signed
  time-limited download URLs (HMAC), tamper/expiry rejected
- recruiter can link their profile to any existing company via `PATCH /profiles/:id {company_id}`
  (validated against an existing company, students forbidden)
- **34 passing integration tests** (`npm test`, vitest + supertest + mongodb-memory-server) covering
  auth, dual-token flow, refresh rotation, reuse detection, password-reset + session invalidation,
  job ownership, application state machine, withdraw/re-apply, blocking with audit trail, every
  authorization boundary, recruiter company linking, and the file-upload/signed-URL lifecycle

### Frontend integration status (verified 2026-08-31)

- **Route guards:** `ProtectedRoute` with role-based `allowedRoles` wraps student, recruiter, and
  admin route groups in `AppRoutes.tsx`. `PublicOnlyRoute` wraps auth pages.
- **Token consolidation:** Single HTTP client in `baseApi.ts` with consistent `accessToken`/`refreshToken`
  keys. Auto-refresh on 401 with queue-based race condition prevention.
- **Tailwind:** Vite plugin pipeline (`@tailwindcss/vite` v4.3), no CDN.
- **Admin endpoints:** 12 frontend hooks wired to 9 backend endpoints (users, block/unblock, audit
  logs, reports, stats, jobs, contact messages).
- **Recruiter tools:** `CreateJob.tsx` wired to `useCreateJobMutation`. `CompanyProfile.tsx` wired to
  full company CRUD. Company linking via profile PATCH.
- **Security page:** Session listing/revocation wired via `useGetSessionsQuery`, `useRevokeSessionMutation`,
  `useLogoutAllMutation`.
- **ErrorBoundary:** Root-level only in `main.tsx`. Per-route-group boundaries not yet added.

## Run it

```bash
cp .env.example .env          # set JWT_SECRET at minimum
npm ci
npm run seed                  # demo data: student@demo.com / recruiter@demo.com / admin@demo.com — Password123!
npm run dev                   # http://localhost:5000/api  (frontend default VITE_API_URL)
```

MongoDB must be reachable at `DATABASE_URL` (default `mongodb://127.0.0.1:27017/careerforge`).

```bash
npm run typecheck && npm run lint && npm test    # all green at handoff
```

## Priority list for the next engineer

All original items (0-18) are **complete**. The remaining work is:

### Production blockers

1. **CORS_ORIGIN production config** — Default is `*` in `src/config/env.ts:12`. Must set
   `CORS_ORIGIN` env var to specific frontend origin(s) in production. Render.yaml has it as
   `sync: false` — configure before deploying.

2. **Per-route-group ErrorBoundary** — Currently only root-level in `main.tsx`. Add
   `<ErrorBoundary>` wrappers around `StudentLayout`, `RecruiterLayout`, and `AdminLayout`
   in `AppRoutes.tsx` so a crash in one group doesn't unmount the entire app.

### Cleanup

3. **Remove leftover artifacts** — `test-output.txt`, `start-mongod.ps1`, `start-mongod.vbs`
   in backend root are dev leftovers. Add to `.gitignore` or delete.

4. **Contact module service layer** — `src/modules/contact/contact.routes.ts` has inline
   business logic. Extract to `contact.service.ts` and `contact.repository.ts` for consistency
   with other modules.

### Future work

5. **Frontend tests** — No test harness exists in `Frontend/`. Add Vitest + React Testing Library.
6. **Security sweep remaining items** — localStorage XSS risk acceptance, per-user rate limiting,
   npm audit in CI. See `docs/engineering/SECURITY_SWEEP.md`.

## Things that will bite you if ignored

- **Auth responses are flat `{accessToken, refreshToken, user}` while everything else uses `{data}`.**
  The frontend reads them differently. Don't "normalize" one side without the other.
- **Admin accounts cannot self-register** by design. Promote manually in the DB or add an admin-only
  invite endpoint later.
- **`PATCH /profiles/:id` has an allow-list** — new profile fields must be added to
  `users.repository.ts` AND `users.schemas.ts`.
- **The recruiter must link a company before posting a job** (`POST /companies` auto-links on create;
  or `PATCH /profiles/:id {company_id}` to link to an existing company).
- **Session model** — `src/models/session.model.ts` stores refresh tokens. Expired sessions are
  auto-purged by MongoDB TTL index (`expires_at`). Revoked sessions linger until expiry.
- **`requireAuth` is async** — it returns a promise via `.then()/.catch(next)`. Express 4 does not
  catch rejected promises from handlers, so the callback pattern is used.

## Where the contract lives

- Endpoint-by-endpoint documentation: `docs/API_CONTRACT.md`
- Collections & indexes: `docs/DATA_MODEL.md`
- Layering rules & decisions: `docs/ARCHITECTURE.md`
- Product context & gaps: `../productnote.md`
- Engineering standards: `../ENGINEERING_PLAYBOOK.md` — follow its Definition of Done (§25) for any feature.
