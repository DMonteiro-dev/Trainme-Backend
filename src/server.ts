import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

import { createServer } from 'http';
import { initSocket } from './socket/index.js';
import { initScheduledJobs } from './jobs/session.jobs.js';

export const startServer = async () => {
  await connectDatabase();
  initScheduledJobs();
  const httpServer = createServer(app);

  // Initialize Socket.io
  const io = initSocket(httpServer);

  // Make io accessible via app if needed (e.g. app.set('io', io))

  const server = httpServer.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
  return server;
};

if (env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    logger.error('Failed to start server', error);
    process.exit(1);
  });
}
