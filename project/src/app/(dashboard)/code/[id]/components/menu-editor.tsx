"use client"

import { Element, Frame } from "@craftjs/core"

export default function MenuEditor({ id, core, menu }) {
  const files = menu?.files || []

  if (!core.Layout) {
    return <div className="h-full"></div>
  }
  return (
    <div className="h-full">
      {/* {files.map((file) => {
          if (file.name.endsWith(".css"))
            return <style key={file.url} href={file.url}></style>
          else if (file.name.endsWith(".js"))
            return <script key={file.url} src={file.url}></script>
          else if (file.name.endsWith(".png"))
            return <img key={file.url} src={file.url}></img>
        })} */}

      <core.Layout />
    </div>
  )
}
