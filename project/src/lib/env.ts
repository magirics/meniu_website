import { z } from "zod"

const envSchema = z.object({
  // Private
  AMZ_ACCESS_KEY_ID: z.string(),
  AMZ_SECRET_ACCESS_KEY: z.string(),

  COGNITO_ISSUER: z.string(),
  AMZ_S3_BUCKET: z.string(),

  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),

  // Public
  NEXT_PUBLIC_AWS_REGION: z.string(),

  NEXT_PUBLIC_COGNITO_USER_POOL_ID: z.string(),
  NEXT_PUBLIC_COGNITO_CLIENT_ID: z.string(),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),

  // Node
  NODE_ENV: z.enum(["development", "production"]),
})

export default envSchema.parse(process.env)
