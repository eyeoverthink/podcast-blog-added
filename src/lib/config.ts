import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Required environment variables
const requiredEnvVars = [
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'REPLICATE_API_TOKEN',
] as const;

// Optional environment variables with defaults
const optionalEnvVars = {
  DEFAULT_EMAIL: 'eyeoverthink@gmail.com',
  DEFAULT_CREDITS: '1000',
} as const;

// Validate required environment variables
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Export configuration with types
export const config = {
  replicate: {
    apiKey: process.env.REPLICATE_API_TOKEN!,
  },
  auth: {
    clerkSecretKey: process.env.CLERK_SECRET_KEY!,
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  },
  defaults: {
    email: process.env.DEFAULT_EMAIL || optionalEnvVars.DEFAULT_EMAIL,
    credits: parseInt(process.env.DEFAULT_CREDITS || optionalEnvVars.DEFAULT_CREDITS),
  },
} as const;

// Export environment variable names for reference
export const ENV_VARS = {
  required: requiredEnvVars,
  optional: optionalEnvVars,
} as const;
