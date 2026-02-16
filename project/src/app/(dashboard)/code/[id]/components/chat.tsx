"use client"

import React, { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

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
import { ChatHeaderFiles } from "./chat-header-files"
import * as Babel from "@babel/standalone"
import dynamic from "next/dynamic"

interface ChatProps {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  users: User[]
  menus: Menu[]
}

export function Chat({ id, conversations, messages, users, menus }: ChatProps) {
  const selectedConversation = id

  const { setConversations, setMessages, setUsers, addMessage, toggleMute } =
    useChat()

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
  }, [
    conversations,
    messages,
    users,
    selectedConversation,
    setConversations,
    setMessages,
    setUsers,
  ])

  const [menu, setMenu] = useState(null)
  async function getMenu() {
    const response = await fetch(`/api/menus/${selectedConversation}`)
    const { item } = await response.json()
    setMenu(item)
    return item
  }

  const [core, setCore] = useState(null)
  async function getCore(menu) {
    const coreFile = menu.files.find((file) => file.name === "core.tsx")
    if (!coreFile) return

    const response = await fetch(coreFile.url)
    const page_tsx = await response.text()

    // const main = eval(page_jsx)

    const page_js = Babel.transform(page_tsx, { presets: ["react"] }).code
    const main = eval(
      `async (React) => { ${page_js} return { icons, components, Layout } }`
    )

    const core = await main(React)
    setCore(core)
  }

  async function getStuff() {
    const menu = await getMenu()
    await getCore(menu)
  }

  useEffect(() => {
    getStuff()
  }, [])

  const MyComponent = dynamic(() => import("./tabs-section"), { ssr: false })

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
            selectedConversation={selectedConversation}
            onSelectConversation={(id) => {
              // setSelectedConversation(id)
              setIsSidebarOpen(false) // Close sidebar on mobile after selection
            }}
          />
        </div>

        {core && (
          <MyComponent
            core={core}
            menu={menu}
            selectedConversation={selectedConversation}
            setIsSidebarOpen={setIsSidebarOpen}
          ></MyComponent>
        )}
      </div>
    </TooltipProvider>
  )
}
