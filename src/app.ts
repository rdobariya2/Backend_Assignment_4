import express from 'express';
import cors from 'cors';
import loanRoutes from './api/v1/routes/loanRoutes';
import userRoutes from './api/v1/routes/userRoutes';
import { requestLogger, errorLogger } from './api/v1/middleware/logging';
import { errorHandler } from './api/v1/middleware/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(requestLogger);

// Routes
app.use('/api/v1', loanRoutes);
app.use('/api/v1', userRoutes);

// Error logging middleware (must be before errorHandler)
app.use(errorLogger);

// Global error handler (must be last)
app.use(errorHandler);

export default app;