import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.AUTH_RATE_LIMIT_MAX = '1000';
process.env.RATE_LIMIT_MAX = '1000';
process.env.NODE_ENV = 'test';

let mongod: MongoMemoryServer;
let app: Express;
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
let UserModel: any;
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
let SessionModel: any;

interface TestUser {
  accessToken: string;
  refreshToken: string;
  id: string;
}

const users: Record<'student' | 'recruiterA' | 'recruiterB' | 'admin', TestUser> =
  {} as never;

let recruiterACompanyId = '';

const auth = (user: TestUser) => ({ Authorization: `Bearer ${user.accessToken}` });

async function signupUser(
  name: string,
  role: 'student' | 'recruiter'
): Promise<TestUser> {
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@test.dev`;
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ email, password: 'Password123!', name, role });
  expect(res.status).toBe(201);
  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    id: res.body.user._id,
  };
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.DATABASE_URL = mongod.getUri('careerforge');

  mongoose.set('autoIndex', false);

  const { createApp } = await import('../src/app.js');
  const { connectDatabase } = await import('../src/config/db.js');
  UserModel = (await import('../src/models/user.model.js')).UserModel;
  SessionModel = (await import('../src/models/session.model.js')).SessionModel;

  await connectDatabase();
  await mongoose.connection.syncIndexes();
  app = createApp();

  users.student = await signupUser('Student One', 'student');
  users.recruiterA = await signupUser('Recruiter A', 'recruiter');
  users.recruiterB = await signupUser('Recruiter B', 'recruiter');

  // Admin accounts cannot self-register - insert directly.
  const bcrypt = (await import('bcryptjs')).default;
  const adminDoc = await UserModel.create({
    email: 'admin@test.dev',
    password_hash: await bcrypt.hash('Password123!', 4),
    full_name: 'Admin One',
    role: 'admin',
  });
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.dev', password: 'Password123!' });
  expect(adminLogin.status).toBe(200);
  users.admin = {
    accessToken: adminLogin.body.accessToken,
    refreshToken: adminLogin.body.refreshToken,
    id: String(adminDoc._id),
  };

  // POST /companies auto-links the recruiter to their new company.
  const compRes = await request(app)
    .post('/api/companies')
    .set(auth(users.recruiterA))
    .send({ name: 'ACME Corp.' });
  expect(compRes.status).toBe(201);
  recruiterACompanyId = compRes.body.data.id;
});

afterAll(async () => {
  const { disconnectDatabase } = await import('../src/config/db.js');
  await disconnectDatabase();
  await mongod.stop();
});

describe('auth', () => {
  it('rejects duplicate signup with CONFLICT', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'student.one@test.dev',
        password: 'Password123!',
        name: 'Dup',
        role: 'student',
      });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('rejects wrong-password login without leaking account existence', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.one@test.dev', password: 'WrongPass123!' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns both accessToken and refreshToken on login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.one@test.dev', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
    expect(res.body.accessToken.length).toBeGreaterThan(20);
    expect(res.body.refreshToken.length).toBe(128); // 64 bytes hex
  });

  it('rejects expired access tokens with 401', async () => {
    const expiredToken = jwt.sign(
      { role: 'student', jti: 'expired-test' },
      process.env.JWT_SECRET || 'dev-jwt-secret',
      { subject: users.student.id, expiresIn: '0s' },
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set({ Authorization: `Bearer ${expiredToken}` });
    expect(res.status).toBe(401);
  });
});

describe('refresh token rotation', () => {
  let freshUser: TestUser;

  beforeAll(async () => {
    const email = 'refresh.test@test.dev';
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email, password: 'Password123!', name: 'Refresh Tester', role: 'student' });
    expect(res.status).toBe(201);
    freshUser = {
      accessToken: res.body.accessToken,
      refreshToken: res.body.refreshToken,
      id: res.body.user._id,
    };
  });

  it('issues new token pair on /auth/refresh and old refresh token is invalidated', async () => {
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: freshUser.refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeTruthy();
    expect(refreshRes.body.refreshToken).toBeTruthy();
    expect(refreshRes.body.refreshToken).not.toBe(freshUser.refreshToken);

    // Old refresh token triggers reuse detection (it was already rotated above).
    const oldRefresh = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: freshUser.refreshToken });
    expect(oldRefresh.status).toBe(401);
    expect(oldRefresh.body.code).toBe('TOKEN_REUSE_DETECTED');

    // Reuse detection revoked the entire family - re-login for subsequent tests.
    const reLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'refresh.test@test.dev', password: 'Password123!' });
    expect(reLogin.status).toBe(200);
    freshUser.accessToken = reLogin.body.accessToken;
    freshUser.refreshToken = reLogin.body.refreshToken;
  });

  it('rejects refresh token after logout (session revoked)', async () => {
    // Login to get a fresh session.
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'refresh.test@test.dev', password: 'Password123!' });
    expect(loginRes.status).toBe(200);
    const loginRefresh = loginRes.body.refreshToken;

    // Logout (revokes session by jti).
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set({ Authorization: `Bearer ${loginRes.body.accessToken}` });
    expect(logoutRes.status).toBe(200);

    // Old refresh token must be rejected.
    const staleRefresh = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginRefresh });
    expect(staleRefresh.status).toBe(401);
  });

  it('detects refresh token reuse and revokes the entire family', async () => {
    // Login to get a session.
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'refresh.test@test.dev', password: 'Password123!' });
    expect(loginRes.status).toBe(200);
    const originalRefresh = loginRes.body.refreshToken;

    // Rotate once.
    const rotate1 = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: originalRefresh });
    expect(rotate1.status).toBe(200);

    // Rotate again (this replaces rotate1's token).
    const rotate2 = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: rotate1.body.refreshToken });
    expect(rotate2.status).toBe(200);

    // Attempt to use the old rotate1 token (reuse detected).
    const reuseAttempt = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: rotate1.body.refreshToken });
    expect(reuseAttempt.status).toBe(401);
    expect(reuseAttempt.body.code).toBe('TOKEN_REUSE_DETECTED');

    // The latest valid token should also be revoked (family compromised).
    const stolenAttempt = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: rotate2.body.refreshToken });
    expect(stolenAttempt.status).toBe(401);
  });
});

describe('password reset flow', () => {
  it('request -> complete -> new password works, old rejected, token single-use', async () => {
    const reqRes = await request(app)
      .post('/api/auth/reset-password-request')
      .send({ email: 'student.one@test.dev' });
    expect(reqRes.status).toBe(200);
    const token = reqRes.body.devResetToken;
    expect(typeof token).toBe('string');

    const badRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: '0'.repeat(64), password: 'NewPassword123!' });
    expect(badRes.status).toBe(400);
    expect(badRes.body.code).toBe('INVALID_RESET_TOKEN');

    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'NewPassword123!' });
    expect(resetRes.status).toBe(200);

    // Same token cannot be reused.
    const reuseRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'Again12345xyz!' });
    expect(reuseRes.status).toBe(400);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.one@test.dev', password: 'Password123!' });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.one@test.dev', password: 'NewPassword123!' });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.accessToken).toBeTruthy();
    expect(newLogin.body.user._id).toBeTruthy();
    expect(newLogin.body.user.id).toBe(users.student.id);

    users.student.accessToken = newLogin.body.accessToken;
    users.student.refreshToken = newLogin.body.refreshToken;
  });

  it('invalidates all sessions on password reset', async () => {
    // Login to get a session.
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.one@test.dev', password: 'NewPassword123!' });
    expect(loginRes.status).toBe(200);
    const preResetRefresh = loginRes.body.refreshToken;

    // Request and complete password reset.
    const reqRes = await request(app)
      .post('/api/auth/reset-password-request')
      .send({ email: 'student.one@test.dev' });
    const resetToken = reqRes.body.devResetToken;

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, password: 'ResetAgain456!' });

    // Pre-reset refresh token must be rejected.
    const staleRefresh = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: preResetRefresh });
    expect(staleRefresh.status).toBe(401);

    // Login with the latest password.
    const freshLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.one@test.dev', password: 'ResetAgain456!' });
    expect(freshLogin.status).toBe(200);

    users.student.accessToken = freshLogin.body.accessToken;
    users.student.refreshToken = freshLogin.body.refreshToken;
  });

  it('returns devResetToken when SMTP is not configured', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password-request')
      .send({ email: 'student.one@test.dev' });
    expect(res.status).toBe(200);
    expect(typeof res.body.devResetToken).toBe('string');
    expect(res.body.devResetToken.length).toBe(64);
  });
});

describe('jobs ownership', () => {
  let jobId: string;

  it('blocks posting when recruiter has no linked company', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set(auth(users.recruiterB))
      .send({
        title: 'Orphan Role',
        description: 'Recruiter B has no company yet.',
        job_type: 'full-time',
        experience_level: 'mid',
      });
    expect(res.status).toBe(400);
  });

  it('lets a linked recruiter post a job and see it in /jobs/mine', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set(auth(users.recruiterA))
      .send({
        title: 'Backend Engineer',
        description: 'Build APIs with Node, Express and TypeScript.',
        job_type: 'full-time',
        experience_level: 'mid',
        salary_min: 100000,
        salary_max: 150000,
      });
    expect(res.status).toBe(201);
    jobId = res.body.data.id;

    const mine = await request(app)
      .get('/api/jobs/mine')
      .set(auth(users.recruiterA));
    expect(mine.status).toBe(200);
    expect(mine.body.total).toBe(1);
    expect(mine.body.data[0].id).toBe(jobId);
  });

  it('forbids students from /jobs/mine', async () => {
    const res = await request(app)
      .get('/api/jobs/mine')
      .set(auth(users.student));
    expect(res.status).toBe(403);
  });

  it('serves the job publicly with populated company', async () => {
    const res = await request(app).get(`/api/jobs/${jobId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.company.name).toBe('ACME Corp.');
  });
});

