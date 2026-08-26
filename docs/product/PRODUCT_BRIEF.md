# Product Brief — CareerForge

## What is CareerForge?

CareerForge is a web-based job board and application-tracking platform that connects three audiences: job-seeking students, recruiters/employers, and platform administrators — around a shared marketplace of job postings and applications.

**Positioning:** *"Find your dream job at top companies… CareerForge makes job hunting effortless."*

## Target Users

| Role | Description |
|------|-------------|
| **Student/Job Seeker** | Primary user. Students searching for jobs, tracking applications, managing their professional profile. |
| **Recruiter/Employer** | Posts jobs, reviews applications, manages applicant pipeline. |
| **Admin** | Platform governance, user management, audit logs, reports. |

## Core Value Propositions

1. **Smart Job Matching** - Skill-based recommendations surface relevant opportunities
2. **Quick Apply** - Single reusable profile enables one-click applications
3. **Real-time Tracking** - Students see application status as it changes (pending → reviewing → accepted/rejected)
4. **Top Companies** - Verified company profiles with job listings

## Key Features

### Public (Unauthenticated)
- Marketing landing page with live stats
- Job board with search, filters (type, experience, location, salary), pagination
- Company directory
- Registration (role-selectable) and login flows

### Student Portal
- Dashboard with stat cards, application status chart, activity feed
- Application tracker with status timeline and withdrawal
- Saved jobs and recommended jobs
- Profile management (skills, education, experience, resume)
- Notifications center

### Recruiter Portal
- Applicant inbox across all posted jobs
- Applicant detail view with advance/reject actions
- Job posting form (UI complete, API integration in progress)
- Company profile editor (UI complete, API integration in progress)

### Admin Console
- Dashboard, user/company/job management, reports, audit logs, security settings
- **Status:** UI shell only — no admin endpoints currently called

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript, Vite 8, Tailwind CSS v4, React Router v7 |
| State | Redux Toolkit (RTK Query for server state) |
| Backend | Express 5 + TypeScript + MongoDB (Mongoose) |
| Auth | JWT (access + refresh tokens) with bcrypt password hashing |

## Completion Status

| Area | Status |
|------|--------|
| Public browsing & search | ✅ Functional (API-wired) |
| Auth (signup/login/reset) | ✅ Functional (API-wired) |
| Student portal | ✅ Largely functional (API-wired) |
| Recruiter portal | 🟡 ~Half done — applicants work; job posting & company profile are stubs |
| Admin console | 🔴 UI shell only — every screen returns empty data |
| Tests / CI | ❌ None present (being added) |

## Current Gaps

1. **Security:** No client-side route guards (admin/recruiter chrome visible to anonymous users)
2. **Token handling:** Two parallel HTTP layers need consolidation
3. **Recruiter tooling:** Job posting and company profile forms not wired to API
4. **Admin console:** Pure facade — needs backend implementation
5. **Testing:** No test harness or CI pipeline

## One-line Summary

CareerForge is a credible student-first job-board MVP — solid public discovery, auth, and application tracking — whose recruiter tooling is half-built, whose admin console is a facade, and which needs security hardening before production deployment.
