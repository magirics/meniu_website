import { withAuth } from "@/middlewares/withAuth"
import { NextResponse } from "next/server"

export const GET = withAuth(async function (request) {
  return NextResponse.json({ menus: ["my_menus_1", "my_menu_2"] })
})
