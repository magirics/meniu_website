import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import env from "@/lib/env"

export default new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})
