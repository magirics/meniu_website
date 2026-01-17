import { withAuth } from "@/middlewares/withAuth"
import { NextRequest, NextResponse } from "next/server"

export const GET = withAuth(async function (request: NextRequest) {
  return NextResponse.json({ value: "OK!" })
})
