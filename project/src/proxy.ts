import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { withDatabase } from "./middlewares/withDatabase"
import { ScanCommand } from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

async function getPage(url, context) {
  const database = context.database

  const command = new ScanCommand({
    TableName: "Website",
    FilterExpression: "#url = :url",
    ExpressionAttributeNames: { "#url": "url" },
    ExpressionAttributeValues: marshall({ ":url": url }),
  })
  const output = await database.send(command)
  const items = output.Items.map((item) => unmarshall(item))
  return items[0].shopId
}

// This function can be marked `async` if using `await` inside
export const proxy = withDatabase(async (request: NextRequest, context) => {
  // localhost || meniu.shop
  // abcd1234.meniu.shop || my-restaurant.com

  const host = request.headers.get("host")!
  const [domain, port] = host.split(":")
  const [subdomain, secdomain, topdomain] = domain.split(".")

  // console.log("host = ", host)
  // console.log("[domain, port] = ", [domain, port])
  // console.log("[subdomain, secdomain, topdomain]", [
  //   subdomain,
  //   secdomain,
  //   topdomain,
  // ])

  if (host == "localhost" || host == "meniu.shop") {
    return NextResponse.next()
  }

  if (subdomain && secdomain && topdomain) {
    const id = await getPage(domain, context)

    // FIX: use https for production
    const url = `http://meniu.shop/shops/${id}`
    // console.log("url =", url)

    return NextResponse.rewrite(url)
  }

  return NextResponse.error()
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
