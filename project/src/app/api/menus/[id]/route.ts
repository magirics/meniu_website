import { MenuValue } from "@/app/schemas/menu"
import { withAuth } from "@/middlewares/withAuth"
import { withDatabase } from "@/middlewares/withDatabase"
import {
  DeleteItemCommand,
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
    const { id } = await context.params

    const command = await new ScanCommand({
      TableName,
      FilterExpression: "id = :id",
      ExpressionAttributeValues: marshall({ ":id": id }),
    })

    const output = await database.send(command)
    if (!output.Items) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    const item = output.Items.map((item) => unmarshall(item))[0]
    return NextResponse.json({ item })
  })
)

export const PUT = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const { id: shopId } = context.auth
    const { id } = await context.params
    const { item: itemValue } = await request.json()
    const item = { ...itemValue, id }

    const output = new PutItemCommand({
      TableName,
      Item: marshall({ ...item, shopId, id }),
    })
    await database.send(output)

    return NextResponse.json({ item }, { status: 200 })
  })
)

async function getMenu(id, context) {
  const database = context.database as DynamoDBClient

  const command = await new ScanCommand({
    TableName,
    FilterExpression: "id = :id",
    ExpressionAttributeValues: marshall({ ":id": id }),
  })

  const output = await database.send(command)
  if (!output.Items) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  const item = output.Items.map((item) => unmarshall(item))[0]
  return item
}

export const POST = withAuth(
  withDatabase(async (request, context) => {
    const database = context.database as DynamoDBClient
    const { id: shopId } = context.auth
    const { id } = await context.params

    const itemValue = await getMenu(id, context)
    const item = {
      ...itemValue,
      name: itemValue.name + " copy",
      shopId,
      id: uuidv4(),
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
