import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { jobsRouter } from '../modules/jobs/jobs.routes.js';
import { applicationsRouter } from '../modules/applications/applications.routes.js';
import { savedJobsRouter } from '../modules/saved-jobs/saved-jobs.routes.js';
import { companiesRouter } from '../modules/companies/companies.routes.js';
import { notificationsRouter } from '../modules/notifications/notifications.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';
import { filesRouter } from '../modules/files/files.routes.js';
import { contactRouter } from '../modules/contact/contact.routes.js';

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use(usersRouter);
apiRouter.use(jobsRouter);
apiRouter.use(applicationsRouter);
apiRouter.use(savedJobsRouter);
apiRouter.use(companiesRouter);
apiRouter.use(notificationsRouter);
apiRouter.use(adminRouter);
apiRouter.use(filesRouter);
apiRouter.use(contactRouter);

export const rootRouter = Router();
rootRouter.use('/api', apiRouter);

export default rootRouter;
