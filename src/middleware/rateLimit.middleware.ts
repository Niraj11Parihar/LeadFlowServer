import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const ipHits = new Map<string, RateLimitStore>();

// Periodic cleanup of expired rate-limit records
setInterval(() => {
  const now = Date.now();
  for (const [ip, store] of ipHits.entries()) {
    if (now > store.resetTime) {
      ipHits.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export const authRateLimiter = (maxRequests = 15, windowMs = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = ipHits.get(ip);

    if (!record || now > record.resetTime) {
      ipHits.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
      });
    }

    record.count += 1;
    return next();
  };
};
