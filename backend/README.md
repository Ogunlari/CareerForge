# CareerForge API

Backend for CareerForge — job board & application tracking. Express 5 + TypeScript + MongoDB,
bootstrapped per `../ENGINEERING_PLAYBOOK.md`.

## Quickstart

```bash
cp .env.example .env      # then set JWT_SECRET (32+ chars)
npm ci
npm run seed              # optional demo data
npm run dev               # starts on :5000 → http://localhost:5000/api/health/live
```

Demo accounts after seeding (password `Password123!`):
`student@demo.com` · `recruiter@demo.com` · `admin@demo.com`

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | dev server with watch (tsx) |
| `npm run build` / `npm start` | production build + run |
| `npm run typecheck` | strict TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | smoke tests (no DB required) |
| `npm run seed` | insert demo company/users/jobs |

## Documentation

- `docs/HANDOFF.md` — **start here** if you're taking over this project
- `docs/API_CONTRACT.md` — every endpoint, envelope shapes, status machine
- `docs/DATA_MODEL.md` — collections, indexes, constraints
- `docs/ARCHITECTURE.md` — layering rules and decisions

The frontend lives in `../frontend` and expects the API at `VITE_API_URL`
(default `http://localhost:5000/api`).
