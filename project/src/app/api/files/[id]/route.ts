import { NextRequest, NextResponse } from "next/server"
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import crypto from "crypto"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { withAuth } from "@/middlewares/withAuth"
import { withDatabase } from "@/middlewares/withDatabase"
import { bucket, s3 } from "@/lib/s3"
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

export const DELETE = withAuth(
  withDatabase(async (req: Request, context) => {
    const { shopId } = context.auth
    const { id } = await context.params
    const { key } = await req.json()
    const database = context.database as DynamoDBClient

    if (!key)
      return NextResponse.json({ error: "Missing key" }, { status: 400 })

    let menu = null
    {
      const key = { shopId, id }
      const command = new GetItemCommand({
        TableName: "Menu",
        Key: marshall(key),
      })

      const output = await database.send(command)
      if (!output.Item) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 })
      }

      const item = unmarshall(output.Item)
      menu = item
    }
    {
      const now = new Date().toISOString()
      // console.log('menu.files = ', menu.files)
      const files = menu.files.filter((file) => file.key != key)
      // console.log('files = ', files)
      const item = { ...menu, files, updatedAt: now }

      const Item = marshall(item)
      const command = new PutItemCommand({ TableName: "Menu", Item })
      await database.send(command)
    }

    {
      const command = new QueryCommand({
        TableName: "Menu",
        KeyConditionExpression: "shopId = :shopId",
        ExpressionAttributeValues: marshall({ ":shopId": shopId }),
      })

      const output = await database.send(command)
      if (!output.Items) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 })
      }

      const menus = output.Items.map((item) => unmarshall(item))
      const files = menus.map((menu) => menu.files).flat()
      const file = files.find((file) => file.key === key)

      if (!file) {
        console.log("Error while deleting the file")

        console.log("shopId =", shopId)
        console.log("id =", id)
        console.log("key =", key)
      }
      if (!file) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          })
        )
      }
    }

    return NextResponse.json({ success: true })
  })
)
