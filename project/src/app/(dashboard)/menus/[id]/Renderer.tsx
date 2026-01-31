export default async function Renderer({ id }) {
  id = "MENU_001"
  const response = await fetch(`http://meniu.shop:3000/api/menus/${id}`)
  const data = await response.json()
  const { item: menu } = data
  const layout = {} //await JSON.parse(menu.layout.value)
  console.log("menu:", menu)

  return (
    <>
      <style>{menu.style}</style>
      <Render layout={layout} resolver={{ Title, Main, Category, Product }} />
    </>
  )
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

function Title({ children }) {
  return <h1 className="title">{children}</h1>
}

function Main({ children }) {
  return <main className="categories">{children}</main>
}

function Category({ value, children }) {
  const { name } = value
  return (
    <div className="category">
      <h2 className="name">{name}</h2>
      <div className="products">{children} </div>
    </div>
  )
}

function Product({ value, onSelected }) {
  return (
    <div className="product" data-id={value.id}>
      <h3 className="name">{value.name}</h3>
      <p className="description">{value.description}</p>
      <p className="price">{value.price}</p>
    </div>
  )
}
