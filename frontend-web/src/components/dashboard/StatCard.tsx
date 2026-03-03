import type { ReactNode } from "react"
import Card from "../ui/Card"

interface Props {
  title: string
  value: string | number
  change?: string
  icon?: ReactNode
}

export default function StatCard({
  title,
  value,
  change,
  icon,
}: Props) {
  return (
    <Card className="relative">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>

      {change && (
        <div className="text-sm mt-2 text-green-600">
          {change}
        </div>
      )}

      {icon && (
        <div className="absolute top-4 right-4 opacity-20 text-4xl">
          {icon}
        </div>
      )}
    </Card>
  )
}