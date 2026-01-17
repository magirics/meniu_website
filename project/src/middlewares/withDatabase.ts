import { NextResponse } from "next/server"
import database from "@/lib/database"

export const withDatabase = (next) => {
  const handler = async (request, context) => {
    try {
      return await next(request, { ...context, database })
    } catch (error) {
      console.error(error)
      return NextResponse.json(
        { error: "Service Unavailable" },
        { status: 503 }
      )
    }
  }

  return handler
}
