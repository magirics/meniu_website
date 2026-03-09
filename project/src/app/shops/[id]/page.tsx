import {
  ScanCommand,
} from "@aws-sdk/client-dynamodb"
import Renderer from "./Renderer"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import database from "@/lib/database"

export default async function Page({ params }) {
  const { id } = await params
  const menu = await getMenu(id)

  return <Renderer menu={menu} />
}

const getMenu = async (id) => {
  "use server"
  const command = new ScanCommand({
    TableName: "Menu",
    FilterExpression: "shopId = :id",
    ExpressionAttributeValues: marshall({ ":id": id }),
  })

  const output = await database.send(command)
  if (!output.Items) {
    throw Error("Not Found")
  }

  const items = output.Items.map((Item) => unmarshall(Item))
  return items[0]
}
