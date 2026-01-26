import { withDatabase } from "@/middlewares/withDatabase"
import {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { NextResponse } from "next/server"

const TableName = "Plans"

export const GET = withDatabase(async function (request, context) {
  const database = context.database as DynamoDBClient

  const command = new ScanCommand({
    TableName,
  })
  const output = await database.send(command)
  if (!output.Items) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  const items = output.Items.map((item) => unmarshall(item))
  return NextResponse.json({ items }, { status: 200 })
})
