export function TSX_to_JSON() {
  return {}
}

export function JSON_to_TSX(json) {
  let value = traverse(json.ROOT, json)
  return (
    `const { Frame, Element } = craft\n` +
    `const { TextBlock, ImageBlock, ContainerBlock, ProductBlock } = components\n` +
    `\n` +
    `function Layout() { return (\n` +
    `<Frame>\n` +
    `<Element is="div" canvas>\n` +
    value +
    `\n` +
    `</Element>\n` +
    `</Frame>\n` +
    `)}`
  )
}

function traverse(parent, json) {
  let children = parent.nodes.map((id) => traverse(json[id], json)).join("\n")
  let props = Object.entries(parent.props)
    .map(([key, value]) => {
      if (typeof value == "number") return `${key} = ${value}`
      else if (typeof value == "string") return `${key} = "${value}"`
      else if (typeof value == "object") return `${key} = {${JSON.stringify(value)}}`
    })
    .join(" ")

  return (
    `<${parent.displayName} ${props}>\n` +
    children +
    `\n</${parent.displayName}>`
  )
}