describe('applications lifecycle', () => {
  let jobId: string;
  let applicationId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set(auth(users.recruiterA))
      .send({
        title: 'Frontend Engineer',
        description: 'React and TypeScript UI work.',
        job_type: 'full-time',
        experience_level: 'entry',
      });
    expect(res.status).toBe(201);
    jobId = res.body.data.id;
  });

  it('lets a student apply once and flags duplicates', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set(auth(users.student))
      .send({ studentId: users.student.id, jobId });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    applicationId = res.body.data.id;

    const dup = await request(app)
      .post('/api/applications')
      .set(auth(users.student))
      .send({ studentId: users.student.id, jobId });
    expect(dup.status).toBe(409);
    expect(dup.body.code).toBe('CONFLICT');

    const check = await request(app)
      .get('/api/applications/check')
      .set(auth(users.student))
      .query({ studentId: users.student.id, jobId });
    expect(check.status).toBe(200);
    expect(check.body.data.exists).toBe(true);
  });

  it('only lets the owning recruiter (or admin) see and manage applicants', async () => {
    const owner = await request(app)
      .get(`/api/jobs/${jobId}/applications`)
      .set(auth(users.recruiterA));
    expect(owner.status).toBe(200);
    expect(owner.body.data).toHaveLength(1);

    const foreign = await request(app)
      .get(`/api/jobs/${jobId}/applications`)
      .set(auth(users.recruiterB));
    expect(foreign.status).toBe(403);

    const studentView = await request(app)
      .get(`/api/jobs/${jobId}/applications`)
      .set(auth(users.student));
    expect(studentView.status).toBe(403);

    const foreignUpdate = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set(auth(users.recruiterB))
      .send({ status: 'reviewing' });
    expect(foreignUpdate.status).toBe(403);
  });

  it('enforces the status state machine', async () => {
    const review = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set(auth(users.recruiterA))
      .send({ status: 'reviewing' });
    expect(review.status).toBe(200);
    expect(review.body.data.status).toBe('reviewing');

    const accept = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set(auth(users.recruiterA))
      .send({ status: 'accepted' });
    expect(accept.status).toBe(200);
    expect(accept.body.data.status).toBe('accepted');

    // accepted is terminal - no further transitions.
    const rejectAfterAccept = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set(auth(users.recruiterA))
      .send({ status: 'rejected' });
    expect(rejectAfterAccept.status).toBe(422);
    expect(rejectAfterAccept.body.code).toBe('INVALID_STATE_TRANSITION');

    const withdrawAfterAccept = await request(app)
      .patch(`/api/applications/${applicationId}/withdraw`)
      .set(auth(users.student));
    expect(withdrawAfterAccept.status).toBe(422);

    const studentView = await request(app)
      .get(`/api/applications/${applicationId}`)
      .set(auth(users.student));
    expect(studentView.status).toBe(200);
    expect(studentView.body.data.timeline.length).toBeGreaterThanOrEqual(3);
  });

  it('supports withdraw then re-apply on the same job', async () => {
    const jobRes = await request(app)
      .post('/api/jobs')
      .set(auth(users.recruiterA))
      .send({
        title: 'QA Engineer',
        description: 'Testing everything twice.',
        job_type: 'contract',
        experience_level: 'mid',
      });
    expect(jobRes.status).toBe(201);
    const qaJobId = jobRes.body.data.id;

    const applyRes = await request(app)
      .post('/api/applications')
      .set(auth(users.student))
      .send({ studentId: users.student.id, jobId: qaJobId });
    expect(applyRes.status).toBe(201);
    const qaApplicationId = applyRes.body.data.id;

    const withdrawRes = await request(app)
      .patch(`/api/applications/${qaApplicationId}/withdraw`)
      .set(auth(users.student));
    expect(withdrawRes.status).toBe(200);

    const checkWhileWithdrawn = await request(app)
      .get('/api/applications/check')
      .set(auth(users.student))
      .query({ studentId: users.student.id, jobId: qaJobId });
    expect(checkWhileWithdrawn.body.data.exists).toBe(false);

    const reapplyRes = await request(app)
      .post('/api/applications')
      .set(auth(users.student))
      .send({ studentId: users.student.id, jobId: qaJobId });
    expect(reapplyRes.status).toBe(201);
    expect(reapplyRes.body.data.status).toBe('pending');

    const mine = await request(app)
      .get('/api/applications/student')
      .set(auth(users.student));
    expect(mine.status).toBe(200);
    const qaEntries = mine.body.data.filter(
      (a: { job_id: string }) => a.job_id === qaJobId
    );
    expect(qaEntries).toHaveLength(1);
  });
});

