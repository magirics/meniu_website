import { LeafyGreen } from "lucide-react"
import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return <LeafyGreen width={size} height={size} />
}
