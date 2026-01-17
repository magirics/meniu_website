import { NextResponse } from "next/server"
import { jwtVerify, createRemoteJWKSet } from "jose"

const region = process.env.AWS_REGION!
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!

const JWKS = createRemoteJWKSet(
  new URL(
    `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
  )
)

export async function verifyJWT(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  })

  return response
}