describe('duplicate-application race safety', () => {
  let jobId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set(auth(users.recruiterA))
      .send({
        title: 'DevOps Engineer',
        description: 'CI/CD pipelines and infrastructure as code.',
        job_type: 'full-time',
        experience_level: 'senior',
      });
    expect(res.status).toBe(201);
    jobId = res.body.data.id;
  });

  it('exactly one concurrent apply succeeds, the other returns CONFLICT', async () => {
    const [a, b] = await Promise.all([
      request(app)
        .post('/api/applications')
        .set(auth(users.student))
        .send({ studentId: users.student.id, jobId }),
      request(app)
        .post('/api/applications')
        .set(auth(users.student))
        .send({ studentId: users.student.id, jobId }),
    ]);

    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 409]);
    expect(a.body.code || b.body.code).toBe('CONFLICT');
  });
});

describe('admin endpoints', () => {
  it('rejects non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set(auth(users.student));
    expect(res.status).toBe(403);
  });

  it('reports platform stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set(auth(users.admin));
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.users.total).toBe(5);
    expect(data.jobs.total).toBe(4);
    expect(data.jobs.active).toBe(4);
    expect(data.companies.total).toBe(1);
    expect(data.applications.total).toBeGreaterThanOrEqual(1);
  });

  it('lists users without exposing password hashes', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .query({ role: 'recruiter' })
      .set(auth(users.admin));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    for (const user of res.body.data) {
      expect(user.password_hash).toBeUndefined();
      expect(user.role).toBe('recruiter');
    }
  });

  it('blocks and unblocks a user with audit trail', async () => {
    const blockRes = await request(app)
      .patch(`/api/admin/users/${users.recruiterB.id}/block`)
      .set(auth(users.admin));
    expect(blockRes.status).toBe(200);

    const blockedLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'recruiter.b@test.dev', password: 'Password123!' });
    expect(blockedLogin.status).toBe(403);
    expect(blockedLogin.body.code).toBe('ACCOUNT_BLOCKED');

    // Blocking also revokes access to protected routes.
    const blockedCall = await request(app)
      .get('/api/applications/recruiter')
      .set(auth(users.recruiterB));
    expect(blockedCall.status).toBe(403);

    const unblockRes = await request(app)
      .patch(`/api/admin/users/${users.recruiterB.id}/unblock`)
      .set(auth(users.admin));
    expect(unblockRes.status).toBe(200);

    const restoredLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'recruiter.b@test.dev', password: 'Password123!' });
    expect(restoredLogin.status).toBe(200);

    // Update recruiterB tokens for subsequent tests.
    users.recruiterB.accessToken = restoredLogin.body.accessToken;
    users.recruiterB.refreshToken = restoredLogin.body.refreshToken;

    const logs = await request(app)
      .get('/api/admin/audit-logs')
      .set(auth(users.admin));
    expect(logs.status).toBe(200);
    const actions = logs.body.data.map((l: { action: string }) => l.action);
    expect(actions).toContain('block_user');
    expect(actions).toContain('unblock_user');
  });

  it('searches all jobs with pagination envelope', async () => {
    const res = await request(app)
      .get('/api/admin/jobs')
      .query({ search: 'backend' })
      .set(auth(users.admin));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].title).toBe('Backend Engineer');
    expect(res.body.data[0].company.name).toBe('ACME Corp.');
  });
});

