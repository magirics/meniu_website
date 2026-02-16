"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PricingPlans } from "@/components/pricing-plans"
import { CurrentPlanCard } from "./components/current-plan-card"
import { BillingHistoryCard } from "./components/billing-history-card"

// Import data
import { useEffect, useState } from "react"
import { differenceInDays, format, getMonth } from "date-fns"
import { useRouter } from "next/navigation"

export default function BillingSettings() {
  const router = useRouter()

  const handlePlanSelect = async (id: string) => {
    const response = await fetch("/api/payment/checkout", {
      method: "POST",
      body: JSON.stringify({
        planId: id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    if (id === "free") {
      location.reload()
    } else {
      location.href = data.session.url
    }
  }

  const [history, setHistory] = useState([])
  const [current, setCurrent] = useState({
    planId: "free",
    planName: "Free",
    price: "$0/month",
    nextBilling: "Never",
    status: "Current",
    // attention: {
    //   daysUsed: 0,
    //   totalDays: 0,
    //   progressPercentage: 0,
    //   remainingDays: 0,
    //   attentionMessage: "",
    // },
  })

  async function getHistory() {
    const response = await fetch("/api/billing")
    const { item } = await response.json()

    const history = item.history.map((item, index) => ({
      id: index,
      month:
        format(item.plan.period.start, "MMMM") +
        " " +
        new Date(item.plan.period.start).getFullYear(),
      plan: item.plan.name,
      amount: item.plan.price / 100,
      status: "Paid",
    }))

    setHistory(history)
  }

  async function getCurrent() {
    const response = await fetch("/api/billing")
    const { item } = await response.json()

    const currentPlan = item.history[0].plan
    if (currentPlan.id === "free") {
      setCurrent({
        planId: currentPlan.id,
        planName: currentPlan.name,
        price: "$0/month",
        nextBilling: "Never",
        status: "Current",
      })
    } else {
      const { start, end } = currentPlan.period

      const price = `$${currentPlan.price / 100}/${currentPlan.frequency}`
      const nextBilling = new Intl.DateTimeFormat().format(new Date(end))
      const totalDays = differenceInDays(end, start)
      const daysUsed = differenceInDays(new Date(), start)
      const progressPercentage = Math.round((daysUsed / totalDays) * 100)
      const remainingDays = totalDays - daysUsed

      setCurrent({
        planId: currentPlan.id,
        planName: currentPlan.name,
        price,
        nextBilling,
        status: "Current",
        // attention: {
        //   totalDays,
        //   daysUsed,
        //   progressPercentage,
        //   remainingDays,
        //   attentionMessage: "Your plan requires update",
        // },
      })
    }
  }

  useEffect(() => {
    getCurrent()
    getHistory()
  }, [])

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Plans & Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <CurrentPlanCard plan={current} />
        <BillingHistoryCard history={history} />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose a plan that works best for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PricingPlans
              mode="billing"
              currentPlanId={current.planId}
              onPlanSelect={handlePlanSelect}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
