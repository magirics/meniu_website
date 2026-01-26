import { NextResponse } from "next/server"
import { jwtVerify, createRemoteJWKSet } from "jose"
import env from "@/lib/env"

const JWKS = createRemoteJWKSet(
  new URL(
    `${env.COGNITO_ISSUER}/.well-known/jwks.json`
  )
)

export async function verifyJWT(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: env.COGNITO_ISSUER,
  })

  return payload
}

export async function POST(req: Request) {
  const { token } = await req.json()

  // Verify token before setting cookie
  const payload = await verifyJWT(token)

  const response = NextResponse.json({ success: true })
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  })

  return response
}
