import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import plans from "@/app/plans.json"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

async function getBilling(shopId, context) {
  const { database } = context

  const key = { shopId }
  const command = new GetItemCommand({
    TableName: "Billing",
    Key: marshall(key),
  })
  const output = await database.send(command)
  if (!output.Item) {
    throw Error("Billing id not found")
  }

  const billing = unmarshall(output.Item)
  return billing
}

async function savePaidPlan(
  selectedPlan,
  subscriptionId,
  period,
  billing,
  context
) {
  const database = context.database as DynamoDBClient

  const plan = {
    id: selectedPlan.id,
    name: selectedPlan.name,
    description: selectedPlan.description,
    price: selectedPlan.price,
    frequency: selectedPlan.frequency,
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
    updatedAt: new Date().toISOString(),
  }

  const Item = marshall(item)
  const command = new PutItemCommand({ TableName: "Billing", Item })

  await database.send(command)
}

export async function checkoutSessionCompleted(event, context) {
  const { shopId, planId } = event.data.object.metadata

  const selectedPlan = plans.find((plan) => plan.id === planId)!

  const subscriptionId = event.data.object.subscription

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const invoice = await stripe.invoices.retrieve(subscription.latest_invoice)
  const { period } = invoice.lines.data[0]

  const billing = await getBilling(shopId, context)

  await savePaidPlan(selectedPlan, subscriptionId, period, billing, context)
}
