import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

export default new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY,
  },
})
