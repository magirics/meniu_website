import { ReactNode } from "react"
import { Element, useNode } from "@craftjs/core"

type Props = {
  children: ReactNode
}

export default function Main() {
  return (
    <>
      <style>{`.main {min-height: 2rem}`}</style>
      <Element is="main" id="main" canvas className="main"></Element>
    </>
  )
}
