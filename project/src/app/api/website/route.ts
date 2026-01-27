import { withAuth } from "@/middlewares/withAuth"
import { withDatabase } from "@/middlewares/withDatabase"
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { NextResponse } from "next/server"

const TableName = "Website"

export const GET = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const { id } = context.auth

    const command = new GetItemCommand({
      TableName,
      Key: marshall({ id }),
    })
    const output = await database.send(command)
    if (!output.Item) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    const item = unmarshall(output.Item)
    return NextResponse.json({ item })
  })
)

export const PUT = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const auth = context.auth

    const { item: itemValue } = await request.json()

    const { id } = auth
    const now = new Date().toISOString()
    const item = { ...itemValue, id, updatedAt: now }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName, Item })
    await database.send(command)

    return NextResponse.json({ item }, { status: 201 })
  })
)
