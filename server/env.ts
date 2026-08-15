import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET must be at least 10 characters long'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 characters long'),
  ZARINPAL_MERCHANT_ID: z.string().length(36, 'ZARINPAL_MERCHANT_ID must be 36 characters long').optional().or(z.literal('')),
  ZARINPAL_SANDBOX: z.string().default('true').transform((val: string) => val === 'true'),
  DATABASE_URL: z.string().default('./data/janebi.db'),
  GEMINI_API_KEY: z.string().optional().or(z.literal('')),
  APP_URL: z.string().url().default('http://localhost:3000'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
