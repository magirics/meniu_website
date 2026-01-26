import {
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { withAuth } from "@/middlewares/withAuth"
import { NextRequest, NextResponse } from "next/server"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb"
import { withDatabase } from "@/middlewares/withDatabase"
import plans from "@/app/plans.json"
import { cognito } from "@/lib/cognito"
import env from "@/lib/env"

async function getCognitoUser(username: string) {
  const userCommand = new AdminGetUserCommand({
    UserPoolId: env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    Username: username,
  })
  const userOutput = await cognito.send(userCommand)

  const attrs = Object.fromEntries(
    userOutput.UserAttributes?.map((a) => [a.Name, a.Value]) ?? []
  )

  const groupsCommand = new AdminListGroupsForUserCommand({
    UserPoolId: env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    Username: username,
  })
  const groupsOutput = await cognito.send(groupsCommand)
  const groups = groupsOutput.Groups?.map((a) => a.GroupName) ?? []

  return {
    id: attrs.sub,
    email: attrs.email,
    name: attrs.name ?? "",
    role: groups[0],
  }
}

export const GET = withAuth(
  withDatabase(async function (request: NextRequest, context) {
    const auth = context.auth
    const database = context.database as DynamoDBClient
    const user = await getCognitoUser(auth.sub)

    {
      const now = new Date().toISOString()
      const item = { ...user, createdAt: now, updatedAt: now }

      const Item = marshall(item)
      const command = new PutItemCommand({ TableName: "User", Item })
      await database.send(command)
    }

    {
      const now = new Date().toISOString()
      const plan = plans.find((tier) => tier.id === "free")
      const item = {
        id: user.id,
        history: [
          {
            plan: {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              period: {
                start: now,
              },
            },
            stripe: {
              customerId: "",
              subscriptionId: "",
            },
          },
        ],
        createdAt: now,
        updatedAt: now,
      }

      const Item = marshall(item)
      const command = new PutItemCommand({ TableName: "Billing", Item })
      await database.send(command)
    }

    {
      const customer = await stripe.customers.create({
        email: "user@example.com",
        name: "Jane Doe",
      })
    }

    return NextResponse.json({ error: "" }, { status: 200 })
  })
)
