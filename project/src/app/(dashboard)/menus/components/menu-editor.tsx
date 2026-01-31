"use client"

import Toolbar from "./toolbar"
import { useParams } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
// import * as Babel from "@babel/standalone"
import { Editor, Frame, Element, useNode, useEditor } from "@craftjs/core"
import ContentEditable from "react-contenteditable"

import craftjsPackage from "@craftjs/core/package.json"

// export default function Page() {
//   const { catalog } = useParams<{ catalog: string }>();
//   // const [subdomain, domain, TLD] = site.split('.');
//   const [page_jsx, setPage_jsx] = useState('function Page() { return <></>; }');

//   useEffect(() => {
//     (async () => {
//       const response = await fetch(`/${catalog}.jsx`);
//       setPage_jsx(await response.text());
//     })();
//   }, []);

//   const page_js = Babel.transform(page_jsx, { presets: ['react'] }).code;
//   const Page = eval(`(React) => { ${page_js} return Page; }`)(React);

//   return <Page />;
// }

const menu = {
  title: "Chinese Restaurant Menu",
  categories: [
    {
      name: "MAIN COURSE",
      products: [
        {
          id: "PRODUCT_001",
          name: "Char Siu Ricebowl",
          description: "Char Siu with delicious mushroom topping",
          price: 550,
          currency: "USD",
        },
        {
          id: "PRODUCT_002",
          name: "Fried Kwetiauw",
          description:
            "Fried kwetiau, served with special spices and fried egg",
          price: 750,
          currency: "USD",
        },
        {
          id: "PRODUCT_003",
          name: "Seafoo Fried Rice",
          description:
            "Fried rice with seafood special toppings, and special savory seasoning from our restaurant",
          price: 850,
          currency: "USD",
        },
      ],
    },
    {
      name: "DRINKS",
      products: [
        {
          id: "PRODUCT_001",
          name: "Char Siu Ricebowl",
          description: "Char Siu with delicious mushroom topping",
          price: 550,
          currency: "USD",
        },
        {
          id: "PRODUCT_002",
          name: "Fried Kwetiauw",
          description:
            "Fried kwetiau, served with special spices and fried egg",
          price: 750,
          currency: "USD",
        },
        {
          id: "PRODUCT_003",
          name: "Seafoo Fried Rice",
          description:
            "Fried rice with seafood special toppings, and special savory seasoning from our restaurant",
          price: 850,
          currency: "USD",
        },
      ],
    },
    {
      name: "SPECIAL MENU",
      products: [
        {
          id: "PRODUCT_006",
          name: "Wonton Soup",
          description: "Noodles with fresh vegetables and savory spices",
          price: 650,
          currency: "USD",
        },
        {
          id: "PRODUCT_007",
          name: "Spring Rolls",
          description: "Spring Rolls special toppings, and special savory",
          price: 850,
          currency: "USD",
        },
        {
          id: "PRODUCT_008",
          name: "Fried Dumpling",
          description: "Dumpling containing fresh and tasty seafood",
          price: 700,
          currency: "USD",
        },
        {
          id: "PRODUCT_008",
          name: "Dimsum",
          description: "Dim sum containing fresh and tasty seafood",
          price: 650,
          currency: "USD",
        },
      ],
    },
  ],
}

const style = `
        .menu {
        }
        
        .menu > .title {
            font-weight: bold;
            text-align: center;
            font-size: 3rem;
            font-weight: lighter;
            margin: 2rem;
        }

        .menu > .categories {
            width: 65rem;
            margin: auto;
            display: grid;
            grid-auto-flow: column;
            grid-template-rows: 1fr 1fr;
            gap: 4rem 0;
        }



        .category {
            width: 30rem;
        }

        .category > .name {
            font-size: 2rem;
            font-weight: lighter;
            border-bottom: solid black;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
        }

        .category > .products {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }



        .product {
            width: 25rem;
        }

        .product > .name {
            font-weight: bold;
        }

        .product > .description {
        }
    `

