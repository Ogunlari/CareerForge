# Current Precedence List — CareerForge

**Last Updated:** 2026-08-26

---

## Summary

This document tracks what blocks production launch, what's non-blocking but important, and what's future work. Items are ordered by priority within each category.

---

## 🔴 BLOCKS LAUNCH (Must Complete Before Production)

| # | Item | Status | Effort | Notes |
|---|------|--------|--------|-------|
| 1 | **Frontend route guards** | ❌ Not started | 2h | Admin/recruiter chrome visible to anonymous users. Add `<ProtectedRoute>` wrappers. |
| 2 | **Token key consolidation** | ❌ Not started | 4h | Two parallel HTTP layers (RTK Query vs. legacy fetch). Unify to single client. |
| 3 | **Tailwind CDN → Vite plugin** | ❌ Not started | 1h | Current `index.html` loads Tailwind via CDN script. FOUC risk, no CSP compliance. |
| 4 | **CORS_ORIGIN restriction** | ⚠️ Config needed | 0.5h | Default `*` must be replaced with specific origins in production. |
| 5 | **Admin endpoint implementation** | 🔴 UI shell only | 40h+ | Every admin screen returns empty data. Either implement endpoints or hide admin area. |
| 6 | **Security Sweep remediation** | ❌ Not started | 8h | See `docs/engineering/SECURITY_SWEEP.md` — P0/P1 items. |

**Total estimated effort to unblock launch:** ~56 hours

---

## 🟡 NON-BLOCKING (Should Complete Soon)

| # | Item | Status | Effort | Notes |
|---|------|--------|--------|-------|
| 7 | **Recruiter job posting → API** | ⚠️ UI exists, not wired | 4h | Form exists in `CreateJob.tsx`, needs API integration. |
| 8 | **Recruiter company profile → API** | ⚠️ UI exists, not wired | 4h | `CompanyProfile.tsx` is static shell. |
| 9 | **Recruiter company linking** | ❌ Not started | 2h | No endpoint to link recruiter to company. |
| 10 | **CI pipeline** | ✅ In progress | — | `.github/workflows/ci.yml` created. |
| 11 | **npm audit in CI** | ❌ Not started | 1h | Add `npm audit --audit-level=high` to pipeline. |
| 12 | **Error boundary coverage** | ⚠️ Partial | 2h | Add to all route groups, not just root. |
| 13 | **Fix ESLint errors** | ❌ 6 errors | 2h | `no-explicit-any` ×3, unused vars ×2, hook-deps warning. |
| 14 | **Dead code removal** | ❌ Not started | 2h | Remove `App.tsx` duplicate router, commented `Home.tsx` code, Supabase constants. |
| 15 | **Admin Security page** | ⚠️ Placeholder | 8h | Needs session listing/revocation endpoints + frontend. |

**Total estimated effort:** ~25 hours

---

## 🟢 FUTURE WORK (Post-Launch)

| # | Item | Status | Effort | Notes |
|---|------|--------|--------|-------|
| 16 | **File upload for resumes** | ❌ Not started | 16h | Currently URL string. Needs upload endpoint, S3/GCS, virus scanning. |
| 17 | **Code splitting** | ❌ Not started | 4h | `React.lazy` per route group, `manualChunks` in Vite config. |
| 18 | **Frontend tests** | ❌ Not started | 40h+ | No test harness exists. Add unit, integration, E2E. |
| 19 | **Load testing** | ❌ Not started | 8h | Artillery/k6 scripts for key endpoints. |
| 20 | **Admin reports** | ⚠️ UI shell | 16h | Charts and data aggregation endpoints. |
| 21 | **Audit logging** | ⚠️ UI shell | 12h | Track admin actions, data changes. |
| 22 | **Email templates** | ❌ Not started | 8h | Password reset, application status, job alerts. |
| 23 | **Push notifications** | ❌ Not started | 24h | Real-time alerts for application updates. |
| 24 | **Mobile responsive audit** | ❌ Not started | 8h | Verify all screens work on mobile. |
| 25 | **Performance optimization** | ❌ Not started | 16h | Index tuning, query optimization, caching. |

**Total estimated effort:** ~152 hours

---

## Completed Items ✅

| # | Item | Completed | Notes |
|---|------|-----------|-------|
| — | JWT auth with refresh rotation | 2026-08-24 | Access + refresh tokens with family tracking |
| — | Session revocation | 2026-08-24 | Password reset and admin block invalidate sessions |
| — | Integration tests (25 passing) | 2026-08-24 | Auth, applications, authorization boundaries |
| — | Mail adapter | 2026-08-24 | Dev console + Nodemailer SMTP |
| — | Duplicate application prevention | 2026-08-24 | Compound unique index + E11000 catch |
| — | Skill-based recommendations | 2026-08-24 | Profile tag overlap scoring |
| — | Recruiter "my jobs" endpoint | 2026-08-24 | List, edit, delete jobs |
| — | Admin stats/jobs endpoints | 2026-08-24 | Platform stats and cross-company search |

---

## Blocking Dependencies

```
#1 (Route guards) ──┐
#2 (Token consolidation) ──┤
#3 (Tailwind) ──┤
#4 (CORS) ──┴──► PRODUCTION LAUNCH
#5 (Admin endpoints) ──┤
#6 (Security sweep) ──┘

#7 (Job posting) ──┐
#8 (Company profile) ──┤
#9 (Company linking) ──┴──► RECRUITER MVP COMPLETE
```

---

## Notes

- **Admin accounts cannot self-register** by design. Promote via DB or add invite endpoint.
- **Recruiter must link company before posting job.** Current flow: create company → link via profile PATCH (not yet wired).
- **Auth responses are flat** `{accessToken, refreshToken, user}` while everything else uses `{data}`. Don't normalize one side without the other.
- **`PATCH /profiles/:id` has an allow-list** — new fields must be added to both `users.repository.ts` and `users.schemas.ts`.
