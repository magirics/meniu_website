import { withAuth } from "@/middlewares/withAuth"
import { withDatabase } from "@/middlewares/withDatabase"
import {
  DynamoDBClient,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { NextResponse } from "next/server"

export const GET = withAuth(
  withDatabase(async function (request, context) {
    const database = context.database as DynamoDBClient
    const auth = context.auth

    const key = { id: auth.id }
    const command = new GetItemCommand({
      TableName: "Billing",
      Key: marshall(key),
    })

    const output = await database.send(command)
    if (!output.Item) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    const item = unmarshall(output.Item)
    return NextResponse.json({ item }, { status: 200 })
  })
)
