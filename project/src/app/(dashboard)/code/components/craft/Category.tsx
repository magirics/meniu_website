"use client"

import { Element, useNode } from "@craftjs/core"
import Editable from "./Editable"

type Props = {
  value: { name: string }
}

export default function Category({ value, onChange }: Props) {
  return (
    <>
      <style>{`.products {min-height: 2rem;}`}</style>
      <div className="category">
        <Editable
          className="name"
          tagName="h2"
          html={value.name}
          onChange={(event) => onChange({ value, name: event.target.value })}
        />
        <Element is="div" id="products" canvas className="products"></Element>
      </div>
    </>
  )
}
