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
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { v4 as uuidv4 } from "uuid"

function generateKey(shopId: string, filename: string) {
  const hash = crypto.createHash("sha256")
  hash.update(filename + Date.now().toString())
  const hashed = hash.digest("hex")

  const ext = filename.split(".").pop()
  return `${shopId}/${hashed}.${ext}`
}

/* POST – get presigned URL for upload */
export const POST = withAuth(
  withDatabase(async (request: NextRequest, context: any) => {
    const { id: shopId } = context.auth
    const database = context.database as DynamoDBClient
    const { menu: id, filename, contentType } = await request.json()

    if (!filename || !contentType)
      return NextResponse.json(
        { error: "Missing filename or contentType" },
        { status: 400 }
      )

    // Generate a unique key (can sanitize or rename here)
    const key = generateKey(shopId, filename)

    // Generate presigned URL for PUT
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 60 }) // URL valid for 60 seconds

    // saves permalink to database
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
      const publicUrl = `https://${bucket}.s3.amazonaws.com/${key}`
      const now = new Date().toISOString()
      const files = [
        ...menu.files,
        { key: key, url: publicUrl, name: filename },
      ]
      const item = { ...menu, files, updatedAt: now }

      const Item = marshall(item)
      const command = new PutItemCommand({ TableName: "Menu", Item })
      await database.send(command)
    }

    return NextResponse.json({ url, key })
  })
)

// /* PUT – overwrite existing file */
// export const PUT = withAuth(
//   withDatabase(async (request: Request) => {
//     const formData = await request.formData()
//     const file = formData.get("file") as File
//     const key = formData.get("key") as string

//     if (!file || !key)
//       return NextResponse.json({ error: "Missing data" }, { status: 400 })

//     const buffer = Buffer.from(await file.arrayBuffer())

//     await s3.send(
//       new PutObjectCommand({
//         Bucket: BUCKET,
//         Key: key,
//         Body: buffer,
//         ContentType: file.type,
//       })
//     )

//     return NextResponse.json({ success: true })
//   })
// )
