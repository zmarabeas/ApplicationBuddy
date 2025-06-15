import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

// Standard rate limiter for most API routes
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req: Request, res: Response) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    });
  },
});

// More restrictive limiter for auth-related routes to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // More lenient for development
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again after an hour',
  handler: (req: Request, res: Response) => {
    console.log(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many login attempts, please try again after an hour',
    });
  },
});

// Specific limiter for resume processing to protect AI parsing resources
export const resumeProcessingLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // More lenient for development
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many resume uploads, please try again tomorrow',
  handler: (req: Request, res: Response) => {
    console.log(`Resume processing rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Daily limit for resume uploads reached. Please try again tomorrow.',
    });
  },
});

// Very strict limiter for data export/deletion to prevent abuse
export const gdprLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: process.env.NODE_ENV === 'production' ? 3 : 50, // More lenient for development
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many data requests, please try again tomorrow',
  handler: (req: Request, res: Response) => {
    console.log(`GDPR-related rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Daily limit for data-related requests reached. Please try again tomorrow.',
    });
  },
});

// Rate limiter for extension API to prevent abuse
export const extensionApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 150 : 1000, // More lenient for development
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from the extension, please try again after 15 minutes',
  handler: (req: Request, res: Response) => {
    console.log(`Extension API rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Rate limit reached. Please try again later.',
    });
  },
});
