import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Firebase
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),

  // Web App
  WEB_APP_URL: z.string().url().optional(),
  EXTENSION_ID: z.string().optional(),

  // Server
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Security
  SESSION_SECRET: z.string().min(32),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  
  // CORS
  CORS_MAX_AGE: z.string().transform(Number).default('86400'), // 24 hours
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export validated config
export const config = {
  firebase: {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
  },
  webApp: {
    url: env.WEB_APP_URL,
    extensionId: env.EXTENSION_ID,
  },
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
  },
  security: {
    sessionSecret: env.SESSION_SECRET,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },
  cors: {
    maxAge: env.CORS_MAX_AGE,
  },
} as const;

// Type for the config object
export type Config = typeof config; 