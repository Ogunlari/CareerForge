# Product Note — CareerForge

> Inferred from a full codebase audit of `career-1` (React + TypeScript + Vite SPA).
> Audit date: 2026-08-24

---

## 1. What is this product?

**CareerForge** is a web-based job board and application-tracking platform that connects three audiences — job-seeking students, recruiters/employers, and platform administrators — around a shared marketplace of job postings and applications.

- **Positioning (from marketing copy in-app):** *"Find your dream job at top companies… CareerForge makes job hunting effortless."*
- **Core value propositions:** smart job matching, quick apply with a single reusable profile, real-time application tracking, and access to top companies.
- **Form factor:** single-page application (SPA). All data flows through an external REST API (`VITE_API_URL`), so the backend is a separate service not included in this repo.

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript, React Compiler enabled |
| Build | Vite 8 (`@vitejs/plugin-react`, rolldown/babel) |
| Styling | Tailwind CSS v4 (Vite plugin) + Lucide icons |
| Routing | React Router v7 (`createBrowserRouter`, nested role-based layouts) |
| State/Data | Context (`AuthContext`) + custom hooks (`useJobs`, `useApplications`, `usePagination`) — no Redux/React Query |
| Auth | Email/password with JWT-style bearer token stored in `localStorage` |

## 3. Users & feature inventory

### Visitor (public)
- Marketing landing page: hero with rotating background imagery, global job search bar, live stats (active jobs / companies / seekers), features & how-it-works sections, CTA to register.
- Job board: search, filters (job type, experience level, location, salary range), pagination.
- Job details page: full description, requirements/benefits, save/unsave, apply flow with cover letter + resume URL, duplicate-application check.
- Company directory.
- Registration (role selectable at signup) and login / forgot-password / reset-password flows.

### Student
- Dashboard: stat cards, application status chart, activity feed, recent applications, recommended jobs.
- Applications tracker with statuses (`pending → reviewing → accepted/rejected → withdrawn`) and timeline visualization; withdrawal supported.
- Saved jobs and Recommended jobs pages.
- Profile management: skills, education, experience, resume URL.
- Notifications center (fetch, mark read, mark all read).

### Recruiter
- Applicants inbox (all applications across the recruiter's jobs) wired to API.
- Applicant detail view with ability to advance/reject application status (wired).
- Post-a-job form (UI complete — **not yet wired to API**, see gaps).
- Manage-jobs table, company profile editor (**not yet wired**).

### Admin
- Console with dashboard, user/company/job management, reports, audit logs, and security settings screens. Dashboard uses `getAdminStatsQuery` + `getHealthStatusQuery`; Users uses `getAdminUsersQuery` + block/unblock mutations. All screens are now wired to the API.

## 4. Completion status

| Area | Status |
|---|---|
| Public browsing & search | ✅ Functional (API-wired) |
| Auth (signup/login/reset) | ✅ Functional (API-wired) |
| Student portal | ✅ Largely functional (API-wired) |
| Recruiter portal | 🟡 ~Half done — applicants flow works; job posting & company profile are stubs (`// TODO: Call API`) |
| Admin console | ✅ Functional (API-wired) — updated since audit |
| Tests / CI | ❌ None present |

The product reads as a **student-facing MVP with a finished public funnel**, where the supply side (recruiter tooling) and the governance layer (admin) lag behind demand-side features.

## 5. Key audit findings

**Security**
1. **No route guards.** `/student/*`, `/recruiter/*`, and `/admin/*` layouts render for anyone; there is no auth or role check client-side. Protection depends entirely on the backend rejecting unauthenticated calls — admin screens currently don't even make calls, so the "Admin Panel" chrome is visible to anonymous visitors.
2. ~~**Token key mismatch breaks auth on the central client.**~~ **Fixed:** `baseApi.ts` now uses consistent token keys. The old `ApiClient` / per-service `fetch` duplication has been resolved in favor of RTK Query.
3. Token persistence in `localStorage` exposes sessions to XSS; consider httpOnly cookies or at minimum documented risk acceptance.

**Consistency / dead code**
4. Default API base URLs disagree (`localhost:3000/api` in `api.ts` vs `5000/api` everywhere else).
5. `utilities/constants.ts` still references `VITE_SUPABASE_URL` — a leftover from a prior Supabase architecture; the product has since moved to a custom REST backend.
6. ~~`src/App.tsx` defines a second, competing router that is unused. Home.tsx contains ~250 lines of a fully commented-out older revision.~~ **Fixed:** App.tsx competing router and Home.tsx commented-out code have been cleaned up.
7. Signature drift: service `fetchRecommendedJobs(studentId)` is invoked as `fetchRecommendedJobs(user.id, 3)` in two places — the extra argument is silently dropped.
8. ~~`main.tsx` has the `index.css` import commented out while `index.html` loads Tailwind via CDN script.~~ **Fixed:** `index.css` import is now active; Tailwind is built through the Vite plugin pipeline.

**Code health**
9. ESLint reports 6 errors / 1 warning (`no-explicit-any` ×3, unused vars ×2, hook-deps warning).
10. Minor copy bugs in shipped UI ("Fetoh audit logs", "Aotion" column header in Admin → Audit Logs).

## 6. Risks & recommendations (priority order)

1. Add auth/role route guards before any deployment — highest-severity gap.
2. Unify token handling (one storage key, one HTTP client) so authenticated requests actually carry credentials.
3. Wire recruiter job-posting and company profile to the API (forms already exist) — this unlocks the supply side of the marketplace.
4. Decide admin scope: either implement admin endpoints or hide the admin area until ready.
5. Replace the Tailwind CDN with the configured Vite plugin pipeline; restore `index.css`.
6. Remove dead code (`App.tsx`, commented Home revision, Supabase constant) and add a test harness.

## 7. One-line summary

CareerForge is a credible student-first job-board MVP — solid public discovery, auth, and application tracking — whose recruiter tooling is half-built, whose admin console is a facade, and which needs security hardening (route guards, token consistency) before it can be considered deployable.
