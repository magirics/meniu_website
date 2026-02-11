"use client"

import styles from "./Product.module.css"
import { useNode } from "@craftjs/core"
// import type { Product } from "@/schemas/product"
import Editable from "./Editable"

type Props = {
  value: any
}

export default function Product({ value, onChange, disabled }: Props) {
  const onNameChange = (event) => onChange({ ...value, name: event.target.value })
  const onDescriptionChange = (event) => onChange({ ...value, description: event.target.value })
  const onPriceChange = (event) => onChange({ ...value, price: event.target.value })

  return (
    <div className={styles.product}>
      <Editable className="name" tagName="h3" html={value.name} onChange={onNameChange} disabled={disabled} />
      <Editable
        className="description"
        tagName="p"
        html={value.description}
        onChange={onDescriptionChange}
        disabled={disabled}
      />
      <Editable
        className="price"
        tagName="p"
        html={formatPrice(value)}
        onChange={onPriceChange}
        disabled={disabled}
      />
    </div>
  )
}

function formatPrice(product) {
  const currency = {
    USD: "$",
    PEN: "S/.",
  }
  return `${product.price}`
}
