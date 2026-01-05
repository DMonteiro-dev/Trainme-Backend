import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/sessions.routes.js';
import trainerRoutes from './routes/trainers.routes.js';
import clientRoutes from './routes/clients.routes.js';
import messageRoutes from './routes/messages.routes.js';
import trainingPlanRoutes from './routes/trainingPlan.routes.js';
// import exerciseRoutes from './routes/exercises.routes.js';
import reviewRoutes from './routes/reviews.routes.js';
// import uploadRoutes from './routes/upload.routes.js';
import progressLogRoutes from './routes/progress.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import usersRoutes from './routes/users.routes.js';
import adminRoutes from './routes/admin.routes.js';
import clientTrainerRequestsRoutes from './routes/clientTrainerRequests.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';
import { swaggerSpec } from './docs/swagger.js';

const allowedOrigins = env.CORS_ORIGINS;

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked CORS origin: ${origin}. Allowed: ${JSON.stringify(allowedOrigins)}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/sessions', sessionRoutes);
apiRouter.use('/trainers', trainerRoutes);
apiRouter.use('/clients', clientRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/plans', trainingPlanRoutes);
// apiRouter.use('/exercises', exerciseRoutes);
apiRouter.use('/reviews', reviewRoutes);
// apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/progress', progressLogRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/', clientTrainerRequestsRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
