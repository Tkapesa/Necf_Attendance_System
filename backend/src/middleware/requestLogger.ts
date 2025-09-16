import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request details
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  
  // Log response time after request completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
  });
  
  next();
};
