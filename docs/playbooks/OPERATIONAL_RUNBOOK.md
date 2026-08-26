# Operational Runbook — CareerForge

**Last Updated:** 2026-08-26

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Running the Application](#running-the-application)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Common Failures & Debugging](#common-failures--debugging)
7. [Database Operations](#database-operations)
8. [Environment Variables](#environment-variables)

---

## Prerequisites

- **Node.js:** v20.x or higher
- **MongoDB:** v6.x or higher (local or Atlas)
- **npm:** v9.x or higher

---

## Local Development Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd CareerForge

# Install backend dependencies
cd backend
cp .env.example .env
npm ci

# Install frontend dependencies
cd ../Frontend
npm ci
```

### 2. Configure Environment

Edit `backend/.env` with your settings:

```env
# Required
JWT_SECRET=<generate-32-char-random-string>
DATABASE_URL=mongodb://127.0.0.1:27017/careerforge

# Optional (for email features)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Seed Demo Data (Optional)

```bash
cd backend
npm run seed
```

This creates:
- Demo company: "TechCorp"
- Demo accounts (password: `Password123!`):
  - `student@demo.com`
  - `recruiter@demo.com`
  - `admin@demo.com`
- Two sample job postings

---

## Running the Application

### Development Mode

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Starts on http://localhost:5000/api
```

**Terminal 2 — Frontend:**
```bash
cd Frontend
npm run dev
# Starts on http://localhost:5173
```

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd Frontend
npm run build
npm run preview  # Preview production build
```

### Health Check

```bash
curl http://localhost:5000/api/health/live
# Expected: {"status":"ok","timestamp":"..."}
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run typecheck     # TypeScript check
npm run lint          # ESLint
```

### Frontend Checks

```bash
cd Frontend
npm run build         # Type check + production build
npm run lint          # ESLint
```

### CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR to `main`:

**Backend:** `npm ci` → `typecheck` → `lint` → `test`
**Frontend:** `npm ci` → `typecheck` → `lint` → `build`

---

## Deployment

### Environment Variables for Production

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Default: `5000` |
| `DATABASE_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Min 32 chars, random string |
| `CORS_ORIGIN` | Yes | Comma-separated allowed origins (NO `*`) |
| `SMTP_*` | If email | SMTP credentials for password reset |

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set strong `JWT_SECRET` (not placeholder)
- [ ] Configure `CORS_ORIGIN` (no wildcards)
- [ ] MongoDB Atlas or production MongoDB running
- [ ] SMTP configured (for password reset emails)
- [ ] Run database migrations (if any)
- [ ] Seed initial admin user (admin accounts cannot self-register)
- [ ] Verify health endpoint responds
- [ ] Test login with demo account
- [ ] Configure reverse proxy (nginx/Cloudflare) with HTTPS

### Admin Account Setup

Admin accounts cannot self-register. After deployment:

```bash
# Option 1: Promote existing user in MongoDB shell
db.users.updateOne({email: "user@example.com"}, {$set: {role: "admin"}})

# Option 2: Use seed script on production (creates demo accounts)
npm run seed
```

---

## Common Failures & Debugging

### 1. "Environment validation failed" on Startup

**Cause:** Missing or invalid env vars.

**Fix:**
```bash
# Check what's missing
cat .env.example  # Compare with your .env
node -e "require('./src/config/env.js')"  # Shows validation errors
```

### 2. "Refusing to start: JWT_SECRET looks like a development placeholder"

**Cause:** `JWT_SECRET` contains "change-me" in production.

**Fix:** Generate a real secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. "ECONNREFUSED" to MongoDB

**Cause:** MongoDB not running or wrong connection string.

**Fix:**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Verify connection string in .env
DATABASE_URL=mongodb://127.0.0.1:27017/careerforge
```

### 4. "Invalid or expired token" on API Requests

**Cause:** Access token expired (15 min TTL) or session revoked.

**Fix:**
- Frontend should auto-refresh via RTK Query interceptor
- If persistent: logout and login again
- Check if session was revoked (admin block, password reset)

### 5. "Account has been suspended" Error

**Cause:** User's `is_blocked` flag is true.

**Fix (Admin):**
```bash
# Unblock user in MongoDB
db.users.updateOne({email: "user@example.com"}, {$unset: {is_blocked: true}})
```

### 6. CORS Errors in Browser

**Cause:** Frontend origin not in `CORS_ORIGIN`.

**Fix:**
```env
# Allow multiple origins
CORS_ORIGIN=http://localhost:5173,https://careerforge.example.com
```

### 7. "Cannot find module" Errors

**Cause:** Dependencies not installed or wrong directory.

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm ci
```

### 8. TypeCheck/Lint Errors in CI

**Fix locally:**
```bash
# Backend
cd backend
npm run typecheck
npm run lint
# Fix errors, then commit

# Frontend
cd Frontend
npm run build  # Includes typecheck
npm run lint
```

### 9. Duplicate Application Error

**Cause:** Student already applied to this job.

**Behavior:** Returns `DUPLICATE_APPLICATION` error (by design — compound unique index on `{student_id, job_id}`).

### 10. Password Reset Not Sending Email

**Cause:** SMTP not configured.

**Check:**
```bash
# Verify SMTP env vars
grep SMTP .env

# In development without SMTP, reset link appears in console output
```

---

## Database Operations

### Connect to MongoDB

```bash
# Local
mongosh mongodb://127.0.0.1:27017/careerforge

# Atlas
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/careerforge" --username admin
```

### Useful Queries

```javascript
// List all users
db.users.find().pretty()

// Find blocked users
db.users.find({is_blocked: true})

// List active sessions
db.sessions.find({revoked_at: {$exists: false}})

// Count jobs by status
db.jobs.aggregate([{$group: {_id: "$status", count: {$sum: 1}}}])

// Check indexes
db.users.getIndexes()
db.jobs.getIndexes()
db.applications.getIndexes()
```

### Backup & Restore

```bash
# Backup
mongodump --uri="mongodb://127.0.0.1:27017/careerforge" --out=./backup

# Restore
mongorestore --uri="mongodb://127.0.0.1:27017/careerforge" ./backup
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development`, `test`, or `production` |
| `PORT` | `5000` | Server port |
| `DATABASE_URL` | `mongodb://127.0.0.1:27017/careerforge` | MongoDB URI |
| `JWT_SECRET` | (required) | Min 32 chars |
| `JWT_EXPIRES_IN` | `15m` | Access token TTL |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Refresh token TTL |
| `CORS_ORIGIN` | `*` | Comma-separated origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes |
| `RATE_LIMIT_MAX` | `300` | Requests per window |
| `AUTH_RATE_LIMIT_MAX` | `20` | Auth requests per window |
| `SMTP_HOST` | (optional) | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | (optional) | SMTP username |
| `SMTP_PASS` | (optional) | SMTP password |
| `MAIL_FROM` | `CareerForge <noreply@careerforge.dev>` | Sender address |

---

## Contacts

- **Engineering Lead:** [Your Name]
- **On-call Rotation:** [Link to PagerDuty/OpsGenie]
- **Slack Channel:** #careerforge-eng
