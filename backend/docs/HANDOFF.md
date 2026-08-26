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
- **25 passing integration tests** (`npm test`, vitest + supertest + mongodb-memory-server) covering
  auth, dual-token flow, refresh rotation, reuse detection, password-reset + session invalidation,
  job ownership, application state machine, withdraw/re-apply, blocking with audit trail, and
  every authorization boundary

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

0. ~~Recruiter "my jobs" + admin stats/jobs endpoints~~ **Done.**
1. ~~Integration tests~~ **Done:** 25 tests, flushed out and fixed four real bugs:
   - `GET /jobs/:jobId/applications` had **no ownership check**. Now owner-recruiter or admin only.
   - `requireAuth` trusted the JWT forever. Now re-checks `is_blocked`/existence per request.
   - `GET /applications/student` required a `studentId` query param. Now forces from token.
   - Auth responses exposed only `_id`. `toPublicUser` now emits both `_id` and `id`.
2. ~~Mail adapter~~ **Done:** `src/services/mail/` with dev console + Nodemailer SMTP providers.
   Set `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` for production.
   Without SMTP in non-production, `/auth/reset-password-request` returns `devResetToken`.
3. ~~Race-safe duplicate-application prevention~~ **Done:** compound unique index
   `{student_id, job_id}` + E11000 duplicate-key catch as defense-in-depth.
4. ~~Real recommendations~~ **Done:** skill-overlap scoring from student profile tags/requirements,
   recency fallback when no skills available.
5. ~~Refresh token rotation + session revocation~~ **Done:** access tokens carry `jti` claim
   (15 min TTL), opaque refresh tokens (64 bytes hex, 7 d TTL), token-family tracking for
   reuse detection, `POST /auth/refresh` (no auth required), `POST /auth/logout` revokes session.
   Password reset and admin block also invalidate all sessions. Frontend stores both tokens,
   baseApi interceptor auto-refreshes on 401.
6. **Frontend fixes from productnote.md** that touch this API:
   - ~~legacy `src/services/` deleted; RTK Query slices with `TOKEN_KEY` in `baseApi.ts`.~~ **Done.**
   - ~~frontend default port assumptions disagree (`3000` vs `5000`); this API defaults to **5000**.~~ Port default resolved; baseApi.ts uses consistent token keys.
   - ~~Token key mismatch between `auth.service.ts` and `services/api.ts`~~ **Done.**
7. ~~**CompanyProfile.tsx** — currently a static shell with no API calls.~~ **Done:** Wired to
   `useGetCompanyByIdQuery`, `useUpdateCompanyMutation`, and `useCreateCompanyMutation`.
   Full company creation flow added.
8. ~~**Security.tsx** — pure placeholder.~~ **Done:** Session listing/revocation now wired via
   `useGetSessionsQuery`, `useRevokeSessionMutation`, `useLogoutAllMutation`.
9. **File uploads** — resume is a URL string today. If you accept uploads, follow playbook §11
   (size limits, MIME allowlist, signed URLs, scanning).
10. **Code splitting** — React.lazy per route group in `AppRoutes.tsx`, manualChunks in `vite.config.ts`.
11. **Sentry integration** — added for both backend and frontend error tracking.
12. **CI/CD pipeline** — GitHub Actions workflow at `.github/workflows/ci.yml`.
13. **docs/ structure** — product brief, security sweep, operational runbook, precedence list.
14. **Error boundary** — added to frontend for graceful error handling.
15. **Zod form validation** — added to CreateJob, CompanyProfile, Profile forms.
16. **Cursor-based pagination** — added as alternative to offset pagination.
17. **Mongoose query timeouts** — added to prevent slow queries from hanging.
18. **Service layer extraction** — admin, companies, saved-jobs, notifications modules refactored.

## Things that will bite you if ignored

- **Auth responses are flat `{accessToken, refreshToken, user}` while everything else uses `{data}`.**
  The frontend reads them differently. Don't "normalize" one side without the other.
- **Admin accounts cannot self-register** by design. Promote manually in the DB or add an admin-only
  invite endpoint later.
- **`PATCH /profiles/:id` has an allow-list** — new profile fields must be added to
  `users.repository.ts` AND `users.schemas.ts`.
- **The recruiter must link a company before posting a job** (`POST /companies` then
  `PATCH /profiles/:id {company_id}`... note: linking company_id via profile PATCH is *not* wired —
  see next bullet).
- **Known gap:** recruiters have no endpoint to link themselves to a company yet. Either allow
  `company_id` in the profile PATCH allow-list for recruiters, or auto-create/link on company create.
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
