import { withAuth } from "@/middlewares/withAuth"
import plans from "@/app/plans.json"
import { stripe } from "@/lib/stripe"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { NextResponse } from "next/server"
import { withDatabase } from "@/middlewares/withDatabase"
import env from "@/lib/env"

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

async function saveFreePlan(selectedPlan, billing, context) {
  const { database } = context

  const now = new Date().toISOString()
  const plan = {
    id: selectedPlan.id,
    name: selectedPlan.name,
    description: selectedPlan.description,
    price: selectedPlan.price,
    frequency: selectedPlan.frequency,
    period: {
      start: now,
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

async function getOwner(id, context) {
  const { database } = context

  const key = { shopId: id, id }
  const command = new GetItemCommand({
    TableName: "User",
    Key: marshall(key),
  })
  const output = await database.send(command)
  if (!output.Item) {
    throw Error("Owner id not found")
  }

  const user = unmarshall(output.Item)
  return user
}

export const POST = withAuth(
  withDatabase(async function (request, context) {
    const { planId } = await request.json()
    const { shopId } = context.auth

    const selectedPlan = plans.find((tier) => tier.id === planId)!
    const host = request.headers.get("host")
    const owner = await getOwner(shopId, context)
    const protocol = env.NODE_ENV === "development" ? "http" : "https"

    const billing = await getBilling(shopId, context)
    const subscriptionId = billing.history[0].stripe.subscriptionId

    const isCurrentFree = !subscriptionId
    const isSelectedFree = planId === "free"

    /* 
    paid -> free
    free -> paid
    paid -> paid
    */

    try {
      if (!isCurrentFree && isSelectedFree) {
        console.log("paid -> free")
        await stripe.subscriptions.cancel(subscriptionId)
        await saveFreePlan(selectedPlan, billing, context)
        return NextResponse.json(null, { status: 200 })
      }

      if (isCurrentFree && !isSelectedFree) {
        console.log("free -> paid")
        const session = await createCheckoutSession(
          selectedPlan,
          owner,
          protocol,
          host,
          shopId,
          planId
        )
        return Response.json({ session }, { status: 200 })
      }

      if (!isCurrentFree && !isSelectedFree) {
        console.log("paid -> paid")
        await stripe.subscriptions.cancel(subscriptionId)
        const session = await createCheckoutSession(
          selectedPlan,
          owner,
          protocol,
          host,
          shopId,
          planId
        )
        return Response.json({ session }, { status: 200 })
      }
    } catch (error: any) {
      console.error(error)
      return Response.json({ error: error.message }, { status: 400 })
    }
  })
)

async function createCheckoutSession(
  selectedPlan,
  owner,
  protocol,
  host,
  shopId,
  planId
) {
  const line_items = [
    {
      price: selectedPlan.stripe.priceId,
      quantity: 1,
    },
  ]

  const session = await stripe.checkout.sessions.create({
    customer: owner.stripe.customerId,
    payment_method_types: ["card"],
    line_items,
    mode: "subscription",
    success_url: `${protocol}://${host}/billing`,
    cancel_url: `${protocol}://${host}/billing`,
    metadata: {
      shopId,
      planId,
    },
  })

  return session
}
