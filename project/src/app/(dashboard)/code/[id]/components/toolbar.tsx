import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Candy, Image, SquareDashed, Type } from "lucide-react"

export default function Toolbar() {
  return (
    <></>
    // <DropdownMenu open={true}>
    //   <DropdownMenuTrigger asChild>
    //     <Button
    //       variant="ghost"
    //       size="icon"
    //       className="cursor-pointer w-0 h-0 overflow-hidden absolute right-4 top-4"
    //     >
    //       <Type className="h-4 w-4" /> Text
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end">
    //     <DropdownMenuItem className="cursor-pointer">
    //       <Type className="h-4 w-4" /> Text
    //     </DropdownMenuItem>
    //     <DropdownMenuItem className="cursor-pointer">
    //       <Image className="h-4 w-4" /> Image
    //     </DropdownMenuItem>
    //     <DropdownMenuItem className="cursor-pointer">
    //       <SquareDashed className="h-4 w-4" /> Box
    //     </DropdownMenuItem>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuItem className="cursor-pointer">
    //       <Candy className="h-4 w-4 mr-2" /> Product
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  )
}
