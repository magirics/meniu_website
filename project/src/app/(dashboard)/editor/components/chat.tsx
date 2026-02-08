"use client"

import React, { useEffect, useState } from "react"
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
import { ChatHeaderFiles } from "./chat-header-files"
import * as Babel from "@babel/standalone"

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
      setSelectedConversation(menus[1].id)
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

  const [tab, setTab] = useState("files")

  const [core, setCore] = useState(null)
  async function getCore() {
    const response = await fetch("/test/data-main.tsx")
    const page_jsx = await response.text()

    // const main = eval(page_jsx)

    const page_js = Babel.transform(page_jsx, { presets: ["react"] }).code
    const main = eval(
      `async (React) => { ${page_js} return { icons, components, Layout } }`
    )

    const core = await main(React)
    setCore(core)
  }

  const [menu, setMenu] = useState(null)
  async function getMenu() {
    const response = await fetch(`/api/menus/${selectedConversation}`)
    const { item } = await response.json()
    setMenu(item)
  }

  async function getStuff() {
    await getCore()
    await getMenu()
  }

  useEffect(() => {
    getStuff()
  }, [selectedConversation])

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
              setSelectedConversation(id)
              setIsSidebarOpen(false) // Close sidebar on mobile after selection
            }}
          />
        </div>

        {core && (
          <CraftEditor
            key={selectedConversation}
            resolver={{
              Layout: core.Layout,
              TitleBlock,
              MainBlock,
              CategoryBlock,
              ProductBlock,
            }}
          >
            <Tabs
              value={tab}
              onValueChange={setTab}
              className="grow overflow-hidden"
            >
              {/* Chat Panel - Flexible Width */}
              <div className="flex-1 flex flex-col min-w-0 bg-background h-full">
                {/* Chat Header with Hamburger Menu */}
                <div className="flex items-center h-16 px-4 border-b bg-background">
                  {/* Hamburger Menu Button - Only visible when sidebar is hidden on mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(true)}
                    className="cursor-pointer lg:hidden mr-2"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>

                  <div className="flex-1">
                    <div className="flex items-center px-4 py-1.5 justify-between">
                      <TabsList>
                        <TabsTrigger value="files" className="cursor-pointer">
                          Files
                        </TabsTrigger>
                        <TabsTrigger value="editor" className="cursor-pointer">
                          Editor
                        </TabsTrigger>
                      </TabsList>

                      {tab === "files" && (
                        <ChatHeaderFiles id={selectedConversation} />
                      )}
                      {tab === "editor" && (
                        <ChatHeader id={selectedConversation} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 flex flex-col min-h-0 overflow-scroll">
                  {selectedConversation ? (
                    <>
                      <TabsContent value="files" className="m-0">
                        {/* <MailList items={mails} /> */}
                        <MenuForm id={selectedConversation} />
                      </TabsContent>
                      <TabsContent value="editor" className="m-0">
                        <MenuEditor
                          id={selectedConversation}
                          core={core}
                          menu={menu}
                        />
                        {/* <MailList items={mails.filter((item) => !item.read)} /> */}
                      </TabsContent>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">
                          Welcome to Chat
                        </h3>
                        <p className="text-muted-foreground">
                          Select a conversation to start messaging
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Tabs>
          </CraftEditor>
        )}
      </div>
    </TooltipProvider>
  )
}
