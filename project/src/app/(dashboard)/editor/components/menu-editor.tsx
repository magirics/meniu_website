"use client"

import { Editor as CraftEditor, Element, Frame } from "@craftjs/core"
import ToolBar from "./craft/ToolBar"
import {
  CategoryBlock,
  MainBlock,
  ProductBlock,
  TitleBlock,
} from "./craft/SelectionTools"
import React, { useEffect, useState } from "react"
import * as Babel from "@babel/standalone"

export default function MenuEditor({ id, core, menu }) {
  const files = menu?.files || []
  console.log("files = ", files)

  return (
    <div className="h-full">
      {files.map((file) => {
        if (file.name.endsWith(".css"))
          return <style key={file.url} href={file.url}></style>
        else if (file.name.endsWith(".js"))
          return <script key={file.url} src={file.url}></script>
        else if (file.name.endsWith(".png"))
          return <img key={file.url} src={file.url}></img>
      })}
      <Frame>
        <core.Layout></core.Layout>
      </Frame>
    </div>
  )
}

/* <Element id="root" is="div" canvas>
</Element> */
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
