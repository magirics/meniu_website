import { useNode } from "@craftjs/core"
import Editable from "./Editable"

export default function Text({ value, onChange, ...props }) {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={(ref) => {
        connect(drag(ref))
      }}
    >
      <Editable
        className="text"
        tagName="span"
        html={"value"}
        // defaultValue='here'
        // onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
