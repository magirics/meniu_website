import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/middlewares/withAuth"
import { withDatabase } from "@/middlewares/withDatabase"
import {
  DynamoDBClient,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, } from "@aws-sdk/util-dynamodb"

export const PATCH = withAuth(
  withDatabase(async (request: NextRequest, context) => {
    const { shopId } = context.auth
    const { id } = await context.params
    const { layout } = await request.json()
    const database = context.database as DynamoDBClient

    {
      const now = new Date().toISOString()
      const key = { shopId, id }
      const command = new UpdateItemCommand({
        TableName: "Menu",
        Key: marshall(key),
        UpdateExpression: "SET #layout = :layout, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#layout": "layout",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: marshall({
          ":layout": layout,
          ":updatedAt": now,
        }),
      })
      await database.send(command)
    }

    return NextResponse.json({ success: true })
  })
)
