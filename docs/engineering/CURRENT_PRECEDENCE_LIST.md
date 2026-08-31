# Current Precedence List — CareerForge

**Last Updated:** 2026-08-31

---

## Summary

This document tracks what blocks production launch, what's non-blocking but important, and what's future work. Items are ordered by priority within each category.

---

## BLOCKS LAUNCH (Must Complete Before Production)

| # | Item | Status | Effort | Notes |
|---|------|--------|--------|-------|
| 1 | **CORS_ORIGIN restriction** | Config needed | 0.5h | Default `*` in `env.ts:12`. Set `CORS_ORIGIN` env var to specific frontend origin(s) before deploying. |
| 2 | **Per-route-group ErrorBoundary** | Not started | 2h | Root-level only in `main.tsx`. Add `<ErrorBoundary>` around `StudentLayout`, `RecruiterLayout`, `AdminLayout` in `AppRoutes.tsx`. |

**Total estimated effort to unblock launch:** ~2.5 hours

---

## NON-BLOCKING (Should Complete Soon)

| # | Item | Status | Effort | Notes |
|---|------|--------|--------|-------|
| 3 | **Remove leftover artifacts** | Not started | 0.5h | `test-output.txt`, `start-mongod.ps1`, `start-mongod.vbs` in backend root. |
| 4 | **Contact module service layer** | Not started | 2h | `contact.routes.ts` has inline business logic. Extract to `contact.service.ts` for consistency. |
| 5 | **npm audit in CI** | Not started | 1h | Add `npm audit --audit-level=high` to `.github/workflows/ci.yml`. |
| 6 | **Fix frontend ESLint errors** | Not started | 2h | 6 errors: `no-explicit-any` x3, unused vars x2, hook-deps warning. |

**Total estimated effort:** ~5.5 hours

---

## FUTURE WORK (Post-Launch)

| # | Item | Status | Effort | Notes |
|---|------|--------|--------|-------|
| 7 | **Frontend tests** | Not started | 40h+ | No test harness in `Frontend/`. Add Vitest + React Testing Library. |
| 8 | **Load testing** | Not started | 8h | Artillery/k6 scripts for key endpoints. |
| 9 | **Email templates** | Not started | 8h | Password reset, application status, job alerts. |
| 10 | **Push notifications** | Not started | 24h | Real-time alerts for application updates. |
| 11 | **Mobile responsive audit** | Not started | 8h | Verify all screens work on mobile. |
| 12 | **Performance optimization** | Not started | 16h | Index tuning, query optimization, caching. |
| 13 | **Admin reports/charts** | UI shell exists | 16h | Data aggregation endpoints + chart components. |
| 14 | **Audit logging dashboard** | UI shell exists | 12h | Track admin actions, data changes with UI. |

**Total estimated effort:** ~132 hours

---

## Completed Items (verified 2026-08-31)

| # | Item | Completed | Notes |
|---|------|-----------|-------|
| — | Frontend route guards | 2026-08-28 | `ProtectedRoute` with `allowedRoles` wraps all protected route groups |
| — | Token key consolidation | 2026-08-28 | Single HTTP client in `baseApi.ts`, consistent `accessToken`/`refreshToken` keys |
| — | Tailwind Vite plugin | 2026-08-28 | `@tailwindcss/vite` v4.3, no CDN script tag |
| — | Admin endpoint implementation | 2026-08-28 | 9 backend endpoints, 12 frontend hooks in `adminApi.ts` |
| — | Recruiter job posting to API | 2026-08-28 | `CreateJob.tsx` wired to `useCreateJobMutation` |
| — | Recruiter company profile to API | 2026-08-28 | `CompanyProfile.tsx` wired to full company CRUD |
| — | Recruiter company linking | 2026-08-28 | Via `PATCH /profiles/:id {company_id}` |
| — | Admin Security page | 2026-08-28 | Session listing/revocation wired |
| — | JWT auth with refresh rotation | 2026-08-24 | Access + refresh tokens with family tracking |
| — | Session revocation | 2026-08-24 | Password reset and admin block invalidate sessions |
| — | Integration tests (34 passing) | 2026-08-24 | Auth, applications, authorization boundaries, file uploads |
| — | Mail adapter | 2026-08-24 | Dev console + Nodemailer SMTP |
| — | Duplicate application prevention | 2026-08-24 | Compound unique index + E11000 catch |
| — | Skill-based recommendations | 2026-08-24 | Profile tag overlap scoring |
| — | Recruiter "my jobs" endpoint | 2026-08-24 | List, edit, delete jobs |
| — | Admin stats/jobs endpoints | 2026-08-24 | Platform stats and cross-company search |
| — | File uploads | 2026-08-26 | Resume upload with HMAC-signed URLs |
| — | Code splitting | 2026-08-26 | React.lazy per route group, manualChunks in Vite config |
| — | Sentry integration | 2026-08-26 | Both backend and frontend |
| — | CI/CD pipeline | 2026-08-26 | GitHub Actions workflow |
| — | Zod form validation | 2026-08-26 | CreateJob, CompanyProfile, Profile forms |
| — | Cursor-based pagination | 2026-08-26 | Alternative to offset pagination |
| — | Mongoose query timeouts | 2026-08-26 | Prevent slow queries from hanging |
| — | Service layer extraction | 2026-08-26 | Admin, companies, saved-jobs, notifications modules |
| — | Error boundary (root level) | 2026-08-26 | Catches errors, logs to Sentry, renders fallback |

---

## Blocking Dependencies

```
#1 (CORS config) ──┐
                    ├──► PRODUCTION LAUNCH
#2 (ErrorBoundary) ─┘

#3 (Artifacts) ──┐
#4 (Contact SL)  ──┤
#5 (npm audit)   ──┤
#6 (ESLint)      ──┴──► CODE QUALITY
```

---

## Notes

- **Admin accounts cannot self-register** by design. Promote via DB or add invite endpoint.
- **Recruiter must link company before posting job.** Current flow: create company → link via profile PATCH.
- **Auth responses are flat** `{accessToken, refreshToken, user}` while everything else uses `{data}`. Don't normalize one side without the other.
- **`PATCH /profiles/:id` has an allow-list** — new fields must be added to both `users.repository.ts` and `users.schemas.ts`.
- **File upload AV scanning** — `scanned` field is set but no AV scanner is wired. Plug one in before exposing files in production.
