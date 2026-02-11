import styles from "./Button.module.css"
import { LucideProps } from "lucide-react"
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react"

export default function Button({ icon, children, ...props }: Props) {
  const Icon = icon

  return (
    <button className={styles.button} {...props}>
      {icon ? <Icon className={styles.icon} /> : null} {children}
    </button>
  )
}
