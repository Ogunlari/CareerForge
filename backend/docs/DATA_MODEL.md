# Data Model

MongoDB via Mongoose. All schemas live in `src/models/`. Timestamps are mapped to
`created_at` / `updated_at` (snake_case) so documents serialize directly into the
frontend's contract. IDs are exposed as `id` strings in API responses.

Money note (playbook §6): salaries are stored as whole currency units with a separate
`currency` code field. If the product ever does salary math or payouts, switch to
integer minor units or Decimal128.

## users

| Field | Type | Notes |
|---|---|---|
| email | string | unique, lowercased |
| password_hash | string | bcrypt, 12 rounds — never returned by any endpoint |
| full_name | string | required |
| role | enum | student / recruiter / admin |
| is_blocked | boolean | login + `/auth/me` reject blocked accounts |
| skills | string[] | |
| education / experience | embedded arrays | frontend sends both naming variants (`school`/`institution`, `position`/`title`), schema accepts both |
| resume_url | string | |
| company_id | ObjectId → companies | set for recruiters; required to post jobs |
| position | string | recruiter title |
| permissions | string[] | admin capabilities |
| avatar, title, bio, phone, location | strings | profile fields |

Indexes: `{email}` unique · queries by role use collection scan (fine at current scale, add index if user count grows).

Retention: none defined yet — decide before production (playbook §6).

## companies

name (required), logo_url, description, website, location, industry, size, founded_year.
Index: `{name}`.

## jobs

| Field | Notes |
|---|---|
| title, description | text-searched on list endpoint |
| job_type | enum, see API_CONTRACT |
| experience_level | enum |
| status | active/closed/draft — public list defaults to `active` only |
| salary_min/max, currency | numbers + ISO-ish currency code |
| company_id → companies | required, populated in responses as `company` |
| recruiter_id → users | required, ownership checks |
| posted_at, deadline, applicants_count | |
| requirements/benefits/tags/responsibilities | string arrays |

Indexes: `{status, posted_at desc}` · `{title, description} text` · `{company_id}` · `{recruiter_id}` · `{location}`.

## applications

| Field | Notes |
|---|---|
| student_id → users | |
| job_id → jobs | populated together with job.company_id in responses |
| recruiter_id → users | denormalized from the job at creation time for inbox queries + authorization |
| status | pending/reviewing/accepted/rejected/withdrawn — transitions validated in `applications.schemas.ts` |
| cover_letter, resume_url | optional |
| timeline | embedded events `{status, message, at}` |

Indexes: `{student_id, status}` · `{job_id}` · `{recruiter_id}`.
Duplicate prevention: service-level check excluding `withdrawn`; withdrawn applications are reused on re-apply.
A partial unique index would make this race-safe — follow-up item (HANDOFF).

## saved_jobs

student_id + job_id, compound **unique** index. `saved_at` timestamp. Save is idempotent (upsert).

## notifications

user_id, type (application/message/job/profile/system), title, message, related_id, is_read.
Index: `{user_id, is_read}`.

## audit_logs

admin_id, action, target_type, target_id, changes (mixed), ip_address, user_agent. Append-only.
Indexes: `{created_at desc}`, `{admin_id}`.

## password_reset_tokens

user_id, token_hash (SHA-256 of raw token, unique), expires_at, used_at.
TTL index auto-deletes expired tokens. Raw tokens are never stored.
