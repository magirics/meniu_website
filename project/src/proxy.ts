import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { withDatabase } from "./middlewares/withDatabase"
import { ScanCommand } from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

const { customAlphabet } = require("nanoid")
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
const nanoid = customAlphabet(alphabet, 21)

async function getPage(url, context) {
  const database = context.database

  const command = new ScanCommand({
    TableName: "Website",
    ExpressionAttributeNames: { "#url": "url" },
    FilterExpression: "#url = :url",
    ExpressionAttributeValues: marshall({ ":url": url }),
  })
  const output = await database.send(command)
  const items = output.Items.map((item) => unmarshall(item))
  return items[0].id
}

// This function can be marked `async` if using `await` inside
export const proxy = withDatabase(async (request: NextRequest, context) => {
  // Add custom middleware logic here
  // For example: authentication, redirects, etc.

  // subdomain
  const host = request.headers.get("host")
  const hostname = host?.split(":")[0] || ""
  const parts = hostname.split(".")

  if ((hostname == "meniu.shop")) {
    return NextResponse.next()
  }

  // console.log("host = ", host)
  // console.log("hostname = ", hostname)
  // console.log("parts = ", parts)

  let subdomain = ""
  if (parts.length > 2) {
    // it's a subdomain
    subdomain = parts.slice(0, parts.length - 2).join(".")
    console.log("nanoid() =", nanoid())
    const id = await getPage(subdomain, context)

    // FIX
    // const url = `http://localhost:3000/shop/${id}`
    const url = `http://localhost:3000/`

    console.log("url =", url)
    return NextResponse.rewrite(url)
  } else {
    // 'its a domain'
    const domain = hostname
    const id = await getPage(domain, context)

    // FIX
    // const url = `http://localhost:3000/shop/${id}`
    const url = `http://localhost:3000/`

    console.log("url =", url)
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
})

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