export default function MenuEditor({ id }) {
  return (
    <div>
      <style>{style}</style>
      <Editor resolver={{ Title, Main, Category, Product }}>
        <Toolbar />
        <Frame>
          <Element className="menu" is="div" id="drag-zone">
            <Title>{menu.title}</Title>
            <Element is={Main} canvas>
              {menu.categories.map((category) => (
                <Element
                  key={category.name}
                  is={Category}
                  id={category.name}
                  value={category}
                  rules={{
                    canMoveIn: () => false,
                    canMoveOut: (incomingNodes) => false,
                  }}
                  canvas
                >
                  {category.products.map((product) => (
                    <Element
                      key={product.name}
                      is={Product}
                      id={product.id}
                      value={product}

                      // onSelected={() => setSelected(product)}
                    />
                  ))}
                </Element>
              ))}
            </Element>
          </Element>
        </Frame>
      </Editor>
    </div>
  )
}

const ToolBar = () => {
  const { actions, query, selected } = useEditor((state) => {
    selected: state.events.selected
  })
  const [json, setJson] = useState("")

  const toHandleClick = () => {
    const JSON = query.serialize()
    setJson(JSON)

    const nodes = query.getSerializedNodes()
    for (const id in nodes) {
      // This has errors
      if (id != "ROOT") {
        const node = nodes[id]
        actions.delete(id)
        console.log("Deleted node:", id)
      }
    }
  }

  const fromHandleClick = () => {
    actions.deserialize(json)
    console.log("deserialized!")
  }

  const handleSave = async () => {
    const body = {
      menu: {
        style,
        layout: {
          version: craftjsPackage.version,
          value: query.serialize(),
        },
      },
    }

    let response = await fetch(`http://localhost:3000/api/menus`, {
      method: "POST",
      body: JSON.stringify(body),
    })

    const result = await response.json()
    console.log(result)
  }

  return (
    <div className="flex flex-col w-20">
      <p>Topbar</p>
      <button onClick={toHandleClick}>to JSON</button>
      <button onClick={fromHandleClick}>from JSON</button>
      <button onClick={handleSave}>Guardar</button>
    </div>
  )
}

export const Text = ({ id, value, fontSize }) => {
  const {
    connectors: { connect, drag },
    hasSelectedNode,
    hasDraggedNode,
    actions: { setProp },
  } = useNode((state) => ({
    hasSelectedNode: state.events.selected,
    hasDraggedNode: state.events.dragged,
  }))

  const [editable, setEditable] = useState(false)

  useEffect(() => {
    setEditable(hasSelectedNode)
  }, [hasSelectedNode])

  return (
    <div id={id} ref={(ref) => connect(drag(ref))}>
      <ContentEditable
        html={value}
        disabled={!editable}
        onChange={(e) =>
          setProp(
            (props) =>
              (props.value = e.target.value.replace(/<\/?[^>]+(>|$)/g, ""))
          )
        }
        tagName="p"
        style={{ fontSize: `${fontSize}px` }}
      ></ContentEditable>
    </div>
  )
}

function Main({ children }) {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <main className="categories" ref={(ref) => connect(drag(ref))}>
      {children}
    </main>
  )
}

Main.craft = {
  rules: {
    canMoveIn: (incomingNodes) =>
      incomingNodes.every(
        (incomingNode) => incomingNode.data.type === Category
      ),
  },
}

function Title({ children }) {
  return <h1 className="title">{children}</h1>
}

function Category({ id, value, children }) {
  const {
    connectors: { connect, drag },
  } = useNode()

  const { name } = value
  return (
    <div id={id} className="category" ref={(ref) => connect(drag(ref))}>
      <h2 className="name">{name}</h2>
      <div className="products">{children} </div>
    </div>
  )
}

Category.craft = {
  rules: {
    canMoveIn: (incomingNodes) =>
      incomingNodes.every((incomingNode) => incomingNode.data.type === Product),
  },
}

function Product({ id, value }) {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      id={id}
      data-id={value.id}
      className="product"
      ref={(ref) => connect(drag(ref))}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="name">{value.name}</h3>
      <p className="description">{value.description}</p>
      <p className="price">{value.price}</p>
    </div>
  )
}
