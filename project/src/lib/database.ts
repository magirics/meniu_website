import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import env from "@/lib/env"

export default new DynamoDBClient({
  region: env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: env.AMZ_ACCESS_KEY_ID,
    secretAccessKey: env.AMZ_SECRET_ACCESS_KEY,
  },
})
