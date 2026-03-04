"use client"

import { Element, useNode } from "@craftjs/core"
import Editable from "./Editable"

type Props = {
  value: { name: string }
}

export default function Container({ children, ...props }) {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className="container"
      style={{ minHeight: "2rem", background: "green" }}
    >
      {children}
    </div>
  )
}
