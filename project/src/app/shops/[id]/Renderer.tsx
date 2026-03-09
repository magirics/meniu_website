import {
  ContainerBlock,
  ImageBlock,
  TextBlock,
  ProductBlock,
} from "@/app/(dashboard)/code/[id]/components/craft/SelectionTools"
import React from "react"
// import * as craft from "@craftjs/core"
import * as Babel from "@babel/standalone"

export default async function Renderer({ menu }) {
  const page_tsx = menu.layout
  const page_js = Babel.transform(page_tsx, { presets: ["react"] }).code
  const main = eval(
    `async (React, craft, components, files) => { ${page_js} return { Layout } }`
  )

  const components = {
    TextBlock: Text,
    ImageBlock: Text,
    ContainerBlock: Container,
    ProductBlock: Product,
  }
  const core = await main(
    React,
    { Frame: "div", Element: "div" },
    components,
    menu.files
  )

  return <core.Layout></core.Layout>

  // return (
  //   <>
  //     <style>{menu.style}</style>
  //     <Render layout={layout} resolver={{ Title, Main, Category, Product }} />
  //   </>
  // );
}

function Render({ identifier, layout, resolver }) {
  if (identifier === undefined) identifier = "ROOT"

  const node = layout[identifier]
  let Tag =
    typeof node.type === "string" ? node.type : resolver[node.type.resolvedName]
  Tag = Tag || "div"

  if (node.nodes.length === 0) return <Tag id={identifier} {...node.props} />

  return (
    <Tag id={identifier} {...node.props}>
      {node.nodes.map((identifier) => (
        <Render
          key={identifier}
          identifier={identifier}
          layout={layout}
          resolver={resolver}
        />
      ))}
    </Tag>
  )
}

function Text({ value }) {
  return <span className="title">{value}</span>
}

function Container({ children }) {
  return <div className="container">{children}</div>
}

function Product({ value }) {
  return (
    <div className="product" data-id={value.id}>
      <h3 className="name">{value.name}</h3>
      <p className="description">{value.description}</p>
      <p className="price">{value.price}</p>
    </div>
  )
}
