import env from "@/lib/env"
import { jwtVerify, createRemoteJWKSet, errors } from "jose"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const JWKS = createRemoteJWKSet(
  new URL(`${env.COGNITO_ISSUER}/.well-known/jwks.json`)
)

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.COGNITO_ISSUER,
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
      const payload = await verifyJWT(token)
      auth = {
        userId: payload.sub,
        shopId: payload.sub,
        getUser: async () => {},
      }
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return await next(request, { ...context, auth })
  }
}
