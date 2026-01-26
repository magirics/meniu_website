import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import plans from "@/app/plans.json"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

async function getBilling(id, context) {
  const { database } = context

  const key = { id }
  const command = new GetItemCommand({
    TableName: "Billing",
    Key: marshall(key),
  })
  const output = await database.send(command)
  if (!output.Item) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  const billing = unmarshall(output.Item)
  return billing
}

export async function checkoutSessionCompleted(event, context) {
  const database = context.database as DynamoDBClient

  // const customerId = event.data.object.customer
  const subscriptionId = event.data.object.subscription
  const { userId, planId } = event.data.object.metadata

  const currenPlan = plans.find((plan) => plan.id === planId)!
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const invoice = await stripe.invoices.retrieve(subscription.latest_invoice)
  const { period } = invoice.lines.data[0]

  const billing = await getBilling(userId, context)
  // Update billing
  {
    const now = new Date().toISOString()
    const plan = {
      id: currenPlan.id,
      name: currenPlan.name,
      description: currenPlan.description,
      price: currenPlan.price,
      frequency: currenPlan.frequency,
      period: {
        start: new Date(period.start * 1000).toISOString(),
        end: new Date(period.end * 1000).toISOString(),
      },
    }
    const stripe = {
      subscriptionId,
    }
    const item = {
      ...billing,
      history: [{ plan, stripe }, ...billing.history],
      updatedAt: now,
    }

    const Item = marshall(item)
    const command = new PutItemCommand({ TableName: "Billing", Item })

    await database.send(command)
  }
}
