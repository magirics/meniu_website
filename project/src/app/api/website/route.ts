import { withAuth } from "@/middlewares/withAuth"
import { withDatabase } from "@/middlewares/withDatabase"
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { NextResponse } from "next/server"

const TableName = "Website"

export const GET = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const { shopId } = context.auth

    const command = new GetItemCommand({
      TableName,
      Key: marshall({ shopId }),
    })
    const output = await database.send(command)
    if (!output.Item) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    const item = unmarshall(output.Item)
    return NextResponse.json({ item })
  })
)

export const PATCH = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const auth = context.auth

    const { item: itemValue } = await request.json()

    const { shopId } = auth
    const now = new Date().toISOString()
    const item = { ...itemValue, shopId, updatedAt: now }

    const key = { shopId }
    const command = new UpdateItemCommand({
      TableName,
      Key: marshall(key),
      UpdateExpression:
        "SET #url = :url, #title = :title, #keywords = :keywords, #description = :description, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#url": "url",
        "#title": "title",
        "#keywords": "keywords",
        "#description": "description",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: marshall({
        ":url": item.url,
        ":title": item.title,
        ":keywords": item.keywords,
        ":description": item.description,
        ":updatedAt": now,
      }),
    })
    await database.send(command)

    return NextResponse.json({ item }, { status: 200 })
  })
)
