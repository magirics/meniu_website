// import styles from "./ProductsDialog.module.css"
import { useEditor, useNode } from "@craftjs/core"
// import { Dialog } from "radix-ui"
import { Replace, Save } from "lucide-react"
// import Button from "@/components/Button"
// import { useAction } from "@/app/lib/swr"
// import { allProducts } from "@/app/actions/product"
import { useState } from "react"

export default function ProductsDialog() {
  const { data: products, isLoading } = useAction(allProducts)
  const { id } = useNode()
  const { actions, query, selection } = useEditor((state) => {
    const selections = Array.from(state.events.selected)
    return { selection: selections[0] }
  })

  const onSwap = (product) => {
    actions.setProp(id, (props) => (props.value = product))
  }

  const [open, setOpen] = useState(false)

  const onSelect = (product) => {
    onSwap(product)
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button icon={Replace}>Replace</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className={styles.content}>
          <ul className={styles.list}>
            {!isLoading
              ? products.map((product) => (
                  <li key={product.id} className={styles.item} onClick={() => onSelect(product)}>
                    {product.name}
                  </li>
                ))
              : null}
          </ul>

          {/* <Dialog.Close asChild>
            <button className="IconButton" aria-label="Close">
              Close
            </button>
          </Dialog.Close> */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
