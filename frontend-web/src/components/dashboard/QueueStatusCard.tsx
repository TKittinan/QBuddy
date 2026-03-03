import Card from "../ui/Card"

interface Props {
  department: string
  subtitle: string
  count: number
}

export default function QueueStatusCard({
  department,
  subtitle,
  count,
}: Props) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <div className="font-medium">{department}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
      <div className="text-xl font-bold text-[#30364F]">
        {count}
      </div>
    </Card>
  )
}