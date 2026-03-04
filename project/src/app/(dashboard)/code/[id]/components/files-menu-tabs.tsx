"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Editor } from "@craftjs/core"
import {
  ContainerBlock,
  ImageBlock,
  ProductBlock,
  TextBlock,
} from "./craft/SelectionTools"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import MenuEditor from "./menu-editor"
import { ChatHeaderFiles } from "./chat-header-files"
import { ChatHeader } from "./chat-header"
import MenuForm from "./menu-form"
import Container from "./craft/Container"
import Text from "./craft/Text"
import ToolBarFiles from "./craft/ToolBarFiles"
import ToolBarMenu from "./craft/ToolBarMenu"

export default function FilesMenuTabs({
  core,
  menu,
  setIsSidebarOpen,
  selectedConversation,
}) {
  const [tab, setTab] = useState("files")

  const resolver = {
    TextBlock,
    ImageBlock,
    ContainerBlock,
    ProductBlock,
  }
  return (
    <Editor resolver={resolver}>
      <Tabs value={tab} onValueChange={setTab} className="grow overflow-hidden">
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
                    Menu
                  </TabsTrigger>
                </TabsList>

                {tab === "files" && (
                  <ToolBarFiles value="" css="" id={selectedConversation}/>
                )}
                {tab === "editor" && (
                  <ToolBarMenu id={selectedConversation} menu={menu} css=""/>
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
    </Editor>
  )
}
