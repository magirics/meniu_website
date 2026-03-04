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
import styles from "./ToolBar.module.css"
import { useEditor } from "@craftjs/core"
import {
  BookOpen,
  Candy,
  Copy,
  MoreVertical,
  Plus,
  Rows3,
  Save,
  Trash,
  Type,
  Upload,
} from "lucide-react"
import {
  CategoryBlock,
  MainBlock,
  ProductBlock,
  TitleBlock,
} from "./SelectionTools"
// import { createProduct } from "@/app/actions/product"
// import { createMenu, removeMenu, updateMenu } from "@/actions/menu"
import { minify } from "csso"
import craftjs from "@craftjs/core/package.json"
import { useRef } from "react"

export default function ToolBarFiles({ value, css, id }) {
  const { query, actions } = useEditor()

  const onSave = async () => {
    const minifiedCss = minify(css).css
    // await updateMenu({
    //   ...value,
    //   layout: { value: query.serialize(), version: craftjs.version },
    //   style: minifiedCss,
    // })
  }

  const onDuplicate = async () => {
    // await createMenu({ ...value, name: value.name + " copia" })
  }

  const onDelete = async () => {
    // await removeMenu(value.id)
  }

  async function save(nodes, node) {
    if (node.data.name === "ProductBlock") {
      if (!node.data.props.value.id) {
        // const id = await createProduct(node.data.props.value)
        actions.setProp(node.id, (props) => {
          props.value.id = id
        })
      }
    }

    for (const n of node.data.nodes) {
      await save(nodes, nodes[n])
    }
  }

  const handleSave = async () => {
    const nodes = query.getNodes()
    await save(nodes, nodes.ROOT)
    await onSave()
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = event.target.files?.[0]
    if (!file) return

    // Example: get presigned URL from server
    const res = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menu: id,
        filename: file.name,
        contentType: file.type || 'text/plain',
      }),
    })
    const { url } = await res.json()

    // Upload directly to S3
    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    })

    alert("File uploaded!")
  }

  const onUpload = async () => {
    // Open file picker
    inputRef.current?.click()
  }

  return (
    <div className="items-center justify-between h-full hidden md:flex">
      {/* Right side - Action buttons */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={onUpload}
              >
                <Upload className="h-4 w-4" /> Upload
                <input
                  ref={inputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <Save className="h-4 w-4 mr-2" />
              Save
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
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
