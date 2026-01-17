import { jwtVerify, createRemoteJWKSet, errors } from "jose"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const region = process.env.AWS_REGION!
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!

const JWKS = createRemoteJWKSet(
  new URL(
    `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
  )
)

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
    })
    return payload
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      throw new Error("TOKEN_EXPIRED")
    }

    throw new Error("INVALID_TOKEN")
  }
}

export function withAuth(next) {
  return async function (request: NextRequest, context) {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let auth = null
    try {
      auth = await verifyJWT(token)
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return await next(request, { ...context, auth })
  }
}
