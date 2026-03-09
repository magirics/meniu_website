import { withAuth } from "@/middlewares/withAuth"
import { withDatabase } from "@/middlewares/withDatabase"
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb"
import { NextResponse } from "next/server"

const TableName = "Website"

export const PATCH = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const auth = context.auth

    const { id } = await request.json()

    const { shopId } = auth
    const now = new Date().toISOString()
    const item = { defaultMenu: id, shopId, updatedAt: now }

    const key = { shopId }
    const command = new UpdateItemCommand({
      TableName,
      Key: marshall(key),
      UpdateExpression:
        "SET #defaultMenu = :defaultMenu, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#defaultMenu": "defaultMenu",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: marshall({
        ":defaultMenu": item.defaultMenu,
        ":updatedAt": now,
      }),
    })
    await database.send(command)

    return NextResponse.json({ item }, { status: 200 })
  })
)
