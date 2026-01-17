import { jwtVerify, createRemoteJWKSet, errors } from "jose"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const region = process.env.AWS_REGION!
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!

// const refreshTokens = new Map<string, string>()
// refreshTokens.set(access_token, refresh_token)

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

// async function refreshAccessToken(accessToken: string) {
//   const refreshToken = refreshTokens.get(accessToken)
//   if (!refreshToken) throw Error("INVALID_TOKEN")

//   const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-amz-json-1.1",
//       "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
//     },
//     body: JSON.stringify({
//       AuthFlow: "REFRESH_TOKEN_AUTH",
//       ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
//       AuthParameters: {
//         REFRESH_TOKEN: refreshToken,
//       },
//     }),
//   })

//   if (!response.ok) throw new Error("FAILED_REFRESH")
//   const data = await response.json()

//   return {
//     accessToken: data.AuthenticationResult.AccessToken,
//     idToken: data.AuthenticationResult.IdToken,
//     expiresIn: data.AuthenticationResult.ExpiresIn,
//   }
// }

export function withAuth(handler) {
  return async function (request: NextRequest) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("token")?.value
    if (!accessToken) throw new Error("No token")

    try {
      // const payload = await verifyJWT(accessToken)
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return await handler(request)
  }
}
