import { cognito } from "@/lib/cognito"
import env from "@/lib/env"
import { stripe } from "@/lib/stripe"
import { withDatabase } from "@/middlewares/withDatabase"
import { AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb"
import plans from "@/app/plans.json"
import { NextResponse } from "next/server"
import { generateId, generateURL } from "@/lib/id"

// FIX: make it dev only
export const POST = withDatabase(async (request, context) => {
  const database = context.database as DynamoDBClient

  const { shop, owner, email } = await request.json()
  let shopId = null
  let cognitoId = null
  let stripeId = null

  // Create cognito user
  {
    const command = new AdminCreateUserCommand({
      UserPoolId: env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      Username: email,
    })

    const response = await cognito.send(command)
    cognitoId = response.User?.Attributes?.find(
      (attribute) => attribute.Name === "sub"
    )?.Value
    shopId = cognitoId
  }

  // Create stripe customer
  {
    const customer = await stripe.customers.create({
      email,
      name: owner,
      metadata: { shopId },
    })

    stripeId = customer.id
  }

  /* Initialize database values */
  const now = new Date().toISOString()

  // Shop
  {
    const item = {
      shopId,
      name: shop,
      createdAt: now,
      updatedAt: now,
    }

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
      // invoiceId: "",
    }
    const billing = {
      shopId,
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
      shopId,
      id: cognitoId,
      name: owner,
      email,
      role: "owner",
      stripe: {
        customerId: stripeId,
      },
    }
    const item = { ...user, createdAt: now, updatedAt: now }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName: "User", Item })
    await database.send(command)
  }

  // Website
  {
    const url = generateURL()
    const website = {
      shopId,
      url,
      freeUrl: url,
      title: shop,
      description: "Check out our menu and find your next favorite dish today!",
      keywords: "menu, restaurant, food, dishes, online ordering",
      scheduled: [],
    }
    const item = { ...website, createdAt: now, updatedAt: now }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName: "Website", Item })
    await database.send(command)
  }

  // Menu
  {
    const menu = {
      shopId,
      id: generateId(),
      name: "First menu",
      description: "My first menu",
      files: [],
    }
    const item = { ...menu, createdAt: now, updatedAt: now }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName: "Menu", Item })
    await database.send(command)
  }

  return NextResponse.json(null, { status: 200 })
})
