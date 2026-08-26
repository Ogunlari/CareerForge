# Architecture

Express 5 + TypeScript + Mongoose, structured per the Engineering Playbook:

```
Request ─▶ middleware (requestId, helmet, cors, json, rate-limit)
        ─▶ route (auth/role guards, zod validation)      ← thin
        ─▶ controller (parse params, call service)       ← thin
        ─▶ service   (business rules, authorization, side effects)
        ─▶ repository/model (database access)
```

## Layout

```
backend/
  src/
    config/     env.ts (zod-validated at startup, fail-fast), db.ts (connection + readyState)
    middleware/ auth.middleware.ts (requireAuth, requireRole), validate.middleware.ts (zod body/query),
                error.middleware.ts (central handler), request-context.middleware.ts (X-Request-Id)
    models/     one file per collection (Mongoose schemas + inferred types)
    modules/    one folder per domain: routes / controller / service / schemas / repository
    routes/     index.ts mounts everything under /api; health.routes.ts
    utils/      errors.ts (AppError + stable codes), jwt.ts, http.ts (envelopes, pagination),
                logger.ts (structured JSON, redacts password/token keys), validation.ts
    app.ts      express app factory (importable by tests without listening)
    server.ts   bootstrap: env → db → listen; graceful shutdown on SIGTERM/SIGINT
  scripts/      seed.ts — demo company, student/recruiter/admin accounts, two jobs
  tests/        smoke.test.ts — DB-free harness tests (health, 404 shape, validation shape)
```

## Decisions worth knowing

1. **Two response envelopes.** The existing frontend expects `{data,...}` for lists but *flat*
   `{token,user}` for auth. The backend reproduces both exactly. See API_CONTRACT.md before changing.
2. **snake_case field names** in Mongo documents mirror the frontend types (`full_name`, `resume_url`),
   avoiding a mapping layer for the bootstrap.
3. **Express 5 async handling**: rejected promises from handlers flow to the central error handler;
   `asyncHandler` wrappers are not needed.
4. **Zod v4** is used for env validation and request validation. ObjectId format is checked with a
   regex helper (`objectId` in utils/validation.ts).
5. **Authorization lives in services**, not just middleware: ownership checks (recruiter owns job /
   application, student owns profile/application) are enforced where the resource is loaded.
6. **Rate limiting**: global limiter + stricter limiter on auth endpoints. Health endpoints exempt.
7. **Errors**: every failure maps to a stable code (utils/errors.ts). Unhandled errors log server-side
   and return a generic 500 — no stack traces or driver errors leak.

## Known deviations from the playbook (deliberate, for bootstrap speed)

- Repositories are thin pass-throughs over Mongoose models rather than full data-access layers.
  Promote to real repositories when query logic grows.
- No background job queue yet (nothing async/slow enough to need one).
- Token-based reset completion endpoint missing (see HANDOFF priorities).
- Tests: only DB-free smoke tests. Integration tests with mongodb-memory-server are the next step.
