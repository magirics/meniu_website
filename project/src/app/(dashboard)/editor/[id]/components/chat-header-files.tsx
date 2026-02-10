"use client"

import { type Conversation, type User } from "../use-chat"
import ToolBar from "./craft/ToolBar"

interface ChatHeaderProps {
  conversation: Conversation | null
  users: User[]
  onToggleMute?: () => void
  onToggleInfo?: () => void
}

export function ChatHeaderFiles({id}) {

  // Fetch from database

  return <ToolBar value="" css="" id={id}></ToolBar>
}