describe('recruiter company linking', () => {
  it('lets a recruiter link their profile to an existing company via PATCH profile', async () => {
    const res = await request(app)
      .patch(`/api/profiles/${users.recruiterB.id}`)
      .set(auth(users.recruiterB))
      .send({ company_id: recruiterACompanyId });
    expect(res.status).toBe(200);
    expect(String(res.body.data.company_id)).toBe(recruiterACompanyId);
  });

  it('rejects linking to a nonexistent company', async () => {
    const res = await request(app)
      .patch(`/api/profiles/${users.recruiterB.id}`)
      .set(auth(users.recruiterB))
      .send({ company_id: '000000000000000000000000' });
    expect(res.status).toBe(404);
  });

  it('prevents a student from linking a company', async () => {
    const res = await request(app)
      .patch(`/api/profiles/${users.student.id}`)
      .set(auth(users.student))
      .send({ company_id: recruiterACompanyId });
    expect(res.status).toBe(403);
  });
});

describe('file uploads (resume)', () => {
  const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF');

  it('rejects an unsupported MIME type', async () => {
    const res = await request(app)
      .post('/api/files/resume')
      .set(auth(users.student))
      .attach('file', Buffer.from('not a resume'), {
        filename: 'resume.exe',
        contentType: 'application/x-msdownload',
      });
    expect(res.status).toBe(400);
  });

  it('uploads a resume and returns a signed URL', async () => {
    const res = await request(app)
      .post('/api/files/resume')
      .set(auth(users.student))
      .attach('file', pdfBytes, { filename: 'resume.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(201);
    expect(res.body.data.url).toMatch(/^\/api\/files\/[a-z0-9]+-[0-9a-f]{32}\?exp=\d+&sig=[0-9a-f]{64}$/);
    expect(res.body.data.duplicate).toBe(false);
    expect(res.body.data.expires_at).toBeDefined();

    const served = await request(app).get(res.body.data.url);
    expect(served.status).toBe(200);
    expect(served.headers['content-type']).toBe('application/pdf');
    expect(served.body).not.toBeUndefined();
  });

  it('rejects a signed URL with a tampered signature', async () => {
    const res = await request(app)
      .post('/api/files/resume')
      .set(auth(users.student))
      .attach('file', pdfBytes, { filename: 'resume.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(201);
    const tampered = res.body.data.url.replace(/sig=[0-9a-f]{64}/, `sig=${'0'.repeat(64)}`);
    const served = await request(app).get(tampered);
    expect(served.status).toBe(403);
  });

  it('requires auth to upload', async () => {
    const res = await request(app)
      .post('/api/files/resume')
      .attach('file', pdfBytes, { filename: 'resume.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(401);
  });
});
