import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create write stream for logging
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), {
  flags: 'a'
});

// Custom Morgan format for more detailed logging
const logFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Morgan middleware for logging HTTP requests
export const requestLogger = morgan(logFormat, {
  stream: accessLogStream,
  skip: (req: Request, res: Response) => {
    // Skip logging for health checks or static files if needed
    return req.url === '/health' || req.url.startsWith('/static');
  }
});

// Additional middleware for logging errors and important events
export const errorLogger = (error: any, req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req.method,
    url: req.url,
    user: req.user?.email || 'anonymous',
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
  };

  const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), {
    flags: 'a'
  });

  errorLogStream.write(JSON.stringify(logEntry) + '\n');
  next(error);
};