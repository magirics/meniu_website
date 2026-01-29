import { withAuth } from "@/middlewares/withAuth"
import { withDatabase } from "@/middlewares/withDatabase"
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

const TableName = "Menu"

export const GET = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const { id } = context.auth

    const command = await new ScanCommand({
      TableName,
      FilterExpression: "shopId = :shopId",
      ExpressionAttributeValues: marshall({ ":shopId": id }),
    })

    const output = await database.send(command)
    if (!output.Items) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    const items = output.Items.map((item) => unmarshall(item))
    return NextResponse.json({ items })
  })
)

export const POST = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const auth = context.auth

    const { item: itemValue } = await request.json()
    const shopId = auth.id
    const id = uuidv4()
    const now = new Date().toISOString()
    const item = { ...itemValue, shopId, id, createdAt: now, updatedAt: now }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName, Item })
    await database.send(command)

    return NextResponse.json({ item }, { status: 201 })
  })
)
