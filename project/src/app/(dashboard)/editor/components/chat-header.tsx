"use client"

import {
  Phone,
  Video,
  Info,
  Search,
  MoreVertical,
  Users,
  Bell,
  BellOff,
  Candy,
  Rows3,
  TicketPercent,
  Save,
  Copy,
  Trash,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { type Conversation, type User } from "../use-chat"
import ToolBar from "./craft/ToolBar"

interface ChatHeaderProps {
  conversation: Conversation | null
  users: User[]
  onToggleMute?: () => void
  onToggleInfo?: () => void
}

export function ChatHeader({ id }) {
  // Fetch from database

  return <ToolBar id={id} value="" css=""></ToolBar>
}
