import { withAuth } from "@/middlewares/withAuth"
import plans from "@/app/plans.json"
import { stripe } from "@/lib/stripe"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { NextResponse } from "next/server"
import { withDatabase } from "@/middlewares/withDatabase"

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

async function changePlan(billing, planId, context) {
  const { database } = context

  const currenPlan = plans.find((plan) => plan.id === planId)!

  const now = new Date().toISOString()
  const plan = {
    id: currenPlan.id,
    name: currenPlan.name,
    description: currenPlan.description,
    price: currenPlan.price,
    frequency: currenPlan.frequency,
    period: {
      start: new Date().toISOString(),
    },
  }
  const stripe = {}
  const item = {
    ...billing,
    history: [{ plan, stripe }, ...billing.history],
    updatedAt: now,
  }

  const Item = marshall(item)
  const command = new PutItemCommand({ TableName: "Billing", Item })

  await database.send(command)
}

async function getUser(id, context) {
  const { database } = context

  const key = { id }
  const command = new GetItemCommand({
    TableName: "User",
    Key: marshall(key),
  })
  const output = await database.send(command)
  if (!output.Item) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  const user = unmarshall(output.Item)
  return user
}

export const POST = withAuth(
  withDatabase(async function (request, context) {
    const { planId } = await request.json()
    const userId = context.auth.id

    const billing = await getBilling(userId, context)
    const subscriptionId = billing.history[0].stripe.subscriptionId
    if (planId === "free" && subscriptionId) {
      await stripe.subscriptions.cancel(subscriptionId)
      await changePlan(billing, planId, context)
      return NextResponse.json(null, { status: 200 })
    }

    const host = request.headers.get("host")
    try {
      const line_items = [
        {
          price: plans.find((tier) => tier.id === planId).stripe.priceId,
          quantity: 1,
        },
      ]

      const user = await getUser(userId, context)
      const session = await stripe.checkout.sessions.create({
        customer: user.stripe.customerId,
        payment_method_types: ["card"],
        line_items,
        mode: "subscription",
        success_url: `http://${host}/website`,
        cancel_url: `http://${host}/billing`,
        metadata: {
          userId,
          planId,
        },
      })

      return Response.json({ session }, { status: 200 })
    } catch (error: any) {
      console.error(error)
      return Response.json({ error: error.message }, { status: 400 })
    }
  })
)
