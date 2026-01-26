import { withDatabase } from "@/middlewares/withDatabase"
import { NextResponse } from "next/server"
import { checkoutSessionCompleted } from "./checkout-session"
import {
  customerSubscriptionDeleted,
  customerSubscriptionUpdated,
} from "./customer-subscription"
import env from "@/lib/env"
import { stripe } from "@/lib/stripe"

export const POST = withDatabase(async function (request, context) {
  const buffer = Buffer.from(await request.arrayBuffer())
  const signature = request.headers.get("stripe-signature")

  let event = null
  try {
    event = stripe.webhooks.constructEvent(
      buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (e) {
    console.error("Webhook signature verification failed:", e.message)
    return NextResponse.json(
      { error: `Webhook Error: ${e.message}` },
      { status: 400 }
    )
  }

  if (event.type === "checkout.session.completed") {
    checkoutSessionCompleted(event, context)
  } else if (event.type === "customer.subscription.updated") {
    customerSubscriptionUpdated(event, context)
  } else if (event.type === "customer.subscription.deleted") {
    customerSubscriptionDeleted(event, context)
  }

  return NextResponse.json(null, { status: 200 })
})
