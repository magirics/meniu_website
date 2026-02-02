import { Editor as CraftEditor, Element, Frame } from "@craftjs/core"
import ToolBar from "./craft/ToolBar"
import {
  CategoryBlock,
  MainBlock,
  ProductBlock,
  TitleBlock,
} from "./craft/SelectionTools"
import { useEffect } from "react"

export default function MenuEditor({ id }) {
  const { value, css } = { value: "", css: "" }
  async function getMenu() {}

  useEffect(() => {
    getMenu()
  })

  const links = {
    layout: {},
    styles: [],
    scripts: [],
    images: [],
  }

  return (
    <div className="h-full">
      <style>{`
          .body {
            width: 100%;
            height: 100%;
          }
          `}</style>
      {/* <Frame data={value.layout.value}> */}
      <Frame>
        <Element className="body" is="div" canvas></Element>
      </Frame>
    </div>
  )
}

// className={styles.editor}
// className={styles.craftEditor}

/* <div className={styles.monacoEditor}>
          <MonacoEditor
            defaultLanguage="css"
            value={css}
            onChange={(value) => setCss(value)}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
            }}
          />
        </div> */
