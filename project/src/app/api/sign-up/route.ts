import { cognito } from "@/lib/cognito"
import env from "@/lib/env"
import { stripe } from "@/lib/stripe"
import { withDatabase } from "@/middlewares/withDatabase"
import { AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb"
import { v4 as uuidv4 } from "uuid"
import plans from "@/app/plans.json"
import { NextResponse } from "next/server"

// FIX: make it dev only
export const POST = withDatabase(async (request, context) => {
  const database = context.database as DynamoDBClient

  const { store, owner, email } = await request.json()
  let shopId = uuidv4()
  let ownerId = null
  let customerId = null

  // Create cognito user
  {
    const command = new AdminCreateUserCommand({
      UserPoolId: env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      Username: email,
    })

    const response = await cognito.send(command)
    ownerId = response.User?.Attributes?.find(
      (attribute) => attribute.Name === "sub"
    )?.Value
  }

  // Create stripe customer
  {
    const customer = await stripe.customers.create({
      email,
      name: owner,
      metadata: { shopId },
    })

    customerId = customer.id
  }

  /* Initialize database values */
  const now = new Date().toISOString()

  // Shop
  {
    const shop = {
      id: ownerId,
      name: store,
    }
    const item = { ...shop, createdAt: now, updatedAt: now }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName: "Shop", Item })
    await database.send(command)
  }

  // Billing
  {
    const free = plans.find((plan) => plan.id === "free")!
    const plan = {
      id: free.id,
      name: free.name,
      description: free.description,
      price: free.price,
      frequency: free.frequency,
      period: { start: now },
    }
    const stripe = {
      // subscriptionId: "",
    }
    const billing = {
      id: ownerId,
      history: [{ plan, stripe }],
    }
    const item = { ...billing, createdAt: now, updatedAt: now }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName: "Billing", Item })
    await database.send(command)
  }

  // User
  {
    const user = {
      id: ownerId,
      name: owner,
      email,
      role: "owner",
      stripe: {
        customerId,
      },
    }
    const item = { ...user, createdAt: now, updatedAt: now }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName: "User", Item })
    await database.send(command)
  }

  return NextResponse.json(null, { status: 200 })
})


// const { customAlphabet } = require("nanoid")
// const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
// const nanoid = customAlphabet(alphabet, 21)