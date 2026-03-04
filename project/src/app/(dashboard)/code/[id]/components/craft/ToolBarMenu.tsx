"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Element, useEditor } from "@craftjs/core"
import {
  ArrowRightFromLine,
  Candy,
  Image,
  Import,
  MoreVertical,
  SquareDashed,
  Type,
} from "lucide-react"
import {
  ContainerBlock,
  ImageBlock,
  ProductBlock,
  TextBlock,
} from "./SelectionTools"
import { useRef } from "react"
import { JSON_to_TSX } from "@/utils/transformers"

export default function ToolBarMenu({ menu, id }) {
  const { query, actions } = useEditor()

  const inputRef = useRef<HTMLInputElement>(null)

  // upload -> refresh
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()

    const response = await fetch(`/api/layout/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        layout: text,
      }),
    })

    alert("File uploaded!")
    window.location.reload()
  }

  const onImport = async () => {
    // Open file picker
    inputRef.current?.click()
  }

  const onExport = async () => {
    const json = JSON.parse(query.serialize())
    console.log("JSON =", json)
    console.log("TSX =", JSON_to_TSX(json))

    // menu.layout -> Layout.tsx
  }

  return (
    <div className="items-center justify-between h-full hidden md:flex">
      {/* Right side - Action buttons */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Dummy component={<TextBlock />} icon={Type}>
                Text
              </Dummy>
            </TooltipTrigger>
            <TooltipContent>
              <p>Text</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Dummy component={<ImageBlock />} icon={Image}>
                Image
              </Dummy>
            </TooltipTrigger>
            <TooltipContent>
              <p>Image</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Dummy
                component={<Element is={<ContainerBlock/>} canvas></Element>}
                icon={SquareDashed}
              >
                Container
              </Dummy>
            </TooltipTrigger>
            <TooltipContent>
              <p>Container</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Dummy component={<ProductBlock />} icon={Candy}>
                Product
              </Dummy>
            </TooltipTrigger>
            <TooltipContent>
              <p>Product</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* More options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <MoreVertical className="h-4 w-4" />
              <input
                ref={inputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuItem onClick={} className="cursor-pointer"> */}
            <DropdownMenuItem className="cursor-pointer" onClick={onImport}>
              <Import className="h-4 w-4 mr-2" />
              Import
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={onExport}>
              <ArrowRightFromLine className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function Dummy({ component, icon, children, ...props }) {
  const { connectors } = useEditor()

  const Icon = icon

  return (
    <Button
      ref={(ref) => {
        connectors.create(ref, component)
      }}
      variant="ghost"
      size="sm"
      className="cursor-pointer"
    >
      <Icon className="h-4 w-4" /> {children}
    </Button>
  )
}