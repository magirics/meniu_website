"use client"

import { Button } from "@/components/ui/button"
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
import { useEditor } from "@craftjs/core"
import {
  BookOpen,
  Candy,
  Copy,
  Image,
  MoreVertical,
  Rows3,
  Save,
  SquareDashed,
  Trash,
  Type,
} from "lucide-react"
import {
  ContainerBlock,
  ImageBlock,
  TextBlock,
  ProductBlock,
} from "@/app/(dashboard)/code/[id]/components/craft/SelectionTools"
import { minify } from "csso"
import craftjs from "@craftjs/core/package.json"
import { JSON_to_TSX } from "@/utils/transformers"

export default function ToolBar({ menu, css }) {
  const { query, actions } = useEditor()

  const onSave = async () => {
    const json = JSON.parse(query.serialize())
    const tsx = JSON_to_TSX(json)
    console.log(tsx)

    // const response = await fetch(`/api/layout/${menu.id}`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "text/plain" },
    //   body: JSON.stringify({
    //     layout: tsx,
    //   }),
    // })
  }

  const onDuplicate = async () => {
    console.log('onDuplicate')
  }
  
  const onDelete = async () => {
    console.log('onDelete')
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
                component={<Element is={<ContainerBlock />} canvas></Element>}
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
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuItem onClick={} className="cursor-pointer"> */}
            <DropdownMenuItem className="cursor-pointer" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={onDelete}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
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
      ref={(reference) => {
        connectors.create(reference, component)
      }}
      variant="ghost"
      size="sm"
      className="cursor-pointer"
    >
      <Icon className="h-4 w-4" /> {children}
    </Button>
  )
}
