import { z } from "zod"

const envSchema = z.object({
  AWS_REGION: z.string(),

  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),

  COGNITO_APP_CLIENT_ID: z.string(),
  COGNITO_ISSUER: z.string(),
  COGNITO_APP_CLIENT_SECRET: z.string(),

  NODE_ENV: z.enum(["development", "production"]),
})

export default envSchema.parse(process.env)
