"use client"

import { ReactNode } from "react"
import Editable from "./Editable"
import { useNode } from "@craftjs/core"

type Props = {
  value: string
}

export default function Title({ value, onChange }: Props) {
  return (
    <Editable
      className="title"
      tagName="h1"
      html={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
