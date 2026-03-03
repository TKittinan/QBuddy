import type { ReactNode } from "react"

interface Props {
  children: ReactNode
  className?: string
}

export default function Card({ children, className }: Props) {
  return (
    <div className={`bg-white rounded-2xl shadow p-6 ${className}`}>
      {children}
    </div>
  )
}