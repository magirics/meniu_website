import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  ListUserPoolsCommand,
  AdminListGroupsForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { withAuth } from "@/middlewares/withAuth"
import { NextRequest, NextResponse } from "next/server"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb"
import { withDatabase } from "@/middlewares/withDatabase"

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
})

export async function getCognitoUser(username: string) {
  const userCommand = new AdminGetUserCommand({
    UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
    Username: username,
  })
  const userOutput = await client.send(userCommand)

  const attrs = Object.fromEntries(
    userOutput.UserAttributes?.map((a) => [a.Name, a.Value]) ?? []
  )

  const groupsCommand = new AdminListGroupsForUserCommand({
    UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
    Username: username,
  })
  const groupsOutput = await client.send(groupsCommand)
  const groups = groupsOutput.Groups?.map((a) => a.GroupName) ?? []

  return {
    id: attrs.sub,
    email: attrs.email,
    name: attrs.name ?? "",
    role: groups[0],
  }
}

export const POST = withAuth(
  withDatabase(async function (request: NextRequest, context) {
    const auth = context.auth
    const user = await getCognitoUser(auth.sub)

    // save in dynamo
    const database = context.database as DynamoDBClient

    const now = new Date().toISOString()
    const item = { ...user, createdAt: now, updatedAt: now }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName: "User", Item })
    await database.send(command)

    return NextResponse.json({ error: "" }, { status: 200 })
  })
)
