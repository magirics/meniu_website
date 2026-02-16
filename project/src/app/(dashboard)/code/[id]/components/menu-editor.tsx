"use client"

import { Frame } from "@craftjs/core"
import MonacoEditor from "@monaco-editor/react"

export default function MenuEditor({ id, core, menu }) {
  if (!core) return null

  const files = menu?.files || []
  const { Layout } = core

  return (
    <>
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
          {/* <Element is={Layout} canvas></Element> */}
          <Layout></Layout>
        </Frame>
      </div>
      <div className="min-w-40">
        <MonacoEditor
          defaultLanguage="css"
          value={"Text to edit"}
          // onChange={(value) => setCss(value)}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
          }}
        />
      </div>
    </>
  )
}
