"use client"

import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import {
  CategoryBlock,
  MainBlock,
  ProductBlock,
  TitleBlock,
} from "./craft/SelectionTools"
import { Editor as CraftEditor, Element, Frame } from "@craftjs/core"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConversationList } from "./conversation-list"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import {
  useChat,
  type Conversation,
  type Message,
  type User,
  type Menu,
} from "../use-chat"
import MenuForm from "./menu-form"
import MenuEditor from "./menu-editor"

interface ChatProps {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  users: User[]
  menus: Menu[]
}

export function Chat({ conversations, messages, users, menus }: ChatProps) {
  const {
    selectedConversation,
    setSelectedConversation,
    setConversations,
    setMessages,
    setUsers,
    addMessage,
    toggleMute,
  } = useChat()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" ? window.innerWidth : 0 >= 1024) {
        // lg breakpoint
        setIsSidebarOpen(false)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  // Initialize data
  useEffect(() => {
    setConversations(conversations)
    setUsers(users)

    // Set messages for all conversations
    Object.entries(messages).forEach(
      ([conversationId, conversationMessages]) => {
        setMessages(conversationId, conversationMessages)
      }
    )

    // Auto-select first conversation if none selected
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(menus[0].id)
    }
  }, [
    conversations,
    messages,
    users,
    selectedConversation,
    setConversations,
    setMessages,
    setUsers,
    setSelectedConversation,
  ])

  const [tab, setTab] = useState("settings")

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-[600px] max-h-[calc(100vh-220px)] flex rounded-lg border bg-background">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Conversations Sidebar - Responsive */}
        <div
          className={`
          w-100 border-r bg-background flex-shrink-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:relative lg:block
          fixed inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out
        `}
        >
          {/* Sidebar Header with Close Button (Mobile Only) */}
          <div className="lg:hidden p-4 border-b flex items-center justify-between bg-background">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ConversationList
            menus={menus}
            conversations={conversations}
            selectedConversation={null}
            onSelectConversation={(id) => {
              setSelectedConversation(id)
              setIsSidebarOpen(false) // Close sidebar on mobile after selection
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
