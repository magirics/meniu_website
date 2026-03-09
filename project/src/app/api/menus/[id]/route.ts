import { MenuValue } from "@/app/schemas/menu"
import { generateId } from "@/lib/id"
import { withAuth } from "@/middlewares/withAuth"
import { withDatabase } from "@/middlewares/withDatabase"
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { NextResponse } from "next/server"

const TableName = "Menu"

export const GET = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const { shopId } = context.auth
    const { id } = await context.params

    const command = await new GetItemCommand({
      TableName,
      Key: marshall({ shopId, id }),
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
    const { shopId } = context.auth
    const { id } = await context.params
    const { item: itemValue } = await request.json()
    const item = { ...itemValue, id }

    const now = new Date().toISOString()
    const key = { shopId, id }
    const command = new UpdateItemCommand({
      TableName,
      Key: marshall(key),
      UpdateExpression:
        "SET #name = :name, #description = :description, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
        "#description": "description",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: marshall({
        ":name": item.name,
        ":description": item.description,
        ":updatedAt": now,
      }),
    })
    const output = await database.send(command)

    return NextResponse.json({ item }, { status: 200 })
  })
)

async function getMenu(shopId, id, context) {
  const database = context.database as DynamoDBClient

  const command = await new GetItemCommand({
    TableName,
    Key: marshall({ shopId, id }),
  })

  const output = await database.send(command)
  if (!output.Item) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  const item = unmarshall(output.Item)
  return item
}

export const POST = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const { shopId } = context.auth
    const { id } = await context.params

    const itemValue = await getMenu(shopId, id, context)
    const item = {
      ...itemValue,
      name: itemValue.name + " copy",
      shopId,
      id: generateId(),
    }

    const output = new PutItemCommand({
      TableName,
      Item: marshall(item),
    })
    await database.send(output)

    return NextResponse.json({ item }, { status: 201 })
  })
)

export const DELETE = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const { id: shopId } = context.auth
    const { id } = await context.params
    const command = new DeleteItemCommand({
      TableName,
      Key: marshall({ shopId, id }),
    })
    await database.send(command)

    return NextResponse.json(null, { status: 200 })
  })
)
