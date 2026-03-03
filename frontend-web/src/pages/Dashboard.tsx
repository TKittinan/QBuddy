import StatCard from "../components/dashboard/StatCard"
import DataTable from "../components/ui/DataTable"
import Button from "../components/ui/Button"

interface QueueItem {
  ticketId: string
  customerName: string
  serviceType: string
  waitTime: string
  status: string
}

const queueData: QueueItem[] = [
  {
    ticketId: "A-101",
    customerName: "Maria Rosa",
    serviceType: "Billing",
    waitTime: "5m",
    status: "Serving",
  },
  {
    ticketId: "B-204",
    customerName: "Michael Peterson",
    serviceType: "Technical Support",
    waitTime: "12m",
    status: "Waiting",
  },
  {
    ticketId: "C-033",
    customerName: "Lucas Silva",
    serviceType: "New Account",
    waitTime: "8m",
    status: "In Progress",
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Live Queue Management
          </h1>
          <p className="text-gray-500 text-sm">
            Monitor and manage customer flow in real-time across all service points.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">Refresh Data</Button>
          <Button>New Ticket</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Waiting"
          value="24"
          change="+3 from last hour"
        />
        <StatCard
          title="Currently Serving"
          value="8"
          change="Active now"
        />
        <StatCard
          title="Avg. Wait Time"
          value="12m"
          change="-2m improvement"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow">
        <DataTable<QueueItem>
          columns={[
            { header: "Ticket ID", accessor: "ticketId" },
            { header: "Customer Name", accessor: "customerName" },
            { header: "Service Type", accessor: "serviceType" },
            { header: "Wait Time", accessor: "waitTime" },
            { header: "Status", accessor: "status" },
          ]}
          data={queueData}
        />
      </div>

    </div>
  )
}