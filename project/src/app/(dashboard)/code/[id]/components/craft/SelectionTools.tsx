import styles from "./SelectionTools.module.css"
import { useEditor, useNode } from "@craftjs/core"
import Button from "./Button"
import { Trash } from "lucide-react"
import Category from "./Category"
import Product from "./Product"
import Title from "./Title"
import Main from "./Main"
import Text from "./Text"
import Image from "./Image"
import Container from "./Container"

export default function SelectionTools({ ref, component, buttons }) {
  const { id } = useNode()
  const { selected, actions } = useEditor((state) => {
    return { selected: state.events.selected }
  })

  const onDelete = () => {
    for (const selectedId of selected) {
      actions.delete(selectedId)
    }
  }

  let isSelected = false
  for (const selectedId of selected) {
    isSelected = isSelected || id === selectedId
  }

  return (
    <div
      ref={ref}
      className={styles.root}
      style={{ border: isSelected ? "2px dashed black" : "" }}
    >
      {isSelected && (
        <div className={styles.tools}>
          <Button icon={Trash} onClick={onDelete}>
            Delete
          </Button>
          {buttons}
        </div>
      )}
      {component}
    </div>
  )
}

function setField(actions, field, value) {
  actions.setProp((props) => {
    props[field] = value
  })
}

export function TextBlock({ value }) {
  const { actions, connectors } = useNode()
  const { connect, drag } = connectors

  const ref = (ref) => {
    connect(drag(ref))
  }

  const onChange = (value) => setField(actions, "value", value)

  return (
    <SelectionTools
      ref={ref}
      component={<Text value={value} onChange={onChange}></Text>}
    />
  )
}

export function ImageBlock({ value }) {
  const { actions, connectors } = useNode()
  const { connect, drag } = connectors

  const ref = (ref) => {
    connect(drag(ref))
  }

  const onChange = (value) => setField(actions, "value", value)

  return (
    <SelectionTools
      ref={ref}
      component={<Image value={value} onChange={onChange}></Image>}
    />
  )
}

export function ContainerBlock({ value }) {
  const { actions, connectors } = useNode()
  const { connect, drag } = connectors

  const ref = (ref) => {
    connect(drag(ref))
  }

  return (
    <SelectionTools
      ref={ref}
      // component={<Container></Container>}
      component={<Element is={Container} canvas />}
    />
  )
}

export function CategoryBlock({ value }) {
  const { actions, connectors } = useNode()
  const { connect, drag } = connectors

  const ref = (ref) => {
    connect(drag(ref))
  }

  const onChange = (value) => setField(actions, "value", value)

  return (
    <SelectionTools
      ref={ref}
      component={<Category value={value} onChange={onChange}></Category>}
    />
  )
}

export function ProductBlock({ value }) {
  const { actions, connectors } = useNode()
  const { connect, drag } = connectors

  const ref = (ref) => {
    connect(drag(ref))
  }

  const onChange = (value) => setField(actions, "value", value)

  return (
    <SelectionTools
      ref={ref}
      component={
        <Product value={value} onChange={onChange} disabled={value.id} />
      }
      // buttons={[<ProductsDialog key="ProductsDialog" />]}
      buttons={[]}
    />
  )
}

export function TitleBlock({ value }) {
  const { actions, connectors } = useNode()
  const { connect, drag } = connectors

  const ref = (ref) => {
    connect(drag(ref))
  }

  const onChange = (value) => {
    setField(actions, "value", value)
  }

  return (
    <SelectionTools
      ref={ref}
      component={<Title value={value} onChange={onChange} />}
    />
  )
}

export function MainBlock() {
  const { actions, connectors } = useNode()
  const { connect, drag } = connectors

  const ref = (ref) => {
    connect(drag(ref))
  }

  return <SelectionTools ref={ref} component={<Main></Main>} />
}

TitleBlock.craft = {
  props: {
    value: "Title",
  },
}

CategoryBlock.craft = {
  props: {
    value: {
      name: "Category",
    },
  },
}

ProductBlock.craft = {
  props: {
    value: {
      id: "",
      name: "Product name",
      description: "Product description",
      price: 0,
      currency: "USD",

      createdAt: "",
      updatedAt: "",
    },
  },
}

ContainerBlock.craft = {}

ImageBlock.craft = {
  props: {
    href: "img",
  },
}

TextBlock.craft = {
  props: {
    value: "Text",
  },
}

MainBlock.craft = {}
